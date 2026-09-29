module Game.Catalog.Space

// space-01..04: mission programs, planets and planet buildings — generated
// from oracle/fixtures/space-orig.json (orig --dump-space, D001-faithful data).

open Game.Types

type SpaceProgramDef =
    { Name: string
      Prices: Price list
      UnlocksPlanets: string list
      UnlocksMissions: string list
      UnlocksPolicies: string list }

type SpaceBuildingDef =
    { Name: string
      Planet: string
      Prices: Price list
      RequiredTech: string list
      Effects: Map<string, float>
      UnlocksPolicies: string list }

type PlanetDef =
    { Name: string
      RouteDays: float }

let programDefs : SpaceProgramDef list = [
  { Name = "orbitalLaunch"; Prices = [{ Resource = "oil"; Val = 15000 }; { Resource = "manpower"; Val = 5000 }; { Resource = "science"; Val = 100000 }; { Resource = "starchart"; Val = 250 }]; UnlocksPlanets = ["cath"]; UnlocksMissions = ["moonMission"]; UnlocksPolicies = [] }
  { Name = "moonMission"; Prices = [{ Resource = "titanium"; Val = 5000 }; { Resource = "oil"; Val = 45000 }; { Resource = "science"; Val = 125000 }; { Resource = "starchart"; Val = 500 }]; UnlocksPlanets = ["moon"]; UnlocksMissions = ["duneMission"; "piscineMission"]; UnlocksPolicies = [] }
  { Name = "duneMission"; Prices = [{ Resource = "titanium"; Val = 7000 }; { Resource = "science"; Val = 175000 }; { Resource = "starchart"; Val = 1000 }; { Resource = "kerosene"; Val = 75 }]; UnlocksPlanets = ["dune"]; UnlocksMissions = ["heliosMission"]; UnlocksPolicies = ["technocracy"; "theocracy"; "expansionism"] }
  { Name = "piscineMission"; Prices = [{ Resource = "titanium"; Val = 9000 }; { Resource = "science"; Val = 200000 }; { Resource = "starchart"; Val = 1500 }; { Resource = "kerosene"; Val = 250 }]; UnlocksPlanets = ["piscine"]; UnlocksMissions = ["terminusMission"]; UnlocksPolicies = [] }
  { Name = "heliosMission"; Prices = [{ Resource = "titanium"; Val = 15000 }; { Resource = "science"; Val = 250000 }; { Resource = "starchart"; Val = 3000 }; { Resource = "kerosene"; Val = 1250 }]; UnlocksPlanets = ["helios"]; UnlocksMissions = ["yarnMission"]; UnlocksPolicies = [] }
  { Name = "terminusMission"; Prices = [{ Resource = "titanium"; Val = 12000 }; { Resource = "science"; Val = 225000 }; { Resource = "starchart"; Val = 2500 }; { Resource = "kerosene"; Val = 750 }]; UnlocksPlanets = ["terminus"]; UnlocksMissions = ["heliosMission"; "kairoMission"]; UnlocksPolicies = [] }
  { Name = "kairoMission"; Prices = [{ Resource = "titanium"; Val = 20000 }; { Resource = "science"; Val = 300000 }; { Resource = "starchart"; Val = 5000 }; { Resource = "kerosene"; Val = 7500 }]; UnlocksPlanets = ["kairo"]; UnlocksMissions = ["rorschachMission"]; UnlocksPolicies = [] }
  { Name = "rorschachMission"; Prices = [{ Resource = "titanium"; Val = 80000 }; { Resource = "science"; Val = 500000 }; { Resource = "starchart"; Val = 15000 }; { Resource = "kerosene"; Val = 25000 }]; UnlocksPlanets = []; UnlocksMissions = ["centaurusSystemMission"]; UnlocksPolicies = [] }
  { Name = "yarnMission"; Prices = [{ Resource = "titanium"; Val = 35000 }; { Resource = "science"; Val = 350000 }; { Resource = "starchart"; Val = 7500 }; { Resource = "kerosene"; Val = 12000 }]; UnlocksPlanets = ["yarn"]; UnlocksMissions = ["umbraMission"]; UnlocksPolicies = [] }
  { Name = "umbraMission"; Prices = [{ Resource = "science"; Val = 500000 }; { Resource = "starchart"; Val = 25000 }; { Resource = "kerosene"; Val = 25000 }; { Resource = "thorium"; Val = 15000 }]; UnlocksPlanets = ["umbra"]; UnlocksMissions = ["charonMission"]; UnlocksPolicies = [] }
  { Name = "charonMission"; Prices = [{ Resource = "science"; Val = 750000 }; { Resource = "starchart"; Val = 75000 }; { Resource = "kerosene"; Val = 35000 }; { Resource = "thorium"; Val = 35000 }]; UnlocksPlanets = ["charon"]; UnlocksMissions = []; UnlocksPolicies = [] }
  { Name = "centaurusSystemMission"; Prices = [{ Resource = "titanium"; Val = 40000 }; { Resource = "science"; Val = 800000 }; { Resource = "starchart"; Val = 100000 }; { Resource = "kerosene"; Val = 50000 }; { Resource = "thorium"; Val = 50000 }]; UnlocksPlanets = ["centaurusSystem"]; UnlocksMissions = ["furthestRingMission"]; UnlocksPolicies = [] }
  { Name = "furthestRingMission"; Prices = [{ Resource = "science"; Val = 1250000 }; { Resource = "starchart"; Val = 500000 }; { Resource = "kerosene"; Val = 75000 }; { Resource = "thorium"; Val = 75000 }]; UnlocksPlanets = ["furthestRing"]; UnlocksMissions = []; UnlocksPolicies = [] }
]

