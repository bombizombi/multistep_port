#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "tools/patch25b-moves.js";
let t = fs.readFileSync(q, "utf8");
t = t.split("Game.Religion.getTranscendTierAllowance rpool").join("rpool.TranscendenceTier");
const from = "  const from = `            calculateAllTime () // orig transcend → calculateAllEffects`;";
if (t.split(from).length - 1 !== 1) { console.error("FAIL from x" + (t.split(from).length - 1)); process.exit(1); }
t = t.split(from).join("  const from = `            let rp', ok = Game.Religion.transcend rpool\n            rpool <- rp'\n            if ok then calculateAllTime () // game.calculateAllEffects on success`;");
const to = "  const to = `            calculateAllTime () // orig transcend → calculateAllEffects";
if (t.split(to).length - 1 !== 1) { console.error("FAIL to x" + (t.split(to).length - 1)); process.exit(1); }
t = t.split(to).join("  const to = `            if ok then calculateAllTime () // game.calculateAllEffects on success");
fs.writeFileSync(q, t);
console.log("ok fixed");
