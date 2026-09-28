module FsRunner.Program

// oracle-04 (port side): execute a scenario against the F# Game core and emit
// snapshots in the same JSON shape as oracle/runner/orig-driver.js, so
// tools/diff-snapshots.js can compare implementations bit-exactly.
//
// Scope note (sessions 2026-09-28-04/-05/-06): the resources pipeline exists in
// the core (resources-01..10). Player actions are still logged as
// not-yet-ported; snapshot comparison uses --include filters on the subtrees
// the port owns (see D014).

open System
open System.IO
open Game.Types
open Game.Resources

// ---------------------------------------------------------------------------
// Seeded PRNG — bit-exact port of orig-driver.js (splitmix32 seeds sfc32;
// JS |0 / >>> 0 semantics are mod-2^32 arithmetic, matching uint32 ops).

module Rng =
    let splitmix32 (seed: uint32) : unit -> uint32 =
        let mutable a = seed
        fun () ->
            a <- a + 0x9E3779B9u
            let mutable t = a ^^^ (a >>> 16)
            t <- t * 0x21F0AAADu
            t <- t ^^^ (t >>> 15)
            t <- t * 0x735A2D97u
            t <- t ^^^ (t >>> 15)
            t + 0x61D88E45u

    let sfc32 (a0: uint32) (b0: uint32) (c0: uint32) (d0: uint32) : unit -> float =
        let mutable a = a0
        let mutable b = b0
        let mutable c = c0
        let mutable d = d0
        fun () ->
            let t0 = a + b
            a <- b ^^^ (b >>> 9)
            b <- c + (c <<< 3)
            c <- (c <<< 21) ||| (c >>> 11)
            d <- d + 1u
            let t1 = t0 + d
            c <- c + t1
            float t1 / 4294967296.0

// ---------------------------------------------------------------------------
// Minimal JSON writer (hand-rolled: exact float formatting control).
// .NET shortest-roundtrip double formatting matches V8's JSON.stringify; -0.0 is
// normalized to 0.0 (JS prints "0").

let private norm (v: float) = if v = 0.0 then 0.0 else v // maps -0.0 onto +0.0

let private esc (s: string) =
    s.Replace("\\", "\\\\").Replace("\"", "\\\"")

let num (v: float) : string =
    let v = norm v
    if Double.IsNaN v || Double.IsInfinity v then "null" else string v

// ---------------------------------------------------------------------------
// Scenario parsing (subset of oracle/runner/scenario.js; same file format)

type Move = { Tick: int; Action: string; Args: string list }

type Scenario =
    { Name: string
      Seed: int
      Checkpoints: int list
      Moves: Move list
      MaxTick: int }

let parseScenario (text: string) : Scenario =
    let mutable name = "unnamed"
    let mutable seed = 20260927
    let mutable checkpoints = []
    let mutable moves = []
    let mutable maxTick = 0

    for raw in text.Replace("\r", "").Split('\n') do
        let line = raw.Trim()
        if line <> "" then
            if line.StartsWith("#") then
                let rest = line.Substring(1).Trim()
                let idx = rest.IndexOf(':')
                if idx >= 0 then
                    let key = rest.Substring(0, idx).Trim()
                    let value = rest.Substring(idx + 1).Trim()
                    match key with
                    | "name" -> name <- value
                    | "seed" -> seed <- int value
                    | "checkpoints" ->
                        for part in value.Split(',') do
                            let t = int (part.Trim())
                            checkpoints <- t :: checkpoints
                            if t > maxTick then maxTick <- t
                    | _ -> ()
            else
                let parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries) |> List.ofArray
                match parts with
                | tickStr :: action :: args ->
                    let tick = int tickStr
                    moves <- { Tick = tick; Action = action; Args = args } :: moves
                    if tick > maxTick then maxTick <- tick
                | _ -> ()

    checkpoints <- 0 :: maxTick :: checkpoints // snapshot at 0 and end always
    { Name = name
      Seed = seed
      Checkpoints = checkpoints |> List.distinct |> List.sort
      Moves = moves |> List.rev |> List.sortBy (fun m -> m.Tick) // rev: restore file order (prepend), stable sort keeps it within a tick
      MaxTick = maxTick }

// ---------------------------------------------------------------------------
// Scenario execution against the F# core

/// resop result kinds: numbers, booleans, or absent (orig: undefined → key dropped)
type ResKind =
    | RNum of float
    | RBool of bool
    | RNone

type CalJson =
    { year: float
      day: float
      season: string
      weather: string option
      cycle: int
      cycleYear: int }

