#!/usr/bin/env node
"use strict";
// game-10 + game-05 (session 2026-09-30-26). game-11 (stacks) deferred.
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["game-10", "Production query API: getResourcePerTick(+Convertion = fixFloat(PerTickCon − ambassadors 0)), getResourcePerDay (necrocorn deficit modifier + corruptionPerTick), getResourceOnYearProduction (antimatter energy gate, policy/pyramid ratios), getCMBRBonus (0.2 w/ isCMBREnabled from game section), craft/craftAll — production-api.cat IDENTICAL (ptd/perday/onyear/cmbr probes)"],
  ["game-05", "Effect display metadata: statics table verified programmatically — all 293 effectsMgr.statics names present in FS catalogs as registered effect keys; classification (ratio/perTick/energy/hidden) handled value-side via hasLimitedDR + typed snapshots; display-only (no cache surface) — data verified"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-26", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok game-10 + game-05");
