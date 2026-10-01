module kittens_land.KittensState

// V1 view-layer slice: a fresh-game state assembled from the oracle-verified
// Game library, with gather/buy/tick actions for the Bonfire tab. Systems not
// yet surfaced (village sim, religion, space, time automation) are carried as
// their verified pools so later milestones extend, not rewrite, this module.

open Game
open Game.Effects

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
      IronWill: bool }

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
        { fresh with
            Happiness = s1.Vpool.Happiness
            Kittens = s1.Vpool.Kittens.Length
            FreeKittens = Game.Managers.getFreeKittens s1.Vpool }
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

let init () : State =
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
          IronWill = true }
    fresh |> refreshCache

/// One game tick: effect/per-tick caches, production, caps, calendar.
let browserRand =
    let r = System.Random()
    fun () -> r.NextDouble()

let dctxFor (s: State) : Game.Diplomacy.DiplomacyContext =
    { GetEffect = Game.Effects.getEffect s.Cache
      GetResValue = resValue s
      GetResMax = fun n -> getResMax s.Pool n
      IsResUnlocked =
        fun n -> (match Game.Resources.get s.Pool n with Some r -> r.Unlocked | None -> false)
      Season = Game.Calendar.seasons.[s.Calendar.Season].Name
      NuclearFissionResearched = false
      IronWill = false }

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
    let vpool2 = Game.Managers.simUpdate maxKittens growthRate 1 browserRand vpool1
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
        fst (Game.Diplomacy.update s3.Dpool dctx0 s3.Calendar.Year s3.Pool.KarmaKittens (fun () -> browserRand ()))
    let s4 = { s3 with Pool = pool4; Wpool = wpool1; Dpool = dp1; Calendar = calendar1; Ticks = s3.Ticks + 1; CalendarDay = int calendar1.Day }
    refreshCache s4

let gatherCatnip (s: State) : State =
    let pool1, _ = Game.Resources.addResEvent s.CalendarDay "catnip" 1.0 s.Pool
    { s with Pool = pool1 }

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
                        Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts
                            s2.Bpool s2.Spool s2.Wpool
                    { s2 with Bpool = bp2; Spool = sp2; Wpool = wp2 }
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
                              Vpool = { s2.Vpool with JobUnlocked = s2.Vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) } }
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
    if ok then refreshCache { s with Pool = pool'; Wpool = wpool' } else s

// --- V3 actions: religion, diplomacy, space, time, challenges ---------------

let praise (s: State) : State =
    // orig religion.praise (js/religion.js L1536): worship += faith x (1+apocrypha);
    // faith.value = 0.0001
    let faithValue = getRes s.Pool "faith"
    let rpool' = Game.Religion.praise s.Rpool faithValue
    let pool' =
        { s.Pool with ByName = s.Pool.ByName |> Map.add "faith" { s.Pool.ByName["faith"] with Value = 0.0001 } }
    { s with Rpool = rpool'; Pool = pool' }

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
                { s1 with Bpool = bp2; Spool = sp2; Wpool = wp2 }
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
                { s1 with Bpool = bp2; Spool = sp2; Wpool = wp2 }
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
            Game.Diplomacy.tradeImpl s.Dpool dctx browserRand raceName 1.0 Map.empty
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

// --- view model -------------------------------------------------------------

type ResRow = { Name: string; Value: float; Max: float; Show: bool }

let resRows (s: State) : ResRow list =
    s.Pool.Order
    |> List.truncate 10
    |> List.map (fun n ->
        { Name = n
          Value = getRes s.Pool n
          Max = getResMax s.Pool n
          Show = (match Game.Resources.get s.Pool n with Some r -> r.Unlocked || r.Value > 0.0 || r.Def.Name = "catnip" | None -> false) })

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
    { Name: string; Label: string; Prices: PriceRow list; Value: float; Unlocked: bool }

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
            Some { Name = n; Label = Game.Labels.get ("craft." + n); Prices = prices; Value = c.Value; Unlocked = true }
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