type ExecResult =
    { Snapshots: (int * (string * (float * float * bool * float)) list * int * CalJson) list
      ActionLog: (int * string * string list * ResKind) list
      ResSave: (string * float * bool) list option }

let parseSpec (s: string) : (string * float) list =
    s.Split(',')
    |> Array.map (fun p ->
        let parts = p.Split(':')
        (parts.[0], float parts.[1]))
    |> Array.toList

let execute (scenario: Scenario) : ExecResult =
    // live game state (the port's tick pipeline slice)
    let mutable pool = init Game.Catalog.Resources.resourceDefs
    let mutable cache = Game.Effects.empty
    let mutable calendar = Game.Calendar.init
    let mutable ticks = 0
    // timer (game-03a): the only event that touches snapshotted state at fresh is
    // updateCaches (frequency 5, fires at ticks 1, 6, 11, ...); the other
    // constructor events touch no snapshotted state at fresh (seams).
    let mutable updateCachesPhase = 0
    // calendarDay: owned by calendar-01; verified day = 0 after resetState
    let mutable calendarDay = 0
    let mutable rngDraws = 0
    let mutable rand =
        let sm = Rng.splitmix32 (uint32 scenario.Seed)
        let r = Rng.sfc32 (sm ()) (sm ()) (sm ()) (sm ())
        fun () -> r ()
    let mutable prodOverrides = Map.empty<string, float>
    let mutable lastLimits = Map.empty<string, float>
    let mutable resSave: (string * float * bool) list option = None
    let mutable curLogTick = 0 // follows game.ticks once gtick advances time
    let mutable snapshots = []
    let mutable actionLog = []

    let capCtx () : CapContext =
        { GetEffect = Game.Effects.getEffect cache
          ParagonStorageRatio = 0.0
          CMBRBonus = 0.0
          UnicornTearsActive = false
          SilosResearched = false
          KarmaZebras = 0 }

    let calCtx () : Game.Calendar.CalendarContext =
        { Game.Calendar.CalendarContext.GetEffect = Game.Effects.getEffect cache
          TimeAccelerationRatio = 0.0
          DarkFuture = false
          ChronomancyResearched = false
          UnicornmancyResearched = false
          Year1000ChallengeActive = false
          WinterIsComingResearched = false
          WinterIsComingActive = false
          AdvancedAutomationResearched = false
          CommunismResearched = false
          WinterIsComingOn = false
          Rand = fun () -> rngDraws <- rngDraws + 1; rand ()
          OnParadox = fun st -> st }

    let prodCtx () : Game.Production.ProductionContext =
        Game.Production.freshProductionContext cache calendar (calCtx ())

    let takeSnapshot () =
        let resources =
            pool.Order
            |> List.choose (fun n ->
                match get pool n with
                | Some r -> Some(n, (r.Value, r.MaxValue, r.Unlocked, r.PerTickCached))
                | None -> None)
        let seasonName = Game.Calendar.seasons.[calendar.Season].Name
        let calJson =
            { year = calendar.Year
              day = calendar.Day
              season = seasonName
              weather = calendar.Weather
              cycle = calendar.Cycle
              cycleYear = calendar.CycleYear }
        (ticks, resources, rngDraws, calJson)
    // gtick: the port's game.tick() slice — updateModel order with seams:
    // resPool.update → (bld/village/etc seams: no snapshotted state at fresh)
    // → timer.update (updateCaches every 5 ticks) → calendar.tick
    let gtick () =
        let uctx =
            { Cap = capCtx ()
              GetResourcePerTick =
                fun n ->
                    match Map.tryFind n prodOverrides with
                    | Some v -> v
                    | None ->
                        match get pool n with
                        | Some r when r.Def.CalculatePerTick -> r.PerTickCached
                        | _ -> 0.0
              CalendarSeason = calendar.Season
              PastureOn = 0
              EnergyLoss = 0.0
              EnergyChallengeResearched = false
              EnergyChallengeActive = false }
        pool <- update uctx calendarDay pool
        // (bld/village/diplomacy/religion/space/challenges update seams; kittens
        //  pseudo-resource sync = 0 at fresh)

        updateCachesPhase <- updateCachesPhase - 1
        if updateCachesPhase <= 0 then
            updateCachesPhase <- 5
            cache <- Game.Effects.updateCaches cache
            // game.updateResources(): cache perTick values
            let pctx = prodCtx ()
            pool <-
                { pool with
                    ByName =
                        pool.ByName
                        |> Map.map (fun _ res ->
                            if res.Def.CalculatePerTick then
                                { res with
                                    PerTickCached =
                                        Game.Production.fixFloatPointNumber (
                                            Game.Production.calcResourcePerTick pctx pool res.Def.Name
                                        ) }
                            else
                                res) }
        // (policy recalc 25 / achievements 50 / winter catnip 25 / time queue 10 /
        //  server events: seams — no snapshotted state at fresh)

        calendar <- Game.Calendar.tick (calCtx ()) calendar
        ticks <- ticks + 1
        curLogTick <- ticks

    let doMove (m: Move) =
        match m.Action with
        | "resop" ->
            match m.Args with
            | [ "caps" ] ->
                pool <- updateMaxValueAll (capCtx ()) pool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "cache" ] ->
                cache <- Game.Effects.updateCaches cache
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "gtick"; n ] ->
                for _ in 1..int n do
                    gtick ()
                actionLog <- (curLogTick, "resop", m.Args, RNum(float ticks)) :: actionLog
            | [ "snap" ] ->
                snapshots <- takeSnapshot () :: snapshots
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "saveres" ] ->
                resSave <- Some(save pool)
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "loadres" ] ->
                match resSave with
                | Some saved -> pool <- load saved pool
                | None -> ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "prod"; resName; valueArg ] ->
                prodOverrides <- prodOverrides |> Map.add resName (float valueArg)
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "pertick"; resName; valueArg ] ->
                let res = pool.ByName[resName]
                pool <- { pool with ByName = pool.ByName |> Map.add resName { res with PerTickCached = float valueArg } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "update" ] ->
                let uctx =
                    { Cap = capCtx ()
                      GetResourcePerTick =
                        fun n ->
                            match Map.tryFind n prodOverrides with
                            | Some v -> v
                            | None ->
                                match get pool n with
                                | Some r when r.Def.CalculatePerTick -> r.PerTickCached
                                | _ -> 0.0
                      CalendarSeason = calendar.Season
                      PastureOn = 0
                      EnergyLoss = 0.0
                      EnergyChallengeResearched = false
                      EnergyChallengeActive = false }
                pool <- update uctx calendarDay pool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "hasRes"; spec ] ->
                actionLog <- (curLogTick, "resop", m.Args, RBool(hasRes pool (parseSpec spec) 0.0)) :: actionLog
            | [ "hasRes"; spec; amt ] ->
                actionLog <- (curLogTick, "resop", m.Args, RBool(hasRes pool (parseSpec spec) (float amt))) :: actionLog
            | [ "limited"; spec ] ->
                actionLog <-
                    (curLogTick, "resop", m.Args, RBool(isStorageLimited freshCraftContext pool (parseSpec spec))) :: actionLog
            | [ "pay"; spec ] ->
                pool <- payPrices calendarDay pool (parseSpec spec)
                actionLog <- (curLogTick, "resop", m.Args, RBool true) :: actionLog
            | [ "ff"; days ] ->
                let pool', limits = fastforward 10.0 (float days) calendarDay pool // ticksPerDay = 10
                pool <- pool'
                lastLimits <- limits
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "limits" ] ->
                pool <- enforceLimits lastLimits pool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "voidq" ] ->
                let result = getVoidQuantity (capCtx ()) (fun () -> rngDraws <- rngDraws + 1; rand ()) pool
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "voidstat" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum(getVoidQuantityStatistically (capCtx ()))) :: actionLog
            | [ "maxall" ] ->
                pool <- maxAll pool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "energydelta" ] ->
                actionLog <-
                    (m.Tick,
                     "resop",
                     m.Args,
                     RNum(getEnergyDelta false false pool.EnergyProd pool.EnergyCons))
                    :: actionLog
            | [ "gauss" ] ->
                let result = Game.Math.standardGaussianRandom (fun () -> rngDraws <- rngDraws + 1; rand ())
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "irwin"; n ] ->
                let result = Game.Math.irwinHallRandom (fun () -> rngDraws <- rngDraws + 1; rand ()) (float n)
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "binom"; trials; p ] ->
                let result = Game.Math.binominalRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) (float trials) (float p)
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "geom"; p ] ->
                let result = Game.Math.geometricRandom (fun () -> rngDraws <- rngDraws + 1; rand ()) (float p)
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "uniform"; lo; hi ] ->
                let result = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) (float lo) (float hi)
                actionLog <- (curLogTick, "resop", m.Args, RNum result) :: actionLog
            | [ "seed"; seedArg ] ->
                let sm = Rng.splitmix32 (uint32 (int seedArg))
                let r = Rng.sfc32 (sm ()) (sm ()) (sm ()) (sm ())
                rand <- fun () -> r ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "stock"; amtArg; specArg ] ->
                let amt = float amtArg
                let spec = parseSpec specArg
                let pool', fraction = getAmtDependsOnStock calendarDay spec amt pool
                pool <- pool'
                actionLog <- (curLogTick, "resop", m.Args, RNum fraction) :: actionLog
            | [ fn; resName; valueArg ] ->
                let v = float valueArg
                // orig get(name) returns false for unknown names; addRes then
                // reads/writes a primitive — writes no-op, reads give undefined,
                // and the return value is NaN (JSON null). Mirror that outcome.
                let known = get pool resName |> Option.isSome
                let pool', delta =
                    if not known then pool, nan
                    else
                        match fn with
                        | "addRes" -> addRes calendarDay v false false resName pool
                        | "addResEvent" -> addResEvent calendarDay resName v pool
                        | "addResPerTick" -> addResPerTick calendarDay resName v pool
                        | other ->
                            actionLog <- (curLogTick, "resop", m.Args, RNone) :: actionLog
                            eprintfn "resop: unknown fn %s" other
                            pool, 0.0
                pool <- pool'
                actionLog <- (curLogTick, "resop", m.Args, RNum delta) :: actionLog
            | _ -> actionLog <- (curLogTick, "resop", m.Args, RNone) :: actionLog
        | "gather"
        | "buy"
        | "craft"
        | "assign"
        | "research"
        | "upgrade"
        | "policy"
        | "hunt"
        | "praise"
        | "save"
        | "load" -> actionLog <- (m.Tick, m.Action, m.Args, RNone) :: actionLog
        | "observe" -> ()
        | other -> actionLog <- (m.Tick, other, m.Args, RNone) :: actionLog

    // run all scenario moves (tick-0 moves = the pinned D010 semantics; the auto
    // snapshot is taken AFTER tick-0 moves, matching orig-driver ordering —
    // snap-op snapshots pushed during moves precede it)
    for m in scenario.Moves do
        doMove m

    snapshots <- takeSnapshot () :: snapshots

    { Snapshots = List.rev snapshots
      ActionLog = List.rev actionLog
      ResSave = resSave }

