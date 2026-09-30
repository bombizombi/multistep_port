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
    // JS Number.toString(): lowercase exponent separator (byte-level parity
    // for the save blob; JSON parses both cases but orig emits "e")
    if Double.IsNaN v || Double.IsInfinity v then "null" else (string v).Replace("E", "e")

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
      cycleYear: int
      cryptoPrice: float
      festivalDays: int }

type BldSnap = string * (int * int * bool * bool * int)
type JobSnap = string * int * bool
type CraftSnap = string * bool * float * float
type RelSnap = string * (int * int * bool * bool)
type RaceSnap = string * (bool * int * float * float)
type PolSnap = string * (bool * bool)

type SnapTuple =
    int * (string * (float * float * bool * float)) list * int * CalJson
        * BldSnap list * JobSnap list * CraftSnap list
        * string list * string list
        * PolSnap list * string option list * int * (string * float) list
        * RelSnap list * RaceSnap list * float * float * int * float
        * (string * float) list * (string * float) list
        * (string * (bool * bool)) list * (string * bool) list
        * (string * (bool * bool * bool * bool * int)) list
        * (string * (int * int * bool)) list
        * ((string * float) list * int * int)
        * (string * string * string * float * int * int * int * int * float * string option * int) list
        * (float * float * int * bool
           * (string * (int * int * float * int * bool option)) list
           * (string * (int * int)) list)
        * ((string * (int * int * bool)) list * string option)
        * int * float * float
        * string // spaceSnap (space section JSON, formatted at checkpoint time)

type ExecResult =
    { Snapshots: SnapTuple list
      ActionLog: (int * string * string list * ResKind) list
      ResSave: (string * float * bool) list option }

let parseSpec (s: string) : (string * float) list =
    s.Split(',')
    |> Array.map (fun p ->
        let parts = p.Split(':')
        (parts.[0], float parts.[1]))
    |> Array.toList

// --- game-13 load half: save-blob parsing ------------------------------------
// orig _parseLSSaveData: raw JSON when the blob starts with '{', else
// decompressLZData (base64 first, UTF-16 fallback), then JSON.parse.

type JsValue =
    | JNull
    | JBool of bool
    | JNum of float
    | JStr of string
    | JArr of JsValue list
    | JObj of (string * JsValue) list

let rec private jsOfElement (e: System.Text.Json.JsonElement) : JsValue =
    match e.ValueKind with
    | System.Text.Json.JsonValueKind.Null -> JNull
    | System.Text.Json.JsonValueKind.True -> JBool true
    | System.Text.Json.JsonValueKind.False -> JBool false
    | System.Text.Json.JsonValueKind.Number -> JNum (e.GetDouble())
    | System.Text.Json.JsonValueKind.String -> JStr (e.GetString())
    | System.Text.Json.JsonValueKind.Array -> JArr [ for x in e.EnumerateArray() -> jsOfElement x ]
    | _ -> JObj [ for p in e.EnumerateObject() -> (p.Name, jsOfElement p.Value) ]

let parseSaveBlob (blob: string) : JsValue =
    let raw =
        if blob.Length > 0 && blob.[0] = '{' then Some blob
        else
            let b64 = Game.LzString.decompressFromBase64 blob
            let utf16 = Game.LzString.decompressFromUTF16 blob
            if b64.IsSome && b64.Value.Length > 0 && b64.Value.[0] = '{' then b64
            else utf16
    match raw with
    | Some s -> jsOfElement ((System.Text.Json.JsonDocument.Parse s).RootElement.Clone())
    | None -> failwith "unable to parse save blob"

let private jget (kvs: (string * JsValue) list) (name: string) : JsValue option =
    kvs |> List.tryFind (fun (k, _) -> k = name) |> Option.map snd
