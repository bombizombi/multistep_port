module kittens_land.KittensState

// V1 view-layer slice: a fresh-game state assembled from the oracle-verified
// Game library, with gather/buy/tick actions for the Bonfire tab. Systems not
// yet surfaced (village sim, religion, space, time automation) are carried as
// their verified pools so later milestones extend, not rewrite, this module.

open Game
open Game.Effects

/// core.js logmsg subset — browser console panel
type ConsoleMsg =
    { CmId: int
      CmText: string
      CmTag: string option
      CmHasCal: bool
      CmYear: int
      CmDay: int
      CmSeason: string }

/// classes.queue.manager queue group (time-14)
type QueueItem =
    { QName: string; QType: string; QValue: int }


type State =
    { Pool: Game.Types.ResPool
      Bpool: Game.Buildings.BldPool
      Spool: Game.Managers.SciencePool
      Wpool: Game.Managers.WorkshopPool
      Vpool: Game.Managers.VillagePool
      Rpool: Game.Religion.ReligionPool
      Cpool: Game.Challenges.ChallengePool
      Ppool: Game.Prestige.PrestigePool
      Dpool: Game.Diplomacy.DiplomacyPool
      Tpool: Game.Time.TimePool
      Spacep: Game.Space.SpacePool
      Stpool: Game.Stats.StatsPool
      Calendar: Game.Calendar.CalendarState
      Cache: Game.Effects.EffectsCache
      CalendarDay: int
      Ticks: int
      IronWill: bool
      Rand: unit -> float
      // V4/V5: console, queue, opts
      ConsoleMsgs: ConsoleMsg list
      ConsoleUnlocked: Set<string>
      QueueItems: QueueItem list
      Opts: Game.Settings.OptsState
      // orig res.isHidden toggles (resource settings edit mode) + showHiddenResources
      ResHidden: Set<string>
      ShowHiddenRes: bool
      // orig game.tabs visible flags — lowercase tabIds unlocked via unlock({tabs:[...]})
      TabsUnlocked: Set<string> }

let getRes (pool: Game.Types.ResPool) (name: string) : float =
    (Game.Resources.get pool name |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0)

let getResMax (pool: Game.Types.ResPool) (name: string) : float =
    (Game.Resources.get pool name |> Option.map (fun r -> r.MaxValue) |> Option.defaultValue 0.0)

let capCtx (s: State) : Game.Resources.CapContext =
    { GetEffect = Game.Effects.getEffect s.Cache
      ParagonStorageRatio = 0.0
      CMBRBonus = 0.0
      UnicornTearsActive = false
      SilosResearched = false
      KarmaZebras = 0 }

let pctx (s: State) : Game.Buildings.PricingContext =
    { PriceRules = Game.Buildings.freshPricing.PriceRules
      UnicornTearsActive = false
      BlackSkyActive = false
      PacifismActive = false
      PostApocalypseActive = false
      PacifismOn = 0
      UsedCryochambers = 0
      IronWill = s.IronWill
      PollutionLevel = 0.0 }

let getEffect (s: State) (name: string) : float = Game.Effects.getEffect s.Cache name

let resValue (s: State) (name: string) : float = getRes s.Pool name

let emptyGroup : Game.Effects.ManagerGroup = { Base = Map.empty; Items = [] }

let groups (s: State) : Game.Effects.ManagerGroup list =
    let bldGroup =
        { Base = Game.Catalog.BaseEffects.bldBase
          Items =
            s.Bpool.Order
            |> List.choose (fun n ->
                match Game.Buildings.get s.Bpool n with
                | Some b -> Some(Game.Buildings.activeEffects b, (fun name _ -> Game.Buildings.providerEffect b name))
                | None -> None) }
    let workshopGroup =
        { Base = Game.Managers.workshopEffectsBase s.Cache (resValue s) false
          Items =
            s.Wpool.UpgradeOrder
            |> List.choose (fun n ->
                match s.Wpool.Upgrades |> Map.tryFind n with
                | Some u when u.Researched -> Some(u.Def.Effects, (fun _ v -> v))
                | _ -> None) }
    // manager order mirrors orig: workshop→religion→bld→challenges→prestige→
    // space→time→village→science (cfu folds with time)
    [ workshopGroup
      Game.Religion.religionGroup s.Rpool
      bldGroup
      Game.Challenges.challengesGroup s.Cpool (getEffect s)
          (float (Game.Buildings.get s.Bpool "tradepost" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0))
      Game.Prestige.prestigeGroup s.Ppool
      Game.Space.spaceGroup s.Pool.EnergyCons s.Pool.EnergyProd
          (Game.Resources.getEnergyDelta false false s.Pool.EnergyProd s.Pool.EnergyCons)
          s.Spacep
      (let timeGroup : Game.Effects.ManagerGroup =
           { Base =
               Game.Catalog.BaseEffects.baseEffects
               |> Map.filter (fun k _ -> k.StartsWith("heat") || k.StartsWith("temporalFlux"))
             Items = [] }
       timeGroup)
      emptyGroup // village (V1: no kittens sim)
      Game.Managers.scienceGroup s.Spool
      Game.Time.timeGroup s.Tpool false ]

let refreshCache (s: State) : State =
    let cache1 = Game.Effects.updateCaches s.Cache (groups s)
    let s1 = { s with Cache = cache1 }
    // game.updateResources: recompute every resource's perTickCached through the
    // verified production pipeline (calcResourcePerTick reads the effects cache)
    let prodCtx =
        let calCtx : Game.Calendar.CalendarContext =
            { GetEffect = Game.Effects.getEffect s1.Cache
              DarkFuture = false
              ChronomancyResearched = false
              UnicornmancyResearched = false
              Year1000ChallengeActive = false
              WinterIsComingResearched = false
              WinterIsComingActive = false
              AdvancedAutomationResearched = false
              CommunismResearched = false
              WinterIsComingOn = false
              Rand = fun () -> 0.5
              OnParadox = fun st -> st
              OnNewDayRefresh = fun st -> st
              OnObserveTimeout = fun st -> st
              TimeAccelerationRatio = 0.0
              OnFlux = fun _ -> ()
              OnNewSeasonTail = fun st -> st
              OnNewDayTail = fun st -> st }
        let fresh = Game.Production.freshProductionContext s1.Cache s1.Calendar calCtx
        let jobProd =
            Game.Managers.getResProduction s1.Cache s1.Vpool
                (Game.Catalog.Village.jobDefs |> List.map (fun j -> (j.Name, j)) |> Map.ofList) s1.Wpool
        { fresh with
            Happiness = s1.Vpool.Happiness
            Kittens = s1.Vpool.Kittens.Length
            FreeKittens = Game.Managers.getFreeKittens s1.Vpool
            // village.js getResProduction/getResConsumption (village-04):
            // job-based ES production + kitten food/luxury demand
            VillageResProduction = fun rn -> jobProd |> Map.tryFind rn |> Option.defaultValue 0.0
            VillageResConsumption =
                fun rn ->
                    let count = s1.Vpool.Kittens.Length
                    match rn with
                    | "catnip" -> -0.85 * float count
                    | "furs" -> -0.01 * float count
                    | "ivory" -> -0.007 * float count
                    | "spice" -> -0.001 * float count
                    | _ -> 0.0 }
    let pool1 =
        { s1.Pool with
            ByName =
                s1.Pool.ByName
                |> Map.map (fun _ res ->
                    if res.Def.CalculatePerTick then
                        { res with
                            PerTickCached =
                                Game.Production.fixFloatPointNumber (
                                    Game.Production.calcResourcePerTick prodCtx s1.Pool res.Def.Name
                                ) }
                    else res) }
    { s1 with Pool = pool1 }

let makeRand (seed: int64) : unit -> float =
    let mutable z = uint32 (seed &&& 0xFFFFFFFFL)
    let sm () =
        z <- z + 0x9e3779b9u
        let mutable t0 = z ^^^ (z >>> 16)
        t0 <- t0 * 0x21f0aaadu
        t0 <- t0 ^^^ (t0 >>> 15)
        t0 <- t0 * 0x27d4eb2du
        t0 <- t0 ^^^ (t0 >>> 15)
        t0
    let mutable a = sm ()
    let mutable b = sm ()
    let mutable c = sm ()
    let mutable d = sm ()
    fun () ->
        let mutable t = a + b
        a <- b ^^^ (b >>> 9)
        b <- c + (c <<< 3)
        c <- (c <<< 21) ||| (c >>> 11)
        d <- d + 1u
        t <- t + d
        c <- c + t
        float (t >>> 0) / 4294967296.0

