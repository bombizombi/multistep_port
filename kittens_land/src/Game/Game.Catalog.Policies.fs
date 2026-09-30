module Game.Catalog.Policies

// science-05/06/07: policy effects tables (js/science.js L854-2160) — the
// static `effects` objects + calculateEffects policies. Storage form: only
// effect-carrying policies appear; everything else contributes nothing.
// calculateEffects semantics live in Game.Managers.policyCalcEffects.

// Price comes from Game.Types — but Types needs this module first, so the
// Price shape is structurally mirrored (single Resource/Val pair).
type Price = { Resource: string; Val: float }

let effects : Map<string, Map<string, float>> =
    let m = Map.ofList
    [
      "liberty", m ["maxKittens", 0.0; "happinessKittenProductionRatio", 0.1]
      "tradition", m ["cultureFromManuscripts", 1.0; "manuscriptParchmentCost", -5.0; "manuscriptCultureCost", -100.0]
      "monarchy", m ["goldPolicyRatio", -0.1]
      "authocracy", m ["rankLeaderBonusConversion", 0.0]
      "republic", m ["boostFromLeader", 0.01]
      // socialism: static effects {} — and its buggy calculateEffects builds a
      // LOCAL empty table (js/science.js L977-986): contributes nothing, ever
      "liberalism", m ["goldCostReduction", 0.2; "globalRelationsBonus", 10.0]
      "communism", m ["factoryCostReduction", 0.3; "coalPolicyRatio", 0.25; "ironPolicyRatio", 0.25; "titaniumPolicyRatio", 0.25]
      "fascism", m ["logHouseCostReduction", 0.5]
      "technocracy", m ["technocracyScienceCap", 0.2; "antimatterPolicyRatio", 0.0625; "queueCapRatio", 0.2]
      "theocracy", m ["faithPolicyRatio", 0.2]
      "expansionism", m ["unobtainiumPolicyRatio", 0.15]
      "transkittenism", m ["aiCoreProductivness", 1.0; "aiCoreUpgradeBonus", 0.1]
      "necrocracy", m ["blsProductionBonus", 0.001; "leviathansEnergyModifier", 0.05]
      "radicalXenophobia", m ["mausoleumBonus", 1.0; "pactsAvailable", 5.0]
      "diplomacy", m ["tradeCatpowerDiscount", 5.0]
      "isolationism", m ["tradeGoldDiscount", 1.0]
      "zebraRelationsAppeasement", m ["goldPolicyRatio", -0.05; "zebraRelationModifier", 15.0]
      "zebraRelationsBellicosity", m ["nonZebraRelationModifier", 5.0; "zebraRelationModifier", -10.0]
      "knowledgeSharing", m ["sciencePolicyRatio", 0.05]
      "culturalExchange", m ["culturePolicyRatio", 0.05]
      "bigStickPolicy", m ["embassyCostReduction", 0.15]
      "cityOnAHill", m ["onAHillCultureCap", 0.05]
      "outerSpaceTreaty", m ["globalRelationsBonus", 10.0]
      "militarizeSpace", m ["satelliteSynergyBonus", 0.1]
      "lizardRelationsEcologists", m ["cathPollutionRatio", -0.05; "solarFarmRatio", 0.0; "hydroPlantRatio", 0.0]
      "lizardRelationsDiplomats", m ["neutralRaceEmbassyStanding", 0.001]
      "sharkRelationsBotanists", m ["refinePolicyRatio", 0.25; "biolabEnergyRatio", -0.75; "breweryPolicyManpowerRatio", 0.01; "woodRatio", 0.0; "biolabBiofuelScienceMaxRatio", 0.02]
      "griffinRelationsMetallurgists", m ["calcinerSteelRatioBonus", 0.15]
      "griffinRelationsScouts", m ["hunterRatio", 0.5]
      "griffinRelationsMachinists", m ["magnetoBoostBonusPolicy", 0.005]
      "nagaRelationsMasons", m ["quarrySlabCraftBonus", 0.025]
      "nagaRelationsCultists", m ["zigguratTempleEffectPolicy", 0.1]
      "nagaRelationsArchitects", m ["nagaBlueprintTradeChance", 0.0; "blueprintCraftRatio", 0.0]
      "spiderRelationsGeologists", m ["mineralsPolicyRatio", 0.0; "coalPolicyRatio", 0.0; "goldPolicyRatio", 0.0]
      "spiderRelationsPaleontologists", m ["mintIvoryRatio", 0.15; "oilPolicyRatio", 0.1]
      "dragonRelationsPhysicists", m ["reactorEnergyRatio", 0.25; "harborLimitRatioPolicy", 0.05]
      "dragonRelationsAstrologers", m ["starEventChance", 0.004; "starchartPolicyRatio", 0.03]
      "dragonRelationsDynamicists", m ["tradeCatpowerDiscount", 5.0; "huntCatpowerDiscount", 10.0; "catpowerReductionRatio", 0.5]
      "stoicism", m ["luxuryDemandRatio", -0.5; "breweryConsumptionRatio", -0.25]
      "epicurianism", m ["luxuryHappinessBonus", 1.0]
      "carnivale", m ["festivalArrivalRatio", 0.3; "festivalLuxuryConsumptionRatio", 0.3]
      "extravagance", m ["luxuryDemandRatio", 2.0; "consumableLuxuryHappiness", 5.0]
      "rationing", m ["hapinnessConsumptionRatio", -0.1; "hunterRatio", 0.1]
      "frugality", m ["mintRatio", 0.1]
      "rationality", m ["sciencePolicyRatio", 0.05; "ironPolicyRatio", 0.05]
      "mysticism", m ["culturePolicyRatio", 0.05; "faithPolicyRatio", 0.05]
      "stripMining", m ["environmentUnhappiness", -2.0; "mineralsPolicyRatio", 0.3; "cathPollutionRatio", 0.05]
      "clearCutting", m ["environmentUnhappiness", -2.0; "woodPolicyRatio", 0.3; "cathPollutionRatio", 0.05]
      "environmentalism", m ["environmentHappinessBonus", 3.0; "cathPollutionRatio", -0.05]
      "sustainability", m ["environmentHappinessBonus", 5.0; "cathPollutionRatio", -0.05]
      "fullIndustrialization", m ["environmentFactoryCraftBonus", 0.05; "cathPollutionRatio", 0.05]
      "conservation", m ["environmentHappinessBonus", 5.0; "cathPollutionRatio", -0.05]
      "openWoodlands", m ["mineralsPolicyRatio", 0.125; "woodPolicyRatio", 0.125; "cathPollutionRatio", 0.05]
      "terraformingInsight", m ["terraformingMaxKittensRatio", 0.1]
      "siphoning", m ["smallDebtPunishmentExemption", 5.0; "repayDebtOnNecrocornGeneration", 1.0]
      "feedingFrenzy", m ["feedEldersEfficiencyRatio", 0.0; "necrocornCorruptionInterference", -0.1]
      "upfrontPayment", m ["pactNecrocornConsumption", 5.0e-5; "pactNecrocornUpfrontCost", 2.0]
    ] |> Map.ofList

