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
type CraftSnap = string * bool * float * float
type RelSnap = string * (int * int * bool * bool)
type RaceSnap = string * (bool * int)

type ExecResult =
    { Snapshots:
        (int * (string * (float * float * bool * float)) list * int * CalJson
             * BldSnap list * JobSnap list * CraftSnap list
             * string list * string list * string list
             * string option list * int * (string * float) list
             * RelSnap list * RaceSnap list * float * float * int)
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
    // religion-01/08 + diplomacy-02 pools
    let mutable rpool = Game.Religion.init ()
    let mutable dp = Game.Diplomacy.init ()
    // village resourceProduction cache (orig: 10-tick timer + lazy first read +
    // instant refresh on job assignment); None = stale (forces lazy recompute)
    let mutable prodCache: Map<string, float> option = None
    let mutable prodPhase = 0
    // diplomacy.cachedAmbassadorEffects (rebuilt every tick by actionAmbassadors)
    let mutable ambassadorEffects = Map.empty<string, float>

    // orig village.updateResourceProduction (js/village.js L626): pure recompute
    let updateResourceProduction () =
        let jobDefMap =
            Game.Catalog.Village.jobDefs |> List.map (fun j -> (j.Name, j)) |> Map.ofList
        Game.Managers.getResProduction cache vpool jobDefMap wpool

    // orig village.getResProduction (L603-605): lazy sync + zebra manpower seams
    let getResProductionCached () : Map<string, float> =
        match prodCache with
        | Some m -> m
        | None ->
            let m = updateResourceProduction ()
            prodCache <- Some m
            m

    // orig village.actionAmbassadors (L497-527): consume culture/spice, rebuild
    // diplomacy.cachedAmbassadorEffects. times=1 per tick from village.update.
    let actionAmbassadors (times: float) : unit =
        let prod = getResProductionCached ()
        let cultureCons = prod |> Map.tryFind "cultureConsumptionAmbassadors" |> Option.defaultValue 0.0
        let spiceCons = prod |> Map.tryFind "spiceConsumptionAmbassadors" |> Option.defaultValue 0.0
        let mutable effectScaling = 1.0
        if cultureCons > 0.0 || (spiceCons > 0.0 && times > 0.0) then
            let pool', scaling =
                Game.Resources.getAmtDependsOnStock
                    calendarDay
                    [ ("culture", cultureCons); ("spice", spiceCons) ]
                    times
                    pool
            pool <- pool'
            effectScaling <- scaling
        // ambassador job modifiers (village-01 catalog, calculated culture/spice
        // consumption included via the production map); LDR on *Chance keys
        ambassadorEffects <-
          (Game.Catalog.Village.jobDefs
           |> List.find (fun j -> j.Name = "ambassador")).Modifiers
          |> Map.map (fun effectName _ ->
              let mutable effectAmt = effectScaling * (prod |> Map.tryFind effectName |> Option.defaultValue 0.0)
              if effectName.Length > 6 && effectName.EndsWith("Chance") then
                  effectAmt <- Game.Math.getLimitedDR effectAmt 0.25
              if effectName = "embassyEffectCap" && effectAmt > 1.0 then
                  effectAmt <- sqrt effectAmt
              effectAmt)
        let _ = times
        ()

    let capCtx () : CapContext =
        { GetEffect = Game.Effects.getEffect cache
          ParagonStorageRatio = 0.0
          CMBRBonus = 0.0
          UnicornTearsActive = false
          SilosResearched = false
          KarmaZebras = 0 }

    let emptyGroup () : Game.Effects.ManagerGroup = { Base = Map.empty; Items = [] }
    let religionGroup () = Game.Religion.religionGroup rpool
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
    let traditionResearched () =
        match spool.Policies |> Map.tryFind "tradition" with
        | Some p -> p.Researched
        | None -> false
    let getResValue (name: string) : float =
        (get pool name |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0)
    let workshopGroup () : Game.Effects.ManagerGroup =
        { Base = Game.Managers.workshopEffectsBase cache getResValue false
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
        { fresh with
            Happiness = vpool.Happiness
            Kittens = vpool.Kittens.Length
            FreeKittens = Game.Managers.getFreeKittens vpool
            VillageResProduction =
              fun resName ->
                (getResProductionCached ())
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
                | Some c -> Some(n, c.Unlocked, c.Value, c.Progress)
                | None -> None)
        // religion-01/08 + diplomacy-02/03 state (extended-snapshot contract)
        let religion =
            [ for n in rpool.RuOrder do
                let m = rpool.RUs.[n]
                yield (n, (m.Val, m.On, m.Unlocked, m.Researched))
              for n in rpool.ZuOrder do
                let m = rpool.ZUs.[n]
                yield (n, (m.Val, m.On, m.Unlocked, m.Researched))
              for n in rpool.TuOrder do
                let m = rpool.TUs.[n]
                yield (n, (m.Val, m.On, m.Unlocked, m.Researched)) ]
        let diplomacy =
            [ for n in dp.RaceOrder do
                let r = dp.Races.[n]
                yield (n, (r.Unlocked, r.EmbassyLevel)) ]
        let techs = spool.TechOrder |> List.filter (fun n -> spool.Techs.[n].Researched) |> List.sort
        let upgrades = wpool.UpgradeOrder |> List.filter (fun n -> wpool.Upgrades.[n].Researched) |> List.sort
        let policies = spool.PolicyOrder |> List.filter (fun n -> spool.Policies.[n].Researched) |> List.sort
        // JS Array.sort on [job|null]: null stringifies to "null" and sorts as
        // a string — "farmer" < "null" < "scholar"/"woodcutter". Mirror exactly.
        let kittenJobs =
            vpool.Kittens
            |> List.map (fun k -> k.Job)
            |> List.sortBy (fun j -> match j with Some j -> j | None -> "null")
        let free = Game.Managers.getFreeKittens vpool
        let effectsSample =
            [ "catnipPerTickBase"; "catnipDemandRatio"; "maxKittensRatio"; "woodPerTick" ]
            |> List.map (fun k -> (k, Game.Effects.getEffect cache k))
        (ticks, resources, rngDraws, calJson, buildings, jobs, crafts, techs, upgrades, policies, kittenJobs, free, effectsSample,
         religion, diplomacy, rpool.Faith, rpool.FaithRatio, rpool.TranscendenceTier)

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
        // orig village.update starvation branch: kittens>0 and catnip value +
        // catnipPerTick(true) < 0 -> death; growth resumes after deathTimeout.
        // catnipPerTickConvertion is 0 at this stage (smelter seam).
        let catnipPerTickTrue =
            match get pool "catnip" with
            | Some r -> r.PerTickCached
            | None -> 0.0
        let catnipVal = (get pool "catnip" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0)
        let starving =
          vpool.Kittens.Length > 0
          && (catnipVal + catnipPerTickTrue < 0.0)
        let preStarveKittens = vpool.Kittens.Length
        vpool <- Game.Managers.starvationStep catnipVal catnipPerTickTrue 5.0 false maxKittens vpool
        if vpool.Kittens.Length <> preStarveKittens then
            // orig sim.killKittens tail (village.js L3390-3392): updateResourceProduction + updateResources fire on the kill tick
            prodCache <- Some(updateResourceProduction ())
            refreshCache ()
        // orig calls sim.update in every branch — with rate 0 when starving
        let growthRate = if starving then 0.0 else kittensPerTick
        vpool <- Game.Managers.simUpdate maxKittens growthRate 1 (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
        // kittens pseudo-resource sync (game.js L4535-4539)
        let kittensRes = pool.ByName["kittens"]
        pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length; MaxValue = float vpool.MaxKittens } }
        // happiness (village-05a): unhappiness past 5 kittens + +10% per
        // non-common resource with value > 0 (orig luxury loop L975-990)
        let luxCount =
            pool.Order
            |> List.sumBy (fun n ->
                match get pool n with
                | Some r when r.Def.Category <> "common" && r.Value > 0.0 -> 1
                | _ -> 0)
        let hctx : Game.Happiness.HappinessContext =
            { Game.Happiness.freshHappinessContext with LuxuryCount = luxCount }
        vpool <- { vpool with Happiness = Game.Happiness.updateHappiness hctx vpool.Kittens.Length vpool.MaxKittens }
        // orig village.update tail: actionAmbassadors(1) after updateHappines
        actionAmbassadors 1.0

        // orig updateModel L4517-4519 order: workshop.update → diplomacy.update
        // → religion.update (space/challenges seams unchanged at this slice)
        // workshop.update → fastforward(1/ticksPerDay): effectsBase is read by
        // workshopGroup() at aggregation; engineers craft; sanity clearEngineers
        if Game.Managers.getFreeEngineers vpool wpool < 0.0 then
            vpool <- Game.Managers.clearCraftJobs vpool
            wpool <- { wpool with Crafts = wpool.Crafts |> Map.map (fun _ c -> { c with Value = 0.0 }) }
        let pool', wpool' =
            Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) getResValue
                (getResProductionCached ()) false 1.0 pool wpool
        pool <- pool'
        wpool <- wpool'
        // diplomacy.update: race unlock roll at the year gate (20 at fresh)
        let dctx : Game.Diplomacy.DiplomacyContext =
            { GetEffect = Game.Effects.getEffect cache
              GetResValue = getResValue
              GetResMax = fun n -> (get pool n |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
              IsResUnlocked = fun n -> (get pool n |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
              Season = Game.Calendar.seasons.[calendar.Season].Name
              NuclearFissionResearched = false
              IronWill = false }
        let dp', ev = Game.Diplomacy.update dp dctx calendar.Year 0 (fun () -> rngDraws <- rngDraws + 1; rand ())
        dp <- dp'
        if ev.UnlockCaravanserai then
            match wpool.Upgrades |> Map.tryFind "caravanserai" with
            | Some u -> wpool <- { wpool with Upgrades = wpool.Upgrades |> Map.add "caravanserai" { u with Unlocked = true } }
            | None -> ()
        if ev.UnlockZebraPolicies then
            for pname in ["zebraRelationsAppeasement"; "zebraRelationsBellicosity"] do
                match spool.Policies |> Map.tryFind pname with
                | Some pol -> spool <- { spool with Policies = spool.Policies |> Map.add pname { pol with Unlocked = true } }
                | None -> ()
        // religion.update: NaN faith guard + corruption/alicorn seam (0 here)

        // timer.update — handlers fire in registration order:
        //   village.updateResourceProduction (10) → updateCaches (5)
        prodPhase <- prodPhase - 1
        if prodPhase <= 0 then
            prodPhase <- 10
            prodCache <- Some(updateResourceProduction ())
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
                refreshCache () // orig updateCaches includes updateResources
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
            | [ "faith" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum rpool.Faith) :: actionLog
            | [ "faithratio" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum rpool.FaithRatio) :: actionLog
            | [ "tier" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum(float rpool.TranscendenceTier)) :: actionLog
            | [ "worshipval"; name ] ->
                let meta = rpool.RUs.[name]
                actionLog <- (curLogTick, "resop", m.Args, RNum(float meta.Val)) :: actionLog
            | [ "embassy"; name ] ->
                let r = dp.Races.[name]
                actionLog <- (curLogTick, "resop", m.Args, RNum(float r.EmbassyLevel)) :: actionLog
            | [ "nonrandom" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum dp.NonRandomTrades) :: actionLog
            | [ "forceru"; ruName ] ->
                // D014 injection: force-own an RU (see orig-driver comment)
                let meta = rpool.RUs.[ruName]
                rpool <- { rpool with RUs = rpool.RUs |> Map.add ruName { meta with Val = 1; On = 1; Researched = true; Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "maxtrade"; raceName ] ->
                let dctxM : Game.Diplomacy.DiplomacyContext =
                    { GetEffect = Game.Effects.getEffect cache
                      GetResValue = getResValue
                      GetResMax = fun nn -> (get pool nn |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                      IsResUnlocked = fun nn -> (get pool nn |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
                      Season = Game.Calendar.seasons.[calendar.Season].Name
                      NuclearFissionResearched = false
                      IronWill = false }
                let maxAmt = Game.Diplomacy.getMaxTradeAmt dp dctxM ambassadorEffects raceName
                actionLog <- (curLogTick, "resop", m.Args, RNum(maxAmt |> Option.defaultValue 0.0)) :: actionLog
            | [ "standing"; name ] ->
                let dctx : Game.Diplomacy.DiplomacyContext =
                    { GetEffect = Game.Effects.getEffect cache
                      GetResValue = getResValue
                      GetResMax = fun nn -> (get pool nn |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                      IsResUnlocked = fun nn -> (get pool nn |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
                      Season = Game.Calendar.seasons.[calendar.Season].Name
                      NuclearFissionResearched = false
                      IronWill = false }
                actionLog <- (curLogTick, "resop", m.Args, RNum(Game.Diplomacy.getFinalStanding dp dctx name)) :: actionLog
            | [ "setbld"; bldName; valueArg ] ->
                let b = bpool.ByName[bldName]
                let v = int valueArg
                bpool <- { bpool with ByName = bpool.ByName |> Map.add bldName { b with Val = v; On = v } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "year"; valueArg ] ->
                calendar <- { calendar with Year = float valueArg }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "worship"; valueArg ] ->
                rpool <- { rpool with Faith = float valueArg }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "epiphany"; valueArg ] ->
                rpool <- { rpool with FaithRatio = float valueArg }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
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
            let affordBefore = Game.Resources.hasRes pool (Game.Buildings.getPrices cache bpool.ByName[bldName] |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            let bpool', pool', built = Game.Buildings.build calendarDay cache pool n bldName bpool
            bpool <- bpool'
            pool <- pool'
            if built <> n then
                // orig driver logs partial/failed buys; model.enabled IS the
                // hasResources check (updateEnabled), same value as affordBefore
                let _ = bpool
                actionLog <-
                    (m.Tick, "buy", m.Args,
                     RText(sprintf "built %d/%d (enabled=%s, affordBefore=%s)" built n (if affordBefore then "true" else "false") (if affordBefore then "true" else "false")))
                    :: actionLog
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
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades [] u.Crafts bpool spool wpool
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
            let pool', wpool', ok = Game.Managers.craft calendarDay cache (traditionResearched ()) m.Args.[0] (float m.Args.[1]) pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                refreshCache () // orig game.craft calls updateResources (game.js L4631)
        | "assign" ->
            let jobName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let freeBefore = Game.Managers.getFreeKittens vpool
            // orig getJobLimit (js/village.js L308-358): engineer = factory.val,
            // ambassador = perk-gated race count (0 at fresh), default 100000
            let jobLimit =
                match jobName with
                | "engineer" ->
                    (match Game.Buildings.get bpool "factory" with
                     | Some f -> f.Val
                     | None -> 0)
                | "ambassador" -> 0
                | _ -> 100000
            let before = vpool.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
            vpool <- Game.Managers.assignJob jobName n jobLimit vpool
            let assigned = vpool.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
            // orig: sim.assignJob runs only when the capped amt > 0
            if assigned > before then
                vpool <- Game.Managers.simAssignJob jobName (assigned - before) vpool
                prodCache <- Some(updateResourceProduction ()) // orig refreshes instantly (village.js L3513)
            if freeBefore < n || assigned < n then
                actionLog <-
                    (m.Tick, "assign", m.Args,
                     RText(sprintf "assigned %d/%d (freeBefore=%d, jobLimit=%d)" assigned n freeBefore jobLimit))
                    :: actionLog

        | "research" ->
            let pool', spool', ok = Game.Managers.research calendarDay m.Args.[0] pool spool
            pool <- pool'
            spool <- spool'
            if ok then
              // orig onPurchase: handler -> unlock (NO cache refresh) -> if the
              // tech itself has an upgrades key, game.upgrade refreshes twice
              match Game.Managers.getTech spool' m.Args.[0] with
              | Some t when t.Def.Upgrades.IsSome ->
                  refreshCache () // game.upgrade entry
                  refreshCache () // game.upgrade exit
              | _ -> ()
              match Game.Managers.getTech spool' m.Args.[0] with
              | Some t ->
                  match t.Def.Unlocks with
                  | Some u ->
                      vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                      let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades [] u.Crafts bpool spool wpool
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
        | "refine" ->
            // orig bld.refineCatnip (js/buildings.js L3003): pay 100 catnip via the
            // button's buyItem prices, gain 1 + craftRatio wood (advancedRefinement
            // seam: isEnriched 50-cost variant, fresh-false)
            let prices = [ ("catnip", 100.0) ]
            if Game.Resources.hasRes pool prices 0.0 then
                let craftRatio = Game.Managers.getResCraftRatio cache "wood"
                let poolPaid = Game.Resources.payPrices calendarDay pool prices
                let poolGained, _ = Game.Resources.addResEvent calendarDay "wood" (1.0 + craftRatio) poolPaid
                pool <- poolGained
                refreshCache ()
        | "refine" ->
            let prices = [ ("catnip", 100.0) ]
            if Game.Resources.hasRes pool prices 0.0 then
                let craftRatio = Game.Managers.getResCraftRatio cache "wood"
                let poolPaid = Game.Resources.payPrices calendarDay pool prices
                let poolGained, _ = Game.Resources.addResEvent calendarDay "wood" (1.0 + craftRatio) poolPaid
                pool <- poolGained
                refreshCache ()
        | "hunt" ->
            let hctx : Game.Village.HuntContext =
              { GetEffect = Game.Effects.getEffect cache
                Rand = fun () -> rngDraws <- rngDraws + 1; rand ()
                Zebras = (match get pool "zebras" with Some z -> z.Value | None -> 0.0)
                IronWill = false // ironWill seam (game-06 karma block)
                GoldOreResearched =
                  (match wpool.Upgrades |> Map.tryFind "goldOre" with
                   | Some u -> u.Researched
                   | None -> false)
                AlicornmancyResearched = false // prestige seam
                UnicornPastureVal = 0 }
            pool <- Game.Village.huntAll hctx pool
        | "praise" ->
            // orig religion.praise (js/religion.js L1536): worship += faith.value
            // * (1 + apocrypha); faith.value = 0.0001. Outside any timer — the
            // production cache keeps pre-praise values until its next refresh.
            let faithRes = pool.ByName["faith"]
            rpool <- Game.Religion.praise rpool faithRes.Value
            pool <- { pool with ByName = pool.ByName |> Map.add "faith" { faithRes with Value = 0.0001 } }
        | "adore" ->
            // orig resetFaith(1.01, true) -> _resetFaithInternal(1.01) (L3157)
            rpool <- Game.Religion.adoreInternal rpool 1.01
        | "transcend" ->
            let rp', ok = Game.Religion.transcend rpool
            rpool <- rp'
            if ok then refreshCache () // game.calculateAllEffects on success
        | "worship" ->
            // RU purchase via ReligionBtnController -> stackable build loop
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let rp', pool', res = Game.Religion.buyRU calendarDay cache pool n m.Args.[0] rpool
            rpool <- rp'
            pool <- pool'
            if res.Bought > 0 then
                rpool <- Game.Religion.freezeSolarRevolution cache rpool
                refreshCache () // build tail: calculateEffects + fan-outs
                match res.UnlockFanOut with
                | Some u ->
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                    bpool <- bp2; spool <- sp2; wpool <- wp2
                    vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                | None -> ()
        | "ziggurat" ->
            // ZU purchase via ZigguratBtnController -> stackable build loop
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let rp', pool', res = Game.Religion.buyZU calendarDay cache pool n m.Args.[0] rpool
            rpool <- rp'
            pool <- pool'
            if res.Bought > 0 then
                refreshCache ()
                match res.UnlockFanOut with
                | Some u ->
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                    bpool <- bp2; spool <- sp2; wpool <- wp2
                | None -> ()
        | "embassy" ->
            // EmbassyButtonController.buyItem gates: writing + race unlocked
            let raceName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let writingResearched =
                match spool.Techs |> Map.tryFind "writing" with
                | Some t -> t.Researched
                | None -> false
            let dctx : Game.Diplomacy.DiplomacyContext =
                { GetEffect = Game.Effects.getEffect cache
                  GetResValue = getResValue
                  GetResMax = fun nn -> (get pool nn |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                  IsResUnlocked = fun nn -> (get pool nn |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
                  Season = Game.Calendar.seasons.[calendar.Season].Name
                  NuclearFissionResearched = false
                  IronWill = false }
            if writingResearched && dp.Races.[raceName].Unlocked then
                let dp', pool', built = Game.Diplomacy.buyEmbassies calendarDay dp dctx pool n raceName
                dp <- dp'
                pool <- pool'
                if built <> n then
                    actionLog <- (m.Tick, "embassy", m.Args, RText(sprintf "built %d/%d" built n)) :: actionLog
                () // triggerOnEmbassyCountChanged: ambassador recalc (val-constant seam)
        | "trade" ->
            let raceName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let dctx : Game.Diplomacy.DiplomacyContext =
                { GetEffect = Game.Effects.getEffect cache
                  GetResValue = getResValue
                  GetResMax = fun nn -> (get pool nn |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                  IsResUnlocked = fun nn -> (get pool nn |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
                  Season = Game.Calendar.seasons.[calendar.Season].Name
                  NuclearFissionResearched = false
                  IronWill = false }
            let rand' = fun () -> rngDraws <- rngDraws + 1; rand ()
            if n = 1 then
                // orig trade(race) relies on the button controller paying the
                // costs (manpower/gold/buy item at trade volume) before
                // tradeImpl(race, 1); mirror that controller path.
                let manp = Game.Diplomacy.getManpowerCost dctx
                let gold = Game.Diplomacy.getGoldCost dctx
                let volume = Game.Diplomacy.getTradeVolume dctx ambassadorEffects
                let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
                let buyPrice = def.Buys.[0].Val * 1.0 * volume
                let cost = [ ("manpower", manp); ("gold", gold); (def.Buys.[0].Resource, buyPrice) ]
                if Game.Resources.hasRes pool cost 0.0 then
                    pool <- Game.Resources.payPrices calendarDay pool cost
                    let dp', gained = Game.Diplomacy.tradeImpl dp dctx rand' raceName 1.0 ambassadorEffects
                    dp <- dp'
                    for KeyValue(resName, amt) in gained do
                        let pool2, _ = Game.Resources.addResEvent calendarDay resName amt pool
                        pool <- pool2
                else
                    actionLog <- (m.Tick, "trade", m.Args, RText "cannot afford") :: actionLog
            else
                // tradeMultiple: hasMultipleResources gate, negative addResEvent
                // costs, then tradeImpl(amt)
                let manp = Game.Diplomacy.getManpowerCost dctx
                let gold = Game.Diplomacy.getGoldCost dctx
                let volume = Game.Diplomacy.getTradeVolume dctx ambassadorEffects
                let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
                let afford =
                    (getResValue "gold") >= gold * float n
                    && (getResValue "manpower") >= manp * float n
                    && (getResValue def.Buys.[0].Resource) >= def.Buys.[0].Val * float n * volume
                if afford then
                    let pool1, _ = Game.Resources.addResEvent calendarDay "manpower" (-manp * float n) pool
                    let pool2, _ = Game.Resources.addResEvent calendarDay "gold" (-gold * float n) pool1
                    let pool3, _ = Game.Resources.addResEvent calendarDay def.Buys.[0].Resource (-def.Buys.[0].Val * float n * volume) pool2
                    pool <- pool3
                    let dp', gained = Game.Diplomacy.tradeImpl dp dctx rand' raceName (float n) ambassadorEffects
                    dp <- dp'
                    for KeyValue(resName, amt) in gained do
                        let pool2, _ = Game.Resources.addResEvent calendarDay resName amt pool
                        pool <- pool2
                else
                    actionLog <- (m.Tick, "trade", m.Args, RText "cannot afford multiple") :: actionLog
        | "tradeall" ->
            // tradeAll: tradeMultiple(race, getMaxTradeAmt(race)); undefined max -> no-op
            let raceName = m.Args.[0]
            let dctxT : Game.Diplomacy.DiplomacyContext =
                { GetEffect = Game.Effects.getEffect cache
                  GetResValue = getResValue
                  GetResMax = fun nn -> (get pool nn |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                  IsResUnlocked = fun nn -> (get pool nn |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
                  Season = Game.Calendar.seasons.[calendar.Season].Name
                  NuclearFissionResearched = false
                  IronWill = false }
            let rand' = fun () -> rngDraws <- rngDraws + 1; rand ()
            match Game.Diplomacy.getMaxTradeAmt dp dctxT ambassadorEffects raceName with
            | Some amt ->
                let manp = Game.Diplomacy.getManpowerCost dctxT
                let gold = Game.Diplomacy.getGoldCost dctxT
                let volume = Game.Diplomacy.getTradeVolume dctxT ambassadorEffects
                let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
                let pool1, _ = Game.Resources.addResEvent calendarDay "manpower" (-manp * amt) pool
                let pool2, _ = Game.Resources.addResEvent calendarDay "gold" (-gold * amt) pool1
                let pool3, _ = Game.Resources.addResEvent calendarDay def.Buys.[0].Resource (-def.Buys.[0].Val * amt * volume) pool2
                pool <- pool3
                let dp', gained = Game.Diplomacy.tradeImpl dp dctxT rand' raceName amt ambassadorEffects
                dp <- dp'
                for KeyValue(resName, a) in gained do
                    let pool2', _ = Game.Resources.addResEvent calendarDay resName a pool
                    pool <- pool2'
            | None -> ()
        | "speciality" ->
            // CraftButtonController.assignCraftJob: min(value, freeEngineers) loop
            let craftName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let mutable added = 0
            let mutable vp = vpool
            let mutable stop = false
            while not stop && added < n && (Game.Managers.getFreeEngineers vp wpool) > float added do
                let vp', ok = Game.Managers.simAssignCraftJob craftName vp
                if ok then
                    vp <- vp'
                    added <- added + 1
                else
                    stop <- true // assignCraftJob failure breaks the loop
            vpool <- vp
            let c = wpool.Crafts.[craftName]
            wpool <- { wpool with Crafts = wpool.Crafts |> Map.add craftName { c with Value = c.Value + float added } }
            if added < n then
                let freeStr = string (Game.Math.jsRound (Game.Managers.getFreeEngineers vpool wpool))
                actionLog <- (m.Tick, "speciality", m.Args, RText(sprintf "assigned %d/%d (free=%s)" added n freeStr)) :: actionLog
        | "craftall" ->
            // orig game.craftAll minus the wood winter-confirm branch (headless:
            // workshop.craftAll + updateResources — same end state)
            let pool', wpool', _ = Game.Managers.craftAll calendarDay cache (traditionResearched ()) getResValue m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            refreshCache ()
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
        curLogTick <- tick // orig sets tickIndex = t before the move phase
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
    ((tick, resources, rngDraws, cal, buildings, jobs, crafts, techs, upgrades, policies, kittenJobs, free, effectsSample, religion, diplomacy, faith, faithRatio, tier):
        int * (string * (float * float * bool * float)) list * int * CalJson
            * BldSnap list * JobSnap list * CraftSnap list
            * string list * string list * string list
            * string option list * int * (string * float) list
            * RelSnap list * RaceSnap list * float * float * int)
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
        |> List.map (fun (n, unl, value, progress) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"value\":%s,\"progress\":%s}" (esc n) (if unl then "true" else "false") (num value) (num progress))
        |> String.concat ","
    let religionJson =
        religion
        |> List.map (fun (n, (v, on, unl, res)) ->
            sprintf "\"%s\":{\"val\":%d,\"on\":%d,\"unlocked\":%s,\"researched\":%s}"
                (esc n) v on (if unl then "true" else "false") (if res then "true" else "false"))
        |> String.concat ","
    let diplomacyJson =
        diplomacy
        |> List.map (fun (n, (unl, lvl)) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"embassyLevel\":%d}" (esc n) (if unl then "true" else "false") lvl)
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
        "{\"tick\":%d,\"rngDraws\":%d,\"calendar\":{\"year\":%s,\"day\":%s,\"season\":\"%s\",\"weather\":%s,\"cycle\":%d,\"cycleYear\":%d},\"kittens\":%s,\"resources\":{%s},\"buildings\":{%s},\"jobs\":{%s},\"crafts\":{%s},\"techs\":[%s],\"upgrades\":[%s],\"policies\":[%s],\"religion\":{\"faith\":%s,\"faithRatio\":%s,\"tier\":%d,\"metas\":{%s}},\"diplomacy\":{\"races\":{%s}},\"effects\":{%s}}"
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
        (num faith)
        (num faithRatio)
        tier
        religionJson
        diplomacyJson
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

// ---------------------------------------------------------------------------
// World dump (--dump-world): F# catalog round-trip for data-unit diffs.
// Shape mirrors oracle/runner/_world-driver.js's world dump.

let dumpWorld () : string =
    let prices ps = ps |> List.map (fun (p: Price) -> sprintf "{\"name\":\"%s\",\"val\":%s}" (esc p.Resource) (num p.Val)) |> String.concat ","
    let fmap (m: Map<string, float>) =
        m |> Map.toList
        |> List.map (fun (k, v) -> sprintf "\"%s\":%s" (esc k) (num v))
        |> String.concat ","
    let sells ss =
        ss
        |> List.map (fun (s: Game.Catalog.World.SellDef) ->
            sprintf "{\"name\":\"%s\",\"value\":%s,\"chance\":%s,\"width\":%s,\"minLevel\":%s,\"seasons\":{%s}}"
                (esc s.Name) (num s.Value) (num s.Chance) (num s.Width)
                (match s.MinLevel with Some l -> string l | None -> "null")
                (fmap s.Seasons))
        |> String.concat ","
    let races =
        Game.Catalog.World.raceDefs
        |> List.map (fun r ->
            sprintf "{\"name\":\"%s\",\"unlocked\":%s,\"standing\":%s,\"hidden\":%s,\"embassyPrices\":[%s],\"embassyLevel\":%d,\"attitude\":null,\"raceEffects\":null,\"buys\":[%s],\"sells\":[%s]}"
                (esc r.Name) (if r.StartsUnlocked then "true" else "false") (num r.Standing) (if r.Hidden then "true" else "false")
                (prices r.EmbassyPrices) r.EmbassyLevel (prices r.Buys) (sells r.Sells))
        |> String.concat ","
    let zu =
        Game.Catalog.World.zuDefs
        |> List.map (fun z ->
            sprintf "{\"name\":\"%s\",\"prices\":[%s],\"val\":0,\"unlocked\":%s,\"effects\":{%s},\"priceRatio\":%s}"
                (esc z.Name) (prices z.Prices) (if z.StartsUnlocked then "true" else "false") (fmap z.Effects)
                (match z.PriceRatio with Some r -> num r | None -> "null"))
        |> String.concat ","
    let ru =
        Game.Catalog.World.ruDefs
        |> List.map (fun z ->
            sprintf "{\"name\":\"%s\",\"prices\":[%s],\"val\":0,\"unlocked\":false,\"researched\":false,\"effects\":{%s},\"priceRatio\":%s,\"faith\":%s,\"noStackable\":%s}"
                (esc z.Name) (prices z.Prices) (fmap z.Effects)
                (match z.PriceRatio with Some r -> num r | None -> "null")
                (match z.FaithGate with Some f -> num f | None -> "null")
                (if z.NoStackable then "true" else "false"))
        |> String.concat ","
    let tu =
        Game.Catalog.World.tuDefs
        |> List.map (fun z ->
            sprintf "{\"name\":\"%s\",\"prices\":[%s],\"val\":0,\"unlocked\":false,\"researched\":false,\"effects\":{%s},\"priceRatio\":%s}"
                (esc z.Name) (prices z.Prices) (fmap z.Effects)
                (match z.PriceRatio with Some r -> num r | None -> "null"))
        |> String.concat ","
    let zebra =
        Game.Catalog.Defs.zebraUpgradeDefs
        |> List.map (fun u ->
            sprintf "{\"name\":\"%s\",\"prices\":[%s],\"unlocked\":false,\"researched\":false,\"effects\":{%s}}"
                (esc u.Name) (prices u.Prices) (fmap u.Effects))
        |> String.concat ","
    "{\n  \"driver\": \"fs-runner\",\n  \"origCommit\": \"n/a (F# core)\",\n  \"races\": [" + races + "],\n  \"zu\": [" + zu + "],\n  \"ru\": [" + ru + "],\n  \"tu\": [" + tu + "],\n  \"zebraUpgrades\": [" + zebra + "]\n}"

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
    | [ "--dump-world"; outPath ] ->
        File.WriteAllText(outPath, dumpWorld ())
        printfn "world -> %s" outPath
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