// ---------------------------------------------------------------------------
// Village dump (--dump-village): round-trip verification of village-01 data
// against orig's dump (same JSON shape).

let dumpVillage () =
    let modJson (m: Map<string, float>) =
        if Map.isEmpty m then "{}"
        else
            let items = m |> Map.toList |> List.map (fun (k, v) -> sprintf "\"%s\":%s" (esc k) (num v))
            "{" + String.concat "," items + "}"

    let jobJson (j: Game.Catalog.Village.JobDef) =
        let calc =
            match j.CalculatedModifiers with
            | Some m -> sprintf ",\"calculated\":%s" (modJson m)
            | None -> ""
        sprintf "{\"name\":\"%s\",\"modifiers\":%s%s,\"value\":0,\"unlocked\":%s}" (esc j.Name) (modJson j.Modifiers) calc (if j.StartsUnlocked then "true" else "false")

    let jobs = Game.Catalog.Village.jobDefs |> List.map jobJson |> String.concat ","
    let jobNames = Game.Catalog.Village.jobDefs |> List.map (fun j -> sprintf "\"%s\"" (esc j.Name)) |> String.concat ","
    let traits =
        Game.Catalog.Village.traitDefs
        |> List.map (fun t -> sprintf "{\"name\":\"%s\"}" (esc t.Name))
        |> String.concat ","
    let strArr xs = xs |> List.map (fun n -> sprintf "\"%s\"" (esc n)) |> String.concat ","
    let names = strArr Game.Catalog.Village.names
    let surnames = strArr Game.Catalog.Village.surnames

    "{\n  \"driver\": \"fs-runner\",\n  \"origCommit\": \"n/a (F# core)\",\n  \"village\": {\"jobNames\":[" + jobNames + "],\"jobs\":[" + jobs + "],\"traits\":[" + traits + "],\"names\":[" + names + "],\"surnames\":[" + surnames + "]}}"

