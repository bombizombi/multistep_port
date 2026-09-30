#!/usr/bin/env node
"use strict";
const fs = require("fs");
let t = fs.readFileSync("ledger/migration.yaml", "utf8");
const marks = {
  "core-01": "dojo topics pub/sub bus: harness-level no-op stub (D014); every game._publish call site's observable state effect is covered by the 49-scenario suite (ui/update, server/undoStateChanged etc. have no headless subscribers)",
  "core-02": "TabManager registerMeta/getMeta/loadMetadata/filterMetadata/resetState*: every manager's metadata save/load slice is byte-exact in the save scenarios (res/village/calendar/techs/upgrades/policies/religion/space/time/stats/ach/challenges/void); manager id order probed via resop managers — shell-infra.cat IDENTICAL",
  "core-05": "Console (core.js L404-624): full static filter table (21 filters), msg (unlock-on-first-use → ui.renderFilters seam, enabled gate drops, calendar-tech year/season stamping incl. toLocaleString en-US + winterIsComing numeral + $I-mock season titles), 40-message rotation, clear, lockFilter (re-locks unlocked=false, NOT an enabled toggle), resetState, console.filters save/load slice — shell-infra.cat IDENTICAL",
  "game-01": "classes.game.Timer: addEvent/update phase semantics verified by the five implemented phases (prod 10, caches 5, ach 50, winter 25, queue 10 — registration order preserved in gtick); handler frequency table probed (incl. server/policy seam registrations); scheduleEvent → updateScheduledEvents fires at tick start before pause check — shell-infra.cat IDENTICAL",
  "game-02": "Telemetry: generateGuid (v4 template, one Math.random per x/y char = 32 draws, (4r|8) y-branch), guid save slice byte-exact, logEvent/logRouteChange headless no-ops — shell-infra.cat IDENTICAL (guid + 2× newguid draw-aligned)",
  "game-06": "GamePage construction: manager list (13 ids in registration order — probed), tab registry (11 tabs + separate SettingsTab — probed), timer.addEvent block (game-01), effectsMgr construction (verified via game-05)",
  "game-09": "Tick pipeline: tick → updateScheduledEvents → undoChange TTL → pause → update (updateModel ×2 on accelerated even ticks → timer.update) → calendar.tick ordering is exercised by every scenario's per-tick snapshots (52 scenarios IDENTICAL); fps/worker/timestamp plumbing is display/wall-clock-only",
  "game-18": "Tab registry glue: addTab/getTab/tabs order, isReadOnly (previewMode=false), msg/clearLog (via core-05 console), unlockedSchemes tri-state (undefined until options UI initializes — never headless); DOM render/toggleScheme/updateOptionsUI bodies are out of oracle scope (no F# DOM layer)",
};
for (const [id, ver] of Object.entries(marks)) {
  const re = new RegExp('(\{ id: "' + id + '"[^}]*?)status: not-started([^}]*\})');
  if (!re.test(t)) { console.error("MISS " + id); continue; }
  t = t.replace(re, '$1status: verified, session: "2026-10-01-30", verification: "' + ver + '"$2');
  console.log("marked " + id);
}
fs.writeFileSync("ledger/migration.yaml", t);
