(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Bonfire (buildings.js buildingsData) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Visibility rules (exact, from BuildingsManager.update/isUnlocked/isUnlockable + game.unlock): *)
(*   unlocked = persisted flag; resetState sets unlocked=false for ALL buildings. *)
(*   unlockable = defaultUnlockable || unlockSignalReceived (via game.unlock on build/research). *)
(*   each tick: if not unlocked and unlockable and EVERY price >= basePrice * unlockRatio -> unlocked=true. *)
(*   button visible = unlocked || devMode. Buildings have NO requiredTech field (verified: none in JS). *)
(*   unlockScheme (catnip/school/computer/...) unlocks UI themes, NOT building visibility - ignored here. *)
(* Groups (buildingGroups) + canonical render order (buildingsOrder): *)
(*   food=[field;pasture;aqueduct] population=[hut;logHouse;mansion] science=[library;academy;observatory;biolab] *)
(*   storage=[barn;warehouse;harbor] resource=[mine;quarry;lumberMill;oilWell;accelerator] *)
(*   industry=[steamworks;magneto;smelter;calciner;factory;reactor] culture=[amphitheatre;chapel;temple;ziggurat] *)
(*   other=[workshop;tradepost;mint;unicornPasture;brewery] megastructures=[ziggurat;chronosphere;aiCore] *)
(*   zebraBuildings=[zebraOutpost;zebraWorkshop;zebraForge;ivoryTemple;stasisPod] *)
(* Bonfire tab chrome: group filter links (All/Available/Enabled/Togglable/IW + per-group), *)
(* then Gather catnip (free, always) + Refine catnip (100 catnip->1 wood, x100 link when catnip>=100x cost), *)
(* then active group buildings in buildingsOrder, skipping invisible (unlocked=false) ones. *)

type BonfireVisibility = { DefaultUnlockable: bool; UnlockRatio: float option }
type BonfireStage = { Key: string; Label: string; Description: string; Prices: Price list; PriceRatio: float; Effects: (string * float) list; StageUnlocked: bool }
type BonfireBuilding = { Name: string; Label: string; Description: string; Stages: BonfireStage list; EntryPriceRatio: float; EntryPrices: Price list; EntryEffects: (string * float) list; Visibility: BonfireVisibility; Unlocks: (string * string list) list; Upgrades: (string * string list) list }

