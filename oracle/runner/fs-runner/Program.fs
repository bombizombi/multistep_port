module FsRunner.Program

// oracle-04 (port side): execute a scenario against the F# Game core and emit
// snapshots in the same JSON shape as oracle/runner/orig-driver.js, so
// tools/diff-snapshots.js can compare implementations bit-exactly.
//
// Scope note (sessions 2026-09-28-04..08): resources pipeline, math library,
// calendar, effects cache, production formula, buildings/science/workshop
// managers, village sim core. Player actions run through the same code paths a
// player click reaches. Snapshot comparison uses --include filters on subtrees
// the port owns where needed (see D014).

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
// Scenario parsing (same file format as oracle/runner/scenario.js)

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

    checkpoints <- 0 :: maxTick :: checkpoints
    { Name = name
      Seed = seed
      Checkpoints = checkpoints |> List.distinct |> List.sort
      Moves = moves |> List.rev |> List.sortBy (fun m -> m.Tick)
      MaxTick = maxTick }

// ---------------------------------------------------------------------------
// resop result kinds: numbers, booleans, or absent (orig: undefined → key dropped)

type ResKind =
    | RNum of float
    | RBool of bool
    | RText of string
    | RNone

type CalJson =
    { year: float
      day: float
      season: string
      weather: string option
      cycle: int
      cycleYear: int }

type BldSnap = string * (int * int * bool * bool * int)
type JobSnap = string * int * bool
type CraftSnap = string * bool * float

type ExecResult =
    { Snapshots:
        (int * (string * (float * float * bool * float)) list * int * CalJson
             * BldSnap list * JobSnap list * CraftSnap list
             * string list * string list * string list
             * string option list * int * (string * float) list)
          list
      ActionLog: (int * string * string list * ResKind) list
      ResSave: (string * float * bool) list option }

let parseSpec (s: string) : (string * float) list =
    s.Split(',')
    |> Array.map (fun p ->
        let parts = p.Split(':')
        (parts.[0], float parts.[1]))
    |> Array.toList

// ---------------------------------------------------------------------------
// Scenario execution against the F# core — the full live pipeline.