/// meta.blocks rivals (purchase permanently blocks + refuses when a rival is
/// already researched — js/science.js PolicyBtnController.shouldBeBought)
let blocks : Map<string, string list> =
    Map.ofList
      [ "liberty", [ "tradition" ]; "tradition", [ "liberty" ]
        "monarchy", [ "authocracy"; "republic"; "communism" ]
        "authocracy", [ "monarchy"; "republic"; "liberalism" ]
        "republic", [ "monarchy"; "authocracy"; "fascism" ]
        "liberalism", [ "communism"; "fascism" ]
        "communism", [ "liberalism"; "fascism" ]
        "fascism", [ "liberalism"; "communism" ]
        "technocracy", [ "theocracy"; "expansionism" ]
        "theocracy", [ "technocracy"; "expansionism" ]
        "expansionism", [ "technocracy"; "theocracy" ]
        "transkittenism", [ "necrocracy"; "radicalXenophobia" ]
        "necrocracy", [ "transkittenism"; "radicalXenophobia" ]
        "radicalXenophobia", [ "transkittenism"; "necrocracy" ]
        "diplomacy", [ "isolationism" ]; "isolationism", [ "diplomacy" ]
        "zebraRelationsAppeasement", [ "zebraRelationsBellicosity" ]; "zebraRelationsBellicosity", [ "zebraRelationsAppeasement" ]
        "knowledgeSharing", [ "culturalExchange" ]; "culturalExchange", [ "knowledgeSharing" ]
        "bigStickPolicy", [ "cityOnAHill" ]; "cityOnAHill", [ "bigStickPolicy" ]
        "outerSpaceTreaty", [ "militarizeSpace" ]; "militarizeSpace", [ "outerSpaceTreaty" ]
        "lizardRelationsEcologists", [ "lizardRelationsPriests"; "lizardRelationsDiplomats" ]
        "lizardRelationsPriests", [ "lizardRelationsEcologists"; "lizardRelationsDiplomats" ]
        "lizardRelationsDiplomats", [ "lizardRelationsEcologists"; "lizardRelationsPriests" ]
        "sharkRelationsScribes", [ "sharkRelationsMerchants"; "sharkRelationsBotanists" ]
        "sharkRelationsMerchants", [ "sharkRelationsScribes"; "sharkRelationsBotanists" ]
        "sharkRelationsBotanists", [ "sharkRelationsScribes"; "sharkRelationsMerchants" ]
        "griffinRelationsMetallurgists", [ "griffinRelationsMachinists"; "griffinRelationsScouts" ]
        "griffinRelationsScouts", [ "griffinRelationsMachinists"; "griffinRelationsMetallurgists" ]
        "griffinRelationsMachinists", [ "griffinRelationsMetallurgists"; "griffinRelationsScouts" ]
        "nagaRelationsMasons", [ "nagaRelationsCultists"; "nagaRelationsArchitects" ]
        "nagaRelationsCultists", [ "nagaRelationsMasons"; "nagaRelationsArchitects" ]
        "nagaRelationsArchitects", [ "nagaRelationsMasons"; "nagaRelationsCultists" ]
        "spiderRelationsGeologists", [ "spiderRelationsChemists"; "spiderRelationsPaleontologists" ]
        "spiderRelationsChemists", [ "spiderRelationsGeologists"; "spiderRelationsPaleontologists" ]
        "spiderRelationsPaleontologists", [ "spiderRelationsChemists"; "spiderRelationsGeologists" ]
        "dragonRelationsPhysicists", [ "dragonRelationsAstrologers"; "dragonRelationsDynamicists" ]
        "dragonRelationsAstrologers", [ "dragonRelationsPhysicists"; "dragonRelationsDynamicists" ]
        "dragonRelationsDynamicists", [ "dragonRelationsPhysicists"; "dragonRelationsAstrologers" ]
        "stoicism", [ "epicurianism" ]; "epicurianism", [ "stoicism" ]
        "carnivale", [ "extravagance" ]; "extravagance", [ "carnivale" ]
        "rationing", [ "frugality" ]; "frugality", [ "rationing" ]
        "rationality", [ "mysticism" ]; "mysticism", [ "rationality" ]
        "stripMining", [ "clearCutting"; "environmentalism" ]
        "clearCutting", [ "stripMining"; "environmentalism" ]
        "environmentalism", [ "stripMining"; "clearCutting" ]
        "sustainability", [ "fullIndustrialization" ]; "fullIndustrialization", [ "sustainability" ]
        "conservation", [ "openWoodlands" ]; "openWoodlands", [ "conservation" ]
        "cryochamberExtraction", [ "terraformingInsight" ]
        "siphoning", [ "feedingFrenzy"; "upfrontPayment" ]
        "feedingFrenzy", [ "siphoning"; "upfrontPayment" ]
        "upfrontPayment", [ "siphoning"; "feedingFrenzy" ] ]

