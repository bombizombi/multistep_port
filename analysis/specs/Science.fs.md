(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   2 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Science techs (science.js techs) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Tech visibility (exact, from science.js resetState + LibraryTab TechButtonController.updateVisible): *)
(*   resetState: calendar.unlocked=true, all others unlocked=false; researched=false everywhere. *)
(*   research(calendar) -> game.unlock(tech.unlocks): type=tech sets target.unlocked=true; *)
(*     type=buildings sets target.unlockable=true; type=upgrades/crafts set unlocked=true (workshop); *)
(*     type=jobs sets job.unlocked=true; type=tabs sets tab.visible=true; stages unlock stage. *)
(*   button visible = meta.unlocked (+hideResearched filter). NO price-ratio pre-reveal for techs. *)
(*   prices may exceed science (manuscript/compedium/unobtainium/relic/timeCrystal) - research button disabled until affordable. *)
(* brewery (1200 science, no unlocks) is dead content: NOT USED ANYMORE per source comment. *)

type ScienceTech = { Name: string; Label: string; Description: string; Prices: Price list; Unlocks: (string * string list) list; StartsUnlocked: bool }

let scienceTechs : ScienceTech list = [
    (* ---- calendar ---- *)
    { Name = "calendar"
      Label = "Calendar"
      Description = "Develops the ability to predict when the seasons will change. This ability is essential for advanced agriculture. | Effect: Calendar provides a way of more precise time tracking"
      Prices = [ { Resource = "science"; Amount = 30 } ]
      Unlocks = [ ("tabs", [ "time" ]); ("tech", [ "agriculture" ]) ]
      StartsUnlocked = true }
    (* ---- agriculture ---- *)
    { Name = "agriculture"
      Label = "Agriculture"
      Description = "The basis of all civilised life, Agriculture allows the working of land for food. Agriculture can significantly improve your food production. | Effect: Unlocks Farmers and Barns"
      Prices = [ { Resource = "science"; Amount = 100 } ]
      Unlocks = [ ("buildings", [ "barn" ]); ("jobs", [ "farmer" ]); ("tech", [ "mining"; "archery" ]); ("tabs", [ "queue" ]) ]
      StartsUnlocked = false }
    (* ---- archery ---- *)
    { Name = "archery"
      Label = "Archery"
      Description = "Ranged weaponry known as a 'Bow'. | Effect: Unlocks Hunters"
      Prices = [ { Resource = "science"; Amount = 300 } ]
      Unlocks = [ ("buildings", [ "zebraOutpost"; "zebraWorkshop"; "zebraForge" ]); ("jobs", [ "hunter" ]); ("tech", [ "animal" ]) ]
      StartsUnlocked = false }
    (* ---- mining ---- *)
    { Name = "mining"
      Label = "Mining"
      Description = "Mining develops the ability to extract mineral resources from the bowels of Cath. | Effect: You can build Mines"
      Prices = [ { Resource = "science"; Amount = 500 } ]
      Unlocks = [ ("buildings", [ "mine"; "workshop" ]); ("tech", [ "metal" ]); ("upgrades", [ "bolas" ]) ]
      StartsUnlocked = false }
    (* ---- metal ---- *)
    { Name = "metal"
      Label = "Metal Working"
      Description = "The first metal-working technology that provides your civilisation with sturdy, durable tools. | Effect: You can construct Smelters that convert ore into metal"
      Prices = [ { Resource = "science"; Amount = 900 } ]
      Unlocks = [ ("buildings", [ "smelter" ]); ("upgrades", [ "huntingArmor"; "prospecting" ]) ]
      StartsUnlocked = false }
    (* ---- animal ---- *)
    { Name = "animal"
      Label = "Animal Husbandry"
      Description = "Domestication allows access to various animal resources via the pasture. Improves your food production. | Effect: Unlocks Pastures"
      Prices = [ { Resource = "science"; Amount = 500 } ]
      Unlocks = [ ("buildings", [ "pasture"; "unicornPasture" ]); ("tech", [ "civil"; "math"; "construction" ]) ]
      StartsUnlocked = false }
    (* ---- civil ---- *)
    { Name = "civil"
      Label = "Civil Service"
      Description = "The creation of the first true state organ provides many benefits related to better management of your population. | Effect: Unlocks detailed information about your population"
      Prices = [ { Resource = "science"; Amount = 1500 } ]
      Unlocks = [ ("tech", [ "currency" ]) ]
      StartsUnlocked = false }
    (* ---- math ---- *)
    { Name = "math"
      Label = "Mathematics"
      Description = "Mathematics is the most basic building block upon which all physical science is based. Improves scientific development. | Effect: Allows construction of Academies, very efficient research buildings"
      Prices = [ { Resource = "science"; Amount = 1000 } ]
      Unlocks = [ ("tabs", [ "stats" ]); ("buildings", [ "academy" ]); ("upgrades", [ "celestialMechanics" ]) ]
      StartsUnlocked = false }
    (* ---- construction ---- *)
    { Name = "construction"
      Label = "Construction"
      Description = "Construction represents the advancement of the study of masonry, primarily by adding iron and other metals to the builder's toolbox. Benefits hunting and base infrastructure. | Effect: Allows your workers to construct the Lumber mill. Unlocks Composite Bows"
      Prices = [ { Resource = "science"; Amount = 1300 } ]
      Unlocks = [ ("buildings", [ "logHouse"; "warehouse"; "lumberMill"; "ziggurat" ]); ("tech", [ "engineering" ]); ("upgrades", [ "compositeBow"; "advancedRefinement"; "reinforcedSaw" ]) ]
      StartsUnlocked = false }
    (* ---- engineering ---- *)
    { Name = "engineering"
      Label = "Engineering"
      Description = "Engineering is the science (or art perhaps) of designing complex materials, structures, devices, and systems. | Effect: Unlocks Aqueducts"
      Prices = [ { Resource = "science"; Amount = 1500 } ]
      Unlocks = [ ("buildings", [ "aqueduct" ]); ("tech", [ "writing" ]); ("policies", [ "stripMining"; "clearCutting"; "environmentalism" ]) ]
      StartsUnlocked = false }
    (* ---- currency ---- *)
    { Name = "currency"
      Label = "Currency"
      Description = "Currency represents a certain amount of wealth. Can significantly boost your development in indirect ways. | Effect: Unlocks gold and trade"
      Prices = [ { Resource = "science"; Amount = 2200 } ]
      Unlocks = [ ("buildings", [ "tradepost" ]); ("policies", [ "diplomacy"; "isolationism" ]); ("upgrades", [ "goldOre" ]) ]
      StartsUnlocked = false }
    (* ---- writing ---- *)
    { Name = "writing"
      Label = "Writing"
      Description = "Writing is the art of recording information on material. Writing can influence general happiness and cultural progress of your civilization. | Effect: Unlocks Amphitheatres"
      Prices = [ { Resource = "science"; Amount = 3600 } ]
      Unlocks = [ ("buildings", [ "amphitheatre" ]); ("tech", [ "philosophy"; "machinery"; "steel" ]); ("policies", [ "liberty"; "tradition" ]); ("upgrades", [ "register" ]); ("crafts", [ "parchment" ]) ]
      StartsUnlocked = false }
    (* ---- philosophy ---- *)
    { Name = "philosophy"
      Label = "Philosophy"
      Description = "Philosophy is the first abstract science developed by catkind. Philosophy is a basis of spiritual and cultural progress. | Effect: Unlocks Temples"
      Prices = [ { Resource = "science"; Amount = 9500 } ]
      Unlocks = [ ("buildings", [ "temple" ]); ("tech", [ "theology" ]); ("policies", [ "stoicism"; "epicurianism" ]); ("crafts", [ "compedium" ]) ]
      StartsUnlocked = false }
    (* ---- machinery ---- *)
    { Name = "machinery"
      Label = "Machinery"
      Description = "Previous advances in metal working and science give birth to the concept of a machine, a device with multiple moving parts. Machinery introduces a concept of automation which reduces routine operations | Effect: Unlocks Steamworks, Crossbows, Printing Press and Factory Automation."
      Prices = [ { Resource = "science"; Amount = 15000 } ]
      Unlocks = [ ("buildings", [ "steamworks" ]); ("upgrades", [ "printingPress"; "factoryAutomation"; "crossbow" ]) ]
      StartsUnlocked = false }
    (* ---- steel ---- *)
    { Name = "steel"
      Label = "Steel"
      Description = "Development of the new Steel alloy advances further metal working. Benefits most of the aspects of development. | Effect: Unlocks Coal and Steel production"
      Prices = [ { Resource = "science"; Amount = 12000 } ]
      Unlocks = [ ("upgrades", [ "deepMining"; "coalFurnace"; "combustionEngine"; "reinforcedWarehouses"; "steelAxe"; "steelArmor" ]); ("crafts", [ "steel" ]) ]
      StartsUnlocked = false }
    (* ---- theology ---- *)
    { Name = "theology"
      Label = "Theology"
      Description = "Theology is the study of religion. Religion is a key concept affecting cultural, scientific and industrial development.<br>(Hint: You don't need to have all of this culture at once) | Effect: Unlocks religion"
      Prices = [ { Resource = "science"; Amount = 20000 }; { Resource = "manuscript"; Amount = 35 } ]
      Unlocks = [ ("jobs", [ "priest" ]); ("tech", [ "astronomy"; "cryptotheology" ]) ]
      StartsUnlocked = false }
    (* ---- astronomy ---- *)
    { Name = "astronomy"
      Label = "Astronomy"
      Description = "Astronomy is the study of objects in space. Improves scientific development. | Effect: Unlocks Observatory and Starcharts"
      Prices = [ { Resource = "science"; Amount = 28000 }; { Resource = "manuscript"; Amount = 65 } ]
      Unlocks = [ ("buildings", [ "observatory" ]); ("tech", [ "navigation" ]); ("policies", [ "knowledgeSharing"; "culturalExchange"; "bigStickPolicy"; "cityOnAHill" ]) ]
      StartsUnlocked = false }
    (* ---- navigation ---- *)
    { Name = "navigation"
      Label = "Navigation"
      Description = "Navigation allows serious advancements in sailing and shipbuilding technology. It should benefit economical development and can lead to discovery of new civilizations.<br>(Hint: You don't need to have all of this culture at once) | Effect: Unlocks the construction of Trade Ships and overseas trade."
      Prices = [ { Resource = "science"; Amount = 35000 }; { Resource = "manuscript"; Amount = 100 } ]
      Unlocks = [ ("buildings", [ "harbor" ]); ("tech", [ "physics"; "archeology"; "architecture" ]); ("upgrades", [ "caravanserai"; "cargoShips"; "astrolabe"; "titaniumMirrors"; "titaniumAxe" ]); ("crafts", [ "ship" ]) ]
      StartsUnlocked = false }
    (* ---- architecture ---- *)
    { Name = "architecture"
      Label = "Architecture"
      Description = "Architecture allows construction of some new sophisticated structures. | Effect: Unlocks Mints and Mansions."
      Prices = [ { Resource = "science"; Amount = 42000 }; { Resource = "compedium"; Amount = 10 } ]
      Unlocks = [ ("buildings", [ "mansion"; "mint" ]); ("tech", [ "acoustics" ]) ]
      StartsUnlocked = false }
    (* ---- physics ---- *)
    { Name = "physics"
      Label = "Physics"
      Description = "Physics is a study of laws of nature. Mostly improves your machinery effectiveness. | Effect: Unlocks some useful upgrades."
      Prices = [ { Resource = "science"; Amount = 50000 }; { Resource = "compedium"; Amount = 35 } ]
      Unlocks = [ ("tech", [ "chemistry"; "electricity"; "metaphysics" ]); ("upgrades", [ "pneumaticPress"; "pyrolysis"; "steelSaw" ]); ("crafts", [ "blueprint" ]) ]
      StartsUnlocked = false }
    (* ---- metaphysics ---- *)
    { Name = "metaphysics"
      Label = "Metaphysics"
      Description = "Metaphysics is a traditional branch of philosophy concerned with explaining the fundamental nature of being and the world that encompasses it. Absolutely useless. | Effect: Does nothing."
      Prices = [ { Resource = "unobtainium"; Amount = 5 }; { Resource = "science"; Amount = 55000 } ]
      Unlocks = [  ]
      StartsUnlocked = false }
    (* ---- chemistry ---- *)
    { Name = "chemistry"
      Label = "Chemistry"
      Description = "The discovery of Chemistry allows the deeper study and understanding of natural elements and their interaction. As a result new resources may be unlocked. | Effect: Unlocks Oil and Oil Wells."
      Prices = [ { Resource = "science"; Amount = 60000 }; { Resource = "compedium"; Amount = 50 } ]
      Unlocks = [ ("buildings", [ "calciner"; "oilWell" ]); ("upgrades", [ "alloyAxe"; "alloyArmor"; "alloyWarehouses"; "alloyBarns" ]); ("crafts", [ "alloy" ]) ]
      StartsUnlocked = false }
    (* ---- acoustics ---- *)
    { Name = "acoustics"
      Label = "Acoustics"
      Description = "Acoustics is the study of sound. Though not obviously useful, in a long run it may benefit civilizations thriving for cultural and religious development. | Effect: Unlocks Chapels"
      Prices = [ { Resource = "science"; Amount = 60000 }; { Resource = "compedium"; Amount = 60 } ]
      Unlocks = [ ("buildings", [ "chapel" ]); ("tech", [ "drama" ]) ]
      StartsUnlocked = false }
    (* ---- drama ---- *)
    { Name = "drama"
      Label = "Drama and Poetry"
      Description = "Drama and poetry are both forms of artistic expression. Improves cultural progress. | Effect: Unlocks Festivals and Cultural artifacts"
      Prices = [ { Resource = "science"; Amount = 90000 }; { Resource = "parchment"; Amount = 5000 } ]
      Unlocks = [ ("buildings", [ "brewery" ]) ]
      StartsUnlocked = false }
    (* ---- archeology ---- *)
    { Name = "archeology"
      Label = "Geology"
      Description = "Geology is the science comprising of the study of Cath, the rocks of which it is composed, and the processes by which they change. Can potentially benefit your mining industry. | Effect: Unlocks Quarries and Geologists"
      Prices = [ { Resource = "science"; Amount = 65000 }; { Resource = "compedium"; Amount = 65 } ]
      Unlocks = [ ("buildings", [ "quarry" ]); ("jobs", [ "geologist" ]); ("tech", [ "biology" ]); ("upgrades", [ "geodesy" ]); ("zebraUpgrades", [ "minerologyDepartment" ]) ]
      StartsUnlocked = false }
    (* ---- electricity ---- *)
    { Name = "electricity"
      Label = "Electricity"
      Description = "Electricity unlocks a new way to automate production, benefiting the catkind in all different areas. | Effect: Unlocks Magnetos"
      Prices = [ { Resource = "science"; Amount = 75000 }; { Resource = "compedium"; Amount = 85 } ]
      Unlocks = [ ("buildings", [ "magneto" ]); ("tech", [ "industrialization" ]) ]
      StartsUnlocked = false }
    (* ---- biology ---- *)
    { Name = "biology"
      Label = "Biology"
      Description = "Biology deals with living organisms, their characteristics and their use in our society. Improves science and chemistry industry. | Effect: Unlocks Bio Labs"
      Prices = [ { Resource = "science"; Amount = 85000 }; { Resource = "compedium"; Amount = 100 } ]
      Unlocks = [ ("buildings", [ "biolab" ]); ("crafts", [ "plastic" ]); ("upgrades", [ "petri" ]); ("tech", [ "biochemistry" ]) ]
      StartsUnlocked = false }
    (* ---- biochemistry ---- *)
    { Name = "biochemistry"
      Label = "Biochemistry"
      Description = "Improves your chemistry and biology-related technologies. | Effect: Unlocks Biofuel Processing"
      Prices = [ { Resource = "science"; Amount = 145000 }; { Resource = "compedium"; Amount = 500 } ]
      Unlocks = [ ("tech", [ "genetics" ]); ("upgrades", [ "biofuel" ]) ]
      StartsUnlocked = false }
    (* ---- genetics ---- *)
    { Name = "genetics"
      Label = "Genetics"
      Description = "Technology that further improves upon biology and chemistry. Affects your food industry. | Effect: Unlocks genetic engineering(?)"
      Prices = [ { Resource = "science"; Amount = 190000 }; { Resource = "compedium"; Amount = 1500 } ]
      Unlocks = [ ("upgrades", [ "unicornSelection"; "gmo" ]) ]
      StartsUnlocked = false }
    (* ---- industrialization ---- *)
    { Name = "industrialization"
      Label = "Industrialization"
      Description = "Industrialization represents the concept of mass-producing materials, from food products to machine parts. | Effect: Unlocks Advanced Automation and Barges"
      Prices = [ { Resource = "science"; Amount = 100000 }; { Resource = "blueprint"; Amount = 25 } ]
      Unlocks = [ ("tech", [ "mechanization"; "metalurgy"; "combustion" ]); ("upgrades", [ "barges"; "advancedAutomation"; "logistics" ]); ("policies", [ "sustainability"; "fullIndustrialization" ]) ]
      StartsUnlocked = false }
    (* ---- mechanization ---- *)
    { Name = "mechanization"
      Label = "Mechanization"
      Description = "Mechanization provides a lot of ways to automate redundant tasks; hence improving craft, oil pumps and construction technologies. | Effect: Unlocks Factories, Pumpjacks and Concrete"
      Prices = [ { Resource = "science"; Amount = 115000 }; { Resource = "blueprint"; Amount = 45 } ]
      Unlocks = [ ("buildings", [ "factory" ]); ("jobs", [ "engineer" ]); ("tech", [ "electronics" ]); ("upgrades", [ "pumpjack"; "strenghtenBuild" ]); ("crafts", [ "concrate" ]) ]
      StartsUnlocked = false }
    (* ---- metalurgy ---- *)
    { Name = "metalurgy"
      Label = "Metallurgy"
      Description = "Metallurgy improves the process of metal production, benefiting Smelters and Calciners | Effect: Unlocks Electrolytic Smelting and Oxidation"
      Prices = [ { Resource = "science"; Amount = 125000 }; { Resource = "blueprint"; Amount = 60 } ]
      Unlocks = [ ("upgrades", [ "electrolyticSmelting"; "oxidation"; "miningDrill" ]) ]
      StartsUnlocked = false }
    (* ---- combustion ---- *)
    { Name = "combustion"
      Label = "Combustion"
      Description = "Combustion provides a number of ways to improve old coal-based automation technologies, such as Steamworks. | Effect: Unlocks Offset Printing, Oil Refinery and Fuel Injection"
      Prices = [ { Resource = "science"; Amount = 115000 }; { Resource = "blueprint"; Amount = 45 } ]
      Unlocks = [ ("tech", [ "ecology" ]); ("upgrades", [ "offsetPress"; "fuelInjectors"; "oilRefinery" ]) ]
      StartsUnlocked = false }
    (* ---- ecology ---- *)
    { Name = "ecology"
      Label = "Ecology"
      Description = "Ecology is a technology primarily focused on the search for new cheap and safe energy sources. | Effect: Unlocks Solar Farms"
      Prices = [ { Resource = "science"; Amount = 125000 }; { Resource = "blueprint"; Amount = 55 } ]
      Unlocks = [  ]
      StartsUnlocked = false }
    (* ---- electronics ---- *)
    { Name = "electronics"
      Label = "Electronics"
      Description = "Electronics unlocks some high level upgrades mainly related to science | Effect: Unlocks Broadcast Towers, CAD Systems, Refrigeration and SETI"
      Prices = [ { Resource = "science"; Amount = 135000 }; { Resource = "blueprint"; Amount = 70 } ]
      Unlocks = [  ]
      StartsUnlocked = false }
    (* ---- robotics ---- *)
    { Name = "robotics"
      Label = "Robotics"
      Description = "Robotics improves automated structures like Calciners | Effect: Unlocks Steel Plants, Hydro Plants, Tankers and Rotary Kilns"
      Prices = [ { Resource = "science"; Amount = 140000 }; { Resource = "blueprint"; Amount = 80 } ]
      Unlocks = [  ]
      StartsUnlocked = false }
    (* ---- ai ---- *)
    { Name = "ai"
      Label = "Artificial Intelligence"
      Description = "Artificial Intelligence is an attempt to create a machine capable of reasoning and performing cognitive tasks. | Effect: Unlocks Neural Networks and AI Core"
      Prices = [ { Resource = "science"; Amount = 250000 }; { Resource = "blueprint"; Amount = 150 } ]
      Unlocks = [ ("buildings", [ "aiCore" ]); ("tech", [ "quantumCryptography" ]); ("upgrades", [ "neuralNetworks"; "aiEngineers"; "machineLearning" ]) ]
      StartsUnlocked = false }
    (* ---- quantumCryptography ---- *)
    { Name = "quantumCryptography"
      Label = "Quantum Cryptography"
      Description = "TBD"
      Prices = [ { Resource = "science"; Amount = 1250000 }; { Resource = "relic"; Amount = 1024 } ]
      Unlocks = [ ("tech", [ "blackchain" ]) ]
      StartsUnlocked = false }
    (* ---- blackchain ---- *)
    { Name = "blackchain"
      Label = "Blackchain"
      Description = "All cool cats are mining this, so I think it is some kind of mineral | Effect: Unlocks cryptomining and blackcoin exchange"
      Prices = [ { Resource = "science"; Amount = 5000000 }; { Resource = "relic"; Amount = 4096 } ]
      Unlocks = [ ("upgrades", [ "invisibleBlackHand" ]) ]
      StartsUnlocked = false }
    (* ---- nuclearFission ---- *)
    { Name = "nuclearFission"
      Label = "Nuclear Fission"
      Description = "Nuclear Fission unlocks Nuclear Reactors and nuclear-related upgrades | Effect: Unlocks Nuclear Reactors and Nuclear Vessel"
      Prices = [ { Resource = "science"; Amount = 150000 }; { Resource = "blueprint"; Amount = 100 } ]
      Unlocks = [ ("buildings", [ "reactor" ]); ("tech", [ "nanotechnology"; "particlePhysics" ]); ("upgrades", [ "reactorVessel"; "nuclearSmelters" ]) ]
      StartsUnlocked = false }
    (* ---- rocketry ---- *)
    { Name = "rocketry"
      Label = "Rocketry"
      Description = "Required for space exploration | Effect: Unlocks construction of spaceships and oil processing"
      Prices = [ { Resource = "science"; Amount = 175000 }; { Resource = "blueprint"; Amount = 125 } ]
      Unlocks = [ ("tabs", [ "space" ]); ("tech", [ "sattelites"; "oilProcessing" ]); ("upgrades", [ "oilDistillation" ]) ]
      StartsUnlocked = false }
    (* ---- oilProcessing ---- *)
    { Name = "oilProcessing"
      Label = "Oil Processing"
      Description = "Unlocks advanced options of oil processing | Effect: Unlocks kerosene and factory processing"
      Prices = [ { Resource = "science"; Amount = 215000 }; { Resource = "blueprint"; Amount = 150 } ]
      Unlocks = [ ("upgrades", [ "factoryProcessing" ]); ("crafts", [ "kerosene" ]) ]
      StartsUnlocked = false }
    (* ---- sattelites ---- *)
    { Name = "sattelites"
      Label = "Satellites"
      Description = "Satellites are machines that permanently orbit the planet outside its atmosphere | Effect: Unlocks deployment of Satellites"
      Prices = [ { Resource = "science"; Amount = 190000 }; { Resource = "blueprint"; Amount = 125 } ]
      Unlocks = [ ("tech", [ "orbitalEngineering" ]); ("upgrades", [ "photolithography"; "orbitalGeodesy"; "uplink"; "thinFilm" ]); ("policies", [ "outerSpaceTreaty"; "militarizeSpace" ]) ]
      StartsUnlocked = false }
    (* ---- orbitalEngineering ---- *)
    { Name = "orbitalEngineering"
      Label = "Orbital Engineering"
      Description = "Orbital Engineering allows kitten civilization to develop advanced space projects. | Effect: Unlocks Space Stations and the Hubble Telescope"
      Prices = [ { Resource = "science"; Amount = 250000 }; { Resource = "blueprint"; Amount = 250 } ]
      Unlocks = [ ("tech", [ "exogeology"; "thorium" ]); ("upgrades", [ "hubbleTelescope"; "satelliteRadio"; "astrophysicists"; "solarSatellites"; "spaceEngineers"; "starlink" ]) ]
      StartsUnlocked = false }
    (* ---- thorium ---- *)
    { Name = "thorium"
      Label = "Thorium"
      Description = "Thorium is an extremely radioactive and energy efficient isotope that can be used in various space era upgrades. | Effect: Unlocks Thorium Reactors and Thorium Engine"
      Prices = [ { Resource = "science"; Amount = 375000 }; { Resource = "blueprint"; Amount = 375 } ]
      Unlocks = [ ("upgrades", [ "thoriumReactors"; "thoriumEngine"; "qdot" ]); ("crafts", [ "thorium" ]) ]
      StartsUnlocked = false }
    (* ---- exogeology ---- *)
    { Name = "exogeology"
      Label = "Exogeology"
      Description = "Exogeology or Planetary Geology studies extraterrestrial metals and minerals. | Effect: Unlocks various Unobtainium upgrades"
      Prices = [ { Resource = "science"; Amount = 275000 }; { Resource = "blueprint"; Amount = 250 } ]
      Unlocks = [ ("tech", [ "advExogeology" ]); ("upgrades", [ "unobtainiumReflectors"; "unobtainiumHuts"; "unobtainiumDrill"; "hydroPlantTurbines"; "storageBunkers" ]) ]
      StartsUnlocked = false }
    (* ---- advExogeology ---- *)
    { Name = "advExogeology"
      Label = "Exometallurgy"
      Description = "Exometallurgy studies new methods of unobtainium processing | Effect: Unlocks Eludium and Eludium upgrades"
      Prices = [ { Resource = "science"; Amount = 325000 }; { Resource = "blueprint"; Amount = 350 } ]
      Unlocks = [ ("upgrades", [ "eludiumCracker"; "eludiumReflectors"; "eludiumHuts"; "mWReactor"; "freightfulExchange"; "eludiumDrill" ]); ("crafts", [ "eludium" ]) ]
      StartsUnlocked = false }
    (* ---- nanotechnology ---- *)
    { Name = "nanotechnology"
      Label = "Nanotechnology"
      Description = "Nanotechnology is manipulation of matter on an atomic, molecular, and sub-molecular scale. Can potentially improve your energy and resource production. | Effect: Unlocks Nanosuits, FL Reactors, Augmentations and PVC"
      Prices = [ { Resource = "science"; Amount = 200000 }; { Resource = "blueprint"; Amount = 150 } ]
      Unlocks = [ ("tech", [ "superconductors" ]); ("upgrades", [ "augumentation"; "nanosuits"; "photovoltaic"; "fluidizedReactors" ]) ]
      StartsUnlocked = false }
    (* ---- superconductors ---- *)
    { Name = "superconductors"
      Label = "Superconductors"
      Description = "Superconductors are exotic materials that help to optimize energy efficiency of different technologies | Effect: Unlocks Cold Fusion and Space Manufacturing"
      Prices = [ { Resource = "science"; Amount = 225000 }; { Resource = "blueprint"; Amount = 175 } ]
      Unlocks = [ ("tech", [ "antimatter" ]); ("upgrades", [ "coldFusion"; "spaceManufacturing"; "cryocomputing" ]) ]
      StartsUnlocked = false }
    (* ---- antimatter ---- *)
    { Name = "antimatter"
      Label = "Antimatter"
      Description = "Antimatter provides some advanced sources of energy and generally benefits scientific advancement | Effect: Unlocks Antimatter Reactors, AM-Drive, AM-Fission and Antimatter Bases"
      Prices = [ { Resource = "science"; Amount = 500000 }; { Resource = "antimatter"; Amount = 1 }; { Resource = "relic"; Amount = 1 } ]
      Unlocks = [ ("tech", [ "terraformation" ]); ("upgrades", [ "amReactors"; "amBases"; "amDrive"; "amFission" ]) ]
      StartsUnlocked = false }
    (* ---- terraformation ---- *)
    { Name = "terraformation"
      Label = "Terraformation"
      Description = "Terraformation technology focuses on use of the antimatter to change the climate of the Cath System exoplanets | Effect: Unlocks Terraforming Stations"
      Prices = [ { Resource = "science"; Amount = 750000 }; { Resource = "relic"; Amount = 5 } ]
      Unlocks = [ ("tech", [ "hydroponics" ]) ]
      StartsUnlocked = false }
    (* ---- hydroponics ---- *)
    { Name = "hydroponics"
      Label = "Hydroponics"
      Description = "A pinnacle of space engineering, hydroponic provides new sources of food supply for our distant colonies. | Effect: Unlocks Yarn Hydroponics"
      Prices = [ { Resource = "science"; Amount = 1000000 }; { Resource = "relic"; Amount = 25 } ]
      Unlocks = [ ("tech", [ "exogeophysics" ]) ]
      StartsUnlocked = false }
    (* ---- exogeophysics ---- *)
    { Name = "exogeophysics"
      Label = "Exophysics"
      Description = "A study of geophysics on a massive scale of planetary bodies | Effect: Unlocks Molten Cores"
      Prices = [ { Resource = "science"; Amount = 25000000 }; { Resource = "relic"; Amount = 500 } ]
      Unlocks = [  ]
      StartsUnlocked = false }
    (* ---- particlePhysics ---- *)
    { Name = "particlePhysics"
      Label = "Particle Physics"
      Description = "Particle physics takes us one step deeper into the understanding of the nature of matter and energy than its ancestor, Nuclear Physics | Effect: Unlocks Particle Accelerators, Railguns and Enriched Uranium"
      Prices = [ { Resource = "science"; Amount = 185000 }; { Resource = "blueprint"; Amount = 135 } ]
      Unlocks = [ ("buildings", [ "accelerator" ]); ("tech", [ "chronophysics"; "dimensionalPhysics" ]); ("upgrades", [ "enrichedUranium"; "railgun" ]) ]
      StartsUnlocked = false }
    (* ---- dimensionalPhysics ---- *)
    { Name = "dimensionalPhysics"
      Label = "Dimensional Physics"
      Description = "Dimensional Physics explores the concepts of space and time | Effect: Unlocks Energy Rifts and LHC"
      Prices = [ { Resource = "science"; Amount = 235000 } ]
      Unlocks = [ ("upgrades", [ "energyRifts"; "lhc"; "transportSuperposition" ]); ("tech", [ "artificialGravity" ]) ]
      StartsUnlocked = false }
    (* ---- artificialGravity ---- *)
    { Name = "artificialGravity"
      Label = "Artificial Gravity"
      Description = "New anti-G engines enable a new form of long-range space travel. | Effect: Unlocks Long-range Spaceship upgrade."
      Prices = [ { Resource = "science"; Amount = 320000 } ]
      Unlocks = [ ("upgrades", [ "spiceNavigation"; "longRangeSpaceships" ]) ]
      StartsUnlocked = false }
    (* ---- chronophysics ---- *)
    { Name = "chronophysics"
      Label = "Chronophysics"
      Description = "Chronophysics studies the nature of time and possibilities of temporal manipulations | Effect: Unlocks Chronospheres, Flux Reactors and Stasis Chambers"
      Prices = [ { Resource = "science"; Amount = 250000 }; { Resource = "timeCrystal"; Amount = 5 } ]
      Unlocks = [ ("buildings", [ "chronosphere"; "stasisPod" ]); ("tech", [ "tachyonTheory" ]); ("upgrades", [ "stasisChambers"; "fluxCondensator" ]) ]
      StartsUnlocked = false }
    (* ---- tachyonTheory ---- *)
    { Name = "tachyonTheory"
      Label = "Tachyon Theory"
      Description = "Tachyonic particles are hypothetical particles that always move faster than light. | Effect: Unlocks Tachyon Accelerators and Chronoforge"
      Prices = [ { Resource = "science"; Amount = 750000 }; { Resource = "timeCrystal"; Amount = 25 }; { Resource = "relic"; Amount = 1 } ]
      Unlocks = [ ("tech", [ "voidSpace" ]); ("upgrades", [ "tachyonAccelerators"; "chronoforge"; "chronoEngineers" ]) ]
      StartsUnlocked = false }
    (* ---- cryptotheology ---- *)
    { Name = "cryptotheology"
      Label = "Cryptotheology"
      Description = "Cryptotheology applies the most arcane and unorthodox methods of theology in order to answer the fundamental questions of the universe and reality. | Effect: Unlocks Relic Station and Cryptotheology tree"
      Prices = [ { Resource = "science"; Amount = 650000 }; { Resource = "relic"; Amount = 5 } ]
      Unlocks = [ ("upgrades", [ "relicStation" ]) ]
      StartsUnlocked = false }
    (* ---- voidSpace ---- *)
    { Name = "voidSpace"
      Label = "Void Space"
      Description = "Under the void | Effect: Unlocks Cryochambers"
      Prices = [ { Resource = "science"; Amount = 800000 }; { Resource = "timeCrystal"; Amount = 30 }; { Resource = "void"; Amount = 100 } ]
      Unlocks = [ ("tech", [ "paradoxalKnowledge" ]); ("upgrades", [ "voidAspiration" ]); ("voidSpace", [ "cryochambers" ]); ("challenges", [ "atheism" ]) ]
      StartsUnlocked = false }
    (* ---- paradoxalKnowledge ---- *)
    { Name = "paradoxalKnowledge"
      Label = "Paradox Theory"
      Description = "Develop a framework for understanding and controlling the time-space continuum. | Effect: Unlocks Chronocontrol and Resource Retrieval"
      Prices = [ { Resource = "science"; Amount = 1000000 }; { Resource = "timeCrystal"; Amount = 40 }; { Resource = "void"; Amount = 250 } ]
      Unlocks = [ ("upgrades", [ "distorsion" ]); ("chronoforge", [ "ressourceRetrieval" ]); ("voidSpace", [ "chronocontrol"; "voidResonator" ]) ]
      StartsUnlocked = false }
]
(* ---- DISCREPANCIES FOUND (orig truth vs this spec) ----
   techs/<file-level>.entityCount: spec=61 orig=62
   missing/<file-level>.tech:brewery: spec=absent orig=present
   ---- END DISCREPANCIES ---- *)
