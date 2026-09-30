#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const from = "Game.Diplomacy.getManpowerCost dp dctx";
const to = "Game.Diplomacy.getManpowerCost dp dctx (int pollutionLevel) (Game.Challenges.isActive cpool \"postApocalypse\")";
let n = t.split(from).length - 1;
if (n !== 2) { console.error("FAIL x" + n); process.exit(1); }
t = t.split(from).join(to);
const from2 = "Game.Diplomacy.getGoldCost dp dctx";
const to2 = "Game.Diplomacy.getGoldCost dp dctx (int pollutionLevel) (Game.Challenges.isActive cpool \"postApocalypse\")";
let n2 = t.split(from2).length - 1;
if (n2 < 1) { console.error("FAIL gold x" + n2); process.exit(1); }
t = t.split(from2).join(to2);
fs.writeFileSync(q, t);
console.log("ok costs x" + n + "/" + n2);