let buildingDefs : SpaceBuildingDef list = [
  { Name = "spaceElevator"; Planet = "cath"; Prices = [{ Resource = "titanium"; Val = 6000 }; { Resource = "unobtainium"; Val = 50 }; { Resource = "science"; Val = 75000 }]; RequiredTech = ["orbitalEngineering"; "nanotechnology"]; Effects = Map.ofList ["oilReductionRatio", 0; "spaceRatio", 0; "prodTransferBonus", 0]; UnlocksPolicies = [] }
  { Name = "sattelite"; Planet = "cath"; Prices = [{ Resource = "titanium"; Val = 2500 }; { Resource = "oil"; Val = 15000 }; { Resource = "science"; Val = 100000 }; { Resource = "starchart"; Val = 325 }]; RequiredTech = ["sattelites"]; Effects = Map.ofList ["observatoryRatio", 0; "starchartPerTickBaseSpace", 0; "energyConsumption", 0; "energyProduction", 0]; UnlocksPolicies = ["outerSpaceTreaty"; "militarizeSpace"] }
  { Name = "spaceStation"; Planet = "cath"; Prices = [{ Resource = "oil"; Val = 35000 }; { Resource = "science"; Val = 150000 }; { Resource = "starchart"; Val = 425 }; { Resource = "alloy"; Val = 750 }]; RequiredTech = ["orbitalEngineering"]; Effects = Map.ofList ["scienceRatio", 0; "maxKittens", 0; "energyConsumption", 0]; UnlocksPolicies = [] }
  { Name = "moonOutpost"; Planet = "moon"; Prices = [{ Resource = "oil"; Val = 55000 }; { Resource = "uranium"; Val = 500 }; { Resource = "science"; Val = 100000 }; { Resource = "starchart"; Val = 650 }; { Resource = "concrate"; Val = 150 }; { Resource = "alloy"; Val = 750 }]; RequiredTech = []; Effects = Map.ofList ["uraniumPerTickCon", 0; "unobtainiumPerTickSpace", 0; "energyConsumption", 0]; UnlocksPolicies = [] }
  { Name = "moonBase"; Planet = "moon"; Prices = [{ Resource = "titanium"; Val = 9500 }; { Resource = "oil"; Val = 70000 }; { Resource = "unobtainium"; Val = 50 }; { Resource = "science"; Val = 100000 }; { Resource = "starchart"; Val = 700 }; { Resource = "concrate"; Val = 250 }]; RequiredTech = []; Effects = Map.ofList ["catnipMax", 0; "woodMax", 0; "mineralsMax", 0; "coalMax", 0; "ironMax", 0; "titaniumMax", 0; "oilMax", 0; "unobtainiumMax", 0; "energyConsumption", 0]; UnlocksPolicies = [] }
  { Name = "planetCracker"; Planet = "dune"; Prices = [{ Resource = "science"; Val = 125000 }; { Resource = "starchart"; Val = 2500 }; { Resource = "alloy"; Val = 1750 }; { Resource = "kerosene"; Val = 50 }]; RequiredTech = []; Effects = Map.ofList ["uraniumPerTickSpace", 0; "uraniumMax", 0]; UnlocksPolicies = [] }
  { Name = "hydrofracturer"; Planet = "dune"; Prices = [{ Resource = "science"; Val = 150000 }; { Resource = "starchart"; Val = 750 }; { Resource = "alloy"; Val = 1025 }; { Resource = "kerosene"; Val = 100 }]; RequiredTech = []; Effects = Map.ofList ["oilPerTickAutoprodSpace", 0]; UnlocksPolicies = [] }
  { Name = "spiceRefinery"; Planet = "dune"; Prices = [{ Resource = "science"; Val = 75000 }; { Resource = "starchart"; Val = 500 }; { Resource = "alloy"; Val = 500 }; { Resource = "kerosene"; Val = 125 }]; RequiredTech = []; Effects = Map.ofList ["spicePerTickAutoprodSpace", 0]; UnlocksPolicies = [] }
  { Name = "researchVessel"; Planet = "piscine"; Prices = [{ Resource = "titanium"; Val = 12500 }; { Resource = "starchart"; Val = 100 }; { Resource = "alloy"; Val = 2500 }; { Resource = "kerosene"; Val = 250 }]; RequiredTech = []; Effects = Map.ofList ["scienceMax", 0; "starchartPerTickBaseSpace", 0]; UnlocksPolicies = [] }
  { Name = "orbitalArray"; Planet = "piscine"; Prices = [{ Resource = "science"; Val = 250000 }; { Resource = "starchart"; Val = 2000 }; { Resource = "eludium"; Val = 100 }; { Resource = "kerosene"; Val = 500 }]; RequiredTech = []; Effects = Map.ofList ["spaceRatio", 0; "energyConsumption", 0]; UnlocksPolicies = [] }
  { Name = "sunlifter"; Planet = "helios"; Prices = [{ Resource = "science"; Val = 500000 }; { Resource = "eludium"; Val = 225 }; { Resource = "kerosene"; Val = 2500 }]; RequiredTech = []; Effects = Map.ofList ["antimatterProduction", 0; "energyProduction", 0]; UnlocksPolicies = [] }
  { Name = "containmentChamber"; Planet = "helios"; Prices = [{ Resource = "science"; Val = 500000 }; { Resource = "kerosene"; Val = 2500 }]; RequiredTech = []; Effects = Map.ofList ["antimatterMax", 0; "energyConsumption", 0]; UnlocksPolicies = [] }
  { Name = "heatsink"; Planet = "helios"; Prices = [{ Resource = "science"; Val = 125000 }; { Resource = "relic"; Val = 1 }; { Resource = "kerosene"; Val = 5000 }; { Resource = "thorium"; Val = 12500 }]; RequiredTech = []; Effects = Map.empty; UnlocksPolicies = [] }
  { Name = "sunforge"; Planet = "helios"; Prices = [{ Resource = "antimatter"; Val = 250 }; { Resource = "science"; Val = 100000 }; { Resource = "relic"; Val = 1 }; { Resource = "kerosene"; Val = 1250 }]; RequiredTech = []; Effects = Map.ofList ["baseMetalMaxRatio", 0.01]; UnlocksPolicies = [] }
  { Name = "cryostation"; Planet = "terminus"; Prices = [{ Resource = "science"; Val = 200000 }; { Resource = "concrate"; Val = 1500 }; { Resource = "eludium"; Val = 25 }; { Resource = "kerosene"; Val = 500 }]; RequiredTech = []; Effects = Map.ofList ["woodMax", 0; "mineralsMax", 0; "coalMax", 0; "ironMax", 0; "titaniumMax", 0; "oilMax", 0; "uraniumMax", 0; "unobtainiumMax", 0]; UnlocksPolicies = [] }
  { Name = "spaceBeacon"; Planet = "kairo"; Prices = [{ Resource = "antimatter"; Val = 50 }; { Resource = "starchart"; Val = 25000 }; { Resource = "alloy"; Val = 25000 }; { Resource = "kerosene"; Val = 7500 }]; RequiredTech = []; Effects = Map.ofList ["scienceMax", 25000; "starchartPerTickBaseSpace", 0.025; "relicPerDay", 0]; UnlocksPolicies = [] }
  { Name = "terraformingStation"; Planet = "yarn"; Prices = [{ Resource = "uranium"; Val = 5000 }; { Resource = "antimatter"; Val = 25 }; { Resource = "kerosene"; Val = 5000 }]; RequiredTech = ["terraformation"]; Effects = Map.ofList ["maxKittens", 1]; UnlocksPolicies = [] }
  { Name = "hydroponics"; Planet = "yarn"; Prices = [{ Resource = "unobtainium"; Val = 1 }; { Resource = "kerosene"; Val = 500 }]; RequiredTech = ["hydroponics"]; Effects = Map.ofList ["catnipRatio", 0.025; "catnipMaxRatio", 0.1; "terraformingMaxKittensRatio", 0]; UnlocksPolicies = [] }
  { Name = "hrHarvester"; Planet = "umbra"; Prices = [{ Resource = "antimatter"; Val = 1250 }; { Resource = "relic"; Val = 25 }]; RequiredTech = []; Effects = Map.ofList ["energyProduction", 1]; UnlocksPolicies = [] }
  { Name = "navigationRelay"; Planet = "umbra"; Prices = [{ Resource = "titanium"; Val = 50000 }; { Resource = "concrate"; Val = 5000 }]; RequiredTech = []; Effects = Map.empty; UnlocksPolicies = [] }
  { Name = "spaceShuttle"; Planet = "umbra"; Prices = [{ Resource = "antimatter"; Val = 50 }; { Resource = "eludium"; Val = 500 }]; RequiredTech = []; Effects = Map.empty; UnlocksPolicies = [] }
  { Name = "entangler"; Planet = "charon"; Prices = [{ Resource = "antimatter"; Val = 5250 }; { Resource = "relic"; Val = 1250 }; { Resource = "eludium"; Val = 5000 }]; RequiredTech = ["quantumCryptography"]; Effects = Map.ofList ["gflopsConsumption", 0.1; "hashrate", 0; "hashRateLevel", 0; "nextHashLevelAt", 0; "hrProgress", 0; "energyConsumption", 25]; UnlocksPolicies = [] }
  { Name = "tectonic"; Planet = "centaurusSystem"; Prices = [{ Resource = "antimatter"; Val = 500 }; { Resource = "thorium"; Val = 75000 }]; RequiredTech = ["terraformation"]; Effects = Map.ofList ["energyProduction", 0]; UnlocksPolicies = [] }
  { Name = "moltenCore"; Planet = "centaurusSystem"; Prices = [{ Resource = "uranium"; Val = 5000000 }; { Resource = "science"; Val = 25000000 }]; RequiredTech = ["exogeophysics"]; Effects = Map.ofList ["tectonicBonus", 0.05]; UnlocksPolicies = [] }
]

let planetDefs : PlanetDef list = [
  { Name = "cath"; RouteDays = 0 }
  { Name = "moon"; RouteDays = 30 }
  { Name = "dune"; RouteDays = 356 }
  { Name = "piscine"; RouteDays = 256 }
  { Name = "helios"; RouteDays = 1200 }
  { Name = "terminus"; RouteDays = 2500 }
  { Name = "kairo"; RouteDays = 5000 }
  { Name = "yarn"; RouteDays = 3800 }
  { Name = "umbra"; RouteDays = 7500 }
  { Name = "charon"; RouteDays = 25000 }
  { Name = "centaurusSystem"; RouteDays = 120000 }
  { Name = "furthestRing"; RouteDays = 725000000 }
]
