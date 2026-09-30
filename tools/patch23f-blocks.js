"use strict";
// Regenerate the blocks table verbatim from the orig parse.
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Catalog.Policies.fs";
let t = fs.readFileSync(q, "utf8");
const start = t.indexOf("let blocks : Map<string, string list> =");
const end = t.indexOf("/// meta.upgrades chains");
if (start < 0 || end < 0) { console.error("anchors"); process.exit(1); }
const table = `let blocks : Map<string, string list> =
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

`;
fs.writeFileSync(q, t.slice(0, start) + table + t.slice(end));
console.log("ok blocks verbatim");
