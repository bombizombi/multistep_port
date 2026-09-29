module Game.Space

// space-01/05/06/07/08/09/10: SpaceManager state + purchase flows + per-tick
// update + fastforward + per-building calculated effects. Sources:
// js/space.js L22-120 (programs), L226-963 (buildings + calculateEffects /
// updateEffects / action), L975-991 (provider), L1097-1175 (update /
// fastforward), js/calendar.js L322 (cycleEffectsBasics). The calculated
// effects are the UI-render job: controller.build calls meta.calculateEffects
// (wholesale `self.effects = {...}` swap) right after the purchase loop, then
// cycleEffectsBasics, then game.upgrade(meta.upgrades).

open Game.Types

type SpaceMeta =
    { Val: int
      On: int
      Unlocked: bool
      Effects: Map<string, float> }

type PlanetState =
    { Reached: bool
      Unlocked: bool
      RouteDays: float }

type SpacePool =
    { Programs: Map<string, SpaceMeta>
      ProgramOrder: string list
      Buildings: Map<string, SpaceMeta>
      BuildingOrder: string list
      Planets: Map<string, PlanetState>
      PlanetOrder: string list }

let init () : SpacePool =
    let progDefs = Game.Catalog.Space.programDefs
    let bldDefs = Game.Catalog.Space.buildingDefs
    let plDefs = Game.Catalog.Space.planetDefs
    { Programs = progDefs |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = d.Name = "orbitalLaunch"; Effects = Map.empty })) |> Map.ofList
      ProgramOrder = progDefs |> List.map (fun d -> d.Name)
      Buildings = bldDefs |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = false; Effects = d.Effects })) |> Map.ofList
      BuildingOrder = bldDefs |> List.map (fun d -> d.Name)
      Planets = plDefs |> List.map (fun d -> (d.Name, { Reached = false; Unlocked = false; RouteDays = d.RouteDays })) |> Map.ofList
      PlanetOrder = plDefs |> List.map (fun d -> d.Name) }

let resetState (_sp: SpacePool) : SpacePool = init ()

let getProgram (sp: SpacePool) (name: string) : SpaceMeta = sp.Programs.[name]
let getBuilding (sp: SpacePool) (name: string) : SpaceMeta = sp.Buildings.[name]

/// per-building priceRatio (js/space.js defs); orig controller default 1.15
let priceRatio (name: string) : float =
    match name with
    | "sattelite" -> 1.08
    | "spaceElevator" -> 1.15
    | "spaceStation" -> 1.12
    | "moonOutpost" -> 1.12
    | "moonBase" -> 1.12
    | "planetCracker" -> 1.18
    | "hydrofracturer" -> 1.18
    | "spiceRefinery" -> 1.15
    | "researchVessel" -> 1.15
    | "orbitalArray" -> 1.15
    | "sunlifter" -> 1.15
    | "containmentChamber" -> 1.125
    | "heatsink" -> 1.12
    | "sunforge" -> 1.12
    | "cryostation" -> 1.12
    | "spaceBeacon" -> 1.15
    | "terraformingStation" -> 1.25
    | "hydroponics" -> 1.15
    | "hrHarvester" -> 1.15
    | "navigationRelay" -> 1.2
    | "spaceShuttle" -> 1.15
    | "entangler" -> 1.15
    | "tectonic" -> 1.25
    | "moltenCore" -> 1.25
    | _ -> 1.15

/// SpaceProgramBtnController.getPrices (js/space.js L1298-1321): oil/manpower
/// reductions, blackSky orbitalLaunch starchart→0 / rest ×11.
let missionPrices (getEffect: string -> float) (blackSkyActive: bool) (name: string) (def: Game.Catalog.Space.SpaceProgramDef) : (string * float) list =
    def.Prices
    |> List.map (fun p ->
        let mutable v = float p.Val
        if p.Resource = "oil" then
            v <- v * (1.0 - Game.Math.getLimitedDR (getEffect "oilReductionRatio") 0.75)
        if p.Resource = "manpower" then
            v <- v * (1.0 - Game.Math.getLimitedDR (getEffect "catpowerReductionRatio") 0.75)
        if blackSkyActive && name = "orbitalLaunch" then
            v <- (if p.Resource = "starchart" then 0.0 else v * 11.0)
        (p.Resource, v))