let execute (scenario: Scenario) : ExecResult =
    let mutable pool = init Game.Catalog.Resources.resourceDefs
    let mutable cache = Game.Effects.empty
    let mutable calendar = Game.Calendar.init
    let mutable ticks = 0
    let mutable updateCachesPhase = 0
    let mutable calendarDay = 0
    let mutable rngDraws = 0
    let mutable rand =
        let sm = Rng.splitmix32 (uint32 scenario.Seed)
        let r = Rng.sfc32 (sm ()) (sm ()) (sm ()) (sm ())
        fun () -> r ()
    let mutable prodOverrides = Map.empty<string, float>
    let mutable lastLimits = Map.empty<string, float>
    let mutable resSave: (string * float * bool) list option = None
    let mutable curLogTick = 0
    let mutable snapshots = []
    let mutable actionLog = []
    // manager pools (buildings-02 / science-03 / workshop-03 / village-02)
    let mutable bpool = Game.Buildings.init Game.Catalog.Defs.buildingDefs
    let mutable spool = Game.Managers.initScience Game.Catalog.Defs.techDefs Game.Catalog.Defs.policyDefs
    let mutable wpool = Game.Managers.initWorkshop Game.Catalog.Defs.upgradeDefs Game.Catalog.Defs.craftDefs
    let mutable vpool = Game.Managers.initVillage Game.Catalog.Village.jobDefs

    let capCtx () : CapContext =
        { GetEffect = Game.Effects.getEffect cache
          ParagonStorageRatio = 0.0
          CMBRBonus = 0.0
          UnicornTearsActive = false
          SilosResearched = false
          KarmaZebras = 0 }

    let emptyGroup () : Game.Effects.ManagerGroup = { Base = Map.empty; Items = [] }
    let religionGroup () = emptyGroup ()
    let challengesGroup () = emptyGroup ()
    let prestigeGroup () = emptyGroup ()
    let spaceGroup () = emptyGroup ()
    let timeGroup () : Game.Effects.ManagerGroup =
        { Base =
            Game.Catalog.BaseEffects.baseEffects
            |> Map.filter (fun k _ -> k.StartsWith("heat") || k.StartsWith("temporalFlux"))
          Items = [] }
    let villageGroup () = emptyGroup ()

    let bldGroup () : Game.Effects.ManagerGroup =
        { Base = Game.Catalog.BaseEffects.bldBase
          Items =
            bpool.Order
            |> List.choose (fun n ->
                match Game.Buildings.get bpool n with
                | Some b -> Some(Game.Buildings.activeEffects b, (fun name _ -> Game.Buildings.providerEffect b name))
                | None -> None) }
    let workshopGroup () : Game.Effects.ManagerGroup =
        { Base = Map.empty
          Items =
            wpool.UpgradeOrder
            |> List.choose (fun n ->
                match wpool.Upgrades |> Map.tryFind n with
                | Some u when u.Researched -> Some(u.Def.Effects, (fun _ v -> v))
                | _ -> None) }
    let scienceGroup () = emptyGroup () // techs carry no static effects in this version

    let allGroups () =
        [ workshopGroup (); religionGroup (); bldGroup (); challengesGroup (); prestigeGroup (); spaceGroup (); timeGroup (); villageGroup (); scienceGroup () ]

    // calCtx -> refreshCache -> prodCtx -> calCtx is a genuine tie-the-knot
    // cycle (the daily refresh recomputes production with the live calendar)
    let rec calCtx () : Game.Calendar.CalendarContext =
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
          OnParadox = fun st -> st
          // orig mutates the calendar in place before the onNewDay refresh;
          // commit the rolled-over state first so production sees the new season
          OnNewDayRefresh = fun st -> calendar <- st; refreshCache (); st }

    and prodCtx () : Game.Production.ProductionContext =
        let fresh = Game.Production.freshProductionContext cache calendar (calCtx ())
        let jobDefMap =
            Game.Catalog.Village.jobDefs |> List.map (fun j -> (j.Name, j)) |> Map.ofList
        { fresh with
            VillageResProduction =
              fun resName ->
                (Game.Managers.getResProduction vpool jobDefMap)
                |> Map.tryFind resName
                |> Option.defaultValue 0.0
            VillageResConsumption =
              fun resName ->
                // orig village.getResConsumption (js/village.js L811): catnip
                // -0.85/kitten; furs/ivory/spice luxury demands (philosophy seam 0)
                let count = vpool.Kittens.Length
                match resName with
                | "catnip" -> -0.85 * float count
                | "furs" -> -0.01 * float count
                | "ivory" -> -0.007 * float count
                | "spice" -> -0.001 * float count
                | _ -> 0.0 }

    and refreshCache () =
        cache <- Game.Effects.updateCaches cache (allGroups ())
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
        let buildings =
            bpool.Order
            |> List.choose (fun n ->
                match Game.Buildings.get bpool n with
                | Some b -> Some(n, (b.Val, b.On, b.Unlocked, b.Unlockable, b.Stage))
                | None -> None)
        let jobs =
            vpool.JobValues
            |> Map.toList
            |> List.sortBy fst
            |> List.map (fun (n, v) -> (n, v, vpool.JobUnlocked.Contains n))
        let crafts =
            wpool.CraftOrder
            |> List.choose (fun n ->
                match Game.Managers.getCraft wpool n with
                | Some c -> Some(n, c.Unlocked, c.Value)
                | None -> None)
        let techs = spool.TechOrder |> List.filter (fun n -> spool.Techs.[n].Researched) |> List.sort
        let upgrades = wpool.UpgradeOrder |> List.filter (fun n -> wpool.Upgrades.[n].Researched) |> List.sort
        let policies = spool.PolicyOrder |> List.filter (fun n -> spool.Policies.[n].Researched) |> List.sort
        let kittenJobs = vpool.Kittens |> List.map (fun k -> k.Job) |> List.sort
        let free = Game.Managers.getFreeKittens vpool
        let effectsSample =
            [ "catnipPerTickBase"; "catnipDemandRatio"; "maxKittensRatio"; "woodPerTick" ]
            |> List.map (fun k -> (k, Game.Effects.getEffect cache k))
        (ticks, resources, rngDraws, calJson, buildings, jobs, crafts, techs, upgrades, policies, kittenJobs, free, effectsSample)

    // gtick: the port's game.tick() — updateModel order:
    // resPool.update → bld.update → village sim (+ kittens sync) → timer
    // (updateCaches+updateResources every 5 ticks) → calendar.tick
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
        bpool <- Game.Buildings.update pool bpool
        // village sim (village-02/04): births at 0.01 base × growth ratio;
        // starvation seam engages once production can go negative
        let maxKittens = Game.Managers.calculateMaxKittens cache vpool
        vpool <- { vpool with MaxKittens = maxKittens }
        let kittensPerTick = 0.01 * (1.0 + Game.Effects.getEffect cache "kittenGrowthRatio")
        vpool <- Game.Managers.simUpdate maxKittens kittensPerTick 1 (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
        // kittens pseudo-resource sync (game.js L4535-4539)
        let kittensRes = pool.ByName["kittens"]
        pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length; MaxValue = float vpool.MaxKittens } }
        // (diplomacy/religion/space/challenges update seams)

        updateCachesPhase <- updateCachesPhase - 1
        if updateCachesPhase <= 0 then
            updateCachesPhase <- 5
            refreshCache ()
        // (policy recalc 25 / achievements 50 / winter catnip 25 / time queue 10 /
        //  server events: seams)

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
                cache <- Game.Effects.updateCaches cache (allGroups ())
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
                let pool', limits = fastforward 10.0 (float days) calendarDay pool
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
                    (curLogTick, "resop", m.Args, RNum(getEnergyDelta false false pool.EnergyProd pool.EnergyCons))
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
                // reads/writes a primitive — writes no-op, return NaN (JSON null)
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
        // player actions (buildings-02/science-03/workshop-03/village-03 wiring)
        | "gather" ->
            let n = if m.Args.Length >= 1 then int m.Args.[0] else 1
            for _ in 1..n do
                let res = pool.ByName["catnip"]
                pool <- { pool with ByName = pool.ByName |> Map.add "catnip" { res with Value = res.Value + 1.0 } }
        | "buy" ->
            let bldName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let bpool', pool', built = Game.Buildings.build calendarDay cache pool n bldName bpool
            bpool <- bpool'
            pool <- pool'
            if built > 0 then
                // orig build tail: if (meta.unlocks) game.unlock(...);
                // if (meta.upgrades) game.upgrade(meta.upgrades) — upgrade
                // unconditionally runs updateCaches (ENTRY + EXIT), so buildings
                // WITH an upgrades key (hut: policies [authocracy]!) refresh the
                // cache immediately; field (upgrades: null) does not
                let b = bpool.ByName[bldName]
                match b.Def.Unlocks with
                | Some u ->
                    vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades bpool spool wpool
                    bpool <- bp2
                    spool <- sp2
                    wpool <- wp2
                | None -> ()
                match b.Def.Upgrades with
                | Some _ ->
                    // game.upgrade recalculates EFFECTS ONLY (no unlock marks!);
                    // with all calculateEffects val-constant, only the cache
                    // refresh is observable
                    refreshCache () // game.upgrade entry
                    refreshCache () // game.upgrade exit
                | None -> ()
        | "craft" ->
            let pool', wpool', _, _ = Game.Managers.craft calendarDay cache m.Args.[0] (float m.Args.[1]) pool wpool
            pool <- pool'
            wpool <- wpool'
            refreshCache () // orig game.craft calls updateResources (game.js L4631)
        | "assign" ->
            let jobName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let freeBefore = Game.Managers.getFreeKittens vpool
            vpool <- Game.Managers.assignJob jobName n vpool
            vpool <- Game.Managers.simAssignJob jobName n vpool
            let assigned = vpool.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
            // orig driver logs when the assignment could not fully complete
            // (jobLimit: manager default 100000 at this stage)
            if freeBefore < n || assigned < n then
                actionLog <-
                    (m.Tick, "assign", m.Args,
                     RText(sprintf "assigned %d/%d (freeBefore=%d, jobLimit=100000)" assigned n freeBefore))
                    :: actionLog

        | "research" ->
            let pool', spool', ok = Game.Managers.research calendarDay m.Args.[0] pool spool
            pool <- pool'
            spool <- spool'
            if ok then
              refreshCache () // research onPurchase reaches game.upgrade -> updateCaches
              match Game.Managers.getTech spool' m.Args.[0] with
              | Some t ->
                  match t.Def.Unlocks with
                  | Some u ->
                      vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                      let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades bpool spool wpool
                      bpool <- bp2
                      spool <- sp2
                      wpool <- wp2
                  | None -> ()
              | None -> ()
        | "upgrade" ->
            let pool', wpool', ok = Game.Managers.buyUpgrade calendarDay m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            let _ = ok
            ()
        | "policy" ->
            let pool', spool', ok = Game.Managers.researchPolicy calendarDay m.Args.[0] pool spool
            pool <- pool'
            spool <- spool'
            let _ = ok
            ()
        | "hunt"
        | "praise"
        | "save"
        | "load" -> actionLog <- (m.Tick, m.Action, m.Args, RNone) :: actionLog
        | "observe" -> ()
        | other -> actionLog <- (m.Tick, other, m.Args, RNone) :: actionLog

    // scenario run loop mirroring orig-driver (D010): tick-0 moves before the
    // tick-0 snapshot; moves at tick T before tick T's gtick; checkpoint
    // snapshots after that tick; snap-op snapshots pushed during moves precede it
    let movesAt tick = scenario.Moves |> List.filter (fun m -> m.Tick = tick)

    for m in movesAt 0 do
        doMove m
    snapshots <- takeSnapshot () :: snapshots

    for tick in 1..scenario.MaxTick do
        for m in movesAt tick do
            doMove m
        gtick ()
        if scenario.Checkpoints |> List.contains tick then
            snapshots <- takeSnapshot () :: snapshots

    { Snapshots = List.rev snapshots
      ActionLog = List.rev actionLog
      ResSave = resSave }