let private jstrF (v: JsValue option) : string option = match v with Some (JStr s) -> Some s | _ -> None
let private jnumF (v: JsValue option) : float option = match v with Some (JNum f) -> Some f | _ -> None
let private jboolF (v: JsValue option) : bool option = match v with Some (JBool b) -> Some b | _ -> None

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
    // prestige-03 + stats-03 + achievements-03 pools; undo runtime (game-19)
    let mutable ppool = Game.Prestige.init ()
    let mutable stpool = Game.Stats.init ()
    let mutable apool = Game.Achievements.init ()
    let mutable undoChange: Game.Types.UndoChange option = None
    let mutable achPhase = 0
    // village map fauna slots (RNG skeleton; orig biome.fauna arrays)
    let mutable mapFauna = Game.Catalog.World.biomeDefs |> List.map (fun _ -> false)
    // challenges-01 + time-01/02 + void-01 pools; game-20 winter catnip cache
    let mutable cpool = Game.Challenges.init ()
    // game.js L2343: the game starts in Iron Will; housing flips it off
    let mutable ironWill = true
    let mutable tpool = Game.Time.init ()
    let mutable voidp = Game.Time.initVoid ()
    let mutable winterCatnipPerTick = 0.0
    let mutable winterPhase = 0
    // space-05 pool
    let mutable spacep = Game.Space.init ()

    // steamworks.jammed (buildings-NN seam): set by factory automation, cleared
    // onNewYear; gates the per-tick automation action
    let mutable steamworksJammed = false
    // LCstorage["com.nuclearunicorn.kittengame.savedata"] equivalent (game-13)
    let mutable lcStorageSave = ""
    let mutable ticksBeforeSave = 400 // orig game.js L2296 (80s @ 5tps)
    let mutable currentSaveIsBroken = false // game.currentSaveIsBroken (load.js L3108 catch)
    // console.filters["craft"].unlocked — set by the first craftAll msg
    // (core.js L537); ["hunt"] unlocks on every hunt success msg
    let mutable craftFilterUnlocked = false
    let mutable huntFilterUnlocked = false
    // classes.reserveMan (challenges-10): reserveResources / reserveKittens /
    // reserveCryochambers — populated by applyPending's reset path
    let mutable reserveResources: Map<string, float> = Map.empty
    let mutable reserveKittens: Game.Managers.Kitten list = []
    let mutable reserveCryochambers = 0
    // meta.priceRules dynamic flags (challenge calculate side effects)
    let mutable priceRulesExtra: Set<string> = Set.empty
    let pctx () : Game.Buildings.PricingContext =
        { PriceRules = Game.Buildings.freshPricing.PriceRules + priceRulesExtra
          UnicornTearsActive = Game.Challenges.isActive cpool "unicornTears"
          BlackSkyActive = Game.Challenges.isActive cpool "blackSky"
          PacifismActive = Game.Challenges.isActive cpool "pacifism"
          PostApocalypseActive = Game.Challenges.isActive cpool "postApocalypse"
          PacifismOn = cpool.Challenges.["pacifism"].On
          UsedCryochambers = tpool.VSUs.["usedCryochambers"].Val
          IronWill = ironWill
          PollutionLevel = 0.0 }
    // policy calculateEffects inputs (js/science.js)
    let scienceCalcCtx () : Game.Managers.PolicyCalcCtx =
        { IronWill = ironWill
          NagaEmbassies = dp.Races.["nagas"].EmbassyLevel
          SpiderEmbassies = dp.Races.["spiders"].EmbassyLevel
          CycleYear = calendar.CycleYear
          PactsAvailable = Game.Effects.getEffect cache "pactsAvailable"
          FracturedOn = (match rpool.Pacts |> Map.tryFind "fractured" with Some p -> p.On | None -> 0)
          UncappedHousing = 0 } // authocracy population scan: seam (never researched in scenarios)
    // evaluateLocks vetoes for non-relation policies (game.js L6070 skips
    // unlock entries whose evaluateLocks returns false)
    let techResearched (n: string) = (match spool.Techs |> Map.tryFind n with Some x -> x.Researched | None -> false)
    let policyResearched (n: string) = (match spool.Policies |> Map.tryFind n with Some x -> x.Researched | None -> false)
    let bldVal (n: string) = (match Game.Buildings.get bpool n with Some b -> b.Val | None -> 0)
    let policyVeto (name: string) : bool =
        match name with
        | "liberalism" -> not ((policyResearched "monarchy" || policyResearched "republic") && bldVal "factory" > 0)
        | "communism" -> not ((policyResearched "republic" || policyResearched "authocracy") && bldVal "factory" > 0)
        | "fascism" -> not ((policyResearched "monarchy" || policyResearched "authocracy") && bldVal "factory" > 0)
        | "scientificCommunism" -> not (bldVal "workshop" < 2 && bldVal "factory" < 1 && policyResearched "socialism")
        | "knowledgeSharing" | "culturalExchange" -> not (techResearched "diplomacy" && techResearched "astronomy")
        | "bigStickPolicy" -> not (policyResearched "isolationism" && techResearched "astronomy" && not (Game.Challenges.isActive cpool "pacifism"))
        | "cityOnAHill" -> not (policyResearched "isolationism" && techResearched "astronomy")
        | "outerSpaceTreaty" -> not (bldVal "sattelite" > 0)
        | "militarizeSpace" -> not (bldVal "sattelite" > 0 && not (Game.Challenges.isActive cpool "pacifism"))
        | "sustainability" | "fullIndustrialization" -> not ((policyResearched "stripMining" || policyResearched "clearCutting") && techResearched "industrialization")
        | "conservation" | "openWoodlands" -> not (policyResearched "environmentalism" && techResearched "ecology")
        | "siphoning" | "feedingFrenzy" | "upfrontPayment" ->
            not ((match rpool.TUs |> Map.tryFind "mausoleum" with Some m -> m.Val | None -> 0) > 0
                 && (match rpool.ZUs |> Map.tryFind "marker" with Some m -> m.Val | None -> 0) > 0)
        | _ -> false
    let chronoforgeResearched () =
        match wpool.Upgrades |> Map.tryFind "chronoforge" with
        | Some u -> u.Researched
        | None -> false
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

    let getResValue (name: string) : float =
        (get pool name |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0)
    let crctx () : Game.Managers.CraftRatioContext =
        { IronWill = ironWill
          LeaderTrait = Game.Managers.leaderTrait vpool
          BurnedParagonRatio = Game.Prestige.getBurnedParagonRatio (getResValue "burnedParagon")
          MonarchyResearched = (match spool.Policies |> Map.tryFind "monarchy" with Some p -> p.Researched | None -> false)
          BldVal = fun n -> (Game.Buildings.get bpool n |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) }

    let traditionResearched () =
        match spool.Policies |> Map.tryFind "tradition" with
        | Some p -> p.Researched
        | None -> false
    let corruptionCtx () : Game.Religion.CorruptionContext =
        { GetEffect = Game.Effects.getEffect cache
          Alicorns = getResValue "alicorn"
          Sorrow = getResValue "sorrow"
          FeedingFrenzyResearched =
            (match spool.Policies |> Map.tryFind "feedingFrenzy" with
             | Some p -> p.Researched
             | None -> false) }
    let astronomyResearched () =
        match spool.Techs |> Map.tryFind "astronomy" with
        | Some t -> t.Researched
        | None -> false
    let miningResearched () =
        match spool.Techs |> Map.tryFind "mining" with
        | Some t -> t.Researched
        | None -> false
    let libraryOn () =
        (match Game.Buildings.get bpool "library" with Some b -> b.On | None -> 0) > 0
    let dctx () : Game.Diplomacy.DiplomacyContext =
        { GetEffect = Game.Effects.getEffect cache
          GetResValue = getResValue
          GetResMax = fun n -> (get pool n |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
          IsResUnlocked = fun n -> (get pool n |> Option.map (fun r -> r.Unlocked) |> Option.defaultValue false)
          Season = Game.Calendar.seasons.[calendar.Season].Name
          NuclearFissionResearched = false
          IronWill = false }
    let registerUndo (events: Game.Types.UndoEvent list) : unit =
        undoChange <- Some({ Ttl = 100; Events = events }) // DEFAULT_TTL 20 x tps 5
    /// orig observeHandler (calendar.js L249-286): science + starcharts
    let doObserveHandler () : unit =
        calendar <- { calendar with ObserveRemainingTime = 0 }
        stpool <- Game.Stats.bumpStat "eventsObserved" 1.0 stpool
        let celestialBonus =
            (match wpool.Upgrades |> Map.tryFind "celestialMechanics" with
             | Some u when u.Researched -> 1.2 // ironWill 1.6 seam
             | _ -> 1.0)
        let setiSilent =
            (match wpool.Upgrades |> Map.tryFind "seti" with
             | Some u -> u.Researched
             | None -> false)
        let mutable sciBonus = 25.0 * celestialBonus * (1.0 + Game.Effects.getEffect cache "scienceRatio")
        if astronomyResearched () then
            let eventChance = (0.0025 + Game.Effects.getEffect cache "starEventChance") * 1.0
            let starcharts =
                if eventChance <= 1.0 then 1.0
                else
                    floor eventChance
                    + (let extra = rngDraws <- rngDraws + 1; rand ()
                       if extra < (eventChance - floor eventChance) * 10000.0 then 1.0 else 0.0)
            sciBonus <- sciBonus * starcharts
            let pool1, _ = Game.Resources.addResEvent calendarDay "science" sciBonus pool
            let pool2, _ = Game.Resources.addResEvent calendarDay "starchart" starcharts pool1
            pool <- pool2
        else
            let pool1, gained = Game.Resources.addResEvent calendarDay "science" sciBonus pool
            pool <- pool1
            let _ = gained
            ()
    let capCtx () : CapContext =
        { GetEffect = Game.Effects.getEffect cache
          ParagonStorageRatio =
            Game.Prestige.getParagonStorageRatio (Game.Effects.getEffect cache) (getResValue "paragon") (getResValue "burnedParagon")
          CMBRBonus = 0.0
          UnicornTearsActive = false
          SilosResearched = false
          KarmaZebras = 0 }

    let emptyGroup () : Game.Effects.ManagerGroup = { Base = Map.empty; Items = [] }
    let religionGroup () = Game.Religion.religionGroup rpool
    let challengesGroup () = emptyGroup ()
    let prestigeGroup () = Game.Prestige.prestigeGroup ppool
    let spacepRef = ref (Game.Space.init ()) // late-bound: synced in refreshCache/gtick
    let mutable queueSourcesUnlocked = set [ "buildings" ] // time.queue sources (js/time.js); "buildings" starts unlocked
    let energyChallengeResearched () = (match cpool.Challenges |> Map.tryFind "energy" with Some c -> c.Researched | None -> false)
    let energyChallengeActive () = (match cpool.Challenges |> Map.tryFind "energy" with Some c -> c.Active | None -> false)
    let spaceGroup () =
        Game.Space.spaceGroup pool.EnergyCons pool.EnergyProd
            (Game.Resources.getEnergyDelta (energyChallengeResearched ()) (energyChallengeActive ()) pool.EnergyProd pool.EnergyCons)
            !spacepRef
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
        { Base = Game.Managers.workshopEffectsBase cache getResValue false
          Items =
            wpool.UpgradeOrder
            |> List.choose (fun n ->
                match wpool.Upgrades |> Map.tryFind n with
                | Some u when u.Researched -> Some(u.Def.Effects, (fun _ v -> v))
                | _ -> None) }
    let scienceGroup () = Game.Managers.scienceGroup spool

    let challengesGroup () =
        Game.Challenges.challengesGroup cpool (Game.Effects.getEffect cache)
            (float (Game.Buildings.get bpool "tradepost" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0))
    let cfuGroup () = Game.Time.timeGroup tpool (chronoforgeResearched ())
    let allGroups () =
        [ workshopGroup (); religionGroup (); bldGroup (); challengesGroup (); prestigeGroup (); spaceGroup (); cfuGroup (); timeGroup (); villageGroup (); scienceGroup () ]

    // calCtx -> refreshCache -> prodCtx -> calCtx is a genuine tie-the-knot
    // cycle (the daily refresh recomputes production with the live calendar)
    let rec calCtx () : Game.Calendar.CalendarContext =
        { Game.Calendar.CalendarContext.GetEffect = Game.Effects.getEffect cache
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
          OnNewDayRefresh = fun st -> calendar <- st; refreshCache (); st
          // observeTimeout (calendar.js L288-297): rand(100) vs autoChance(0)
          OnObserveTimeout =
            fun st ->
                let roll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 100.0
                if float roll <= 0.0 then
                    doObserveHandler ()
                st
          TimeAccelerationRatio = (if tpool.IsAccelerated then 0.5 else 0.0)
          OnFlux = fun delta -> tpool <- { tpool with Flux = tpool.Flux + delta }
          // calendar-08 steamworks autumn unjam (js/calendar.js L951-953)
          OnNewSeasonTail =
            fun st ->
                if st.Season = 2
                   && (match wpool.Upgrades |> Map.tryFind "advancedAutomation" with Some u -> u.Researched | None -> false) then
                    steamworksJammed <- false
                st
          // orig onNewDay tail: diplomacy.onNewDay (scribes + leviathans) then
          // adjustCryptoPrice (antimatter-gated 2-draw walk) — calendar.js L725-728
          OnNewDayTail =
            fun stIn ->
                let mutable st = stIn
                let drand () = rngDraws <- rngDraws + 1; rand ()
                // calendar-05: void during paradox (getVoidQuantity = 1 draw);
                // relic accrual (relicPerDay effect 0 — no draw)
                if st.Day < 0.0 then
                    let voidQty = Game.Resources.getVoidQuantity (capCtx ()) drand pool
                    let pool1, _ = Game.Resources.addResEvent calendarDay "void" voidQty pool
                    pool <- pool1
                else
                    let relicPerDay = Game.Effects.getEffect cache "relicPerDay"
                    let pool1, _ = Game.Resources.addResPerTick calendarDay "relic" relicPerDay pool
                    pool <- pool1
                // calendar-05: pacts daily (necrocornConsumptionDays(1) +
                // payDebt refresh + fracture punishment)
                let rpool1, pool2 = Game.Religion.pactsOnNewDay (corruptionCtx ()) pool rpool
                rpool <- rpool1
                pool <- pool2
                // calendar-05: astro event roll (gate: library.on or astronomy)
                if libraryOn () || astronomyResearched () then
                    let chanceRatio = 1.0 // chronomancy perk + timeRatio seams
                    let eventChance = (0.0025 + Game.Effects.getEffect cache "starEventChance") * chanceRatio
                    let roll = Game.Math.uniformRandomInteger drand 0.0 10000.0
                    if float roll < eventChance * 10000.0 then
                        if st.ObserveRemainingTime > 0 then
                            // observeTimeout: rand(100) vs autoChance (0 fresh)
                            let autoRoll = Game.Math.uniformRandomInteger drand 0.0 100.0
                            if float autoRoll <= 0.0 then
                                calendar <- { calendar with ObserveRemainingTime = 0 }
                                st <- { st with ObserveRemainingTime = 0 }
                                doObserveHandler ()
                        else
                            let iwSeconds = if ironWill then 600 else 300
                            st <- { st with ObserveRemainingTime = iwSeconds }
                            calendar <- { calendar with ObserveRemainingTime = iwSeconds }
                // calendar-06: meteor (roll always; effect gated on mining)
                let meteorRoll = Game.Math.uniformRandomInteger drand 0.0 10000.0
                let iwChance = if ironWill then 40.0 else 0.0
                if float meteorRoll < (10.0 * 1.0 + iwChance) && miningResearched () then
                    let mineralsAmt = 50.0 + 25.0 * Game.Effects.getEffect cache "mineralsRatio"
                    let pool3, _ = Game.Resources.addResEvent calendarDay "minerals" mineralsAmt pool
                    pool <- pool3
                // calendar-06: unicorn rolls — the ROLLS sit inside their gates
                // (pacifism / ironWill), so they draw only when a gate is open
                if Game.Challenges.isActive cpool "pacifism" then
                    let uniRoll1 = Game.Math.uniformRandomInteger drand 0.0 100000.0
                    let unicorns = getResValue "unicorns"
                    if float uniRoll1 <= 17.0 && unicorns < 2.0 && (match spool.Techs |> Map.tryFind "animal" with Some t -> t.Researched | None -> false) then
                        let pool3, _ = Game.Resources.addResEvent calendarDay "unicorns" 1.0 pool
                        pool <- pool3
                if ironWill then
                    let uniRoll2 = Game.Math.uniformRandomInteger drand 0.0 100000.0
                    let unicorns = getResValue "unicorns"
                    if float uniRoll2 <= 17.0 && unicorns < 2.0 && (match spool.Techs |> Map.tryFind "archery" with Some t -> t.Researched | None -> false) then
                        let pool3, _ = Game.Resources.addResEvent calendarDay "unicorns" 1.0 pool
                        pool <- pool3
                    // zebra emissary (IW): first zebra free, then 0.5%/day
                    let zebrasV = getResValue "zebras"
                    let zebrasMax = (get pool "zebras" |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                    if zebrasV = 0.0 then
                        if (match spool.Techs |> Map.tryFind "archery" with Some t -> t.Researched | None -> false) then
                            let pool3, _ = Game.Resources.addResEvent calendarDay "zebras" 1.0 pool
                            pool <- pool3
                    elif zebrasV < zebrasMax then
                        let zRoll = Game.Math.uniformRandomInteger drand 0.0 100000.0
                        if float zRoll <= 500.0 then
                            let pool3, _ = Game.Resources.addResEvent calendarDay "zebras" 1.0 pool
                            pool <- pool3
                else
                    // non-IW: hunters depart down to the zTreshold (no draws)
                    let zebrasV = getResValue "zebras"
                    if zebrasV > 0.0 then
                        let res = pool.ByName["zebras"]
                        pool <- { pool with ByName = pool.ByName |> Map.add "zebras" { res with Value = 0.0 } }
                // calendar-06: rift (unicorns)
                let riftRoll = Game.Math.uniformRandomInteger drand 0.0 10000.0
                let riftChance = Game.Effects.getEffect cache "riftChance"
                if float riftRoll < riftChance * 10000.0 then
                    let unicornBonus = 500.0 * (1.0 + Game.Effects.getEffect cache "unicornsRatioReligion" * 0.1)
                    let pool3, _ = Game.Resources.addResEvent calendarDay "unicorns" unicornBonus pool
                    pool <- pool3
                // calendar-06: alicorn
                let aliRoll = Game.Math.uniformRandomInteger drand 0.0 100000.0
                let aliChance =
                    Game.Effects.getEffect cache "alicornChance"
                    * (1.0 + Game.Math.getLimitedDR (Game.Effects.getEffect cache "alicornPerTickRatio") 1.2)
                if float aliRoll < aliChance * 100000.0 then
                    let pool3, gained = Game.Resources.addResEvent calendarDay "alicorn" 1.0 pool
                    pool <- pool3
                    if gained > 0.0 then
                        refreshCache () // upgrade fan-out (skyPalace etc.)
                // calendar-06: ivory meteors (rand(1500) ONLY on hit)
                let ivMeteorRoll = Game.Math.uniformRandomInteger drand 0.0 10000.0
                let meteorChance = Game.Effects.getEffect cache "ivoryMeteorChance"
                if float ivMeteorRoll < meteorChance * 10000.0 then
                    let ivoryRoll = Game.Math.uniformRandomInteger drand 0.0 1500.0
                    let ivory = 250.0 + float ivoryRoll * (1.0 + Game.Effects.getEffect cache "ivoryMeteorRatio")
                    let pool3, _ = Game.Resources.addResEvent calendarDay "ivory" ivory pool
                    pool <- pool3
                // calendar-08: unicornTears overcap enforcement (js/calendar.js
                // L698-725): unicorns wander away in integer amounts (+0.00075
                // tMythril per lost unicorn); tears spill exactly and evaporate
                // into cathPollution; alicorns ascend in integer amounts
                if Game.Challenges.isActive cpool "unicornTears" then
                    let maxValue = Game.Effects.getEffect cache "unicornsMax"
                    let value = getResValue "unicorns"
                    if value > maxValue && maxValue > 0.0 then
                        let lost = ceil (value - maxValue)
                        let pool3, _ = Game.Resources.addResEvent calendarDay "unicorns" (-lost) pool
                        pool <- pool3
                        let pool4, _ = Game.Resources.addResEvent calendarDay "tMythril" (lost * 0.00075) pool
                        pool <- pool4
                    let maxValueT = Game.Effects.getEffect cache "tearsMax"
                    let valueT = getResValue "tears"
                    if valueT > maxValueT && maxValueT > 0.0 then
                        let lost = valueT - maxValueT
                        let pool3, _ = Game.Resources.addResEvent calendarDay "tears" (-lost) pool
                        pool <- pool3
                    // (tears evaporation → cathPollution: buildings-10 seam)
                    let maxValueA = Game.Effects.getEffect cache "alicornMax"
                    let valueA = getResValue "alicorn"
                    if valueA > maxValueA && maxValueA > 0.0 then
                        let lost = ceil (valueA - maxValueA)
                        let pool3, _ = Game.Resources.addResEvent calendarDay "alicorn" (-lost) pool
                        pool <- pool3
                // calendar-07 tail: diplomacy.onNewDay + crypto walk
                let antimatter =
                    match spool.Techs |> Map.tryFind "antimatter" with
                    | Some t -> t.Researched
                    | None -> false
                let scribes =
                    match spool.Policies |> Map.tryFind "sharkRelationsScribes" with
                    | Some p -> p.Researched
                    | None -> false
                let trueYear = (st.Day / 100.0 + float st.Season) / 1.0 + st.Year
                dp <- Game.Diplomacy.onNewDay dp (st.Year + trueYear) scribes
                if antimatter then
                    // cryptoPrice += cryptoPrice * (1 - (rand(10) % 3)) * rand() / 40000
                    let r10 = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 10.0
                    let rf = rngDraws <- rngDraws + 1; rand ()
                    let mutable price = st.CryptoPrice
                    price <- price + price * (1.0 - (r10 % 3.0)) * rf / 40000.0
                    if price > 1100.0 then
                        // correctCryptoPrice: ×(0.7 + 0.1 rand)
                        let rc = rngDraws <- rngDraws + 1; rand ()
                        price <- price * (0.7 + 0.1 * rc)
                    { st with CryptoPrice = price }
                else st }

    and prodCtx () : Game.Production.ProductionContext =
        let fresh = Game.Production.freshProductionContext cache calendar (calCtx ())
        { fresh with
            ParagonProductionRatio =
              Game.Prestige.getParagonProductionRatio (Game.Effects.getEffect cache) (getResValue "paragon") (getResValue "burnedParagon")
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
        spacepRef := spacep
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


    // --- time-05/07/09: CFU behaviors + shatter/redshift orchestration -------------

    and timeCalcCtx () : Game.Time.TimeCalcContext =
        { GetEffect = Game.Effects.getEffect cache
          Years1000On = cpool.Challenges.["1000Years"].On
          BlazarVal = (Game.Religion.getTU rpool "blazar").Val
          YearsPerCycle = List.length Game.Calendar.cycleYearColors }

    // calcResourcePerTick("faith") for Order-of-the-Void conversion
    and faithPerTickNow () : float =
        Game.Production.calcResourcePerTick (prodCtx ()) pool "faith"

    // orig religion.triggerOrderOfTheVoid — voidOrder perk gate + live reads
    and triggerOotV (numberOfTicks: float) : unit =
        let voidOrder =
            match ppool.Perks |> Map.tryFind "voidOrder" with
            | Some p -> p.Researched
            | None -> false
        let rp' =
            Game.Religion.triggerOrderOfTheVoid
                voidOrder (Game.Effects.getEffect cache "voidResonance") (faithPerTickNow ()) numberOfTicks rpool
        rpool <- rp'

    /// orig calendar.onNewYear (js/calendar.js L1058-1124) — the per-shattered-
    /// year slice. The per-tick rollover path (gtick tail) covers the fresh
    /// subset; this is the full sequence shatter needs.
    and calendarOnNewYear () : unit =
        // totalYears++ with floor at year
        let ty = Game.Stats.getStat stpool "totalYears"
        let ty' = if ty + 1.0 < calendar.Year then calendar.Year else ty + 1.0
        stpool <- Game.Stats.setStat "totalYears" ty' stpool
        // darkFuture impedance unlock: year >= 40000 seam (space/dark-future not ported)
        if calendar.Year >= 40000.0 then
            let imp = tpool.CFUs.["temporalImpedance"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalImpedance" { imp with Unlocked = true } }
        // steamworks unjam (jammed by factory automation)
        steamworksJammed <- false
        if calendar.Year % 1000.0 = 0.0 then
            let poolY, _ = Game.Resources.addResEvent calendarDay "paragon" 1.0 pool
            pool <- poolY
            stpool <- Game.Stats.bumpStat "totalParagon" 1.0 stpool
            // pactsMilleniumKarmaKittens: karma seam (pactsAvailable 0 at this slice)
            ()
        let pyramidVal = float (Game.Religion.getZU rpool "blackPyramid").Val
        let markerVal = float (Game.Religion.getZU rpool "marker").Val
        if pyramidVal > 0.0 then
            let elderRoll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 1000.0
            if float elderRoll < 35.0 * pyramidVal * (1.0 + 0.1 * markerVal) then
                dp <- Game.Diplomacy.unlockElders dp 400.0
        if dp.Races.["leviathans"].Unlocked then
            let c = cpool.Challenges.["blackSky"]
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "blackSky" { c with Unlocked = true } }
        // cycle bookkeeping (yearsPerCycle = 5 colors, cyclesPerEra = 10)
        let cycleYear' = calendar.CycleYear + 1
        if cycleYear' >= List.length Game.Calendar.cycleYearColors then
            calendar <- { calendar with CycleYear = 0 }
            let cycle' = calendar.Cycle + 1
            calendar <- { calendar with Cycle = if cycle' >= List.length Game.Calendar.cycleNames then 0 else cycle' }
        else
            calendar <- { calendar with CycleYear = cycleYear' }
        // upgrade({spaceBuilding}) fan-out: space-NN seam (no planets ported)
        // antimatter yearly production: energyProd/Cons seam is balanced-true,
        // but antimatterProduction is 0 without space — addRes(0) no-op kept for shape
        let antimatterYearProd =
            Game.Effects.getEffect cache "antimatterProduction"
            * (1.0 + Game.Effects.getEffect cache "antimatterPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolA, _ = Game.Resources.addResEvent calendarDay "antimatter" antimatterYearProd pool
        pool <- poolA
        let yearFlux =
            Game.Effects.getEffect cache "temporalFluxProduction"
            * (1.0 + Game.Effects.getEffect cache "temporalFluxPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolF, _ = Game.Resources.addResEvent calendarDay "temporalFlux" yearFlux pool
        pool <- poolF
        // aiCore apocalypse msg: aiLevel seam (0 at this slice)
        ()

    /// time.shatter (time.js L663-737): skip amt years, replaying production at
    /// shatterTCGain and walking the calendar's onNewYear per year.
    and shatterCore (amtIn: int) : unit =
        let amt = if amtIn = 0 then 1 else amtIn
        let routeSpeed =
            let rs = Game.Effects.getEffect cache "routeSpeed"
            if rs = 0.0 then 1.0 else rs // JS falsy `|| 1`
        let _ = routeSpeed // space ETA seam: no planets unlocked in this slice
        let shatterTCGain =
            Game.Effects.getEffect cache "shatterTCGain" * (1.0 + Game.Effects.getEffect cache "rrRatio")
        let triggersOotV = Game.Effects.getEffect cache "voidResonance" > 0.0
        let seasonsCount = float (List.length Game.Calendar.seasons)
        let daysPerYear = Game.Calendar.daysPerSeason * seasonsCount
        let remainingDaysInFirstYear =
            Game.Calendar.daysPerSeason * (seasonsCount - float calendar.Season) - calendar.Day
        calendar <- { calendar with Day = 0.0; Season = 0 }
        for i in 1..amt do
            let remDaysInCurrentYear = if i = 1 then remainingDaysInFirstYear else daysPerYear
            let remTicks = remDaysInCurrentYear * Game.Calendar.ticksPerDay
            if shatterTCGain > 0.0 then
                // inflate every resource by a year of production (uncapped),
                // run the chrono-engineers, then clamp back to the recorded limits
                let limits =
                    pool.Order
                    |> List.choose (fun n ->
                        match get pool n with
                        | Some r ->
                            let lim = max r.Value (if r.MaxValue <> 0.0 then r.MaxValue else System.Double.MaxValue)
                            // getResourcePerTick(name, true): perTickCached + convertion (0 here)
                            let pool1, _ =
                                Game.Resources.addRes calendarDay (r.PerTickCached * remTicks * shatterTCGain) false true n pool
                            pool <- pool1
                            Some(n, lim)
                        | None -> None)
                if (match wpool.Upgrades |> Map.tryFind "chronoEngineers" with Some u -> u.Researched | None -> false) then
                    let pool1, wp1, craftsDone =
                        Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) (crctx ()) getResValue
                            (getResProductionCached ()) false (remTicks * shatterTCGain) pool wpool
                    pool <- pool1
                    wpool <- wp1
                    if craftsDone > 0.0 then
                        stpool <- Game.Stats.bumpStat "totalCrafts" craftsDone stpool
                        stpool <- Game.Stats.bumpStatCurrent "totalCrafts" craftsDone stpool
                pool <-
                    { pool with
                        ByName =
                            pool.ByName
                            |> Map.map (fun n res ->
                                match limits |> List.tryFind (fun (ln, _) -> ln = n) with
                                | Some(_, lim) -> { res with Value = min res.Value lim }
                                | None -> res) }
                // cathPollution FF: pollution sources are a buildings-NN seam
                // (cathPollution 0, no calciners — stays 0 through the FF math)
                if triggersOotV then triggerOotV remTicks
            calendar <- { calendar with Year = calendar.Year + 1.0 }
            calendarOnNewYear ()
        // time.flux += amt - 1 + remainingDaysInFirstYear / daysPerYear (L725)
        tpool <- { tpool with Flux = tpool.Flux + (float (amt - 1) + remainingDaysInFirstYear / daysPerYear) } // JS assoc: += (A + B)
        // challenges 1000Years unlock + completion check
        let c1000 = cpool.Challenges.["1000Years"]
        cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "1000Years" { c1000 with Unlocked = true } }
        if c1000.Active && calendar.Year >= 1000.0 then
            researchChallengeFull "1000Years"
        refreshCache () // upgrade({buildings: ["pasture"]}) season-effect fan-out
        // queue.update(): QUEUE flag off (time-14 seam)

    /// calendar.calculateMilleniumProduction (L967-973): paragon + karma seam.
    and calculateMilleniumProduction (milleniums: float) : unit =
        // DARK_PARACOSM feature flag seam (milleninumParagon effect — flag off)
        let poolP, _ = Game.Resources.addResEvent calendarDay "paragon" milleniums pool
        pool <- poolP
        stpool <- Game.Stats.bumpStat "totalParagon" milleniums stpool
        () // pactsMilleniumKarmaKittens: karma seam (pactsAvailable 0)

    /// calendar.getMilleniaChanged (L964-966)
    and getMilleniaChanged (startYear: float) (endYear: float) : float =
        max 0.0 ((floor (endYear / 1000.0) * 1000.0 - floor (startYear / 1000.0) * 1000.0) / 1000.0)

    /// calendar.onNewYears (L975-1053) — the batch-years variant used by the
    /// bulk shatters. Unlike onNewYear, the elder roll draws rand(1000) ONCE
    /// with a years-multiplied threshold, cycles advance by whole years, and
    /// the tail runs the policy-hack refresh (authocracy + 2 relation policies).
    and calendarOnNewYears (years: float) (updateUI: bool) (milleniumChangeCalculated: bool) : unit =
        let ty = Game.Stats.getStat stpool "totalYears" + years
        stpool <- Game.Stats.setStat "totalYears" (if ty < calendar.Year then calendar.Year else ty) stpool
        if calendar.Year >= 40000.0 then
            let imp = tpool.CFUs.["temporalImpedance"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalImpedance" { imp with Unlocked = true } }
        steamworksJammed <- false
        if milleniumChangeCalculated then
            calculateMilleniumProduction (getMilleniaChanged (calendar.Year - years) calendar.Year)
        let pyramidVal = float (Game.Religion.getZU rpool "blackPyramid").Val
        let markerVal = float (Game.Religion.getZU rpool "marker").Val
        if pyramidVal > 0.0 then
            let elderRoll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 1000.0
            if float elderRoll < 35.0 * pyramidVal * years * (1.0 + 0.1 * markerVal) then
                dp <- Game.Diplomacy.unlockElders dp 400.0
        if dp.Races.["leviathans"].Unlocked then
            let c = cpool.Challenges.["blackSky"]
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "blackSky" { c with Unlocked = true } }
        let cycleYear' = calendar.CycleYear + int years
        if cycleYear' >= List.length Game.Calendar.cycleYearColors then
            let cyclesChange = cycleYear' / List.length Game.Calendar.cycleYearColors
            let newCycleYear = cycleYear' % List.length Game.Calendar.cycleYearColors
            calendar <- { calendar with CycleYear = newCycleYear }
            let cyclesPerEra = List.length Game.Calendar.cycleNames
            calendar <-
                { calendar with
                    Cycle =
                      if cyclesChange + calendar.Cycle >= cyclesPerEra then
                          (cyclesChange + calendar.Cycle) % cyclesPerEra
                      else calendar.Cycle + cyclesChange }
        else
            calendar <- { calendar with CycleYear = cycleYear' }
        // upgrade({spaceBuilding}) fan-out: space-NN seam
        let antimatterYearProd =
            Game.Effects.getEffect cache "antimatterProduction"
            * (1.0 + Game.Effects.getEffect cache "antimatterPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolA, _ = Game.Resources.addResEvent calendarDay "antimatter" (antimatterYearProd * years) pool
        pool <- poolA
        let yearFlux =
            Game.Effects.getEffect cache "temporalFluxProduction"
            * (1.0 + Game.Effects.getEffect cache "temporalFluxPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolF, _ = Game.Resources.addResEvent calendarDay "temporalFlux" (yearFlux * years) pool
        pool <- poolF
        // aiCore apocalypse msg: aiLevel seam (0 at this slice)
        refreshCache () // upgrade({policies: [authocracy + 2 relation policies]})

    /// Shared shatterTCGain production replay (orig duplicates this block in
    /// all three variants). uncapped inflate → chronoEngineers → clamp.
    and shatterReplay (ticks: float) (gain: float) (ootv: bool) : unit =
        if gain > 0.0 then
            let limits =
                pool.Order
                |> List.choose (fun n ->
                    match get pool n with
                    | Some r ->
                        let lim = max r.Value (if r.MaxValue <> 0.0 then r.MaxValue else System.Double.MaxValue)
                        let pool1, _ =
                            Game.Resources.addRes calendarDay (r.PerTickCached * ticks * gain) false true n pool
                        pool <- pool1
                        Some(n, lim)
                    | None -> None)
            if (match wpool.Upgrades |> Map.tryFind "chronoEngineers" with Some u -> u.Researched | None -> false) then
                let pool1, wp1, craftsDone =
                    Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) (crctx ()) getResValue
                        (getResProductionCached ()) false (ticks * gain) pool wpool
                pool <- pool1
                wpool <- wp1
                if craftsDone > 0.0 then
                    stpool <- Game.Stats.bumpStat "totalCrafts" craftsDone stpool
                    stpool <- Game.Stats.bumpStatCurrent "totalCrafts" craftsDone stpool
            pool <-
                { pool with
                    ByName =
                        pool.ByName
                        |> Map.map (fun n res ->
                            match limits |> List.tryFind (fun (ln, _) -> ln = n) with
                            | Some(_, lim) -> { res with Value = min res.Value lim }
                            | None -> res) }
            // cathPollution FF: pollution seam (0 with no calciners)
            if ootv then triggerOotV ticks

    /// time.shatterInCycles (L750-828, deprecated) — cycle-at-a-time variant.
    and shatterCoreCycles (amtIn: int) : unit =
        let amt = if amtIn = 0 then 1 else amtIn
        let _routeSpeed = 1.0 // space ETA seam
        let shatterTCGain =
            Game.Effects.getEffect cache "shatterTCGain" * (1.0 + Game.Effects.getEffect cache "rrRatio")
        let triggersOotV = Game.Effects.getEffect cache "voidResonance" > 0.0
        let seasonsCount = float (List.length Game.Calendar.seasons)
        let daysPerYear = Game.Calendar.daysPerSeason * seasonsCount
        let yearsPerCycle = float (List.length Game.Calendar.cycleYearColors)
        let endYear = calendar.Year + float amt
        let remFirstSaved =
            Game.Calendar.daysPerSeason * (seasonsCount - float calendar.Season) - calendar.Day
        let mutable remFirst = remFirstSaved
        calendar <- { calendar with Day = 0.0; Season = 0 }
        let mutable maxYearsShattered = float amt
        while maxYearsShattered > 0.0 do
            let remYearsInCurrentCycle = min (yearsPerCycle - float calendar.CycleYear) maxYearsShattered
            let remDaysInCurrentCycle = (remYearsInCurrentCycle - 1.0) * daysPerYear + remFirst
            let remTicks = remDaysInCurrentCycle * Game.Calendar.ticksPerDay
            shatterReplay remTicks shatterTCGain triggersOotV
            calendar <- { calendar with Year = calendar.Year + remYearsInCurrentCycle }
            calendarOnNewYears remYearsInCurrentCycle (endYear = calendar.Year) false
            calculateMilleniumProduction (getMilleniaChanged (calendar.Year - remYearsInCurrentCycle) calendar.Year)
            maxYearsShattered <- maxYearsShattered - remYearsInCurrentCycle
            remFirst <- daysPerYear
        tpool <- { tpool with Flux = tpool.Flux + (float (amt - 1) + remFirstSaved / daysPerYear) }
        let c1000 = cpool.Challenges.["1000Years"]
        cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "1000Years" { c1000 with Unlocked = true } }
        if c1000.Active && calendar.Year >= 1000.0 then
            cpool <- Game.Challenges.researchChallenge "1000Years" cpool
            let pressM = tpool.CFUs.["temporalPress"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pressM with Unlocked = true } }
            calculateAllTime ()
        refreshCache () // pasture season-effect fan-out

    /// time.shatterInGroupCycles (L838-1018) — the testShatter=1 path.
    /// aiCore apocalypse destruction is an aiLevel seam (0) — variables kept
    /// for shape; cycles produce in 5-year onNewYears batches.
    and shatterCoreGroupCycles (amtIn: int) : unit =
        if amtIn <= 1 then shatterCore (max 1 amtIn)
        else
            let amt = amtIn
            let _routeSpeed = 1.0 // space ETA seam
            let shatterTCGain =
                Game.Effects.getEffect cache "shatterTCGain" * (1.0 + Game.Effects.getEffect cache "rrRatio")
            let triggersOotV = Game.Effects.getEffect cache "voidResonance" > 0.0
            let seasonsCount = float (List.length Game.Calendar.seasons)
            let daysPerYear = Game.Calendar.daysPerSeason * seasonsCount
            let yearsPerCycle = float (List.length Game.Calendar.cycleYearColors)
            let cyclesPerEra = List.length Game.Calendar.cycleNames
            let startYear = calendar.Year
            let endYear = calendar.Year + float amt
            let remFirstSaved =
                Game.Calendar.daysPerSeason * (seasonsCount - float calendar.Season) - calendar.Day
            let mutable remFirst = remFirstSaved
            calendar <- { calendar with Day = 0.0; Season = 0 }
            let aiApocalypseLevel = 0 // aiLevel seam
            let _aiDestructionMod = -min 1.0 (float aiApocalypseLevel * 0.01)
            // cycle-year distribution
            let remainingCyclesYears = Array.create 10 0.0
            let mutable maxYears = float amt
            if amt % 50 = 0 then
                for j in 0..9 do remainingCyclesYears.[j] <- float amt / 10.0
            else
                let wholeCycleYears = float (amt - amt % 50)
                for j in 0..9 do remainingCyclesYears.[j] <- wholeCycleYears / 10.0
                maxYears <- maxYears - wholeCycleYears
                let first = min (yearsPerCycle - float calendar.CycleYear) maxYears
                remainingCyclesYears.[calendar.Cycle] <- remainingCyclesYears.[calendar.Cycle] + first
                maxYears <- maxYears - first
                for j in 1 .. cyclesPerEra - 1 do
                    let take = min yearsPerCycle maxYears
                    remainingCyclesYears.[(calendar.Cycle + j) % 10] <- remainingCyclesYears.[(calendar.Cycle + j) % 10] + take
                    maxYears <- maxYears - take
            maxYears <- float amt
            let startingCycleNum = calendar.Cycle
            for cycleNum in 0 .. cyclesPerEra - 1 do
                let yearsInCurrentCycle = remainingCyclesYears.[(cycleNum + startingCycleNum) % 10]
                if yearsInCurrentCycle <> 0.0 then
                    let daysInCurrentCycle = (yearsInCurrentCycle - 1.0) * daysPerYear + remFirst
                    let ticksInCurrentCycle = daysInCurrentCycle * Game.Calendar.ticksPerDay
                    let ai = if yearsInCurrentCycle = 1.0 then 0 else aiApocalypseLevel
                    let _ = ai
                    shatterReplay ticksInCurrentCycle shatterTCGain triggersOotV
                    let step = min 5.0 maxYears
                    calendar <- { calendar with Year = calendar.Year + step }
                    calendarOnNewYears step (endYear = calendar.Year) false
                    maxYears <- maxYears - step
                    remFirst <- daysPerYear
            calendar <- { calendar with Year = calendar.Year + maxYears }
            calendarOnNewYears maxYears (endYear = calendar.Year) false
            calculateMilleniumProduction (getMilleniaChanged startYear calendar.Year)
            tpool <- { tpool with Flux = tpool.Flux + (float (amt - 1) + remFirstSaved / daysPerYear) }
            let c1000 = cpool.Challenges.["1000Years"]
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "1000Years" { c1000 with Unlocked = true } }
            if c1000.Active && calendar.Year >= 1000.0 then
                cpool <- Game.Challenges.researchChallenge "1000Years" cpool
                let pressM = tpool.CFUs.["temporalPress"]
                tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pressM with Unlocked = true } }
                calculateAllTime ()
            refreshCache () // pasture season-effect fan-out

    /// reserveMan.calculateReserveResources (L726-754): resStasisRatio share of
    /// persisted resources (sqrt for craftables without fluxCondensator; void
    /// floors; timeCrystal skipped; max-vs-existing).
    and calculateReserveResources () : unit =
        let saveRatio =
            if (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) > 0 then
                Game.Effects.getEffect cache "resStasisRatio"
            else 0.0
        if saveRatio <> 0.0 then
            let fluxCondensator =
                match wpool.Upgrades |> Map.tryFind "fluxCondensator" with Some u -> u.Researched | None -> false
            for n in pool.Order do
                if n <> "timeCrystal" then
                    match get pool n with
                    | Some r ->
                        let skip =
                            r.Def.Persists = Some false
                            || (r.Def.Craftable && n <> "wood" && not fluxCondensator)
                        if not skip then
                            let value =
                                if r.Def.Persists <> Some true then
                                    if not r.Def.Craftable || n = "wood" then
                                        let v = r.Value * saveRatio
                                        if n = "void" then floor v else v
                                    elif r.Value > 0.0 then
                                        System.Math.Sqrt r.Value * saveRatio * 100.0
                                    else 0.0
                                else 0.0
                            if value > 0.0 then
                                let existing = reserveResources |> Map.tryFind n |> Option.defaultValue 0.0
                                reserveResources <- reserveResources |> Map.add n (max existing (min value System.Double.MaxValue))
                    | None -> ()

    /// reserveMan.calculateReserveKittens (L756-771): sort by exp, take last N
    /// = cryochambers.on, strip job/leader/engineer.
    and calculateReserveKittens () : unit =
        let cryochambers = tpool.VSUs.["cryochambers"].On
        if cryochambers > 0 then
            let sorted = (Game.Managers.sortKittensByExp vpool).Kittens
            let taken = sorted |> List.rev |> List.truncate cryochambers |> List.rev |> List.map (fun k -> { k with Job = None; EngineerSpeciality = None })
            reserveKittens <- reserveKittens @ taken

    /// reserveMan.calculateReserves (L773-782)
    and calculateReserves (isIronWillPending: bool) : unit =
        calculateReserveResources ()
        if not (Game.Challenges.getChallenge cpool "postApocalypse").Pending || isIronWillPending then
            calculateReserveKittens ()
            reserveCryochambers <- reserveCryochambers + tpool.VSUs.["cryochambers"].On

    /// reserveMan.addReserves (L784-813): max-vs-cap restore, kitten push,
    /// usedCryochambers accumulation.
    and addReserves () : unit =
        for KeyValue(n, v) in reserveResources do
            if n = "timeCrystal" then
                reserveResources <- reserveResources |> Map.remove n
            else
                match get pool n with
                | Some r ->
                    if r.MaxValue = 0.0 then
                        // orig: value = min(value + reserve, MAX_VALUE) — uncapped
                        let pool1, _ = Game.Resources.addRes calendarDay v true false n pool
                        pool <- pool1
                    else
                        let pool1 = { pool with ByName = pool.ByName |> Map.add n { r with Value = max r.Value v } }
                        pool <- pool1
                | None -> ()
                reserveResources <- reserveResources |> Map.remove n
        vpool <- { vpool with Kittens = vpool.Kittens @ reserveKittens }
        let kittensRes = pool.ByName["kittens"]
        pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length } }
        let used = tpool.VSUs.["usedCryochambers"]
        tpool <-
            { tpool with
                VSUs =
                    tpool.VSUs
                    |> Map.add "usedCryochambers"
                        { used with Val = used.Val + reserveCryochambers; On = used.On + reserveCryochambers
                                    Unlocked = used.Unlocked || used.Val + reserveCryochambers > 0 } }
        reserveCryochambers <- 0
        reserveKittens <- []
        // startedWithoutChronospheres = false (achievement seam)

    /// ShatterTCBtnController.doShatterAmt: pay the TC/void price, then
    /// doShatter — badges, heat split, shatter (testShatter=1 path is time-08).
    and doShatterManual (amt: int) : bool =
        // model.enabled = hasResources(getPrices(model, 1)) — the price-for-1
        // check, NOT the TC unlocked flag (updateVisible is separate)
        let heatMaxE = Game.Effects.getEffect cache "heatMax"
        let heatPerShatterE = if cpool.Challenges.["1000Years"].Researched then 5.0 else 10.0
        let hCurrentE = tpool.Heat
        let enabled =
            let shattersBeforeHeat =
                let sbh = (heatMaxE - hCurrentE) / heatPerShatterE
                max 0.0 (min (ceil sbh) 1.0)
            let darkYearsE = calendar.Year - 40000.0 - Game.Effects.getEffect cache "timeImpedance"
            let shattersBeforeDF = max 0.0 (min (-darkYearsE) 1.0)
            let resultTotal =
                let shattersConstant = min shattersBeforeDF shattersBeforeHeat
                let linHeat = max 0.0 (shattersBeforeDF - shattersConstant)
                let linDF = max 0.0 (shattersBeforeHeat - shattersConstant)
                let slopeHeat = 0.01 * heatPerShatterE
                let yIHeat = 1.0 + (hCurrentE + heatPerShatterE * shattersBeforeHeat - heatMaxE) * 0.01
                let yIDF = 1.0 + (darkYearsE + shattersBeforeDF) * 0.00001
                shattersConstant
                + (slopeHeat * linHeat * (linHeat - 1.0) / 2.0 + yIHeat * linHeat)
                + (0.00001 * linDF * (linDF - 1.0) / 2.0 + yIDF * linDF)
            let tc1 = 1.0 * resultTotal * (1.0 + Game.Effects.getEffect cache "shatterCostReduction" + Game.Effects.getEffect cache "shatterCostIncreaseChallenge")
            (get pool "timeCrystal" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0) >= tc1
        if not enabled then false
        else
            // getPricesMultiple: discrete-integral heat + dark-future pricing
            let heatMax = heatMaxE
            let heatPerShatter = heatPerShatterE
            let heatCurrent = hCurrentE
            let penaltyPerHeat = 0.01
            let shattersBeforeHeat0 = (heatMax - heatCurrent) / heatPerShatter
            let shattersBeforeHeat = min (ceil shattersBeforeHeat0) (float amt) |> max 0.0
            let darkYears = calendar.Year - 40000.0 - Game.Effects.getEffect cache "timeImpedance"
            let penaltyPerDarkYear = 0.00001
            let shattersBeforeDF = min (-darkYears) (float amt) |> max 0.0
            let shattersAfterHeat = float amt - shattersBeforeHeat
            let shattersAfterDF = float amt - shattersBeforeDF
            let shattersConstant = min shattersBeforeDF shattersBeforeHeat
            let shattersLinearHeatOnly = max 0.0 (shattersBeforeDF - shattersConstant)
            let shattersLinearDFOnly = max 0.0 (shattersBeforeHeat - shattersConstant)
            let shattersQuadratic = min shattersAfterDF shattersAfterHeat
            let resultConstant = 1.0 * shattersConstant
            let slopeHeat = penaltyPerHeat * heatPerShatter
            let yInterceptHeat = 1.0 + (heatCurrent + heatPerShatter * shattersBeforeHeat - heatMax) * penaltyPerHeat
            let resultLinearHeatOnly =
                slopeHeat * shattersLinearHeatOnly * (shattersLinearHeatOnly - 1.0) / 2.0
                + yInterceptHeat * shattersLinearHeatOnly
            let slopeDF = penaltyPerDarkYear
            let yInterceptDF = 1.0 + (darkYears + 1.0 * shattersBeforeDF) * penaltyPerDarkYear
            let resultLinearDFOnly =
                slopeDF * shattersLinearDFOnly * (shattersLinearDFOnly - 1.0) / 2.0
                + yInterceptDF * shattersLinearDFOnly
            let yInterceptHeat2 = 1.0 + (heatCurrent + heatPerShatter * (float amt - shattersQuadratic) - heatMax) * penaltyPerHeat
            let yInterceptDF2 = 1.0 + (darkYears + 1.0 * (float amt - shattersQuadratic)) * penaltyPerDarkYear
            let coefficientA = slopeHeat * slopeDF
            let coefficientB = slopeHeat * yInterceptDF2 + slopeDF * yInterceptHeat2
            let coefficientC = yInterceptHeat2 * yInterceptDF2
            let shattersQuadraticS = shattersQuadratic * (shattersQuadratic - 1.0)
            let resultQuadratic =
                coefficientA * shattersQuadraticS * (2.0 * shattersQuadratic - 1.0) / 6.0
                + coefficientB * shattersQuadraticS / 2.0
                + coefficientC * shattersQuadratic
            let resultTotal = resultConstant + resultLinearHeatOnly + resultLinearDFOnly + resultQuadratic
            let tcPrice = 1.0 * resultTotal * (1.0 + Game.Effects.getEffect cache "shatterCostReduction" + Game.Effects.getEffect cache "shatterCostIncreaseChallenge")
            let voidPrice = Game.Math.jsRound (0.0 * resultTotal * 1000.0) / 1000.0 // base void price 0
            let tcRes = (get pool "timeCrystal").Value
            let voidRes = (get pool "void")
            let voidOk =
                match voidRes with
                | Some v when voidPrice > 0.0 -> v.Value >= voidPrice
                | _ -> true
            if tcPrice <= tcRes.Value && voidOk then
                let pool1, _ = Game.Resources.addResEvent calendarDay "timeCrystal" (-tcPrice) pool
                pool <- pool1
                if voidPrice > 0.0 then
                    let pool2, _ = Game.Resources.addResEvent calendarDay "void" (-voidPrice) pool
                    pool <- pool2
                // doShatter body
                if calendar.Day < 0.0 && amt >= 500 then
                    // whatYearIsIt badge: +3 void on first unlock (leader color joke
                    // is a village-leader seam — no leader in this slice)
                    if not apool.Badges.["whatYearIsIt"].Unlocked then
                        let poolB, _ = Game.Resources.addResEvent calendarDay "void" 3.0 pool
                        pool <- poolB
                        apool <- Game.Achievements.unlockBadge "whatYearIsIt" apool
                // orbitalLaunch program seam: never launched in this slice → tardis
                apool <- Game.Achievements.unlockBadge "tardis" apool
                tpool <- Game.Time.doShatterHeat
                    { GetEffect = Game.Effects.getEffect cache
                      Years1000Researched = cpool.Challenges.["1000Years"].Researched }
                    amt tpool
                if tpool.TestShatter = 1 then shatterCoreGroupCycles amt else shatterCore amt
                true
            else false

    /// UseHeatBtnController.doShatterAmt: 100 furnace heat per year, no price.
    and useHeatManual (amtIn: int option) : bool =
        let furnaceHeat = tpool.CFUs.["blastFurnace"].Heat
        let amt =
            match amtIn with
            | Some a -> a
            | None -> max 2 (int (floor (furnaceHeat / 100.0)))
        let price = 100.0 * float amt
        if furnaceHeat >= price then
            tpool <- Game.Time.updateCfu tpool "blastFurnace" (fun m -> { m with Heat = m.Heat - price })
            if tpool.TestShatter = 1 then shatterCoreGroupCycles amt else shatterCore amt
            true
        else false

    /// time.applyRedshift (time.js L191-232): a full redshift day skip.
    and applyRedshiftCore (daysOffset: float) (ignoreCalendar: bool) : float =
        // resPool.update + space.update + updateResources
        let uctxF =
            { Cap = capCtx ()
              GetResourcePerTick =
                fun n ->
                    match get pool n with
                    | Some r when r.Def.CalculatePerTick -> r.PerTickCached
                    | _ -> 0.0
              CalendarSeason = calendar.Season
              PastureOn = 0
              EnergyLoss = 0.0
              EnergyChallengeResearched = energyChallengeResearched ()
              EnergyChallengeActive = energyChallengeActive () }
        pool <- update uctxF calendarDay pool
        // game.updateResources — refresh perTickCached through refreshCache's
        // prodCtx path (updateCaches also rebuilds the effect cache)
        refreshCache ()
        // resPool.fastforward: inflate by perTickCached × days × tpd, allowing
        // paradoxes, skipping the limit check; negative catnip production skips
        let limits =
            pool.Order
            |> List.choose (fun n ->
                match get pool n with
                | Some r when r.PerTickCached <> 0.0 && (n <> "catnip" || r.PerTickCached >= 0.0) ->
                    if r.MaxValue <> 0.0 then
                        let lim = max r.Value r.MaxValue
                        let pool1, _ =
                            Game.Resources.addRes calendarDay (r.PerTickCached * daysOffset * Game.Calendar.ticksPerDay) true true n pool
                        pool <- pool1
                        Some(n, lim)
                    else
                        let pool1, _ =
                            Game.Resources.addRes calendarDay (r.PerTickCached * daysOffset * Game.Calendar.ticksPerDay) true true n pool
                        pool <- pool1
                        None
                | _ -> None)
        // managers' fastforward
        let numberEvents =
            if ignoreCalendar then 0.0
            else
                let ffCtx : Game.Calendar.FastForwardContext =
                    { GetEffect = Game.Effects.getEffect cache
                      Rand = fun () -> rngDraws <- rngDraws + 1; rand ()
                      IronWill = ironWill
                      LibraryOn = libraryOn ()
                      AstronomyResearched = astronomyResearched ()
                      BlackSkyActive = cpool.Challenges.["blackSky"].Active
                      Chronomancy =
                        (match ppool.Perks |> Map.tryFind "chronomancy" with Some p -> p.Researched | None -> false)
                      Unicornmancy =
                        (match ppool.Perks |> Map.tryFind "unicornmancy" with Some p -> p.Researched | None -> false)
                      Astromancy =
                        (match ppool.Perks |> Map.tryFind "astromancy" with Some p -> p.Researched | None -> false)
                      Alicornmancy =
                        (match ppool.Perks |> Map.tryFind "alicornmancy" with Some p -> p.Researched | None -> false)
                      PacifismActive = cpool.Challenges.["pacifism"].Active
                      AnimalResearched =
                        (match spool.Techs |> Map.tryFind "animal" with Some t -> t.Researched | None -> false)
                      ArcheryResearched =
                        (match spool.Techs |> Map.tryFind "archery" with Some t -> t.Researched | None -> false)
                      MiningResearched = miningResearched ()
                      CelestialMechanics =
                        (match wpool.Upgrades |> Map.tryFind "celestialMechanics" with Some u -> u.Researched | None -> false)
                      Prospecting =
                        (match wpool.Upgrades |> Map.tryFind "prospecting" with Some u -> u.Researched | None -> false)
                      Seti =
                        (match wpool.Upgrades |> Map.tryFind "seti" with Some u -> u.Researched | None -> false)
                      Year1000Active = cpool.Challenges.["1000Years"].Active
                      AntimatterResearched =
                        (match spool.Techs |> Map.tryFind "antimatter" with Some t -> t.Researched | None -> false)
                      EnergyBalanced = true
                      UnicornsValue = fun () -> getResValue "unicorns"
                      ZebrasValue = fun () -> getResValue "zebras"
                      ZebrasMax = fun () -> (get pool "zebras" |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                      AddResEvent =
                        fun resName amount ->
                            let pool1, _ = Game.Resources.addResEvent calendarDay resName amount pool
                            pool <- pool1
                      AddResPerTick =
                        fun resName amount ->
                            let pool1, _ = Game.Resources.addResPerTick calendarDay resName amount pool
                            pool <- pool1
                      OnAlicornUpgrade =
                        fun () ->
                            refreshCache () // upgrade({zigguratUpgrades: [skyPalace; …]})
                      OnParagon =
                        fun par ->
                            let pool1, _ = Game.Resources.addResEvent calendarDay "paragon" par pool
                            pool <- pool1
                            stpool <- Game.Stats.bumpStat "totalParagon" par stpool
                      OnMillenniumKarma = fun _ -> () // karma seam (pactsAvailable 0)
                      OnYearsAdvanced =
                        fun years -> stpool <- Game.Stats.bumpStat "totalYears" years stpool
                      SpaceBeaconAction = fun () -> () // space-NN seam (val=0)
                      UpdateCaches = fun () -> refreshCache () }
                let cal', events = Game.Calendar.fastForward ffCtx calendar daysOffset
                calendar <- cal'
                events
        // bld.fastforward: cathPollution (0 seam) + steamworks automation
        let steamworks = Game.Buildings.get bpool "steamworks"
        let steamworksOn = match steamworks with Some b -> b.On | None -> 0
        let factoryAutomation =
            match wpool.Upgrades |> Map.tryFind "factoryAutomation" with Some u -> u.Researched | None -> false
        let advancedAutomation =
            match wpool.Upgrades |> Map.tryFind "advancedAutomation" with Some u -> u.Researched | None -> false
        if steamworksOn >= 1 && factoryAutomation then
            let wood = (get pool "wood").Value
            let minerals = (get pool "minerals").Value
            let iron = (get pool "iron").Value
            if wood.MaxValue <> 0.0 && minerals.MaxValue <> 0.0 then
                let baseAutomationRate = 0.02
                let automationRate = min (baseAutomationRate * (float steamworksOn + 1.0)) 0.9
                let automationDelay =
                    Game.Calendar.daysPerSeason * 4.0 / (if advancedAutomation then 2.0 else 1.0)
                let numberOfAutomations = floor (daysOffset / automationDelay)
                let crafter (consumed: string) (crafted: string) (isAllowed: bool) : float =
                    let cRes = (get pool consumed).Value
                    let consumableQuantity = cRes.Value
                    let consumableQuantityThreshold = cRes.MaxValue * (1.0 - baseAutomationRate)
                    let craftDef = (Game.Managers.getCraft wpool crafted |> Option.get).Def
                    let price = craftDef.Prices |> List.head |> (fun p -> p.Val)
                    let mutable consumableQuantity = consumableQuantity
                    let mutable numberOfCrafts = 0.0
                    let mutable remainingAutomations = numberOfAutomations
                    let mutable go = isAllowed
                    while go && remainingAutomations > 0.0 do
                        remainingAutomations <- remainingAutomations - 1.0
                        let perAutomation =
                            floor (min consumableQuantity cRes.MaxValue * automationRate / price)
                        if consumableQuantity >= consumableQuantityThreshold && perAutomation > 0.0 then
                            numberOfCrafts <- numberOfCrafts + perAutomation
                            consumableQuantity <- consumableQuantity - perAutomation * price
                        else go <- false
                    numberOfCrafts
                let beamCrafts = crafter "wood" "beam" true
                let slabCrafts = crafter "minerals" "slab" true
                let pneumaticPress =
                    match wpool.Upgrades |> Map.tryFind "pneumaticPress" with Some u -> u.Researched | None -> false
                let plateCrafts = crafter "iron" "plate" pneumaticPress
                if beamCrafts > 0.0 || slabCrafts > 0.0 || plateCrafts > 0.0 then
                    // orig order: jam until next year, then plate → slab → beam
                    steamworksJammed <- true
                    for crafted, count in [ "plate", plateCrafts; "slab", slabCrafts; "beam", beamCrafts ] do
                        if count > 0.0 then
                            let pool1, wp1, okC =
                                Game.Managers.craft calendarDay cache (traditionResearched ()) (crctx ()) crafted count pool wpool
                            pool <- pool1
                            wpool <- wp1
                            if okC then
                                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
        // workshop.fastforward: the per-tick effectsBase block + engineers at
        // the bulk rate. The scienceMax/cultureMax/faithMax recalcs stay 0
        // (no compendia/manuscripts in this slice's scenarios — effectsBase seam).
        if Game.Managers.getFreeEngineers vpool wpool < 0.0 then
            vpool <- Game.Managers.clearCraftJobs vpool
            wpool <- { wpool with Crafts = wpool.Crafts |> Map.map (fun _ c -> { c with Value = 0.0 }) }
        let poolW, wpW, craftsW =
            Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) (crctx ()) getResValue
                (getResProductionCached ()) false (daysOffset * Game.Calendar.ticksPerDay) pool wpool
        pool <- poolW
        wpool <- wpW
        if craftsW > 0.0 then
            stpool <- Game.Stats.bumpStat "totalCrafts" craftsW stpool
            stpool <- Game.Stats.bumpStatCurrent "totalCrafts" craftsW stpool
        // village.fastforward: ambassadors + bulk kitten sim
        actionAmbassadors (daysOffset * Game.Calendar.ticksPerDay)
        let maxKittens = Game.Managers.calculateMaxKittens cache vpool
        vpool <- { vpool with MaxKittens = maxKittens }
        let mutable kpt = 0.01 * (1.0 + Game.Effects.getEffect cache "kittenGrowthRatio")
        if calendar.FestivalDays > 0 then
            kpt <- kpt * (2.0 + Game.Effects.getEffect cache "festivalArrivalRatio")
        let beforeBirths = vpool.Kittens.Length
        vpool <- Game.Managers.simUpdate maxKittens kpt (int (daysOffset * Game.Calendar.ticksPerDay))
            (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
        if vpool.Kittens.Length > beforeBirths then
            stpool <- Game.Stats.bumpStat "totalKittens" (float (vpool.Kittens.Length - beforeBirths)) stpool
        let kittensRes = pool.ByName["kittens"]
        pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length; MaxValue = float vpool.MaxKittens } }
        // religion.fastforward: paradox-day adjustment + necrocorns + OotV
        let paradoxChance = Game.Effects.getEffect cache "temporalParadoxChance"
        let mutable ffDays = daysOffset
        if paradoxChance > 0.0 then
            let daysInParadoxF = 10.0 + Game.Effects.getEffect cache "temporalParadoxDay"
            let daysBetweenParadox = daysInParadoxF + 100.0 * max 1.0 (1.0 / paradoxChance)
            let percentTimeInParadox = daysInParadoxF / daysBetweenParadox
            let daysInParadox = floor (daysOffset * percentTimeInParadox)
            ffDays <- daysOffset - daysInParadox
        let rp', pool' =
            Game.Religion.necrocornFastForward calendarDay (corruptionCtx ()) ffDays
                (ffDays * Game.Calendar.ticksPerDay) pool rpool
        rpool <- rp'
        pool <- pool'
        triggerOotV (daysOffset * Game.Calendar.ticksPerDay)
        // space.fastforward: no planets unlocked + entangler on=0 → exact no-op
        // resPool.enforceLimits
        pool <-
            { pool with
                ByName =
                    pool.ByName
                    |> Map.map (fun n res ->
                        if res.MaxValue <> 0.0 then
                            match limits |> List.tryFind (fun (ln, _) -> ln = n) with
                            | Some(_, lim) -> { res with Value = min res.Value lim }
                            | None -> res
                        else res) }
        // chronoheat transfer + furnace automation shatter
        if tpool.Heat > 0.0 then
            let perTickHeatTransfer = Game.Effects.getEffect cache "heatPerTick"
            let heatAttemptTransfer = daysOffset * Game.Calendar.ticksPerDay * perTickHeatTransfer
            let heatTransfer = min tpool.Heat heatAttemptTransfer
            let efficiency = 1.0 + Game.Effects.getEffect cache "heatEfficiency"
            tpool <- Game.Time.updateCfu tpool "blastFurnace" (fun m -> { m with Heat = m.Heat + heatTransfer * efficiency })
            tpool <- { tpool with Heat = tpool.Heat - heatTransfer }
            let furnace = tpool.CFUs.["blastFurnace"]
            if furnace.On <> 0 && furnace.IsAutomationEnabled = Some true && furnace.Heat >= 100.0 then
                let amt = floor (furnace.Heat / 100.0) |> int
                tpool <- Game.Time.updateCfu tpool "blastFurnace" (fun m -> { m with Heat = m.Heat - 100.0 * float amt })
                shatterCore amt
        numberEvents

    /// researchChallenge full runner tail: actionOnCompletion dispatch, unlock
    /// fan-out, calculateAllEffects (js/challenges.js L654-673).
    and researchChallengeFull (name: string) : unit =
        let c = cpool.Challenges.[name]
        if c.Active then
            cpool <- Game.Challenges.researchChallenge name cpool
            if name = "postApocalypse" then
                // actionOnCompletion: fakeBought resets (0 at this slice) +
                // pollutionDissipationRatio restore (pollution seam); the two
                // end-game policies unlock ONLY after winning the challenge
                for pol in ["terraformingInsight"; "cryochamberExtraction"] do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p with Unlocked = true } }
                    | None -> ()
            if name = "1000Years" then
                let mm = tpool.CFUs.["temporalPress"]
                tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { mm with Unlocked = true } }
            calculateAllTime ()

    /// orig updateModel (game.js L4487-4521): one model pass.
    and updateModelBody () =
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
              EnergyChallengeResearched = energyChallengeResearched ()
              EnergyChallengeActive = energyChallengeActive () }
        pool <- update uctx calendarDay pool
        bpool <- Game.Buildings.update pool bpool
        // smelter per-tick action (js/buildings.js L1119-1152): IW safe-switch,
        // stock-capped wood/minerals draw scaling the con/autoprod effects
        (match Game.Buildings.get bpool "smelter" with
         | Some sm when sm.On > 0 ->
             let iron = pool.ByName["iron"]
             // game.opts.IWSmelter defaults true (settings-01)
             if ironWill && iron.Value > iron.MaxValue * 0.95 then
                 bpool <- { bpool with ByName = bpool.ByName |> Map.add "smelter" { sm with On = 0 } }
             else
                 let calc = sm.Def.Effects
                 let calcKey k = calc |> Map.tryFind k |> Option.defaultValue 0.0
                 let pool2, amt =
                     Game.Resources.getAmtDependsOnStock
                         calendarDay
                         [ ("wood", -(calcKey "woodPerTickCon")); ("minerals", -(calcKey "mineralsPerTickCon")) ]
                         (float sm.On)
                         pool
                 pool <- pool2
                 let scaleKeys = [ "woodPerTickCon"; "mineralsPerTickCon"; "coalPerTickAutoprod"; "ironPerTickAutoprod"; "titaniumPerTickAutoprod"; "goldPerTickAutoprod" ]
                 bpool <- Game.Buildings.setEffects bpool "smelter" (fun e0 -> scaleKeys |> List.fold (fun acc k -> acc |> Map.add k (calcKey k * amt)) e0)
         | _ -> ())
        // aiCore per-tick action (js/buildings.js L2172-2175): gflops accrual +
        // updateEffects (non-proportional energy/aiLevel table). Def-order: runs
        // before the steamworks action.
        (match Game.Buildings.get bpool "aiCore" with
         | Some ai when ai.On > 0 ->
             let aiCoreProductivness = Game.Effects.getEffect cache "aiCoreProductivness"
             let gflopsBase = 0.02 * (1.0 + aiCoreProductivness)
             let gflopsRes = pool.ByName["gflops"]
             pool <- { pool with ByName = pool.ByName |> Map.add "gflops" { gflopsRes with Value = gflopsRes.Value + gflopsBase * float ai.On } }
             let aiLevel = Game.Math.jsRound (System.Math.Log (max gflopsRes.Value 1.0)) |> float
             bpool <-
                 Game.Buildings.setEffects bpool "aiCore" (fun eff ->
                     eff
                     |> Map.add "energyConsumption" ((3.0 * float ai.On + 5.0) / 4.0)
                     |> Map.add "gflopsPerTickBase" gflopsBase
                     |> Map.add "aiLevel" aiLevel)
         | _ -> ())
        // steamworks per-tick automation action (js/buildings.js L1327-1377):
        // crafts when a consumed resource sits at ≥98% of cap; jams until the
        // next onNewYear. isAutomationEnabled is forced true with the tech.
        let factoryAutomationP = (match wpool.Upgrades |> Map.tryFind "factoryAutomation" with Some u -> u.Researched | None -> false)
        if factoryAutomationP then
            match Game.Buildings.get bpool "steamworks" with
            | Some sw when sw.On >= 1 && not steamworksJammed ->
                let woodR = (get pool "wood").Value
                let mineralsR = (get pool "minerals").Value
                if woodR.MaxValue <> 0.0 && mineralsR.MaxValue <> 0.0 then
                    let baseAutomationRate = 0.02
                    let automationRate = min (baseAutomationRate * (float sw.On + 1.0)) 0.9
                    let pneumaticPressP = (match wpool.Upgrades |> Map.tryFind "pneumaticPress" with Some u -> u.Researched | None -> false)
                    let perTickCrafter (consumed: string) (crafted: string) (isAllowed: bool) : float =
                        let cRes = (get pool consumed).Value
                        let consumedQuantity = cRes.Value * automationRate
                        let price = ((Game.Managers.getCraft wpool crafted |> Option.get).Def).Prices |> List.head |> (fun p -> p.Val)
                        if isAllowed && cRes.Value >= cRes.MaxValue * (1.0 - baseAutomationRate) then
                            max 0.0 (floor (consumedQuantity / price))
                        else 0.0
                    let beamC = perTickCrafter "wood" "beam" true
                    let slabC = perTickCrafter "minerals" "slab" true
                    let plateC = perTickCrafter "iron" "plate" pneumaticPressP
                    if beamC > 0.0 || slabC > 0.0 || plateC > 0.0 then
                        steamworksJammed <- true
                        for crafted, count in [ "plate", plateC; "slab", slabC; "beam", beamC ] do
                            if count > 0.0 then
                                let pool1, wp1, okC =
                                    Game.Managers.craft calendarDay cache (traditionResearched ()) (crctx ()) crafted count pool wpool
                                pool <- pool1
                                wpool <- wp1
                                if okC then
                                    stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                                    stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
            | _ -> ()
        // village sim (village-02/04): births at 0.01 base × growth ratio;
        // starvation seam engages once production can go negative
        let maxKittens = Game.Managers.calculateMaxKittens cache vpool
        vpool <- { vpool with MaxKittens = maxKittens }
        let mutable kittensPerTick = 0.01 * (1.0 + Game.Effects.getEffect cache "kittenGrowthRatio")
        // orig calculateKittensPerTick: festivals double the birth rate
        if calendar.FestivalDays > 0 then
            kittensPerTick <- kittensPerTick * (2.0 + Game.Effects.getEffect cache "festivalArrivalRatio")
        // game.tick head: undo TTL counts down even before the update
        match undoChange with
        | Some u ->
            if u.Ttl - 1 <= 0 then undoChange <- None
            else undoChange <- Some { u with Ttl = u.Ttl - 1 }
        | None -> ()
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
            // orig sim.killKittens: stats + cache refreshes on the kill tick
            stpool <- Game.Stats.bumpStat "kittensDead" (float (preStarveKittens - vpool.Kittens.Length)) stpool
            prodCache <- Some(updateResourceProduction ())
            refreshCache ()
        // orig calls sim.update in every branch — with rate 0 when starving
        let growthRate = if starving then 0.0 else kittensPerTick
        let beforeBirths = vpool.Kittens.Length
        vpool <- Game.Managers.simUpdate maxKittens growthRate 1 (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
        // sim.update skill half (village-10/12)
        let skillCtx : Game.Managers.SkillContext =
          { AnarchyActive = Game.Challenges.isActive cpool "anarchy"
            InternetResearched = (match wpool.Upgrades |> Map.tryFind "internet" with Some u -> u.Researched | None -> false)
            NeuralNetworksResearched = (match wpool.Upgrades |> Map.tryFind "neuralNetworks" with Some u -> u.Researched | None -> false)
            SkillXPEffect = Game.Effects.getEffect cache "skillXP"
            MaxKittensRatioLDR = Game.Effects.getEffect cache "maxKittensRatio"
            Day = calendarDay
            GetJobValue = fun n -> vpool.JobValues |> Map.tryFind n |> Option.defaultValue 0
            GetJobUnlocked = fun n -> vpool.JobUnlocked.Contains n
            Times = 1 }
        vpool <- Game.Managers.learnSkills skillCtx vpool
        if vpool.Kittens.Length > beforeBirths then
            // orig sim.addKitten: stats.getStat("totalKittens").val++
            stpool <- Game.Stats.bumpStat "totalKittens" (float (vpool.Kittens.Length - beforeBirths)) stpool
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
            { Game.Happiness.freshHappinessContext with
                LuxuryCount = luxCount
                FestivalDays = calendar.FestivalDays
                GetEffect = Game.Effects.getEffect cache }
        vpool <- { vpool with Happiness = Game.Happiness.updateHappiness hctx vpool.Kittens.Length vpool.MaxKittens }
        // orig village.update tail: actionAmbassadors(1) after updateHappines
        actionAmbassadors 1.0

        // village.map.update RNG skeleton (village.js L2192-2214): per biome,
        // ALWAYS 1 faunaName draw; while fauna is empty, 1 spawn-chance draw
        // (spawn <= 1000*penalty on rand(10000)) costing 2 more (jitters) and
        // filling the slot. Mirrors orig draw counts without the combat state.
        for (i, def) in Game.Catalog.World.biomeDefs |> List.indexed do
            let faunaNames = if def.FaunaNames.IsEmpty then Game.Managers.defaultFaunaNames else def.FaunaNames
            let _picked = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 (float faunaNames.Length)
            let faunaPresent = mapFauna.[i]
            if not faunaPresent then
                let roll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 10000.0
                // JS falsy: faunaPenalty 0 (village) || 1.0 -> spawns at 10%
                let penalty = if def.FaunaPenalty = 0.0 then 1.0 else def.FaunaPenalty
                if float roll <= 1000.0 * penalty then
                    let _j1 = rngDraws <- rngDraws + 1; rand ()
                    let _j2 = rngDraws <- rngDraws + 1; rand ()
                    mapFauna <- mapFauna |> List.updateAt i true

        // orig updateModel L4517-4519 order: workshop.update → diplomacy.update
        // → religion.update (space/challenges seams unchanged at this slice)
        // workshop.update → fastforward(1/ticksPerDay): effectsBase is read by
        // workshopGroup() at aggregation; engineers craft; sanity clearEngineers
        if Game.Managers.getFreeEngineers vpool wpool < 0.0 then
            vpool <- Game.Managers.clearCraftJobs vpool
            wpool <- { wpool with Crafts = wpool.Crafts |> Map.map (fun _ c -> { c with Value = 0.0 }) }
        let pool', wpool', craftsDone =
            Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) (crctx ()) getResValue
                (getResProductionCached ()) false 1.0 pool wpool
        pool <- pool'
        wpool <- wpool'
        if craftsDone > 0.0 then
            craftFilterUnlocked <- true
            // orig craft() bumps stats on every successful craft incl. engineer ones
            stpool <- Game.Stats.bumpStat "totalCrafts" craftsDone stpool
            stpool <- Game.Stats.bumpStatCurrent "totalCrafts" craftsDone stpool
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
        // religion.update (js/religion.js L305-341): corruption accumulator +
        // per-tick Order of the Void (L339-341, gated on day >= 0).
        let cctx = corruptionCtx ()
        if getResValue "alicorn" > 0.0 then
            rpool <- { rpool with Corruption = rpool.Corruption + Game.Religion.getCorruptionPerTick cctx None }
        else
            rpool <- { rpool with Corruption = 0.0 }
        if rpool.Corruption >= 1.0 then
            let rpool', pool', corrupted = Game.Religion.corruptNecrocorns cctx pool rpool
            rpool <- rpool'
            pool <- pool'
            if corrupted > 0.0 then
                refreshCache () // game.upgrade({zigguratUpgrades}) fan-out
        if calendarDay >= 0 then
            triggerOotV 1.0
        // challenges.update (js/challenges.js L579-604): unicornTears flag-lock
        // (flag always true in the harness), alicornStable unlock, ironWill
        // mirror, and completion polling for the conditions reachable here
        // (unicornTears/postApocalypse; space/aiCore seams never fire).
        if Game.Challenges.isActive cpool "unicornTears"
           && not ((match wpool.Upgrades |> Map.tryFind "alicornStable" with Some u -> u.Unlocked | None -> false))
           && getResValue "alicorn" >= 15.0 then
            let u = wpool.Upgrades.["alicornStable"]
            wpool <- { wpool with Upgrades = wpool.Upgrades |> Map.add "alicornStable" { u with Unlocked = true } }
        let iw = cpool.Challenges.["ironWill"]
        if iw.Active <> ironWill then
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "ironWill" { iw with Active = ironWill } }
        // polling: unicornTears (necrocorn >= 1), postApocalypse (cathPollution == 0)
        let c1000p = cpool.Challenges.["unicornTears"]
        if c1000p.Active && getResValue "necrocorn" >= 1.0 then
            researchChallengeFull "unicornTears"
        let paCh = cpool.Challenges.["postApocalypse"]
        if paCh.Active then
            researchChallengeFull "postApocalypse" // cathPollution == 0 (no calciners)


    /// orig game.calculateAllEffects → upgrade(all metas): one calculateEffects/
    /// updateEffects pass per meta (reverse iteration). Only the CFU metas have
    /// observable side effects at this slice (automation tri-states, testShatter).
    and calculateAllTime () : unit =
        refreshCache () // game.upgrade leading updateCaches
        // challenge calculateEffects side effects: meta.priceRules toggles
        // (blackSky→calciner, pacifism→steamworks, postApocalypse→field)
        let toggle (bld: string) (on: bool) =
            priceRulesExtra <- (if on then Set.add bld priceRulesExtra else Set.remove bld priceRulesExtra)
        toggle "calciner" (Game.Challenges.isActive cpool "blackSky")
        toggle "steamworks" (Game.Challenges.isActive cpool "pacifism")
        toggle "field" (Game.Challenges.isActive cpool "postApocalypse")
        // calculateAllEffects: upgrade({buildings:[warehouse], spaceBuilding:[hydroponics]})
        // then metaKeys — space metas (programs, flat building map, planets)
        // sit between buildings and chronoforge/voidSpace
        upgradeMetas [ ("buildings", [ "warehouse" ]); ("spaceBuilding", [ "hydroponics" ]) ]
        upgradeMetas
            [ ("spaceMission", Game.Catalog.Space.programDefs |> List.map (fun d -> d.Name))
              ("spaceBuilding", Game.Catalog.Space.buildingDefs |> List.map (fun d -> d.Name))
              ("planet", Game.Catalog.Space.planetDefs |> List.map (fun d -> d.Name)) ]
        // metaKeys policies (reversed): recalc researched policy effects
        for n in List.rev spool.PolicyOrder do
            spool <- Game.Managers.recalcPolicy (scienceCalcCtx ()) n spool
        let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
        tpool <- Game.Time.vsuCalculate tpool chronosphereOn (Game.Effects.getEffect cache)
        for name in List.rev tpool.CfuOrder do
            tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
        refreshCache ()


    /// orig game.upgrade(list) (game.js): updateCaches; per type in list
    /// order, names REVERSED; calculateEffects XOR updateEffects per meta;
    /// spaceBuilding also runs cycleEffectsBasics; an empty name list aborts
    /// the whole call INCLUDING the trailing updateCaches (orig `return`).
    and upgradeMetas (list: (string * string list) list) : unit =
        refreshCache () // leading updateCaches
        let mutable aborted = false
        for (typ, names) in list do
            if aborted then ()
            elif names = [] then aborted <- true
            else
                for name in List.rev names do
                    match typ with
                    | "spaceBuilding" ->
                        let ctx = spaceCalcCtx ()
                        spacep <-
                            (if Game.Space.hasCalcEffects name then Game.Space.calculateEffects ctx name spacep
                             elif Game.Space.hasUpdateEffects name then Game.Space.updateEffects ctx name spacep
                             else spacep)
                        spacep <- Game.Space.cycleEffectsBasics ctx name spacep
                    | "challenges" ->
                        // challenge calculateEffects replicas: priceRules toggles
                        // (challenge effect values flow via the provider side)
                        if name = "blackSky" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "blackSky" then Set.add "calciner" priceRulesExtra else Set.remove "calciner" priceRulesExtra)
                        elif name = "pacifism" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "pacifism" then Set.add "steamworks" priceRulesExtra else Set.remove "steamworks" priceRulesExtra)
                        elif name = "postApocalypse" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "postApocalypse" then Set.add "field" priceRulesExtra else Set.remove "field" priceRulesExtra)
                    | "planet" ->
                        // cath.calculateEffects (js/space.js L326-330)
                        if name = "cath" then
                            let rocketry = (match spool.Techs |> Map.tryFind "rocketry" with Some t -> t.Researched | None -> false)
                            if rocketry then queueSourcesUnlocked <- Set.add "spaceMission" queueSourcesUnlocked
                    | _ -> () // buildings/spaceMission/zigguratUpgrades/policies/upgrades: no observable meta recalc at this slice
        if not aborted then refreshCache () // trailing updateCaches

    /// space meta recalc context (js/space.js calculateEffects reads)
    and spaceCalcCtx () : Game.Space.SpaceCalcCtx =
        let wsRes (n: string) = (match wpool.Upgrades |> Map.tryFind n with Some u -> u.Researched | None -> false)
        let chAct (n: string) = (match cpool.Challenges |> Map.tryFind n with Some c -> c.Active | None -> false)
        let perkRes (n: string) = (match ppool.Perks |> Map.tryFind n with Some p -> p.Researched | None -> false)
        { GetEffect = fun n -> Game.Effects.getEffect cache n
          SolarSatellitesResearched = wsRes "solarSatellites"
          AmBasesResearched = wsRes "amBases"
          AiBasesResearched = wsRes "aiBases"
          BlackSkyActive = chAct "blackSky"
          DarkFutureYears = calendar.Year - 40000.0
          NumerologyActive = perkRes "numerology"
          NumerologyCycleMult = fun _ -> None // zodiac cycle mults land with the calendar-cycles unit
          AiCoreOn = (Game.Buildings.get bpool "aiCore" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
          RunUpgradeFanout = upgradeMetas }

    // --- game-13: save/load core ------------------------------------------------
    // LCstorage["com.nuclearunicorn.kittengame.savedata"] equivalent + the
    // telemetry guid (32 seeded draws at boot, mirroring generateGuid).
    let mutable telemetryGuid = ""
    do
        // orig boot: two harness draws precede the telemetry guid
        rand () |> ignore
        rand () |> ignore
        // orig boot: telemetry.generateGuid before any scenario move
        let pattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        let mutable g = ""
        for c in pattern do
            g <-
                if c = 'x' then
                    let d = int (rand () * 16.0)
                    g + "0123456789abcdef".[d].ToString()
                elif c = 'y' then
                    let d = int (rand () * 4.0) + 8
                    g + "0123456789abcdef".[d].ToString()
                else g + c.ToString()
        telemetryGuid <- g

    let jsonStr (s: string) : string =
        let mutable out = System.Text.StringBuilder("\"")
        for ch in s do
            if ch = '"' then out.Append "\\\"" |> ignore
            elif ch = '\\' then out.Append "\\\\" |> ignore
            elif ch = '\n' then out.Append "\\n" |> ignore
            elif ch = '\r' then out.Append "\\r" |> ignore
            elif ch = '\t' then out.Append "\\t" |> ignore
            else out.Append ch |> ignore
        out.Append("\"").ToString()

    let mutable saveDataBuilder: (unit -> string) option = None

    /// game-13 _saveDataToString: JSON.stringify(saveData, JSONreplacer) with
    /// orig key insertion order (undefined keys dropped). No LZ at <5mb.
    /// plain=true replicates export's JSON.stringify(saveData) — the loose
    /// `value == undefined` in JSONreplacer drops NULLS from the storage
    /// form, while the export form keeps them (motdContent/weather/faction).
    // buildings whose defs declare isAutomationEnabled (js/buildings.js:
    // warehouse, calciner, steamworks, oilWell, factory, reactor)
    let automationBuildingSet =
        set [ "warehouse"; "calciner"; "steamworks"; "oilWell"; "factory"; "reactor" ]

    let buildSaveStringMode (plain: bool) : string =
        let sb = System.Text.StringBuilder()
        let inline key (k: string) = (sb.Append("\"").Append(k).Append("\":") |> ignore) |> ignore
        let inline raw (v: string) = sb.Append v |> ignore
        let inline str (v: string) = sb.Append(jsonStr v) |> ignore |> ignore
        let inline numv (v: float) = sb.Append(num v) |> ignore |> ignore
        let inline intv (v: int) = sb.Append(string v) |> ignore |> ignore
        let inline boolv (v: bool) = sb.Append(if v then "true" else "false") |> ignore |> ignore
        let inline sep (first: bool ref) =
            if not !first then sb.Append "," |> ignore
            first := false
        let inline objStart () = sb.Append "{" |> ignore
        let inline objEnd () = sb.Append "}" |> ignore
        let inline arrStart () = sb.Append "[" |> ignore
        let inline arrEnd () = sb.Append "]" |> ignore

        objStart ()
        key "saveVersion"; intv 15; sb.Append "," |> ignore
        // server.save: motdContent undefined at this slice → dropped
        key "server"; objStart ()
        if plain then
            // preparedSaveData.server.motdContent is null — export keeps it
            key "motdContent"; raw "null"; sb.Append "," |> ignore
        key "bcoinPrice"; numv 63918.0; objEnd (); sb.Append "," |> ignore

        // resPool.save
        key "resources"; arrStart ()
        let firstR = ref true
        for n in pool.Order do
            sep firstR
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            let r = pool.ByName[n]
            key "value"; numv r.Value; sb.Append "," |> ignore
            key "unlocked"; boolv r.Unlocked; sb.Append "," |> ignore
            key "isHidden"; boolv false
            if n = "wood" then sb.Append "," |> ignore; key "isHiddenFromCrafting"; boolv false
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "res"; objStart (); key "isLocked"; boolv false; objEnd (); sb.Append "," |> ignore

        // village.save
        key "village"; objStart ()
        key "kittens"; arrStart ()
        let jobNames = Game.Catalog.Village.jobDefs |> List.map (fun j -> j.Name)
        let firstK = ref true
        for k in vpool.Kittens do
            sep firstK
            // saveCompressed: build the field list, drop falsy/undefined keys
            let fields = System.Collections.Generic.List<string>()
            let skillsVals = jobNames |> List.map (fun j -> k.Skills |> Map.tryFind j |> Option.defaultValue 0.0 |> Game.Math.jsRoundX1)
            let mn = List.min skillsVals
            let mx = List.max skillsVals
            if mn = mx then
                if mx <> 0.0 then fields.Add("\"skills\":" + num mx)
            else
                fields.Add("\"skills\":[" + (skillsVals |> List.map num |> String.concat ",") + "]")
            if k.Exp <> 0.0 then fields.Add("\"exp\":" + num (Game.Math.jsRoundX1 k.Exp))
            match k.Job with
            | Some j -> fields.Add("\"job\":" + string (jobNames |> List.findIndex (fun x -> x = j)))
            | None -> ()
            match k.EngineerSpeciality with
            | Some sp -> fields.Add("\"engineerSpeciality\":" + jsonStr sp)
            | None -> ()
            if k.Rank <> 0 then fields.Add("\"rank\":" + string k.Rank)
            if k.IsLeader then fields.Add("\"isLeader\":true")
            if k.Seed <> 0 then fields.Add("\"seed\":" + string k.Seed)
            let nameIdx = Game.Catalog.Village.names |> List.tryFindIndex (fun x -> x = k.Name)
            let surnameIdx = Game.Catalog.Village.surnames |> List.tryFindIndex (fun x -> x = k.Surname)
            let traitIdx = Game.Catalog.Village.traitDefs |> List.indexed |> List.tryFind (fun (_, td) -> td.Name = k.Trait) |> Option.map fst |> Option.defaultValue 0
            let ssn = Game.Managers.mergeSSN [ (nameIdx |> Option.defaultValue 0); (surnameIdx |> Option.defaultValue 0); int k.Age; traitIdx; k.Color; k.Variety; k.Rarity ]
            fields.Add("\"ssn\":" + string ssn)
            (if nameIdx.IsNone then fields.Add("\"name\":" + jsonStr k.Name))
            (if surnameIdx.IsNone then fields.Add("\"surname\":" + jsonStr k.Surname))
            objStart ()
            raw (fields |> String.concat ",")
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "maxKittens"; intv vpool.MaxKittens; sb.Append "," |> ignore
        key "jobs"; arrStart ()
        let firstJ = ref true
        for jd in Game.Catalog.Village.jobDefs do
            sep firstJ
            objStart ()
            key "name"; str jd.Name; sb.Append "," |> ignore
            key "unlocked"; boolv (vpool.JobUnlocked.Contains jd.Name); sb.Append "," |> ignore
            key "value"; intv (vpool.JobValues |> Map.tryFind jd.Name |> Option.defaultValue 0)
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "biomes"; arrStart ()
        let biomeUnlocked = [ "village", true; "plains", true; "hills", false; "forest", true; "boneForest", false; "rainForest", false; "mountain", false; "volcano", false; "desert", false; "bloodDesert", false; "swamp", false; "cath", true; "redmoon", false ]
        let firstB = ref true
        for bn, bu in biomeUnlocked do
            sep firstB
            objStart (); key "name"; str bn; sb.Append "," |> ignore; key "unlocked"; boolv bu; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        if plain then
            // map.currentBiome / map.lastBiome are null at this slice
            key "currentBiome"; raw "null"; sb.Append "," |> ignore
            key "lastBiome"; raw "null"; sb.Append "," |> ignore
        key "hadKittenHunters"; boolv false; sb.Append "," |> ignore
        key "nextKittenProgress"; numv vpool.NextKittenProgress; sb.Append "," |> ignore
        key "map"; objStart (); key "hqLevel"; intv 0; sb.Append "," |> ignore; key "energy"; numv 70.0; sb.Append "," |> ignore; key "explorersLevel"; intv 0; objEnd (); sb.Append "," |> ignore
        key "loadouts"; arrStart (); arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // calendar.save
        key "calendar"; objStart ()
        key "year"; numv calendar.Year; sb.Append "," |> ignore
        key "day"; numv calendar.Day; sb.Append "," |> ignore
        key "season"; intv calendar.Season; sb.Append "," |> ignore
        (match calendar.Weather with
         | Some w0 -> key "weather"; str w0; sb.Append "," |> ignore
         | None -> if plain then (key "weather"; raw "null"; sb.Append "," |> ignore))
        key "festivalDays"; intv calendar.FestivalDays; sb.Append "," |> ignore
        key "cycle"; intv calendar.Cycle; sb.Append "," |> ignore
        key "cycleYear"; intv calendar.CycleYear; sb.Append "," |> ignore
        key "futureSeasonTemporalParadox"; intv (-1); sb.Append "," |> ignore
        key "cryptoPrice"; numv calendar.CryptoPrice
        objEnd (); sb.Append "," |> ignore

        // console.save: static filter table
        key "console"; objStart (); key "filters"; objStart ()
        let filters = [ "astronomicalEvent"; "hunt"; "trade"; "craft"; "workshopAutomation"; "meteor"; "ivoryMeteor"; "unicornRift"; "unicornSacrifice"; "alicornRift"; "alicornSacrifice"; "alicornCorruption"; "tcShatter"; "tcRefine"; "faith"; "elders"; "blackcoin"; "festival"; "undo"; "explore"; "combat" ]
        let firstF = ref true
        for f0 in filters do
            sep firstF
            let unl =
                (f0 = "craft" && craftFilterUnlocked) || (f0 = "hunt" && huntFilterUnlocked)
            key f0; objStart (); key "unlocked"; boolv unl; sb.Append "," |> ignore; key "enabled"; boolv true; objEnd ()
        objEnd (); objEnd (); sb.Append "," |> ignore

        key "telemetry"; objStart (); key "guid"; str telemetryGuid; objEnd (); sb.Append "," |> ignore

        // challenges.save
        key "challenges"; objStart (); key "challenges"; arrStart ()
        let firstC = ref true
        for n in cpool.Order do
            sep firstC
            let c = cpool.Challenges.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "researched"; boolv c.Researched; sb.Append "," |> ignore
            key "on"; intv c.On; sb.Append "," |> ignore
            key "unlocked"; boolv c.Unlocked; sb.Append "," |> ignore
            key "active"; boolv c.Active
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "reserves"; objStart ()
        key "reserveKittens"; arrStart (); arrEnd (); sb.Append "," |> ignore
        key "reserveResources"; objStart (); objEnd (); sb.Append "," |> ignore
        key "reserveCryochambers"; intv reserveCryochambers
        objEnd ()
        objEnd (); sb.Append "," |> ignore

        // workshop.save
        key "workshop"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "upgrades"; arrStart ()
        let firstU = ref true
        for n in wpool.UpgradeOrder do
            sep firstU
            let u = wpool.Upgrades.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv u.Unlocked; sb.Append "," |> ignore; key "researched"; boolv u.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "crafts"; arrStart ()
        let firstCr = ref true
        for n in wpool.CraftOrder do
            sep firstCr
            let c = wpool.Crafts.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv c.Unlocked; sb.Append "," |> ignore; key "value"; numv c.Value; sb.Append "," |> ignore; key "progress"; numv c.Progress; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "zebraUpgrades"; arrStart ()
        let firstZ = ref true
        for n in wpool.ZebraOrder do
            sep firstZ
            let u = wpool.ZebraUpgrades.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv u.Unlocked; sb.Append "," |> ignore; key "researched"; boolv u.Researched; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // diplomacy.save
        key "diplomacy"; objStart (); key "races"; arrStart ()
        let firstD = ref true
        for n in dp.RaceOrder do
            sep firstD
            let r = dp.Races.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "embassyLevel"; intv r.EmbassyLevel; sb.Append "," |> ignore
            key "unlocked"; boolv r.Unlocked; sb.Append "," |> ignore
            key "collapsed"; boolv false; sb.Append "," |> ignore
            key "energy"; numv r.Energy; sb.Append "," |> ignore
            key "duration"; numv r.Duration; sb.Append "," |> ignore
            key "pinned"; boolv false
            objEnd ()
        arrEnd (); objEnd (); sb.Append "," |> ignore

        // buildings.save: val/on dropped at 0, unlocked/jammed dropped at false
        key "buildings"; arrStart ()
        let firstBld = ref true
        for n in bpool.Order do
            sep firstBld
            let b = bpool.ByName[n]
            objStart ()
            key "name"; str n
            if b.Unlocked then sb.Append "," |> ignore; key "unlocked"; boolv true
            if b.Val <> 0 then sb.Append "," |> ignore; key "val"; intv b.Val
            if b.On <> 0 then sb.Append "," |> ignore; key "on"; intv b.On
            if b.Def.Stages.Length > 0 then sb.Append "," |> ignore; key "stage"; intv b.Stage
            // plain form keeps the declared-but-nulled isAutomationEnabled
            if plain && automationBuildingSet.Contains n then
                sb.Append "," |> ignore; key "isAutomationEnabled"; raw "null"
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "bldData"; objStart (); key "groupBuildings"; boolv false; sb.Append "," |> ignore; key "twoRows"; boolv false; objEnd (); sb.Append "," |> ignore
        key "cathPollution"; numv 0.0; sb.Append "," |> ignore

        // science.save
        key "science"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "policyToggleResearched"; boolv false; sb.Append "," |> ignore
        key "policyToggleBlocked"; boolv false; sb.Append "," |> ignore
        key "techs"; arrStart ()
        let firstT = ref true
        for n in spool.TechOrder do
            sep firstT
            let tc = spool.Techs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv tc.Unlocked; sb.Append "," |> ignore; key "researched"; boolv tc.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "policies"; arrStart ()
        let firstP = ref true
        for n in spool.PolicyOrder do
            sep firstP
            let p = spool.Policies.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv p.Unlocked; sb.Append "," |> ignore; key "blocked"; boolv false; sb.Append "," |> ignore; key "researched"; boolv p.Researched; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // achievements.save
        key "achievements"; arrStart ()
        let firstA = ref true
        for n in apool.AchievementOrder do
            sep firstA
            let a = apool.Achievements.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv a.Unlocked; sb.Append "," |> ignore; key "starUnlocked"; boolv a.StarUnlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "ach"; objStart (); key "badgesUnlocked"; boolv (apool.BadgeOrder |> List.exists (fun n -> apool.Badges.[n].Unlocked)); sb.Append "," |> ignore; key "badges"; arrStart ()
        let firstBd = ref true
        for n in apool.BadgeOrder do
            sep firstBd
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv apool.Badges.[n].Unlocked; objEnd ()
        arrEnd (); objEnd (); sb.Append "," |> ignore

        // religion.save
        key "religion"; objStart ()
        key "faith"; numv rpool.Faith; sb.Append "," |> ignore
        key "corruption"; numv rpool.Corruption; sb.Append "," |> ignore
        key "faithRatio"; numv rpool.FaithRatio; sb.Append "," |> ignore
        key "transcendenceTier"; intv rpool.TranscendenceTier; sb.Append "," |> ignore
        key "activeHolyGenocide"; intv rpool.ActiveHolyGenocide; sb.Append "," |> ignore
        key "necrocornDeficit"; numv rpool.NecrocornDeficit; sb.Append "," |> ignore
        key "tcratio"; numv (Game.Religion.getTranscendTotalPrice rpool.TranscendenceTier); sb.Append "," |> ignore
        key "zu"; arrStart ()
        let firstZu = ref true
        for n in rpool.ZuOrder do
            sep firstZu
            let m = rpool.ZUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "ru"; arrStart ()
        let firstRu = ref true
        for n in rpool.RuOrder do
            sep firstRu
            let m = rpool.RUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "tu"; arrStart ()
        let firstTu = ref true
        for n in rpool.TuOrder do
            sep firstTu
            let m = rpool.TUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "pact"; arrStart ()
        let firstPa = ref true
        for n in rpool.PactOrder do
            sep firstPa
            let m = rpool.Pacts.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // space.save (js/space.js save): filterMetadata name/val/on/unlocked
        // + planets name/buildings/reached/unlocked/routeDays — live state
        key "space"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "programs"; arrStart ()
        let firstSp = ref true
        for pn in spacep.ProgramOrder do
            sep firstSp
            let m = spacep.Programs.[pn]
            objStart (); key "name"; str pn; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "planets"; arrStart ()
        let firstPl = ref true
        for pn in spacep.PlanetOrder do
            sep firstPl
            let pl = spacep.Planets.[pn]
            objStart ()
            key "name"; str pn; sb.Append "," |> ignore
            key "buildings"; arrStart ()
            let firstPb = ref true
            for bn in Game.Catalog.Space.buildingDefs |> List.filter (fun d0 -> d0.Planet = pn) |> List.map (fun d0 -> d0.Name) do
                sep firstPb
                let m = spacep.Buildings.[bn]
                objStart (); key "name"; str bn; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
            arrEnd (); sb.Append "," |> ignore
            key "reached"; boolv pl.Reached; sb.Append "," |> ignore
            key "unlocked"; boolv pl.Unlocked; sb.Append "," |> ignore
            key "routeDays"; numv pl.RouteDays
            objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // time.save (timestamp = the fake clock at the CURRENT tick)
        key "time"; objStart ()
        key "timestamp"; numv (1759000000000.0 + float curLogTick * 1000.0); sb.Append "," |> ignore
        key "flux"; numv tpool.Flux; sb.Append "," |> ignore
        key "heat"; numv tpool.Heat; sb.Append "," |> ignore
        key "testShatter"; intv tpool.TestShatter; sb.Append "," |> ignore
        key "isAccelerated"; boolv tpool.IsAccelerated; sb.Append "," |> ignore
        key "cfu"; arrStart ()
        let firstCfu = ref true
        for n in tpool.CfuOrder do
            sep firstCfu
            let m = tpool.CFUs.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "val"; intv m.Val; sb.Append "," |> ignore
            key "on"; intv m.On
            if n = "blastFurnace" then sb.Append "," |> ignore; key "heat"; numv m.Heat
            if n = "controlledDelay" then sb.Append "," |> ignore; key "delayTicks"; intv m.DelayTicks
            sb.Append "," |> ignore
            key "unlocked"; boolv m.Unlocked
            let cfuDef = Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = n)
            if cfuDef.AutomationInit.IsSome then
                (match m.IsAutomationEnabled with
                 | Some b ->
                     sb.Append "," |> ignore
                     key "isAutomationEnabled"
                     boolv b
                 // plain form keeps the reset null (replacer drops it entirely)
                 | None when plain ->
                     sb.Append "," |> ignore
                     key "isAutomationEnabled"
                     raw "null"
                 | None -> ())
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "vsu"; arrStart ()
        let firstVsu = ref true
        for n in tpool.VsuOrder do
            sep firstVsu
            let m = tpool.VSUs.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "val"; intv m.Val; sb.Append "," |> ignore
            key "on"; intv m.On
            if m.Unlocked then sb.Append "," |> ignore; key "unlocked"; boolv true
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "queueItems"; arrStart (); arrEnd (); sb.Append "," |> ignore
        key "queueSources"; objStart ()
        let qs =
            [ "buildings"; "tech"; "upgrades"; "policies"; "embassies"; "religion"; "zebraUpgrades";
              "spaceMission"; "spaceBuilding"; "zigguratUpgrades"; "transcendenceUpgrades"; "chronoforge"; "voidSpace" ]
            |> List.map (fun k -> (k, Set.contains k queueSourcesUnlocked))
        let firstQs = ref true
        for q0, qv in qs do
            sep firstQs
            key q0; boolv qv
        objEnd ()
        objEnd (); sb.Append "," |> ignore

        // prestige.save
        key "prestige"; objStart (); key "perks"; arrStart ()
        let firstPk = ref true
        for n in ppool.PerkOrder do
            sep firstPk
            let p = ppool.Perks.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv p.Unlocked; sb.Append "," |> ignore; key "researched"; boolv p.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "hideResearched"; boolv false
        objEnd (); sb.Append "," |> ignore

        // stats.save
        key "stats"; arrStart ()
        let firstSt = ref true
        for n in Game.Catalog.World.statDefs |> List.map (fun d -> d.Name) do
            sep firstSt
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; numv (Game.Stats.getStat stpool n); objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "statsCurrent"; arrStart ()
        let firstStc = ref true
        for n in Game.Catalog.World.statCurrentDefs |> List.map (fun d -> d.Name) do
            sep firstStc
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; numv (Game.Stats.getStatCurrentSimple stpool n); objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "void"; objStart (); key "vu"; arrStart ()
        let firstVu = ref true
        for n in voidp.VuOrder do
            sep firstVu
            objStart (); key "name"; str n; objEnd ()
        arrEnd ()
        (match voidp.Faction with
         | Some f0 -> sb.Append "," |> ignore; key "faction"; str f0
         | None -> if plain then (sb.Append "," |> ignore; key "faction"; raw "null"))
        objEnd (); sb.Append "," |> ignore

        // game.save tail
        key "game"; objStart ()
        key "isCMBREnabled"; boolv false; sb.Append "," |> ignore
        key "colorScheme"; str ""; sb.Append "," |> ignore
        key "karmaKittens"; intv pool.KarmaKittens; sb.Append "," |> ignore
        key "karmaZebras"; intv 0; sb.Append "," |> ignore
        key "ironWill"; boolv ironWill; sb.Append "," |> ignore
        key "deadKittens"; numv (Game.Stats.getStat stpool "kittensDead"); sb.Append "," |> ignore
        key "cheatMode"; boolv false; sb.Append "," |> ignore
        key "startedWithoutChronospheres"; boolv true; sb.Append "," |> ignore
        key "opts"; objStart ()
        let opts = [
            "notation", "\"si\""; "batchSize", "10"; "useWorkers", "true"; "forceHighPrecision", "false";
            "usePerSecondValues", "true"; "usePercentageResourceValues", "false"; "showNonApplicableButtons", "false";
            "usePercentageConsumptionValues", "false"; "highlightUnavailable", "true"; "hideSell", "false";
            "hideDowngrade", "false"; "hideBGImage", "false"; "tooltipsInRightColumn", "false"; "noConfirm", "false";
            "IWSmelter", "true"; "disableTelemetry", "false"; "enableRedshift", "false"; "disablePollution", "false";
            "enableRedshiftGflops", "false"; "useLegacyTwoInRowLayout", "false"; "useSwipeNavigation", "false";
            "ksEnabled", "false"; "forceLZ", "false"; "compressSaveFile", "false"; "hodl", "true"; "disableCMBR", "false"
        ]
        let firstO = ref true
        for on, ov in opts do
            sep firstO
            key on; raw ov
        objEnd ()
        if plain then
            sb.Append "," |> ignore; key "lastBackup"; raw "null"
        objEnd ()
        objEnd ()
        sb.ToString()

    let buildSaveString () : string = buildSaveStringMode false

    saveDataBuilder <- Some buildSaveString

    /// orig game.load() — resetState, then one loader per saved section, then
    /// calculateAllEffects + updateMaxValueAll + updateCaches. The unlock
    /// fan-outs that re-fire for researched metas are replicated with the
    /// typed catalog UnlockLists.
    let applySaveBlob (blob: string) : unit =
        match parseSaveBlob blob with
        | JObj root ->
            // resetState
            pool <- init Game.Catalog.Resources.resourceDefs
            calendar <- Game.Calendar.init
            bpool <- Game.Buildings.init Game.Catalog.Defs.buildingDefs
            spool <- Game.Managers.initScience Game.Catalog.Defs.techDefs Game.Catalog.Defs.policyDefs
            wpool <- Game.Managers.initWorkshop Game.Catalog.Defs.upgradeDefs Game.Catalog.Defs.craftDefs
            vpool <- Game.Managers.initVillage Game.Catalog.Village.jobDefs
            rpool <- Game.Religion.init ()
            dp <- Game.Diplomacy.init ()
            ppool <- Game.Prestige.init ()
            stpool <- Game.Stats.init ()
            apool <- Game.Achievements.init ()
            cpool <- Game.Challenges.init ()
            tpool <- Game.Time.init ()
            spacep <- Game.Space.init ()
            voidp <- Game.Time.initVoid ()
            ironWill <- true
            steamworksJammed <- false
            // mapFauna: orig village.resetState never touches the map — the
            // biome fauna skeleton survives load untouched
            // winterCatnipPerTick is a driver-level cache — NOT reset by load
            queueSourcesUnlocked <- set [ "buildings" ]
            craftFilterUnlocked <- false
            huntFilterUnlocked <- false
            prodOverrides <- Map.empty
            lastLimits <- Map.empty
            reserveResources <- Map.empty
            reserveKittens <- []
            reserveCryochambers <- 0

            let jobNames = Game.Catalog.Village.jobDefs |> List.map (fun j -> j.Name)

            // resPool.load: value/unlocked/isHidden per resource
            (match jget root "resources" with
             | Some (JArr rs) ->
                 for r in rs do
                     match r with
                     | JObj kv ->
                         (match jstrF (jget kv "name") with
                          | Some n ->
                              let v = jnumF (jget kv "value") |> Option.defaultValue 0.0
                              let u = jboolF (jget kv "unlocked") |> Option.defaultValue false
                              match Game.Resources.get pool n with
                              | Some r0 -> pool <- { pool with ByName = pool.ByName |> Map.add n { r0 with Value = v; Unlocked = u } }
                              | None -> ()
                          | None -> ())
                     | _ -> ()
             | _ -> ())

            // village.load: kittens (seed → loadSeeded, else ssn → loadCompressed)
            (match jget root "village" with
             | Some (JObj vk) ->
                 let loadKitten (kv0: JsValue) : Game.Managers.Kitten =
                     match kv0 with
                     | JObj kv ->
                         let baseK =
                             match jnumF (jget kv "seed") with
                             | Some sd -> Game.Managers.kittenFromSeed sd
                             | None ->
                                 // loadCompressed: _splitSSN(ssn, 7) base-100
                                 let merged = jnumF (jget kv "ssn") |> Option.defaultValue 0.0
                                 let mutable m = merged
                                 let vals = [ for _ in 1..7 do
                                                  let v = m % 100.0
                                                  m <- (m - v) / 100.0
                                                  yield v ]
                                 let idx i = int vals.[i]
                                 let name =
                                     match jstrF (jget kv "name") with
                                     | Some s -> s
                                     | None -> Game.Catalog.Village.names.[idx 0]
                                 let surname =
                                     match jstrF (jget kv "surname") with
                                     | Some s -> s
                                     | None -> Game.Catalog.Village.surnames.[idx 1]
                                 { Game.Managers.kittenFromSeed 0 with
                                     Seed = 0
                                     Name = name
                                     Surname = surname
                                     Trait = Game.Catalog.Village.traitDefs.[idx 3].Name
                                     Age = vals.[2]
                                     Color = idx 4
                                     Variety = idx 5
                                     Rarity = idx 6 }
                         let cap (v: float) = if v > 20001.0 then 20001.0 else v
                         let skills =
                             match jget kv "skills" with
                             | Some (JNum f) -> jobNames |> List.map (fun j -> (j, cap f)) |> Map.ofList
                             | Some (JArr xs) ->
                                 jobNames
                                 |> List.mapi (fun i j ->
                                     (j, cap (match xs |> List.tryItem i with Some (JNum f) -> f | _ -> 0.0)))
                                 |> Map.ofList
                             | _ -> jobNames |> List.map (fun j -> (j, 0.0)) |> Map.ofList
                         let job =
                             match jget kv "job" with
                             | Some (JNum i) -> (match jobNames |> List.tryItem (int i) with Some j -> Some j | None -> None)
                             | Some (JStr s) -> Some s
                             | _ -> None
                         { baseK with
                             Skills = skills
                             Exp = jnumF (jget kv "exp") |> Option.defaultValue 0.0
                             Job = job
                             EngineerSpeciality = jstrF (jget kv "engineerSpeciality")
                             Rank = (jnumF (jget kv "rank") |> Option.defaultValue 0.0) |> int
                             IsLeader = jboolF (jget kv "isLeader") |> Option.defaultValue false }
                     | _ -> Game.Managers.kittenFromSeed 0
                 // orig village.load constructs a seedless `new Kitten()` per
                 // saved entry (REVERSED loop) — identity rolls burn game-rand
                 // draws even though loadSeeded/loadCompressed overwrite them
                 (match jget vk "kittens" with
                  | Some (JArr ks) -> for _ in List.rev ks do ignore (Game.Managers.kittenWithGameRand (fun () -> rngDraws <- rngDraws + 1; rand ()))
                  | None -> ())
                 let kittens =
                     match jget vk "kittens" with
                     | Some (JArr ks) -> ks |> List.map loadKitten
                     | _ -> []
                 // orig rebuilds traits with reversed iteration + unshift
                 let mutable traits = []
                 for k in List.rev kittens do
                     if not (traits |> List.contains k.Trait) then traits <- k.Trait :: traits
                 vpool <-
                     { vpool with
                         Kittens = kittens
                         Traits = traits
                         MaxKittens = (jnumF (jget vk "maxKittens") |> Option.defaultValue 0.0) |> int
                         NextKittenProgress = jnumF (jget vk "nextKittenProgress") |> Option.defaultValue 0.0
                         LeaderSeed = (kittens |> List.tryFind (fun k -> k.IsLeader) |> Option.map (fun k -> k.Seed)) }
                 (match jget vk "jobs" with
                  | Some (JArr js) ->
                      for j in js do
                          match j with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   let unl = jboolF (jget jv "unlocked") |> Option.defaultValue false
                                   let value = (jnumF (jget jv "value") |> Option.defaultValue 0.0) |> int
                                   vpool <-
                                       { vpool with
                                           JobUnlocked = (if unl then vpool.JobUnlocked |> Set.add n else vpool.JobUnlocked)
                                           JobValues = vpool.JobValues |> Map.add n value }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // calendar.load
            (match jget root "calendar" with
             | Some (JObj cv) ->
                 calendar <-
                     { calendar with
                         Year = jnumF (jget cv "year") |> Option.defaultValue 0.0
                         Day = jnumF (jget cv "day") |> Option.defaultValue 0.0
                         Season = (jnumF (jget cv "season") |> Option.defaultValue 0.0) |> int
                         Weather = jstrF (jget cv "weather")
                         FestivalDays = (jnumF (jget cv "festivalDays") |> Option.defaultValue 0.0) |> int
                         Cycle = (jnumF (jget cv "cycle") |> Option.defaultValue 0.0) |> int
                         CycleYear = (jnumF (jget cv "cycleYear") |> Option.defaultValue 0.0) |> int
                         CryptoPrice = jnumF (jget cv "cryptoPrice") |> Option.defaultValue 1000.0 }
             | _ -> ())

            // console.load: the craft filter is the only FS-tracked filter
            (match jget root "console" with
             | Some (JObj cv) ->
                 (match jget cv "filters" with
                  | Some (JObj fs0) ->
                      (match jget fs0 "craft" with
                       | Some (JObj fv) -> craftFilterUnlocked <- jboolF (jget fv "unlocked") |> Option.defaultValue false
                       | _ -> ())
                  | _ -> ())
             | _ -> ())

            // telemetry.load
            (match jget root "telemetry" with
             | Some (JObj tv) ->
                 (match jstrF (jget tv "guid") with
                  | Some g -> telemetryGuid <- g
                  | None -> ())
             | _ -> ())

            // challenges.load (+ reserveMan)
            (match jget root "challenges" with
             | Some (JObj cv) ->
                 (match jget cv "challenges" with
                  | Some (JArr cs) ->
                      for c in cs do
                          match c with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match cpool.Challenges |> Map.tryFind n with
                                   | Some st ->
                                       let st1 =
                                           { st with
                                               Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched
                                               On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                               Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                               Active = jboolF (jget jv "active") |> Option.defaultValue st.Active }
                                       // legacy compat: researched && !on → on = 1
                                       let st2 = if st1.Researched && st1.On = 0 then { st1 with On = 1 } else st1
                                       cpool <- { cpool with Challenges = cpool.Challenges |> Map.add n st2 }
                                       // unlocks && on && !active → game.unlock
                                       if st2.On > 0 && not st2.Active then
                                           if n = "1000Years" then
                                               let pm = tpool.CFUs.["temporalPress"]
                                               tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pm with Unlocked = true } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget cv "reserves" with
                  | Some (JObj rv) ->
                      (match jget rv "reserveResources" with
                       | Some (JObj rr) ->
                           for (k, v) in rr do
                               (match v with
                                | JNum f -> reserveResources <- reserveResources |> Map.add k f
                                | _ -> ())
                       | _ -> ())
                      reserveCryochambers <- (jnumF (jget rv "reserveCryochambers") |> Option.defaultValue 0.0) |> int
                  | _ -> ())
             | _ -> ())

            // workshop.load (no unlock re-fire: UpgradeDef carries no unlock
            // data — purchase paths skip it too)
            (match jget root "workshop" with
             | Some (JObj wv) ->
                 (match jget wv "upgrades" with
                  | Some (JArr us) ->
                      for u in us do
                          match u with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.Upgrades |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               Upgrades =
                                                   wpool.Upgrades
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget wv "crafts" with
                  | Some (JArr cs) ->
                      for c0 in cs do
                          match c0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.Crafts |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               Crafts =
                                                   wpool.Crafts
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Value = jnumF (jget jv "value") |> Option.defaultValue st.Value
                                                           Progress = jnumF (jget jv "progress") |> Option.defaultValue st.Progress } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget wv "zebraUpgrades" with
                  | Some (JArr zs) ->
                      for z in zs do
                          match z with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.ZebraUpgrades |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               ZebraUpgrades =
                                                   wpool.ZebraUpgrades
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // diplomacy.load: races
            (match jget root "diplomacy" with
             | Some (JObj dv) ->
                 (match jget dv "races" with
                  | Some (JArr rs) ->
                      for r in rs do
                          match r with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match dp.Races |> Map.tryFind n with
                                   | Some st ->
                                       dp <-
                                           { dp with
                                               Races =
                                                   dp.Races
                                                   |> Map.add n
                                                       { st with
                                                           EmbassyLevel = (jnumF (jget jv "embassyLevel") |> Option.defaultValue 0.0) |> int
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Energy = jnumF (jget jv "energy") |> Option.defaultValue st.Energy
                                                           Duration = jnumF (jget jv "duration") |> Option.defaultValue st.Duration } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // buildings.load: val/on/unlocked + stage (drop-empty semantics:
            // absent keys keep the reset defaults)
            (match jget root "buildings" with
             | Some (JArr bs) ->
                 for b0 in bs do
                     match b0 with
                     | JObj jv ->
                         (match jstrF (jget jv "name") with
                          | Some n ->
                              match bpool.ByName |> Map.tryFind n with
                              | Some st ->
                                  bpool <-
                                      { bpool with
                                          ByName =
                                              bpool.ByName
                                              |> Map.add n
                                                  { st with
                                                      Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                      Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                      On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                      Stage = (jnumF (jget jv "stage") |> Option.defaultValue (float st.Stage)) |> int } }
                          | None -> ())
                     | _ -> ()
             | _ -> ())

            // science.load
            (match jget root "science" with
             | Some (JObj sv) ->
                 (match jget sv "techs" with
                  | Some (JArr ts) ->
                      for t0 in ts do
                          match t0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match spool.Techs |> Map.tryFind n with
                                   | Some st ->
                                       spool <-
                                           { spool with
                                               Techs =
                                                   spool.Techs
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget sv "policies" with
                  | Some (JArr ps) ->
                      for p0 in ps do
                          match p0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match spool.Policies |> Map.tryFind n with
                                   | Some st ->
                                       spool <-
                                           { spool with
                                               Policies =
                                                   spool.Policies
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // achievements.load
            (match jget root "achievements" with
             | Some (JArr a0s) ->
                 for a0 in a0s do
                     match a0 with
                     | JObj jv ->
                         (match jstrF (jget jv "name") with
                          | Some n ->
                              match apool.Achievements |> Map.tryFind n with
                              | Some st ->
                                  apool <-
                                      { apool with
                                          Achievements =
                                              apool.Achievements
                                              |> Map.add n
                                                  { st with
                                                      Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                      StarUnlocked = jboolF (jget jv "starUnlocked") |> Option.defaultValue st.StarUnlocked } }
                          | None -> ())
                     | _ -> ()
             | _ -> ())
            (match jget root "ach" with
             | Some (JObj av) ->
                 (match jget av "badges" with
                  | Some (JArr bs) ->
                      for b0 in bs do
                          match b0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match apool.Badges |> Map.tryFind n with
                                   | Some st ->
                                       apool <-
                                           { apool with
                                               Badges =
                                                   apool.Badges
                                                   |> Map.add n { st with Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // religion.load (+ legacy tcratio tier derivation)
            (match jget root "religion" with
             | Some (JObj rv) ->
                 rpool <-
                     { rpool with
                         Faith = jnumF (jget rv "faith") |> Option.defaultValue 0.0
                         Corruption = jnumF (jget rv "corruption") |> Option.defaultValue 0.0
                         FaithRatio = jnumF (jget rv "faithRatio") |> Option.defaultValue 0.0
                         TranscendenceTier = (jnumF (jget rv "transcendenceTier") |> Option.defaultValue 0.0) |> int
                         ActiveHolyGenocide = (jnumF (jget rv "activeHolyGenocide") |> Option.defaultValue 0.0) |> int
                         NecrocornDeficit = jnumF (jget rv "necrocornDeficit") |> Option.defaultValue 0.0 }
                 if rpool.TranscendenceTier = 0 then
                     match jnumF (jget rv "tcratio") with
                     | Some tc when tc > 0.0 ->
                         let tier = Game.Math.jsRound (System.Math.Log (10.0 * Game.Math.getUnlimitedDR tc 0.1))
                         rpool <- { rpool with TranscendenceTier = max 0.0 tier |> int }
                     | _ -> ()
                 (match jget rv "zu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.ZUs |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                ZUs =
                                                    rpool.ZUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget rv "ru" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.RUs |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                RUs =
                                                    rpool.RUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget rv "tu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.TUs |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                TUs =
                                                    rpool.TUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget rv "pact" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.Pacts |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                Pacts =
                                                    rpool.Pacts
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // religion.afterLoad TU tier unlocks: TUDef carries no tier
                 // data and the tier is 0 in every reachable state — the save's
                 // own unlocked flags carry the state (no-op seam)
             | _ -> ())

            // space.load: metas + reversed unlock loops
            (match jget root "space" with
             | Some (JObj sv) ->
                 (match jget sv "programs" with
                  | Some (JArr ps) ->
                      for p0 in ps do
                          match p0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match spacep.Programs |> Map.tryFind n with
                                    | Some st ->
                                        spacep <-
                                            { spacep with
                                                Programs =
                                                    spacep.Programs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget sv "planets" with
                  | Some (JArr pls) ->
                      for pl in pls do
                          match pl with
                          | JObj pv ->
                              (match jstrF (jget pv "name") with
                               | Some pn ->
                                   (match spacep.Planets |> Map.tryFind pn with
                                    | Some st ->
                                        spacep <-
                                            { spacep with
                                                Planets =
                                                    spacep.Planets
                                                    |> Map.add pn
                                                        { st with
                                                            Reached = jboolF (jget pv "reached") |> Option.defaultValue st.Reached
                                                            Unlocked = jboolF (jget pv "unlocked") |> Option.defaultValue st.Unlocked
                                                            RouteDays = jnumF (jget pv "routeDays") |> Option.defaultValue st.RouteDays } }
                                    | None -> ())
                                   (match jget pv "buildings" with
                                    | Some (JArr bs) ->
                                        for b0 in bs do
                                            match b0 with
                                            | JObj jv ->
                                                (match jstrF (jget jv "name") with
                                                 | Some n ->
                                                     (match spacep.Buildings |> Map.tryFind n with
                                                      | Some st ->
                                                          spacep <-
                                                              { spacep with
                                                                  Buildings =
                                                                      spacep.Buildings
                                                                      |> Map.add n
                                                                          { st with
                                                                              Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                                              On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                                              Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                                      | None -> ())
                                                 | None -> ())
                                            | _ -> ()
                                    | _ -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // load fan-outs: val>0 metas re-unlock their chains (reversed)
                 for pd in List.rev Game.Catalog.Space.programDefs do
                     let m = spacep.Programs.[pd.Name]
                     if m.Val > 0 then
                         for pn in pd.UnlocksPlanets do
                             let pl = spacep.Planets.[pn]
                             spacep <- { spacep with Planets = spacep.Planets |> Map.add pn { pl with Unlocked = true } }
                         for mn in pd.UnlocksMissions do
                             let m0 = spacep.Programs.[mn]
                             spacep <- { spacep with Programs = spacep.Programs |> Map.add mn { m0 with Unlocked = true } }
                         for pol in pd.UnlocksPolicies do
                             match spool.Policies |> Map.tryFind pol with
                             | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                             | None -> ()
                 for bd in List.rev Game.Catalog.Space.buildingDefs do
                     let m = spacep.Buildings.[bd.Name]
                     if m.Val > 0 then
                         for pol in bd.UnlocksPolicies do
                             match spool.Policies |> Map.tryFind pol with
                             | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                             | None -> ()
             | _ -> ())

            // time.load
            (match jget root "time" with
             | Some (JObj tv) ->
                 tpool <-
                     { tpool with
                         Flux = jnumF (jget tv "flux") |> Option.defaultValue tpool.Flux
                         Heat = jnumF (jget tv "heat") |> Option.defaultValue tpool.Heat
                         TestShatter = (jnumF (jget tv "testShatter") |> Option.defaultValue (float tpool.TestShatter)) |> int
                         IsAccelerated = jboolF (jget tv "isAccelerated") |> Option.defaultValue tpool.IsAccelerated }
                 (match jget tv "cfu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match tpool.CFUs |> Map.tryFind n with
                                    | Some st ->
                                        let st1 =
                                            { st with
                                                Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked }
                                        let st2 =
                                            match jnumF (jget jv "heat") with
                                            | Some h -> { st1 with Heat = h }
                                            | None -> st1
                                        let st3 =
                                            match jnumF (jget jv "delayTicks") with
                                            | Some d -> { st2 with DelayTicks = int d }
                                            | None -> st2
                                        let st4 =
                                            match jget jv "isAutomationEnabled" with
                                            | Some (JBool b) -> { st3 with IsAutomationEnabled = Some b }
                                            | _ -> st3
                                        tpool <- { tpool with CFUs = tpool.CFUs |> Map.add n st4 }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget tv "vsu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match tpool.VSUs |> Map.tryFind n with
                                    | Some st ->
                                        tpool <-
                                            { tpool with
                                                VSUs =
                                                    tpool.VSUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked =
                                                                (match jboolF (jget jv "unlocked") with
                                                                 | Some u -> u
                                                                 | None -> st.Unlocked) } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // timeBoiler unlocks with the blast furnace
                 let bfVal = tpool.CFUs.["blastFurnace"].Val
                 let tb = tpool.CFUs.["timeBoiler"]
                 tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "timeBoiler" { tb with Unlocked = bfVal > 0 } }
                 // queueSources
                 (match jget tv "queueSources" with
                  | Some (JObj qs) ->
                      let mutable s = Set.empty
                      for (k, v) in qs do
                          match v with
                          | JBool true -> s <- s |> Set.add k
                          | _ -> ()
                      queueSourcesUnlocked <- s
                  | _ -> ())
                 // gainTemporalFlux(ts) — calendar gate, fake clock delta
                 (match jnumF (jget tv "timestamp") with
                  | Some ts ->
                      let calResearched = (match spool.Techs |> Map.tryFind "calendar" with Some t -> t.Researched | None -> false)
                      if calResearched then
                          let delta = (1759000000000.0 + float curLogTick * 1000.0) - ts
                          if delta > 0.0 then
                              refreshCache ()
                              let ta = tpool.CFUs.["temporalAccelerator"]
                              let energyRatio = 1.0 + float ta.Val * (ta.Eff |> Map.tryFind "timeRatio" |> Option.defaultValue 0.0)
                              let gained = Game.Math.jsRound (delta / 60000.0 * (5.0 * energyRatio))
                              let pool1, _ = Game.Resources.addResEvent calendarDay "temporalFlux" gained pool
                              pool <- pool1
                  | None -> ())
                 // HEADLESS ORIG QUIRK: the next call — queue.updateQueueSourcesArr
                 // — hits a bare `self` (js/time.js L2107) → ReferenceError. The
                 // game.load catch aborts here: prestige/stats/void never load,
                 // afterLoads never run, and currentSaveIsBroken turns every
                 // later save() into a no-op. (Browsers: self = window, no throw.)
                 currentSaveIsBroken <- true
             | _ -> ())

            // managers-loop order: prestige/stats/void sit AFTER time and only
            // restore when the time section was absent (load not broken)
            if not currentSaveIsBroken then
                // prestige.load: perks + researched unlock re-fire
                (match jget root "prestige" with
                 | Some (JObj pv) ->
                     (match jget pv "perks" with
                      | Some (JArr ps) ->
                          for p0 in ps do
                              match p0 with
                              | JObj jv ->
                                  (match jstrF (jget jv "name") with
                                   | Some n ->
                                       (match ppool.Perks |> Map.tryFind n with
                                        | Some st ->
                                            ppool <-
                                                { ppool with
                                                    Perks =
                                                        ppool.Perks
                                                        |> Map.add n
                                                            { st with
                                                                Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                                Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                                        | None -> ())
                                   | None -> ())
                              | _ -> ()
                      | _ -> ())
                     for n in ppool.PerkOrder do
                         let pk = ppool.Perks.[n]
                         if pk.Researched then
                             match (Game.Catalog.World.perkDefs |> List.find (fun d -> d.Name = n)).Unlocks with
                             | Some u ->
                                 let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                                 bpool <- bp2; spool <- sp2; wpool <- wp2
                             | None -> ()
                 | _ -> ())

                // stats.load
                (match jget root "stats" with
                 | Some (JArr xs) ->
                     for x in xs do
                         match x with
                         | JObj jv ->
                             (match jstrF (jget jv "name"), jnumF (jget jv "val") with
                              | Some n, Some v -> stpool <- { stpool with Values = stpool.Values |> Map.add n v }
                              | _ -> ())
                         | _ -> ()
                 | _ -> ())
                (match jget root "statsCurrent" with
                 | Some (JArr xs) ->
                     for x in xs do
                         match x with
                         | JObj jv ->
                             (match jstrF (jget jv "name"), jnumF (jget jv "val") with
                              | Some n, Some v -> stpool <- { stpool with Current = stpool.Current |> Map.add n v }
                              | _ -> ())
                         | _ -> ()
                 | _ -> ())

                // void.load
                (match jget root "void" with
                 | Some (JObj vv) -> voidp <- { voidp with Faction = jstrF (jget vv "faction") }
                 | _ -> ())

                // afterLoad pass runs after the managers loop — never reached
                // when the load is broken
                if not currentSaveIsBroken then
                    for n in List.rev spool.TechOrder do
                        let t = spool.Techs.[n]
                        if t.Researched then
                            // orig afterLoad re-runs tech handlers (L2339-2341)
                            if n = "cryptotheology" then queueSourcesUnlocked <- Set.add "transcendenceUpgrades" queueSourcesUnlocked
                            if n = "voidSpace" then queueSourcesUnlocked <- Set.add "voidSpace" queueSourcesUnlocked
                            match t.Def.Unlocks with
                            | Some u ->
                                vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                                let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades [] u.Crafts bpool spool wpool
                                bpool <- bp2; spool <- sp2; wpool <- wp2
                            | None -> ()

            // game.save tail: karmaKittens / ironWill / deadKittens
            (match jget root "game" with
             | Some (JObj gv) ->
                 let karma = (jnumF (jget gv "karmaKittens") |> Option.defaultValue 0.0) |> int
                 pool <- { pool with KarmaKittens = karma }
                 ironWill <- jboolF (jget gv "ironWill") |> Option.defaultValue true
                 // deadKittens sets only game.deadKittens (no FS field) — the
                 // kittensDead STAT lives in the stats section, skipped when
                 // broken
             | _ -> ())

            // calculateAllEffects + updateMaxValueAll + updateCaches
            calculateAllTime ()
            pool <- Game.Resources.updateMaxValueAll (capCtx ()) pool
            refreshCache ()
            // game.load tail: village.updateHappines() with the loaded state
            let luxCountLoad =
                pool.Order
                |> List.sumBy (fun n ->
                    match Game.Resources.get pool n with
                    | Some r when r.Def.Category <> "common" && r.Value > 0.0 -> 1
                    | _ -> 0)
            let hctxLoad : Game.Happiness.HappinessContext =
                { Game.Happiness.freshHappinessContext with
                    LuxuryCount = luxCountLoad
                    FestivalDays = calendar.FestivalDays
                    GetEffect = Game.Effects.getEffect cache }
            // orig reads sim.maxKittens here — village.load restores
            // village.maxKittens but NOT sim.maxKittens (still 0 from reset)
            vpool <- { vpool with Happiness = Game.Happiness.updateHappiness hctxLoad vpool.Kittens.Length 0 }
        | _ -> failwith "save blob is not a JSON object"

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
              cycleYear = calendar.CycleYear
              cryptoPrice = calendar.CryptoPrice
              festivalDays = calendar.FestivalDays }
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
        let policies =
            [ for n in spool.PolicyOrder do
                let pol = spool.Policies.[n]
                yield (n, (pol.Unlocked, pol.Researched)) ]
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
                yield (n, (r.Unlocked, r.EmbassyLevel, r.Energy, r.Duration)) ]
        let statsSnap = stpool.Values |> Map.toList
        let statsCurrentSnap = stpool.Current |> Map.toList
        let achSnap =
            apool.AchievementOrder
            |> List.map (fun n ->
                let a = apool.Achievements.[n]
                (n, (a.Unlocked, a.StarUnlocked)))
        let badgeSnap =
            apool.BadgeOrder |> List.map (fun n -> (n, apool.Badges.[n].Unlocked))
        let polSnap =
            [ for n in spool.PolicyOrder do
                let pol = spool.Policies.[n]
                yield (n, (pol.Unlocked, pol.Researched)) ]
        let challengeSnap =
            [ for n in cpool.Order do
                let c = cpool.Challenges.[n]
                yield (n, (c.Unlocked, c.Pending, c.Active, c.Researched, c.On)) ]
        let kittenSnap =
            vpool.Kittens
            |> List.map (fun k ->
                (k.Name, k.Surname, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, k.Rank, k.Exp, k.Job, k.Seed))
        let reservesSnap =
            (reserveResources |> Map.toList |> List.sortBy fst,
             reserveKittens.Length, reserveCryochambers)
        let pactSnap =
            [ for n in rpool.PactOrder do
                let p = rpool.Pacts.[n]
                yield (n, (p.Val, p.On, p.Unlocked)) ]
        let cfuSnap = tpool.CfuOrder |> List.map (fun n -> (n, (tpool.CFUs.[n].Val, tpool.CFUs.[n].On, tpool.CFUs.[n].Heat, tpool.CFUs.[n].DelayTicks, tpool.CFUs.[n].IsAutomationEnabled)))
        let vsuSnap = tpool.VsuOrder |> List.map (fun n -> (n, (tpool.VSUs.[n].Val, tpool.VSUs.[n].On)))
        let timeSnap = (tpool.Flux, tpool.Heat, tpool.TestShatter, tpool.IsAccelerated, cfuSnap, vsuSnap)
        let voidSnap = (voidp.VuOrder |> List.map (fun n -> (n, (voidp.VUs.[n].Val, voidp.VUs.[n].On, voidp.VUs.[n].Unlocked))), voidp.Faction)
        let observeSnap = calendar.ObserveRemainingTime
        let winterSnap = winterCatnipPerTick
        let spaceSnap =
            let metaJson (n: string) (m: Game.Space.SpaceMeta) =
                sprintf "\"%s\":{\"val\":%d,\"on\":%d,\"unlocked\":%s}" (esc n) m.Val m.On (if m.Unlocked then "true" else "false")
            let progs = spacep.ProgramOrder |> List.map (fun n -> metaJson n spacep.Programs.[n]) |> String.concat ","
            let blds = spacep.BuildingOrder |> List.map (fun n -> metaJson n spacep.Buildings.[n]) |> String.concat ","
            let pls =
                spacep.PlanetOrder
                |> List.map (fun n ->
                    let pl = spacep.Planets.[n]
                    sprintf "\"%s\":{\"reached\":%s,\"unlocked\":%s,\"routeDays\":%s}" (esc n) (if pl.Reached then "true" else "false") (if pl.Unlocked then "true" else "false") (num pl.RouteDays))
                |> String.concat ","
            sprintf "{\"programs\":{%s},\"buildings\":{%s},\"planets\":{%s}}" progs blds pls
        let techs = spool.TechOrder |> List.filter (fun n -> spool.Techs.[n].Researched) |> List.sort
        let upgrades = wpool.UpgradeOrder |> List.filter (fun n -> wpool.Upgrades.[n].Researched) |> List.sort
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
         religion, diplomacy, rpool.Faith, rpool.FaithRatio, rpool.TranscendenceTier, rpool.Corruption,
         statsSnap, statsCurrentSnap, achSnap, badgeSnap,
         challengeSnap, pactSnap, reservesSnap, kittenSnap, timeSnap, voidSnap, observeSnap, winterSnap, vpool.Happiness, spaceSnap)

    // gtick: the port's game.tick() — updateModel order:
    // resPool.update → bld.update → village sim (+ kittens sync) → timer
    // (updateCaches+updateResources every 5 ticks) → calendar.tick
    let gtick () =
        // game.update() head (L4453-4461): autosave countdown; save() resets
        // ticksBeforeSave to autosaveFrequency (400)
        ticksBeforeSave <- ticksBeforeSave - 1
        if ticksBeforeSave = 0 then
            // broken save state: save() early-returns WITHOUT resetting the
            // counter — it decrements forever, no further autosaves
            if not currentSaveIsBroken then
                lcStorageSave <- buildSaveString ()
                ticksBeforeSave <- 400
        // orig game.tick (L4464-4473): updateModel — run TWICE on accelerated
        // even ticks (the Tempus Fugit hack) — then time.update, timers, calendar.
        updateModelBody ()
        if tpool.IsAccelerated && ticks % 2 = 0 then updateModelBody ()


        // space.update (L1100-1145): routes + planet reach + building unlocks
        spacep <-
            Game.Space.update (Game.Effects.getEffect cache) (fun _ -> queueSourcesUnlocked <- Set.add "spaceBuilding" queueSourcesUnlocked) Game.Calendar.ticksPerDay spacep
        spacep <- Game.Space.unlockBuildings (fun tn -> (match spool.Techs |> Map.tryFind tn with Some x -> x.Researched | None -> false)) spacep
        // time.update (time-02/03): accelerated flux burn + heat engine +
        // blastFurnace/timeBoiler actions. calculateRedshift is a bookkeeping
        // no-op (opts.enableRedshift false; timestamp advance on the fake clock).
        let tctx : Game.Time.TimeUpdateContext =
            { GetEffect = Game.Effects.getEffect cache
              Shatter = fun amt -> if tpool.TestShatter = 1 then shatterCoreGroupCycles amt else shatterCore amt
              GetTpool = fun () -> tpool
              SetTpool = fun tp -> tpool <- tp }
        let poolT = Game.Time.update tctx pool
        pool <- poolT

        // timer.update — handlers fire in registration order:
        //   village.updateResourceProduction (10) → updateCaches (5)
        //   → winter catnip (25) → ach (50)
        prodPhase <- prodPhase - 1
        if prodPhase <= 0 then
            prodPhase <- 10
            prodCache <- Some(updateResourceProduction ())
        updateCachesPhase <- updateCachesPhase - 1
        if updateCachesPhase <= 0 then
            updateCachesPhase <- 5
            refreshCache ()
        // achievements poll (freq 50; orig game.js L2626). The lostDates title
        // gamble consumes ONE uniform draw per poll.
        achPhase <- achPhase - 1
        if achPhase <= 0 then
            achPhase <- 50
            let yearBefore = calendar.Year
            let _ = yearBefore
            let actx : Game.Achievements.AchContext =
                { ResValue = getResValue
                  KittensResMax = (get pool "kittens" |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)
                  DeadKittens = Game.Stats.getStat stpool "kittensDead"
                  Happiness = vpool.Happiness
                  KittenCount = vpool.Kittens.Length
                  MaxKittens = vpool.MaxKittens
                  Faith = rpool.Faith
                  FestivalDays = float calendar.FestivalDays
                  TrueYear = (calendar.Day / 100.0 + float calendar.Season) / 4.0 + calendar.Year - tpool.Flux // calendar.trueYear: /seasonsPerYear, minus time.flux
                  ObservatoryOn = (match Game.Buildings.get bpool "observatory" with Some b -> b.On | None -> 0)
                  ZigguratVal = (match Game.Buildings.get bpool "ziggurat" with Some b -> b.Val | None -> 0)
                  LeviathanEnergy = dp.Races.["leviathans"].Energy
                  TotalYears = Game.Stats.getStat stpool "totalYears"
                  TotalResets = Game.Stats.getStat stpool "totalResets"
                  JupiterAscending = (Game.Space.getProgram spacep "orbitalLaunch").On > 0 && calendar.Year <= 1.0
                  MoonMissionOn = (Game.Space.getProgram spacep "moonMission").On > 0
                  ParagonValue = getResValue "paragon"
                  IronWill = ironWill
                  MineVal = (match Game.Buildings.get bpool "mine" with Some b -> b.Val | None -> 0)
                  WarehouseVal = (match Game.Buildings.get bpool "warehouse" with Some b -> b.Val | None -> 0)
                  PastureVal = (match Game.Buildings.get bpool "pasture" with Some b -> b.Val | None -> 0)
                  MagnetoVal = (match Game.Buildings.get bpool "magneto" with Some b -> b.Val | None -> 0)
                  FactoryVal = (match Game.Buildings.get bpool "factory" with Some b -> b.Val | None -> 0)
                  SteamworksVal = (match Game.Buildings.get bpool "steamworks" with Some b -> b.Val | None -> 0) }
            let apool', _ = Game.Achievements.update actx (fun () -> rngDraws <- rngDraws + 1; rand ()) apool
            apool <- apool'
        // winter catnip estimate (freq 25; game.js L2657): catnip perTick with
        // the winter modifier table (season index 3)
        winterPhase <- winterPhase - 1
        if winterPhase <= 0 then
            winterPhase <- 25
            // orig passes a pseudo-season that calcResourcePerTick never reads
            // (getWeatherMod uses getCurSeason) — the estimate is the plain
            // current-season computation
            let pctxWinter = prodCtx ()
            winterCatnipPerTick <- Game.Production.calcResourcePerTick pctxWinter pool "catnip" 
        // (policy recalc 25 / achievements 50 / winter catnip 25 / time queue 10 /
        //  server events: seams)

        let yearBeforeTick = calendar.Year
        calendar <- Game.Calendar.tick (calCtx ()) calendar
        if calendar.Year > yearBeforeTick then
            let years = calendar.Year - yearBeforeTick
            stpool <- Game.Stats.bumpStat "totalYears" years stpool
            // calendar-09 onNewYear slice: millennium paragon
            if calendar.Year % 1000.0 = 0.0 then
                let poolY, _ = Game.Resources.addResEvent calendarDay "paragon" 1.0 pool
                pool <- poolY
                stpool <- Game.Stats.bumpStat "totalParagon" 1.0 stpool
                // pactsMilleniumKarmaKittens: karma seam (pactsAvailable 0 at fresh)
                ()
            // elder visit roll — only draws when a black pyramid stands
            let pyramidVal = float (Game.Religion.getZU rpool "blackPyramid").Val
            if pyramidVal > 0.0 then
                let markerVal = float (Game.Religion.getZU rpool "marker").Val
                let elderRoll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 1000.0
                if float elderRoll < 35.0 * pyramidVal * years * (1.0 + 0.1 * markerVal) then
                    dp <- Game.Diplomacy.unlockElders dp 400.0
            if dp.Races.["leviathans"].Unlocked then
                let c = cpool.Challenges.["blackSky"]
                cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "blackSky" { c with Unlocked = true } }
            // temporalFlux year production (effect 0 at fresh — addRes 0)
            let yearFlux = Game.Effects.getEffect cache "temporalFluxProduction"
            let poolY2, _ = Game.Resources.addResEvent calendarDay "temporalFlux" (yearFlux * years) pool
            pool <- poolY2
            refreshCache () // upgrade({policies: [authocracy + 2 relation policies]})
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
            | [ "forceperk"; perkName ] ->
                // D014 injection: force-own a perk (metaphysics gating etc.)
                let meta = ppool.Perks.[perkName]
                ppool <- { ppool with Perks = ppool.Perks |> Map.add perkName { meta with Researched = true; Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "forcerace"; raceName ] ->
                // D014 injection: unlock a race (leviathans etc.)
                let race = dp.Races.[raceName]
                dp <- { dp with Races = dp.Races |> Map.add raceName { race with Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "forcetech"; techName ] ->
                // D014 injection: mark a tech researched (antimatter etc.)
                let t = spool.Techs.[techName]
                spool <- { spool with Techs = spool.Techs |> Map.add techName { t with Researched = true; Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "forceupg"; upName ] ->
                // D014 injection: mark a workshop upgrade researched
                let u = wpool.Upgrades.[upName]
                wpool <- { wpool with Upgrades = wpool.Upgrades |> Map.add upName { u with Researched = true; Unlocked = true } }
                calculateAllTime ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "forcepolicy"; polName ] ->
                // D014 injection: mark a policy researched (shark scribes etc.)
                let pol = spool.Policies.[polName]
                spool <- { spool with Policies = spool.Policies |> Map.add polName { pol with Researched = true; Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "necroff"; days ] ->
                // religion.fastforward(daysOffset) at this slice: no paradox
                // chance, Order of the Void seam → necrocornFastForward only
                let days = float days
                let times = days * 10.0
                let rpool', pool' = Game.Religion.necrocornFastForward calendarDay (corruptionCtx ()) days times pool rpool
                rpool <- rpool'
                pool <- pool'
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "day" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum calendar.Day) :: actionLog
            | [ "corruption" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum rpool.Corruption) :: actionLog
            | [ "setchallenge"; name; state ] ->
                // D014 injection: controller-path enable/disable/complete
                match state with
                | "active" ->
                    // the injection sets fields unconditionally (mirrors the
                    // orig-driver hook, not the controller's unlocked gate)
                    let c = cpool.Challenges.[name]
                    cpool <- { cpool with Challenges = cpool.Challenges |> Map.add name { c with Active = true; Unlocked = true } }
                | "inactive" ->
                    let c = cpool.Challenges.[name]
                    cpool <- { cpool with Challenges = cpool.Challenges |> Map.add name { c with Active = false } }
                | "pending" ->
                    let c = cpool.Challenges.[name]
                    cpool <- { cpool with Challenges = cpool.Challenges |> Map.add name { c with Pending = true } }
                // ("unpending" matches no orig-driver arm — no-op both sides)
                | "complete" ->
                    // the resop injection sets fields directly (no active gate)
                    let c = cpool.Challenges.[name]
                    cpool <- { cpool with Challenges = cpool.Challenges |> Map.add name { c with Researched = true; On = c.On + 1; Active = false } }
                    if name = "1000Years" then
                        let mm = tpool.CFUs.["temporalPress"]
                        tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { mm with Unlocked = true } }
                    calculateAllTime ()
                | _ -> ()
                calculateAllTime () // the resop injection calls calculateAllEffects for every state
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "forcepact"; name ] ->
                // D014 injection: unlock a pact (pactsAvailable gating)
                let p = rpool.Pacts.[name]
                rpool <- { rpool with Pacts = rpool.Pacts |> Map.add name { p with Unlocked = true } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "startobserve" ] ->
                // D014 injection: an astro event fired (observeRemainingTime = 300)
                calendar <- { calendar with ObserveRemainingTime = 300 }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "setres"; resName; value ] ->
                // D014 injection: raw resource state set (mirrors res.value = n)
                let res = pool.ByName[resName]
                pool <- { pool with ByName = pool.ByName |> Map.add resName { res with Value = float value } }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "setcfu"; name; prop; value ] ->
                // D014 injection: force a CFU meta field
                let m' = tpool.CFUs.[name]
                let m'' =
                    match prop with
                    | "val" -> { m' with Val = int value }
                    | "on" -> { m' with On = int value }
                    | "unlocked" -> { m' with Unlocked = value = "1" }
                    | "automation" -> { m' with IsAutomationEnabled = Some (value = "1") }
                    | "automation-null" -> { m' with IsAutomationEnabled = None }
                    | "delay" -> { m' with DelayTicks = int value }
                    | "heat" -> { m' with Heat = float value }
                    | _ -> m'
                tpool <- { tpool with CFUs = tpool.CFUs |> Map.add name m'' }
                calculateAllTime () // the resop injection mirrors orig-driver setcfu
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "setheat"; value ] ->
                // D014 injection: time.heat = n
                tpool <- { tpool with Heat = float value }
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "lzprobe" ] ->
                let sample = "kittens game save probe: {\"saveVersion\":15,\"catnip\":54.61999999999768,\"кітки\":\"太陽\"} 0123456789 aaaabbbbbb"
                let utf16 = Game.LzString.compressToUTF16 sample
                let b64 = Game.LzString.compressToBase64 sample
                let sha (s: string) =
                    use sha256 = System.Security.Cryptography.SHA256.Create()
                    System.BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes s)).Replace("-", "").ToLowerInvariant()
                System.Console.WriteLine("LZPROBE utf16len=" + string utf16.Length + " utf16sha=" + sha utf16)
                System.Console.WriteLine("LZPROBE b64len=" + string b64.Length + " b64sha=" + sha b64)
                System.Console.WriteLine("LZPROBE roundtrip=" + (if (Game.LzString.decompressFromUTF16 utf16) = Some sample then "true" else "false"))
                actionLog <- (curLogTick, "resop", m.Args, RNum (float utf16.Length)) :: actionLog
            | [ "savedump" ] ->
                let sha (s: string) =
                    use sha256 = System.Security.Cryptography.SHA256.Create()
                    System.BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes s)).Replace("-", "").ToLowerInvariant()
                System.Console.WriteLine("SAVEDUMP len=" + string lcStorageSave.Length + " sha=" + sha lcStorageSave)
                System.Console.WriteLine("SAVEBLOB " + lcStorageSave)
                actionLog <- (curLogTick, "resop", m.Args, RNum (float lcStorageSave.Length)) :: actionLog
            | [ "loadfile"; path ] ->
                // D014 harness input: load an orig-produced blob from disk
                let loaded = System.IO.File.ReadAllText(path)
                lcStorageSave <- loaded
                applySaveBlob loaded
                actionLog <- (curLogTick, "resop", m.Args, RNum (float loaded.Length)) :: actionLog
            | [ "saveexport" ] ->
                // orig saveExport: JSON.stringify(save()) → compressToBase64 —
                // the PLAIN stringify (nulls kept)
                let dataString = buildSaveStringMode true
                let enc = Game.LzString.compressToBase64 dataString
                let sha (s: string) =
                    use sha256 = System.Security.Cryptography.SHA256.Create()
                    System.BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes s)).Replace("-", "").ToLowerInvariant()
                System.Console.WriteLine("EXPORT len=" + string enc.Length + " sha=" + sha enc)
                System.Console.WriteLine("EXPORTBLOB " + enc)
                actionLog <- (curLogTick, "resop", m.Args, RNum (float enc.Length)) :: actionLog
            | [ "importfile"; path ] ->
                // orig _loadSaveJson: decompress, integrity check, store the LZ
                // blob itself, then load
                let lz = System.IO.File.ReadAllText(path)
                let b64 = Game.LzString.decompressFromBase64 lz
                let utf16 = Game.LzString.decompressFromUTF16 lz
                let json =
                    if b64.IsSome && b64.Value.Length > 0 && b64.Value.[0] = '{' then b64.Value
                    elif utf16.IsSome && utf16.Value.Length > 0 && utf16.Value.[0] = '{' then utf16.Value
                    else failwith "Integrity check failure"
                lcStorageSave <- lz
                applySaveBlob lz
                actionLog <- (curLogTick, "resop", m.Args, RNum (float json.Length)) :: actionLog
            | [ "esprobe" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum (getResProductionCached () |> Map.tryFind "ESwood" |> Option.defaultValue 0.0)) :: actionLog
            | [ "addkitten" ] ->
                let vp' = Game.Managers.addKitten (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
                vpool <- vp'
                let kittensRes = pool.ByName["kittens"]
                pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length; MaxValue = float vpool.MaxKittens } }
                stpool <- Game.Stats.bumpStat "totalKittens" 1.0 stpool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "skillprobe" ] ->
                for k in vpool.Kittens do
                    printfn "SKILLPROBE %s" (System.Text.Json.JsonSerializer.Serialize(
                        k.Skills |> Map.toList |> List.map (fun (a, b) -> {| s = a; v = b |})))
                printfn "SKILLPROBE-END"
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "leader"; idx ] ->
                // village.makeLeader(sim.kittens[idx]); -1 clears
                let i = int idx
                let seed =
                    if i >= 0 && i < vpool.Kittens.Length then Some vpool.Kittens.[i].Seed else None
                let theocracyBlocks = false // policy seam
                vpool <- Game.Managers.makeLeader (Game.Challenges.isActive cpool "anarchy") theocracyBlocks seed vpool
                refreshCache () // trait effects re-read via leaderTrait
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | "promote" :: idxRest ->
                let i = int (List.head idxRest)
                let rank = if idxRest.Length >= 2 then Some (int idxRest.[1]) else None
                // orig promote(undefined kitten) returns 0 quietly
                if i >= 0 && i < vpool.Kittens.Length then
                    let seed = vpool.Kittens.[i].Seed
                    let vp2, p2, code = Game.Managers.promote (Game.Challenges.isActive cpool "anarchy") rank seed vpool pool
                    vpool <- vp2
                    pool <- p2
                    refreshCache ()
                    actionLog <- (curLogTick, "resop", m.Args, RNum (float code)) :: actionLog
                else actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "reserves"; isIW ] ->
                // reserveMan.calculateReserves(isIronWillPending)
                calculateReserves (isIW = "1")
                actionLog <- (curLogTick, "resop", m.Args, RNum (float reserveCryochambers)) :: actionLog
            | [ "reservesadd" ] ->
                // reserveMan.addReserves
                addReserves ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "shattergc"; amt ] ->
                // D014 injection: game.time.shatterInGroupCycles(amt)
                shatterCoreGroupCycles (int amt)
                refreshCache ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "shatteric"; amt ] ->
                // D014 injection: game.time.shatterInCycles(amt)
                shatterCoreCycles (int amt)
                refreshCache ()
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "redshift"; days ] ->
                // D014 injection: game.time.applyRedshift(days) with the calendar
                let events = applyRedshiftCore (float days) false
                actionLog <- (curLogTick, "resop", m.Args, RNum events) :: actionLog
            | [ "unlockalltime" ] ->
                // time.unlockAll dev helper
                tpool <- Game.Time.unlockAll tpool
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "ffcal"; days ] ->
                // calendar-07 fastForward EV engine (fresh-slice shape)
                let days = float days
                // astro events EV (library/astronomy gate)
                if libraryOn () || astronomyResearched () then
                    let eventChance = (0.0025 + Game.Effects.getEffect cache "starEventChance")
                    let numberEvents = Game.Math.jsRound (days * eventChance)
                    if numberEvents > 0.0 && astronomyResearched () then
                        let pool1, _ = Game.Resources.addResEvent calendarDay "starchart" numberEvents pool
                        pool <- pool1
                    let pool2, _ = Game.Resources.addResEvent calendarDay "science" (numberEvents * 25.0) pool
                    pool <- pool2
                // meteors EV
                if miningResearched () then
                    let numberEvents = Game.Math.jsRound (days * 10.0 / 10000.0)
                    let mineralsAmt = 50.0 + 25.0 * Game.Effects.getEffect cache "mineralsRatio"
                    let pool1, _ = Game.Resources.addResEvent calendarDay "minerals" (numberEvents * mineralsAmt) pool
                    pool <- pool1
                // rift EV
                let riftEvents = Game.Math.jsRound (days * Game.Effects.getEffect cache "riftChance")
                let poolR, _ = Game.Resources.addResEvent calendarDay "unicorns" (riftEvents * 500.0) pool
                pool <- poolR
                // alicorn EV
                let aliChance =
                    Game.Effects.getEffect cache "alicornChance"
                    * (1.0 + Game.Math.getLimitedDR (Game.Effects.getEffect cache "alicornPerTickRatio") 1.2)
                let aliEvents = Game.Math.jsRound (days * aliChance)
                if aliEvents >= 1.0 then
                    let poolA, _ = Game.Resources.addResEvent calendarDay "alicorn" aliEvents pool
                    pool <- poolA
                    refreshCache ()
                // ivory EV (rand(1500) once when events occur)
                let ivEvents = Game.Math.jsRound (days * Game.Effects.getEffect cache "ivoryMeteorChance")
                if ivEvents > 0.0 then
                    let ivoryRoll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 1500.0
                    let ivory = 250.0 + float ivoryRoll
                    let poolI, _ = Game.Resources.addResEvent calendarDay "ivory" (ivory * ivEvents) pool
                    pool <- poolI
                // relic accrual
                let poolRel, _ = Game.Resources.addResPerTick calendarDay "relic" (Game.Effects.getEffect cache "relicPerDay" * days) pool
                pool <- poolRel
                // crypto EV (antimatter-gated logIncrease approximation)
                let antimatter =
                    match spool.Techs |> Map.tryFind "antimatter" with
                    | Some t -> t.Researched
                    | None -> false
                if antimatter then
                    // loopOrGaussianApproximation(days-1, mean 1.2499e-6, var 1.44e-10, ...):
                    // fresh slice delegates to the same loop the math module ports
                    let cryptoBase () : float =
                        let y = (rngDraws <- rngDraws + 1; rand ())
                        if y < 0.3 then Game.Math.log1p ((y - 0.3) / (0.3 * 40000.0))
                        elif y < 0.6 then 0.0
                        else Game.Math.log1p ((y - 0.6) / (0.4 * 40000.0))
                    let logIncrease =
                        Game.Math.loopOrGaussianApproximation
                            (fun () -> rngDraws <- rngDraws + 1; rand ())
                            (days - 1.0) false 1.2499270834635280e-6 1.4427062504448777e-10
                            (Game.Math.log1p (-1.0 / 40000.0))
                            (Game.Math.log1p (1.0 / 40000.0))
                            cryptoBase
                    calendar <- { calendar with CryptoPrice = calendar.CryptoPrice * exp logIncrease }
                // years + millennium paragon
                let yearsOffset = floor (days / 400.0)
                let paragon = floor ((calendar.Year + yearsOffset) / 1000.0) - floor (calendar.Year / 1000.0)
                if paragon > 0.0 then
                    let poolP, _ = Game.Resources.addResEvent calendarDay "paragon" paragon pool
                    pool <- poolP
                    stpool <- Game.Stats.bumpStat "totalParagon" paragon stpool
                calendar <- { calendar with Year = calendar.Year + yearsOffset }
                stpool <- Game.Stats.bumpStat "totalYears" yearsOffset stpool
                refreshCache () // orig fastForward ends with updateCaches
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "buybcoin" ] ->
                // diplomacy.buyBcoin: relics → blackcoin. getCryptoPrice reads
                // server.bcoinPrice (63918) while opts.hodl is on (settings.js
                // default TRUE)
                let relics = getResValue "relic"
                let amt = relics / 63918.0
                let pool1, added = Game.Resources.addResEvent calendarDay "blackcoin" amt pool
                pool <- pool1
                let res = pool.ByName["relic"]
                pool <- { pool with ByName = pool.ByName |> Map.add "relic" { res with Value = 0.0 } }
                actionLog <- (curLogTick, "resop", m.Args, RNum added) :: actionLog
            | [ "sellbcoin" ] ->
                // diplomacy.sellBcoin: blackcoin → relics at the hodl price
                let bcoins = getResValue "blackcoin"
                let amt = bcoins * 63918.0
                let pool1, added = Game.Resources.addResEvent calendarDay "relic" amt pool
                pool <- pool1
                let res = pool.ByName["blackcoin"]
                pool <- { pool with ByName = pool.ByName |> Map.add "blackcoin" { res with Value = 0.0 } }
                actionLog <- (curLogTick, "resop", m.Args, RNum added) :: actionLog
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
                let manpM = Game.Diplomacy.getManpowerCost dp dctxM |> ignore
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
                    (curLogTick, "resop", m.Args, RNum(Game.Resources.getEnergyDelta (energyChallengeResearched ()) (energyChallengeActive ()) pool.EnergyProd pool.EnergyCons))
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
            let affordBefore = Game.Resources.hasRes pool (Game.Buildings.getAllPrices cache (pctx ()) bpool.ByName[bldName] |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            let bpool', pool', built = Game.Buildings.build calendarDay cache (pctx ()) pool n bldName bpool
            bpool <- bpool'
            pool <- pool'
            if built > 0 then
                // orig buildings.js build wrapper L3350-3360: stats + undo
                stpool <- Game.Stats.bumpStat "buildingsConstructed" (float built) stpool
                registerUndo [ { ManagerId = "bld"; Data = Game.Types.BuildUndo(bldName, built) } ]
                if bpool.ByName[bldName].Def.BreaksIronWill then ironWill <- false
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
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades [] u.Crafts bpool spool wpool
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
            let craftName = m.Args.[0]
            let amt = float m.Args.[1]
            // orig craft registers the undo with prices at the PRE-buy ladder
            let craftDef = wpool.Crafts.[craftName]
            let basePrices = Game.Managers.getCraftPrice cache (traditionResearched ()) craftDef.Def
            let prices = basePrices |> List.map (fun p -> (p.Resource, p.Val * ceil amt))
            // move-probe parity: affordBefore reads the RAW-n prices
            let affordBefore = (match Game.Resources.hasRes pool (basePrices |> List.map (fun p -> (p.Resource, p.Val * amt))) 0.0 with true -> true | _ -> false)
            let valueBefore = (match Game.Resources.get pool craftName with Some r -> r.Value | None -> 0.0)
            let pool', wpool', ok = Game.Managers.craft calendarDay cache (traditionResearched ()) (crctx ()) craftName amt pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                // manual game.craft emits NO message — the craft console filter
                // unlocks only via the craftAll msg (js/workshop.js L2813)
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
                let gained = (1.0 + Game.Managers.getResCraftRatio cache (crctx ()) craftName) * ceil amt
                registerUndo [ { ManagerId = "workshop"; Data = Game.Types.CraftUndo(craftName, gained, prices) } ]
            let gainedActual = (match Game.Resources.get pool craftName with Some r -> r.Value | None -> 0.0) - valueBefore
            if not affordBefore || gainedActual < amt then
                let pj =
                    basePrices
                    |> List.map (fun p -> sprintf "{\"name\":\"%s\",\"val\":%s}" (esc p.Resource) (num (p.Val * amt)))
                    |> String.concat ","
                actionLog <-
                    (m.Tick, "craft", m.Args,
                     RText(sprintf "gained %s/%s (affordBefore=%s, prices=[%s])" (num gainedActual) (num amt) (if affordBefore then "true" else "false") pj))
                    :: actionLog
            refreshCache () // orig game.craft → workshop.craft + updateResources (unconditional)
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
            if not ok then
                // orig BuildingNotStackableBtnController.buyItem reasons
                let already = (match spool'.Techs |> Map.tryFind m.Args.[0] with Some t -> t.Researched | None -> false)
                actionLog <- (m.Tick, "research", m.Args, RText(if already then "already-bought" else "cannot-afford")) :: actionLog
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
                      let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades [] u.Crafts bpool spool wpool
                      bpool <- bp2
                      spool <- sp2
                      wpool <- wp2
                  | None -> ()
              | None -> ()
              // tech handlers (js/science.js L808-831): unlock queue sources
              if m.Args.[0] = "cryptotheology" then queueSourcesUnlocked <- Set.add "transcendenceUpgrades" queueSourcesUnlocked
              if m.Args.[0] = "voidSpace" then queueSourcesUnlocked <- Set.add "voidSpace" queueSourcesUnlocked
        | "upgrade" ->
            let pool', wpool', ok = Game.Managers.buyUpgrade calendarDay m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            if not ok then
                let already = (match wpool'.Upgrades |> Map.tryFind m.Args.[0] with Some u -> u.Researched | None -> false)
                actionLog <- (m.Tick, "upgrade", m.Args, RText(if already then "already-bought" else "cannot-afford")) :: actionLog
        | "policy" ->
            // orig PolicyBtnController.buyItem: researched/afford/gates/blocks;
            // require-confirmation auto-OKs through ui.confirm
            let priestLeader =
                match vpool.LeaderSeed with
                | Some seed ->
                    vpool.Kittens
                    |> List.tryFind (fun k -> k.Seed = seed)
                    |> Option.map (fun k -> k.Job = Some "priest")
                    |> Option.defaultValue false
                | None -> false
            let aiLevel =
                (match Game.Buildings.get bpool "aiCore" with
                 | Some b -> b.Def.Effects |> Map.tryFind "aiLevel" |> Option.defaultValue 0.0
                 | None -> 0.0)
            let bctx : Game.Managers.PolicyBuyCtx =
                { Calc = scienceCalcCtx ()
                  GetEffect = Game.Effects.getEffect cache
                  PriestLeader = priestLeader
                  AiLevel = aiLevel
                  Necrocorns = (match get pool "necrocorn" with Some r -> r.Value | None -> 0.0)
                  ActivePacts = Game.Religion.countActivePacts rpool }
            let pool', spool', result = Game.Managers.researchPolicy calendarDay m.Args.[0] bctx pool spool
            pool <- pool'
            spool <- spool'
            match result with
            | "OkBought" ->
                // onPurchase: unlock fan-out (evaluateLocks veto) + jobs
                match spool.Policies.[m.Args.[0]].Def.Unlocks with
                | Some u ->
                    vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                    let pols = u.Policies |> List.filter (fun p0 -> not (policyVeto p0))
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech pols u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                    bpool <- bp2; spool <- sp2; wpool <- wp2
                | None -> ()
                // meta.upgrades → game.upgrade (recalc fan-out; cache refreshes)
                let ups = Game.Catalog.Policies.upgrades |> Map.tryFind m.Args.[0] |> Option.defaultValue []
                if ups <> [] then refreshCache ()
                // the driver path hits require-confirmation → ui.confirm auto-OK:
                // buyItem still RETURNS itemBought:false + this reason (logged)
                actionLog <- (m.Tick, "policy", m.Args, RText "require-confirmation") :: actionLog
                // onResearch: cryochamberExtraction bumps the VSU
                if m.Args.[0] = "cryochamberExtraction" then
                    let v = tpool.VSUs.["usedCryochambers"]
                    tpool <- { tpool with VSUs = tpool.VSUs |> Map.add "usedCryochambers" { v with Val = v.Val + 1; On = v.On + 1; Unlocked = true } }
                refreshCache ()
            | "AlreadyBought" ->
                actionLog <- (m.Tick, "policy", m.Args, RText "already-bought") :: actionLog
            | "CannotAfford" ->
                actionLog <- (m.Tick, "policy", m.Args, RText "cannot-afford") :: actionLog
            | _ ->
                actionLog <- (m.Tick, "policy", m.Args, RText "blocked") :: actionLog
        | "refine" ->
            // orig bld.refineCatnip (js/buildings.js L3003): pay 100 catnip via the
            // button's buyItem prices, gain 1 + craftRatio wood (advancedRefinement
            // seam: isEnriched 50-cost variant, fresh-false)
            let prices = [ ("catnip", 100.0) ]
            if Game.Resources.hasRes pool prices 0.0 then
                let craftRatio = Game.Managers.getResCraftRatio cache (crctx ()) "wood"
                let poolPaid = Game.Resources.payPrices calendarDay pool prices
                let poolGained, _ = Game.Resources.addResEvent calendarDay "wood" (1.0 + craftRatio) poolPaid
                pool <- poolGained
                refreshCache ()
        | "refine" ->
            let prices = [ ("catnip", 100.0) ]
            if Game.Resources.hasRes pool prices 0.0 then
                let craftRatio = Game.Managers.getResCraftRatio cache (crctx ()) "wood"
                let poolPaid = Game.Resources.payPrices calendarDay pool prices
                let poolGained, _ = Game.Resources.addResEvent calendarDay "wood" (1.0 + craftRatio) poolPaid
                pool <- poolGained
                refreshCache ()
        | "hunt"
        | "huntall"
        | "hunthalf"
        | "huntfifth" ->
            let hctx : Game.Village.HuntContext =
              { GetEffect = Game.Effects.getEffect cache
                Rand = fun () -> rngDraws <- rngDraws + 1; rand ()
                Zebras = (match get pool "zebras" with Some z -> z.Value | None -> 0.0)
                IronWill = ironWill
                GoldOreResearched =
                  (match wpool.Upgrades |> Map.tryFind "goldOre" with
                   | Some u -> u.Researched
                   | None -> false)
                AlicornmancyResearched =
                  (match ppool.Perks |> Map.tryFind "alicornmancy" with Some p -> p.Researched | None -> false)
                UnicornPastureVal = 0
                LeaderManagerBonus =
                  (match Game.Managers.leaderTrait vpool with
                   | Some "manager" ->
                       0.5 * (1.0 + Game.Prestige.getBurnedParagonRatio (getResValue "burnedParagon"))
                           * (if (match spool.Policies |> Map.tryFind "monarchy" with Some p -> p.Researched | None -> false) then 1.95 else 1.0)
                   | _ -> 0.0) }
            let manpowerBefore =
                (match Game.Resources.get pool "manpower" with Some m0 -> m0.Value | None -> 0.0)
            match m.Action with
            | "huntall" -> pool <- Game.Village.huntFraction hctx 1.0 pool
            | "hunthalf" -> pool <- Game.Village.huntFraction hctx 2.0 pool
            | "huntfifth" -> pool <- Game.Village.huntFraction hctx 5.0 pool
            | _ -> pool <- Game.Village.huntAll hctx pool
            // a successful hunt always emits the success msg with tag "hunt"
            // (js/village.js gainHuntRes tail) → unlocks the filter
            let manpowerAfter =
                (match Game.Resources.get pool "manpower" with Some m0 -> m0.Value | None -> 0.0)
            if manpowerAfter < manpowerBefore then huntFilterUnlocked <- true
        | "praise" ->
            // orig religion.praise (js/religion.js L1536): worship += faith.value
            // * (1 + apocrypha); faith.value = 0.0001 + undo registration.
            let faithRes = pool.ByName["faith"]
            let worshipBefore = rpool.Faith
            rpool <- Game.Religion.praise rpool faithRes.Value
            pool <- { pool with ByName = pool.ByName |> Map.add "faith" { faithRes with Value = 0.0001 } }
            let gained = faithRes.Value * (1.0 + Game.Religion.getApocryphaBonus rpool) |> ignore
            let worshipAfter = rpool.Faith
            registerUndo [ { ManagerId = "religion"; Data = Game.Types.PraiseUndo(faithRes.Value, worshipAfter - worshipBefore) } ]
        | "adore" ->
            // orig resetFaith(1.01, true) -> _resetFaithInternal(1.01) (L3157)
            let worshipBefore = rpool.Faith
            rpool <- Game.Religion.adoreInternal rpool 1.01
            registerUndo [ { ManagerId = "religion"; Data = Game.Types.AdoreUndo(worshipBefore, rpool.FaithRatio) } ]
        | "transcend" ->
            let rp', ok = Game.Religion.transcend rpool
            rpool <- rp'
            if ok then calculateAllTime () // game.calculateAllEffects on success
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
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
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
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
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
                // triggerOnEmbassyCountChanged: science.unlockRelations() (+ UI)
                let diplomacyPerk = (Game.Prestige.getPerk ppool "diplomacy").Researched
                let sp2, _ = Game.Managers.unlockRelations diplomacyPerk (fun r -> dp.Races.[r].EmbassyLevel) spool
                spool <- sp2
        | "trade" ->
            let raceName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let dctx = dctx ()
            let rand' = fun () -> rngDraws <- rngDraws + 1; rand ()
            let raceState = dp.Races.[raceName]
            if n = 1 then
                // orig trade(race) relies on the button controller paying the
                // costs (manpower/gold/buy item at trade volume) before
                // tradeImpl(race, 1); mirror that controller path.
                let manp = Game.Diplomacy.getManpowerCost dp dctx
                let gold = Game.Diplomacy.getGoldCost dp dctx
                let volume = Game.Diplomacy.getTradeVolume dctx ambassadorEffects
                let buyPrice = raceState.Buys.[0].Val * 1.0 * volume
                let cost = [ ("manpower", manp); ("gold", gold); (raceState.Buys.[0].Resource, buyPrice) ]
                if Game.Resources.hasRes pool cost 0.0 then
                    pool <- Game.Resources.payPrices calendarDay pool cost
                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName 1.0 ambassadorEffects
                    dp <- dp'
                    for KeyValue(resName, amt) in gained do
                        let pool2, _ = Game.Resources.addResEvent calendarDay resName amt pool
                        pool <- pool2
                    stpool <- Game.Stats.bumpStat "totalTrades" successful stpool
                    stpool <- Game.Stats.bumpStatCurrent "totalTrades" successful stpool
                    let spent = [ ("manpower", manp * 1.0); ("gold", gold * 1.0); (raceState.Buys.[0].Resource, buyPrice * 1.0) ]
                    registerUndo [ { ManagerId = "diplomacy"; Data = Game.Types.TradeUndo(1.0, spent, gained |> Map.toList) } ]
                else
                    actionLog <- (m.Tick, "trade", m.Args, RText "cannot afford") :: actionLog
            else
                // tradeMultiple: hasMultipleResources gate, negative addResEvent
                // costs, then tradeImpl(amt)
                let manp = Game.Diplomacy.getManpowerCost dp dctx
                let gold = Game.Diplomacy.getGoldCost dp dctx
                let volume = Game.Diplomacy.getTradeVolume dctx ambassadorEffects
                let afford =
                    (getResValue "gold") >= gold * float n
                    && (getResValue "manpower") >= manp * float n
                    && (getResValue raceState.Buys.[0].Resource) >= raceState.Buys.[0].Val * float n * volume
                if afford then
                    let pool1, _ = Game.Resources.addResEvent calendarDay "manpower" (-manp * float n) pool
                    let pool2, _ = Game.Resources.addResEvent calendarDay "gold" (-gold * float n) pool1
                    let pool3, _ = Game.Resources.addResEvent calendarDay raceState.Buys.[0].Resource (-raceState.Buys.[0].Val * float n * volume) pool2
                    pool <- pool3
                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName (float n) ambassadorEffects
                    dp <- dp'
                    for KeyValue(resName, amt) in gained do
                        let pool2, _ = Game.Resources.addResEvent calendarDay resName amt pool
                        pool <- pool2
                    stpool <- Game.Stats.bumpStat "totalTrades" successful stpool
                    stpool <- Game.Stats.bumpStatCurrent "totalTrades" successful stpool
                    let spent = [ ("manpower", manp * float n); ("gold", gold * float n); (raceState.Buys.[0].Resource, raceState.Buys.[0].Val * float n * volume) ]
                    registerUndo [ { ManagerId = "diplomacy"; Data = Game.Types.TradeUndo(float n, spent, gained |> Map.toList) } ]
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
            let raceState = dp.Races.[raceName]
            match Game.Diplomacy.getMaxTradeAmt dp dctxT ambassadorEffects raceName with
            | Some amt ->
                let manp = Game.Diplomacy.getManpowerCost dp dctxT
                let gold = Game.Diplomacy.getGoldCost dp dctxT
                let volume = Game.Diplomacy.getTradeVolume dctxT ambassadorEffects
                let pool1, _ = Game.Resources.addResEvent calendarDay "manpower" (-manp * amt) pool
                let pool2, _ = Game.Resources.addResEvent calendarDay "gold" (-gold * amt) pool1
                let pool3, _ = Game.Resources.addResEvent calendarDay raceState.Buys.[0].Resource (-raceState.Buys.[0].Val * amt * volume) pool2
                pool <- pool3
                let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctxT rand' raceName amt ambassadorEffects
                dp <- dp'
                for KeyValue(resName, a) in gained do
                    let pool2', _ = Game.Resources.addResEvent calendarDay resName a pool
                    pool <- pool2'
                stpool <- Game.Stats.bumpStat "totalTrades" successful stpool
                stpool <- Game.Stats.bumpStatCurrent "totalTrades" successful stpool
            | None -> ()
        | "perk" ->
            // PrestigeBtnController.buyItem: metaphysics gate + not-stackable path
            let metaphysics =
                match spool.Techs |> Map.tryFind "metaphysics" with
                | Some t -> t.Researched
                | None -> false
            let pp', pool', res = Game.Prestige.buyPerk calendarDay metaphysics pool m.Args.[0] ppool
            ppool <- pp'
            pool <- pool'
            if res.Bought then
                match res.UnlockFanOut with
                | Some u ->
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                    bpool <- bp2; spool <- sp2; wpool <- wp2
                | None -> ()
                match res.UpgradeFanOut with
                | Some _ -> refreshCache ()
                | None -> ()
                if res.RunsDiplomacyHandler then
                    let diplomacyPerk = (Game.Prestige.getPerk ppool "diplomacy").Researched
                    let sp2, _ = Game.Managers.unlockRelations diplomacyPerk (fun r -> dp.Races.[r].EmbassyLevel) spool
                    spool <- sp2
        | "festival" ->
            // orig village.holdFestival (L1131-1146); carnivals perk seam false
            // → duration = daysPerSeason(100) × seasonsPerYear(4), amt ignored
            calendar <- { calendar with FestivalDays = 100 * 4 }
        | "feedelder" ->
            // diplomacy.feedElders(amt)
            let amt = float m.Args.[0]
            let dp', pool' = Game.Diplomacy.feedElders dp (dctx ()) rpool pool amt
            dp <- dp'
            pool <- pool'
            refreshCache () // energy feeds effects reads (leviathansEnergyModifier)
        | "undo" ->
            // game.undo (game.js L6160-6190): apply events in order, clear slot
            match undoChange with
            | Some u ->
                let mutable poolU = pool
                let mutable bpoolU = bpool
                let mutable spoolU = spool
                let mutable wpoolU = wpool
                let mutable rpoolU = rpool
                let mutable dpU = dp
                let mutable tpoolU = tpool
                let mutable ok = true
                for ev in u.Events do
                    match ev.Data with
                    | Game.Types.BuildUndo(bldName, count) ->
                        // orig sellInternal loop: sell count units, refunding at
                        // the recomputed ladder each step
                        let mutable soldAny = false
                        for _ in 1..count do
                            let bp2, p2, sold = Game.Buildings.sellOne calendarDay cache (pctx ()) poolU bldName 0.5 bpoolU
                            if sold then bpoolU <- bp2; poolU <- p2; soldAny <- true
                        if not soldAny then ok <- false
                    | Game.Types.CraftUndo(craft, gained, spent) ->
                        let p2, okC = Game.Managers.undoCraft calendarDay craft gained spent poolU
                        poolU <- p2
                        if not okC then ok <- false
                    | Game.Types.TradeUndo(trades, spent, gainedLst) ->
                        let dp2, p2, okT = Game.Diplomacy.undoTrade calendarDay trades spent gainedLst poolU dpU
                        dpU <- dp2; poolU <- p2
                        if not okT then ok <- false
                    | Game.Types.PraiseUndo(faithSpent, worshipGained) ->
                        let rp2, p2, okP = Game.Religion.undoPraise faithSpent worshipGained poolU rpoolU
                        rpoolU <- rp2; poolU <- p2
                        if not okP then ok <- false
                    | Game.Types.AdoreUndo(worshipBefore, epiphanyGained) ->
                        let rp2, okA = Game.Religion.undoAdore worshipBefore epiphanyGained rpoolU
                        rpoolU <- rp2
                        if not okA then ok <- false
                    | Game.Types.VSUUndo(metaId, endVal) ->
                        let burnRatio = Game.Prestige.getBurnedParagonRatio (getResValue "burnedParagon")
                        let tp2, p2, sold = Game.Time.sellVSU calendarDay metaId endVal burnRatio tpoolU poolU
                        tpoolU <- tp2
                        poolU <- p2
                        if sold = 0 then ok <- false
                    | Game.Types.CFUUndo(metaId, endVal) ->
                        // time.undo buildCFU: full-refund sellInternal + upgrade fan-out
                        let tp2, p2, sold = Game.Time.sellCFU (Game.Effects.getEffect cache) calendarDay metaId endVal tpoolU poolU
                        tpoolU <- tp2
                        poolU <- p2
                        if sold = 0 then ok <- false
                        tpoolU <- Game.Time.cfuCalculate (timeCalcCtx ()) metaId tpoolU
                bpool <- bpoolU
                spool <- spoolU
                wpool <- wpoolU
                pool <- poolU
                rpool <- rpoolU
                tpool <- tpoolU
                dp <- dpU
                undoChange <- None
                if not ok then
                    actionLog <- (m.Tick, "undo", m.Args, RText "undo-incomplete") :: actionLog
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
            // orig sim.assignCraftJob: evergreen badge on the wood speciality
            if added > 0 && craftName = "wood" then
                apool <- Game.Achievements.unlockBadge "evergreen" apool
            let c = wpool.Crafts.[craftName]
            wpool <- { wpool with Crafts = wpool.Crafts |> Map.add craftName { c with Value = c.Value + float added } }
            if added < n then
                let freeStr = string (Game.Math.jsRound (Game.Managers.getFreeEngineers vpool wpool))
                actionLog <- (m.Tick, "speciality", m.Args, RText(sprintf "assigned %d/%d (free=%s)" added n freeStr)) :: actionLog
        | "craftall" ->
            // orig game.craftAll minus the wood winter-confirm branch (headless:
            // workshop.craftAll + updateResources — same end state)
            let pool', wpool', ok = Game.Managers.craftAll calendarDay cache (traditionResearched ()) (crctx ()) getResValue m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                craftFilterUnlocked <- true // craftAll emits the craft-tag msg
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
            refreshCache ()
        | "save" -> if not currentSaveIsBroken then lcStorageSave <- buildSaveString () // silent; no-op when broken
        | "load" ->
            // orig game.load(): parse the LCstorage blob, reset + apply (silent)
            applySaveBlob lcStorageSave
        | "observe" ->
            // the observe button: handler only while an event is pending
            if calendar.ObserveRemainingTime > 0 then
                doObserveHandler ()
        | "pact" ->
            // PactsBtnController.build path (religion-14)
            let pactName = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let rp', pool', bought = Game.Religion.buyPact calendarDay (Game.Effects.getEffect cache) pactName n pool rpool
            rpool <- rp'
            pool <- pool'
            if bought > 0 then
                refreshCache () // game.upgrade({policies: [feedingFrenzy], pacts: [payDebt]})
        | "accelerate" ->
            // AccelerateTimeBtn: toggle; consumes 1 flux/tick while on
            tpool <- { tpool with IsAccelerated = not tpool.IsAccelerated }
        | "mission" ->
            // MissionBtnController.build(model, 1)
            let name = m.Args.[0]
            let sp2, pool2, counter = Game.Space.buyProgram (Game.Effects.getEffect cache) (Game.Challenges.isActive cpool "blackSky") calendarDay name 1 spacep pool
            spacep <- sp2
            pool <- pool2
            if counter > 0 then
                // game.unlock(unlocks): chained missions are handled in buyProgram;
                // policies + planets unlock here (policy = flag only at this slice)
                let def = Game.Catalog.Space.programDefs |> List.find (fun d0 -> d0.Name = name)
                for pol in def.UnlocksPolicies do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                    | None -> ()
                refreshCache () // unlock fan-out
            else
                actionLog <- (m.Tick, "mission", m.Args, RText "cannot-afford-or-locked") :: actionLog
        | "sbuilding" ->
            // PlanetBuildingBtnController.build(model, n)
            let name = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let sp2, pool2, counter = Game.Space.buyBuilding (Game.Effects.getEffect cache) (Game.Challenges.isActive cpool "blackSky") calendarDay name n spacep pool
            spacep <- sp2
            pool <- pool2
            if counter > 0 then
                let def = Game.Catalog.Space.buildingDefs |> List.find (fun d0 -> d0.Name = name)
                // controller.build order: breakIronWill; meta.unlocks;
                // meta.calculateEffects + cycleEffectsBasics; meta.upgrades
                // (updateEffects first, then game.upgrade). The full IW
                // fan-out (liberty/zebraOutpost recalcs) lands with the
                // IW-space scenario (space-12).
                if Game.Space.breakIronWill name then ironWill <- false
                for pol in def.UnlocksPolicies do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                    | None -> ()
                if Game.Space.hasCalcEffects name then
                    spacep <- Game.Space.calculateEffects (spaceCalcCtx ()) name spacep
                    spacep <- Game.Space.cycleEffectsBasics (spaceCalcCtx ()) name spacep
                let ups = Game.Space.buildingUpgrades name
                if ups <> [] then
                    if Game.Space.hasUpdateEffects name then
                        spacep <- Game.Space.updateEffects (spaceCalcCtx ()) name spacep
                    upgradeMetas ups
                refreshCache ()
            else
                actionLog <- (m.Tick, "sbuilding", m.Args, RText "cannot-afford-or-locked") :: actionLog
        | "shatter" ->
            // ShatterTCBtnController.doShatterAmt(model, amt)
            let amt = int m.Args.[0]
            let okS = doShatterManual amt
            if not okS then
                actionLog <- (m.Tick, "shatter", m.Args, RText "cannot-afford") :: actionLog
        | "useheat" ->
            // UseHeatBtnController.doShatterAmt — "all" computes max(2, heat/100)
            let okU =
                if m.Args.[0] = "all" then useHeatManual None
                else useHeatManual (Some (int m.Args.[0]))
            if not okU then
                actionLog <- (m.Tick, "useheat", m.Args, RText "not-enough-heat") :: actionLog
        | "cfu" ->
            // ChronoforgeBtnController.build(model, 1) + unlock/upgrade fan-outs
            let name = m.Args.[0]
            let tp2, pool2, counter = Game.Time.buyCFU (Game.Effects.getEffect cache) calendarDay name 1 tpool pool
            tpool <- tp2
            pool <- pool2
            if counter > 0 then
                let def = Game.Time.cfuDef name
                // game.unlock(meta.unlocks)
                for up in def.UnlocksUpgrades do
                    match wpool.Upgrades |> Map.tryFind up with
                    | Some u -> wpool <- { wpool with Upgrades = wpool.Upgrades |> Map.add up { u with Unlocked = true } }
                    | None -> ()
                for cfuName in def.UnlocksCFU do
                    let m' = tpool.CFUs.[cfuName]
                    tpool <- { tpool with CFUs = tpool.CFUs |> Map.add cfuName { m' with Unlocked = true } }
                // build(): meta.calculateEffects, then meta.upgrades →
                // updateEffects(self)/calc via game.upgrade(children)
                tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
                for child in def.UpgradesCFU do
                    tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) child tpool
                // registerUndoChange (ChronoforgeBtnController.build) — TTL 20×5
                undoChange <-
                    Some({ Ttl = 100
                           Events =
                               [ { ManagerId = "time"
                                   Data = Game.Types.CFUUndo(name, tpool.CFUs.[name].Val - counter) } ] })
                refreshCache () // game.upgrade ends with updateCaches
            else
                actionLog <- (m.Tick, "cfu", m.Args, RText "cannot-afford-or-locked") :: actionLog
        | "vsu" ->
            // VoidSpaceBtnController.build(model, 1) + breakIronWill/calc/undo
            let name = m.Args.[0]
            let burnRatio = Game.Prestige.getBurnedParagonRatio (getResValue "burnedParagon")
            let tp2, pool2, counter = Game.Time.buyVSU calendarDay name 1 burnRatio tpool pool
            tpool <- tp2
            pool <- pool2
            if counter > 0 then
                let def = Game.Time.vsuDef name
                if name = "cryochambers" && def.BreaksIronWill = Some true then
                    // meta.breakIronWill (core.js build tail)
                    ironWill <- false
                    wpool <-
                        (wpool, ["huntingArmor"; "bolas"; "compositeBow"])
                        ||> List.fold (fun acc up ->
                            match acc.Upgrades |> Map.tryFind up with
                            | Some u -> { acc with Upgrades = acc.Upgrades |> Map.add up { u with Unlocked = true } }
                            | None -> acc)
                    match spool.Policies |> Map.tryFind "sharkRelationsBotanists" with
                    | Some p -> spool <- { spool with Policies = spool.Policies |> Map.add "sharkRelationsBotanists" { p with Unlocked = true } }
                    | None -> ()
                if name = "cryochambers" then
                    let m' = tpool.VSUs.["cryochambers"]
                    tpool <- { tpool with VSUs = tpool.VSUs |> Map.add "cryochambers" { m' with Unlocked = true } }
                let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
                tpool <- Game.Time.vsuCalculate tpool chronosphereOn (Game.Effects.getEffect cache)
                undoChange <-
                    Some({ Ttl = 100
                           Events =
                               [ { ManagerId = "time"
                                   Data = Game.Types.VSUUndo(name, tpool.VSUs.[name].Val - counter) } ] })
                refreshCache ()
            else
                actionLog <- (m.Tick, "vsu", m.Args, RText "cannot-afford-or-locked") :: actionLog
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
        let optS (o: string option) = match o with Some s -> sprintf "\"%s\"" (esc s) | None -> "null"
        let optB (o: bool option) = match o with Some b -> sprintf "%b" b | None -> "null"
        let rule = if d.RefundableRule = EnergyBalanced then "true" else "false"
        sprintf
            "{\"name\":\"%s\",\"type\":\"%s\",\"visible\":%s,\"color\":%s,\"craftable\":%s,\"calculatePerTick\":%s,\"persists\":%s,\"aiCanDestroy\":%s,\"transient\":%s,\"tag\":%s,\"isNotRefundable\":%s,\"calculatePerDay\":%s,\"calculatePerTickAndDay\":%s,\"calculateOnYear\":%s,\"hasCustomIsRefundable\":%s}"
            (esc d.Name) (esc d.Category) (b d.Visible) (optS d.Color) (b d.Craftable) (b d.CalculatePerTick)
            (optB d.Persists) (b d.AiCanDestroy) (b d.Transient) (optS d.Tag) (b d.IsNotRefundable) (b d.CalculatePerDay)
            (b d.CalculatePerTickAndDay) (b d.CalculateOnYear) rule

    let defs = Game.Catalog.Resources.resourceDefs
    let items = defs |> List.map defJson |> String.concat ","
    "{\n  \"driver\": \"fs-runner\",\n  \"origCommit\": \"n/a (F# core)\",\n  \"catalog\": [" + items + "]\n}"

// ---------------------------------------------------------------------------
// Snapshot JSON

let snapshotJson
    ((tick, resources, rngDraws, cal, buildings, jobs, crafts, techs, upgrades, policies, kittenJobs, free, effectsSample, religion, diplomacy, faith, faithRatio, tier, rpoolCorruption, statsSnap, statsCurrentSnap, achSnap, badgeSnap, challengeSnap, pactSnap, reservesSnap, kittenSnap, timeSnap, voidSnap, observeSnap, winterSnap, happiness: float, spaceSnap: string): SnapTuple)
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
        |> List.map (fun (n, (unl, lvl, energy, duration)) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"embassyLevel\":%d,\"energy\":%s,\"duration\":%s}"
                (esc n) (if unl then "true" else "false") lvl (num energy) (num duration))
        |> String.concat ","
    let statsJson =
        statsSnap
        |> List.map (fun (n, v) -> sprintf "\"%s\":%s" (esc n) (num v))
        |> String.concat ","
    let statsCurrentJson =
        statsCurrentSnap
        |> List.map (fun (n, v) -> sprintf "\"%s\":%s" (esc n) (num v))
        |> String.concat ","
    let achJson =
        achSnap
        |> List.map (fun (n, (unl, star)) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"starUnlocked\":%s}" (esc n) (if unl then "true" else "false") (if star then "true" else "false"))
        |> String.concat ","
    let badgeJson =
        badgeSnap
        |> List.map (fun (n, unl) -> sprintf "\"%s\":%s" (esc n) (if unl then "true" else "false"))
        |> String.concat ","
    let challengeJson =
        challengeSnap
        |> List.map (fun (n, (unl, pend, act, res, on)) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"pending\":%s,\"active\":%s,\"researched\":%s,\"on\":%d}"
                (esc n) (if unl then "true" else "false") (if pend then "true" else "false") (if act then "true" else "false") (if res then "true" else "false") on)
        |> String.concat ","
    let pactJson =
        pactSnap
        |> List.map (fun (n, (v, on, unl)) ->
            sprintf "\"%s\":{\"val\":%d,\"on\":%d,\"unlocked\":%s}" (esc n) v on (if unl then "true" else "false"))
        |> String.concat ","
    let (tFlux, tHeat, tTestShatter, tAcc, cfuList, vsuList) = timeSnap
    let ((resResL, resKittensN, resCryoN)) = reservesSnap
    let reservesJson =
        "{\"resources\":{" + (resResL |> List.map (fun (n, v) -> sprintf "\"%s\":%s" (esc n) (num v)) |> String.concat ",") + "},\"kittenCount\":" + string resKittensN + ",\"cryochambers\":" + string resCryoN + "}"
    let kittenJson =
        kittenSnap
        |> List.map (fun (nm, sur, tr, age, col, var, rar, rank, exp, job, seed) ->
            let jobJson = match job with Some j -> sprintf "\"%s\"" (esc j) | None -> "null"
            sprintf "{\"name\":\"%s\",\"surname\":\"%s\",\"trait\":\"%s\",\"age\":%s,\"color\":%d,\"variety\":%d,\"rarity\":%d,\"rank\":%d,\"exp\":%s,\"job\":%s,\"seed\":%d}"
                (esc nm) (esc sur) (esc tr) (num age) col var rar rank (num exp) jobJson seed)
        |> String.concat ","
    let (voidVus, voidFaction) = voidSnap
    let cfuJson =
        cfuList
        |> List.map (fun (n, (v, on, heat, delayTicks, auto)) ->
            // emit only the fields the orig def declares (undefined dropped by
            // JSON.stringify there): heat=blastFurnace; delayTicks=controlledDelay;
            // automation=blastFurnace/controlledDelay/accelerator/press
            let parts =
                [ sprintf "\"val\":%d" v; sprintf "\"on\":%d" on ]
                @ (if n = "blastFurnace" then [ sprintf "\"heat\":%s" (num heat) ] else [])
                @ (if n = "controlledDelay" then [ sprintf "\"delayTicks\":%d" delayTicks ] else [])
                @ (if (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = n)).AutomationInit.IsSome then
                       [ sprintf "\"automation\":%s"
                           (if auto = Some true then "true" elif auto = Some false then "false" else "null") ]
                   else [])
            sprintf "\"%s\":{%s}" (esc n) (String.concat "," parts))
        |> String.concat ","
    let vsuJson =
        vsuList
        |> List.map (fun (n, (v, on)) -> sprintf "\"%s\":{\"val\":%d,\"on\":%d}" (esc n) v on)
        |> String.concat ","
    let voidJson =
        voidVus
        |> List.map (fun (n, (v, on, unl)) -> sprintf "\"%s\":{\"val\":%d,\"on\":%d,\"unlocked\":%s}" (esc n) v on (if unl then "true" else "false"))
        |> String.concat ","
    let polJson =
        policies
        |> List.map (fun (n, (unl, res)) ->
            sprintf "\"%s\":{\"unlocked\":%s,\"researched\":%s}" (esc n) (if unl then "true" else "false") (if res then "true" else "false"))
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
        "{\"tick\":%d,\"rngDraws\":%d,\"calendar\":{\"year\":%s,\"day\":%s,\"season\":\"%s\",\"weather\":%s,\"cycle\":%d,\"cycleYear\":%d,\"cryptoPrice\":%s,\"festivalDays\":%d},\"kittens\":%s,\"resources\":{%s},\"buildings\":{%s},\"jobs\":{%s},\"crafts\":{%s},\"techs\":[%s],\"upgrades\":[%s],\"policies\":{%s},\"religion\":{\"faith\":%s,\"faithRatio\":%s,\"tier\":%d,\"corruption\":%s,\"metas\":{%s}},\"diplomacy\":{\"races\":{%s}},\"stats\":{\"total\":{%s},\"current\":{%s}},\"achievements\":{%s},\"badges\":{%s},\"challenges\":{%s},\"pacts\":{%s},\"reserves\":%s,\"kittenIds\":[%s],\"time\":%s,\"void\":%s,\"observeRemainingTime\":%d,\"winterCatnipPerTick\":%s,\"happiness\":%s,\"effects\":{%s},\"space\":%s}"
        tick
        rngDraws
        (num cal.year)
        (num cal.day)
        (esc cal.season)
        weather
        cal.cycle
        cal.cycleYear
        (num cal.cryptoPrice)
        cal.festivalDays
        kittensJson
        resItems
        buildingsJson
        jobsJson
        craftsJson
        (nameArr techs)
        (nameArr upgrades)
        polJson
        (num faith)
        (num faithRatio)
        tier
        (num rpoolCorruption)
        religionJson
        diplomacyJson
        statsJson
        statsCurrentJson
        achJson
        badgeJson
        challengeJson
        pactJson
        reservesJson
        kittenJson
        (sprintf "{\"flux\":%s,\"heat\":%s,\"testShatter\":%d,\"isAccelerated\":%s,\"cfu\":{%s},\"vsu\":{%s}}" (num tFlux) (num tHeat) tTestShatter (if tAcc then "true" else "false") cfuJson vsuJson)
        (sprintf "{\"vu\":{%s},\"faction\":%s}" voidJson (match voidFaction with Some f -> sprintf "\"%s\"" (esc f) | None -> "null"))
        observeSnap
        (num winterSnap)
        (num happiness)
        effectsJson
        spaceSnap

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
