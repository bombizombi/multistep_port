(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Space programs + planets (space.js) - auto-extracted from the original JS. *)
(* Sources (all in orig_project/kittensgame/js/space.js, SpaceManager): *)
(*   programs (line ~23): 13 space missions, researched in order, each unlocking a planet *)
(*   planets  (line ~209): 12 planets/celestial bodies, each with routeDays + buildings. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Counts: programs=13; planets=12; planet buildings=24 (furthestRing has an empty buildings array, TBD). *)
(* All labels/descriptions resolved; no fallbacks needed. *)
(* Field notes (verbatim JS semantics, kept as comments per entry, NOT in the record types): *)
(*   priceRatio: per-building price scaling (1.08-1.25); programs have no priceRatio (one-off missions). *)
(*   requiredTech: science techs gating visibility (empty = none; moon pair, dune trio, piscine pair, *)
(*     helios quartet, cryostation, spaceBeacon have NO requiredTech in JS). navigationRelay and *)
(*     spaceShuttle carry requiredTech=false (unimplemented TBD placeholders with empty effects). *)
(*   routeDays: travel time from Cath; mission unlock sets reached=true, ticks count down to 0. *)
(*   unlocks/upgrades: game.unlock() visibility targets / game.upgrade() effect-recalc targets. *)
(*   Static `effects` below are the literal JS defaults (mostly 0); calculateEffects/action compute *)
(*   real values at runtime (summarized in comments only). Sattelite keeps its JS spelling [sic]. *)

type SpaceProgram = { Name: string; Label: string; Description: string; Prices: Price list; Unlocks: (string * string list) list }
type PlanetBuilding = { Name: string; Label: string; Description: string; Prices: Price list; PriceRatio: float; Effects: (string * float) list; RequiredTech: string list }
type Planet = { Name: string; Label: string; RouteDays: float; Buildings: PlanetBuilding list }

