#!/usr/bin/env node
"use strict";
// Batch-21c: craft console-filter unlock semantics — manual game.craft emits
// no message; only craftAll (js/workshop.js L2813) unlocks the filter.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  ["craft-move-no-unlock",
`            if ok then
                craftFilterUnlocked <- true
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
                let gained = (1.0 + Game.Managers.getResCraftRatio cache (crctx ()) craftName) * ceil amt`,
`            if ok then
                // manual game.craft emits NO message — the craft console filter
                // unlocks only via the craftAll msg (js/workshop.js L2813)
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
                let gained = (1.0 + Game.Managers.getResCraftRatio cache (crctx ()) craftName) * ceil amt`],
  ["craftall-unlock",
`            let pool', wpool', ok = Game.Managers.craftAll calendarDay cache (traditionResearched ()) (crctx ()) getResValue m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool`,
`            let pool', wpool', ok = Game.Managers.craftAll calendarDay cache (traditionResearched ()) (crctx ()) getResValue m.Args.[0] pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                craftFilterUnlocked <- true // craftAll emits the craft-tag msg
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool`],
];
for (const [name, from, to] of edits) {
  if (t.split(from).length - 1 !== 1) { console.error("FAIL " + name); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok filter fix");
