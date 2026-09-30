(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Policies (science.js policies array) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Source: orig_project/kittensgame/js/science.js `policies` array, JS order preserved (64 entries). *)
(* Policy visibility (exact, from game.js unlock + science.js resetState + PolicyBtnController.updateVisible): *)
(*   resetState: unlocked=false, blocked=false, researched=false for ALL policies. *)
(*   game.unlock({policies:[...]}) (tech/policy research, diplomacy perk, load): target with *)
(*   evaluateLocks whose condition fails is SKIPPED (stays locked); else unlocked=true. *)
(*   button visible = meta.unlocked (+hideResearched/hideBlocked filters). NO price-ratio pre-reveal. *)
(*   researching a policy sets blocked=true on every policy in its `blocks` list. *)
(*   isRelation policies (all lizard/shark/griffin/naga/spider/dragon relation policies) are *)
(*   additionally auto-unlocked by the diplomacy perk via science.unlockRelations. *)
(* Unlocks merges the JS `unlocks` and `upgrades` dicts (same shape); `upgrades` entries only *)
(* trigger effect recalculation (game.upgrade), NOT visibility - flagged per entry. *)
(* JS typos preserved verbatim: aiCoreProductivness, hapinnessConsumptionRatio; *)
(* policy.authocracy.* reads the policy.autocracy.* i18n keys; the satellite building is `sattelite` in JS. *)

type Policy = { Name: string; Label: string; Description: string; Prices: Price list; Effects: (string * float) list; Unlocks: (string * string list) list; Blocks: string list }

