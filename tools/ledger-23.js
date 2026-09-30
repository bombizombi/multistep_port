#!/usr/bin/env node
"use strict";
// Mark diplomacy units (session 2026-09-30-23).
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["diplomacy-09", "Standing + trade chances: getFinalStanding with phantom-tradepost policy math (globalRelationsBonus + zebra/nonZebra modifiers × tradepost standingRatio 0.0035 w/ caravanserai), lizardRelationsDiplomats neutral-race branch, chance fns (spice/blueprint/resource w/ embassy LDR) — diplomacy-cluster.cat IDENTICAL"],
  ["diplomacy-10", "Trade flow: duration clamp 100×(4+E), tradeRatio = 1 + trade + phantom×0.015 + pacifism getTradeBonusEffect, postApocalypse manpower/gold cost multipliers, nonRandom draw edge — diplomacy-cluster.cat IDENTICAL"],
  ["diplomacy-11", "Embassy purchase: ladder culture × (1−embassyCostReduction) × 1.15^(level + embassyFakeBought), buy loop, unlockRelations fan-out — diplomacy-cluster.cat IDENTICAL"],
  ["diplomacy-12", "Explorers + race unlock: unlockRandomRace consumes the draw even when unmetRaces empty; explore move pays 1000 manpower (+950 refund on failure); year-gate logic — diplomacy-cluster.cat IDENTICAL"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-23", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +4 diplomacy");
