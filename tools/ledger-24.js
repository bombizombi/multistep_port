#!/usr/bin/env node
"use strict";
// settings-01/02/03 + config-01 (session 2026-09-30-24)
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["settings-01", "Boolean option metadata table: 24 settingsArr entries in orig order with exact defaults + isExtra/devModeOnly flags; emission from live state in the save builder opts section — settings-opts.cat IDENTICAL"],
  ["settings-02", "SettingsManager: Game.Settings.setBool with the onChange firing rule (old defined AND changed); hodl onChange → sellBcoin (blackcoin × bcoinPrice 63918 when old hodl on, cryptoPrice when off → relic, stash zeroed); OptsState fresh/reset — settings-opts.cat IDENTICAL"],
  ["settings-03", "Save/load hooks: opts parsed from the game section on load (all booleans + notation + batchSize), tooltipsInRightColumn default, hodl opt-out when absent (old saves), no-opts → hodl false; useWorkers migration note; opts round-trip byte-exact — settings-opts.cat IDENTICAL"],
  ["config-01", "KGConfig statics: disableWebWorkers, 18 locales, 27 schemes, 10 defaultSchemes, notations [si;e;sie] in Game.Settings — data verified against config.js (no runtime surface in scenarios)"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-24", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +4 settings");
