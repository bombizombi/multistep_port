(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Religion upgrades + pacts - auto-extracted from the original JS. *)
(* Sources (all in orig_project/kittensgame/js/religion.js): *)
(*   zigguratUpgrades  (ReligionManager, ~line 635): unicorn tomb / ivory / sky palace line + marker/graveyard/necropolis/pyramid *)
(*   religionUpgrades  (ReligionManager, ~line 1046): solar chant -> frescoes *)
(*   transcendenceUpgrades (ReligionManager, ~line 1257): black obelisk -> dark paracosm *)
(*   pacts (classes.religion.pactsManager, ~line 2576): 6 relic pacts + payDebt + fractured *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Counts: zigguratUpgrades=10; religionUpgrades=11; transcendenceUpgrades=11; pacts=8. *)
(* Missing-label fallbacks: exactly one - religion.tu.mausoleum.flavor is commented out in the JS *)
(*   AND absent from en.json, so mausoleum carries no flavor here. All other labels/descriptions/flavors *)
(*   resolved; no name fallbacks were needed. *)
(* Field notes (verbatim JS semantics, kept as comments per entry, NOT in the record types): *)
(*   priceRatio: ZU all 1.15; RU 2.5 EXCEPT solarRevolution/apocripha/transcendence which have NO *)
(*     priceRatio field in JS; TU 1.15 EXCEPT darkParacosm 1.75; pacts all forced to exactly 1 by the *)
(*     pactsManager constructor ("all Pacts must have price ratio of 1 exactly"). *)
(*   faith (RU only): total worship/faith pool required to unlock the upgrade (NOT a price). *)
(*   tier (TU only): transcendence tier required to unlock. *)
(*   noStackable (RU all): set by calculateEffects to (transcendence RU off); frescoes additionally *)
(*     rewrites its own description at runtime (stackable suffix + karma hints). *)
(*   unlocks/upgrades: game.unlock() visibility targets / game.upgrade() effect-recalc targets. *)
(*   unlocked/defaultUnlocked: persisted visibility flags (unicornTomb starts unlocked). *)
(*   Static `effects` below are the literal JS defaults; most ZU sky-line entries default to 0 and get *)
(*   real values from calculateEffects at runtime (summarized in comments only). *)
(*   ReligionManager.effectsBase (not per-entry): kittensKarmaPerMinneliaRatio 0.0001, *)
(*     pactNecrocornConsumption -0.0005. Casing quirks kept verbatim: "pactcraftRatio", "pacttimeRatio". *)

type RuDef = { Name: string; Label: string; Description: string; Prices: Price list; Effects: (string * float) list }