/// PlanetBuildingBtnController.getPrices (js/space.js L1396-1428): priceRatio
/// ladder (oil 1.05), oilReductionRatio, per-meta + per-resource
/// CostReduction effects, blackSky sattelite (val=0) starchart→0 / rest ×14.
let buildingPrices
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (def: Game.Catalog.Space.SpaceBuildingDef)
    (val0: int)
    : (string * float) list =
    let ratio = priceRatio def.Name
    let metaDiscount = 1.0 - Game.Math.getLimitedDR (getEffect (def.Name + "CostReduction")) 1.0
    let oilDiscount = 1.0 - Game.Math.getLimitedDR (getEffect "oilReductionRatio") 0.75
    def.Prices
    |> List.map (fun p ->
        let mutable v =
            if p.Resource <> "oil" then float p.Val * (ratio ** float val0)
            else (float p.Val * (1.05 ** float val0)) * oilDiscount
        let resDiscount = 1.0 - Game.Math.getLimitedDR (getEffect (p.Resource + "CostReduction")) 1.0
        v <- v * metaDiscount * resDiscount
        if blackSkyActive && def.Name = "sattelite" && val0 = 0 then
            v <- (if p.Resource = "starchart" then 0.0 else v * 14.0)
        (p.Resource, v))

/// orig MissionBtnController build (L1322-1345 via StackableBtn build +
/// updateEnabled): gate on unlocked + not in-progress (val≠0 && on=0); after
/// the purchase loop metadata.on is reset to 0 — except rorschachMission
/// which completes instantly (on=1). Unlocks fire on the first completion.
let buyProgram
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (calendarDay: int)
    (name: string)
    (maxBld: int)
    (sp: SpacePool)
    (pool: ResPool)
    : SpacePool * ResPool * int =
    let mutable sp = sp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let def = Game.Catalog.Space.programDefs |> List.find (fun d -> d.Name = name)
    let m0 = sp.Programs.[name]
    // updateEnabled: in-progress gate ONLY (unlocked is UI visibility; the
    // build path checks affordability alone)
    let enabled = not (m0.Val <> 0 && m0.On = 0)
    if enabled then
        let prices () = missionPrices getEffect blackSkyActive name def
        while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
            let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
            pool <- pool1
            sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with Val = sp.Programs.[name].Val + 1 } }
            counter <- counter + 1
            maxBld <- maxBld - 1
            if counter = 1 then
                // unlocks fire on the first completion (missions are val=1 metas)
                for pn in def.UnlocksPlanets do
                    let pl = sp.Planets.[pn]
                    sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with Unlocked = true } }
                for mn in def.UnlocksMissions do
                    let m = sp.Programs.[mn]
                    sp <- { sp with Programs = sp.Programs |> Map.add mn { m with Unlocked = true } }
        // build() resets on, then rorschach completes instantly (no route)
        sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with On = 0 } }
        if name = "rorschachMission" then
            sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with On = 1 } }
    sp, pool, counter

/// SpaceBuildingBtnController.build: gated on unlocked (planet-reached is a
/// precondition of unlock); prices re-read per purchase.
let buyBuilding
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (calendarDay: int)
    (name: string)
    (maxBld: int)
    (sp: SpacePool)
    (pool: ResPool)
    : SpacePool * ResPool * int =
    let mutable sp = sp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let def = Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = name)
    // no unlocked/planet gate: controller build checks affordability only
    let prices () = buildingPrices getEffect blackSkyActive def sp.Buildings.[name].Val
    while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
        let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
        pool <- pool1
        sp <- { sp with Buildings = sp.Buildings |> Map.add name { sp.Buildings.[name] with Val = sp.Buildings.[name].Val + 1; On = sp.Buildings.[name].On + 1 } }
        counter <- counter + 1
        maxBld <- maxBld - 1
    sp, pool, counter

// --- js/space.js L226-963: per-building calculated effects -------------------

type SpaceCalcCtx =
    { GetEffect: string -> float
      SolarSatellitesResearched: bool
      AmBasesResearched: bool
      AiBasesResearched: bool
      BlackSkyActive: bool
      DarkFutureYears: float
      NumerologyActive: bool
      NumerologyCycleMult: string -> float option
      AiCoreOn: int
      // mid-calc game.upgrade(list) — runner side (sattelite: observatory +
      // blackSky; blackSky itself upgrades marker). Wraps updateCaches.
      RunUpgradeFanout: (string * string list) list -> unit }