let browserRand = makeRand 20261002L
let initSeeded (seed: int64) : State =
    let fresh =
        { Pool = Game.Resources.init Game.Catalog.Resources.resourceDefs
          Bpool = Game.Buildings.init Game.Catalog.Defs.buildingDefs
          Spool = Game.Managers.initScience Game.Catalog.Defs.techDefs Game.Catalog.Defs.policyDefs
          Wpool = Game.Managers.initWorkshop Game.Catalog.Defs.upgradeDefs Game.Catalog.Defs.craftDefs
          Vpool = Game.Managers.initVillage Game.Catalog.Village.jobDefs
          Rpool = Game.Religion.init ()
          Cpool = Game.Challenges.init ()
          Ppool = Game.Prestige.init ()
          Dpool = Game.Diplomacy.init ()
          Tpool = Game.Time.init ()
          Spacep = Game.Space.init ()
          Stpool = Game.Stats.init ()
          Calendar = Game.Calendar.init
          Cache = Game.Effects.empty
          CalendarDay = 0
          Ticks = 0
          IronWill = true
          Rand = makeRand seed
          ConsoleMsgs = []
          ConsoleUnlocked = Set.empty
          QueueItems = []
          Opts = Game.Settings.freshOpts ()
          ResHidden = Set.empty
          ShowHiddenRes = false
          TabsUnlocked = Set.empty }
    fresh |> refreshCache

let init () : State = initSeeded 20261002L

/// One game tick: effect/per-tick caches, production, caps, calendar.
// splitmix32 -> sfc32 (the oracle RNG, ported for deterministic solver runs)

let dctxFor (s: State) : Game.Diplomacy.DiplomacyContext =
    { GetEffect = Game.Effects.getEffect s.Cache
      GetResValue = resValue s
      GetResMax = fun n -> getResMax s.Pool n
      IsResUnlocked =
        fun n -> (match Game.Resources.get s.Pool n with Some r -> r.Unlocked | None -> false)
      Season = Game.Calendar.seasons.[s.Calendar.Season].Name
      NuclearFissionResearched = false
      IronWill = false }

// --- V4/V5: console, queue, opts -------------------------------------------

let consoleMsg (tag: string option) (text: string) (s: State) : State =
    let unlocked =
        match tag with
        | Some tg -> s.ConsoleUnlocked.Contains tg
        | None -> true
    if not unlocked then s
    else
        let hasCal = s.Spool.Techs["calendar"].Researched
        let msg =
            { CmId = (match s.ConsoleMsgs with m :: _ -> m.CmId + 1 | [] -> 0)
              CmText = text
              CmTag = tag
              CmHasCal = hasCal
              CmYear = int s.Calendar.Year + 1
              CmDay = int s.Calendar.Day + 1
              CmSeason = Game.Calendar.seasons.[s.Calendar.Season].Name }
        let msgs = s.ConsoleMsgs @ [ msg ]
        { s with ConsoleMsgs = if msgs.Length > 40 then msgs.Tail else msgs }

let consoleUnlockedFor (s: State) (tag: string) : State =
    { s with ConsoleUnlocked = s.ConsoleUnlocked |> Set.add tag }

let consoleClear (s: State) : State = { s with ConsoleMsgs = [] }

