module Game.Space

// space-01/05/06/07/09/10: SpaceManager state + purchase flows + per-tick
// update + fastforward. Sources: js/space.js L1-120 (programs), L1100-1180
// (fastforward), L1147 (routes), MissionBtnController/PlanetBuildingBtn
// controller paths. The effects provider counts only REACHED-planet buildings
// × on (orig getEffect provider gates on planet.reached via unlocked chain).

open Game.Types

type SpaceMeta =
    { Val: int
      On: int
      Unlocked: bool }

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
    { Programs = progDefs |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = d.Name = "orbitalLaunch" })) |> Map.ofList
      ProgramOrder = progDefs |> List.map (fun d -> d.Name)
      Buildings = bldDefs |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = false })) |> Map.ofList
      BuildingOrder = bldDefs |> List.map (fun d -> d.Name)
      Planets = plDefs |> List.map (fun d -> (d.Name, { Reached = false; Unlocked = false; RouteDays = d.RouteDays })) |> Map.ofList
      PlanetOrder = plDefs |> List.map (fun d -> d.Name) }

let resetState (_sp: SpacePool) : SpacePool = init ()

let getProgram (sp: SpacePool) (name: string) : SpaceMeta = sp.Programs.[name]
let getBuilding (sp: SpacePool) (name: string) : SpaceMeta = sp.Buildings.[name]

/// orig MissionBtnController buyItem → game.unlock(unlocks): planet unlocked +
/// chained missions + policies (policy unlock = flag only at this slice).
let buyProgram
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
    let prices () = def.Prices |> List.map (fun p -> (p.Resource, float p.Val))
    while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
        let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
        pool <- pool1
        // SpaceProgramBtnController.build: val=1 only — On arrives via
        // space.update once the corresponding planet is reached (L1133-1142)
        sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with Val = 1 } }
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
    sp, pool, counter

/// SpaceBuildingBtnController.build: prices × ratio^val ladder; a building is
/// only enabled when its planet has been reached.
let buyBuilding
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
    let planetReached = sp.Planets.[def.Planet].Reached
    if planetReached then
        let prices () =
            def.Prices
            |> List.map (fun p -> (p.Resource, p.Val * (1.1 ** float sp.Buildings.[name].Val)))
        while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
            let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
            pool <- pool1
            sp <- { sp with Buildings = sp.Buildings |> Map.add name { sp.Buildings.[name] with Val = sp.Buildings.[name].Val + 1; On = sp.Buildings.[name].On + 1 } }
            counter <- counter + 1
            maxBld <- maxBld - 1
    sp, pool, counter

/// space.update (L1100-1145): routes tick down on unlocked planets; reaching a
/// planet unlocks its requiredTech-less buildings; per-tick building actions
/// are space-08 seams (entangler/hydroponics — no production at this slice).
let update (getEffect: string -> float) (ticksPerDay: float) (sp: SpacePool) : SpacePool =
    let mutable sp = sp
    let routeSpeed = let rs = getEffect "routeSpeed" in if rs <> 0.0 then rs else 1.0
    for pn in sp.PlanetOrder do
        let pl = sp.Planets.[pn]
        if not pl.Reached && pl.Unlocked then
            if pl.RouteDays > 0.0 then
                sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with RouteDays = pl.RouteDays - routeSpeed / ticksPerDay } }
            else
                sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with RouteDays = 0.0; Reached = true } }
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

/// space.fastforward (L1147-1175): routes + entangler hashrate (no gflops at
/// this slice — the entangler loop is a no-op without antimatter).
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

/// effects provider: reached-planet buildings × on.
let spaceGroup (sp: SpacePool) : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        Game.Catalog.Space.buildingDefs
        |> List.choose (fun d ->
            let m = sp.Buildings.[d.Name]
            if m.On > 0 && sp.Planets.[d.Planet].Reached then
                Some(d.Effects, (fun _ v -> v * float m.On))
            else None) }
