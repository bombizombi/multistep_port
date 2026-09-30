#!/usr/bin/env node
"use strict";
// Add Tier/PriceRules to TUDef type + each tuDefs record (line-based).
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Catalog.World.fs";
let t = fs.readFileSync(q, "utf8");
const typeFrom = `type TUDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      PriceRatio: float option; Unlocks: UnlockList option; Upgrades: UnlockList option }`;
const typeTo = `type TUDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      PriceRatio: float option; Unlocks: UnlockList option; Upgrades: UnlockList option
      Tier: int
      PriceRules: bool }`;
if (t.split(typeFrom).length - 1 !== 1) { console.error("FAIL type"); process.exit(1); }
t = t.split(typeFrom).join(typeTo);

const tiers = { blackObelisk: 1, blackNexus: 3, blackCore: 5, singularity: 7, blackLibrary: 9, blackRadiance: 12, blazar: 15, darkNova: 20, mausoleum: 23, holyGenocide: 25, darkParacosm: 27 };
const lines = t.split("\n");
const out = [];
let count = 0;
for (const line of lines) {
  let l = line;
  const m = l.match(/\{ Name = "([a-zA-Z]+)";/);
  if (m && tiers[m[1]] !== undefined && l.includes("Upgrades = ") && !l.includes("Tier = ")) {
    const n = m[1];
    l = l.replace(/\}$/, `Tier = ${tiers[n]}; PriceRules = ${n === "darkParacosm" ? "true" : "false"} }`);
    count++;
  }
  out.push(l);
}
fs.writeFileSync(q, out.join("\n"));
console.log("ok tu tiers " + count);