/// metas with a calculateEffects body (XOR updateEffects: game.upgrade calls
/// exactly one; heatsink/sunforge bodies are empty but present).
let hasCalcEffects (name: string) : bool =
    List.contains name
        [ "spaceElevator"; "sattelite"; "spaceStation"; "moonOutpost"; "moonBase"
          "planetCracker"; "hydrofracturer"; "spiceRefinery"; "researchVessel"
          "orbitalArray"; "sunlifter"; "containmentChamber"; "heatsink"; "sunforge"
          "cryostation"; "hrHarvester"; "tectonic" ]

let hasUpdateEffects (name: string) : bool =
    name = "terraformingStation" || name = "hydroponics"

/// meta.breakIronWill: spaceStation + terraformingStation
let breakIronWill (name: string) : bool =
    name = "spaceStation" || name = "terraformingStation"

/// meta.upgrades chains on space buildings (game.upgrade fan-out after build).
let buildingUpgrades (name: string) : (string * string list) list =
    match name with
    | "sattelite" -> [ ("buildings", [ "observatory" ]); ("challenges", [ "blackSky" ]) ]
    | "heatsink" -> [ ("spaceBuilding", [ "containmentChamber" ]) ]
    | "hydroponics" -> [ ("spaceBuilding", [ "terraformingStation" ]) ]
    | "moltenCore" -> [ ("spaceBuilding", [ "tectonic" ]) ]
    | _ -> []

let private setBld (sp: SpacePool) (name: string) (m: SpaceMeta) : SpacePool =
    { sp with Buildings = sp.Buildings |> Map.add name m }

let private setEffects (sp: SpacePool) (name: string) (effects: Map<string, float>) : SpacePool =
    setBld sp name { sp.Buildings.[name] with Effects = effects }