let spacePrograms : SpaceProgram list = [
    (* ---- orbitalLaunch ---- *)
    { Name = "orbitalLaunch"
      Label = "Orbital Launch"
      Description = "Launch a rocket into space."
      Prices = [ { Resource = "oil"; Amount = 15000 }; { Resource = "manpower"; Amount = 5000 }; { Resource = "science"; Amount = 100000 }; { Resource = "starchart"; Amount = 250 } ]
      Unlocks = [ ("planet", [ "cath" ]); ("spaceMission", [ "moonMission" ]) ] }
    (* ---- moonMission ---- *)
    { Name = "moonMission"
      Label = "Moon Mission"
      Description = "Launch a rocket to Redmoon, a Cath planet satellite"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "oil"; Amount = 45000 }; { Resource = "science"; Amount = 125000 }; { Resource = "starchart"; Amount = 500 } ]
      Unlocks = [ ("planet", [ "moon" ]); ("spaceMission", [ "duneMission"; "piscineMission" ]) ] }
    (* ---- duneMission ---- *)
    { Name = "duneMission"
      Label = "Dune Mission"
      Description = "Dune is a large and lifeless planet covered by sand and volcanic rock."
      Prices = [ { Resource = "titanium"; Amount = 7000 }; { Resource = "science"; Amount = 175000 }; { Resource = "starchart"; Amount = 1000 }; { Resource = "kerosene"; Amount = 75 } ]
      Unlocks = [ ("planet", [ "dune" ]); ("spaceMission", [ "heliosMission" ]); ("policies", [ "technocracy"; "theocracy"; "expansionism" ]) ] }
    (* ---- piscineMission ---- *)
    { Name = "piscineMission"
      Label = "Piscine Mission"
      Description = "Piscine is a gigantic aquatic planet composed of an acid body and a methane atmosphere"
      Prices = [ { Resource = "titanium"; Amount = 9000 }; { Resource = "science"; Amount = 200000 }; { Resource = "starchart"; Amount = 1500 }; { Resource = "kerosene"; Amount = 250 } ]
      Unlocks = [ ("planet", [ "piscine" ]); ("spaceMission", [ "terminusMission" ]) ] }
    (* ---- heliosMission ---- *)
    { Name = "heliosMission"
      Label = "Helios Mission"
      Description = "Helios is a G2V spectral type star in the center of Cath's solar system."
      Prices = [ { Resource = "titanium"; Amount = 15000 }; { Resource = "science"; Amount = 250000 }; { Resource = "starchart"; Amount = 3000 }; { Resource = "kerosene"; Amount = 1250 } ]
      Unlocks = [ ("planet", [ "helios" ]); ("spaceMission", [ "yarnMission" ]) ] }
    (* ---- terminusMission ---- *)
    { Name = "terminusMission"
      Label = "T-minus Mission"
      Description = "Terminus is a supermassive ice giant at the far end of Cath's solar system."
      Prices = [ { Resource = "titanium"; Amount = 12000 }; { Resource = "science"; Amount = 225000 }; { Resource = "starchart"; Amount = 2500 }; { Resource = "kerosene"; Amount = 750 } ]
      Unlocks = [ ("planet", [ "terminus" ]); ("spaceMission", [ "heliosMission"; "kairoMission" ]) ] }
    (* ---- kairoMission ---- *)
    { Name = "kairoMission"
      Label = "Kairo Mission"
      Description = "Kairo is a dwarf planet in the far end of Cath's solar system."
      Prices = [ { Resource = "titanium"; Amount = 20000 }; { Resource = "science"; Amount = 300000 }; { Resource = "starchart"; Amount = 5000 }; { Resource = "kerosene"; Amount = 7500 } ]
      Unlocks = [ ("planet", [ "kairo" ]); ("spaceMission", [ "rorschachMission" ]) ] }
    (* ---- rorschachMission ---- *)
    { Name = "rorschachMission"
      Label = "Rorschach"
      Description = "Rorschach is the biggest comet near Helios."
      Prices = [ { Resource = "titanium"; Amount = 80000 }; { Resource = "science"; Amount = 500000 }; { Resource = "starchart"; Amount = 15000 }; { Resource = "kerosene"; Amount = 25000 } ]
      Unlocks = [ ("spaceMission", [ "centaurusSystemMission" ]) ] }
    (* ---- yarnMission ---- *)
    { Name = "yarnMission"
      Label = "Yarn Mission"
      Description = "Yarn is a class M planet with high moderate climate, seas and oxygen atmosphere."
      Prices = [ { Resource = "titanium"; Amount = 35000 }; { Resource = "science"; Amount = 350000 }; { Resource = "starchart"; Amount = 7500 }; { Resource = "kerosene"; Amount = 12000 } ]
      Unlocks = [ ("planet", [ "yarn" ]); ("spaceMission", [ "umbraMission" ]) ] }
    (* ---- umbraMission ---- *)
    { Name = "umbraMission"
      Label = "Umbra Mission"
      Description = "Umbra is a supermassive black hole at the heart of the Helios system"
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "starchart"; Amount = 25000 }; { Resource = "kerosene"; Amount = 25000 }; { Resource = "thorium"; Amount = 15000 } ]
      Unlocks = [ ("planet", [ "umbra" ]); ("spaceMission", [ "charonMission" ]) ] }
    (* ---- charonMission ---- *)
    { Name = "charonMission"
      Label = "Charon Mission"
      Description = "Charon is small, incredibly dense and distant dwarf planet on the far edge of the Helios system. It is so hostile and barren that it is sometimes referred as 'The Gates of Death'"
      Prices = [ { Resource = "science"; Amount = 750000 }; { Resource = "starchart"; Amount = 75000 }; { Resource = "kerosene"; Amount = 35000 }; { Resource = "thorium"; Amount = 35000 } ]
      Unlocks = [ ("planet", [ "charon" ]) ] }
    (* ---- centaurusSystemMission ---- *)
    { Name = "centaurusSystemMission"
      Label = "Centaurus System Mission"
      Description = "Centaurus System is a warm faraway star system."
      Prices = [ { Resource = "titanium"; Amount = 40000 }; { Resource = "science"; Amount = 800000 }; { Resource = "starchart"; Amount = 100000 }; { Resource = "kerosene"; Amount = 50000 }; { Resource = "thorium"; Amount = 50000 } ]
      Unlocks = [ ("challenges", [ "energy" ]); ("planet", [ "centaurusSystem" ]); ("spaceMission", [ "furthestRingMission" ]) ] }
    (* ---- furthestRingMission ---- *)
    { Name = "furthestRingMission"
      Label = "Furthest Ring"
      Description = "The end of the universe."
      Prices = [ { Resource = "science"; Amount = 1250000 }; { Resource = "starchart"; Amount = 500000 }; { Resource = "kerosene"; Amount = 75000 }; { Resource = "thorium"; Amount = 75000 } ]
      Unlocks = [ ("planet", [ "furthestRing" ]) ] }
]