let policies : Policy list = [
    (* ---- liberty ---- *)
    (* calculateEffects: maxKittens = 0 in ironWill, else 1 *)
    { Name = "liberty"
      Label = "Liberty"
      Description = "Good for societies focused on happiness. Increases the effect happiness has on kitten production. This will affect what policies are available in the future!"
      Prices = [ { Resource = "culture"; Amount = 150 } ]
      Effects = [ ("maxKittens", 0); ("happinessKittenProductionRatio", 0.1) ]
      Unlocks = [ ("policies", [ "authocracy"; "republic" ]) ]
      Blocks = [ "tradition" ] }
    (* ---- tradition ---- *)
    { Name = "tradition"
      Label = "Tradition"
      Description = "Good for culture-oriented societies. Reduces manuscript price and increases their effect. This will affect what policies are available in the future!"
      Prices = [ { Resource = "culture"; Amount = 150 } ]
      Effects = [ ("cultureFromManuscripts", 1); ("manuscriptParchmentCost", -5); ("manuscriptCultureCost", -100) ]
      Unlocks = [ ("policies", [ "authocracy"; "monarchy" ]) ]
      Blocks = [ "liberty" ] }
    (* ---- monarchy ---- *)
    (* Unlocks merges unlocks + upgrades; (buildings,[factory]) is `upgrades` in source *)
    { Name = "monarchy"
      Label = "Monarchy"
      Description = "Best for societies benefiting from past experiences. Makes the leader's trait twice as powerful. Maintaining the royal court takes 10% of gold production."
      Prices = [ { Resource = "culture"; Amount = 1500 } ]
      Effects = [ ("goldPolicyRatio", -0.1) ]
      Unlocks = [ ("policies", [ "liberalism"; "fascism" ]); ("buildings", [ "factory" ]) ]
      Blocks = [ "authocracy"; "republic"; "communism" ] }
    (* ---- authocracy ---- *)
    (* calculateEffects: rankLeaderBonusConversion = 0.004 * uncapped housing buildings *)
    { Name = "authocracy"
      Label = "Autocracy"
      Description = "Best for societies with highly promoted kittens. Makes the leader twice as good at their job. Leader increases conversion production based on uncapped housing buildings."
      Prices = [ { Resource = "culture"; Amount = 1500 } ]
      Effects = [ ("rankLeaderBonusConversion", 0) ]
      Unlocks = [ ("policies", [ "communism"; "fascism"; "socialism" ]) ]
      Blocks = [ "monarchy"; "republic"; "liberalism" ] }
    (* ---- republic ---- *)
    { Name = "republic"
      Label = "Republic"
      Description = "Best for large societies. Highly promoted leaders will provide a small bonus to the production of all kittens."
      Prices = [ { Resource = "culture"; Amount = 1500 } ]
      Effects = [ ("boostFromLeader", 0.01) ]
      Unlocks = [ ("policies", [ "liberalism"; "communism"; "socialism" ]) ]
      Blocks = [ "monarchy"; "authocracy"; "fascism" ] }
    (* ---- socialism ---- *)
    (* meme policy: effects intentionally empty; calculateEffects is a no-op loop *)
    { Name = "socialism"
      Label = "Socialism"
      Description = "Has no effect"
      Prices = [ { Resource = "culture"; Amount = 7500 } ]
      Effects = [  ]
      Unlocks = [ ("policies", [ "scientificCommunism" ]) ]
      Blocks = [  ] }
    (* ---- scientificCommunism ---- *)
    (* evaluateLocks: workshop count < 2 AND factory count < 1 AND socialism researched *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "scientificCommunism"
      Label = "Scientific Communism"
      Description = "Increases all effects of Socialism by 25%"
      Prices = [ { Resource = "culture"; Amount = 8500 } ]
      Effects = [  ]
      Unlocks = [ ("policies", [ "socialism" ]) ]
      Blocks = [  ] }
    (* ---- liberalism ---- *)
    (* evaluateLocks: (monarchy OR republic researched) AND factory count > 0 *)
    { Name = "liberalism"
      Label = "Liberalism"
      Description = "A peaceful and open society. Gains better relations with all trade partners and makes buildings require less gold."
      Prices = [ { Resource = "culture"; Amount = 15000 } ]
      Effects = [ ("goldCostReduction", 0.2); ("globalRelationsBonus", 10) ]
      Unlocks = [  ]
      Blocks = [ "communism"; "fascism" ] }
    (* ---- communism ---- *)
    (* evaluateLocks: (republic OR authocracy researched) AND factory count > 0 *)
    { Name = "communism"
      Label = "Communism"
      Description = "Industrialization at all costs. Increases production of coal, iron, and titanium, and makes factories cheaper."
      Prices = [ { Resource = "culture"; Amount = 15000 } ]
      Effects = [ ("factoryCostReduction", 0.3); ("coalPolicyRatio", 0.25); ("ironPolicyRatio", 0.25); ("titaniumPolicyRatio", 0.25) ]
      Unlocks = [  ]
      Blocks = [ "liberalism"; "fascism" ] }
    (* ---- fascism ---- *)
    (* evaluateLocks: (monarchy OR authocracy researched) AND factory count > 0 *)
    { Name = "fascism"
      Label = "Fascism"
      Description = "Lebensraum! Population penalties to happiness are eliminated, and log cabins cost half as much."
      Prices = [ { Resource = "culture"; Amount = 15000 } ]
      Effects = [ ("logHouseCostReduction", 0.5) ]
      Unlocks = [  ]
      Blocks = [ "liberalism"; "communism" ] }
    (* ---- technocracy ---- *)
    { Name = "technocracy"
      Label = "Technocracy"
      Description = "Your government is taken over by scientists, increasing your science cap."
      Prices = [ { Resource = "culture"; Amount = 150000 } ]
      Effects = [ ("technocracyScienceCap", 0.2); ("antimatterPolicyRatio", 0.0625); ("queueCapRatio", 0.2) ]
      Unlocks = [  ]
      Blocks = [ "theocracy"; "expansionism" ] }
    (* ---- theocracy ---- *)
    (* requiredLeaderJob priest in source *)
    { Name = "theocracy"
      Label = "Order of the Stars"
      Description = "Your astronauts have seen horrible things in the distant skies. Let the priests take over, increasing faith production."
      Prices = [ { Resource = "culture"; Amount = 150000 } ]
      Effects = [ ("faithPolicyRatio", 0.2) ]
      Unlocks = [  ]
      Blocks = [ "technocracy"; "expansionism" ] }
    (* ---- expansionism ---- *)
    { Name = "expansionism"
      Label = "Cosmological Libertarianism"
      Description = "Privatize the moon! Nothing changes on Cath, but unobtainium production will be increased."
      Prices = [ { Resource = "culture"; Amount = 150000 } ]
      Effects = [ ("unobtainiumPolicyRatio", 0.15) ]
      Unlocks = [  ]
      Blocks = [ "technocracy"; "theocracy" ] }
    (* ---- transkittenism ---- *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "transkittenism"
      Label = "Transkittenism"
      Description = "Give up kittenhood and merge with the AI. AI cores will be twice as effective, and there is no downside to AI level."
      Prices = [ { Resource = "culture"; Amount = 1500000 } ]
      Effects = [ ("aiCoreProductivness", 1); ("aiCoreUpgradeBonus", 0.1) ]
      Unlocks = [ ("buildings", [ "library" ]); ("spaceBuilding", [ "moonBase" ]) ]
      Blocks = [ "necrocracy"; "radicalXenophobia" ] }
    (* ---- necrocracy ---- *)
    { Name = "necrocracy"
      Label = "Necrocracy"
      Description = "Your society offers itself to the elders, they will take over and bring dark times, but you will get a production bonus from BLS."
      Prices = [ { Resource = "culture"; Amount = 1500000 } ]
      Effects = [ ("blsProductionBonus", 0.001); ("leviathansEnergyModifier", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "transkittenism"; "radicalXenophobia" ] }
    (* ---- radicalXenophobia ---- *)
    (* pacts entry is `unlocks`, transcendenceUpgrades/policies entries are `upgrades` in source *)
    (* calculateEffects: pactsAvailable = 5, or 0 if fractured pact on or MAUSOLEUM_PACTS off *)
    { Name = "radicalXenophobia"
      Label = "Radical Xenophobia"
      Description = "Reject both evil aliens and evil robots. Mausoleum is twice as effective."
      Prices = [ { Resource = "culture"; Amount = 1500000 } ]
      Effects = [ ("mausoleumBonus", 1); ("pactsAvailable", 5) ]
      Unlocks = [ ("pacts", [ "pactOfCleansing"; "pactOfDestruction"; "pactOfExtermination"; "pactOfPurity"; "pactOfChronicler"; "pactOfArcane" ]); ("transcendenceUpgrades", [ "mausoleum" ]); ("policies", [ "feedingFrenzy" ]) ]
      Blocks = [ "transkittenism"; "necrocracy" ] }
    (* ---- diplomacy ---- *)
    { Name = "diplomacy"
      Label = "Open Borders"
      Description = "Build good relationships with your neighbors, making trades cheaper in terms of catpower."
      Prices = [ { Resource = "culture"; Amount = 1600 } ]
      Effects = [ ("tradeCatpowerDiscount", 5) ]
      Unlocks = [ ("policies", [ "knowledgeSharing"; "culturalExchange" ]) ]
      Blocks = [ "isolationism" ] }
    (* ---- isolationism ---- *)
    { Name = "isolationism"
      Label = "Isolationism"
      Description = "Engage in protectionism of all types, making trades cheaper in terms of gold."
      Prices = [ { Resource = "culture"; Amount = 1600 } ]
      Effects = [ ("tradeGoldDiscount", 1) ]
      Unlocks = [ ("policies", [ "bigStickPolicy"; "cityOnAHill" ]) ]
      Blocks = [ "diplomacy" ] }
    (* ---- zebraRelationsAppeasement ---- *)
    { Name = "zebraRelationsAppeasement"
      Label = "Zebra Relations: Appeasement"
      Description = "Try to befriend the zebras, even though they hate you. The terms of trade will be less harsh, but gold income will be slightly lower."
      Prices = [ { Resource = "culture"; Amount = 5000 } ]
      Effects = [ ("goldPolicyRatio", -0.05); ("zebraRelationModifier", 15) ]
      Unlocks = [  ]
      Blocks = [ "zebraRelationsBellicosity" ] }
    (* ---- zebraRelationsBellicosity ---- *)
    { Name = "zebraRelationsBellicosity"
      Label = "Zebra Relations: Bellicosity"
      Description = "Stand up to the zebras, making trades with them worse but gaining the respect of other races."
      Prices = [ { Resource = "culture"; Amount = 5000 } ]
      Effects = [ ("nonZebraRelationModifier", 5); ("zebraRelationModifier", -10) ]
      Unlocks = [  ]
      Blocks = [ "zebraRelationsAppeasement" ] }
    (* ---- knowledgeSharing ---- *)
    (* evaluateLocks: diplomacy researched AND astronomy researched *)
    { Name = "knowledgeSharing"
      Label = "Knowledge Sharing"
      Description = "Your scientists will travel to foreign lands, slightly increasing science income."
      Prices = [ { Resource = "culture"; Amount = 4000 } ]
      Effects = [ ("sciencePolicyRatio", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "culturalExchange" ] }
    (* ---- culturalExchange ---- *)
    (* evaluateLocks: diplomacy researched AND astronomy researched *)
    { Name = "culturalExchange"
      Label = "Cultural Exchange"
      Description = "Your poets and actors will travel to foreign lands, slightly increasing culture income."
      Prices = [ { Resource = "culture"; Amount = 4000 } ]
      Effects = [ ("culturePolicyRatio", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "knowledgeSharing" ] }
    (* ---- bigStickPolicy ---- *)
    (* evaluateLocks: isolationism researched AND astronomy researched AND pacifism challenge not active *)
    { Name = "bigStickPolicy"
      Label = "Big Stick Policy"
      Description = "Speak softly, but beat up your neighbors when necessary. Embassies are cheaper and can be queued."
      Prices = [ { Resource = "culture"; Amount = 4000 } ]
      Effects = [ ("embassyCostReduction", 0.15) ]
      Unlocks = [  ]
      Blocks = [ "cityOnAHill" ] }
    (* ---- cityOnAHill ---- *)
    (* evaluateLocks: isolationism researched AND astronomy researched *)
    { Name = "cityOnAHill"
      Label = "City On A Hill"
      Description = "Be a shining example to the world you hate. Culture cap is slightly increased."
      Prices = [ { Resource = "culture"; Amount = 4000 } ]
      Effects = [ ("onAHillCultureCap", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "bigStickPolicy" ] }
    (* ---- outerSpaceTreaty ---- *)
    (* evaluateLocks: satellite count > 0 *)
    { Name = "outerSpaceTreaty"
      Label = "Outer Space Treaty"
      Description = "Agree that space is the domain of all of Cath's races, improving relations with all trading partners."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("globalRelationsBonus", 10) ]
      Unlocks = [  ]
      Blocks = [ "militarizeSpace" ] }
    (* ---- militarizeSpace ---- *)
    (* evaluateLocks: satellite count > 0 AND pacifism challenge not active *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "militarizeSpace"
      Label = "Militarize Space"
      Description = "Try to take over the skies. Your satellites science bonus to observatories is 10% more powerful."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("satelliteSynergyBonus", 0.1) ]
      Unlocks = [ ("spaceBuilding", [ "sattelite" ]); ("buildings", [ "observatory" ]) ]
      Blocks = [ "outerSpaceTreaty" ] }
    (* ---- lizardRelationsEcologists ---- *)
    (* evaluateLocks: checkRelation(lizards, 20) *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "lizardRelationsEcologists"
      Label = "Lizard Relations: Ecologists"
      Description = "The lizards love nature and want to protect it. Their ecologists are experts on operating green energy buildings. Depending on how many Hydro Plants are active, some of your Magnetos will still boost resource production even if turned off."
      Prices = [ { Resource = "culture"; Amount = 2100 } ]
      Effects = [ ("cathPollutionRatio", -0.05); ("solarFarmRatio", 0); ("hydroPlantRatio", 0) ]
      Unlocks = [ ("buildings", [ "magneto" ]) ]
      Blocks = [ "lizardRelationsPriests"; "lizardRelationsDiplomats" ] }
    (* ---- lizardRelationsPriests ---- *)
    (* evaluateLocks: checkRelation(lizards, 20) *)
    (* calculateEffects only calls unlockRelations (diplomacy-perk relation check) *)
    { Name = "lizardRelationsPriests"
      Label = "Lizard Relations: Priests"
      Description = "The lizards share the kittens' love of the sun. Their priests would be happy to help The Order of the Sun.<br>Manuscripts will grant a small bonus to faith."
      Prices = [ { Resource = "culture"; Amount = 2100 } ]
      Effects = [ ("cultureFromManuscripts", -0.25); ("faithFromManuscripts", 1) ]
      Unlocks = [  ]
      Blocks = [ "lizardRelationsEcologists"; "lizardRelationsDiplomats" ] }
    (* ---- lizardRelationsDiplomats ---- *)
    (* evaluateLocks: checkRelation(lizards, 20) *)
    { Name = "lizardRelationsDiplomats"
      Label = "Lizard Relations: Diplomats"
      Description = "Lizards are a peaceful race. If you want to befriend the races of Cath, they are more than willing to contribute.<br>Embassies built with neutral races will have a small effect on their attitude towards your people. With enough bonuses, they may become friendly."
      Prices = [ { Resource = "culture"; Amount = 2100 } ]
      Effects = [ ("neutralRaceEmbassyStanding", 0.001) ]
      Unlocks = [  ]
      Blocks = [ "lizardRelationsEcologists"; "lizardRelationsPriests" ] }
    (* ---- sharkRelationsScribes ---- *)
    (* evaluateLocks: checkRelation(sharks, 20) *)
    (* no effects in source; effect applied by DiplomacyManager#updateSharkScribes *)
    { Name = "sharkRelationsScribes"
      Label = "Shark Relations: Scribes"
      Description = "The shark scribes are keen on recording Cath's history and you can help each other in the form of a trade deal. If you give them more resources in trade, they are willing to share more of their recordings.<br>Effect increases as the years pass."
      Prices = [ { Resource = "culture"; Amount = 2200 } ]
      Effects = [  ]
      Unlocks = [  ]
      Blocks = [ "sharkRelationsMerchants"; "sharkRelationsBotanists" ] }
    (* ---- sharkRelationsMerchants ---- *)
    (* evaluateLocks: checkRelation(sharks, 20) *)
    (* no static effects; calculateEffects recomputes trade bonus via diplomacy and appends it to description *)
    { Name = "sharkRelationsMerchants"
      Label = "Shark Relations: Merchants"
      Description = "The sharks are experts of traveling through water, but not so much on land. Work together with their merchants to discover and share trade routes through water and land.<br>The more you trade, the more effective it becomes"
      Prices = [ { Resource = "culture"; Amount = 2200 } ]
      Effects = [  ]
      Unlocks = [  ]
      Blocks = [ "sharkRelationsScribes"; "sharkRelationsBotanists" ] }
    (* ---- sharkRelationsBotanists ---- *)
    (* evaluateLocks: checkRelation(sharks, 20) *)
    (* calculateEffects: ironWill -> woodRatio 0.25 instead of refinePolicyRatio 0.25 *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "sharkRelationsBotanists"
      Label = "Shark Relations: Botanists"
      Description = "The sharks cultivate a lot of catnip, so their botanists have a good understanding of it. Collaborate with them to study and improve catnip refinement and conversion processes."
      Prices = [ { Resource = "culture"; Amount = 2200 } ]
      Effects = [ ("refinePolicyRatio", 0.25); ("biolabEnergyRatio", -0.75); ("breweryPolicyManpowerRatio", 0.01); ("woodRatio", 0); ("biolabBiofuelScienceMaxRatio", 0.02) ]
      Unlocks = [ ("buildings", [ "biolab"; "brewery" ]) ]
      Blocks = [ "sharkRelationsScribes"; "sharkRelationsMerchants" ] }
    (* ---- griffinRelationsMetallurgists ---- *)
    (* evaluateLocks: checkRelation(griffins, 20) *)
    { Name = "griffinRelationsMetallurgists"
      Label = "Griffin Relations: Metallurgists"
      Description = "Griffins have a very good understanding of steelmaking and its intricate processes. Their metallurgists can help you by improving steel plants."
      Prices = [ { Resource = "culture"; Amount = 16000 } ]
      Effects = [ ("calcinerSteelRatioBonus", 0.15) ]
      Unlocks = [  ]
      Blocks = [ "griffinRelationsMachinists"; "griffinRelationsScouts" ] }
    (* ---- griffinRelationsScouts ---- *)
    (* evaluateLocks: checkRelation(griffins, 20) *)
    { Name = "griffinRelationsScouts"
      Label = "Griffin Relations: Scouts"
      Description = "Flight is very beneficial when looking for game. Propose collaborating with griffin scouts during hunts to improve its effectiveness."
      Prices = [ { Resource = "culture"; Amount = 16000 } ]
      Effects = [ ("hunterRatio", 0.5) ]
      Unlocks = [  ]
      Blocks = [ "griffinRelationsMachinists"; "griffinRelationsMetallurgists" ] }
    (* ---- griffinRelationsMachinists ---- *)
    (* evaluateLocks: checkRelation(griffins, 20) *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "griffinRelationsMachinists"
      Label = "Griffin Relations: Machinists"
      Description = "Griffins understand aerodynamics well and their machinists can improve your steamworks effectiveness."
      Prices = [ { Resource = "culture"; Amount = 16000 } ]
      Effects = [ ("magnetoBoostBonusPolicy", 0.005) ]
      Unlocks = [ ("buildings", [ "steamworks" ]) ]
      Blocks = [ "griffinRelationsMetallurgists"; "griffinRelationsScouts" ] }
    (* ---- nagaRelationsMasons ---- *)
    (* evaluateLocks: checkRelation(nagas, 20) *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "nagaRelationsMasons"
      Label = "Naga Relations: Masons"
      Description = "Nagas almost exclusively use minerals as building materials, so they have a lot of experience extracting and processing it. They can show you the secrets of efficiently crafting slabs using quarries."
      Prices = [ { Resource = "culture"; Amount = 8000 } ]
      Effects = [ ("quarrySlabCraftBonus", 0.025) ]
      Unlocks = [ ("buildings", [ "quarry" ]) ]
      Blocks = [ "nagaRelationsCultists"; "nagaRelationsArchitects" ] }
    (* ---- nagaRelationsCultists ---- *)
    (* evaluateLocks: checkRelation(nagas, 20) *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "nagaRelationsCultists"
      Label = "Naga Relations: Cultists"
      Description = "Nagas have very different religious traditions. Study naga cultist rituals and employ them during religious services.<br>Ziggurats will now be slightly affected by Order of the Sun upgrades."
      Prices = [ { Resource = "culture"; Amount = 8000 } ]
      Effects = [ ("zigguratTempleEffectPolicy", 0.1) ]
      Unlocks = [ ("buildings", [ "ziggurat" ]) ]
      Blocks = [ "nagaRelationsMasons"; "nagaRelationsArchitects" ] }
    (* ---- nagaRelationsArchitects ---- *)
    (* evaluateLocks: checkRelation(nagas, 20) *)
    (* calculateEffects: naga embassy-level-scaled blueprint trade chance (cap 0.1) then craft ratio *)
    { Name = "nagaRelationsArchitects"
      Label = "Naga Relations: Architects"
      Description = "Naga architects know some unique building techniques kittens do not possess, come to a trade agreement with them to obtain blueprints and study them.<br><br>Building Naga embassies will increase the chance to get blueprints from nagas by 0.25%, by up to 10%. Once the maximum bonus is achieved, they will improve the blueprint crafting ratio instead"
      Prices = [ { Resource = "culture"; Amount = 8000 } ]
      Effects = [ ("nagaBlueprintTradeChance", 0); ("blueprintCraftRatio", 0) ]
      Unlocks = [  ]
      Blocks = [ "nagaRelationsMasons"; "nagaRelationsCultists" ] }
    (* ---- spiderRelationsGeologists ---- *)
    (* evaluateLocks: checkRelation(spiders, 10) *)
    (* calculateEffects: all three effects = min(0.002 * spider embassies, 0.15) *)
    { Name = "spiderRelationsGeologists"
      Label = "Spider Relations: Geologists"
      Description = "The spiders are willing to help you find and exploit good mineral deposits in exchange for your continued partnership.<br>Each embassy you have with spiders will improve your mining industry by 0.2%, up to a maximum of 15%"
      Prices = [ { Resource = "culture"; Amount = 20000 } ]
      Effects = [ ("mineralsPolicyRatio", 0); ("coalPolicyRatio", 0); ("goldPolicyRatio", 0) ]
      Unlocks = [  ]
      Blocks = [ "spiderRelationsChemists"; "spiderRelationsPaleontologists" ] }
    (* ---- spiderRelationsChemists ---- *)
    (* evaluateLocks: checkRelation(spiders, 10) *)
    (* no static effects; calculateEffects adds/removes kerosene from spider sells *)
    { Name = "spiderRelationsChemists"
      Label = "Spider Relations: Chemists"
      Description = "While spiders have abundant oil, they do not have the means to create kerosene yet. Your chemists can help them study chemical processes.<br><br> Spiders will now sell kerosene"
      Prices = [ { Resource = "culture"; Amount = 20000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Blocks = [ "spiderRelationsGeologists"; "spiderRelationsPaleontologists" ] }
    (* ---- spiderRelationsPaleontologists ---- *)
    (* evaluateLocks: checkRelation(spiders, 10) *)
    { Name = "spiderRelationsPaleontologists"
      Label = "Spider Relations: Paleontologists"
      Description = "Paleontology is the study of ancient life through fossil records. The spider paleontologists can help you discover these fossils. They can also give you a better understanding of how and where oil was formed, improving the oil industry"
      Prices = [ { Resource = "culture"; Amount = 20000 } ]
      Effects = [ ("mintIvoryRatio", 0.15); ("oilPolicyRatio", 0.1) ]
      Unlocks = [  ]
      Blocks = [ "spiderRelationsChemists"; "spiderRelationsGeologists" ] }
    (* ---- dragonRelationsPhysicists ---- *)
    (* evaluateLocks: checkRelation(dragons, 10) *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "dragonRelationsPhysicists"
      Label = "Dragon Relations: Physicists"
      Description = "Dragon physicists are experts on nuclear energy. They can help by improving your reactors."
      Prices = [ { Resource = "culture"; Amount = 30000 } ]
      Effects = [ ("reactorEnergyRatio", 0.25); ("harborLimitRatioPolicy", 0.05) ]
      Unlocks = [ ("buildings", [ "harbor" ]) ]
      Blocks = [ "dragonRelationsAstrologers"; "dragonRelationsDynamicists" ] }
    (* ---- dragonRelationsAstrologers ---- *)
    (* evaluateLocks: checkRelation(dragons, 10) *)
    (* calculateEffects: both effects scale with (cycleYear + 1) *)
    { Name = "dragonRelationsAstrologers"
      Label = "Dragon Relations: Astrologers"
      Description = "The dragons have a long standing tradition of studying celestial objects. Work together with dragon astrologers to study the stars and get a look into their unique understanding of them.<br>Each year spent in a cycle increases starchart production"
      Prices = [ { Resource = "culture"; Amount = 30000 } ]
      Effects = [ ("starEventChance", 0.004); ("starchartPolicyRatio", 0.03) ]
      Unlocks = [  ]
      Blocks = [ "dragonRelationsPhysicists"; "dragonRelationsDynamicists" ] }
    (* ---- dragonRelationsDynamicists ---- *)
    (* evaluateLocks: checkRelation(dragons, 10) *)
    { Name = "dragonRelationsDynamicists"
      Label = "Dragon Relations: Dynamicists"
      Description = "Motion is an important concept in dragon society. For that reason they have a whole branch of scientists who study specifically locomotion and its intricacies. Dragons can improve your varying forms of travel."
      Prices = [ { Resource = "culture"; Amount = 30000 } ]
      Effects = [ ("tradeCatpowerDiscount", 5); ("huntCatpowerDiscount", 10); ("catpowerReductionRatio", 0.5) ]
      Unlocks = [  ]
      Blocks = [ "dragonRelationsPhysicists"; "dragonRelationsAstrologers" ] }
    (* ---- stoicism ---- *)
    (* policies entry is `unlocks`, buildings entry is `upgrades` in source *)
    { Name = "stoicism"
      Label = "Stoicism"
      Description = "The stoics teach that kittens ought to endure hardship without complaint. Halve consumption of luxury resources, and breweries will consume less resources."
      Prices = [ { Resource = "culture"; Amount = 2500 } ]
      Effects = [ ("luxuryDemandRatio", -0.5); ("breweryConsumptionRatio", -0.25) ]
      Unlocks = [ ("policies", [ "rationality"; "mysticism"; "rationing"; "frugality" ]); ("buildings", [ "brewery" ]) ]
      Blocks = [ "epicurianism" ] }
    (* ---- epicurianism ---- *)
    { Name = "epicurianism"
      Label = "Epicurianism"
      Description = "Epicurean kittens believe that pleasure is the highest good. Luxury resources will provide slightly more happiness."
      Prices = [ { Resource = "culture"; Amount = 2500 } ]
      Effects = [ ("luxuryHappinessBonus", 1) ]
      Unlocks = [ ("policies", [ "rationality"; "mysticism"; "carnivale"; "extravagance" ]) ]
      Blocks = [ "stoicism" ] }
    (* ---- carnivale ---- *)
    { Name = "carnivale"
      Label = "Carnivale"
      Description = "A contingent of epicurean philosophers branches off into party planning. Embrace this school of thought, boosting kitten arrival speed during festivals in exchange for increasing luxury resource consumption during them."
      Prices = [ { Resource = "culture"; Amount = 3500 } ]
      Effects = [ ("festivalArrivalRatio", 0.3); ("festivalLuxuryConsumptionRatio", 0.3) ]
      Unlocks = [  ]
      Blocks = [ "extravagance" ] }
    (* ---- extravagance ---- *)
    { Name = "extravagance"
      Label = "Extravagance"
      Description = "A faction of epicurean philosophers holds that society ought to double down on its current philosophy. Consumable luxury resources increase happiness even more, but are consumed three times as quickly."
      Prices = [ { Resource = "culture"; Amount = 3500 } ]
      Effects = [ ("luxuryDemandRatio", 2); ("consumableLuxuryHappiness", 5) ]
      Unlocks = [  ]
      Blocks = [ "carnivale" ] }
    (* ---- rationing ---- *)
    { Name = "rationing"
      Label = "Rationing"
      Description = "Stoic philosophers encourage restraint and saving, making hunting more effective and reducing the effect of happiness on catnip consumption."
      Prices = [ { Resource = "culture"; Amount = 3500 } ]
      Effects = [ ("hapinnessConsumptionRatio", -0.1); ("hunterRatio", 0.1) ]
      Unlocks = [  ]
      Blocks = [ "frugality" ] }
    (* ---- frugality ---- *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "frugality"
      Label = "Frugality"
      Description = "Stoic philosophers are placed in charge of the mints, making them more effective by reducing corruption."
      Prices = [ { Resource = "culture"; Amount = 3500 } ]
      Effects = [ ("mintRatio", 0.1) ]
      Unlocks = [ ("buildings", [ "mint" ]) ]
      Blocks = [ "rationing" ] }
    (* ---- rationality ---- *)
    { Name = "rationality"
      Label = "Rationality"
      Description = "Accept the view that the world can be fundamentally understood. Gain a small bonus to science and iron production, though you might look silly later."
      Prices = [ { Resource = "culture"; Amount = 3000 } ]
      Effects = [ ("sciencePolicyRatio", 0.05); ("ironPolicyRatio", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "mysticism" ] }
    (* ---- mysticism ---- *)
    { Name = "mysticism"
      Label = "Mysticism"
      Description = "Accept the view that there are forces beyond the comprehension of kittens. Gain a small bonus to culture and faith production, though you might look silly for a while."
      Prices = [ { Resource = "culture"; Amount = 3000 } ]
      Effects = [ ("culturePolicyRatio", 0.05); ("faithPolicyRatio", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "rationality" ] }
    (* ---- stripMining ---- *)
    { Name = "stripMining"
      Label = "Strip Mining"
      Description = "Decapitate the hills in an effort to improve your mineral production."
      Prices = [ { Resource = "science"; Amount = 2000 } ]
      Effects = [ ("environmentUnhappiness", -2); ("mineralsPolicyRatio", 0.3); ("cathPollutionRatio", 0.05) ]
      Unlocks = [ ("policies", [ "sustainability"; "fullIndustrialization" ]) ]
      Blocks = [ "clearCutting"; "environmentalism" ] }
    (* ---- clearCutting ---- *)
    { Name = "clearCutting"
      Label = "Clear Cutting"
      Description = "Totally destroy the forest in an effort to improve your wood production."
      Prices = [ { Resource = "science"; Amount = 2000 } ]
      Effects = [ ("environmentUnhappiness", -2); ("woodPolicyRatio", 0.3); ("cathPollutionRatio", 0.05) ]
      Unlocks = [ ("policies", [ "sustainability"; "fullIndustrialization" ]) ]
      Blocks = [ "stripMining"; "environmentalism" ] }
    (* ---- environmentalism ---- *)
    { Name = "environmentalism"
      Label = "Environmentalism"
      Description = "Preserve the natural beauty of your village, slightly improving kittens' happiness."
      Prices = [ { Resource = "culture"; Amount = 2000 } ]
      Effects = [ ("environmentHappinessBonus", 3); ("cathPollutionRatio", -0.05) ]
      Unlocks = [ ("policies", [ "conservation"; "openWoodlands" ]) ]
      Blocks = [ "stripMining"; "clearCutting" ] }
    (* ---- sustainability ---- *)
    (* evaluateLocks: (stripMining OR clearCutting researched) AND industrialization researched *)
    { Name = "sustainability"
      Label = "Sustainability"
      Description = "Start taking the environmentalists' advice, removing the happiness penalty from strip mining/clear cutting and even improve it thanks to sustainable future."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("environmentHappinessBonus", 5); ("cathPollutionRatio", -0.05) ]
      Unlocks = [  ]
      Blocks = [ "fullIndustrialization" ] }
    (* ---- fullIndustrialization ---- *)
    (* evaluateLocks: (stripMining OR clearCutting researched) AND industrialization researched *)
    (* Unlocks is `upgrades` in source (effect-recalc trigger, not visibility) *)
    { Name = "fullIndustrialization"
      Label = "Full Industrialization"
      Description = "Take the advice of your new captains of industry, slightly improving the crafting bonus each factory provides."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("environmentFactoryCraftBonus", 0.05); ("cathPollutionRatio", 0.05) ]
      Unlocks = [ ("buildings", [ "factory" ]) ]
      Blocks = [ "sustainability" ] }
    (* ---- conservation ---- *)
    (* evaluateLocks: environmentalism researched AND ecology researched *)
    { Name = "conservation"
      Label = "Conservation"
      Description = "Keep actively protecting the environment, increasing happiness from environment."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("environmentHappinessBonus", 5); ("cathPollutionRatio", -0.05) ]
      Unlocks = [  ]
      Blocks = [ "openWoodlands" ] }
    (* ---- openWoodlands ---- *)
    (* evaluateLocks: environmentalism researched AND ecology researched *)
    { Name = "openWoodlands"
      Label = "Open Woodlands"
      Description = "Allow some limited development of nearby lands, increasing wood and mineral production."
      Prices = [ { Resource = "culture"; Amount = 10000 } ]
      Effects = [ ("mineralsPolicyRatio", 0.125); ("woodPolicyRatio", 0.125); ("cathPollutionRatio", 0.05) ]
      Unlocks = [  ]
      Blocks = [ "conservation" ] }
    (* ---- cryochamberExtraction ---- *)
    (* no effects in source; onResearch: usedCryochambers +1 (single-use policy) *)
    { Name = "cryochamberExtraction"
      Label = "Immortalism"
      Description = "Extract cryochambers (?)"
      Prices = [ { Resource = "manpower"; Amount = 10000 } ]
      Effects = [  ]
      Unlocks = [  ]
      Blocks = [ "terraformingInsight" ] }
    (* ---- terraformingInsight ---- *)
    { Name = "terraformingInsight"
      Label = "Space expansionism"
      Description = "Terraforming efficiency is increased"
      Prices = [ { Resource = "manpower"; Amount = 10000 } ]
      Effects = [ ("terraformingMaxKittensRatio", 0.1) ]
      Unlocks = [  ]
      Blocks = [ "cryochamberExtraction" ] }
    (* ---- siphoning ---- *)
    (* evaluateLocks: MAUSOLEUM_PACTS flag AND mausoleum TU count > 0 AND marker ZU count > 0 *)
    (* calculateEffects hides this policy (unlocked=false) when MAUSOLEUM_PACTS is off *)
    { Name = "siphoning"
      Label = "Siphoning"
      Description = "Pacts no longer continuously consume necrocorns. Instead, whenever a necrocorn is produced, it may be siphoned away to pay off debt. Small amounts of debt are harmless."
      Prices = [ { Resource = "necrocorn"; Amount = 1 } ]
      Effects = [ ("smallDebtPunishmentExemption", 5); ("repayDebtOnNecrocornGeneration", 1) ]
      Unlocks = [  ]
      Blocks = [ "feedingFrenzy"; "upfrontPayment" ] }
    (* ---- feedingFrenzy ---- *)
    (* evaluateLocks: MAUSOLEUM_PACTS flag AND mausoleum TU count > 0 AND marker ZU count > 0 *)
    (* calculateEffects: feedEldersEfficiencyRatio = DR(pactsAvailable, 50); hidden when flag off *)
    { Name = "feedingFrenzy"
      Label = "Feeding Frenzy"
      Description = "Your divine feast is more effective (based on available Pacts) but causes interference with necrocorn corruption. Necrocorns corrupt at full speed between 0 and 1 necrocorns."
      Prices = [ { Resource = "necrocorn"; Amount = 1 } ]
      Effects = [ ("feedEldersEfficiencyRatio", 0); ("necrocornCorruptionInterference", -0.1) ]
      Unlocks = [  ]
      Blocks = [ "siphoning"; "upfrontPayment" ] }
    (* ---- upfrontPayment ---- *)
    (* evaluateLocks: MAUSOLEUM_PACTS flag AND mausoleum TU count > 0 AND marker ZU count > 0 *)
    (* upgrades:null in source, initialized at runtime to all pacts; onResearch: immediately pay upfront cost for active pacts *)
    { Name = "upfrontPayment"
      Label = "Upfront Payment"
      Description = "Renegotiate Pacts to reduce upkeep cost by 10%. If there is any debt, it is more punishing.<br>Upon purchasing this policy, you must immediately pay the upfront cost for all existing Pacts."
      Prices = [ { Resource = "necrocorn"; Amount = 1 } ]
      Effects = [ ("pactNecrocornConsumption", 5e-5); ("pactNecrocornUpfrontCost", 2) ]
      Unlocks = [  ]
      Blocks = [ "siphoning"; "feedingFrenzy" ] }
]

(* no discrepancies: all extracted fields match orig *)