// ---------------------------------------------------------------------------
// Village dump (--dump-village): round-trip verification of village-01 data.

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
// Snapshot JSON

let snapshotJson
    ((tick, resources, rngDraws, cal, buildings, jobs, crafts, techs, upgrades, policies, kittenJobs, free, effectsSample):
        int * (string * (float * float * bool * float)) list * int * CalJson
            * BldSnap list * JobSnap list * CraftSnap list
            * string list * string list * string list
            * string option list * int * (string * float) list)
    : string =
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
    let buildingsJson =
        buildings
        |> List.map (fun (n, (v, on, unl, able, st)) ->
            sprintf
                "\"%s\":{\"val\":%d,\"on\":%d,\"unlocked\":%s,\"unlockable\":%s,\"stage\":%d}"
                (esc n) v on (if unl then "true" else "false") (if able then "true" else "false") st)
        |> String.concat ","
    let jobsJson =
        jobs
        |> List.map (fun (n, v, unl) ->
            sprintf "\"%s\":{\"value\":%d,\"unlocked\":%s}" (esc n) v (if unl then "true" else "false"))
        |> String.concat ","
    let craftsJson =
        crafts
        |> List.map (fun (n, unl, value) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"value\":%s}" (esc n) (if unl then "true" else "false") (num value))
        |> String.concat ","
    let nameArr xs = xs |> List.map (fun x -> sprintf "\"%s\"" (esc x)) |> String.concat ","
    let kittenJobsJson =
        kittenJobs
        |> List.map (fun j -> match j with Some j -> sprintf "\"%s\"" (esc j) | None -> "null")
        |> String.concat ","
    let kittensJson =
        sprintf
            "{\"count\":%d,\"free\":%d,\"jobs\":[%s]}"
            kittenJobs.Length
            free
            kittenJobsJson
    let effectsJson =
        effectsSample
        |> List.map (fun (k, v) -> sprintf "\"%s\":%s" (esc k) (num v))
        |> String.concat ","
    sprintf
        "{\"tick\":%d,\"rngDraws\":%d,\"calendar\":{\"year\":%s,\"day\":%s,\"season\":\"%s\",\"weather\":%s,\"cycle\":%d,\"cycleYear\":%d},\"kittens\":%s,\"resources\":{%s},\"buildings\":{%s},\"jobs\":{%s},\"crafts\":{%s},\"techs\":[%s],\"upgrades\":[%s],\"policies\":[%s],\"effects\":{%s}}"
        tick
        rngDraws
        (num cal.year)
        (num cal.day)
        (esc cal.season)
        weather
        cal.cycle
        cal.cycleYear
        kittensJson
        resItems
        buildingsJson
        jobsJson
        craftsJson
        (nameArr techs)
        (nameArr upgrades)
        (nameArr policies)
        effectsJson

let resKindJson (rk: ResKind) : string =
    match rk with
    | RNum v -> sprintf "\"result\":%s" (num v)
    | RBool b -> sprintf "\"result\":%s" (if b then "true" else "false")
    | RText w -> sprintf "\"reason\":\"%s\"" (esc w)
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
