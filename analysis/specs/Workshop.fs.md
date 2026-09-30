(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   5 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Workshop upgrades + crafts (workshop.js) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Upgrade visibility (exact, from workshop.js resetState + UpgradeButtonController.updateVisible): *)
(*   resetState: mineralHoes/ironHoes/mineralAxes/ironAxes/stoneBarns/reinforcedBarns start unlocked=true; *)
(*     ALL others unlocked=false; researched=false everywhere. *)
(*   research(upgrade) -> game.unlock(upgrade.unlocks): upgrades-list targets get unlocked=true *)
(*     (workshop tab UpgradeButtonController.updateVisible: visible = upgrade.unlocked). *)
(*   NO tech-gating on upgrades (verified: no requiredTech field); NO price-ratio pre-reveal. *)
(*   upgrades[].upgrades = game.upgrade() effect-recalc triggers (NOT visibility). *)
(*   upgrades with handler: run side-effect JS on research (e.g. advancedRefinement rewrites wood prices). *)
(* Craft visibility (exact): wood/beam/slab/plate/gear/scaffold/manuscript/megalith start unlocked=true, *)
(*   rest unlocked=false until game.unlock(crafts) (zebraForge->bloodstone/tMythril etc). *)
(*   CraftButtonController.updateVisible: visible = craft.unlocked. *)

type WorkshopUpgrade = { Name: string; Label: string; Description: string; Prices: Price list; Effects: (string * float) list; Unlocks: (string * string list) list; Upgrades: (string * string list) list; HasHandler: bool; StartsUnlocked: bool }
type WorkshopCraft = { Name: string; Label: string; Description: string; Prices: Price list; StartsUnlocked: bool }

