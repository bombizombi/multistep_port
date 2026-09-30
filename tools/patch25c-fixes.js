#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  ["transcend-arm",
`        | "transcend" ->
            if ok then calculateAllTime () // game.calculateAllEffects on success`,
`        | "transcend" ->
            let rpT, okT = Game.Religion.transcend rpool
            rpool <- rpT
            if okT then calculateAllTime () // game.calculateAllEffects on success`],
  ["pollution-state",
`    let mutable craftFilterUnlocked = false
    let mutable huntFilterUnlocked = false`,
`    let mutable craftFilterUnlocked = false
    let mutable huntFilterUnlocked = false
    // buildings-10: bld.cathPollution / cathPollutionPerTick (js/buildings.js)
    let mutable cathPollution = 0.0
    let mutable cathPollutionPerTick = 0.0`],
];
for (const [name, from, to] of edits) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok fixes");
