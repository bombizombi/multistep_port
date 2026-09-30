#!/usr/bin/env node
"use strict";
// Apply getMaxTradeAmt signature change separately (multiline).
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Diplomacy.fs";
let t = fs.readFileSync(q, "utf8");
const from = "let getMaxTradeAmt\n    (dp: DiplomacyPool)\n    (ctx: DiplomacyContext)";
const to = "let getMaxTradeAmt\n    (dp: DiplomacyPool)\n    (ctx: DiplomacyContext)\n    (pollutionLevel: int)\n    (postApocalypseActive: bool)";
if (t.split(from).length - 1 !== 1) { console.error("FAIL x" + (t.split(from).length - 1)); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok maxamt sig");