/// meta.upgrades chains (game.upgrade recalcs after purchase)
let upgrades : Map<string, string list> =
    Map.ofList
      [ "monarchy", [ "factory" ]; "transkittenism", [ "library"; "moonBase" ]
        "radicalXenophobia", [ "mausoleum"; "feedingFrenzy" ]; "militarizeSpace", [ "sattelite"; "observatory" ]
        "stoicism", [ "brewery" ]; "frugality", [ "mint" ]
        "sharkRelationsBotanists", [ "biolab"; "brewery" ]; "griffinRelationsMachinists", [ "steamworks" ]
        "nagaRelationsMasons", [ "quarry" ]; "nagaRelationsCultists", [ "ziggurat" ]
        "dragonRelationsPhysicists", [ "harbor" ]; "fullIndustrialization", [ "factory" ]
        "scientificCommunism", [ "socialism" ] ]

/// policies whose unlock carries an evaluateLocks veto beyond relations
/// (game.js L6070: unlock skips metas whose evaluateLocks returns false)
let evaluateLocks : Map<string, string> =
    Map.ofList
      [ "liberalism", "factory"
        "communism", "factory"
        "fascism", "factory"
        "scientificCommunism", "scientificCommunism"
        "knowledgeSharing", "astronomy"
        "culturalExchange", "astronomy"
        "bigStickPolicy", "bigStickPolicy"
        "cityOnAHill", "cityOnAHill"
        "outerSpaceTreaty", "sattelite"
        "militarizeSpace", "militarizeSpace"
        "sustainability", "sustainability"
        "fullIndustrialization", "sustainability"
        "conservation", "conservation"
        "openWoodlands", "conservation" ]

/// onResearch hooks (js/science.js): cryochamberExtraction bumps the
/// usedCryochambers VSU; upfrontPayment pays necrocorns up front
let onResearch : Map<string, string> =
    Map.ofList [ "cryochamberExtraction", "cryochamberExtraction"; "upfrontPayment", "upfrontPayment" ]

/// theocracy requiredLeaderJob
let requiredLeaderJob : Map<string, string> = Map.ofList [ "theocracy", "priest" ]
