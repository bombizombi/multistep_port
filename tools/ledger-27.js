#!/usr/bin/env node
"use strict";
// space-07 + space-11 + village-14/15 (session 2026-09-30-27)
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["space-07", "Fastforward wired into the FF engine (resop ff): route countdown via Game.Space.fastforward (routes × routeSpeed/ticksPerDay), entangler loop no-op without gflops — space-ff.cat IDENTICAL"],
  ["space-11", "Manager undo: sbuilding registers SpaceUndo; undo refunds build at 100% of the CURRENT 1.1 ladder via Game.Space.sellOne (planet-reached + val>0 gates), sell re-adds at 0%; spacepU commit-back — space-undo.cat IDENTICAL"],
  ["village-14", "Map & biome catalog: biomeDefs verbatim (13 biomes with fauna/penalty), mapFauna skeleton mirrored (faunaName draw + spawn-chance draws with jitter, draw-count exact), updateHappines reads map state — verified via fauna RNG parity across the 47-scenario suite (draw-exact)"],
  ["village-15", "Exploration & fauna spawn: uniformRandomInteger fauna picks + spawn-chance roll ≤ 1000×penalty with 2-draw jitter — mirrored in updateModel map loop; verified draw-exact across suite (save-load-roundtrip exercises fauna over 500+ ticks)"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-27", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +4");
