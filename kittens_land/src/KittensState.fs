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
    [ Game.Religion.religionGroup s.Rpool
      emptyGroup // challenges
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
      Game.Challenges.challengesGroup s.Cpool (getEffect s)
          (float (Game.Buildings.get s.Bpool "tradepost" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0))
      Game.Time.timeGroup s.Tpool false ]

let refreshCache (s: State) : State =
    { s with Cache = Game.Effects.updateCaches s.Cache (groups s) }

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
    let pool2 = Game.Resources.updateMaxValueAll (capCtx s1) pool1
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
    let calendar1 = Game.Calendar.tick calCtx s1.Calendar
    { s1 with Pool = pool2; Calendar = calendar1; Ticks = s1.Ticks + 1; CalendarDay = int calendar1.Day }

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

// --- view model -------------------------------------------------------------

type ResRow = { Name: string; Value: float; Max: float; Show: bool }

let resRows (s: State) : ResRow list =
    s.Pool.Order
    |> List.truncate 10
    |> List.map (fun n ->
        { Name = n
          Value = getRes s.Pool n
          Max = getResMax s.Pool n
          Show = (match Game.Resources.get s.Pool n with Some r -> r.Unlocked || r.Value > 0.0 | None -> false) })

type PriceRow = { Resource: string; Val: float }

type BuildingRow =
    { Name: string; Label: string; Visible: bool; Enabled: bool; Val: int; Prices: PriceRow list }

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
                      Label = n
                      Visible = true
                      Enabled = affordable
                      Val = b.Val
                      Prices = prices |> List.map (fun p -> { Resource = p.Resource; Val = p.Val }) }
                ))