let zigguratUpgrades : RuDef list = [
    (* ---- unicornTomb ---- *)
    (* priceRatio 1.15; unlocked=true defaultUnlocked=true; unlocks zigguratUpgrades->[ivoryTower]. *)
    (* calculateEffects: UT challenge active -> tearsMax=1, faithMax=0; else tearsMax=0 and *)
    (*   faithMax = 2 * (0 unless unicornTears researched: 5 if TT<1, 5+3*TT^1.5 if TT<100, 3000 if TT>=100). *)
    { Name = "unicornTomb"
      Label = "Unicorn Tomb"
      Description = "Improves your unicorns generation by 5%"
      Prices = [ { Resource = "ivory"; Amount = 500 }; { Resource = "tears"; Amount = 5 } ]
      Effects = [ ("unicornsRatioReligion", 0.05); ("faithMax", 0); ("tearsMax", 0) ] }
    (* ---- ivoryTower ---- *)
    (* priceRatio 1.15; unlocked=false defaultUnlocked=false; unlocks zigguratUpgrades->[ivoryCitadel]. *)
    (* calculateEffects: UT active -> tearsMax=20, else tearsMax=0. *)
    { Name = "ivoryTower"
      Label = "Ivory Tower"
      Description = "Improves your unicorns generation by 10%, unlocks Unicorn Rifts"
      Prices = [ { Resource = "ivory"; Amount = 25000 }; { Resource = "tears"; Amount = 25 } ]
      Effects = [ ("unicornsRatioReligion", 0.1); ("riftChance", 0.0005); ("tearsMax", 0) ] }
    (* ---- ivoryCitadel ---- *)
    (* priceRatio 1.15; unlocked=false defaultUnlocked=false; unlocks zigguratUpgrades->[skyPalace]. *)
    (* calculateEffects: UT active -> unicornsMax=2000, tearsMax=5; else both 0. *)
    { Name = "ivoryCitadel"
      Label = "Ivory Citadel"
      Description = "Improves your unicorns generation by 25%, summons Ivory Meteors"
      Prices = [ { Resource = "ivory"; Amount = 50000 }; { Resource = "tears"; Amount = 50 } ]
      Effects = [ ("unicornsRatioReligion", 0.25); ("ivoryMeteorChance", 0.0005); ("unicornsMax", 0); ("tearsMax", 0) ] }
    (* ---- skyPalace ---- *)
    (* priceRatio 1.15; unlocked=false defaultUnlocked=false; unlocks zigguratUpgrades->[unicornUtopia]. *)
    (* calculateEffects: base goldMaxRatio=0.01, unicornsRatioReligion=0.5, alicornChance=0.0001, *)
    (*   ivoryMeteorRatio=0.05; alicornPerTick=0.00002 if alicornmancy researched or alicorns>0; *)
    (*   UT active adds unicornsMax=50, tearsMax=275, alicornMax=0.2. *)
    { Name = "skyPalace"
      Label = "Sky Palace"
      Description = "Improves your unicorns generation by 50%. There was a legend of ancient and mysterious beings living in this place long ago. Every Sky Palace level improves your total gold cap by 1%"
      Prices = [ { Resource = "ivory"; Amount = 125000 }; { Resource = "tears"; Amount = 500 }; { Resource = "megalith"; Amount = 5 } ]
      Effects = [ ("goldMaxRatio", 0); ("unicornsRatioReligion", 0); ("alicornChance", 0); ("alicornPerTick", 0); ("ivoryMeteorRatio", 0); ("unicornsMax", 0); ("tearsMax", 0); ("alicornMax", 0) ] }
    (* ---- unicornUtopia ---- *)
    (* priceRatio 1.15; unlocked=false defaultUnlocked=false; unlocks zigguratUpgrades->[sunspire]; *)
    (*   unlockScheme { name: "unicorn", threshold: 1 }. *)
    (* calculateEffects: base unicornsRatioReligion=2.5, alicornChance=0.00015, tcRefineRatio=0.05, *)
    (*   ivoryMeteorRatio=0.15; alicornPerTick=0.000025 if alicornmancy or alicorns>0; *)
    (*   UT active adds unicornsMax=5500, tearsMax=1800, alicornMax=0.6. *)
    { Name = "unicornUtopia"
      Label = "Unicorn Utopia"
      Description = "Improves your unicorns generation by 250%. Increase alicorn summon chance. Improves TC refine ratio by 5%"
      Prices = [ { Resource = "gold"; Amount = 500 }; { Resource = "ivory"; Amount = 1000000 }; { Resource = "tears"; Amount = 5000 } ]
      Effects = [ ("unicornsRatioReligion", 0); ("alicornChance", 0); ("alicornPerTick", 0); ("tcRefineRatio", 0); ("ivoryMeteorRatio", 0); ("unicornsMax", 0); ("tearsMax", 0); ("alicornMax", 0) ] }
    (* ---- sunspire ---- *)
    (* priceRatio 1.15; unlocked=false defaultUnlocked=false; no unlocks. *)
    (* calculateEffects: base unicornsRatioReligion=5, alicornChance=0.0003, tcRefineRatio=0.1, *)
    (*   ivoryMeteorRatio=0.5; alicornPerTick=0.00005 if alicornmancy or alicorns>0; *)
    (*   UT active (unicornTears challenge) adds unicornsMaxRatio=0.1, tearsMax=10000, alicornMax=1. *)
    { Name = "sunspire"
      Label = "Sunspire"
      Description = "Improves your unicorns generation by 500%. Increase alicorn summon chance by significant amount. Improves TC refine ratio by 10%"
      Prices = [ { Resource = "gold"; Amount = 1250 }; { Resource = "ivory"; Amount = 750000 }; { Resource = "tears"; Amount = 25000 } ]
      Effects = [ ("unicornsRatioReligion", 0); ("alicornChance", 0); ("alicornPerTick", 0); ("tcRefineRatio", 0); ("ivoryMeteorRatio", 0); ("unicornsMaxRatio", 0); ("tearsMax", 0); ("alicornMax", 0) ] }
    (* ---- marker ---- *)
    (* priceRatio 1.15; unlocked=false; unlocks policies->[siphoning; feedingFrenzy; upfrontPayment]; *)
    (*   flavor "A twisted spire points the way.". *)
    (* calculateEffects: corruptionRatio = 0.000001 * (1 + corruptionBoostRatioChallenge); val>0 + UT *)
    (*   active unlocks necrocorn pool. getEffectiveValue: val * (1 + corruptionBoostRatioChallenge). *)
    { Name = "marker"
      Label = "Marker"
      Description = "A strange structure made of unknown metal and serving an unidentified purpose."
      Prices = [ { Resource = "unobtainium"; Amount = 2500 }; { Resource = "spice"; Amount = 50000 }; { Resource = "tears"; Amount = 5000 }; { Resource = "megalith"; Amount = 750 } ]
      Effects = [ ("corruptionRatio", 0.000001) ] }
    (* ---- unicornGraveyard ---- *)
    (* priceRatio 1.15; unlocked=false; upgrades buildings->[ziggurat]; unlocks ZU->[unicornNecropolis]. *)
    (* No calculateEffects/action override; static effects only. *)
    { Name = "unicornGraveyard"
      Label = "Unicorn Graveyard"
      Description = "Grave of the fireflies."
      Prices = [ { Resource = "necrocorn"; Amount = 5 }; { Resource = "megalith"; Amount = 1000 } ]
      Effects = [ ("cultureMaxRatioBonus", 0.01); ("blackLibraryBonus", 0.02) ] }
    (* ---- unicornNecropolis ---- *)
    (* priceRatio 1.15; unlocked=false; no unlocks/upgrades. No calculateEffects/action override. *)
    { Name = "unicornNecropolis"
      Label = "Unicorn Necropolis"
      Description = "The ocean of blood at the end of the lane"
      Prices = [ { Resource = "alicorn"; Amount = 100 }; { Resource = "necrocorn"; Amount = 15 }; { Resource = "void"; Amount = 5 }; { Resource = "megalith"; Amount = 2500 } ]
      Effects = [ ("corruptionBoostRatio", 0.10) ] }
    (* ---- blackPyramid ---- *)
    (* priceRatio 1.15; unlocked=false; upgrades spaceBuilding->[spaceBeacon], chronoforge->[temporalImpedance]; *)
    (*   flavor "What have we done?!"; simpleEffectNames [GlobalResourceRatio; RecoveryRatio; *)
    (*   GlobalProductionRatio; FaithRatio; SpaceCompendiumRatio; PerYearRatio]; prefixEffectNames *)
    (*   [craftRatio; UniversalKnowHow; timeRatio]. *)
    (* calculateEffects: togglable=false; without MAUSOLEUM_PACTS flag zero all effects and return; *)
    (*   else refresh every pact's pre-deficit effects. updateEffects/cashPreDeficitEffects: *)
    (*   pyramid<SIMPLE> = pact<SIMPLE> * max(TT-24,1); craftRatio/UniversalKnowHow/timeRatio likewise; *)
    (*   deficitRecoveryRatio = pactDeficitRecoveryRatio; blackLibraryBonus = pactBlackLibraryBoost * *)
    (*   graveyard bonus * (1+graveyard on); live effects = pre-deficit * debt penalty ratio. *)
    (* getEffectiveValue: val + 1 if blackSky researched and inactive. *)
    { Name = "blackPyramid"
      Label = "Black Pyramid"
      Description = "A dark relic of unspeakable horrors."
      Prices = [ { Resource = "unobtainium"; Amount = 5000 }; { Resource = "spice"; Amount = 150000 }; { Resource = "sorrow"; Amount = 5 }; { Resource = "megalith"; Amount = 2500 } ]
      Effects = [ ("pyramidGlobalResourceRatio", 0); ("pyramidGlobalProductionRatio", 0); ("pyramidFaithRatio", 0); ("deficitRecoveryRatio", 0); ("blackLibraryBonus", 0); ("pyramidSpaceCompendiumRatio", 0); ("craftRatio", 0); ("UniversalKnowHow", 0); ("pyramidPerYearRatio", 0); ("timeRatio", 0) ] }
]

let religionUpgrades : RuDef list = [
    (* ---- solarchant ---- *)
    (* faith required 150; priceRatio 2.5; noStackable=true. *)
    (* calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "solarchant"
      Label = "Solar Chant"
      Description = "Improves your faith generation rate by 10%"
      Prices = [ { Resource = "faith"; Amount = 100 } ]
      Effects = [ ("faithRatioReligion", 0.1) ] }
    (* ---- scholasticism ---- *)
    (* faith required 300; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]; *)
    (*   flavor "A treatise on mrowlity". calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "scholasticism"
      Label = "Scholasticism"
      Description = "Temples will give a bonus to max science"
      Prices = [ { Resource = "faith"; Amount = 250 } ]
      Effects = [  ] }
    (* ---- goldenSpire ---- *)
    (* faith required 500; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]; *)
    (*   flavor "A luxurious spike". calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "goldenSpire"
      Label = "Golden Spire"
      Description = "Temples can store 50% more faith"
      Prices = [ { Resource = "gold"; Amount = 150 }; { Resource = "faith"; Amount = 350 } ]
      Effects = [  ] }
    (* ---- sunAltar ---- *)
    (* faith required 750; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]. *)
    (* calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "sunAltar"
      Label = "Sun Altar"
      Description = "Every temple can store a bit more faith and will improve happiness by 0.5%"
      Prices = [ { Resource = "gold"; Amount = 250 }; { Resource = "faith"; Amount = 500 } ]
      Effects = [  ] }
    (* ---- stainedGlass ---- *)
    (* faith required 750; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]. *)
    (* calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "stainedGlass"
      Label = "Stained Glass"
      Description = "Every temple will generate twice as much culture"
      Prices = [ { Resource = "gold"; Amount = 250 }; { Resource = "faith"; Amount = 500 } ]
      Effects = [  ] }
    (* ---- solarRevolution ---- *)
    (* faith required 1000; NO priceRatio field in JS; noStackable=true. *)
    (* calculateEffects: effects.solarRevolutionRatio = religion.getSolarRevolutionRatio(). *)
    { Name = "solarRevolution"
      Label = "Solar Revolution"
      Description = "Worship will give a small boost to resource production."
      Prices = [ { Resource = "gold"; Amount = 500 }; { Resource = "faith"; Amount = 750 } ]
      Effects = [ ("solarRevolutionRatio", 0) ] }
    (* ---- basilica ---- *)
    (* faith required 10000; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]. *)
    (* calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "basilica"
      Label = "Basilica"
      Description = "Temples generate more culture and expand cultural limits"
      Prices = [ { Resource = "gold"; Amount = 750 }; { Resource = "faith"; Amount = 1250 } ]
      Effects = [  ] }
    (* ---- templars ---- *)
    (* faith required 75000; priceRatio 2.5; noStackable=true; upgrades buildings->[temple; ziggurat]. *)
    (* calculateEffects: noStackable = (transcendence RU off). *)
    { Name = "templars"
      Label = "Templar"
      Description = "Temples have a small impact on the catpower limit"
      Prices = [ { Resource = "gold"; Amount = 3000 }; { Resource = "faith"; Amount = 3500 } ]
      Effects = [  ] }
    (* ---- apocripha ---- *)
    (* faith required 100000; NO priceRatio field in JS; noStackable=true. No handler override. *)
    { Name = "apocripha"
      Label = "Apocrypha"
      Description = "Grants the ability to convert worship to epiphany, which improves the effectiveness of praying"
      Prices = [ { Resource = "gold"; Amount = 5000 }; { Resource = "faith"; Amount = 5000 } ]
      Effects = [  ] }
    (* ---- transcendence ---- *)
    (* faith required 125000; NO priceRatio field in JS; noStackable=true; *)
    (*   upgrades religion->[solarchant; scholasticism; goldenSpire; sunAltar; stainedGlass; basilica; *)
    (*   templars; frescoes]. No handler override. *)
    { Name = "transcendence"
      Label = "Transcendence"
      Description = "Unlocks additional religion upgrades"
      Prices = [ { Resource = "gold"; Amount = 7500 }; { Resource = "faith"; Amount = 7500 } ]
      Effects = [  ] }
    (* ---- frescoes ---- *)
    (* faith required 200000; priceRatio 2.5; noStackable=true; upgrades buildings->[chapel]; *)
    (*   flavor "Our ancestors' deeds resonate across time. We are heirs to their holy legacy."; *)
    (*   spice price "Not affected by philosopher trait discount" (comment in JS). *)
    (* calculateEffects: noStackable = (transcendence RU off); rewrites description at runtime: base desc *)
    (*   + stackable suffix when stackable + karma hint when karma<10 (noKarma vs lowKarma strings). *)
    { Name = "frescoes"
      Label = "Frescoes"
      Description = "Chapels store faith proportional to your amount of karma."
      Prices = [ { Resource = "gold"; Amount = 5000 }; { Resource = "faith"; Amount = 4000 }; { Resource = "spice"; Amount = 8000 } ]
      Effects = [  ] }
]

