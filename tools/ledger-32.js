#!/usr/bin/env node
"use strict";
const fs = require("fs");
let t = fs.readFileSync("ledger/migration.yaml", "utf8");
const marks = {
  "game-17": "Reset/prestige flow: getResetPrestige (simScalingRatio-rounded kittens, anarchy ×2, karma ladder 35/60/100/150/300/750, paragon >70), _getBonusZebras (archery+karmaZebras<10, science sum, limitedDR/10000, IW zebras gate), reset → onRunReset (ironWill/pacifism on-reset checks) → pending clears → resetAutomatic schedule → _resetInternal: post-reset save blob byte-exact (persisted resources per Persists flags + TC anachronomancy gate + void floor + craftable sqrt×100 + paragon add; carried game/opts/prestige/achievements/ach/telemetry; challenge flip active=wasPending; apocripha faithRatio bonus; TU/press-cap/usedCryochambers carry; empty sections; stats+totalParagon/totalResets; statsCurrent zeros; timestamp; cathPollution 0), pause + reload via the broken-load quirk — reset.cat IDENTICAL incl. byte-exact savedump",
  "time-13": "TimeTab/flux/heat/reset widgets: the ResetWgt breakdown feed (getResetPrestige) verified via the resetprestige probe (reset.cat); flux/heat states snapshot-verified; tab DOM out of oracle scope",
};
for (const [id, ver] of Object.entries(marks)) {
  const re = new RegExp('(\{ id: "' + id + '"[^}]*?)status: not-started([^}]*\})');
  if (!re.test(t)) { console.error("MISS " + id); continue; }
  t = t.replace(re, '$1status: verified, session: "2026-10-01-30", verification: "' + ver + '"$2');
}
fs.writeFileSync("ledger/migration.yaml", t);
console.log("marked game-17 + time-13");