let bonfireBuildings : BonfireBuilding list = [
    (* ---- field ---- *)
    (* unlockScheme (theme, not visibility): catnip >= 56 *)
    { Name = "field"
      Label = "Catnip Field"
      Description = "Plant some catnip to grow in the village. Fields have +50% production in Spring and -75% production in Winter"
      Stages = []
      EntryPriceRatio = 1.12
      EntryPrices = [ { Resource = "catnip"; Amount = 10 } ]
      EntryEffects = [ ("catnipPerTickBase", 0.125) ]
      Visibility = { DefaultUnlockable = true; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- pasture ---- *)
    { Name = "pasture"
      Label = "Pasture"
      Description = "Provides an alternative source of food, which reduces catnip consumption."
      Stages = [
        { Key = "pasture"; Label = "Pasture"; Description = "Provides an alternative source of food, which reduces catnip consumption.";
          Prices = [ { Resource = "catnip"; Amount = 100 }; { Resource = "wood"; Amount = 10 } ]; PriceRatio = 1.15;
          Effects = [ ("catnipDemandRatio", -0.005) ]; StageUnlocked = true }
        { Key = "solarfarm"; Label = "Solar Farm"; Description = "Provides an additional source of energy depending on the seasons.";
          Prices = [ { Resource = "titanium"; Amount = 250 } ]; PriceRatio = 1.15;
          Effects = [  ]; StageUnlocked = false }
      ]
      EntryPriceRatio = 1.15
      EntryPrices = [  ]
      EntryEffects = [  ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- aqueduct ---- *)
    { Name = "aqueduct"
      Label = "Aqueduct"
      Description = "+3% to catnip production"
      Stages = [
        { Key = "aqueduct"; Label = "Aqueduct"; Description = "+3% to catnip production";
          Prices = [ { Resource = "minerals"; Amount = 75 } ]; PriceRatio = 1.12;
          Effects = [ ("catnipRatio", 0.03) ]; StageUnlocked = true }
        { Key = "hydroplant"; Label = "Hydro Plant"; Description = "A modern source of power production";
          Prices = [ { Resource = "titanium"; Amount = 2500 }; { Resource = "concrate"; Amount = 100 }; { Resource = "gear"; Amount = 5 } ]; PriceRatio = 1.15;
          Effects = [ ("energyProduction", 5) ]; StageUnlocked = false }
      ]
      EntryPriceRatio = 1.15
      EntryPrices = [  ]
      EntryEffects = [ ("catnipRatio", 0); ("energyProduction", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "magneto" ]) ] }
    (* ---- hut ---- *)
    { Name = "hut"
      Label = "Hut"
      Description = "Build a hut (each has a space for 2 kittens). Kittens need catnip to eat, or they will die.<br>Every kitten consumes about 4 catnip/s"
      Stages = []
      EntryPriceRatio = 2.5
      EntryPrices = [ { Resource = "wood"; Amount = 5 } ]
      EntryEffects = [ ("manpowerMax", 75); ("maxKittens", 2) ]
      Visibility = { DefaultUnlockable = true; UnlockRatio = Some 0.3 }
      Unlocks = [ ("tabs", [ "village" ]) ]
      Upgrades = [ ("policies", [ "authocracy" ]) ] }
    (* ---- logHouse ---- *)
    { Name = "logHouse"
      Label = "Log House"
      Description = "Build a house (each has a space for 1 kitten)"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 200 }; { Resource = "minerals"; Amount = 250 } ]
      EntryEffects = [ ("manpowerMax", 50); ("maxKittens", 1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [ ("tabs", [ "village" ]) ]
      Upgrades = [ ("policies", [ "authocracy" ]) ] }
    (* ---- mansion ---- *)
    { Name = "mansion"
      Label = "Mansion"
      Description = "A spacy mansion (each has a space for 1 kitten)"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "titanium"; Amount = 25 }; { Resource = "slab"; Amount = 185 }; { Resource = "steel"; Amount = 75 } ]
      EntryEffects = [ ("manpowerMax", 50); ("maxKittens", 1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [ ("tabs", [ "village" ]) ]
      Upgrades = [ ("policies", [ "authocracy" ]) ] }
    (* ---- library ---- *)
    (* unlockScheme (theme, not visibility): computer >= 100 *)
    { Name = "library"
      Label = "Library"
      Description = "Build a Library to store sacred catkind knowledge. Each upgrade level improves your science output by 10%"
      Stages = [
        { Key = "library"; Label = "Library"; Description = "Build a Library to store sacred catkind knowledge. Each upgrade level improves your science output by 10%";
          Prices = [ { Resource = "wood"; Amount = 25 } ]; PriceRatio = 1.15;
          Effects = [ ("scienceRatio", 0); ("scienceMax", 0); ("cultureMax", 0) ]; StageUnlocked = true }
        { Key = "dataCenter"; Label = "Data Center"; Description = "Increases total effect of compendia on your max science";
          Prices = [ { Resource = "steel"; Amount = 100 }; { Resource = "concrate"; Amount = 10 }; { Resource = "microchip"; Amount = 5 } ]; PriceRatio = 1.15;
          Effects = [ ("scienceMaxCompendia", 1000); ("cultureMax", 25); ("energyConsumption", 2); ("cathPollutionPerTickProd", 2) ]; StageUnlocked = false }
      ]
      EntryPriceRatio = 1.15
      EntryPrices = [  ]
      EntryEffects = [ ("scienceRatio", 0); ("scienceMax", 0); ("cultureMax", 0) ]
      Visibility = { DefaultUnlockable = true; UnlockRatio = Some 0.3 }
      Unlocks = [ ("tabs", [ "science" ]); ("jobs", [ "scholar" ]) ]
      Upgrades = [ ("buildings", [ "biolab"; "observatory" ]) ] }
    (* ---- academy ---- *)
    (* unlockScheme (theme, not visibility): school >= 68 *)
    { Name = "academy"
      Label = "Academy"
      Description = "Improves your research ratio and the speed of your kitten skills growth. Each upgrade level improves your science output by 20%"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 50 }; { Resource = "minerals"; Amount = 70 }; { Resource = "science"; Amount = 100 } ]
      EntryEffects = [ ("scienceRatio", 0.2); ("skillXP", 0.0005); ("scienceMax", 500); ("cultureMax", 25); ("academyMeteorBonus", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- observatory ---- *)
    { Name = "observatory"
      Label = "Observatory"
      Description = "Increases the chance of astronomical events by 0.2%"
      Stages = []
      EntryPriceRatio = 1.10
      EntryPrices = [ { Resource = "iron"; Amount = 750 }; { Resource = "science"; Amount = 1000 }; { Resource = "slab"; Amount = 35 }; { Resource = "scaffold"; Amount = 50 } ]
      EntryEffects = [ ("starEventChance", 0.002); ("starAutoSuccessChance", 0.01) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ] }
    (* ---- biolab ---- *)
    { Name = "biolab"
      Label = "Bio Lab"
      Description = "Improves effectiveness of catnip refinement by 10%. More effective if powered."
      Stages = []
      EntryPriceRatio = 1.10
      EntryPrices = [ { Resource = "science"; Amount = 1500 }; { Resource = "slab"; Amount = 100 }; { Resource = "plastic"; Amount = 15 }; { Resource = "alloy"; Amount = 25 } ]
      EntryEffects = [ ("scienceRatio", 0.35); ("refineRatio", 0.1); ("scienceMax", 0); ("catnipPerTickCon", 0); ("oilPerTickProd", 0); ("energyConsumption", 0); ("compediumCraftRatio", 0); ("compediumGlobalCraftRatio", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ] }
    (* ---- barn ---- *)
    { Name = "barn"
      Label = "Barn"
      Description = "Provides a space to store your resources."
      Stages = []
      EntryPriceRatio = 1.75
      EntryPrices = [ { Resource = "wood"; Amount = 50 } ]
      EntryEffects = [ ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("goldMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- warehouse ---- *)
    (* unlockScheme (theme, not visibility): minimalist >= 10 *)
    { Name = "warehouse"
      Label = "Warehouse"
      Description = "Provides a space to store your resources"
      Stages = [
        { Key = "warehouse"; Label = "Warehouse"; Description = "Provides a space to store your resources";
          Prices = [ { Resource = "beam"; Amount = 1.5 }; { Resource = "slab"; Amount = 2 } ]; PriceRatio = 1.15;
          Effects = [ ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("goldMax", 0) ]; StageUnlocked = true }
        { Key = "spaceport"; Label = "Spaceport"; Description = "Increases the storage capacity of buildings in space. Does not affect science or antimatter.";
          Prices = [ { Resource = "titanium"; Amount = 10000 }; { Resource = "eludium"; Amount = 500 }; { Resource = "kerosene"; Amount = 1000 }; { Resource = "blueprint"; Amount = 500 }; { Resource = "starchart"; Amount = 100000 } ]; PriceRatio = 1.15;
          Effects = [ ("moonBaseStorageBonus", 0); ("planetCrackerStorageBonus", 0); ("cryostationStorageBonus", 0); ("energyConsumption", 0); ("tradeVolume", 0) ]; StageUnlocked = true }
      ]
      EntryPriceRatio = 1.15
      EntryPrices = [  ]
      EntryEffects = [ ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("goldMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [ ("upgrades", [ "transportSuperposition" ]) ]
      Upgrades = [ ("spaceBuilding", [ "moonBase"; "planetCracker"; "cryostation" ]) ] }
    (* ---- harbor ---- *)
    { Name = "harbor"
      Label = "Harbour"
      Description = "Provides a space to store your resources"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "slab"; Amount = 50 }; { Resource = "plate"; Amount = 75 }; { Resource = "scaffold"; Amount = 5 } ]
      EntryEffects = [ ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("goldMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- mine ---- *)
    (* unlockScheme (theme, not visibility): anthracite >= 92 *)
    { Name = "mine"
      Label = "Mine"
      Description = "Unlocks the miner job. Each upgrade level improves your mineral output by 20%"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 100 } ]
      EntryEffects = [ ("mineralsRatio", 0); ("coalPerTickBase", 0); ("cathPollutionPerTickProd", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.15 }
      Unlocks = [ ("jobs", [ "miner" ]) ]
      Upgrades = [  ] }
    (* ---- quarry ---- *)
    { Name = "quarry"
      Label = "Quarry"
      Description = "Quarries each improve your mining efficiency by 35% and produce a bit of coal"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "slab"; Amount = 1000 }; { Resource = "steel"; Amount = 125 }; { Resource = "scaffold"; Amount = 50 } ]
      EntryEffects = [ ("mineralsRatio", 0.35); ("coalPerTickBase", 0.015); ("uraniumPerTickBase", 0); ("cathPollutionPerTickProd", 0.25); ("slabCraftRatio", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- smelter ---- *)
    { Name = "smelter"
      Label = "Smelter"
      Description = "Smelts ore into metal"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "minerals"; Amount = 200 } ]
      EntryEffects = [ ("woodPerTickCon", 0); ("mineralsPerTickCon", 0); ("coalPerTickAutoprod", 0); ("ironPerTickAutoprod", 0); ("titaniumPerTickAutoprod", 0); ("goldPerTickAutoprod", 0); ("cathPollutionPerTickProd", 0.15) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.15 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- calciner ---- *)
    { Name = "calciner"
      Label = "Calciner"
      Description = "A highly effective source of metal. Consumes 1.5 minerals and 0.02 oil per tick. Produces iron and a small amount of titanium"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "titanium"; Amount = 15 }; { Resource = "oil"; Amount = 500 }; { Resource = "steel"; Amount = 100 }; { Resource = "blueprint"; Amount = 1 } ]
      EntryEffects = [ ("mineralsPerTickCon", -1.5); ("coalPerTickCon", 0); ("ironPerTickCon", 0); ("ironPerTickAutoprod", 0.15); ("titaniumPerTickAutoprod", 0.0005); ("oilPerTickCon", -0.024); ("steelPerTickProd", 0); ("energyConsumption", 1); ("cathPollutionPerTickProd", 1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- steamworks ---- *)
    { Name = "steamworks"
      Label = "Steamworks"
      Description = "When active, significantly reduces your coal production. Does nothing useful by default, but can do a lot of cool stuff once upgraded."
      Stages = []
      EntryPriceRatio = 1.25
      EntryPrices = [ { Resource = "steel"; Amount = 65 }; { Resource = "gear"; Amount = 20 }; { Resource = "blueprint"; Amount = 1 } ]
      EntryEffects = [ ("coalRatioGlobal", 0); ("manuscriptPerTickProd", 0); ("energyProduction", 1); ("magnetoBoostRatio", 0.15); ("cathPollutionPerTickProd", 1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- magneto ---- *)
    { Name = "magneto"
      Label = "Magneto"
      Description = "Improves your total resource production by 2%. Every Steamworks will boost this effect by 15%. Consumes oil."
      Stages = []
      EntryPriceRatio = 1.25
      EntryPrices = [ { Resource = "gear"; Amount = 5 }; { Resource = "alloy"; Amount = 10 }; { Resource = "blueprint"; Amount = 1 } ]
      EntryEffects = [ ("oilPerTick", -0.05); ("energyProduction", 5); ("magnetoRatio", 0.02); ("cathPollutionPerTickProd", 5) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- lumberMill ---- *)
    { Name = "lumberMill"
      Label = "Lumber Mill"
      Description = "Increases wood production"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 100 }; { Resource = "minerals"; Amount = 250 }; { Resource = "iron"; Amount = 50 } ]
      EntryEffects = [ ("woodRatio", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- oilWell ---- *)
    (* unlockScheme (theme, not visibility): oil >= 73 *)
    { Name = "oilWell"
      Label = "Oil Well"
      Description = "Produces a bit of oil, +1500 to maximum oil limit"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "steel"; Amount = 50 }; { Resource = "gear"; Amount = 25 }; { Resource = "scaffold"; Amount = 25 } ]
      EntryEffects = [ ("oilPerTickBase", 0.02); ("oilMax", 1500); ("energyConsumption", 0); ("cathPollutionPerTickProd", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- workshop ---- *)
    { Name = "workshop"
      Label = "Workshop"
      Description = "Provides a vast variety of upgrades. Improves craft effectiveness by 6%"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 100 }; { Resource = "minerals"; Amount = 400 } ]
      EntryEffects = [ ("craftRatio", 0.06) ]
      Visibility = { DefaultUnlockable = true; UnlockRatio = Some 0.0025 }
      Unlocks = [ ("tabs", [ "workshop" ]) ]
      Upgrades = [  ] }
    (* ---- factory ---- *)
    (* unlockScheme (theme, not visibility): factory >= 20 *)
    { Name = "factory"
      Label = "Factory"
      Description = "Improves craft effectiveness"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "titanium"; Amount = 2000 }; { Resource = "plate"; Amount = 2500 }; { Resource = "concrate"; Amount = 15 } ]
      EntryEffects = [ ("craftRatio", 0); ("energyConsumption", 0); ("cathPollutionPerTickProd", 0); ("cathPollutionPerTickCon", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [ ("policies", [ "liberalism"; "communism"; "fascism" ]) ]
      Upgrades = [  ] }
    (* ---- reactor ---- *)
    { Name = "reactor"
      Label = "Reactor"
      Description = "Provides a 5% boost to production while active. Requires uranium to operate."
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "titanium"; Amount = 3500 }; { Resource = "plate"; Amount = 5000 }; { Resource = "concrate"; Amount = 50 }; { Resource = "blueprint"; Amount = 25 } ]
      EntryEffects = [ ("uraniumPerTick", -0.001); ("thoriumPerTick", 0); ("productionRatio", 0.05); ("uraniumMax", 250); ("energyProduction", 10) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "harbor" ]) ] }
    (* ---- accelerator ---- *)
    { Name = "accelerator"
      Label = "Accelerator"
      Description = "Converts titanium to the uranium (sic)"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "titanium"; Amount = 7500 }; { Resource = "uranium"; Amount = 25 }; { Resource = "concrate"; Amount = 125 } ]
      EntryEffects = [ ("titaniumPerTickCon", -0.015); ("uraniumPerTickAutoprod", 0.0025); ("catnipMax", 0); ("woodMax", 0); ("mineralsMax", 0); ("coalMax", 0); ("ironMax", 0); ("titaniumMax", 0); ("goldMax", 0); ("scienceMax", 0); ("energyConsumption", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- tradepost ---- *)
    { Name = "tradepost"
      Label = "Tradepost"
      Description = "The heart of your trading empire. Improves trade effectiveness by 1.5%, reduces rare resource consumption by 4%"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "wood"; Amount = 500 }; { Resource = "minerals"; Amount = 200 }; { Resource = "gold"; Amount = 10 } ]
      EntryEffects = [ ("fursDemandRatio", -0.04); ("ivoryDemandRatio", -0.04); ("spiceDemandRatio", -0.04); ("tradeRatio", 0.015); ("standingRatio", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [ ("challenges", [ "pacifism" ]) ] }
    (* ---- mint ---- *)
    (* unlockScheme (theme, not visibility): gold >= 24 *)
    { Name = "mint"
      Label = "Mint"
      Description = "Produces luxurious resources proportional to your max catpower. Consumes catpower and a bit of gold."
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "minerals"; Amount = 5000 }; { Resource = "gold"; Amount = 500 }; { Resource = "plate"; Amount = 200 } ]
      EntryEffects = [ ("goldPerTickCon", -0.005); ("manpowerPerTickCon", -0.75); ("fursPerTickProd", 0.00875); ("ivoryPerTickProd", 0.0021); ("goldMax", 100) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- brewery ---- *)
    (* unlockScheme (theme, not visibility): chocolate >= 10 *)
    { Name = "brewery"
      Label = "Brewery"
      Description = "Brew catnip into a spicy drink. Boosts festival effects."
      Stages = []
      EntryPriceRatio = 1.5
      EntryPrices = [ { Resource = "wood"; Amount = 1000 }; { Resource = "culture"; Amount = 750 }; { Resource = "spice"; Amount = 5 }; { Resource = "parchment"; Amount = 375 } ]
      EntryEffects = [ ("catnipPerTickCon", -1); ("spicePerTickCon", -0.1); ("festivalRatio", 0.01); ("festivalArrivalRatio", 0.001); ("manpowerRatio", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.2 }
      Unlocks = [ ("zebraUpgrades", [ "darkBrew" ]) ]
      Upgrades = [  ] }
    (* ---- amphitheatre ---- *)
    { Name = "amphitheatre"
      Label = "Amphitheatre"
      Description = "Reduces negative effects of overpopulation by 5%. This effect stacks but has diminishing return. Produces culture."
      Stages = [
        { Key = "amphitheatre"; Label = "Amphitheatre"; Description = "Reduces negative effects of overpopulation by 5%. This effect stacks but has diminishing return. Produces culture.";
          Prices = [ { Resource = "wood"; Amount = 200 }; { Resource = "minerals"; Amount = 1200 }; { Resource = "parchment"; Amount = 3 } ]; PriceRatio = 1.15;
          Effects = [ ("unhappinessRatio", -0.048); ("culturePerTickBase", 0.005); ("cultureMax", 50) ]; StageUnlocked = true }
        { Key = "broadcasttower"; Label = "Broadcast Tower"; Description = "Generates culture and happiness. More effective with high energy production.";
          Prices = [ { Resource = "iron"; Amount = 1250 }; { Resource = "titanium"; Amount = 75 } ]; PriceRatio = 1.18;
          Effects = [ ("unhappinessRatio", -0.75); ("culturePerTickBase", 1); ("cultureMax", 300) ]; StageUnlocked = false }
      ]
      EntryPriceRatio = 1.18
      EntryPrices = [  ]
      EntryEffects = [ ("unhappinessRatio", 0); ("culturePerTickBase", 0); ("cultureMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- chapel ---- *)
    { Name = "chapel"
      Label = "Chapel"
      Description = "Produces a bit of culture and faith per tick. May be improved with religious upgrades"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "minerals"; Amount = 2000 }; { Resource = "culture"; Amount = 250 }; { Resource = "parchment"; Amount = 250 } ]
      EntryEffects = [ ("culturePerTickBase", 0); ("faithPerTickBase", 0); ("cultureMax", 0); ("faithMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- temple ---- *)
    { Name = "temple"
      Label = "Temple"
      Description = "Temple of light. Produces culture. May be improved with Theology."
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "gold"; Amount = 50 }; { Resource = "slab"; Amount = 25 }; { Resource = "plate"; Amount = 15 }; { Resource = "manuscript"; Amount = 10 } ]
      EntryEffects = [ ("culturePerTickBase", 0); ("faithPerTickBase", 0); ("happiness", 0); ("manpowerMax", 0); ("scienceMax", 0); ("cultureMax", 0); ("faithMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "ziggurat" ]) ] }
    (* ---- unicornPasture ---- *)
    { Name = "unicornPasture"
      Label = "Unic. Pasture"
      Description = "Allows the taming of unicorns. Reduces catnip consumption by 0.15%"
      Stages = []
      EntryPriceRatio = 1.75
      EntryPrices = [ { Resource = "unicorns"; Amount = 2 } ]
      EntryEffects = [ ("catnipDemandRatio", -0.0015); ("unicornsPerTickBase", 0.001); ("unicornsMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.3 }
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- ziggurat ---- *)
    { Name = "ziggurat"
      Label = "Ziggurat"
      Description = "The dark legacy of the lost race. Every Ziggurat will improve your culture limits by 8%.<br>May have special usage once Theology is researched."
      Stages = []
      EntryPriceRatio = 1.25
      EntryPrices = [ { Resource = "scaffold"; Amount = 50 }; { Resource = "blueprint"; Amount = 1 }; { Resource = "megalith"; Amount = 50 } ]
      EntryEffects = [ ("cultureMaxRatio", 0.08); ("unicornsMax", 0); ("tearsMax", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "temple" ]) ] }
    (* ---- chronosphere ---- *)
    { Name = "chronosphere"
      Label = "Chronosphere"
      Description = "Relocates small amount of resources through time. Can be upgraded further. Every Chronosphere increases the chance of Temporal Paradox."
      Stages = []
      EntryPriceRatio = 1.25
      EntryPrices = [ { Resource = "unobtainium"; Amount = 2500 }; { Resource = "science"; Amount = 250000 }; { Resource = "timeCrystal"; Amount = 1 }; { Resource = "blueprint"; Amount = 100 } ]
      EntryEffects = [ ("temporalParadoxChance", 0.01); ("resStasisRatio", 0.015); ("temporalFluxProduction", 0); ("energyConsumption", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = None }
      Unlocks = [  ]
      Upgrades = [ ("voidSpace", [ "cryochambers" ]); ("buildings", [ "stasisPod" ]) ] }
    (* ---- aiCore ---- *)
    (* unlockScheme (theme, not visibility): cyber >= 5 *)
    { Name = "aiCore"
      Label = "aiCore"
      Description = ""
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "antimatter"; Amount = 125 }; { Resource = "microchip"; Amount = 25 }; { Resource = "science"; Amount = 500000 } ]
      EntryEffects = [ ("gflopsPerTickBase", 0.02); ("energyConsumption", 2) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]); ("spaceBuilding", [ "moonBase" ]) ] }
    (* ---- zebraOutpost ---- *)
    { Name = "zebraOutpost"
      Label = "Zebra Outpost"
      Description = "Provides a base for the hunting expeditions. Every level of upgrade improves expedition effectiveness by 5%"
      Stages = []
      EntryPriceRatio = 1.35
      EntryPrices = [ { Resource = "bloodstone"; Amount = 1 } ]
      EntryEffects = [ ("manpowerMax", 5); ("hunterRatio", 0.05); ("zebraPreparations", 0) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "zebraWorkshop" ]) ] }
    (* ---- zebraWorkshop ---- *)
    { Name = "zebraWorkshop"
      Label = "Zebra Workshop"
      Description = "Unlocks various zebra upgrades"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "bloodstone"; Amount = 5 } ]
      EntryEffects = [ ("bloodstoneRatio", 0); ("manpowerMax", 25); ("bloodstoneCraftRatio", 0.01) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [ ("zebraUpgrades", [ "darkRevolution" ]) ]
      Upgrades = [ ("buildings", [ "zebraWorkshop" ]) ] }
    (* ---- zebraForge ---- *)
    { Name = "zebraForge"
      Label = "Zebra Forge"
      Description = "Unlocks the craft of bloodstones and t-mythril."
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "bloodstone"; Amount = 50 } ]
      EntryEffects = [ ("bloodstoneCraftRatio", 0.02); ("tMythrilCraftRatio", 0.01); ("bloodstoneRatio", 0); ("manpowerMax", 50); ("preparationRatio", 0); ("zebratradeNormalResChance", 0.1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [ ("crafts", [ "bloodstone"; "tMythril" ]); ("zebraUpgrades", [ "whispers" ]) ]
      Upgrades = [ ("buildings", [ "zebraOutpost"; "zebraWorkshop" ]); ("buildings", [ "zebraOutpost" ]) ] }
    (* ---- stasisPod ---- *)
    { Name = "stasisPod"
      Label = "Stasis Pod"
      Description = "A large stasis pod suited for non-feline liveforms"
      Stages = []
      EntryPriceRatio = 1.25
      EntryPrices = [ { Resource = "tMythril"; Amount = 1 }; { Resource = "timeCrystal"; Amount = 2 }; { Resource = "void"; Amount = 100 } ]
      EntryEffects = [ ("zebrasMax", 1) ]
      Visibility = { DefaultUnlockable = false; UnlockRatio = Some 0.01 }
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "zebraOutpost" ]) ] }
    (* ---- ivoryTemple ---- *)
    { Name = "ivoryTemple"
      Label = "Ivory Temple"
      Description = "Mystical temple where ivory is converted into minerals"
      Stages = []
      EntryPriceRatio = 1.15
      EntryPrices = [ { Resource = "tMythril"; Amount = 1 }; { Resource = "ivory"; Amount = 100 } ]
      EntryEffects = [ ("ivoryPerTickCon", 0); ("mineralsPerTickProd", 0); ("titaniumPerTickCon", 0); ("alicornPerTickCon", 0); ("tMythrilPerTick", 0); ("manpowerMax", 10) ]
      Visibility = { DefaultUnlockable = true; UnlockRatio = Some 0.1 }
      Unlocks = [  ]
      Upgrades = [  ] }
]
(* no discrepancies: all extracted fields match orig *)
