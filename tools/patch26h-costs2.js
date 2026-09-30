#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const PA = '(int pollutionLevel) (Game.Challenges.isActive cpool "postApocalypse")';
const edits = [
  ["manp", "Game.Diplomacy.getManpowerCost dp dctx\n", "Game.Diplomacy.getManpowerCost dp dctx " + PA + "\n", 2],
  ["gold", "Game.Diplomacy.getGoldCost dp dctx\n", "Game.Diplomacy.getGoldCost dp dctx " + PA + "\n", 2],
  ["manpT", "Game.Diplomacy.getManpowerCost dp dctxT\n", "Game.Diplomacy.getManpowerCost dp dctxT " + PA + "\n", 1],
  ["goldT", "Game.Diplomacy.getGoldCost dp dctxT\n", "Game.Diplomacy.getGoldCost dp dctxT " + PA + "\n", 1],
];
for (const [name, from, to, count] of edits) {
  const n = t.split(from).length - 1;
  if (n !== count) { console.error("FAIL " + name + " x" + n + " expected " + count); process.exit(1); }
  t = t.split(from).join(to);
}
// fix the doubled args from the earlier partial apply
t = t.split("(int pollutionLevel) (Game.Challenges.isActive cpool \"postApocalypse\") (int pollutionLevel) (Game.Challenges.isActive cpool \"postApocalypse\")")
     .join("(int pollutionLevel) (Game.Challenges.isActive cpool \"postApocalypse\")");
fs.writeFileSync(q, t);
console.log("ok costs all");