/// calculateEffects bodies in orig order. REPLACE bodies are wholesale swaps.
let calculateEffects (ctx: SpaceCalcCtx) (name: string) (sp: SpacePool) : SpacePool =
    match name with
    | "spaceElevator" ->
        setEffects sp name
            (Map.ofList ["oilReductionRatio", 0.05; "spaceRatio", 0.01; "prodTransferBonus", 0.001])
    | "sattelite" ->
        let obsRatio = 0.05 * (1.0 + ctx.GetEffect "satelliteSynergyBonus")
        let eff0 =
            Map.ofList
                ["observatoryRatio", obsRatio; "starchartPerTickBaseSpace", 0.001;
                 "energyConsumption", 0.0; "energyProduction", 0.0]
        let eff1, sp1 =
            if ctx.SolarSatellitesResearched then
                // orig also sets self.on = self.val and self.togglable = false
                Map.add "energyProduction" 1.0 eff0,
                setBld sp name { sp.Buildings.[name] with On = sp.Buildings.[name].Val }
            else
                Map.add "energyConsumption" 1.0 eff0, sp
        // game.upgrade(self.upgrades) INSIDE the calc — the blackSky challenge
        // recalc must run before the penalty read below
        ctx.RunUpgradeFanout [ ("buildings", [ "observatory" ]); ("challenges", [ "blackSky" ]) ]
        let eff2 =
            if ctx.BlackSkyActive then
                Map.add "starchartPerTickBaseSpace"
                    (eff1.["starchartPerTickBaseSpace"] * (1.0 / (1.0 + ctx.GetEffect "bskSattelitePenalty")))
                    eff1
            else eff1
        setEffects sp1 name eff2
    | "spaceStation" ->
        setEffects sp name (Map.ofList ["scienceRatio", 0.5; "maxKittens", 2.0; "energyConsumption", 10.0])
    | "moonOutpost" ->
        setEffects sp name
            (Map.ofList
                ["uraniumPerTickCon", -0.35;
                 "unobtainiumPerTickSpace", 0.007 * (1.0 + ctx.GetEffect "lunarOutpostRatio");
                 "energyConsumption", 5.0])
    | "moonBase" ->
        let spaceportRatio = 1.0 + ctx.GetEffect "moonBaseStorageBonus"
        let m0 =
            Map.ofList
                ["catnipMax", 45000.0 * spaceportRatio; "woodMax", 25000.0 * spaceportRatio;
                 "mineralsMax", 30000.0 * spaceportRatio; "coalMax", 3500.0 * spaceportRatio;
                 "ironMax", 9000.0 * spaceportRatio; "titaniumMax", 1250.0 * spaceportRatio;
                 "oilMax", 3500.0 * spaceportRatio; "unobtainiumMax", 150.0 * spaceportRatio;
                 "energyConsumption", (if ctx.AmBasesResearched then 5.0 else 10.0)]
        let m1 =
            if ctx.AiBasesResearched then
                let aiBasesModifier = 1.0 + ctx.GetEffect "aiCoreUpgradeBonus"
                let scale = 1.0 + float ctx.AiCoreOn * 0.1 * aiBasesModifier
                m0 |> Map.map (fun k v -> if k = "energyConsumption" then v else v * scale)
            else m0
        setEffects sp name m1
    | "planetCracker" ->
        setEffects sp name
            (Map.ofList
                ["uraniumPerTickSpace", 0.3 * (1.0 + ctx.GetEffect "crackerRatio");
                 "uraniumMax", 1750.0 * (1.0 + ctx.GetEffect "planetCrackerStorageBonus")])
    | "hydrofracturer" -> setEffects sp name (Map.ofList ["oilPerTickAutoprodSpace", 0.5])
    | "spiceRefinery" -> setEffects sp name (Map.ofList ["spicePerTickAutoprodSpace", 0.025])
    | "researchVessel" ->
        setEffects sp name
            (Map.ofList
                ["scienceMax", 10000.0 * (1.0 + ctx.GetEffect "spaceScienceRatio");
                 "starchartPerTickBaseSpace", (if ctx.BlackSkyActive then 0.0 else 0.01)])
    | "orbitalArray" -> setEffects sp name (Map.ofList ["spaceRatio", 0.02; "energyConsumption", 20.0])
    | "sunlifter" ->
        setEffects sp name (Map.ofList ["antimatterProduction", 1.0; "energyProduction", 30.0])
    | "containmentChamber" ->
        let hs = float sp.Buildings.["heatsink"].Val
        setEffects sp name
            (Map.ofList ["antimatterMax", 100.0 * (1.0 + hs * 0.02); "energyConsumption", 50.0 * (1.0 + hs * 0.01)])
    | "heatsink" | "sunforge" -> sp // empty orig calculateEffects bodies
    | "cryostation" ->
        let ratio = 1.0 + ctx.GetEffect "cryostationStorageBonus"
        setEffects sp name
            (Map.ofList
                ["woodMax", 200000.0 * ratio; "mineralsMax", 200000.0 * ratio; "coalMax", 25000.0 * ratio;
                 "ironMax", 50000.0 * ratio; "titaniumMax", 7500.0 * ratio; "oilMax", 7500.0 * ratio;
                 "uraniumMax", 5000.0 * ratio; "unobtainiumMax", 750.0 * ratio])
    | "hrHarvester" ->
        // MUTATES (no wholesale swap): energyProduction only
        let yearBonus = max ctx.DarkFutureYears 0.0
        let v =
            (1.0 + Game.Math.getUnlimitedDR yearBonus 0.075 * 0.01)
            * (1.0 + ctx.GetEffect "umbraBoostRatio")
        setEffects sp name (sp.Buildings.[name].Effects |> Map.add "energyProduction" v)
    | "tectonic" ->
        setEffects sp name (Map.ofList ["energyProduction", 25.0 * (1.0 + ctx.GetEffect "tectonicBonus")])
    | _ -> sp

/// updateEffects bodies (terraformingStation / hydroponics mutate in place).
let updateEffects (ctx: SpaceCalcCtx) (name: string) (sp: SpacePool) : SpacePool =
    match name with
    | "terraformingStation" ->
        setEffects sp name
            (sp.Buildings.[name].Effects |> Map.add "maxKittens" (1.0 + ctx.GetEffect "terraformingMaxKittensRatio"))
    | "hydroponics" ->
        let on = float sp.Buildings.[name].On
        // orig: getUnlimitedDR(on, 100) / on — 0/0 = NaN at fresh state (both
        // drivers compute the same NaN; the building is yarn-gated anyway)
        let e1 = sp.Buildings.[name].Effects |> Map.add "terraformingMaxKittensRatio" (Game.Math.getUnlimitedDR on 100.0 / on)
        setEffects sp name (e1 |> Map.add "catnipRatio" 0.025)
    | _ -> sp