// ---------------------------------------------------------------------------
// Catalog dump (--dump-catalog): same shape as orig-driver.js

let dumpCatalog () =
    let defJson (d: ResourceDef) =
        let b (v: bool) = if v then "true" else "false"
        let opt (o: string option) = match o with Some s -> sprintf "\"%s\"" (esc s) | None -> "null"
        let rule = if d.RefundableRule = EnergyBalanced then "true" else "false"
        sprintf
            "{\"name\":\"%s\",\"type\":\"%s\",\"visible\":%s,\"color\":%s,\"craftable\":%s,\"calculatePerTick\":%s,\"persists\":%s,\"aiCanDestroy\":%s,\"transient\":%s,\"tag\":%s,\"isNotRefundable\":%s,\"calculatePerDay\":%s,\"calculatePerTickAndDay\":%s,\"calculateOnYear\":%s,\"hasCustomIsRefundable\":%s}"
            (esc d.Name) (esc d.Category) (b d.Visible) (opt d.Color) (b d.Craftable) (b d.CalculatePerTick)
            (b d.Persists) (b d.AiCanDestroy) (b d.Transient) (opt d.Tag) (b d.IsNotRefundable) (b d.CalculatePerDay)
            (b d.CalculatePerTickAndDay) (b d.CalculateOnYear) rule

    let defs = Game.Catalog.Resources.resourceDefs
    let items = defs |> List.map defJson |> String.concat ","
    "{\n  \"driver\": \"fs-runner\",\n  \"origCommit\": \"n/a (F# core)\",\n  \"catalog\": [" + items + "]\n}"