let transcendenceUpgrades : RuDef list = [
    (* ---- blackObelisk ---- *)
    (* tier 1; priceRatio 1.15; unlocked=false; flavor "TBD". *)
    (* calculateEffects: solarRevolutionLimit = 0.05 * transcendenceTier. *)
    { Name = "blackObelisk"
      Label = "Black Obelisk"
      Description = "Improves your Solar Revolution bonus limit.<br>Every Black Obelisk will increase your Solar Revolution bonus limit by 5 percentage point per transcendence tier."
      Prices = [ { Resource = "relic"; Amount = 100 } ]
      Effects = [ ("solarRevolutionLimit", 0.05) ] }
    (* ---- blackNexus ---- *)
    (* tier 3; priceRatio 1.15; unlocked=false; upgrades spaceBuilding->[spaceBeacon]; *)
    (*   flavor "Eye in the sky.". No handler override. *)
    { Name = "blackNexus"
      Label = "Black Nexus"
      Description = "Improves the rate you refine time crystals into relics.<br>Every Black Nexus will increase your Relic Refine efficiency by the number of Black Pyramid.<br>This effect also boosts the effectiveness of Relic Stations"
      Prices = [ { Resource = "relic"; Amount = 5000 } ]
      Effects = [ ("relicRefineRatio", 1.0) ] }
    (* ---- blackCore ---- *)
    (* tier 5; priceRatio 1.15; unlocked=false; flavor "Built with the bones of kitten sacrifices.". *)
    (* No handler override. *)
    { Name = "blackCore"
      Label = "Black Core"
      Description = "Alter and corrupt the laws of the reality on a minor scale.<br>Every level of Black Core increases BLS limit by 1%."
      Prices = [ { Resource = "relic"; Amount = 10000 } ]
      Effects = [ ("blsLimit", 1) ] }
    (* ---- singularity ---- *)
    (* tier 7; priceRatio 1.15; unlocked=false; flavor "A gateway... To what?". No handler override. *)
    (* NOTE: label key maps to "Event Horizon" in en.json (name stays "singularity"). *)
    { Name = "singularity"
      Label = "Event Horizon"
      Description = "Improve global resource limits by 10%"
      Prices = [ { Resource = "relic"; Amount = 25000 } ]
      Effects = [ ("globalResourceRatio", 0.10) ] }
    (* ---- blackLibrary ---- *)
    (* tier 9; priceRatio 1.15; unlocked=false; flavor "Maybe it's too dark to read on purpose.". *)
    (* No handler override. *)
    { Name = "blackLibrary"
      Label = "Black Library"
      Description = "Every Black Library improves Codex Leviathanianus scaling by 2%. This value is further improved by Unicorn Graveyards."
      Prices = [ { Resource = "relic"; Amount = 30000 } ]
      Effects = [ ("compendiaTTBoostRatio", 0.02) ] }
    (* ---- blackRadiance ---- *)
    (* tier 12; priceRatio 1.15; unlocked=false; flavor "Like a rainbow in the dark". No handler override. *)
    { Name = "blackRadiance"
      Label = "Black Radiance"
      Description = "Every % of BLS meter will very slightly increase alicorn corruption rate"
      Prices = [ { Resource = "relic"; Amount = 37500 } ]
      Effects = [ ("blsCorruptionRatio", 0.0012) ] }
    (* ---- blazar ---- *)
    (* tier 15; priceRatio 1.15; unlocked=false; upgrades chronoforge->[temporalImpedance; temporalPress]; *)
    (*   unlocks chronoforge->[temporalPress]; flavor "Tiger tiger burning bright.". No handler override. *)
    { Name = "blazar"
      Label = "Blazar"
      Description = "Improve time-related structures"
      Prices = [ { Resource = "relic"; Amount = 50000 } ]
      Effects = [ ("timeRatio", 0.10); ("rrRatio", 0.02) ] }
    (* ---- darkNova ---- *)
    (* tier 20; priceRatio 1.15; unlocked=false; flavor "The stars are dead. Just like our hopes and dreams.". *)
    (* No handler override. *)
    { Name = "darkNova"
      Label = "Dark Nova"
      Description = "Improves global energy production by 2%"
      Prices = [ { Resource = "relic"; Amount = 75000 }; { Resource = "void"; Amount = 7500 } ]
      Effects = [ ("energyProductionRatio", 0.02) ] }
    (* ---- mausoleum ---- *)
    (* tier 23; priceRatio 1.15; unlocked=false; upgrades pacts->[fractured], policies->[feedingFrenzy]; *)
    (*   unlocks pacts->[pactOfCleansing; pactOfDestruction; pactOfExtermination; pactOfPurity; *)
    (*   pactOfArcane; pactOfChronicler], policies->[siphoning; feedingFrenzy; upfrontPayment]. *)
    (*   NO flavor: religion.tu.mausoleum.flavor is commented out in JS and missing from en.json. *)
    (* calculateEffects: without MAUSOLEUM_PACTS flag pactsAvailable=0, unlocked=false; else *)
    (*   pactsAvailable = 1 + mausoleumBonus, forced to 0 while fractured pact is on. *)
    (* evaluateLocks: MAUSOLEUM_PACTS flag. *)
    { Name = "mausoleum"
      Label = "Mausoleum"
      Description = "Venerate kittens of the past. Adds available pacts."
      Prices = [ { Resource = "relic"; Amount = 50000 }; { Resource = "void"; Amount = 12500 }; { Resource = "necrocorn"; Amount = 10 } ]
      Effects = [ ("pactsAvailable", 1) ] }
    (* ---- holyGenocide ---- *)
    (* tier 25; priceRatio 1.15; unlocked=false; togglable=true; upgrades jobs->[ambassador]; *)
    (*   unlocks challenges->[postApocalypse]; *)
    (*   flavor "We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far.". *)
    (* calculateEffects: activeHG = religion.activeHolyGenocide. *)
    { Name = "holyGenocide"
      Label = "Holy Genocide"
      Description = "Reduce your max population cap by 1%. Increase all population-related effects by 2%"
      Prices = [ { Resource = "relic"; Amount = 100000 }; { Resource = "void"; Amount = 25000 } ]
      Effects = [ ("maxKittensRatio", -0.01); ("simScalingRatio", 0.02); ("activeHG", 0) ] }
    (* ---- darkParacosm ---- *)
    (* tier 27; priceRatio 1.75; priceRules=true; unlocked=false; *)
    (*   flavor "Time is grand and firm teacher". NOTE: paragon price carries its own priceRatio 2 in JS. *)
    (* calculateEffects: without DARK_PARACOSM flag unlocked=false. evaluateLocks: DARK_PARACOSM flag. *)
    { Name = "darkParacosm"
      Label = "Dark Paracosm"
      Description = "Increases millennium paragon production"
      Prices = [ { Resource = "relic"; Amount = 230000 }; { Resource = "void"; Amount = 29000 }; { Resource = "paragon"; Amount = 8 } ]
      Effects = [ ("milleninumParagon", 1) ] }
]

