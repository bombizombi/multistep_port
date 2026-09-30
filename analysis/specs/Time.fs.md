(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Time upgrades + void upgrades (time.js, void.js) - auto-extracted from the original JS. *)
(* Sources: *)
(*   chronoforgeUpgrades (time.js TimeManager, ~line 315): 8 chronoforge buildings *)
(*   voidspaceUpgrades   (time.js TimeManager, ~line 531): 6 void-space upgrades *)
(*   voidUpgrades        (void.js VoidManager, ~line 33): 1 void upgrade *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Counts: chronoforgeUpgrades=8; voidspaceUpgrades=6; voidUpgrades=1. *)
(* All labels/descriptions/flavors resolved; no fallbacks needed. *)
(* Field notes (verbatim JS semantics, kept as comments per entry, NOT in the record types): *)
(*   priceRatio: scaling per purchase (controlledDelay 1.0 affordable scaling, temporalImpedance 1.05, *)
(*     temporalPress dynamic max(1.01, 1.1-1000Years.on*0.001), ressourceRetrieval 1.3, rest 1.25). *)
(*   limitBuild: hard build caps (controlledDelay 25, ressourceRetrieval 100, cryochambers/usedCryochambers 0 *)
(*     in JS - cryochambers recalculated per tick, usedCryochambers uncapped in practice). *)
(*   unlocks/upgrades: game.unlock() visibility targets / game.upgrade() effect-recalc targets. *)
(*   Static `effects` below are the literal JS defaults; calculateEffects/action compute real values *)
(*   at runtime (summarized in comments only). BlastFurnace/controlledDelay/temporalAccelerator descs *)
(*   are desc+"<br>"+desc2 concatenations in JS. Ressource keeps its JS spelling [sic]. *)

type ChronoUpgrade = { Name: string; Label: string; Description: string; Prices: Price list; FixPrices: Price list; Effects: (string * float) list; PriceRatio: float; LimitBuild: int option; StartsUnlocked: bool; Unlocks: (string * string list) list; Upgrades: (string * string list) list }
type VoidUpgrade = { Name: string; Label: string; Description: string; Prices: Price list }