/// calendar.cycleEffectsBasics (js/calendar.js L322): numerology zodiac
/// multipliers keyed "building-effect"; sattelite keeps the observatory
/// unlock in sync via game.upgrade.
let cycleEffectsBasics (ctx: SpaceCalcCtx) (name: string) (sp: SpacePool) : SpacePool =
    let m = sp.Buildings.[name]
    let effs =
        if ctx.NumerologyActive then
            m.Effects
            |> Map.map (fun k v ->
                match ctx.NumerologyCycleMult (name + "-" + k) with
                | Some mult -> v * mult
                | None -> v)
        else m.Effects
    if name = "sattelite" then ctx.RunUpgradeFanout [ ("buildings", [ "observatory" ]) ]
    setBld sp name { m with Effects = effs }

/// space.update (L1097-1145): routes tick down on unlocked planets; reaching a
/// planet unlocks its requiredTech-less buildings; programs turn on when their
/// planet is reached (no planet → immediate on). The entangler gflops action
/// (L1150-1170) early-returns at gflops = 0 — no state at this slice.
let update (getEffect: string -> float) (onPlanetReach: string -> unit) (ticksPerDay: float) (sp: SpacePool) : SpacePool =
    let mutable sp = sp
    let routeSpeed = let rs = getEffect "routeSpeed" in if rs <> 0.0 then rs else 1.0
    for pn in sp.PlanetOrder do
        let pl = sp.Planets.[pn]
        if not pl.Reached && pl.Unlocked then
            if pl.RouteDays > 0.0 then
                sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with RouteDays = pl.RouteDays - routeSpeed / ticksPerDay } }
            else
                sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with RouteDays = 0.0; Reached = true } }
                // L1101: reaching a planet unlocks the spaceBuilding queue source
                onPlanetReach pn
    // programs: on=1 once val>0 and the corresponding planet is reached
    // (no planet → immediate on); L1132-1142
    for p0 in Game.Catalog.Space.programDefs do
        let m = sp.Programs.[p0.Name]
        if m.Val > 0 && m.On = 0 then
            let reached =
                match p0.UnlocksPlanets with
                | pn :: _ -> sp.Planets.[pn].Reached
                | [] -> true
            if reached then
                sp <- { sp with Programs = sp.Programs |> Map.add p0.Name { m with On = 1 } }
    // building unlocks are caller-driven (unlockBuildings needs science state)
    sp

/// caller-driven building unlock (needs science access; kept out of update).
let unlockBuildings (techResearched: string -> bool) (sp: SpacePool) : SpacePool =
    { sp with
        Buildings =
            sp.Buildings
            |> Map.map (fun name m ->
                if not m.Unlocked && sp.Planets.[(Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = name)).Planet].Reached then
                    let def = Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = name)
                    { m with Unlocked = def.RequiredTech |> List.forall techResearched }
                else m) }

/// space.fastforward (L1147-1175): routes; the entangler loop is a no-op
/// without gflops.
let fastforward (getEffect: string -> float) (ticksPerDay: float) (daysOffset: float) (sp: SpacePool) : SpacePool =
    let routeSpeed = let rs = getEffect "routeSpeed" in if rs <> 0.0 then rs else 1.0
    let times = daysOffset * ticksPerDay
    { sp with
        Planets =
            sp.Planets
            |> Map.map (fun _ pl ->
                if not pl.Reached && pl.Unlocked && pl.RouteDays > 0.0 then
                    { pl with RouteDays = pl.RouteDays - times * routeSpeed / ticksPerDay }
                else pl) }

/// effects provider (js/space.js L975-991): reached-planet buildings, effect ×
/// on; the 4 hash effects raw (per-category values, not per-building);
/// spaceRatio × getEnergyDelta when cons > prod.
let spaceGroup
    (energyCons: float)
    (energyProd: float)
    (energyDelta: float)
    (sp: SpacePool)
    : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        Game.Catalog.Space.buildingDefs
        |> List.choose (fun d ->
            let m = sp.Buildings.[d.Name]
            if m.On > 0 && sp.Planets.[d.Planet].Reached then
                Some(m.Effects, fun (effectName: string) v ->
                    if effectName = "hashrate" || effectName = "hashRateLevel"
                       || effectName = "nextHashLevelAt" || effectName = "hrProgress" then
                        v
                    elif effectName = "spaceRatio" && energyCons > energyProd then
                        v * float m.On * energyDelta
                    else
                        v * float m.On)
            else None) }