let workshopUpgrades : WorkshopUpgrade list = [
    (* ---- mineralHoes ---- *)
    { Name = "mineralHoes"
      Label = "Mineral Hoes"
      Description = "Your farmers are 50% more effective"
      Prices = [ { Resource = "minerals"; Amount = 275 }; { Resource = "science"; Amount = 100 } ]
      Effects = [ ("catnipJobRatio", 0.5) ]
      Unlocks = [ ("upgrades", [ "ironHoes" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- ironHoes ---- *)
    { Name = "ironHoes"
      Label = "Iron Hoes"
      Description = "Your farmers are 30% more effective"
      Prices = [ { Resource = "iron"; Amount = 25 }; { Resource = "science"; Amount = 200 } ]
      Effects = [ ("catnipJobRatio", 0.3) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- mineralAxes ---- *)
    { Name = "mineralAxes"
      Label = "Mineral Axe"
      Description = "Woodcutters are 70% more effective"
      Prices = [ { Resource = "minerals"; Amount = 500 }; { Resource = "science"; Amount = 100 } ]
      Effects = [ ("woodJobRatio", 0.7) ]
      Unlocks = [ ("upgrades", [ "ironAxes" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- ironAxes ---- *)
    { Name = "ironAxes"
      Label = "Iron Axe"
      Description = "Woodcutters are 50% more effective"
      Prices = [ { Resource = "iron"; Amount = 50 }; { Resource = "science"; Amount = 200 } ]
      Effects = [ ("woodJobRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- steelAxe ---- *)
    { Name = "steelAxe"
      Label = "Steel Axe"
      Description = "Very sharp and durable axes. Woodcutters are 50% more effective"
      Prices = [ { Resource = "science"; Amount = 20000 }; { Resource = "steel"; Amount = 75 } ]
      Effects = [ ("woodJobRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- reinforcedSaw ---- *)
    { Name = "reinforcedSaw"
      Label = "Reinforced Saw"
      Description = "Improve Lumber Mill efficiency by 20%"
      Prices = [ { Resource = "iron"; Amount = 1000 }; { Resource = "science"; Amount = 2500 } ]
      Effects = [ ("lumberMillRatio", 0.2) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "lumberMill" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- steelSaw ---- *)
    { Name = "steelSaw"
      Label = "Steel Saw"
      Description = "Improve Lumber Mill efficiency by 20%"
      Prices = [ { Resource = "science"; Amount = 52000 }; { Resource = "steel"; Amount = 750 } ]
      Effects = [ ("lumberMillRatio", 0.2) ]
      Unlocks = [ ("upgrades", [ "titaniumSaw" ]) ]
      Upgrades = [ ("buildings", [ "lumberMill" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- titaniumSaw ---- *)
    { Name = "titaniumSaw"
      Label = "Titanium Saw"
      Description = "Improve Lumber Mill efficiency by 15%"
      Prices = [ { Resource = "titanium"; Amount = 500 }; { Resource = "science"; Amount = 70000 } ]
      Effects = [ ("lumberMillRatio", 0.15) ]
      Unlocks = [ ("upgrades", [ "alloySaw" ]) ]
      Upgrades = [ ("buildings", [ "lumberMill" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- alloySaw ---- *)
    { Name = "alloySaw"
      Label = "Alloy Saw"
      Description = "Improve Lumber Mill efficiency by 15%"
      Prices = [ { Resource = "science"; Amount = 85000 }; { Resource = "alloy"; Amount = 75 } ]
      Effects = [ ("lumberMillRatio", 0.15) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "lumberMill" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- titaniumAxe ---- *)
    { Name = "titaniumAxe"
      Label = "Titanium Axe"
      Description = "Indestructible axes. Woodcutters are 50% more effective."
      Prices = [ { Resource = "titanium"; Amount = 10 }; { Resource = "science"; Amount = 38000 } ]
      Effects = [ ("woodJobRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- alloyAxe ---- *)
    { Name = "alloyAxe"
      Label = "Alloy Axe"
      Description = "The more you use them, the sharper they are! Woodcutters are 50% more effective."
      Prices = [ { Resource = "science"; Amount = 70000 }; { Resource = "alloy"; Amount = 25 } ]
      Effects = [ ("woodJobRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unobtainiumAxe ---- *)
    { Name = "unobtainiumAxe"
      Label = "Unobtainium Axe"
      Description = "Those axes are literally unobtainable! Woodcutters are 50% more effective."
      Prices = [ { Resource = "unobtainium"; Amount = 75 }; { Resource = "science"; Amount = 125000 } ]
      Effects = [ ("woodJobRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unobtainiumSaw ---- *)
    { Name = "unobtainiumSaw"
      Label = "Unobtainium Saw"
      Description = "Improve Lumber Mill efficiency by 25%"
      Prices = [ { Resource = "unobtainium"; Amount = 125 }; { Resource = "science"; Amount = 145000 } ]
      Effects = [ ("lumberMillRatio", 0.25) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "lumberMill" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- stoneBarns ---- *)
    { Name = "stoneBarns"
      Label = "Expanded Barns"
      Description = "75% more storage space for wood and iron"
      Prices = [ { Resource = "wood"; Amount = 1000 }; { Resource = "minerals"; Amount = 750 }; { Resource = "iron"; Amount = 50 }; { Resource = "science"; Amount = 500 } ]
      Effects = [ ("barnRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- reinforcedBarns ---- *)
    { Name = "reinforcedBarns"
      Label = "Reinforced Barns"
      Description = "80% more storage space for wood and iron"
      Prices = [ { Resource = "iron"; Amount = 100 }; { Resource = "science"; Amount = 800 }; { Resource = "beam"; Amount = 25 }; { Resource = "slab"; Amount = 10 } ]
      Effects = [ ("barnRatio", 0.80) ]
      Unlocks = [ ("upgrades", [ "titaniumBarns" ]) ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = true }
    (* ---- reinforcedWarehouses ---- *)
    { Name = "reinforcedWarehouses"
      Label = "Reinforced Warehouses"
      Description = "Storage facilities store 25% more resources"
      Prices = [ { Resource = "science"; Amount = 15000 }; { Resource = "plate"; Amount = 50 }; { Resource = "steel"; Amount = 50 }; { Resource = "scaffold"; Amount = 25 } ]
      Effects = [ ("warehouseRatio", 0.25) ]
      Unlocks = [ ("upgrades", [ "ironwood" ]) ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- titaniumBarns ---- *)
    { Name = "titaniumBarns"
      Label = "Titanium Barns"
      Description = "Storage facilities store 100% more resources. (As a general rule of thumb, upgrades stack additively to each other.)"
      Prices = [ { Resource = "titanium"; Amount = 25 }; { Resource = "science"; Amount = 60000 }; { Resource = "steel"; Amount = 200 }; { Resource = "scaffold"; Amount = 250 } ]
      Effects = [ ("barnRatio", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- alloyBarns ---- *)
    { Name = "alloyBarns"
      Label = "Alloy Barns"
      Description = "Storage facilities store 100% more resources."
      Prices = [ { Resource = "science"; Amount = 75000 }; { Resource = "plate"; Amount = 750 }; { Resource = "alloy"; Amount = 20 } ]
      Effects = [ ("barnRatio", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- concreteBarns ---- *)
    { Name = "concreteBarns"
      Label = "Concrete Barns"
      Description = "Storage facilities store 75% more resources"
      Prices = [ { Resource = "titanium"; Amount = 2000 }; { Resource = "science"; Amount = 100000 }; { Resource = "concrate"; Amount = 45 } ]
      Effects = [ ("barnRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- titaniumWarehouses ---- *)
    { Name = "titaniumWarehouses"
      Label = "Titanium Warehouses"
      Description = "Storage facilities store 50% more resources"
      Prices = [ { Resource = "titanium"; Amount = 50 }; { Resource = "science"; Amount = 70000 }; { Resource = "steel"; Amount = 500 }; { Resource = "scaffold"; Amount = 500 } ]
      Effects = [ ("warehouseRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- alloyWarehouses ---- *)
    { Name = "alloyWarehouses"
      Label = "Alloy Warehouses"
      Description = "Storage facilities store 45% more resources"
      Prices = [ { Resource = "titanium"; Amount = 750 }; { Resource = "science"; Amount = 90000 }; { Resource = "alloy"; Amount = 50 } ]
      Effects = [ ("warehouseRatio", 0.45) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- concreteWarehouses ---- *)
    { Name = "concreteWarehouses"
      Label = "Concrete Warehouses"
      Description = "Storage facilities store 35% more resources"
      Prices = [ { Resource = "titanium"; Amount = 1250 }; { Resource = "science"; Amount = 100000 }; { Resource = "concrate"; Amount = 35 } ]
      Effects = [ ("warehouseRatio", 0.35) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- storageBunkers ---- *)
    { Name = "storageBunkers"
      Label = "Storage Bunkers"
      Description = "Storage facilities store 20% more resources"
      Prices = [ { Resource = "unobtainium"; Amount = 500 }; { Resource = "science"; Amount = 25000 }; { Resource = "concrate"; Amount = 1250 } ]
      Effects = [ ("warehouseRatio", 0.20) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- energyRifts ---- *)
    { Name = "energyRifts"
      Label = "Energy Rifts"
      Description = "Accelerators will now create rifts to a pocket dimension"
      Prices = [ { Resource = "titanium"; Amount = 7500 }; { Resource = "uranium"; Amount = 250 }; { Resource = "science"; Amount = 200000 } ]
      Effects = [  ]
      Unlocks = [ ("upgrades", [ "stasisChambers"; "tachyonAccelerators" ]) ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- stasisChambers ---- *)
    { Name = "stasisChambers"
      Label = "Stasis Chambers"
      Description = "Energy Rifts are 95% more effective at storing resources."
      Prices = [ { Resource = "uranium"; Amount = 2000 }; { Resource = "science"; Amount = 235000 }; { Resource = "timeCrystal"; Amount = 1 }; { Resource = "alloy"; Amount = 200 } ]
      Effects = [ ("acceleratorRatio", 0.95) ]
      Unlocks = [ ("upgrades", [ "voidEnergy" ]) ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- voidEnergy ---- *)
    { Name = "voidEnergy"
      Label = "Void Energy"
      Description = "Energy Rifts are even more effective at storing resources."
      Prices = [ { Resource = "uranium"; Amount = 2500 }; { Resource = "science"; Amount = 275000 }; { Resource = "timeCrystal"; Amount = 2 }; { Resource = "alloy"; Amount = 250 } ]
      Effects = [ ("acceleratorRatio", 0.75) ]
      Unlocks = [ ("upgrades", [ "darkEnergy" ]) ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- darkEnergy ---- *)
    { Name = "darkEnergy"
      Label = "Dark Energy"
      Description = "Energy Rifts are 250% more effective at storing resources."
      Prices = [ { Resource = "science"; Amount = 350000 }; { Resource = "timeCrystal"; Amount = 3 }; { Resource = "eludium"; Amount = 75 } ]
      Effects = [ ("acceleratorRatio", 2.5) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- chronoforge ---- *)
    { Name = "chronoforge"
      Label = "Chronoforge"
      Description = "An alien technology related to time manipulation."
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "timeCrystal"; Amount = 10 }; { Resource = "relic"; Amount = 5 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- tachyonModerator ---- *)
    { Name = "tachyonModerator"
      Label = "Tachyon Moderator"
      Description = "Unlocks more advanced tools to control the Chronoforge, such as pausing in between timeskips. | Flavor: It's also capable of automatically synchronizing cardinal grammeters."
      Prices = [ { Resource = "science"; Amount = 16000 }; { Resource = "gear"; Amount = 500 }; { Resource = "titanium"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [ ("chronoforge", [ "controlledDelay" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- tachyonAccelerators ---- *)
    { Name = "tachyonAccelerators"
      Label = "Tachyon Accelerators"
      Description = "Energy Rifts are 500% more effective."
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "timeCrystal"; Amount = 10 }; { Resource = "eludium"; Amount = 125 } ]
      Effects = [ ("acceleratorRatio", 5) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- fluxCondensator ---- *)
    { Name = "fluxCondensator"
      Label = "Flux Condensator"
      Description = "Chronosphere will now affect craftable resources."
      Prices = [ { Resource = "unobtainium"; Amount = 5000 }; { Resource = "timeCrystal"; Amount = 5 }; { Resource = "alloy"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- lhc ---- *)
    { Name = "lhc"
      Label = "LHC"
      Description = "Every Accelerator will provide a bonus to maximum science"
      Prices = [ { Resource = "unobtainium"; Amount = 100 }; { Resource = "science"; Amount = 250000 }; { Resource = "alloy"; Amount = 150 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "accelerator" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- photovoltaic ---- *)
    { Name = "photovoltaic"
      Label = "Photovoltaic Cells"
      Description = "Solar Farms are 50% more effective"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "science"; Amount = 75000 } ]
      Effects = [ ("solarFarmRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "pasture" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- thinFilm ---- *)
    { Name = "thinFilm"
      Label = "Thin Film Cells"
      Description = "Solar Panels are slightly more effective in winter"
      Prices = [ { Resource = "uranium"; Amount = 1000 }; { Resource = "unobtainium"; Amount = 200 }; { Resource = "science"; Amount = 125000 } ]
      Effects = [ ("solarFarmSeasonRatio", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "pasture" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- qdot ---- *)
    { Name = "qdot"
      Label = "Quantum Dot Cells"
      Description = "Solar Panels are slightly more effective all year"
      Prices = [ { Resource = "science"; Amount = 175000 }; { Resource = "eludium"; Amount = 200 }; { Resource = "thorium"; Amount = 1000 } ]
      Effects = [ ("solarFarmSeasonRatio", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "pasture" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- solarSatellites ---- *)
    { Name = "solarSatellites"
      Label = "Solar Satellites"
      Description = "Satellites will now generate energy instead of consuming it"
      Prices = [ { Resource = "science"; Amount = 225000 }; { Resource = "alloy"; Amount = 750 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "sattelite" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- cargoShips ---- *)
    { Name = "cargoShips"
      Label = "Expanded Cargo"
      Description = "Every ship will give a 1% bonus to Harbor capacity | Flavor: It's like a tuna can, but bigger"
      Prices = [ { Resource = "science"; Amount = 55000 }; { Resource = "blueprint"; Amount = 15 } ]
      Effects = [ ("harborRatio", 0.01) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- barges ---- *)
    { Name = "barges"
      Label = "Barges"
      Description = "Harbors store more coal"
      Prices = [ { Resource = "titanium"; Amount = 1500 }; { Resource = "science"; Amount = 100000 }; { Resource = "blueprint"; Amount = 30 } ]
      Effects = [ ("harborCoalRatio", 0.5) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- reactorVessel ---- *)
    { Name = "reactorVessel"
      Label = "Reactor Vessel"
      Description = "Every reactor improves ship potential by 5%"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "uranium"; Amount = 125 }; { Resource = "science"; Amount = 135000 } ]
      Effects = [ ("shipLimit", 0.05) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- ironwood ---- *)
    { Name = "ironwood"
      Label = "Ironwood Huts"
      Description = "Hut price ratio reduced by 50%"
      Prices = [ { Resource = "wood"; Amount = 15000 }; { Resource = "iron"; Amount = 3000 }; { Resource = "science"; Amount = 30000 } ]
      Effects = [ ("hutPriceRatio", -0.5) ]
      Unlocks = [ ("upgrades", [ "silos" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- concreteHuts ---- *)
    { Name = "concreteHuts"
      Label = "Concrete Huts"
      Description = "Hut price ratio reduced by 30%"
      Prices = [ { Resource = "titanium"; Amount = 3000 }; { Resource = "science"; Amount = 125000 }; { Resource = "concrate"; Amount = 45 } ]
      Effects = [ ("hutPriceRatio", -0.30) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unobtainiumHuts ---- *)
    { Name = "unobtainiumHuts"
      Label = "Unobtainium Huts"
      Description = "Hut price ratio reduced by 25%"
      Prices = [ { Resource = "titanium"; Amount = 15000 }; { Resource = "unobtainium"; Amount = 350 }; { Resource = "science"; Amount = 200000 } ]
      Effects = [ ("hutPriceRatio", -0.25) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- eludiumHuts ---- *)
    { Name = "eludiumHuts"
      Label = "Eludium Huts"
      Description = "Hut price ratio reduced by 10%"
      Prices = [ { Resource = "science"; Amount = 275000 }; { Resource = "eludium"; Amount = 125 } ]
      Effects = [ ("hutPriceRatio", -0.1) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- silos ---- *)
    { Name = "silos"
      Label = "Silos"
      Description = "Warehouses can now store catnip | Flavor: With carpeting and climbing holds of course"
      Prices = [ { Resource = "science"; Amount = 50000 }; { Resource = "steel"; Amount = 125 }; { Resource = "blueprint"; Amount = 5 } ]
      Effects = [  ]
      Unlocks = [ ("upgrades", [ "titaniumWarehouses" ]) ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- refrigeration ---- *)
    { Name = "refrigeration"
      Label = "Refrigeration"
      Description = "Expands catnip limit by 75%"
      Prices = [ { Resource = "titanium"; Amount = 2500 }; { Resource = "science"; Amount = 125000 }; { Resource = "blueprint"; Amount = 15 } ]
      Effects = [ ("catnipMaxRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- compositeBow ---- *)
    { Name = "compositeBow"
      Label = "Composite Bow"
      Description = "An improved version of a bow which provides a +50% boost to catpower production"
      Prices = [ { Resource = "wood"; Amount = 200 }; { Resource = "iron"; Amount = 100 }; { Resource = "science"; Amount = 500 } ]
      Effects = [ ("manpowerJobRatio", 0.5); ("manpowerMax", 0); ("explorerAtk", 5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- crossbow ---- *)
    { Name = "crossbow"
      Label = "Crossbow"
      Description = "An improved version of a bow which provides a +25% boost to catpower production"
      Prices = [ { Resource = "iron"; Amount = 1500 }; { Resource = "science"; Amount = 12000 } ]
      Effects = [ ("manpowerJobRatio", 0.25); ("explorerAtk", 10) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- railgun ---- *)
    { Name = "railgun"
      Label = "Railgun"
      Description = "Deadly electromagnetic weapon. +25% boost to catpower production | Flavor: Mice beware"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "science"; Amount = 150000 }; { Resource = "blueprint"; Amount = 25 } ]
      Effects = [ ("manpowerJobRatio", 0.25); ("explorerAtk", 20) ]
      Unlocks = [ ("zebraUpgrades", [ "rangefinders" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- bolas ---- *)
    { Name = "bolas"
      Label = "Bolas"
      Description = "Throwing weapon made of heavy stone weights. Hunts yield more resources. | Flavor: Weaponized yarn"
      Prices = [ { Resource = "wood"; Amount = 50 }; { Resource = "minerals"; Amount = 250 }; { Resource = "science"; Amount = 1000 } ]
      Effects = [ ("hunterRatio", 1); ("explorerAtk", 2); ("manpowerMax", 0) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- huntingArmor ---- *)
    { Name = "huntingArmor"
      Label = "Hunting Armour"
      Description = "Hunts yield more resources. | Flavor: At least they are wearing something..."
      Prices = [ { Resource = "iron"; Amount = 750 }; { Resource = "science"; Amount = 2000 } ]
      Effects = [ ("hunterRatio", 2); ("explorerDef", 2); ("manpowerMax", 0) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- steelArmor ---- *)
    { Name = "steelArmor"
      Label = "Steel Armour"
      Description = "Hunts yield more resources."
      Prices = [ { Resource = "science"; Amount = 10000 }; { Resource = "steel"; Amount = 50 } ]
      Effects = [ ("hunterRatio", 0.5); ("explorerDef", 5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- alloyArmor ---- *)
    { Name = "alloyArmor"
      Label = "Alloy Armour"
      Description = "Hunts yield more resources."
      Prices = [ { Resource = "science"; Amount = 50000 }; { Resource = "alloy"; Amount = 25 } ]
      Effects = [ ("hunterRatio", 0.5); ("explorerDef", 10) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- nanosuits ---- *)
    { Name = "nanosuits"
      Label = "Nanosuits"
      Description = "Maximum catpower!"
      Prices = [ { Resource = "science"; Amount = 185000 }; { Resource = "alloy"; Amount = 250 } ]
      Effects = [ ("hunterRatio", 0.5); ("explorerDef", 20) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- caravanserai ---- *)
    { Name = "caravanserai"
      Label = "Caravanserai"
      Description = "Your tradeposts have a very minor effect on race standing | Flavor: Now hiring: cuter kittens"
      Prices = [ { Resource = "gold"; Amount = 250 }; { Resource = "science"; Amount = 25000 }; { Resource = "ivory"; Amount = 10000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "tradepost" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- freightfulExchange ---- *)
    { Name = "freightfulExchange"
      Label = "Freightful Exchange"
      Description = "Spaceports automation allows their usage for increased volumes of trade. The volume increases by +50% per each"
      Prices = [ { Resource = "science"; Amount = 450000 }; { Resource = "eludium"; Amount = 100 }; { Resource = "titanium"; Amount = 1000 }; { Resource = "tanker"; Amount = 5000 } ]
      Effects = [  ]
      Unlocks = [ ("upgrades", [ "transportSuperposition" ]) ]
      Upgrades = [ ("buildings", [ "warehouse" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- transportSuperposition ---- *)
    { Name = "transportSuperposition"
      Label = "Transport Superposition"
      Description = "Spaceport trade volume is increased by another 50% | Flavor: Warning: may cause paradoxes"
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "eludium"; Amount = 1500 }; { Resource = "thorium"; Amount = 25000 }; { Resource = "tanker"; Amount = 500000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "warehouse" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- advancedRefinement ---- *)
    { Name = "advancedRefinement"
      Label = "Catnip Enrichment"
      Description = "Catnip refines twice as well | Flavor: It's all fun and games 'til someone gets pounced"
      Prices = [ { Resource = "catnip"; Amount = 5000 }; { Resource = "science"; Amount = 500 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = true; StartsUnlocked = false }
    (* ---- prospecting ---- *)
    { Name = "prospecting"
      Label = "Prospecting"
      Description = "A small amount of iron can now be directly extracted from meteors"
      Prices = [ { Resource = "minerals"; Amount = 1000 }; { Resource = "science"; Amount = 1000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- goldOre ---- *)
    { Name = "goldOre"
      Label = "Gold Ore"
      Description = "Small percentage of ore will be smelted into gold | Flavor: Shiny!"
      Prices = [ { Resource = "minerals"; Amount = 800 }; { Resource = "iron"; Amount = 100 }; { Resource = "science"; Amount = 1000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "smelter" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- geodesy ---- *)
    { Name = "geodesy"
      Label = "Geodesy"
      Description = "Geologists are more effective and can find gold. | Flavor: Gold sniffing cats"
      Prices = [ { Resource = "titanium"; Amount = 250 }; { Resource = "science"; Amount = 90000 }; { Resource = "starchart"; Amount = 500 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("jobs", [ "geologist" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- register ---- *)
    { Name = "register"
      Label = "Register"
      Description = "Leader manage jobs depending on experience."
      Prices = [ { Resource = "gold"; Amount = 10 }; { Resource = "science"; Amount = 500 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- strenghtenBuild ---- *)
    { Name = "strenghtenBuild"
      Label = "Concrete Pillars"
      Description = "Repair Barn and Warehouse cracks with concrete."
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "concrate"; Amount = 50 } ]
      Effects = [ ("barnRatio", 0.05); ("warehouseRatio", 0.05) ]
      Unlocks = [ ("upgrades", [ "concreteWarehouses"; "concreteBarns"; "concreteHuts" ]) ]
      Upgrades = [ ("buildings", [ "barn"; "warehouse"; "harbor"; "mint" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- miningDrill ---- *)
    { Name = "miningDrill"
      Label = "Mining Drill"
      Description = "Geologists are more effective"
      Prices = [ { Resource = "titanium"; Amount = 1750 }; { Resource = "science"; Amount = 100000 }; { Resource = "steel"; Amount = 750 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("jobs", [ "geologist" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unobtainiumDrill ---- *)
    { Name = "unobtainiumDrill"
      Label = "Unobtainium Drill"
      Description = "Geologists are even more effective"
      Prices = [ { Resource = "unobtainium"; Amount = 250 }; { Resource = "science"; Amount = 250000 }; { Resource = "alloy"; Amount = 1250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("jobs", [ "geologist" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- coalFurnace ---- *)
    { Name = "coalFurnace"
      Label = "Coal Furnace"
      Description = "Smelters produce coal while burning wood | Flavor: So warm... so sleepy..."
      Prices = [ { Resource = "minerals"; Amount = 5000 }; { Resource = "iron"; Amount = 2000 }; { Resource = "science"; Amount = 5000 }; { Resource = "beam"; Amount = 35 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "smelter" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- deepMining ---- *)
    { Name = "deepMining"
      Label = "Deep Mining"
      Description = "Mines will also produce coal | Flavor: Yummy Canaries!"
      Prices = [ { Resource = "iron"; Amount = 1200 }; { Resource = "science"; Amount = 5000 }; { Resource = "beam"; Amount = 50 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "mine" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- pyrolysis ---- *)
    { Name = "pyrolysis"
      Label = "Pyrolysis"
      Description = "Coal output is boosted by 20%"
      Prices = [ { Resource = "science"; Amount = 35000 }; { Resource = "compedium"; Amount = 5 } ]
      Effects = [ ("coalSuperRatio", 0.2) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- electrolyticSmelting ---- *)
    { Name = "electrolyticSmelting"
      Label = "Electrolytic Smelting"
      Description = "Smelters are twice as effective"
      Prices = [ { Resource = "titanium"; Amount = 2000 }; { Resource = "science"; Amount = 100000 } ]
      Effects = [ ("smelterRatio", 0.95) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "smelter" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- oxidation ---- *)
    { Name = "oxidation"
      Label = "Oxidation"
      Description = "Calciners produce 95% more iron and 285% more titanium."
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "steel"; Amount = 5000 } ]
      Effects = [ ("calcinerRatio", 0.95) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "calciner" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- steelPlants ---- *)
    { Name = "steelPlants"
      Label = "Steel Plants"
      Description = "10% of Calciner iron output will be converted to steel"
      Prices = [ { Resource = "titanium"; Amount = 3500 }; { Resource = "science"; Amount = 140000 }; { Resource = "gear"; Amount = 750 } ]
      Effects = [ ("calcinerSteelRatio", 0.1) ]
      Unlocks = [ ("upgrades", [ "automatedPlants" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- automatedPlants ---- *)
    { Name = "automatedPlants"
      Label = "Automated Plants"
      Description = "Steel Plants are boosted by 25% of your craft ratio"
      Prices = [ { Resource = "science"; Amount = 200000 }; { Resource = "alloy"; Amount = 750 } ]
      Effects = [ ("calcinerSteelCraftRatio", 0.25) ]
      Unlocks = [ ("upgrades", [ "nuclearPlants" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- nuclearPlants ---- *)
    { Name = "nuclearPlants"
      Label = "Nuclear Plants"
      Description = "Steel Plants are additionally boosted by 2% per Reactor"
      Prices = [ { Resource = "uranium"; Amount = 10000 }; { Resource = "science"; Amount = 250000 } ]
      Effects = [ ("calcinerSteelReactorBonus", 0.02) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- rotaryKiln ---- *)
    { Name = "rotaryKiln"
      Label = "Rotary Kiln"
      Description = "Calciners produce 75% more iron and 225% more titanium."
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "science"; Amount = 145000 }; { Resource = "gear"; Amount = 500 } ]
      Effects = [ ("calcinerRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "calciner" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- fluidizedReactors ---- *)
    { Name = "fluidizedReactors"
      Label = "Fluidized Reactors"
      Description = "Calciners produce 100% more iron and 300% more titanium."
      Prices = [ { Resource = "science"; Amount = 175000 }; { Resource = "alloy"; Amount = 200 } ]
      Effects = [ ("calcinerRatio", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "calciner" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- nuclearSmelters ---- *)
    { Name = "nuclearSmelters"
      Label = "Nuclear Smelters"
      Description = "Smelters can now produce titanium"
      Prices = [ { Resource = "uranium"; Amount = 250 }; { Resource = "science"; Amount = 165000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "smelter" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- orbitalGeodesy ---- *)
    { Name = "orbitalGeodesy"
      Label = "Orbital Geodesy"
      Description = "Quarries will now provide a small amount of uranium"
      Prices = [ { Resource = "oil"; Amount = 35000 }; { Resource = "science"; Amount = 150000 }; { Resource = "alloy"; Amount = 1000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "quarry" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- printingPress ---- *)
    { Name = "printingPress"
      Label = "Printing Press"
      Description = "Steamworks automatically print manuscripts"
      Prices = [ { Resource = "science"; Amount = 7500 }; { Resource = "gear"; Amount = 45 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "steamworks" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- offsetPress ---- *)
    { Name = "offsetPress"
      Label = "Offset Press"
      Description = "Printing press is 4 times as effective | Flavor: Paper goes in, cat pictures come out."
      Prices = [ { Resource = "oil"; Amount = 15000 }; { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "steamworks" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- photolithography ---- *)
    { Name = "photolithography"
      Label = "Photolithography"
      Description = "Printing press is 4 times as effective"
      Prices = [ { Resource = "oil"; Amount = 50000 }; { Resource = "uranium"; Amount = 250 }; { Resource = "science"; Amount = 250000 }; { Resource = "alloy"; Amount = 1250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "steamworks" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- uplink ---- *)
    { Name = "uplink"
      Label = "Uplink"
      Description = "Data Centers and Bio Labs will provide bonus to each other"
      Prices = [ { Resource = "science"; Amount = 75000 }; { Resource = "alloy"; Amount = 1750 } ]
      Effects = [ ("uplinkDCRatio", 0.01); ("uplinkLabRatio", 0.01) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library"; "biolab" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- starlink ---- *)
    { Name = "starlink"
      Label = "Starlink"
      Description = "Every Data Center will provide an additional 1% bonus to Bio Labs"
      Prices = [ { Resource = "oil"; Amount = 25000 }; { Resource = "science"; Amount = 175000 }; { Resource = "alloy"; Amount = 5000 } ]
      Effects = [ ("uplinkLabRatio", 0.01) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library"; "biolab" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- cryocomputing ---- *)
    { Name = "cryocomputing"
      Label = "Cryocomputing"
      Description = "Data Center energy consumption reduced by 50%"
      Prices = [ { Resource = "science"; Amount = 125000 }; { Resource = "eludium"; Amount = 15 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- machineLearning ---- *)
    { Name = "machineLearning"
      Label = "Machine Learning"
      Description = "Every active AI Core will increase Data Center effectiveness by 10%"
      Prices = [ { Resource = "antimatter"; Amount = 125 }; { Resource = "science"; Amount = 175000 }; { Resource = "eludium"; Amount = 25 } ]
      Effects = [ ("dataCenterAIRatio", 0.1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- factoryAutomation ---- *)
    { Name = "factoryAutomation"
      Label = "Workshop Automation"
      Description = "Once per year Steamworks will refine small quantities of craftable resources when they are at the limit | Flavor: Includes autofeeders"
      Prices = [ { Resource = "science"; Amount = 10000 }; { Resource = "gear"; Amount = 25 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- advancedAutomation ---- *)
    { Name = "advancedAutomation"
      Label = "Advanced Automation"
      Description = "Workshop Automation will be activated twice per year."
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 75 }; { Resource = "blueprint"; Amount = 25 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- pneumaticPress ---- *)
    { Name = "pneumaticPress"
      Label = "Pneumatic Press"
      Description = "Workshop automation will also convert iron to plates"
      Prices = [ { Resource = "science"; Amount = 20000 }; { Resource = "gear"; Amount = 30 }; { Resource = "blueprint"; Amount = 5 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- combustionEngine ---- *)
    { Name = "combustionEngine"
      Label = "High Pressure Engine"
      Description = "Reduces coal consumption of Steamworks by 20% | Flavor: A better mousetrap"
      Prices = [ { Resource = "science"; Amount = 20000 }; { Resource = "gear"; Amount = 25 }; { Resource = "blueprint"; Amount = 5 } ]
      Effects = [ ("coalRatioGlobalReduction", 0.2) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "steamworks" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- fuelInjectors ---- *)
    { Name = "fuelInjectors"
      Label = "Fuel Injectors"
      Description = "Reduces coal consumption of Steamworks by 20%"
      Prices = [ { Resource = "oil"; Amount = 20000 }; { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 250 } ]
      Effects = [ ("coalRatioGlobalReduction", 0.2) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "steamworks" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- factoryLogistics ---- *)
    { Name = "factoryLogistics"
      Label = "Factory Logistics"
      Description = "Factories will provide a bigger bonus to craft effectiveness"
      Prices = [ { Resource = "titanium"; Amount = 2000 }; { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "factory" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- carbonSequestration ---- *)
    { Name = "carbonSequestration"
      Label = "Carbon Sequestration"
      Description = "Use carbon sequestration to make factories be less polluting. Adds the ability to spend twice as much energy to make factories capture pollution from the atmosphere instead of creating pollution."
      Prices = [ { Resource = "titanium"; Amount = 1250 }; { Resource = "science"; Amount = 75000 }; { Resource = "gear"; Amount = 125 }; { Resource = "steel"; Amount = 4000 }; { Resource = "alloy"; Amount = 1000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "factory" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- factoryOptimization ---- *)
    { Name = "factoryOptimization"
      Label = "Factory Optimization"
      Description = "Improves Engineer's effectiveness"
      Prices = [ { Resource = "titanium"; Amount = 1250 }; { Resource = "science"; Amount = 75000 }; { Resource = "gear"; Amount = 125 } ]
      Effects = [ ("t1CraftRatio", 10); ("t2CraftRatio", 2); ("queueCap", 1) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- factoryRobotics ---- *)
    { Name = "factoryRobotics"
      Label = "Factory Robotics"
      Description = "Improves Engineer's effectiveness"
      Prices = [ { Resource = "titanium"; Amount = 2500 }; { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 250 } ]
      Effects = [ ("t1CraftRatio", 10); ("t2CraftRatio", 5); ("t3CraftRatio", 2); ("queueCap", 2) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- spaceEngineers ---- *)
    { Name = "spaceEngineers"
      Label = "Space Engineers"
      Description = "Improves Engineer's effectiveness"
      Prices = [ { Resource = "science"; Amount = 225000 }; { Resource = "alloy"; Amount = 500 } ]
      Effects = [ ("t1CraftRatio", 10); ("t2CraftRatio", 5); ("t3CraftRatio", 2); ("t4CraftRatio", 2); ("queueCap", 2) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- aiEngineers ---- *)
    { Name = "aiEngineers"
      Label = "AI Engineers"
      Description = "A holy union of feline mind and a machine"
      Prices = [ { Resource = "antimatter"; Amount = 500 }; { Resource = "science"; Amount = 35000 }; { Resource = "eludium"; Amount = 50 } ]
      Effects = [ ("t1CraftRatio", 10); ("t2CraftRatio", 5); ("t3CraftRatio", 5); ("t4CraftRatio", 2); ("t5CraftRatio", 2); ("queueCap", 3) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- chronoEngineers ---- *)
    { Name = "chronoEngineers"
      Label = "Chronoengineers"
      Description = "Improves Engineer's effectiveness and make them work during time skip"
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "timeCrystal"; Amount = 5 }; { Resource = "eludium"; Amount = 100 } ]
      Effects = [ ("t1CraftRatio", 10); ("t2CraftRatio", 5); ("t3CraftRatio", 2); ("t4CraftRatio", 2); ("t5CraftRatio", 2); ("queueCap", 3) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- spaceManufacturing ---- *)
    { Name = "spaceManufacturing"
      Label = "Space Manufacturing"
      Description = "Factories provide bonus to space production as 75% of factory craft ratio"
      Prices = [ { Resource = "titanium"; Amount = 125000 }; { Resource = "science"; Amount = 250000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "factory" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- celestialMechanics ---- *)
    { Name = "celestialMechanics"
      Label = "Celestial Mechanics"
      Description = "Celestial events and meteors will generate additional science"
      Prices = [ { Resource = "science"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- astrolabe ---- *)
    { Name = "astrolabe"
      Label = "Astrolabe"
      Description = "Improves Observatory's max science bonus by 50%"
      Prices = [ { Resource = "titanium"; Amount = 5 }; { Resource = "science"; Amount = 25000 }; { Resource = "starchart"; Amount = 75 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "observatory" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- titaniumMirrors ---- *)
    { Name = "titaniumMirrors"
      Label = "Titanium Reflectors"
      Description = "Improved telescope reflectors. Every Observatory will give 2% to Library/Data Center effectiveness. | Flavor: Did that light spot just move?"
      Prices = [ { Resource = "titanium"; Amount = 15 }; { Resource = "science"; Amount = 20000 }; { Resource = "starchart"; Amount = 20 } ]
      Effects = [ ("libraryRatio", 0.02) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unobtainiumReflectors ---- *)
    { Name = "unobtainiumReflectors"
      Label = "Unobtainium Reflectors"
      Description = "Improved telescope reflectors. Every Observatory will give an additional 2% to Library/Data Center effectiveness."
      Prices = [ { Resource = "unobtainium"; Amount = 75 }; { Resource = "science"; Amount = 250000 }; { Resource = "starchart"; Amount = 750 } ]
      Effects = [ ("libraryRatio", 0.02) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- eludiumReflectors ---- *)
    { Name = "eludiumReflectors"
      Label = "Eludium Reflectors"
      Description = "Improved telescope reflectors. Every Observatory will give an additional 2% to Library/Data Center effectiveness."
      Prices = [ { Resource = "science"; Amount = 250000 }; { Resource = "eludium"; Amount = 15 } ]
      Effects = [ ("libraryRatio", 0.02) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "library" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- hydroPlantTurbines ---- *)
    { Name = "hydroPlantTurbines"
      Label = "Hydro Plant Turbines"
      Description = "Unobtainium-based turbines. Hydro Plants are 15% more effective."
      Prices = [ { Resource = "unobtainium"; Amount = 125 }; { Resource = "science"; Amount = 250000 } ]
      Effects = [ ("hydroPlantRatio", 0.15) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "aqueduct" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- amBases ---- *)
    { Name = "amBases"
      Label = "Antimatter Bases"
      Description = "Reduce energy consumption for Moon Bases by 50%"
      Prices = [ { Resource = "antimatter"; Amount = 250 }; { Resource = "eludium"; Amount = 15 } ]
      Effects = [  ]
      Unlocks = [ ("upgrades", [ "aiBases" ]) ]
      Upgrades = [ ("spaceBuilding", [ "moonBase" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- aiBases ---- *)
    { Name = "aiBases"
      Label = "AI Bases"
      Description = "AI-powered logistics. Every active AI Core will increase the effectiveness of Moon Bases by 10%"
      Prices = [ { Resource = "antimatter"; Amount = 7500 }; { Resource = "science"; Amount = 750000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "moonBase" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- amFission ---- *)
    { Name = "amFission"
      Label = "Antimatter Fission"
      Description = "Engineers are 25% more effective at production of eludium"
      Prices = [ { Resource = "antimatter"; Amount = 175 }; { Resource = "science"; Amount = 525000 }; { Resource = "thorium"; Amount = 7500 } ]
      Effects = [ ("eludiumAutomationBonus", 0.25) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- amReactors ---- *)
    { Name = "amReactors"
      Label = "Antimatter Reactors"
      Description = "Your Research Vessels and Space Beacons are 95% more effective"
      Prices = [ { Resource = "antimatter"; Amount = 750 }; { Resource = "eludium"; Amount = 35 } ]
      Effects = [ ("spaceScienceRatio", 0.95) ]
      Unlocks = [ ("upgrades", [ "amReactorsMK2" ]) ]
      Upgrades = [ ("spaceBuilding", [ "researchVessel"; "spaceBeacon" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- amReactorsMK2 ---- *)
    { Name = "amReactorsMK2"
      Label = "Advanced AM Reactors"
      Description = "Your Research Vessels and Space Beacons are ~77% more effective"
      Prices = [ { Resource = "antimatter"; Amount = 1750 }; { Resource = "eludium"; Amount = 70 } ]
      Effects = [ ("spaceScienceRatio", 1.5) ]
      Unlocks = [ ("upgrades", [ "voidReactors" ]) ]
      Upgrades = [ ("spaceBuilding", [ "researchVessel"; "spaceBeacon" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- voidReactors ---- *)
    { Name = "voidReactors"
      Label = "Void Reactors"
      Description = "Your Research Vessels are ~116% more effective"
      Prices = [ { Resource = "antimatter"; Amount = 2500 }; { Resource = "void"; Amount = 250 } ]
      Effects = [ ("spaceScienceRatio", 4) ]
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "researchVessel"; "spaceBeacon" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- relicStation ---- *)
    { Name = "relicStation"
      Label = "Relic Station"
      Description = "Upgrade Space Beacons with Relic research stations. Every Relic Station will reverse engineer relics yelding 0.01 relic per day"
      Prices = [ { Resource = "antimatter"; Amount = 5000 }; { Resource = "eludium"; Amount = 100 } ]
      Effects = [ ("beaconRelicsPerDay", 0.01) ]
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "spaceBeacon" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- amDrive ---- *)
    { Name = "amDrive"
      Label = "Antimatter Drive"
      Description = "Antimatter-powered rocket engine"
      Prices = [ { Resource = "antimatter"; Amount = 125 }; { Resource = "science"; Amount = 450000 } ]
      Effects = [ ("routeSpeed", 25) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- pumpjack ---- *)
    { Name = "pumpjack"
      Label = "Pumpjack"
      Description = "Improves effectiveness of Oil Wells by 45%. Every Oil Well will consume 1Wt/t."
      Prices = [ { Resource = "titanium"; Amount = 250 }; { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 125 } ]
      Effects = [ ("oilWellRatio", 0.45) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "oilWell" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- petri ---- *)
    { Name = "petri"
      Label = "Petri Dishes"
      Description = "Each Biolab slightly improves compendia craft ratio"
      Prices = [ { Resource = "plastic"; Amount = 250 }; { Resource = "science"; Amount = 65000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "biolab" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- biofuel ---- *)
    { Name = "biofuel"
      Label = "Biofuel Processing"
      Description = "Bio Labs will convert catnip into oil. Every Bio Lab will consume 1Wt/t."
      Prices = [ { Resource = "titanium"; Amount = 1250 }; { Resource = "science"; Amount = 150000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "biolab" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- unicornSelection ---- *)
    { Name = "unicornSelection"
      Label = "Unicorn Selection"
      Description = "Improves Unicorn Pasture effectiveness by 25%"
      Prices = [ { Resource = "titanium"; Amount = 1500 }; { Resource = "science"; Amount = 175000 } ]
      Effects = [ ("unicornsGlobalRatio", 0.25); ("unicornsMaxRatio", 0) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- gmo ---- *)
    { Name = "gmo"
      Label = "GM Catnip"
      Description = "Genetically modified catnip that will improve Bio Lab oil yield by 60%"
      Prices = [ { Resource = "catnip"; Amount = 1000000 }; { Resource = "titanium"; Amount = 1500 }; { Resource = "science"; Amount = 175000 } ]
      Effects = [ ("biofuelRatio", 0.6) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "biolab" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- cadSystems ---- *)
    { Name = "cadSystems"
      Label = "CAD System"
      Description = "All scientific buildings will improve effectiveness of blueprint crafting"
      Prices = [ { Resource = "titanium"; Amount = 750 }; { Resource = "science"; Amount = 125000 } ]
      Effects = [ ("cadBlueprintCraftRatio", 0.01) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- seti ---- *)
    { Name = "seti"
      Label = "SETI"
      Description = "A large array of electronic telescopes. Makes astronomical events automatic and silent"
      Prices = [ { Resource = "titanium"; Amount = 250 }; { Resource = "science"; Amount = 125000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = true; StartsUnlocked = false }
    (* ---- logistics ---- *)
    { Name = "logistics"
      Label = "Logistics"
      Description = "Kitten skills are 15% more effective"
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "gear"; Amount = 100 }; { Resource = "scaffold"; Amount = 1000 } ]
      Effects = [ ("skillMultiplier", 0.15) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- augumentation ---- *)
    { Name = "augumentation"
      Label = "Augmentations"
      Description = "Kitten skills are 100% more effective"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "uranium"; Amount = 50 }; { Resource = "science"; Amount = 150000 } ]
      Effects = [ ("skillMultiplier", 1) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- internet ---- *)
    { Name = "internet"
      Label = "Telecommunication"
      Description = "Kittens learn skills with each other"
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "uranium"; Amount = 50 }; { Resource = "science"; Amount = 150000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- neuralNetworks ---- *)
    { Name = "neuralNetworks"
      Label = "Neural Networks"
      Description = "Doubles Engineer effectiveness. Kittens learn from the noosphere."
      Prices = [ { Resource = "titanium"; Amount = 7500 }; { Resource = "science"; Amount = 200000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "factory" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- assistance ---- *)
    { Name = "assistance"
      Label = "Robotic Assistance"
      Description = "Factory robots automating routine tasks. Workers require less catnip."
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "steel"; Amount = 10000 }; { Resource = "gear"; Amount = 250 } ]
      Effects = [ ("catnipDemandWorkerRatioGlobal", -0.25) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- enrichedUranium ---- *)
    { Name = "enrichedUranium"
      Label = "Enriched Uranium"
      Description = "Reduce uranium consumption of reactors by 25%"
      Prices = [ { Resource = "titanium"; Amount = 7500 }; { Resource = "uranium"; Amount = 150 }; { Resource = "science"; Amount = 175000 } ]
      Effects = [ ("uraniumRatio", 0.25) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "reactor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- coldFusion ---- *)
    { Name = "coldFusion"
      Label = "Cold Fusion"
      Description = "Increase Reactors energy output by 25%"
      Prices = [ { Resource = "science"; Amount = 200000 }; { Resource = "eludium"; Amount = 25 } ]
      Effects = [ ("reactorEnergyRatio", 0.25) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "reactor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- thoriumReactors ---- *)
    { Name = "thoriumReactors"
      Label = "Thorium Reactors"
      Description = "Increase Reactors energy output by 25% by the addition of thorium"
      Prices = [ { Resource = "science"; Amount = 400000 }; { Resource = "thorium"; Amount = 10000 } ]
      Effects = [ ("reactorThoriumPerTick", -0.05); ("reactorEnergyRatio", 0.25) ]
      Unlocks = [ ("upgrades", [ "enrichedThorium" ]) ]
      Upgrades = [ ("buildings", [ "reactor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- enrichedThorium ---- *)
    { Name = "enrichedThorium"
      Label = "Enriched Thorium"
      Description = "Reactors will now consume 25% less thorium"
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "thorium"; Amount = 12500 } ]
      Effects = [ ("reactorThoriumPerTick", 0.0125) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "reactor" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- hubbleTelescope ---- *)
    { Name = "hubbleTelescope"
      Label = "Hubble Space Telescope"
      Description = "Improves starchart production by 30%"
      Prices = [ { Resource = "oil"; Amount = 50000 }; { Resource = "science"; Amount = 250000 }; { Resource = "alloy"; Amount = 1250 } ]
      Effects = [ ("starchartGlobalRatio", 0.30) ]
      Unlocks = [ ("upgrades", [ "satnav" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- satnav ---- *)
    { Name = "satnav"
      Label = "Satellite Navigation"
      Description = "Every satellite reduce starchart requirement of ships by 1.25%"
      Prices = [ { Resource = "science"; Amount = 200000 }; { Resource = "alloy"; Amount = 750 } ]
      Effects = [ ("satnavRatio", 0.0125) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- satelliteRadio ---- *)
    { Name = "satelliteRadio"
      Label = "Satellite Radio"
      Description = "Every Satellite will boost the effect of Broadcast Towers by 0.5%"
      Prices = [ { Resource = "science"; Amount = 225000 }; { Resource = "alloy"; Amount = 5000 } ]
      Effects = [ ("broadcastTowerRatio", 0.005) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- astrophysicists ---- *)
    { Name = "astrophysicists"
      Label = "Astrophysicists"
      Description = "Each scholar will now generate starcharts."
      Prices = [ { Resource = "unobtainium"; Amount = 350 }; { Resource = "science"; Amount = 250000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("jobs", [ "scholar" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- mWReactor ---- *)
    { Name = "mWReactor"
      Label = "Microwarp Reactors"
      Description = "A new eludium-based reactor for Lunar Outposts. Unobtainium production is 75% more effective."
      Prices = [ { Resource = "science"; Amount = 150000 }; { Resource = "eludium"; Amount = 50 } ]
      Effects = [ ("lunarOutpostRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- eludiumCracker ---- *)
    { Name = "eludiumCracker"
      Label = "Planet Busters"
      Description = "Hissmeowra's output is twice as effective."
      Prices = [ { Resource = "science"; Amount = 275000 }; { Resource = "eludium"; Amount = 250 } ]
      Effects = [ ("crackerRatio", 1.0) ]
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "planetCracker" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- thoriumEngine ---- *)
    { Name = "thoriumEngine"
      Label = "Thorium Drive"
      Description = "A new rocket engine to go faster in space."
      Prices = [ { Resource = "science"; Amount = 400000 }; { Resource = "gear"; Amount = 40000 }; { Resource = "alloy"; Amount = 2000 }; { Resource = "ship"; Amount = 10000 }; { Resource = "thorium"; Amount = 100000 } ]
      Effects = [ ("routeSpeed", 50) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- spiceNavigation ---- *)
    { Name = "spiceNavigation"
      Label = "Spice Navigation"
      Description = "Unlocks Navigation Relay. Enable you to staff kittens to explore space as a crew | Flavor: A curious melange"
      Prices = [ { Resource = "science"; Amount = 350000 }; { Resource = "starchart"; Amount = 500000 } ]
      Effects = [  ]
      Unlocks = [ ("spaceBuilding", [ "navigationRelay" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- longRangeSpaceships ---- *)
    { Name = "longRangeSpaceships"
      Label = "Long-range Spaceships"
      Description = "Unlocks Space Shuttle. Need to be staffed with a crew of two kittens | Flavor: A New Frontier"
      Prices = [ { Resource = "science"; Amount = 440000 }; { Resource = "gear"; Amount = 90000 }; { Resource = "alloy"; Amount = 3500 }; { Resource = "tanker"; Amount = 500 } ]
      Effects = [  ]
      Unlocks = [ ("spaceBuilding", [ "spaceShuttle" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- oilRefinery ---- *)
    { Name = "oilRefinery"
      Label = "Oil Refinery"
      Description = "Improves effectiveness of oil wells by 35%"
      Prices = [ { Resource = "titanium"; Amount = 1250 }; { Resource = "science"; Amount = 125000 }; { Resource = "gear"; Amount = 500 } ]
      Effects = [ ("oilWellRatio", 0.35) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "oilWell" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- oilDistillation ---- *)
    { Name = "oilDistillation"
      Label = "Oil Distillation"
      Description = "Oil output is improved by 75%."
      Prices = [ { Resource = "titanium"; Amount = 5000 }; { Resource = "science"; Amount = 175000 } ]
      Effects = [ ("oilWellRatio", 0.75) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "oilWell" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- factoryProcessing ---- *)
    { Name = "factoryProcessing"
      Label = "Factory Processing"
      Description = "Every factory will increase oil refinement to kerosene effectiveness by 5%."
      Prices = [ { Resource = "titanium"; Amount = 7500 }; { Resource = "science"; Amount = 195000 }; { Resource = "concrate"; Amount = 125 } ]
      Effects = [ ("factoryRefineRatio", 0.05) ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- voidAspiration ---- *)
    { Name = "voidAspiration"
      Label = "Void Aspiration"
      Description = "Unlocks Void Hoover and Void Rifts."
      Prices = [ { Resource = "antimatter"; Amount = 2000 }; { Resource = "timeCrystal"; Amount = 15 } ]
      Effects = [  ]
      Unlocks = [ ("voidSpace", [ "voidHoover"; "voidRift" ]) ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- distorsion ---- *)
    { Name = "distorsion"
      Label = "Distortion"
      Description = "Improve Chronocontrol effectiveness."
      Prices = [ { Resource = "antimatter"; Amount = 2000 }; { Resource = "science"; Amount = 300000 }; { Resource = "timeCrystal"; Amount = 25 }; { Resource = "void"; Amount = 1000 } ]
      Effects = [ ("temporalParadoxDayBonus", 2) ]
      Unlocks = [  ]
      Upgrades = [ ("voidSpace", [ "chronocontrol" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- turnSmoothly ---- *)
    { Name = "turnSmoothly"
      Label = "Chronosurge"
      Description = "Chronospheres will now generate temporal flux."
      Prices = [ { Resource = "unobtainium"; Amount = 100000 }; { Resource = "temporalFlux"; Amount = 6500 }; { Resource = "timeCrystal"; Amount = 25 }; { Resource = "void"; Amount = 750 } ]
      Effects = [ ("temporalFluxProductionChronosphere", 1) ]
      Unlocks = [  ]
      Upgrades = [ ("buildings", [ "chronosphere" ]) ]
      HasHandler = false; StartsUnlocked = false }
    (* ---- invisibleBlackHand ---- *)
    { Name = "invisibleBlackHand"
      Label = "Invisible Black Hand"
      Description = "The Invisible Black Hand (not related to the Invisible Pink Unicorn) is leading the blackcoin market: usually smoothly, but it can punch the market in the face if angry"
      Prices = [ { Resource = "temporalFlux"; Amount = 4096 }; { Resource = "timeCrystal"; Amount = 128 }; { Resource = "void"; Amount = 32 }; { Resource = "blackcoin"; Amount = 64 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      HasHandler = false; StartsUnlocked = false }
]

let workshopCrafts : WorkshopCraft list = [
    (* ---- wood ---- *)
    { Name = "wood"; Label = "Refine Catnip"; Description = "A sturdy block of catnip wood. Difficult to process, but great building material.";
      Prices = [ { Resource = "catnip"; Amount = 100 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- beam ---- *)
    { Name = "beam"; Label = "Wooden Beam"; Description = "Simple support structure made of a wood. Required for advanced construction.";
      Prices = [ { Resource = "wood"; Amount = 175 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- slab ---- *)
    { Name = "slab"; Label = "Stone Slab"; Description = "A small slab composed of minerals. Required for advanced construction.";
      Prices = [ { Resource = "minerals"; Amount = 250 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- plate ---- *)
    { Name = "plate"; Label = "Metal Plate"; Description = "A metal plate. Required for advanced construction.";
      Prices = [ { Resource = "iron"; Amount = 125 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- steel ---- *)
    { Name = "steel"; Label = "Steel"; Description = "A durable metal made by smelting iron and coal. Required for construction of gears and complex machinery.";
      Prices = [ { Resource = "coal"; Amount = 100 }; { Resource = "iron"; Amount = 100 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- concrate ---- *)
    { Name = "concrate"; Label = "Concrete"; Description = "A block of reinforced concrete.";
      Prices = [ { Resource = "slab"; Amount = 2500 }; { Resource = "steel"; Amount = 25 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- gear ---- *)
    { Name = "gear"; Label = "Gear"; Description = "An integral part of automated structures.";
      Prices = [ { Resource = "steel"; Amount = 15 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- alloy ---- *)
    { Name = "alloy"; Label = "Alloy"; Description = "A durable alloy of steel and titanium. Required for advanced buildings and upgrades.";
      Prices = [ { Resource = "titanium"; Amount = 10 }; { Resource = "steel"; Amount = 75 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- eludium ---- *)
    { Name = "eludium"; Label = "Eludium"; Description = "Extremely rare and expensive alloy of unobtanium and titanium.";
      Prices = [ { Resource = "unobtainium"; Amount = 1000 }; { Resource = "alloy"; Amount = 2500 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- scaffold ---- *)
    { Name = "scaffold"; Label = "Scaffold"; Description = "A large structure made of wood beams required for construction of very complex buildings and objects";
      Prices = [ { Resource = "beam"; Amount = 50 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- ship ---- *)
    { Name = "ship"; Label = "Trade Ship"; Description = "Ships can be used to discover new civilisations. May improve chances of getting certain rare resources";
      Prices = [ { Resource = "starchart"; Amount = 25 }; { Resource = "plate"; Amount = 150 }; { Resource = "scaffold"; Amount = 100 } ];
      Upgrades = [ ("buildings", [ "harbor" ]) ];
      StartsUnlocked = false }
    (* ---- tanker ---- *)
    { Name = "tanker"; Label = "Tanker"; Description = "Increase maximum oil capacity by 500";
      Prices = [ { Resource = "alloy"; Amount = 1250 }; { Resource = "ship"; Amount = 200 }; { Resource = "blueprint"; Amount = 5 } ];
      Upgrades = [ ("buildings", [ "harbor" ]) ];
      StartsUnlocked = false }
    (* ---- parchment ---- *)
    { Name = "parchment"; Label = "Parchment"; Description = "A material for writing on made from animal skin, required for cultural buildings.";
      Prices = [ { Resource = "furs"; Amount = 175 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- manuscript ---- *)
    { Name = "manuscript"; Label = "Manuscript"; Description = "Written document required for technological advancement. Every manuscript will give a minor bonus to a maximum culture (this effect has a diminishing return)";
      Prices = [ { Resource = "culture"; Amount = 400 }; { Resource = "parchment"; Amount = 25 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- compedium ---- *)
    { Name = "compedium"; Label = "Compendium"; Description = "A sum of all modern knowledge of catkind. Every compendium will give +10 to max science. (This bonus can't be greater than max science from your buildings)";
      Prices = [ { Resource = "science"; Amount = 9000 }; { Resource = "manuscript"; Amount = 55 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- blueprint ---- *)
    { Name = "blueprint"; Label = "Blueprint"; Description = "Strange piece of paper with blue lines.";
      Prices = [ { Resource = "science"; Amount = 25000 }; { Resource = "compedium"; Amount = 25 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- thorium ---- *)
    { Name = "thorium"; Label = "Thorium"; Description = "A highly radioactive and unstable fuel";
      Prices = [ { Resource = "uranium"; Amount = 250 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- megalith ---- *)
    { Name = "megalith"; Label = "Megalith"; Description = "A massive block that can be used to construct enormous structures";
      Prices = [ { Resource = "beam"; Amount = 25 }; { Resource = "slab"; Amount = 50 }; { Resource = "plate"; Amount = 5 } ];
      Upgrades = [  ];
      StartsUnlocked = true }
    (* ---- bloodstone ---- *)
    { Name = "bloodstone"; Label = "Bloodstone"; Description = "A strange jewelry claimed to be made of time and a blood of elder gods";
      Prices = [ { Resource = "timeCrystal"; Amount = 5000 }; { Resource = "relic"; Amount = 10000 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
    (* ---- tMythril ---- *)
    { Name = "tMythril"; Label = "T-Mythril"; Description = "T-Mythril (tbd)";
      Prices = [ { Resource = "bloodstone"; Amount = 5 }; { Resource = "ivory"; Amount = 1000 }; { Resource = "titanium"; Amount = 500 } ];
      Upgrades = [  ];
      StartsUnlocked = false }
]
(* ---- DISCREPANCIES FOUND (orig truth vs this spec) ----
   upgrades+crafts/<file-level>.entityCount: spec=162 orig=166
   missing/<file-level>.upgrade:alicornStable: spec=absent orig=present
   missing/<file-level>.craft:kerosene: spec=absent orig=present
   missing/<file-level>.craft:plastic: spec=absent orig=present
   missing/<file-level>.craft:microchip: spec=absent orig=present
   ---- END DISCREPANCIES ---- *)
