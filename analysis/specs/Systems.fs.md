(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Prestige perks, challenges, achievements, badges, stats - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time; descriptions kept verbatim (no trim needed). *)
(* Perk visibility (exact, from prestige.js resetState): unlocked = defaultUnlocked (engeneering, *)
(*   diplomacy, chronomancy, carnivals, adjustmentBureau start unlocked); researched=false all. *)
(* Challenge visibility (exact, from challenges.js resetStateStackable): unlocked = defaultUnlocked *)
(*   (ironWill, winterIsComing, anarchy start unlocked); pending=false, active=false, researched=false. *)
(* Note: JS has NO "slab" challenge - only a doc-comment example mentioning slab prices. *)
(* Note: i18n challenge keys use the "challendge." prefix (sic, verbatim in en.json). *)

type PrestigePerk = { Name: string; Label: string; Description: string; Prices: Price list; Effects: (string * float) list; Unlocks: (string * string list) list; Upgrades: (string * string list) list; StartsUnlocked: bool; HasHandler: bool }

let prestigePerks : PrestigePerk list = [
    (* ---- engeneering ---- *)
    { Name = "engeneering"
      Label = "Enlightenment"
      Description = "Reduce all price ratios by 1% (The price will grow up much slower). Unlocks more price upgrades."
      Prices = [ { Resource = "paragon"; Amount = 5 } ]
      Effects = [ ("priceRatio", -0.01) ]
      Unlocks = [ ("perks", [ "megalomania"; "goldenRatio"; "codexVox" ]) ]
      Upgrades = [  ]
      StartsUnlocked = true; HasHandler = false }
    (* ---- codexVox ---- *)
    { Name = "codexVox"
      Label = "Codex Vox"
      Description = "Improves manuscript craft ratio by 25%."
      Prices = [ { Resource = "paragon"; Amount = 25 } ]
      Effects = [ ("manuscriptCraftRatio", 0.25); ("manuscriptGlobalCraftRatio", 0.05) ]
      Unlocks = [ ("perks", [ "codexLogos" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- codexLogos ---- *)
    { Name = "codexLogos"
      Label = "Codex Logos"
      Description = "Improves compendium craft ratio by 25%."
      Prices = [ { Resource = "paragon"; Amount = 50 } ]
      Effects = [ ("manuscriptGlobalCraftRatio", 0.05); ("compediumCraftRatio", 0.25); ("compediumGlobalCraftRatio", 0.05) ]
      Unlocks = [ ("perks", [ "codexAgrum"; "codexLeviathanianus" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- codexAgrum ---- *)
    { Name = "codexAgrum"
      Label = "Codex Agrum"
      Description = "Improves blueprint craft ratio by 25%."
      Prices = [ { Resource = "paragon"; Amount = 75 } ]
      Effects = [ ("manuscriptGlobalCraftRatio", 0.05); ("compediumGlobalCraftRatio", 0.05); ("blueprintCraftRatio", 0.25); ("blueprintGlobalCraftRatio", 0.05) ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- megalomania ---- *)
    { Name = "megalomania"
      Label = "Megalomania"
      Description = "Unlocks additional megastructures."
      Prices = [ { Resource = "paragon"; Amount = 10 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "blackCodex" ]); ("zigguratUpgrades", [ "marker"; "blackPyramid" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- blackCodex ---- *)
    { Name = "blackCodex"
      Label = "Black Codex"
      Description = "Unlocks unicorn graveyards."
      Prices = [ { Resource = "paragon"; Amount = 25 } ]
      Effects = [  ]
      Unlocks = [ ("zigguratUpgrades", [ "unicornGraveyard" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- codexLeviathanianus ---- *)
    { Name = "codexLeviathanianus"
      Label = "Codex Leviathanianus"
      Description = "Increases compendia cut-off limit by 5% per transcendence tier"
      Prices = [ { Resource = "paragon"; Amount = 75 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- goldenRatio ---- *)
    (* priceRatio = -(1+sqrt(5))/200 *)
    { Name = "goldenRatio"
      Label = "Golden Ratio"
      Description = "Reduce all price ratios by ~1.618%"
      Prices = [ { Resource = "paragon"; Amount = 50 } ]
      Effects = [ ("priceRatio", -0.016180339887498948); ("queueCap", 1) ]
      Unlocks = [ ("perks", [ "divineProportion" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- divineProportion ---- *)
    (* priceRatio = -16/900 *)
    { Name = "divineProportion"
      Label = "Divine Proportion"
      Description = "Reduce all price ratios by 1.7%"
      Prices = [ { Resource = "paragon"; Amount = 100 } ]
      Effects = [ ("priceRatio", -0.017777777777777778); ("queueCap", 2) ]
      Unlocks = [ ("perks", [ "vitruvianFeline" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- vitruvianFeline ---- *)
    { Name = "vitruvianFeline"
      Label = "Vitruvian Feline"
      Description = "Reduce all price ratios by 2%"
      Prices = [ { Resource = "paragon"; Amount = 250 } ]
      Effects = [ ("priceRatio", -0.02) ]
      Unlocks = [ ("perks", [ "renaissance" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- renaissance ---- *)
    { Name = "renaissance"
      Label = "Renaissance"
      Description = "Reduce all price ratios by 2.25%"
      Prices = [ { Resource = "paragon"; Amount = 750 } ]
      Effects = [ ("priceRatio", -0.0225); ("queueCap", 2) ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- diplomacy ---- *)
    (* handler unlocks relations tab *)
    { Name = "diplomacy"
      Label = "Diplomacy"
      Description = "Races will be discovered earlier and with better standing. Unlocks more trade upgrades and policies."
      Prices = [ { Resource = "paragon"; Amount = 5 } ]
      Effects = [ ("standingRatio", 0.1) ]
      Unlocks = [ ("perks", [ "zebraDiplomacy"; "ambassadors" ]) ]
      Upgrades = [ ("policies", [ "lizardRelationsEcologists" ]) ]
      StartsUnlocked = true; HasHandler = true }
    (* ---- zebraDiplomacy ---- *)
    { Name = "zebraDiplomacy"
      Label = "Zebra Diplomacy"
      Description = "Some zebras hunters will stay in the village. (You need to unlock zebra hunters first to use this upgrade)."
      Prices = [ { Resource = "paragon"; Amount = 35 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "zebraCovenant" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- zebraCovenant ---- *)
    { Name = "zebraCovenant"
      Label = "Zebra Covenant"
      Description = "More zebras will stay with you."
      Prices = [ { Resource = "paragon"; Amount = 75 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "navigationDiplomacy" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- navigationDiplomacy ---- *)
    { Name = "navigationDiplomacy"
      Label = "Navigation Diplomacy"
      Description = "Races can be discovered once you have ships."
      Prices = [ { Resource = "paragon"; Amount = 300 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- ambassadors ---- *)
    { Name = "ambassadors"
      Label = "Ambassadors"
      Description = "Unlocks the ambassador job and the ability to queue embassies."
      Prices = [ { Resource = "paragon"; Amount = 100 } ]
      Effects = [  ]
      Unlocks = [ ("jobs", [ "ambassador" ]); ("perks", [ "treaties" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- treaties ---- *)
    (* desc built by calculateEffects from embassiesPerAmbassadorSlot *)
    { Name = "treaties"
      Label = "Treaties"
      Description = ""
      Prices = [ { Resource = "paragon"; Amount = 500 } ]
      Effects = [ ("embassiesPerAmbassadorSlot", 30); ("ambassadorBoostPerRank", 0.1) ]
      Unlocks = [  ]
      Upgrades = [ ("jobs", [ "ambassador" ]) ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- chronomancy ---- *)
    { Name = "chronomancy"
      Label = "Chronomancy"
      Description = "Meteor and star events will happen faster."
      Prices = [ { Resource = "paragon"; Amount = 25 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "astromancy"; "anachronomancy"; "unicornmancy" ]) ]
      Upgrades = [  ]
      StartsUnlocked = true; HasHandler = false }
    (* ---- astromancy ---- *)
    { Name = "astromancy"
      Label = "Astromancy"
      Description = "Star events chance and Observatory effectiveness are doubled"
      Prices = [ { Resource = "paragon"; Amount = 50 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- unicornmancy ---- *)
    { Name = "unicornmancy"
      Label = "Unicornmancy"
      Description = "Unicorn rifts and ivory meteors are more frequent."
      Prices = [ { Resource = "paragon"; Amount = 125 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "alicornmancy" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- alicornmancy ---- *)
    (* reduces reliance on RNG during Unicorn Tears challenge (JS comment) *)
    { Name = "alicornmancy"
      Label = "Alicornmancy"
      Description = "Increases the chance to get your first unicorns from hunting.\nAlicorn production will start instantly once unlocked."
      Prices = [ { Resource = "paragon"; Amount = 200 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [ ("zigguratUpgrades", [ "skyPalace"; "unicornUtopia"; "sunspire" ]) ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- anachronomancy ---- *)
    { Name = "anachronomancy"
      Label = "Anachronomancy"
      Description = "Time crystals and chronophysics will be saved across resets."
      Prices = [ { Resource = "paragon"; Amount = 125 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- carnivals ---- *)
    { Name = "carnivals"
      Label = "Carnivals"
      Description = "Festivals can now stack in duration."
      Prices = [ { Resource = "paragon"; Amount = 25 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "numerology" ]) ]
      Upgrades = [  ]
      StartsUnlocked = true; HasHandler = false }
    (* ---- willenfluff ---- *)
    { Name = "willenfluff"
      Label = "Venus of Willenfluff"
      Description = "Kittens will arrive 75% faster."
      Prices = [ { Resource = "paragon"; Amount = 150 } ]
      Effects = [ ("kittenGrowthRatio", 0.75) ]
      Unlocks = [ ("perks", [ "pawgan" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- pawgan ---- *)
    { Name = "pawgan"
      Label = "Pawgan Rituals"
      Description = "Kittens will arrive an additional 150% faster."
      Prices = [ { Resource = "paragon"; Amount = 400 } ]
      Effects = [ ("kittenGrowthRatio", 1.5) ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- numerology ---- *)
    { Name = "numerology"
      Label = "Numerology"
      Description = "Certain years will have special effects."
      Prices = [ { Resource = "paragon"; Amount = 50 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "numeromancy"; "willenfluff"; "voidOrder" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- numeromancy ---- *)
    { Name = "numeromancy"
      Label = "Numeromancy"
      Description = "Certain years will have extra effects during Festivals."
      Prices = [ { Resource = "paragon"; Amount = 250 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "malkuth" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- malkuth ---- *)
    { Name = "malkuth"
      Label = "Malkuth"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 500 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "yesod" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- yesod ---- *)
    { Name = "yesod"
      Label = "Yesod"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 750 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "hod" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- hod ---- *)
    { Name = "hod"
      Label = "Hod"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 1250 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "netzach" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- netzach ---- *)
    { Name = "netzach"
      Label = "Netzach"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 1750 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "tiferet" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- tiferet ---- *)
    { Name = "tiferet"
      Label = "Tiferet"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 2500 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "gevurah" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- gevurah ---- *)
    { Name = "gevurah"
      Label = "Gevurah"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 5000 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "chesed" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- chesed ---- *)
    { Name = "chesed"
      Label = "Chesed"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 7500 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "binah" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- binah ---- *)
    { Name = "binah"
      Label = "Binah"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 15000 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "chokhmah" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- chokhmah ---- *)
    { Name = "chokhmah"
      Label = "Chokhmah"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 30000 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [ ("perks", [ "keter" ]) ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- keter ---- *)
    { Name = "keter"
      Label = "Keter"
      Description = "Improves paragon effect and scaling by 5%"
      Prices = [ { Resource = "paragon"; Amount = 60000 } ]
      Effects = [ ("paragonRatio", 0.05) ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- voidOrder ---- *)
    { Name = "voidOrder"
      Label = "Order of the Void"
      Description = "Adds 10% produced faith, which is automatically converted as worship."
      Prices = [ { Resource = "paragon"; Amount = 75 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
    (* ---- adjustmentBureau ---- *)
    { Name = "adjustmentBureau"
      Label = "Adjustment Bureau"
      Description = "Unlocks additional game challenges."
      Prices = [ { Resource = "paragon"; Amount = 5 } ]
      Effects = [  ]
      Unlocks = [ ("perks", [ "ascoh" ]); ("tabs", [ "challenges" ]) ]
      Upgrades = [  ]
      StartsUnlocked = true; HasHandler = false }
    (* ---- ascoh ---- *)
    { Name = "ascoh"
      Label = "ASCOH"
      Description = "A Secret Council Of Hats"
      Prices = [ { Resource = "paragon"; Amount = 5 } ]
      Effects = [  ]
      Unlocks = [  ]
      Upgrades = [  ]
      StartsUnlocked = false; HasHandler = false }
]

type GameChallenge = { Name: string; Label: string; Description: string; EffectDesc: string; Effects: (string * float) list; StackOptions: (string * string) list; Upgrades: (string * string list) list; Unlocks: (string * string list) list; StartsUnlocked: bool; ReserveDelay: bool; Completion: string }

let challenges : GameChallenge list = [
    (* ---- ironWill ---- *)
    (* hidden challenge: enabled by resetting without kittens; no completion condition in JS *)
    { Name = "ironWill"
      Label = "Iron Will"
      Description = "Iron Will is a bit of a hidden challenge and you don't need to click here to enable it: reset the game and play without kittens."
      EffectDesc = "Nothing"
      Effects = [  ]
      StackOptions = [  ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = true; ReserveDelay = false
      Completion = "none (hidden challenge, no checkCompletionCondition)" }
    (* ---- winterIsComing ---- *)
    (* completion checked live: game.space.getPlanet(helios).reached; active calc zeroes reward, adds coldChance 0.05 / coldHarshness -0.02 *)
    { Name = "winterIsComing"
      Label = "Winter Has Come"
      Description = "Restart the game with only winter seasons. (Catnip will not benefit from paragon production bonus)<br><br>Goal: Get to Helios."
      EffectDesc = "No more cold winters."
      Effects = [ ("springCatnipRatio", 0.05); ("summerSolarFarmRatio", 0.05); ("coldChance", 0); ("coldHarshness", 0) ]
      StackOptions = [ ("springCatnipRatio", "LDRLimit 2"); ("summerSolarFarmRatio", "LDRLimit 2"); ("coldChance", "LDRLimit 0.825"); ("coldHarshness", "LDRLimit 1") ]
      Upgrades = [ ("buildings", [ "pasture" ]) ]
      Unlocks = [  ]
      StartsUnlocked = true; ReserveDelay = false
      Completion = "live: helios reached" }
    (* ---- anarchy ---- *)
    (* completion checked live: aiCore built; active calc sets masterSkillMultiplier 0, kittenLaziness 0.5+LDR(0.05*on) *)
    { Name = "anarchy"
      Label = "Anarchy"
      Description = "Restart the game with kittens acting their own way : kittens are lazy, always eat extra catnip and can't be assigned as leaders.<br><br>Goal: Construct AI Core"
      EffectDesc = "Kittens count double for karma"
      Effects = [ ("masterSkillMultiplier", 0.2); ("kittenLaziness", 0) ]
      StackOptions = [ ("masterSkillMultiplier", "LDRLimit 4"); ("kittenLaziness", "LDRLimit 0.25 noStack") ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = true; ReserveDelay = false
      Completion = "live: aiCore built" }
    (* ---- energy ---- *)
    (* completion checked live: solar-satellite + all energy-production buildings present; active calc zeroes reward, adds energyConsumptionIncrease 0.1 *)
    { Name = "energy"
      Label = "Energy"
      Description = "Restart the game with consumption of energy multiply by 2.<br><br>Goal: Unlock all energy production buildings and build at least one of them."
      EffectDesc = "Production bonuses cuts caused by negative energy are divided by 2."
      Effects = [ ("energyConsumptionRatio", -0.02); ("energyConsumptionIncrease", 0) ]
      StackOptions = [ ("energyConsumptionRatio", "LDRLimit 1") ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = false
      Completion = "live: pasture/solarfarm + steamworks + magneto + reactor + satellite/solarSatellites + sunlifter + tectonic + hrHarvester" }
    (* ---- atheism ---- *)
    (* completion checked ON RESET: cryochamber or stasisPod on; grants ivoryTower badge when completed in ironWill; active calc applies negative caps *)
    { Name = "atheism"
      Label = "Atheism"
      Description = "Restart the game without faith bonus.<br><br>Goal: Reset with at least one cryochamber or stasis pod."
      EffectDesc = "Increase your Solar Revolution bonus limit by 100 percentage points per transcendence tier (equivalent to 20 Black Obelisks)."
      Effects = [ ("faithSolarRevolutionBoost", 0.1); ("cultureMaxChallenge", 0); ("scienceMaxChallenge", 0); ("manpowerMaxChallenge", 0); ("challengeHappiness", 0) ]
      StackOptions = [ ("faithSolarRevolutionBoost", "LDRLimit 4") ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = true
      Completion = "on reset: cryochamber or stasisPod" }
    (* ---- 1000Years ---- *)
    (* no checkCompletionCondition in JS (timed/shatter based); reward active-values swapped by calculateEffects; upgrades temporalPress *)
    { Name = "1000Years"
      Label = "1000 years"
      Description = "Restart the game with a half-life time.<br><br>Goal: Reach year 1000."
      EffectDesc = "Colder combustion of Time Crystal."
      Effects = [ ("shatterCostReduction", -0.02); ("shatterCostIncreaseChallenge", 0); ("shatterVoidCost", 0); ("temporalPressCap", 10); ("heatEfficiency", 0.1); ("heatCompression", 0.05) ]
      StackOptions = [ ("shatterCostReduction", "LDRLimit 1"); ("heatEfficiency", "capMagnitude 3") ]
      Upgrades = [ ("chronoforge", [ "temporalPress" ]) ]
      Unlocks = [ ("chronoforge", [ "temporalPress" ]) ]
      StartsUnlocked = false; ReserveDelay = false
      Completion = "reach year 1000 (no checkCompletionCondition fn in JS)" }
    (* ---- blackSky ---- *)
    (* completion checked live: spaceBeacon count exceeds completions; active calc zeroes reward, adds bskSattelitePenalty 0.1*on; upgrades marker *)
    { Name = "blackSky"
      Label = "Black Sky"
      Description = "Restart the game with no astronomical events to observe.<br><br>Goal: Build one Space Beacon. (+1 Beacon per completion.)"
      EffectDesc = "Elders come early."
      Effects = [ ("corruptionBoostRatioChallenge", 0.1); ("bskSattelitePenalty", 0) ]
      StackOptions = [ ("corruptionBoostRatioChallenge", "LDRLimit 2"); ("bskSattelitePenalty", "LDRLimit 30") ]
      Upgrades = [ ("zigguratUpgrades", [ "marker" ]) ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = false
      Completion = "live: spaceBeacons > completions" }
    (* ---- pacifism ---- *)
    (* completion checked ON RESET: outerSpaceTreaty researched; active calc zeroes reward, applies weapon/embassy/steamworks penalties; trade bonus via getTradeBonusEffect *)
    { Name = "pacifism"
      Label = "Pacifism"
      Description = "Restart the game without ability to hunt. Some policies are unavailable.<br><br>Goal: Research Space Treaty policy and reset."
      EffectDesc = "You gain improved trade based on trade posts."
      Effects = [ ("alicornPerTickRatio", 0.1); ("tradeKnowledge", 1); ("weaponEfficency", 0); ("policyFakeBought", 0); ("embassyFakeBought", 0); ("steamworksFakeBought", 0); ("tradeKnowledgeRatio", 0) ]
      StackOptions = [ ("tradeKnowledgeRatio", "noStack"); ("weaponEfficency", "capMagnitude 1") ]
      Upgrades = [ ("upgrades", [ "compositeBow"; "crossbow"; "railgun" ]) ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = true
      Completion = "on reset: outerSpaceTreaty researched" }
    (* ---- unicornTears ---- *)
    (* completion checked live: necrocorn>=1; requires 25 leviathan energy to unlock (JS comment/logic); reward swaps controlled by calculateEffects + UNICORN_TEARS_CHALLENGE flag *)
    { Name = "unicornTears"
      Label = "Unicorn Tears"
      Description = "Restart the game, except unicorn-related resources are required for many things, and storage space is limited.<br><br>Goal: Obtain one necrocorn."
      EffectDesc = "Unicorn Tombs increase max faith (scales with transcendence tiers). Reduce the ivory price ratio for Ziggurat religion."
      Effects = [ ("bonfireTearsPriceRatioChallenge", 0); ("scienceTearsPricesChallenge", 0); ("workshopTearsPricesChallenge", 0); ("cathPollutionPerTearOvercapped", 0); ("unicornsMax", 0); ("tearsMax", 0); ("alicornMax", 0); ("zigguratIvoryPriceRatio", -0.003) ]
      StackOptions = [ ("bonfireTearsPriceRatioChallenge", "noStack LDRLimit 2.5"); ("scienceTearsPricesChallenge", "LDRLimit 75"); ("workshopTearsPricesChallenge", "LDRLimit 1"); ("cathPollutionPerTearOvercapped", "noStack"); ("unicornsMax", "noStack"); ("tearsMax", "noStack"); ("alicornMax", "noStack"); ("zigguratIvoryPriceRatio", "LDRLimit 0.075") ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = false
      Completion = "live: necrocorn>=1; unlock needs 25 leviathan energy" }
    (* ---- postApocalypse ---- *)
    (* completion checked live: cathPollution==0; flavour text present; completion unlocks terraformingInsight + cryochamberExtraction policies *)
    { Name = "postApocalypse"
      Label = "Post Apocalypse"
      Description = "You found a broken timeline with extreme pollution. You can send your strongest kittens to clear this mess. Pollution has more negative effects. <br>WARNING: you have limited time to establish food production after starting this challenge."
      EffectDesc = "Increases amount of cryochambers that can be operational. Unlocks special policies for this run."
      Effects = [ ("arrivalSlowdown", 0); ("cryochamberSupport", 1) ]
      StackOptions = [  ]
      Upgrades = [  ]
      Unlocks = [  ]
      StartsUnlocked = false; ReserveDelay = false
      Completion = "live: cathPollution==0; flavor: 'Surely it's not that bad' they thought" }
]

type Achievement = { Name: string; Label: string; Description: string; StarDescription: string option; Hidden: bool; Unethical: bool }

let achievements : Achievement list = [
    (* ---- theElderLegacy ---- *)
    (* condition: date is Jan 2017 (mobile beta testers) *)
    { Name = "theElderLegacy"
      Label = "The Elder Legacy"
      Description = "Be one of the first players to test Kittens Game Mobile"
      StarDescription = None
      Hidden = true; Unethical = true }
    (* ---- unicornConspiracy ---- *)
    (* condition: unicorns>0 *)
    { Name = "unicornConspiracy"
      Label = "Unicorn Conspiracy"
      Description = "Lift the shroud of the Unicorn conspiracy!"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- uniception ---- *)
    (* condition: tears>0 *)
    { Name = "uniception"
      Label = "Uniception"
      Description = "Find the conspiracy within the conspiracy"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- sinsOfEmpire ---- *)
    (* condition: alicorn>0 *)
    { Name = "sinsOfEmpire"
      Label = "Sins of a Solar Empire"
      Description = "Wait, seriously?"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- anachronox ---- *)
    (* condition: timeCrystal>0 *)
    { Name = "anachronox"
      Label = "Anachronox"
      Description = "Please stop"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- deadSpace ---- *)
    (* condition: necrocorn>0 *)
    { Name = "deadSpace"
      Label = "Dead Space"
      Description = "In space no one can hear you meow."
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- sadnessAbyss ---- *)
    (* condition: sorrow>=100 *)
    { Name = "sadnessAbyss"
      Label = "Sadness Abyss"
      Description = "The source of melancholy"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- ironWill ---- *)
    (* condition: ironWill, no kittens, mine built *)
    { Name = "ironWill"
      Label = "Iron Will"
      Description = "You truly deserved this"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- uberkatzhen ---- *)
    (* condition: ironWill, no kittens, warehouse built *)
    { Name = "uberkatzhen"
      Label = "Uberkatzchen"
      Description = "What does not kill you makes you stronger"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- hundredYearsSolitude ---- *)
    (* condition: ironWill, no kittens, steamworks built *)
    { Name = "hundredYearsSolitude"
      Label = "One Hundred Years of Solitude"
      Description = "How far is too far?"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- soilUptuned ---- *)
    (* condition: ironWill, no kittens, pasture>=45 *)
    { Name = "soilUptuned"
      Label = "Virgin Soil Upturned"
      Description = "Have 45 pastures in Iron Will mode"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- atlasUnmeowed ---- *)
    (* condition: ironWill, no kittens, magneto built *)
    { Name = "atlasUnmeowed"
      Label = "Atlas Unmeowed"
      Description = "Construct a magneto in Iron Will mode"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- meowMeowRevolution ---- *)
    (* condition: ironWill, no kittens, factory built *)
    { Name = "meowMeowRevolution"
      Label = "Meow Meow Revolution"
      Description = "Construct a factory in Iron Will mode"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- spaceOddity ---- *)
    (* condition: ironWill moonMission; star: paragon<10 *)
    { Name = "spaceOddity"
      Label = "Space Oddity"
      Description = "Complete a Moon Program in Iron Will mode"
      StarDescription = "Get Moon Program in IW without any paragon points"
      Hidden = false; Unethical = false }
    (* ---- jupiterAscending ---- *)
    (* condition: orbitalLaunch year<=1; star: no chronospheres *)
    { Name = "jupiterAscending"
      Label = "Jupiter Ascending"
      Description = "Get to space on the first year"
      StarDescription = "Get to space on the first year without using Chronospheres"
      Hidden = false; Unethical = false }
    (* ---- veryLargeArray ---- *)
    (* condition: observatory>=100 without SETI *)
    { Name = "veryLargeArray"
      Label = "Very Large Array"
      Description = "Build 100 Observatories without SETI"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- shadowOfTheColossus ---- *)
    (* condition: ziggurat built with maxKittens==1 *)
    { Name = "shadowOfTheColossus"
      Label = "Shadow Of The Colossus"
      Description = "Build a Ziggurat having only one kitten"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- sunGod ---- *)
    (* condition: faith>=696342 *)
    { Name = "sunGod"
      Label = "Sun God"
      Description = "Gain a total of 696,342 worship"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- heartOfDarkness ---- *)
    (* condition: zebras>1 *)
    { Name = "heartOfDarkness"
      Label = "Heart Of Darkness"
      Description = "Become the chieftain of a zebra tribe. (How is this even possible?)"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- winterIsComing ---- *)
    (* condition: deadKittens>=10 *)
    { Name = "winterIsComing"
      Label = "Winter Is Coming"
      Description = "Have 10 kittens dead"
      StarDescription = None
      Hidden = false; Unethical = true }
    (* ---- youMonster ---- *)
    (* condition: deadKittens>=100; star: >=666666 *)
    { Name = "youMonster"
      Label = "You Monster"
      Description = "Poor kittens."
      StarDescription = "Serial murderer"
      Hidden = false; Unethical = true }
    (* ---- superUnethicalClimax ---- *)
    (* condition: cheatMode *)
    { Name = "superUnethicalClimax"
      Label = "Super Unethical Climax"
      Description = "Cheat your way through the game."
      StarDescription = None
      Hidden = false; Unethical = true }
    (* ---- systemShock ---- *)
    (* condition: systemShockMode *)
    { Name = "systemShock"
      Label = "System Shock"
      Description = "I'm sorry Dave, I'm afraid I can't do that."
      StarDescription = None
      Hidden = false; Unethical = true }
    (* ---- lotusMachine ---- *)
    (* condition: karma>=1 *)
    { Name = "lotusMachine"
      Label = "Lotus Eater Machine"
      Description = "Break the cycle of reincarnations"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- serenity ---- *)
    (* condition: 50 kittens no deaths; star: 1000 *)
    { Name = "serenity"
      Label = "Serenity"
      Description = "Have 50 kittens without losing any of them"
      StarDescription = "Have 1000 kittens without losing any of them"
      Hidden = false; Unethical = false }
    (* ---- utopiaProject ---- *)
    (* condition: happiness>=150% kittens>35; star: >=500% *)
    { Name = "utopiaProject"
      Label = "Utopia Project"
      Description = "Get a total happiness of over 150%"
      StarDescription = "Get a total happiness of over 500%"
      Hidden = false; Unethical = false }
    (* ---- deathStranding ---- *)
    (* condition: furthestRing reached *)
    { Name = "deathStranding"
      Label = "Death Stranding"
      Description = "Reach Furthest Ring"
      StarDescription = None
      Hidden = false; Unethical = false }
    (* ---- cathammer ---- *)
    (* condition: totalYears>=darkFutureBeginning; star: trueYear *)
    { Name = "cathammer"
      Label = "Cathammer 40K"
      Description = "In the grim and dark future of a catkind"
      StarDescription = "In the grim and dark future of a catkind there are no resets"
      Hidden = false; Unethical = false }
    (* ---- eternalBacchanalia ---- *)
    (* condition: festivalDays>=100 years-equiv; starCondition commented out in JS *)
    { Name = "eternalBacchanalia"
      Label = "Eternal Bacchanalia"
      Description = "The celebration of the century."
      StarDescription = "Organize a mega-event."
      Hidden = false; Unethical = false }
    (* ---- challenger ---- *)
    (* condition: 5 unique challenges; star: 100 total *)
    { Name = "challenger"
      Label = "Challenger"
      Description = "Complete 5 unique challenges."
      StarDescription = "Complete a total of 100 challenges."
      Hidden = false; Unethical = false }
    (* ---- betterSafeThanSorry ---- *)
    (* condition: legacy: betterSafeThanSorry badge unlocked; star awarded manually *)
    { Name = "betterSafeThanSorry"
      Label = "Better Safe Than Sorry"
      Description = "Get Carbon Sequestration with no pollution."
      StarDescription = "Get Carbon Sequestration with no pollution and without using chronospheres."
      Hidden = false; Unethical = false }
]

(* Badges (achievements.js badges): titles/descriptions are literals in JS, NOT i18n keys. *)
(* Difficulty is a verbatim JS string (F..S+, E = legacy). fullyHidden noted per entry. *)
type Badge = { Name: string; Label: string; Description: string; Difficulty: string; FullyHidden: bool }

let badges : Badge list = [
    (* ---- lotus ---- *)
    (* condition: totalResets>=50 *)
    { Name = "lotus"
      Label = "Lotus Eater"
      Description = "Have more than 50 total resets"
      Difficulty = "A"; FullyHidden = false }
    (* ---- ivoryTower ---- *)
    (* condition: awarded by code on IW atheism completion (no condition fn) *)
    { Name = "ivoryTower"
      Label = "Ivory Tower"
      Description = "Have a reset in a IW atheism"
      Difficulty = "S+"; FullyHidden = false }
    (* ---- useless ---- *)
    (* condition: leader trait none *)
    { Name = "useless"
      Label = "Effective Management"
      Description = "Have a useless leader"
      Difficulty = "F"; FullyHidden = false }
    (* ---- beta ---- *)
    (* condition: URL contains beta *)
    { Name = "beta"
      Label = "Beta Decay"
      Description = "Participate in a beta test"
      Difficulty = "B"; FullyHidden = false }
    (* ---- silentHill ---- *)
    (* condition: motdContent empty *)
    { Name = "silentHill"
      Label = "Silent Hills"
      Description = "Have not MOTD content"
      Difficulty = "S"; FullyHidden = false }
    (* ---- evergreen ---- *)
    (* condition: no condition fn in JS *)
    { Name = "evergreen"
      Label = "Wood badge"
      Description = "Craft a wood I think?"
      Difficulty = "F"; FullyHidden = false }
    (* ---- deadSpace ---- *)
    (* condition: kittens>=1000 with maxKittens==0 *)
    { Name = "deadSpace"
      Label = "Dead Space"
      Description = "Have kittens wander in the void"
      Difficulty = "S"; FullyHidden = false }
    (* ---- reginaNoctis ---- *)
    (* condition: kittens>=500 alicorn==0 *)
    { Name = "reginaNoctis"
      Label = "Regina Noctis"
      Description = "Have 500 kittens and no alicorns"
      Difficulty = "S"; FullyHidden = false }
    (* ---- ghostInTheMachine ---- *)
    (* condition: no condition fn in JS *)
    { Name = "ghostInTheMachine"
      Label = "Experience a game bug (TBD see newrelic#errorHandle)"
      Description = "♋︎⬧︎⧫︎♏︎❒︎🕯︎⬧︎ ●︎♋︎■︎♑︎◆︎♋︎♑︎♏︎ 🖳︎✆",
      Difficulty = "S"; FullyHidden = false }
    (* ---- abOwo ---- *)
    (* condition: awarded by code (no condition fn) *)
    { Name = "abOwo"
      Label = "Ab Owo"
      Description = "Reset in atheism on day 0"
      Difficulty = "A"; FullyHidden = false }
    (* ---- cleanPaws ---- *)
    (* condition: awarded by pacifism on-reset hook (no condition fn) *)
    { Name = "cleanPaws"
      Label = "Clean Paws"
      Description = "Peaceful trading without cat-power"
      Difficulty = "C"; FullyHidden = false }
    (* ---- sequenceBreak ---- *)
    (* condition: dune reached without moon *)
    { Name = "sequenceBreak"
      Label = "Sequence Break"
      Description = "Skip Moon in the space tab"
      Difficulty = "D"; FullyHidden = false }
    (* ---- fantasticFurColor ---- *)
    (* condition: leader color<>0 *)
    { Name = "fantasticFurColor"
      Label = "Fantastic Fur Color"
      Description = "When a kitten has a colored name, that just means the kitten has a rare fur color; there is no special gameplay effect for having a rare fur color."
      Difficulty = "F"; FullyHidden = false }
    (* ---- whatYearIsIt ---- *)
    (* condition: awarded by code (no condition fn) *)
    { Name = "whatYearIsIt"
      Label = "What Year is it Again?"
      Description = "Forcefully resolve a Temporal Paradox. May have unknown side effects."
      Difficulty = "C"; FullyHidden = false }
    (* ---- tardis ---- *)
    (* condition: awarded by code (no condition fn) *)
    { Name = "tardis"
      Label = "Time Advancing Relative Dimensions In Space"
      Description = "Prioritize time travel over space travel."
      Difficulty = "C"; FullyHidden = false }
    (* ---- wheredThisComeFrom ---- *)
    (* condition: awarded by code (no condition fn) *)
    { Name = "wheredThisComeFrom"
      Label = "Where'd This Come From?"
      Description = "Chronoreset to gain resources."
      Difficulty = "S"; FullyHidden = false }
    (* ---- lostDates ---- *)
    (* condition: time.flux<=-5 *)
    { Name = "lostDates"
      Label = "Lost Dates"
      Description = "Accumulate 5 years of timeslip."
      Difficulty = "B"; FullyHidden = false }
    (* ---- buffet ---- *)
    (* condition: leviathans energy>=1000 *)
    { Name = "buffet"
      Label = "A Whale of a Buffet"
      Description = "Reach 1000 Leviathan energy."
      Difficulty = "A"; FullyHidden = false }
    (* ---- newHome ---- *)
    (* condition: yarn housing>cath housing, no overpopulation *)
    { Name = "newHome"
      Label = "A New Home"
      Description = "Have more housing on Yarn than on Cath."
      Difficulty = "D"; FullyHidden = false }
    (* ---- betterSafeThanSorry ---- *)
    (* condition: legacy badge (fullyHidden) *)
    { Name = "betterSafeThanSorry"
      Label = "Better Safe Than Sorry (old)"
      Description = "Get Carbon Sequestration with no pollution."
      Difficulty = "E"; FullyHidden = true }
    (* ---- soLongAndThanksForAllTheHay ---- *)
    (* condition: alicorn==42 within 1e-12 *)
    { Name = "soLongAndThanksForAllTheHay"
      Label = "So Long, and Thanks for All the Hay"
      Description = "Have exactly 42 alicorns."
      Difficulty = "S"; FullyHidden = false }
]

(* Stats (stats.js StatsManager.stats + statsCurrent, whole file): titles from en.json stats.*. *)
(* resetState zeroes vals; unlocked=defaultUnlocked. statsCurrent resets each run. *)
type GameStat = { Name: string; Label: string; CurrentRun: bool; StartsUnlocked: bool }

let stats : GameStat list = [
    (* counter *)
    { Name = "totalKittens"; Label = "Total Kittens"; CurrentRun = false; StartsUnlocked = true }
    (* counter *)
    { Name = "kittensDead"; Label = "Kittens Dead"; CurrentRun = false; StartsUnlocked = true }
    (* counter *)
    { Name = "totalYears"; Label = "Total Years Played"; CurrentRun = false; StartsUnlocked = true }
    (* counter (displayed +1 in stats tab) *)
    { Name = "totalResets"; Label = "Run Number"; CurrentRun = false; StartsUnlocked = true }
    (* counter *)
    { Name = "totalParagon"; Label = "Total Paragon"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "eventsObserved"; Label = "Rare Events Observed"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "unicornsSacrificed"; Label = "Unicorns Sacrificed"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "buildingsConstructed"; Label = "Buildings Constructed"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "totalClicks"; Label = "Total Clicks"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "totalTrades"; Label = "Trades Completed"; CurrentRun = false; StartsUnlocked = false }
    (* counter *)
    { Name = "totalCrafts"; Label = "Crafting Times"; CurrentRun = false; StartsUnlocked = false }
    (* calculated: totalKittens/centuries *)
    { Name = "averageKittens"; Label = "Avg. Kittens Born (Per Century)"; CurrentRun = false; StartsUnlocked = false }
    (* calculated: religion.transcendenceTier *)
    { Name = "transcendenceTier"; Label = "Transcendence Tier"; CurrentRun = false; StartsUnlocked = false }
    (* calculated: challenges.getCountCompletions *)
    { Name = "totalChallengesCompleted"; Label = "Challenges Completed"; CurrentRun = false; StartsUnlocked = false }
    (* current-run; counter *)
    { Name = "totalTrades"; Label = "Trades Completed"; CurrentRun = true; StartsUnlocked = false }
    (* current-run; counter *)
    { Name = "totalCrafts"; Label = "Crafting Times"; CurrentRun = true; StartsUnlocked = false }
    (* current-run; calculated: kittens/year-centuries *)
    { Name = "averageKittens"; Label = "Avg. Kittens Born (Per Century)"; CurrentRun = true; StartsUnlocked = false }
    (* current-run; calculated: calendar display seconds *)
    { Name = "timePlayed"; Label = "Time Played"; CurrentRun = true; StartsUnlocked = false }
]

(* no discrepancies: all extracted fields match orig *)