let planets : Planet list = [
    (* ---- cath (routeDays 0) ---- *)
    { Name = "cath"
      Label = "Cath"
      RouteDays = 0
      Buildings = [
        (* -- spaceElevator: priceRatio 1.15; requiredTech [orbitalEngineering, nanotechnology]. unlocked=false. calculateEffects: oilReductionRatio 0.05, spaceRatio 0.01, prodTransferBonus 0.001. *)
        { Name = "spaceElevator"
          Label = "Space Elevator"
          Description = "Every Space Elevator reduces oil requirements for all space projects by 5% and improves all space structures' production efficiency by 1%"
          Prices = [ { Resource = "titanium"; Amount = 6000 }; { Resource = "unobtainium"; Amount = 50 }; { Resource = "science"; Amount = 75000 } ]
          PriceRatio = 1.15
          Effects = [ ("oilReductionRatio", 0); ("spaceRatio", 0); ("prodTransferBonus", 0) ]
          RequiredTech = [ "orbitalEngineering"; "nanotechnology" ] }
        (* -- sattelite: priceRatio 1.08; requiredTech [sattelites]. unlocked=false. unlocks policies->[outerSpaceTreaty; militarizeSpace]; upgrades buildings->[observatory] challenges->[blackSky]; unlockScheme { name: space, threshold: 24 }. calculateEffects: observatoryRatio 0.05*(1+satelliteSynergyBonus), starchartPerTickBaseSpace 0.001 (blackSky-penalised), energyProduction 1 if solarSatellites researched else energyConsumption 1. NOTE: JS name is "sattelite" [sic]. *)
        { Name = "sattelite"
          Label = "Satellite"
          Description = "Deploy a Satellite. Satellites improve your Observatory effectiveness by 5% and produce starcharts"
          Prices = [ { Resource = "titanium"; Amount = 2500 }; { Resource = "oil"; Amount = 15000 }; { Resource = "science"; Amount = 100000 }; { Resource = "starchart"; Amount = 325 } ]
          PriceRatio = 1.08
          Effects = [ ("observatoryRatio", 0); ("starchartPerTickBaseSpace", 0); ("energyConsumption", 0); ("energyProduction", 0) ]
          RequiredTech = [ "sattelites" ] }
        (* -- spaceStation: priceRatio 1.12; requiredTech [orbitalEngineering]. unlocked=false. unlocks tabs->[village]; breakIronWill=true. calculateEffects: scienceRatio 0.5, maxKittens 2, energyConsumption 10. *)
        { Name = "spaceStation"
          Label = "Space St."
          Description = "Deploy a space station. Each station boosts science output and provides space for 2 astronauts"
          Prices = [ { Resource = "oil"; Amount = 35000 }; { Resource = "science"; Amount = 150000 }; { Resource = "starchart"; Amount = 425 }; { Resource = "alloy"; Amount = 750 } ]
          PriceRatio = 1.12
          Effects = [ ("scienceRatio", 0); ("maxKittens", 0); ("energyConsumption", 0) ]
          RequiredTech = [ "orbitalEngineering" ] }
      ] }
    (* ---- moon (routeDays 30) ---- *)
    { Name = "moon"
      Label = "Redmoon"
      RouteDays = 30
      Buildings = [
        (* -- moonOutpost: priceRatio 1.12; requiredTech [none]. unlocked=false. lackResConvert=false. Has action + calculateEffects: uraniumPerTickCon -0.35 (scaled by uranium stock), unobtainiumPerTickSpace 0.007*(1+lunarOutpostRatio), energyConsumption 5. *)
        { Name = "moonOutpost"
          Label = "Lunar Outpost"
          Description = "Deploy a nuclear powered mining outpost on Redmoon"
          Prices = [ { Resource = "oil"; Amount = 55000 }; { Resource = "uranium"; Amount = 500 }; { Resource = "science"; Amount = 100000 }; { Resource = "starchart"; Amount = 650 }; { Resource = "concrate"; Amount = 150 }; { Resource = "alloy"; Amount = 750 } ]
          PriceRatio = 1.12
          Effects = [ ("uraniumPerTickCon", 0); ("unobtainiumPerTickSpace", 0); ("energyConsumption", 0) ]
          RequiredTech = [  ] }
        (* -- moonBase: priceRatio 1.12; requiredTech [none]. unlocked=false. calculateEffects: catnipMax 45000, woodMax 25000, mineralsMax 30000, coalMax 3500, ironMax 9000, titaniumMax 1250, oilMax 3500, unobtainiumMax 150, all x(1+moonBaseStorageBonus); energyConsumption 5 if amBases researched else 10; aiBases researched scales storage by (1+aiCore.on*0.1*(1+aiCoreUpgradeBonus)). *)
        { Name = "moonBase"
          Label = "Moon Base"
          Description = "Establish a base on a surface of Redmoon"
          Prices = [ { Resource = "titanium"; Amount = 9500 }; { Resource = "oil"; Amount = 70000 }; { Resource = "unobtainium"; Amount = 50 }; { Resource = "science"; Amount = 100000 }; { Resource = "starchart"; Amount = 700 }; { Resource = "concrate"; Amount = 250 } ]
          PriceRatio = 1.12
          Effects = [ ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("oilMax", 0); ("unobtainiumMax", 0); ("energyConsumption", 0) ]
          RequiredTech = [  ] }
      ] }
    (* ---- dune (routeDays 356) ---- *)
    { Name = "dune"
      Label = "Dune"
      RouteDays = 356
      Buildings = [
        (* -- planetCracker: priceRatio 1.18; requiredTech [none]. unlocked=false. calculateEffects: uraniumPerTickSpace 0.3*(1+crackerRatio), uraniumMax 1750*(1+planetCrackerStorageBonus). *)
        { Name = "planetCracker"
          Label = "Planet Cracker"
          Description = "USS Mining Vessel Hissmeowra that can crack an entire planet"
          Prices = [ { Resource = "science"; Amount = 125000 }; { Resource = "starchart"; Amount = 2500 }; { Resource = "alloy"; Amount = 1750 }; { Resource = "kerosene"; Amount = 50 } ]
          PriceRatio = 1.18
          Effects = [ ("uraniumPerTickSpace", 0); ("uraniumMax", 0) ]
          RequiredTech = [  ] }
        (* -- hydrofracturer: priceRatio 1.18; requiredTech [none]. unlocked=false. unlockScheme { name: fluid, threshold: 10 }. calculateEffects: oilPerTickAutoprodSpace 0.5. *)
        { Name = "hydrofracturer"
          Label = "Hydraulic Fracturer"
          Description = "Produces a high-pressure stream of oil. Every Space Elevator will boost this production by 0.1% of the global production multiplier."
          Prices = [ { Resource = "science"; Amount = 150000 }; { Resource = "starchart"; Amount = 750 }; { Resource = "alloy"; Amount = 1025 }; { Resource = "kerosene"; Amount = 100 } ]
          PriceRatio = 1.18
          Effects = [ ("oilPerTickAutoprodSpace", 0) ]
          RequiredTech = [  ] }
        (* -- spiceRefinery: priceRatio 1.15; requiredTech [none]. unlocked=false. unlockScheme { name: dune, threshold: 10 }. calculateEffects: spicePerTickAutoprodSpace 0.025. *)
        { Name = "spiceRefinery"
          Label = "Spice Refinery"
          Description = "Refines the sand of the Dune into a highly psychoactive substance known as 'Spice'."
          Prices = [ { Resource = "science"; Amount = 75000 }; { Resource = "starchart"; Amount = 500 }; { Resource = "alloy"; Amount = 500 }; { Resource = "kerosene"; Amount = 125 } ]
          PriceRatio = 1.15
          Effects = [ ("spicePerTickAutoprodSpace", 0) ]
          RequiredTech = [  ] }
      ] }
    (* ---- piscine (routeDays 256) ---- *)
    { Name = "piscine"
      Label = "Piscine"
      RouteDays = 256
      Buildings = [
        (* -- researchVessel: priceRatio 1.15; requiredTech [none]. unlocked=false. unlockScheme { name: vessel, threshold: 20 }. calculateEffects: scienceMax 10000*(1+spaceScienceRatio), starchartPerTickBaseSpace 0.01 (0 while blackSky challenge active). *)
        { Name = "researchVessel"
          Label = "Research Vessel"
          Description = "Mobile research space vessel."
          Prices = [ { Resource = "titanium"; Amount = 12500 }; { Resource = "starchart"; Amount = 100 }; { Resource = "alloy"; Amount = 2500 }; { Resource = "kerosene"; Amount = 250 } ]
          PriceRatio = 1.15
          Effects = [ ("scienceMax", 0); ("starchartPerTickBaseSpace", 0) ]
          RequiredTech = [  ] }
        (* -- orbitalArray: priceRatio 1.15; requiredTech [none]. unlocked=false. calculateEffects: spaceRatio 0.02, energyConsumption 20. *)
        { Name = "orbitalArray"
          Label = "Orbital Array"
          Description = "Provide a 2% production bonus to all space structures"
          Prices = [ { Resource = "science"; Amount = 250000 }; { Resource = "starchart"; Amount = 2000 }; { Resource = "eludium"; Amount = 100 }; { Resource = "kerosene"; Amount = 500 } ]
          PriceRatio = 1.15
          Effects = [ ("spaceRatio", 0); ("energyConsumption", 0) ]
          RequiredTech = [  ] }
      ] }
    (* ---- helios (routeDays 1200) ---- *)
    { Name = "helios"
      Label = "Helios"
      RouteDays = 1200
      Buildings = [
        (* -- sunlifter: priceRatio 1.15; requiredTech [none]. unlocked=false. calculateEffects: antimatterProduction 1, energyProduction 30. *)
        { Name = "sunlifter"
          Label = "Sunlifter"
          Description = "Generates antimatter once per year. Inactive if energy production is negative"
          Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "eludium"; Amount = 225 }; { Resource = "kerosene"; Amount = 2500 } ]
          PriceRatio = 1.15
          Effects = [ ("antimatterProduction", 0); ("energyProduction", 0) ]
          RequiredTech = [  ] }
        (* -- containmentChamber: priceRatio 1.125; requiredTech [none]. unlocked=false. calculateEffects: antimatterMax 100*(1+heatsink.val*0.02), energyConsumption 50*(1+heatsink.val*0.01). *)
        { Name = "containmentChamber"
          Label = "Cont. Chamber"
          Description = "Containment Chamber. Increases antimatter storage space by 100."
          Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "kerosene"; Amount = 2500 } ]
          PriceRatio = 1.125
          Effects = [ ("antimatterMax", 0); ("energyConsumption", 0) ]
          RequiredTech = [  ] }
        (* -- heatsink: priceRatio 1.12; requiredTech [none]. unlocked=false. Static effects {} (empty in JS). upgrades spaceBuilding->[containmentChamber]. *)
        { Name = "heatsink"
          Label = "Heatsink"
          Description = "A heat dissipation system. Every Heatsink will increase the power consumption of Containment Chamber by 1% and antimatter storage capacity by 2%"
          Prices = [ { Resource = "science"; Amount = 125000 }; { Resource = "relic"; Amount = 1 }; { Resource = "kerosene"; Amount = 5000 }; { Resource = "thorium"; Amount = 12500 } ]
          PriceRatio = 1.12
          Effects = [  ]
          RequiredTech = [  ] }
        (* -- sunforge: priceRatio 1.12; requiredTech [none]. unlocked=false. (Commented-out upgrades spaceBuilding->[containmentChamber] kept out.) *)
        { Name = "sunforge"
          Label = "Sunforge"
          Description = "Uses the heat of the sun to smelt materials into supercondensed plasma. Every level of Sunforge improves the storage space of your base metals by 1%"
          Prices = [ { Resource = "antimatter"; Amount = 250 }; { Resource = "science"; Amount = 100000 }; { Resource = "relic"; Amount = 1 }; { Resource = "kerosene"; Amount = 1250 } ]
          PriceRatio = 1.12
          Effects = [ ("baseMetalMaxRatio", 0.01) ]
          RequiredTech = [  ] }
      ] }
    (* ---- terminus (routeDays 2500) ---- *)
    { Name = "terminus"
      Label = "T-Minus"
      RouteDays = 2500
      Buildings = [
        (* -- cryostation: priceRatio 1.12; requiredTech [none]. unlocked=false. unlockScheme { name: arctic, threshold: 10 }. calculateEffects (x(1+cryostationStorageBonus)): woodMax 200000, mineralsMax 200000, coalMax 25000, ironMax 50000, titaniumMax 7500, oilMax 7500, uraniumMax 5000, unobtainiumMax 750. *)
        { Name = "cryostation"
          Label = "Cryostation"
          Description = "A vast storage facility complex"
          Prices = [ { Resource = "science"; Amount = 200000 }; { Resource = "concrate"; Amount = 1500 }; { Resource = "eludium"; Amount = 25 }; { Resource = "kerosene"; Amount = 500 } ]
          PriceRatio = 1.12
          Effects = [ ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("oilMax", 0); ("uraniumMax", 0); ("unobtainiumMax", 0) ]
          RequiredTech = [  ] }
      ] }
    (* ---- kairo (routeDays 5000) ---- *)
    { Name = "kairo"
      Label = "Kairo"
      RouteDays = 5000
      Buildings = [
        (* -- spaceBeacon: priceRatio 1.15; requiredTech [none]. unlocked=false. Has action: scienceMax 25000*(1+spaceScienceRatio), starchartPerTickBaseSpace 0.025, relicPerDay beaconRelicsPerDay * relicRefine/blackPyramid boost * antimatter-cap factor * (1+entangler hashRateLevel*0.25). *)
        { Name = "spaceBeacon"
          Label = "Space Beacon"
          Description = "An AM-powered space station used for research and interstellar navigation."
          Prices = [ { Resource = "antimatter"; Amount = 50 }; { Resource = "starchart"; Amount = 25000 }; { Resource = "alloy"; Amount = 25000 }; { Resource = "kerosene"; Amount = 7500 } ]
          PriceRatio = 1.15
          Effects = [ ("scienceMax", 25000); ("starchartPerTickBaseSpace", 0.025); ("relicPerDay", 0) ]
          RequiredTech = [  ] }
      ] }
    (* ---- yarn (routeDays 3800) ---- *)
    { Name = "yarn"
      Label = "Yarn"
      RouteDays = 3800
      Buildings = [
        (* -- terraformingStation: priceRatio 1.25; requiredTech [terraformation]. unlocked=false. unlocks tabs->[village]; breakIronWill=true. Has action/updateEffects: maxKittens 1+terraformingMaxKittensRatio. *)
        { Name = "terraformingStation"
          Label = "Terraforming Station"
          Description = "Explode a charge of antimatter to melt yarn ice and throw oxygen into the atmosphere"
          Prices = [ { Resource = "uranium"; Amount = 5000 }; { Resource = "antimatter"; Amount = 25 }; { Resource = "kerosene"; Amount = 5000 } ]
          PriceRatio = 1.25
          Effects = [ ("maxKittens", 1) ]
          RequiredTech = [ "terraformation" ] }
        (* -- hydroponics: priceRatio 1.15; requiredTech [hydroponics]. unlocked=false. upgrades spaceBuilding->[terraformingStation]. Has action/updateEffects: terraformingMaxKittensRatio = getUnlimitedDR(on,100)/on; catnipRatio reset to 0.025 each tick. *)
        { Name = "hydroponics"
          Label = "Hydroponics"
          Description = "State of the art automated hydroponic system. Increase catnip limit by 10%. Increase catnip production by 2.5%"
          Prices = [ { Resource = "unobtainium"; Amount = 1 }; { Resource = "kerosene"; Amount = 500 } ]
          PriceRatio = 1.15
          Effects = [ ("catnipRatio", 0.025); ("catnipMaxRatio", 0.1); ("terraformingMaxKittensRatio", 0) ]
          RequiredTech = [ "hydroponics" ] }
      ] }
    (* ---- umbra (routeDays 7500) ---- *)
    { Name = "umbra"
      Label = "Umbra"
      RouteDays = 7500
      Buildings = [
        (* -- hrHarvester: priceRatio 1.15; requiredTech [none]. unlocked=true (only space building starting unlocked). calculateEffects: energyProduction (1+getUnlimitedDR(darkFutureYears,0.075)*0.01)*(1+umbraBoostRatio). *)
        { Name = "hrHarvester"
          Label = "HR Harvester"
          Description = "Hawking Radiation Harvester. Operates on the energy of the black hole evaporation. Every HR Harvester generates 1W of energy which slowly increases over time."
          Prices = [ { Resource = "antimatter"; Amount = 1250 }; { Resource = "relic"; Amount = 25 } ]
          PriceRatio = 1.15
          Effects = [ ("energyProduction", 1) ]
          RequiredTech = [  ] }
        (* -- navigationRelay: priceRatio 1.2; requiredTech [none]. unlocked=false. requiredTech=false + effects {} + TBD prices in JS (unimplemented placeholder). *)
        { Name = "navigationRelay"
          Label = "Navigation Relay"
          Description = "Increase your crew cap by one"
          Prices = [ { Resource = "titanium"; Amount = 50000 }; { Resource = "concrate"; Amount = 5000 } ]
          PriceRatio = 1.2
          Effects = [  ]
          RequiredTech = [  ] }
        (* -- spaceShuttle: priceRatio 1.15; requiredTech [none]. unlocked=false. requiredTech=false + effects {} + TBD prices in JS (unimplemented placeholder). *)
        { Name = "spaceShuttle"
          Label = "Space Shuttle"
          Description = "Staffed with science crew"
          Prices = [ { Resource = "antimatter"; Amount = 50 }; { Resource = "eludium"; Amount = 500 } ]
          PriceRatio = 1.15
          Effects = [  ]
          RequiredTech = [  ] }
      ] }
    (* ---- charon (routeDays 25000) ---- *)
    { Name = "charon"
      Label = "Charon"
      RouteDays = 25000
      Buildings = [
        (* -- entangler: priceRatio 1.15; requiredTech [quantumCryptography]. unlocked=false. Has action: consumes gflops into hashrates pool; hashRateLevel from log(hr/1000)/log(1.6); gflopsConsumption reset to 0.1. *)
        { Name = "entangler"
          Label = "Entanglement St."
          Description = "Entanglement Station generates a set of entangled particles aka qbits for your quantum computing system. This process requires an enormous amount of processing power, but lets you perform a cryptographic attack on elder encryption algorithms."
          Prices = [ { Resource = "antimatter"; Amount = 5250 }; { Resource = "relic"; Amount = 1250 }; { Resource = "eludium"; Amount = 5000 } ]
          PriceRatio = 1.15
          Effects = [ ("gflopsConsumption", 0.1); ("hashrate", 0); ("hashRateLevel", 0); ("nextHashLevelAt", 0); ("hrProgress", 0); ("energyConsumption", 25) ]
          RequiredTech = [ "quantumCryptography" ] }
      ] }
    (* ---- centaurusSystem (routeDays 120000) ---- *)
    { Name = "centaurusSystem"
      Label = "Centaurus System"
      RouteDays = 120000
      Buildings = [
        (* -- tectonic: priceRatio 1.25; requiredTech [terraformation]. unlocked=false. calculateEffects: energyProduction 25*(1+tectonicBonus). *)
        { Name = "tectonic"
          Label = "Tectonic"
          Description = "Rip open the planet near the star Centaurus to collect magma energy."
          Prices = [ { Resource = "antimatter"; Amount = 500 }; { Resource = "thorium"; Amount = 75000 } ]
          PriceRatio = 1.25
          Effects = [ ("energyProduction", 0) ]
          RequiredTech = [ "terraformation" ] }
        (* -- moltenCore: priceRatio 1.25; requiredTech [exogeophysics]. unlocked=false. upgrades spaceBuilding->[tectonic]. *)
        { Name = "moltenCore"
          Label = "Molten Core"
          Description = "Every level of Molten Core improves Tectonic effectiveness by 5%"
          Prices = [ { Resource = "uranium"; Amount = 5000000 }; { Resource = "science"; Amount = 25000000 } ]
          PriceRatio = 1.25
          Effects = [ ("tectonicBonus", 0.05) ]
          RequiredTech = [ "exogeophysics" ] }
      ] }
    (* ---- furthestRing (routeDays 725000000) ---- *)
    { Name = "furthestRing"
      Label = "Furthest Ring"
      RouteDays = 725000000
      Buildings = [
      ] }
]

(* no discrepancies: all extracted fields match orig *)