let chronoforgeUpgrades : ChronoUpgrade list = [
    (* ---- temporalBattery ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=true. No action/calculateEffects in JS. *)
    { Name = "temporalBattery"
      Label = "Temporal Battery"
      Description = "Improves your flux energy capacity by 25%"
      Prices = [ { Resource = "timeCrystal"; Amount = 5 } ]
      FixPrices = [  ]
      Effects = [ ("temporalFluxMax", 750) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = true
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- blastFurnace ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=true. desc = desc + <br> + desc2. Has action: automation shatters (up to 5, more with temporalPress fast-shatter boost) at heat>=100, sets controlledDelay delayTicks. heatMax = 100 + heatMaxExpansion. isAutomationEnabled=false, heat=0, on=0. *)
    { Name = "blastFurnace"
      Label = "Chrono Furnace"
      Description = "Operates on chronoheat. Increases the maximum heat limit by 100.<br>Automation skips one year into the future for each 100% of fuel consumed."
      Prices = [ { Resource = "timeCrystal"; Amount = 25 }; { Resource = "relic"; Amount = 5 } ]
      FixPrices = [  ]
      Effects = [ ("heatPerTick", 0.02); ("heatMax", 100) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = true
      Unlocks = [ ("upgrades", [ "tachyonModerator" ]); ("chronoforge", [ "timeBoiler" ]) ]
      Upgrades = [  ] }
    (* ---- timeBoiler ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=false. Has action/updateEffects: heatMaxExpansion = 10*on, energyConsumption = on. *)
    { Name = "timeBoiler"
      Label = "Time Boiler"
      Description = "Expands the heat capacity of Chrono Furnaces."
      Prices = [ { Resource = "timeCrystal"; Amount = 25000 } ]
      FixPrices = [  ]
      Effects = [ ("heatMaxExpansion", 10); ("energyConsumption", 1) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [ ("chronoforge", [ "blastFurnace" ]) ] }
    (* ---- controlledDelay ---- *)
    (* priceRatio 1; limitBuild 25; unlocked=false. desc = desc + <br> + desc2. delayTicks=0, isAutomationEnabled=false. Has calculateEffects (null-guard only); automation toggle has no gameplay effect per desc2. *)
    { Name = "controlledDelay"
      Label = "Controlled Delay"
      Description = "Each one makes the Chrono Furnace wait 0.2 seconds before firing again.<br>Toggling automation has no gameplay effect."
      Prices = [ { Resource = "timeCrystal"; Amount = 1 }; { Resource = "gear"; Amount = 10 } ]
      FixPrices = [  ]
      Effects = [ ("energyConsumption", 0.75) ]
      PriceRatio = 1
      LimitBuild = Some 25
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- temporalAccelerator ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=true. desc = desc + <br> + desc2. isAutomationEnabled=null default. calculateEffects: sets game.time.testShatter = automation?1:0; automation decreases shatter lag. *)
    { Name = "temporalAccelerator"
      Label = "Temporal Accelerator"
      Description = "Improves time-related effects by 5%<br>Automation decreases shatter lag"
      Prices = [ { Resource = "timeCrystal"; Amount = 10 }; { Resource = "relic"; Amount = 1000 } ]
      FixPrices = [  ]
      Effects = [ ("timeRatio", 0.05) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = true
      Unlocks = [  ]
      Upgrades = [ ("chronoforge", [ "temporalImpedance" ]) ] }
    (* ---- temporalImpedance ---- *)
    (* priceRatio 1.05; limitBuild none; unlocked=false. calculateEffects: timeImpedance = round(1000*(1+timeRatio)). *)
    { Name = "temporalImpedance"
      Label = "Time Impedance"
      Description = "Delay effect of Dark Future temporal penalty by 1000 years."
      Prices = [ { Resource = "timeCrystal"; Amount = 100 }; { Resource = "relic"; Amount = 250 } ]
      FixPrices = [  ]
      Effects = [ ("timeImpedance", 1000) ]
      PriceRatio = 1.05
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- ressourceRetrieval ---- *)
    (* priceRatio 1.3; limitBuild 100; unlocked=false. NOTE: JS name is "ressourceRetrieval" [sic]. *)
    { Name = "ressourceRetrieval"
      Label = "Resource Retrieval"
      Description = "Retrieve part of your yearly resources when you burn TC"
      Prices = [ { Resource = "timeCrystal"; Amount = 1000 } ]
      FixPrices = [  ]
      Effects = [ ("shatterTCGain", 0.01) ]
      PriceRatio = 1.3
      LimitBuild = Some 100
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- temporalPress ---- *)
    (* priceRatio 1.1; limitBuild none; unlocked=false. isAutomationEnabled=null until 1000Years challenge>=2 or blazar TU>2, then automation toggle appears (desc += automation suffix). calculateEffects: shatterYearBoost = yearsPerCycle (x5 if automated); priceRatio = max(1.01, 1.1 - 1000Years.on*0.001). *)
    { Name = "temporalPress"
      Label = "Temporal Press"
      Description = "Allows for fine tuning of shattering"
      Prices = [ { Resource = "timeCrystal"; Amount = 100 }; { Resource = "void"; Amount = 10 } ]
      FixPrices = [  ]
      Effects = [ ("shatterYearBoost", 0); ("energyConsumption", 5) ]
      PriceRatio = 1.1
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
]

let voidspaceUpgrades : ChronoUpgrade list = [
    (* ---- cryochambers ---- *)
    (* priceRatio 1.25; limitBuild 0; unlocked=false; flavor "Board for the past"; limitBuild=0 in JS, recalculated each tick: chronosphere.on + cryochamberSupport; on = min(val, limitBuild). breakIronWill=true. calculateEffects recaps on.. *)
    { Name = "cryochambers"
      Label = "Cryochamber"
      Description = "Will preserve one kitten after the reset.<br>You can have one Cryochamber per Chronosphere"
      Prices = [ { Resource = "karma"; Amount = 1 }; { Resource = "timeCrystal"; Amount = 2 }; { Resource = "void"; Amount = 100 } ]
      FixPrices = [  ]
      Effects = [ ("maxKittens", 1) ]
      PriceRatio = 1.25
      LimitBuild = Some 0
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [ ("voidSpace", [ "cryochambers" ]) ] }
    (* ---- usedCryochambers ---- *)
    (* priceRatio 1.25; limitBuild 0; unlocked=false; Prices [] (empty in JS); fixPrices shown separately (used by the shatter UI to unseal). calculateEffects unlocks voidSpace queue source while val>0.. *)
    { Name = "usedCryochambers"
      Label = "Used Cryochamber"
      Description = "Unsealed Cryochamber. Not in operating condition."
      Prices = [  ]
      FixPrices = [ { Resource = "temporalFlux"; Amount = 3000 }; { Resource = "timeCrystal"; Amount = 100 }; { Resource = "void"; Amount = 500 } ]
      Effects = [  ]
      PriceRatio = 1.25
      LimitBuild = Some 0
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- voidHoover ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=false; No calculateEffects in JS.. *)
    { Name = "voidHoover"
      Label = "Void Hoover"
      Description = "Increase the maximum of void gained per day during the Temporal Paradox"
      Prices = [ { Resource = "antimatter"; Amount = 1000 }; { Resource = "timeCrystal"; Amount = 10 }; { Resource = "void"; Amount = 250 } ]
      FixPrices = [  ]
      Effects = [ ("temporalParadoxVoid", 1) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
    (* ---- voidRift ---- *)
    (* priceRatio 1.3; limitBuild none; unlocked=false; No calculateEffects in JS.. *)
    { Name = "voidRift"
      Label = "Void Rift"
      Description = "Increase the maximum storage space by 2%"
      Prices = [ { Resource = "void"; Amount = 75 } ]
      FixPrices = [  ]
      Effects = [ ("umbraBoostRatio", 0.1); ("globalResourceRatio", 0.02) ]
      PriceRatio = 1.3
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [ ("spaceBuilding", [ "hrHarvester" ]) ] }
    (* ---- chronocontrol ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=false; unlockScheme { name: vintage, threshold: 1 }; unlockScheme { name: vintage, threshold: 1 }. calculateEffects: temporalParadoxDay = 1 + temporalParadoxDayBonus.. *)
    { Name = "chronocontrol"
      Label = "Chronocontrol"
      Description = "Increase the duration of Temporal Paradox"
      Prices = [ { Resource = "temporalFlux"; Amount = 3000 }; { Resource = "timeCrystal"; Amount = 30 }; { Resource = "void"; Amount = 500 } ]
      FixPrices = [  ]
      Effects = [ ("temporalParadoxDay", 0); ("energyConsumption", 15) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [ ("upgrades", [ "turnSmoothly" ]) ]
      Upgrades = [  ] }
    (* ---- voidResonator ---- *)
    (* priceRatio 1.25; limitBuild none; unlocked=false; No calculateEffects in JS.. *)
    { Name = "voidResonator"
      Label = "Void Resonator"
      Description = "Every Void Resonator will improve Order of the Void effect by 10%. Will trigger Order of the Void on a time skip."
      Prices = [ { Resource = "timeCrystal"; Amount = 1000 }; { Resource = "relic"; Amount = 10000 }; { Resource = "void"; Amount = 50 } ]
      FixPrices = [  ]
      Effects = [ ("voidResonance", 0.1) ]
      PriceRatio = 1.25
      LimitBuild = None
      StartsUnlocked = false
      Unlocks = [  ]
      Upgrades = [  ] }
]

(* void.js VoidManager holds exactly one upgrade (no priceRatio/effects fields in JS). *)
let voidUpgrades : VoidUpgrade list = [
    { Name = "spaceCathedral"
      Label = "Space Cathedral"
      Description = "TBD."
      Prices = [ { Resource = "relic"; Amount = 1 } ] }
]

(* no discrepancies: all extracted fields match orig *)
