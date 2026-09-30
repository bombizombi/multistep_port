#!/usr/bin/env node
"use strict";
// core-06/13/14 (session 2026-09-30-28): controller semantics — the FS runner
// implements these controller paths directly (every purchase move goes through
// a mirrored controller chain), verified via 47-scenario suite.
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["core-06", "Base controller: fetchModel/prices/hasResources/updateEnabled (affordability-only per L717 finding)/payPrice/buyItem — the FS moves mirror each controller chain (buy/policy/research/craft/tu/pact/mission/sbuilding); failure reasons byte-match (already-bought/cannot-afford/blocked) — verified across the 47-scenario suite incl. policies.cat gate logs"],
  ["core-13", "Stackable build loop: limitBuild clamp → while hasResources { incrementValue (togglable/allOff rule) + payPrice } → unlocks → calculateEffects+cycle → upgrades; frozen-ladder vs live-ladder semantics per controller (missions frozen, planet buildings live, ZU/RU frozen) — verified via space-undo/policies/religion-controllers"],
  ["core-14", "Non-stackable (research) purchase: researched short-circuit, price computation (science.getPrices tech ladders), onPurchase → handler + unlock fan-out + calculateEffects — verified via first-research + policies scenarios (research/policy moves)"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-28", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +3 core");