(* Pacts live in religion.js after all panels: classes.religion.pactsManager pacts array. *)
(* priceRatio is forced to exactly 1 for every pact by the pactsManager constructor. *)
(* Descriptions/effects below ride in comments because PactDef models only the purchase identity. *)

type PactDef = { Name: string; Label: string; Prices: Price list }

let pacts : PactDef list = [
    (* ---- pactOfCleansing ---- *)
    (* desc "Cleanse the mortal plane of trash! Increase global resource limits."; unlocked=false. *)
    (* effects: pactsAvailable -1; necrocornPerDay 0; pactDeficitRecoveryRatio 0.003; *)
    (*   pactGlobalResourceRatio 0.0005. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption. *)
    { Name = "pactOfCleansing"
      Label = "Pact of Cleansing"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- pactOfDestruction ---- *)
    (* desc "Utterly destroy parts of reality in order to gain resources."; unlocked=false. *)
    (* effects: pactsAvailable -1; necrocornPerDay 0; pactDeficitRecoveryRatio -0.0001; *)
    (*   pactGlobalProductionRatio 0.0005. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption. *)
    { Name = "pactOfDestruction"
      Label = "Pact of Destruction"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- pactOfExtermination ---- *)
    (* desc "Exterminate evil! Increase faith production"; unlocked=false. *)
    (* effects: pactsAvailable -1; necrocornPerDay 0; pactFaithRatio 0.001. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption. *)
    { Name = "pactOfExtermination"
      Label = "Pact of Extermination"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- pactOfPurity ---- *)
    (* desc "Purify the mortal plane, gaining insight into secrets of the universe and clearing reality from strains of darkness."; *)
    (*   unlocked=false. effects: pactsAvailable -1; necrocornPerDay 0; pactDeficitRecoveryRatio 0.005; *)
    (*   pactBlackLibraryBoost 0.0005; pactSpaceCompendiumRatio 0.001. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption and unjam blackPyramid. *)
    { Name = "pactOfPurity"
      Label = "Pact of Purity"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- pactOfArcane ---- *)
    (* desc "Harness power to reshape matter, raising crafting ratio and engineers speed"; unlocked=false. *)
    (* effects (casing verbatim): pactsAvailable -1; necrocornPerDay 0; pactcraftRatio 0.001; *)
    (*   pactUniversalKnowHow 0.1. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption and unjam blackPyramid. *)
    { Name = "pactOfArcane"
      Label = "Pact of Arcane"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- pactOfChronicler ---- *)
    (* desc "Meticulous recordings of the past for the brighter future! Improves year related effects"; *)
    (*   unlocked=false; upgrades spaceBuilding->[hrHarvester]. *)
    (* effects (casing verbatim): pactsAvailable -1; necrocornPerDay 0; pactPerYearRatio 0.003; *)
    (*   umbraBoostRatio 0.1; pacttimeRatio 0.1. *)
    (* calculateEffects: if MAUSOLEUM_PACTS, necrocornPerDay = pactNecrocornConsumption and unjam blackPyramid. *)
    { Name = "pactOfChronicler"
      Label = "Pact of Chronicler"
      Prices = [ { Resource = "relic"; Amount = 100 } ] }
    (* ---- payDebt ---- *)
    (* desc "Get rid of Necrocorn Deficit by giving up enough necrocorns"; unlocked=false; special=true; *)
    (*   limitBuild=1; notAddDeficit=true; upgrades pacts->[payDebt]. effects: pactsAvailable 0. *)
    (* onNewDay: price := ceil(necrocornDeficit); unlocked := evaluateLocks. *)
    (* evaluateLocks: necrocornDeficit > 0 AND MAUSOLEUM_PACTS. *)
    (* calculateEffects: onNewDay; if val>0 reset on/val to 0, clear deficit, unlocked=false. *)
    { Name = "payDebt"
      Label = "Pay the debt"
      Prices = [ { Resource = "necrocorn"; Amount = 0 } ] }
    (* ---- fractured ---- *)
    (* desc "You have broken the deal... now you will pay"; unlocked=false. *)
    (* effects: pyramidGlobalResourceRatio -0.5; pyramidGlobalProductionRatio -0.5; pyramidFaithRatio -0.5; *)
    (*   pactsAvailable 0. *)
    (* calculateEffects: without MAUSOLEUM_PACTS zero the pyramid effects and return; if on>=1 reset ALL *)
    (*   pacts (on/val 0, unlocked=false except fractured), then self on=1, val=1. Set by necrocorn deficit *)
    (*   punishment together with mausoleum/policies re-upgrade. *)
    { Name = "fractured"
      Label = "Fractured"
      Prices = [ { Resource = "catnip"; Amount = 1 } ] }
]

(* no discrepancies: all extracted fields match orig *)