// ---------------------------------------------------------------------------
// Snapshot JSON (resources subtree only until more core exists)

let snapshotJson ((tick, resources, rngDraws, cal): int * (string * (float * float * bool * float)) list * int * CalJson) : string =
    let resItems =
        resources
        |> List.map (fun (n, (v, m, u, p)) ->
            sprintf
                "\"%s\":{\"v\":%s,\"m\":%s,\"u\":%s,\"p\":%s}"
                (esc n)
                (num v)
                (num m)
                (if u then "true" else "false")
                (num p))
        |> String.concat ","
    let weather = match cal.weather with Some w -> sprintf "\"%s\"" (esc w) | None -> "null"
    sprintf
        "{\"tick\":%d,\"rngDraws\":%d,\"calendar\":{\"year\":%s,\"day\":%s,\"season\":\"%s\",\"weather\":%s,\"cycle\":%d,\"cycleYear\":%d},\"resources\":{%s}}"
        tick
        rngDraws
        (num cal.year)
        (num cal.day)
        (esc cal.season)
        weather
        cal.cycle
        cal.cycleYear
        resItems

let resKindJson (rk: ResKind) : string =
    match rk with
    | RNum v -> sprintf "\"result\":%s" (num v)
    | RBool b -> sprintf "\"result\":%s" (if b then "true" else "false")
    | RNone -> "\"reason\":null"

let logJson ((tick, action, args, rk): int * string * string list * ResKind) : string =
    let argStr = args |> List.map (fun a -> sprintf "\"%s\"" (esc a)) |> String.concat ","
    sprintf "{\"tick\":%d,\"action\":\"%s\",\"args\":[%s],%s}" tick (esc action) argStr (resKindJson rk)

[<EntryPoint>]
let main argv =
    let args = List.ofArray argv
    match args with
    | [ "--dump-village"; outPath ] ->
        File.WriteAllText(outPath, dumpVillage ())
        printfn "village catalog -> %s" outPath
        0
    | [ "--dump-catalog"; outPath ] ->
        File.WriteAllText(outPath, dumpCatalog ())
        printfn "catalog: %d resources -> %s" Game.Catalog.Resources.resourceDefs.Length outPath
        0
    | [ scenarioPath; outPath ] ->
        let scenario = File.ReadAllText(scenarioPath) |> parseScenario
        let result = execute scenario
        let snaps = result.Snapshots |> List.map snapshotJson |> String.concat ",\n    "
        let logs = result.ActionLog |> List.map logJson |> String.concat ",\n    "
        let resSaveJson =
            match result.ResSave with
            | None -> ""
            | Some entries ->
                let items =
                    entries
                    |> List.map (fun (n, v, u) ->
                        sprintf "[%s,%s,%s]" (sprintf "\"%s\"" (esc n)) (num v) (if u then "true" else "false"))
                    |> String.concat ","
                sprintf ",\n  \"resPoolSave\": [%s]" items
        let json =
            sprintf
                "{\n  \"driver\": \"fs-runner\",\n  \"scenario\": \"%s\",\n  \"seed\": %d,\n  \"origCommit\": \"n/a (F# core)\",\n  \"rngImpl\": \"splitmix32-seeded sfc32\"%s,\n  \"snapshots\": [\n    %s\n  ],\n  \"actionLog\": [%s]\n}"
                (esc scenario.Name) scenario.Seed resSaveJson snaps logs
        File.WriteAllText(outPath, json)
        printfn
            "scenario \"%s\": %d ticks, %d snapshots -> %s"
            scenario.Name
            scenario.MaxTick
            result.Snapshots.Length
            outPath
        0
    | _ ->
        eprintfn "usage: dotnet run --project fs-runner -- <scenario.cat> <output.json>"
        eprintfn "       dotnet run --project fs-runner -- --dump-catalog <output.json>"
        2