// verified calculateQueueCap (time-14): aiCore.on + entangler hashRateLevel +
// baseCap 3 + queueCap effect, floor x (1 + queueCapRatio)
let queueCap (s: State) : int =
    let aiCoreOn = float (Game.Buildings.get s.Bpool "aiCore" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
    let entanglerHash =
        (Game.Space.getBuilding s.Spacep "entangler").Effects
        |> Map.tryFind "hashRateLevel"
        |> Option.defaultValue 0.0
    let before = aiCoreOn + entanglerHash + 3.0 + Game.Effects.getEffect s.Cache "queueCap"
    int (System.Math.Floor(before * (1.0 + Game.Effects.getEffect s.Cache "queueCapRatio")))

let queueLength (s: State) : int =
    s.QueueItems |> List.sumBy (fun q -> if q.QValue = 0 then 1 else q.QValue)

let addToQueue (name: string) (qtype: string) (s: State) : State =
    // nonStackable clamp 1, tail merge, cap clamp (verified addToQueue)
    let nonStackable = [ "tech"; "upgrades"; "policies"; "zebraUpgrades"; "spaceMission" ]
    let cap = queueCap s
    if queueLength s >= cap then s
    else
        let amt =
            if List.contains qtype nonStackable then 1
            else min (cap - queueLength s) 1
        if amt < 1 then s
        else
            match List.tryLast s.QueueItems with
            | Some last when last.QName = name && not (List.contains qtype nonStackable) ->
                let items =
                    s.QueueItems
                    |> List.removeAt (s.QueueItems.Length - 1)
                    |> fun l -> l @ [ { last with QValue = last.QValue + amt } ]
                { s with QueueItems = items }
            | _ -> { s with QueueItems = s.QueueItems @ [ { QName = name; QType = qtype; QValue = amt } ] }

let removeFromQueue (index: int) (s: State) : State =
    if index < 0 || index >= s.QueueItems.Length then s
    else
        let it = s.QueueItems.[index]
        if it.QValue - 1 = 0 then { s with QueueItems = s.QueueItems |> List.removeAt index }
        else { s with QueueItems = s.QueueItems |> List.updateAt index { it with QValue = it.QValue - 1 } }

// verified _isReasonToSkipItem: drop on paid-for/already-bought/blocked; wait otherwise

let toDisplaySeconds (secondsRaw: float) : string =
    if secondsRaw <> secondsRaw then "0s"
    else
        let secNum = System.Math.Floor secondsRaw
        if secNum < 1.0 then "0s"
        else
            let yearSecs = 86400.0 * 365.0
            let years = System.Math.Floor(secNum / yearSecs)
            let mutable days = 0.0
            let mutable hours = 0.0
            let mutable minutes = 0.0
            let mutable seconds = 0.0
            if years < 1e6 then
                days <- System.Math.Floor((secNum - years * yearSecs) / 86400.0)
                hours <- System.Math.Floor((secNum - years * yearSecs - days * 86400.0) / 3600.0)
                minutes <- System.Math.Floor((secNum - years * yearSecs - days * 86400.0 - hours * 3600.0) / 60.0)
                seconds <- secNum - years * yearSecs - days * 86400.0 - hours * 3600.0 - minutes * 60.0
            let mutable t = ""
            if years > 0.0 then t <- t + string years + "y "
            if years < 1.0 then
                if days > 0.0 then t <- t + string days + "d "
                if days < 1.0 then
                    if hours > 0.0 then t <- t + string hours + "h "
                    if minutes > 0.0 then t <- t + string minutes + "m "
                    if seconds > 0.0 then t <- t + string seconds + "s"
            t.Trim()

// --- V5: settings, reset, save/load ----------------------------------------

let setBoolOption (name: string) (value: bool) (s: State) : State =
    let opts', _sellBcoin = Game.Settings.setBool name value s.Opts
    { s with Opts = opts' }

let setNotation (n: string) (s: State) : State =
    { s with Opts = { s.Opts with Notation = n } }

/// game-17 reset core for the browser slice: karma ladder + paragon + bonus
/// zebras, challenge pending->active flip, stats bumps, fresh pools. The
/// byte-exact post-reset save blob stays in the oracle (game-17).

let resetGame (s: State) : State =
    let kittens =
        System.Math.Round (getRes s.Pool "kittens" * (1.0 + Game.Effects.getEffect s.Cache "simScalingRatio"))
    let anarchy = s.Cpool.Challenges.["anarchy"].Researched
    let k2 = if anarchy then kittens * 2.0 else kittens
    let mutable karmaKittens = 0
    if k2 > 35.0 then karmaKittens <- karmaKittens + int (k2 - 35.0)
    if k2 > 60.0 then karmaKittens <- karmaKittens + int ((k2 - 60.0) * 3.0)
    if k2 > 100.0 then karmaKittens <- karmaKittens + int ((k2 - 100.0) * 4.0)
    if k2 > 150.0 then karmaKittens <- karmaKittens + int ((k2 - 150.0) * 5.0)
    if k2 > 300.0 then karmaKittens <- karmaKittens + int ((k2 - 300.0) * 10.0)
    if k2 > 750.0 then karmaKittens <- karmaKittens + int ((k2 - 750.0) * 15.0)
    let paragonPoints = if kittens > 70.0 then kittens - 70.0 else 0.0
    let totalScience =
        s.Spool.TechOrder
        |> List.sumBy (fun n ->
            let td = s.Spool.Techs.[n]
            if td.Researched then
                (match td.Def.Prices |> List.tryFind (fun p0 -> p0.Resource = "science") with
                 | Some p0 -> p0.Val
                 | None -> 0.0)
            else 0.0)
    let bonusZebras =
        (if s.Spool.Techs.["archery"].Researched then 1 else 0)
        + int (System.Math.Floor (Game.Math.getLimitedDR (totalScience / 10000.0) 100.0))
    let fresh = init ()
    let cpool2 =
        { fresh.Cpool with
            Challenges =
                fresh.Cpool.Challenges
                |> Map.map (fun n c ->
                    let old = s.Cpool.Challenges.[n]
                    { c with Researched = old.Researched; On = old.On; Unlocked = old.Unlocked; Active = old.Pending }) }
    let pool2 =
        { fresh.Pool with
            KarmaKittens = s.Pool.KarmaKittens + karmaKittens
            ByName =
                fresh.Pool.ByName
                |> Map.add "paragon" { fresh.Pool.ByName["paragon"] with Value = paragonPoints }
                |> Map.add "burnedParagon" { fresh.Pool.ByName["burnedParagon"] with Value = getRes s.Pool "burnedParagon" }
                |> Map.add "temporalFlux" { fresh.Pool.ByName["temporalFlux"] with Value = getRes s.Pool "temporalFlux" }
                |> Map.add "timeCrystal" { fresh.Pool.ByName["timeCrystal"] with Value = getRes s.Pool "timeCrystal" } }
    let stpool2 =
        fresh.Stpool
        |> Game.Stats.bumpStat "totalParagon" paragonPoints
        |> Game.Stats.bumpStat "totalResets" 1.0
    { fresh with
        Pool = pool2
        Cpool = cpool2
        Stpool = stpool2
        Rand = s.Rand
        ConsoleMsgs = []
        Opts = s.Opts }

// browser save format v1 (own namespace key; NOT the orig byte format — that
// builder is oracle-verified and stays there). Sections are one-per-line.
let saveKey = "kittens_land.savedata.v1"

let buildSaveString (s: State) : string =
    let sb = System.Text.StringBuilder()
    let line (x: string) = sb.AppendLine(x) |> ignore
    line "klv1"
    line (sprintf "cal|%d|%s|%d|%d" (int s.Calendar.Year) (s.Calendar.Season.ToString()) s.Calendar.FestivalDays s.Ticks)
    for n in s.Pool.Order do
        match Game.Resources.get s.Pool n with
        | Some r when r.Unlocked || r.Value > 0.0 ->
            line (sprintf "res|%s|%s|%d" n (sprintf "%g" r.Value) (if r.Unlocked then 1 else 0))
        | _ -> ()
    for n in s.Bpool.Order do
        match Game.Buildings.get s.Bpool n with
        | Some b when b.Val > 0 -> line (sprintf "bld|%s|%d|%d|%d" n b.Val b.On (if b.Unlocked then 1 else 0))
        | _ -> ()
    for n in s.Spool.TechOrder do
        let td = s.Spool.Techs.[n]
        if td.Researched || td.Unlocked then line (sprintf "tech|%s|%d|%d" n (if td.Unlocked then 1 else 0) (if td.Researched then 1 else 0))
    for n in s.Spool.PolicyOrder do
        let p = s.Spool.Policies.[n]
        if p.Researched || p.Unlocked then line (sprintf "pol|%s|%d|%d" n (if p.Unlocked then 1 else 0) (if p.Researched then 1 else 0))
    for n in s.Wpool.UpgradeOrder do
        let u = s.Wpool.Upgrades.[n]
        if u.Researched || u.Unlocked then line (sprintf "upg|%s|%d|%d" n (if u.Unlocked then 1 else 0) (if u.Researched then 1 else 0))
    for n in s.Wpool.CraftOrder do
        let c = s.Wpool.Crafts.[n]
        if c.Value > 0.0 then line (sprintf "crf|%s|%g" n c.Value)
    for k in s.Vpool.Kittens do
        line (sprintf "kit|%d|%s" k.Seed (match k.Job with Some j -> j | None -> "-"))
    for (k, v) in Map.toList s.Vpool.JobValues do
        if v > 0 then line (sprintf "job|%s|%d" k v)
    line (sprintf "rel|%g|%g|%d" s.Rpool.Faith s.Rpool.FaithRatio s.Rpool.TranscendenceTier)
    for n in s.Rpool.ZuOrder do
        let m = Game.Religion.getZU s.Rpool n
        if m.Val > 0 then line (sprintf "zu|%s|%d" n m.Val)
    for n in s.Rpool.RuOrder do
        let m = Game.Religion.getRU s.Rpool n
        if m.Val > 0 then line (sprintf "ru|%s|%d" n m.Val)
    for n in s.Dpool.RaceOrder do
        let r0 = s.Dpool.Races.[n]
        if r0.Unlocked then line (sprintf "race|%s|%d" n r0.EmbassyLevel)
    for n in s.Spacep.ProgramOrder do
        let m = Game.Space.getProgram s.Spacep n
        if m.Val > 0 || m.On > 0 then line (sprintf "msn|%s|%d|%d" n m.Val m.On)
    for n in s.Spacep.BuildingOrder do
        let m = Game.Space.getBuilding s.Spacep n
        if m.Val > 0 then line (sprintf "sbld|%s|%d" n m.Val)
    for n in s.Tpool.CfuOrder do
        let m = s.Tpool.CFUs.[n]
        if m.Val > 0 then line (sprintf "cfu|%s|%d|%d|%g" n m.Val m.On m.Heat)
    for n in s.Tpool.VsuOrder do
        let m = s.Tpool.VSUs.[n]
        if m.Val > 0 then line (sprintf "vsu|%s|%d" n m.Val)
    for q in s.QueueItems do
        line (sprintf "q|%s|%s|%d" q.QType q.QName q.QValue)
    line (sprintf "opts|%s|%g" s.Opts.Notation s.Opts.BatchSize)
    if not s.TabsUnlocked.IsEmpty then
        line ("tabs|" + (s.TabsUnlocked |> Set.toList |> String.concat ","))
    if not s.ResHidden.IsEmpty then
        line ("reshid|" + (s.ResHidden |> Set.toList |> String.concat ","))
    line (sprintf "shh|%d" (if s.ShowHiddenRes then 1 else 0))
    for b in Game.Settings.settingsArr do
        line (sprintf "opt|%s|%d" b.Name (if s.Opts.Bools.[b.Name] then 1 else 0))
    sb.ToString()

let parseSave (text: string) : State option =
    let lines = text.Replace("\r", "").Split('\n') |> List.ofArray
    match lines with
    | "klv1" :: _ ->
        let folded =
            lines |> List.fold (fun (s0: State) (ln: string) ->
                let parts = ln.Split('|')
                match parts.[0] with
                | "cal" when parts.Length >= 4 ->
                    { s0 with
                        Calendar =
                            { s0.Calendar with
                                Year = float parts.[1]
                                Season = int parts.[2]
                                FestivalDays = int parts.[3] }
                        Ticks = (if parts.Length > 4 then int parts.[4] else 0) }
                | "res" when parts.Length >= 4 ->
                    { s0 with
                        Pool =
                            { s0.Pool with
                                ByName =
                                    s0.Pool.ByName
                                    |> Map.add parts.[1]
                                        { s0.Pool.ByName.[parts.[1]] with
                                            Value = float parts.[2]
                                            Unlocked = parts.[3] = "1" } } }
                | "bld" when parts.Length >= 5 ->
                    { s0 with
                        Bpool =
                            { s0.Bpool with
                                ByName =
                                    s0.Bpool.ByName
                                    |> Map.add parts.[1]
                                        { s0.Bpool.ByName.[parts.[1]] with
                                            Val = int parts.[2]
                                            On = int parts.[3]
                                            Unlocked = parts.[4] = "1" } } }
                | "tech" when parts.Length >= 4 ->
                    { s0 with
                        Spool =
                            { s0.Spool with
                                Techs =
                                    s0.Spool.Techs
                                    |> Map.add parts.[1]
                                        { s0.Spool.Techs.[parts.[1]] with
                                            Unlocked = parts.[2] = "1"
                                            Researched = parts.[3] = "1" } } }
                | "pol" when parts.Length >= 4 ->
                    { s0 with
                        Spool =
                            { s0.Spool with
                                Policies =
                                    s0.Spool.Policies
                                    |> Map.add parts.[1]
                                        { s0.Spool.Policies.[parts.[1]] with
                                            Unlocked = parts.[2] = "1"
                                            Researched = parts.[3] = "1" } } }
                | "upg" when parts.Length >= 4 ->
                    { s0 with
                        Wpool =
                            { s0.Wpool with
                                Upgrades =
                                    s0.Wpool.Upgrades
                                    |> Map.add parts.[1]
                                        { s0.Wpool.Upgrades.[parts.[1]] with
                                            Unlocked = parts.[2] = "1"
                                            Researched = parts.[3] = "1" } } }
                | "crf" when parts.Length >= 3 ->
                    { s0 with
                        Wpool =
                            { s0.Wpool with
                                Crafts =
                                    s0.Wpool.Crafts
                                    |> Map.add parts.[1]
                                        { s0.Wpool.Crafts.[parts.[1]] with
                                            Value = float parts.[2]
                                            Unlocked = true } } }
                | "kit" when parts.Length >= 3 ->
                    let k = Game.Managers.kittenFromSeed (float parts.[1])
                    let k2 = if parts.[2] = "-" then k else { k with Job = Some parts.[2] }
                    { s0 with Vpool = { s0.Vpool with Kittens = s0.Vpool.Kittens @ [ k2 ] } }
                | "job" when parts.Length >= 3 ->
                    { s0 with Vpool = { s0.Vpool with JobValues = s0.Vpool.JobValues |> Map.add parts.[1] (int parts.[2]) } }
                | "rel" when parts.Length >= 4 ->
                    { s0 with Rpool = { s0.Rpool with Faith = float parts.[1]; FaithRatio = float parts.[2]; TranscendenceTier = int parts.[3] } }
                | "zu" when parts.Length >= 3 ->
                    let m = Game.Religion.getZU s0.Rpool parts.[1]
                    { s0 with Rpool = { s0.Rpool with ZUs = s0.Rpool.ZUs |> Map.add parts.[1] { m with Val = int parts.[2]; Unlocked = true } } }
                | "ru" when parts.Length >= 3 ->
                    let m = Game.Religion.getRU s0.Rpool parts.[1]
                    { s0 with Rpool = { s0.Rpool with RUs = s0.Rpool.RUs |> Map.add parts.[1] { m with Val = int parts.[2] } } }
                | "race" when parts.Length >= 3 ->
                    let r0 = s0.Dpool.Races.[parts.[1]]
                    { s0 with Dpool = { s0.Dpool with Races = s0.Dpool.Races |> Map.add parts.[1] { r0 with Unlocked = true; EmbassyLevel = int parts.[2] } } }
                | "msn" when parts.Length >= 4 ->
                    let m = Game.Space.getProgram s0.Spacep parts.[1]
                    { s0 with Spacep = { s0.Spacep with Programs = s0.Spacep.Programs |> Map.add parts.[1] { m with Val = int parts.[2]; On = int parts.[3]; Unlocked = true } } }
                | "sbld" when parts.Length >= 3 ->
                    let m = Game.Space.getBuilding s0.Spacep parts.[1]
                    { s0 with Spacep = { s0.Spacep with Buildings = s0.Spacep.Buildings |> Map.add parts.[1] { m with Val = int parts.[2]; Unlocked = true } } }
                | "cfu" when parts.Length >= 5 ->
                    let m = s0.Tpool.CFUs.[parts.[1]]
                    { s0 with
                        Tpool =
                            { s0.Tpool with
                                CFUs =
                                    s0.Tpool.CFUs
                                    |> Map.add parts.[1]
                                        { m with Val = int parts.[2]; On = int parts.[3]; Heat = float parts.[4]; Unlocked = true } } }
                | "vsu" when parts.Length >= 3 ->
                    let m = s0.Tpool.VSUs.[parts.[1]]
                    { s0 with Tpool = { s0.Tpool with VSUs = s0.Tpool.VSUs |> Map.add parts.[1] { m with Val = int parts.[2]; Unlocked = true } } }
                | "q" when parts.Length >= 4 ->
                    { s0 with QueueItems = s0.QueueItems @ [ { QType = parts.[1]; QName = parts.[2]; QValue = int parts.[3] } ] }
                | "opts" when parts.Length >= 3 ->
                    { s0 with Opts = { s0.Opts with Notation = parts.[1]; BatchSize = float parts.[2] } }
                | "tabs" when parts.Length >= 2 ->
                    { s0 with TabsUnlocked = parts.[1].Split(',') |> Set.ofArray }
                | "reshid" when parts.Length >= 2 ->
                    { s0 with ResHidden = parts.[1].Split(',') |> Set.ofArray }
                | "shh" when parts.Length >= 2 ->
                    { s0 with ShowHiddenRes = parts.[1] = "1" }
                | "opt" when parts.Length >= 3 ->
                    { s0 with Opts = { s0.Opts with Bools = s0.Opts.Bools |> Map.add parts.[1] (parts.[2] = "1") } }
                | _ -> s0)
                  (init ())
        Some folded
    | _ -> None

let applyLoaded (loaded: State) (old: State) : State =
    let s1 = { loaded with ConsoleMsgs = old.ConsoleMsgs; ConsoleUnlocked = old.ConsoleUnlocked }
    // rebuild maxKittens + kittens resource from the loaded village
    let maxKittens = Game.Managers.calculateMaxKittens s1.Cache s1.Vpool
    let s2 = { s1 with Vpool = { s1.Vpool with MaxKittens = maxKittens } }
    let kittensRes = s2.Pool.ByName["kittens"]
    let pool2 =
        { s2.Pool with
            ByName =
                s2.Pool.ByName
                |> Map.add "kittens"
                    { kittensRes with
                        Value = float s2.Vpool.Kittens.Length
                        MaxValue = float s2.Vpool.MaxKittens
                        Unlocked = s2.Vpool.Kittens.Length > 0 } }
    refreshCache { s2 with Pool = pool2 }

let gatherCatnip (s: State) : State =
    let pool1, _ = Game.Resources.addResEvent s.CalendarDay "catnip" 1.0 s.Pool
    { s with Pool = pool1 }

/// orig resPool.setResourceIsHidden: per-resource visibility toggle (the gear
/// icon edit mode in the resource panel)
let toggleResHidden (name: string) (s: State) : State =
    if s.ResHidden.Contains name
    then { s with ResHidden = s.ResHidden.Remove name }
    else { s with ResHidden = s.ResHidden.Add name }

/// orig resPool.showHiddenResources toggle ("show hidden" checkbox in edit mode)
let setShowHiddenRes (v: bool) (s: State) : State =
    { s with ShowHiddenRes = v }

/// orig bld.refineCatnip + RefineCatnipButtonController: pay 100 catnip
/// (50 with advancedRefinement), gain 1 wood x craft ratio
let refineCatnip (s: State) : State =
    let enriched =
        (match s.Wpool.Upgrades |> Map.tryFind "advancedRefinement" with
         | Some u -> u.Researched
         | None -> false)
    let price = if enriched then 50.0 else 100.0
    if getRes s.Pool "catnip" < price then s
    else
        let ratio =
            Game.Managers.getResCraftRatio s.Cache
                { IronWill = s.IronWill
                  LeaderTrait = None
                  BurnedParagonRatio = Game.Prestige.getBurnedParagonRatio (resValue s "burnedParagon")
                  MonarchyResearched =
                    (match s.Spool.Policies |> Map.tryFind "monarchy" with Some p -> p.Researched | None -> false)
                  BldVal = fun n -> (Game.Buildings.get s.Bpool n |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) }
                "wood"
        let pool1 = Game.Resources.payPrices s.CalendarDay s.Pool [ ("catnip", price) ]
        let pool2, _ = Game.Resources.addResEvent s.CalendarDay "wood" (1.0 + ratio) pool1
        refreshCache { s with Pool = pool2 }

/// Buy one unit of a building through the verified build path (pay + increment
/// + unlocks/upgrades fan-out tail).
let buyBuilding (name: string) (s: State) : State =
    match Game.Buildings.get s.Bpool name with
    | None -> s
    | Some _ ->
        let bpool', pool', built = Game.Buildings.build s.CalendarDay s.Cache (pctx s) s.Pool 1 name s.Bpool
        if built = 0 then s
        else
            let s1 = { s with Bpool = bpool'; Pool = pool' }
            let s2 =
                if s1.Bpool.ByName.[name].Def.BreaksIronWill then { s1 with IronWill = false } else s1
            let s3 =
                match s2.Bpool.ByName.[name].Def.Unlocks with
                | Some u ->
                    let bp2, sp2, wp2 =
                        Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts
                            s2.Bpool s2.Spool s2.Wpool
                    // job unlocks land on the village pool (mine -> miner etc.)
                    { s2 with
                        Bpool = bp2
                        Spool = sp2
                        Wpool = wp2
                        Vpool = { s2.Vpool with JobUnlocked = s2.Vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                        TabsUnlocked = s2.TabsUnlocked |> Set.union (Set.ofList u.Tabs) }
                | None -> s2
            let s4 =
                match s2.Bpool.ByName.[name].Def.Upgrades with
                | Some _ -> refreshCache s3 |> refreshCache // game.upgrade entry+exit
                | None -> s3
            refreshCache s4

// --- V2 actions: jobs, science, workshop ------------------------------------

let crCtxFor (s: State) : Game.Managers.CraftRatioContext =
    { IronWill = s.IronWill
      LeaderTrait = None
      BurnedParagonRatio = Game.Prestige.getBurnedParagonRatio (resValue s "burnedParagon")
      MonarchyResearched =
        (match s.Spool.Policies |> Map.tryFind "monarchy" with Some p -> p.Researched | None -> false)
      BldVal = fun n -> (Game.Buildings.get s.Bpool n |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) }

let traditionResearched (s: State) : bool =
    (match s.Spool.Policies |> Map.tryFind "tradition" with Some p -> p.Researched | None -> false)

/// orig getJobLimit (js/village.js L308-358) — the caps we can hit at this slice
let jobLimit (s: State) (jobName: string) : int =
    match jobName with
    | "engineer" -> (Game.Buildings.get s.Bpool "factory" |> Option.map (fun f -> f.Val) |> Option.defaultValue 0)
    | "ambassador" -> 0
    | _ -> 100000

let assignJob (jobName: string) (n: int) (s: State) : State =
    let before = s.Vpool.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
    let vpool1 = Game.Managers.assignJob jobName n (jobLimit s jobName) s.Vpool
    let assigned = vpool1.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
    if assigned > before then
        let vpool2 = Game.Managers.simAssignJob jobName (assigned - before) vpool1
        { s with Vpool = vpool2 }
    else s

let unassignJob (jobName: string) (n: int) (s: State) : State =
    // orig unassignJob: job value decrements and the last-assigned kittens go
    // back to free (job = None), newest first
    let before = s.Vpool.JobValues |> Map.tryFind jobName |> Option.defaultValue 0
    let amt = min n before
    if amt <= 0 then s
    else
        let vpool1 = Game.Managers.assignJob jobName (-amt) (jobLimit s jobName) s.Vpool
        let assignedKittens = vpool1.Kittens |> List.filter (fun k -> k.Job = Some jobName)
        let releaseSet = List.rev assignedKittens |> List.truncate amt |> List.map (fun k -> k.Seed) |> Set.ofList
        let kittens' =
            vpool1.Kittens
            |> List.map (fun k -> if Set.contains k.Seed releaseSet then { k with Job = None } else k)
        { s with Vpool = { vpool1 with Kittens = kittens' } }

let research (name: string) (s: State) : State =
    let pool', spool', ok = Game.Managers.research s.CalendarDay name s.Pool s.Spool
    if not ok then s
    else
        let s1 = { s with Pool = pool'; Spool = spool' }
        let s2 =
            match Game.Managers.getTech spool' name with
            | Some t when t.Def.Upgrades.IsSome -> refreshCache s1 |> refreshCache
            | _ -> s1
        let s3 =
            match Game.Managers.getTech s2.Spool name with
            | Some t ->
                match t.Def.Unlocks with
                | Some u ->
                    let bp2, sp2, wp2 =
                        Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts
                            s2.Bpool s2.Spool s2.Wpool
                    { s2 with Bpool = bp2; Spool = sp2; Wpool = wp2;
                              Vpool = { s2.Vpool with JobUnlocked = s2.Vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) };
                              TabsUnlocked = s2.TabsUnlocked |> Set.union (Set.ofList u.Tabs) }
                | None -> s2
            | None -> s2
        refreshCache s3

let buyUpgrade (name: string) (s: State) : State =
    let pool', wpool', ok = Game.Managers.buyUpgrade s.CalendarDay name s.Pool s.Wpool
    if ok then refreshCache { s with Pool = pool'; Wpool = wpool' } else s

let craft (name: string) (amt: float) (s: State) : State =
    let pool', wpool', ok = Game.Managers.craft s.CalendarDay s.Cache (traditionResearched s) (crCtxFor s) name amt s.Pool s.Wpool
    if not ok then s
    else
        // CraftButtonController tail: craft.value += amt × (1 + ratio)
        let ratio = Game.Managers.getResCraftRatio s.Cache (crCtxFor s) name
        let wp2 =
            match wpool'.Crafts |> Map.tryFind name with
            | Some c -> { wpool' with Crafts = wpool'.Crafts |> Map.add name { c with Value = c.Value + (System.Math.Ceiling amt) * (1.0 + ratio) } }
            | None -> wpool'
        refreshCache { s with Pool = pool'; Wpool = wp2 }

let craftAll (name: string) (s: State) : State =
    let pool', wpool', ok = Game.Managers.craftAll s.CalendarDay s.Cache (traditionResearched s) (crCtxFor s) (resValue s) name s.Pool s.Wpool
    if not ok then s
    else
        let s1 =
            if s.ConsoleUnlocked.Contains "craft" then
                consoleMsg (Some "craft") ("You crafted " + name) s
            else consoleUnlockedFor s "craft"
        refreshCache { s1 with Pool = pool'; Wpool = wpool' }

// --- V3 actions: religion, diplomacy, space, time, challenges ---------------

let praise (s: State) : State =
    // orig religion.praise (js/religion.js L1536): worship += faith x (1+apocrypha);
    // faith.value = 0.0001
    let faithValue = getRes s.Pool "faith"
    let rpool' = Game.Religion.praise s.Rpool faithValue
    let pool' =
        { s.Pool with ByName = s.Pool.ByName |> Map.add "faith" { s.Pool.ByName["faith"] with Value = 0.0001 } }
    // orig praise msg (tag: faith — unlocks the filter on first use)
    let s1 =
        if s.ConsoleUnlocked.Contains "faith" then
            consoleMsg (Some "faith") ("You praise the gods: +" + sprintf "%.1f" faithValue + " faith") s
        else consoleUnlockedFor s "faith"
    { s1 with Rpool = rpool'; Pool = pool' }

let buyRU (name: string) (s: State) : State =
    let rpool', pool', res = Game.Religion.buyRU s.CalendarDay s.Cache s.Pool 1 name s.Rpool
    if res.Bought = 0 then s
    else
        let rpool2 = Game.Religion.freezeSolarRevolution s.Cache rpool'
        let s1 = { s with Rpool = rpool2; Pool = pool' }
        let s2 =
            match res.UnlockFanOut with
            | Some u ->
                let bp2, sp2, wp2 =
                    Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts
                        s1.Bpool s1.Spool s1.Wpool
                { s1 with Bpool = bp2; Spool = sp2; Wpool = wp2; TabsUnlocked = s1.TabsUnlocked |> Set.union (Set.ofList u.Tabs) }
            | None -> s1
        refreshCache s2

let buyZU (name: string) (s: State) : State =
    let rpool', pool', res = Game.Religion.buyZU s.CalendarDay s.Cache s.Pool 1 name s.Rpool
    if res.Bought = 0 then s
    else
        let s1 = { s with Rpool = rpool'; Pool = pool' }
        let s2 =
            match res.UnlockFanOut with
            | Some u ->
                let bp2, sp2, wp2 =
                    Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts
                        s1.Bpool s1.Spool s1.Wpool
                { s1 with Bpool = bp2; Spool = sp2; Wpool = wp2; TabsUnlocked = s1.TabsUnlocked |> Set.union (Set.ofList u.Tabs) }
            | None -> s1
        refreshCache s2

let trade (raceName: string) (s: State) : State =
    // TradeButtonController: pay manpower/gold/buy-price, then tradeImpl x1
    let dctx = dctxFor s
    let raceState = s.Dpool.Races.[raceName]
    let manp = Game.Diplomacy.getManpowerCost s.Dpool dctx 0 false
    let gold = Game.Diplomacy.getGoldCost s.Dpool dctx 0 false
    let volume = Game.Diplomacy.getTradeVolume dctx Map.empty
    let buyPrice = raceState.Buys.[0].Val * volume
    let cost = [ ("manpower", manp); ("gold", gold); (raceState.Buys.[0].Resource, buyPrice) ]
    if not (Game.Resources.hasRes s.Pool cost 0.0) then s
    else
        let pool' = Game.Resources.payPrices s.CalendarDay s.Pool cost
        let tradeBonus =
            Game.Challenges.getTradeBonusEffect s.Cpool (Game.Effects.getEffect s.Cache)
                (float (Game.Buildings.get s.Bpool "tradepost" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0))
        let dp', _, _ =
            Game.Diplomacy.tradeImpl s.Dpool dctx s.Rand raceName 1.0 Map.empty
                (Game.Effects.getEffect s.Cache "standingRatio" * 0.015)
                false
                (Game.Effects.getEffect s.Cache "neutralRaceEmbassyStanding")
                tradeBonus 0 false
        refreshCache { s with Pool = pool'; Dpool = dp' }

let buyEmbassy (raceName: string) (s: State) : State =
    let dp', pool', built = Game.Diplomacy.buyEmbassies s.CalendarDay s.Dpool (dctxFor s) s.Pool 1 raceName
    if built = 0 then s
    else
        let s1 = { s with Dpool = dp'; Pool = pool' }
        let s2 =
            if (Game.Prestige.getPerk s.Ppool "diplomacy").Researched then
                let spool', _ = Game.Managers.unlockRelations true (fun r -> s1.Dpool.Races.[r].EmbassyLevel) s1.Spool
                { s1 with Spool = spool' }
            else s1
        refreshCache s2

let buyProgram (name: string) (s: State) : State =
    let sp', pool', counter =
        Game.Space.buyProgram (Game.Effects.getEffect s.Cache) false s.CalendarDay name 1 s.Spacep s.Pool
    if counter = 0 then s
    else
        let s1 = { s with Spacep = sp'; Pool = pool' }
        let def = Game.Catalog.Space.programDefs |> List.find (fun d -> d.Name = name)
        let spool2 =
            s1.Spool.Policies
            |> Map.map (fun k v -> if def.UnlocksPolicies |> List.contains k then { v with Unlocked = true } else v)
        refreshCache { s1 with Spool = { s1.Spool with Policies = spool2 } }

let buySpaceBuilding (name: string) (s: State) : State =
    let sp', pool', counter =
        Game.Space.buyBuilding (Game.Effects.getEffect s.Cache) false s.CalendarDay name 1 s.Spacep s.Pool
    if counter = 0 then s
    else refreshCache { s with Spacep = sp'; Pool = pool' }

let timeCalcCtxFor (s: State) : Game.Time.TimeCalcContext =
    { GetEffect = Game.Effects.getEffect s.Cache
      Years1000On = s.Cpool.Challenges.["1000Years"].On
      BlazarVal = (Game.Religion.getTU s.Rpool "blazar").Val
      YearsPerCycle = List.length Game.Calendar.cycleYearColors }

let buyCFU (name: string) (s: State) : State =
    let tp', pool', counter = Game.Time.buyCFU (Game.Effects.getEffect s.Cache) s.CalendarDay name 1 s.Tpool s.Pool
    if counter = 0 then s
    else
        let s1 = { s with Tpool = tp'; Pool = pool' }
        let def = Game.Time.cfuDef name
        let wp2 =
            (s1.Wpool, def.UnlocksUpgrades)
            ||> List.fold (fun acc up ->
                match acc.Upgrades |> Map.tryFind up with
                | Some u -> { acc with Upgrades = acc.Upgrades |> Map.add up { u with Unlocked = true } }
                | None -> acc)
        let tp2 =
            (s1.Tpool, def.UnlocksCFU)
            ||> List.fold (fun acc cfuName ->
                let m' = acc.CFUs.[cfuName]
                { acc with CFUs = acc.CFUs |> Map.add cfuName { m' with Unlocked = true } })
        let s2 = { s1 with Wpool = wp2; Tpool = tp2 }
        let s3 = { s2 with Tpool = Game.Time.cfuCalculate (timeCalcCtxFor s2) name s2.Tpool }
        refreshCache s3

let buyVSU (name: string) (s: State) : State =
    let burnRatio = Game.Prestige.getBurnedParagonRatio (resValue s "burnedParagon")
    let tp', pool', counter = Game.Time.buyVSU s.CalendarDay name 1 burnRatio s.Tpool s.Pool
    if counter = 0 then s
    else
        let s1 = { s with Tpool = tp'; Pool = pool' }
        let s2 =
            if (Game.Time.vsuDef name).BreaksIronWill = Some true then { s1 with IronWill = false } else s1
        let s3 =
            if name = "cryochambers" then
                let m' = s2.Tpool.VSUs.["cryochambers"]
                { s2 with Tpool = { s2.Tpool with VSUs = s2.Tpool.VSUs |> Map.add "cryochambers" { m' with Unlocked = true } } }
            else s2
        refreshCache s3

let toggleChallengePending (name: string) (s: State) : State =
    // ChallengeBtnController.togglePending (non-IW); pending activates on reset
    let c = s.Cpool.Challenges.[name]
    { s with Cpool = { s.Cpool with Challenges = s.Cpool.Challenges |> Map.add name { c with Pending = not c.Pending } } }

let queueTick (s: State) : State =
    match s.QueueItems with
    | [] -> s
    | first :: _ ->
        let s2, bought =
            match first.QType with
            | "buildings" ->
                let s1 = buyBuilding first.QName s
                s1, s1.Bpool.ByName.[first.QName].Val > s.Bpool.ByName.[first.QName].Val
            | "tech" ->
                let s1 = research first.QName s
                s1, s1.Spool.Techs.[first.QName].Researched
            | _ -> s, false
        if bought then { s2 with QueueItems = (match s2.QueueItems with [] -> [] | _ :: rest -> rest) }
        else s2
let tick (s: State) : State =
    let s1 = refreshCache s
    let uctx : Game.Resources.UpdateContext =
        { Cap = capCtx s1
          GetResourcePerTick =
            (fun n ->
                (match Game.Resources.get s1.Pool n with
                 | Some r when r.Def.CalculatePerTick -> r.PerTickCached
                 | _ -> 0.0))
          CalendarSeason = s1.Calendar.Season
          PastureOn = (Game.Buildings.get s1.Bpool "pasture" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
          EnergyLoss = 0.0
          EnergyChallengeResearched = false
          EnergyChallengeActive = false }
    let pool1 = Game.Resources.update uctx s1.CalendarDay s1.Pool
    let bpool1 = Game.Buildings.update pool1 s1.Bpool
    let s2 = { s1 with Pool = pool1; Bpool = bpool1 }

    // --- village sim (verified village-02/04/05 paths; browser RNG is real
    // Math.random so the draw-count seams don't apply here) ---
    let maxKittens = Game.Managers.calculateMaxKittens s2.Cache s2.Vpool
    let vpool0 = { s2.Vpool with MaxKittens = maxKittens }
    let mutable kittensPerTick = 0.01 * (1.0 + Game.Effects.getEffect s2.Cache "kittenGrowthRatio")
    if s2.Calendar.FestivalDays > 0 then
        kittensPerTick <- kittensPerTick * 2.0
    let catnipPerTickTrue =
        (match Game.Resources.get s2.Pool "catnip" with Some r -> r.PerTickCached | None -> 0.0)
    let catnipVal = getRes s2.Pool "catnip"
    let starving = vpool0.Kittens.Length > 0 && (catnipVal + catnipPerTickTrue < 0.0)
    let preStarve = vpool0.Kittens.Length
    let vpool1 = Game.Managers.starvationStep catnipVal catnipPerTickTrue 5.0 false maxKittens vpool0
    let growthRate = if starving then 0.0 else kittensPerTick
    let beforeBirths = vpool1.Kittens.Length
    let vpool2, births = Game.Managers.simUpdate maxKittens growthRate 1 s.Rand vpool1
    let skillCtx : Game.Managers.SkillContext =
        { AnarchyActive = false
          InternetResearched = (match s2.Wpool.Upgrades |> Map.tryFind "internet" with Some u -> u.Researched | None -> false)
          NeuralNetworksResearched = (match s2.Wpool.Upgrades |> Map.tryFind "neuralNetworks" with Some u -> u.Researched | None -> false)
          SkillXPEffect = Game.Effects.getEffect s2.Cache "skillXP"
          MaxKittensRatioLDR = Game.Effects.getEffect s2.Cache "maxKittensRatio"
          Day = s2.CalendarDay
          GetJobValue = fun n -> vpool2.JobValues |> Map.tryFind n |> Option.defaultValue 0
          GetJobUnlocked = fun n -> vpool2.JobUnlocked.Contains n
          Times = 1 }
    let vpool3 = Game.Managers.learnSkills skillCtx vpool2
    // kittens pseudo-resource sync
    let kittensRes = s2.Pool.ByName["kittens"]
    let pool2 =
        { s2.Pool with ByName = s2.Pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool3.Kittens.Length; MaxValue = float vpool3.MaxKittens } }
    let stpool1 =
        let bumped =
            s2.Stpool
            |> Game.Stats.bumpStat "totalKittens" (float (vpool3.Kittens.Length - beforeBirths))
            |> Game.Stats.bumpStat "kittensDead" (float (preStarve - vpool3.Kittens.Length))
        bumped
    // happiness
    let luxCount =
        pool2.Order
        |> List.sumBy (fun n ->
            match Game.Resources.get pool2 n with
            | Some r when r.Def.Category <> "common" && r.Value > 0.0 -> 1
            | _ -> 0)
    let hctx : Game.Happiness.HappinessContext =
        { Game.Happiness.freshHappinessContext with
            LuxuryCount = luxCount
            FestivalDays = s2.Calendar.FestivalDays
            GetEffect = Game.Effects.getEffect s2.Cache
            PollutionHappines = 0.0 }
    let vpool4 = { vpool3 with Happiness = Game.Happiness.updateHappiness hctx vpool3.Kittens.Length vpool3.MaxKittens }
    let s3 = { s2 with Pool = pool2; Vpool = vpool4; Stpool = stpool1 }
    // orig sim.update (js/village.js L3239-3244): while the village is small
    // (maxKittens <= 10 && times == 1), every kitten arrival posts
    // "A kitten has joined your village"
    let s3 =
        if maxKittens <= 10 && births > 0 then
            List.fold (fun st _ -> consoleMsg None "A kitten has joined your village" st) s3 [ 1..births ]
        else s3

    // engineer crafting every tick (workshop fastforward slice)
    let crCtx : Game.Managers.CraftRatioContext =
        { IronWill = s3.IronWill
          LeaderTrait = None
          BurnedParagonRatio = 0.0
          MonarchyResearched = false
          BldVal = fun n -> (Game.Buildings.get s3.Bpool n |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) }
    let prod = Game.Managers.getResProduction s3.Cache s3.Vpool (Game.Catalog.Village.jobDefs |> List.map (fun j -> (j.Name, j)) |> Map.ofList) s3.Wpool
    let pool3, wpool1, _ =
        Game.Managers.craftByEngineers s3.CalendarDay s3.Cache false crCtx (resValue s3) prod false 1.0 s3.Pool s3.Wpool
    let pool4 = Game.Resources.updateMaxValueAll (capCtx s3) pool3

    let calCtx : Game.Calendar.CalendarContext =
        { GetEffect = Game.Effects.getEffect s3.Cache
          DarkFuture = false
          ChronomancyResearched = false
          UnicornmancyResearched = false
          Year1000ChallengeActive = false
          WinterIsComingResearched = false
          WinterIsComingActive = false
          AdvancedAutomationResearched = false
          CommunismResearched = false
          WinterIsComingOn = false
          Rand = fun () -> 0.5
          OnParadox = fun st -> st
          OnNewDayRefresh = fun st -> st
          OnObserveTimeout = fun st -> st
          TimeAccelerationRatio = 0.0
          OnFlux = fun _ -> ()
          OnNewSeasonTail = fun st -> st
          OnNewDayTail = fun st -> st }
    let calendar1 = Game.Calendar.tick calCtx s3.Calendar
    // diplomacy.update per tick (race unlock rolls at the year gate; browser
    // RNG is real Math.random so the draw-count seams don't apply here)
    let dp1 =
        let dctx0 = dctxFor s3
        fst (Game.Diplomacy.update s3.Dpool dctx0 s3.Calendar.Year s3.Pool.KarmaKittens (fun () -> s.Rand ()))
    let s4 = { s3 with Pool = pool4; Wpool = wpool1; Dpool = dp1; Calendar = calendar1; Ticks = s3.Ticks + 1; CalendarDay = int calendar1.Day }
    // orig tab-reveal side conditions: religion tab on first faith produced
    // (religion.update), trade tab on first race contact (unlockRandomRace)
    let s4 =
        { s4 with
            TabsUnlocked =
                s4.TabsUnlocked
                |> (fun tabs ->
                    if getRes s4.Pool "faith" > 0.0 then tabs |> Set.add "religion" else tabs)
                |> (fun tabs ->
                    if Game.Diplomacy.hasUnlockedRaces s4.Dpool then tabs |> Set.add "trade" else tabs) }
    let s5 = queueTick s4
    refreshCache s5

// --- view model -------------------------------------------------------------

type ResRow =
    { Name: string; Title: string; Value: float; Max: float; PerTick: float; Hidden: bool; Show: bool }

let resRows (s: State) : ResRow list =
    s.Pool.Order
    |> List.map (fun n ->
        match Game.Resources.get s.Pool n with
        | None -> { Name = n; Title = n; Value = 0.0; Max = 0.0; PerTick = 0.0; Hidden = false; Show = false }
        | Some r ->
            // orig WResourceRow.getIsResInMainTable: unlocked (kittens also when
            // it has a max); craftable resources migrate to the craft table once
            // their recipe is unlocked — EXCEPT wood, which by orig rule
            // (isNormalCraftableResource: craftable && name != "wood") appears
            // in BOTH the main table and the craft table
            let craftMigrated =
                r.Def.Craftable && n <> "wood"
                && (match s.Wpool.Crafts |> Map.tryFind n with
                    | Some c -> c.Unlocked
                    | None -> false)
            let hasVisibility = r.Unlocked || (n = "kittens" && r.MaxValue > 0.0)
            let perTick = if r.Def.CalculatePerTick then r.PerTickCached else 0.0
            { Name = n
              Title = Game.Labels.get ("res." + n)
              Value = r.Value
              Max = r.MaxValue
              PerTick = perTick
              Hidden = s.ResHidden.Contains n
              Show = hasVisibility && not craftMigrated })

type PriceRow = { Resource: string; Val: float }

type BuildingRow =
    { Name: string; Label: string; Visible: bool; Enabled: bool; Val: int; Prices: PriceRow list }

type JobRow =
    { Name: string; Label: string; Assigned: int; Unlocked: bool }

type TechRow =
    { Name: string; Label: string; Prices: PriceRow list; Unlocked: bool; Researched: bool; Enabled: bool }

type UpgradeRow =
    { Name: string; Label: string; Prices: PriceRow list; Unlocked: bool; Researched: bool; Enabled: bool }

type CraftRow =
    { Name: string; Label: string; Prices: PriceRow list; Value: float; Unlocked: bool; AllCount: int }

let jobRows (s: State) : JobRow list =
    Game.Catalog.Village.jobDefs
    |> List.map (fun jd ->
        { Name = jd.Name
          Label = Game.Labels.get ("job." + jd.Name)
          Assigned = s.Vpool.JobValues |> Map.tryFind jd.Name |> Option.defaultValue 0
          Unlocked = s.Vpool.JobUnlocked.Contains jd.Name })

let kittenSummary (s: State) : int * int * float =
    (s.Vpool.Kittens.Length, s.Vpool.MaxKittens, s.Vpool.Happiness)

let techRows (s: State) : TechRow list =
    s.Spool.TechOrder
    |> List.choose (fun n ->
        match s.Spool.Techs |> Map.tryFind n with
        | Some t when t.Unlocked ->
            let prices = t.Def.Prices |> List.map (fun p -> { Resource = p.Resource; Val = p.Val })
            let affordable = Game.Resources.hasRes s.Pool (t.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            Some { Name = n; Label = Game.Labels.get ("tech." + n); Prices = prices; Unlocked = true; Researched = t.Researched; Enabled = affordable && not t.Researched }
        | _ -> None)

let upgradeRows (s: State) : UpgradeRow list =
    s.Wpool.UpgradeOrder
    |> List.choose (fun n ->
        match s.Wpool.Upgrades |> Map.tryFind n with
        | Some u when u.Unlocked ->
            let prices = u.Def.Prices |> List.map (fun p -> { Resource = p.Resource; Val = p.Val })
            let affordable = Game.Resources.hasRes s.Pool (u.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            Some { Name = n; Label = Game.Labels.get ("up." + n); Prices = prices; Unlocked = true; Researched = u.Researched; Enabled = affordable && not u.Researched }
        | _ -> None)

let craftRows (s: State) : CraftRow list =
    s.Wpool.CraftOrder
    |> List.choose (fun n ->
        match s.Wpool.Crafts |> Map.tryFind n with
        | Some c when c.Unlocked ->
            let prices = c.Def.Prices |> List.map (fun p -> { Resource = p.Resource; Val = p.Val })
            // orig WCraftRow: hidden resources drop out of the craft table too,
            // except wood which is toggled separately (isHiddenFromCrafting)
            if s.ResHidden.Contains n && n <> "wood" then None
            else
                let allCount =
                    Game.Managers.getCraftAllCount s.Cache (traditionResearched s) (resValue s) s.Wpool n |> int
                Some { Name = n; Label = Game.Labels.get ("craft." + n); Prices = prices; Value = c.Value; Unlocked = true; AllCount = allCount }
        | _ -> None)

type RaceRow =
    { Name: string; Label: string; Unlocked: bool; Standing: float; EmbassyLevel: int; Tradeable: bool }

let raceRows (s: State) : RaceRow list =
    s.Dpool.RaceOrder
    |> List.filter (fun n -> s.Dpool.Races.[n].Unlocked)
    |> List.map (fun n ->
        let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = n)
        { Name = n
          Label = Game.Labels.get ("race." + n)
          Unlocked = true
          Standing = (Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = n)).Standing
          EmbassyLevel = s.Dpool.Races.[n].EmbassyLevel
          Tradeable = not def.Buys.IsEmpty })

type ReligionRow =
    { Name: string; Label: string; Kind: string; Val: int; Unlocked: bool; Enabled: bool }

let religionRows (s: State) : ReligionRow list =
    let ruRows =
        s.Rpool.RuOrder
        |> List.filter (fun n ->
            let def = Game.Catalog.World.ruDefs |> List.find (fun d -> d.Name = n)
            let m = Game.Religion.getRU s.Rpool n
            def.FaithGate.IsSome
            && m.Unlocked
            && (m.Val > 0 || s.Rpool.Faith >= (match def.FaithGate with Some f -> f | None -> 0.0)))
        |> List.map (fun n ->
            let m = Game.Religion.getRU s.Rpool n
            { Name = n; Label = Game.Labels.get ("ru." + n); Kind = "ru"; Val = m.Val; Unlocked = true; Enabled = true })
    let zuRows =
        s.Rpool.ZuOrder
        |> List.filter (fun n -> (Game.Religion.getZU s.Rpool n).Unlocked)
        |> List.map (fun n ->
            let m = Game.Religion.getZU s.Rpool n
            { Name = n; Label = Game.Labels.get ("zu." + n); Kind = "zu"; Val = m.Val; Unlocked = true; Enabled = true })
    zuRows @ ruRows

type SpaceRow =
    { Name: string; Label: string; Kind: string; Val: int; Enabled: bool }

let spaceRows (s: State) : SpaceRow list =
    let progRows =
        s.Spacep.ProgramOrder
        |> List.filter (fun n -> (Game.Space.getProgram s.Spacep n).Unlocked && (Game.Space.getProgram s.Spacep n).Val = 0)
        |> List.map (fun n ->
            let m = Game.Space.getProgram s.Spacep n
            let def = Game.Catalog.Space.programDefs |> List.find (fun d -> d.Name = n)
            let affordable = Game.Resources.hasRes s.Pool (def.Prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            { Name = n; Label = Game.Labels.get ("mission." + n); Kind = "mission"; Val = m.Val; Enabled = affordable })
    let bldRows =
        s.Spacep.BuildingOrder
        |> List.filter (fun n -> (Game.Space.getBuilding s.Spacep n).Unlocked)
        |> List.map (fun n ->
            let m = Game.Space.getBuilding s.Spacep n
            let def = Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = n)
            let prices =
                def.Prices
                |> List.map (fun p ->
                    let ratio = 1.05 ** float m.Val // verified oil ladder (space-10)
                    (p.Resource, p.Val * ratio))
            let affordable = Game.Resources.hasRes s.Pool prices 0.0
            { Name = n; Label = Game.Labels.get ("sbld." + n); Kind = "sbld"; Val = m.Val; Enabled = affordable })
    progRows @ bldRows

type TimeRow =
    { Name: string; Label: string; Kind: string; Val: int; Enabled: bool }

let timeRows (s: State) : TimeRow list =
    let cfuRows =
        s.Tpool.CfuOrder
        |> List.filter (fun n -> s.Tpool.CFUs.[n].Unlocked)
        |> List.map (fun n ->
            let m = s.Tpool.CFUs.[n]
            let def = Game.Time.cfuDef n
            let capped = (match def.LimitBuild with Some lb when float lb <= float m.Val -> true | _ -> false)
            let affordable =
                if capped then false
                else
                    let ratio = def.PriceRatio ** float m.Val
                    Game.Resources.hasRes s.Pool (def.Prices |> List.map (fun p -> (p.Resource, p.Val * ratio))) 0.0
            { Name = n; Label = Game.Labels.get ("cfu." + n); Kind = "cfu"; Val = m.Val; Enabled = affordable && not capped })
    let vsuRows =
        s.Tpool.VsuOrder
        |> List.filter (fun n -> n <> "usedCryochambers" && s.Tpool.VSUs.[n].Unlocked)
        |> List.map (fun n ->
            let m = s.Tpool.VSUs.[n]
            let def = Game.Time.vsuDef n
            let affordable = Game.Resources.hasRes s.Pool (def.Prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0
            { Name = n; Label = Game.Labels.get ("vsu." + n); Kind = "vsu"; Val = m.Val; Enabled = affordable })
    cfuRows @ vsuRows

type ChallengeRow =
    { Name: string; Label: string; Unlocked: bool; Pending: bool; Active: bool; Researched: bool; On: int }

let challengeRows (s: State) : ChallengeRow list =
    s.Cpool.Order
    |> List.filter (fun n -> s.Cpool.Challenges.[n].Unlocked)
    |> List.map (fun n ->
        let c = s.Cpool.Challenges.[n]
        { Name = n; Label = Game.Labels.get ("challenge." + n); Unlocked = true; Pending = c.Pending; Active = c.Active; Researched = c.Researched; On = c.On })

let buildingRows (s: State) : BuildingRow list =
    s.Bpool.Order
    |> List.choose (fun n ->
        match Game.Buildings.get s.Bpool n with
        | None -> None
        | Some b ->
            // orig BuildingBtnController.updateVisible (core.js L1987):
            // model.visible = meta.unlocked — no defaultUnlockable override.
            // Buttons appear when Game.Buildings.update (run every tick)
            // flips Unlocked once stock reaches price x unlockRatio.
            if not b.Unlocked then None
            else
                let prices = Game.Buildings.getAllPrices s.Cache (pctx s) b
                let affordable = Game.Resources.hasRes s.Pool (prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0
                Some(
                    { Name = n
                      Label = Game.Labels.get ("bld." + n)
                      Visible = true
                      Enabled = affordable
                      Val = b.Val
                      Prices = prices |> List.map (fun p -> { Resource = p.Resource; Val = p.Val }) }
                ))

// --- display formatters (game-12 verification port) ------------------------

/// orig game.tabs visible flags — which mid-column tabs the player sees
/// (Bonfire always; others revealed via unlock({tabs}) or side conditions)
let tabVisible (s: State) (tabId: string) : bool =
    match tabId with
    | "Bonfire" -> true
    | "Village" -> s.TabsUnlocked.Contains "village"
    | "Science" -> s.TabsUnlocked.Contains "science"
    | "Workshop" -> s.TabsUnlocked.Contains "workshop"
    | "Trade" -> s.TabsUnlocked.Contains "trade"
    | "Religion" -> s.TabsUnlocked.Contains "religion"
    | "Space" -> s.TabsUnlocked.Contains "space"
    | "Time" -> s.TabsUnlocked.Contains "time"
    // right-column queue tab unlocks with agriculture (orig tech "agriculture")
    | "Queue" -> s.TabsUnlocked.Contains "queue"
    // orig: adjustmentBureau perk researched or reserved
    | "Challenges" ->
        (match s.Ppool.Perks |> Map.tryFind "adjustmentBureau" with
         | Some p -> p.Researched
         | None -> false)
    | _ -> false

/// orig ui.updateCalendar: season title only until the "calendar" tech is
/// researched, then "Year {0} - {1}, day {2}" (raw 0-based values, like orig)
let calendarText (s: State) : string =
    let seasonTitle = Game.Labels.get ("season." + Game.Calendar.seasons.[s.Calendar.Season].Name)
    let hasCalendarTech =
        (match s.Spool.Techs |> Map.tryFind "calendar" with
         | Some t -> t.Researched
         | None -> false)
    if hasCalendarTech then
        (Game.Labels.get "calendar.year.full")
            .Replace("{0}", string (int s.Calendar.Year))
            .Replace("{1}", seasonTitle)
            .Replace("{2}", string (int s.Calendar.Day))
    else seasonTitle

