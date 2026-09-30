#!/usr/bin/env node
"use strict";
// Mark ledger units verified (religion cluster, session 2026-09-30-22).
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["religion-10", "Praise/adore/transcend controllers: worship gain ×(1+apocrypha), adore ×(tt+1)² with undo DELTA (was absolute), transcend strict-> ladder + TU tier-unlock via button-handler loop (tumove resop) — religion-controllers.cat IDENTICAL"],
  ["religion-11", "Transform controller: getCanAfford cap-clamped floor-1, divider fractions (all/half), overcap = attempted−actual (0 uncapped), applyAtGain stat bump (unicornsSacrificed), alicorn→TC + TC→relic ×(1+relicRefineRatio×BP effective) — religion-controllers.cat IDENTICAL"],
  ["religion-12", "RefineTears: tears 10000 → sorrow.value++ direct write capped at 17, blackPyramid-unlocked gating — religion-controllers.cat IDENTICAL"],
  ["religion-13", "Pacts: PactsBtnController cap + upfront + deficit (already); TU purchase added (tier gates, darkParacosm paragon priceRatio 2 ladder); RU dynamic noStackable (transcendence.on); ZU calc tables (skyPalace/utopia/sunspire REPLACE with alicornmancy + unicornTears caps, blackPyramid effective = val + blackSky-retired bonus) — religion-controllers.cat IDENTICAL"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-22", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +4 religion");
