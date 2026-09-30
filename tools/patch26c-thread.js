#!/usr/bin/env node
"use strict";
// Thread the new params through tradeImpl/getMaxTradeAmt.
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Diplomacy.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  ["tradeimpl-sig",
`let tradeImpl (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) (raceName: string) (totalTradeAmount: float) (ambassadorEffects: Map<string, float>) : DiplomacyPool * Map<string, float> * float =`,
`let tradeImpl (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) (raceName: string) (totalTradeAmount: float) (ambassadorEffects: Map<string, float>) (tradepostStandingRatio: float) (diplomatsResearched: bool) (neutralRaceEmbassyStanding: float) (pacifismTradeBonus: float) (pollutionLevel: int) (postApocalypseActive: bool) : DiplomacyPool * Map<string, float> * float =`],
  ["tradeimpl-standing",
`    let tradeResults = calculateFailedNormalBonusTrades ctx rand (getFinalStanding dp ctx raceName) totalTradeAmount dp.NonRandomTrades`,
`    let tradeResults = calculateFailedNormalBonusTrades ctx rand (getFinalStanding dp ctx raceName tradepostStandingRatio diplomatsResearched neutralRaceEmbassyStanding) totalTradeAmount dp.NonRandomTrades`],
  ["tradeimpl-costs",
`    let manpowerCost = getManpowerCost dp ctx
    let goldCost = getGoldCost dp ctx`,
`    let manpowerCost = getManpowerCost dp ctx pollutionLevel postApocalypseActive
    let goldCost = getGoldCost dp ctx pollutionLevel postApocalypseActive`],
  ["maxamt",
`    let manpowerCost = getManpowerCost dp ctx
    let goldCost = getGoldCost dp ctx
    let volume = getTradeVolume ctx ambassadorEffects`,
`    let manpowerCost = getManpowerCost dp ctx pollutionLevel postApocalypseActive
    let goldCost = getGoldCost dp ctx pollutionLevel postApocalypseActive
    let volume = getTradeVolume ctx ambassadorEffects`],
];
for (const [name, from, to] of edits) {
  if (t.split(from).length - 1 !== 1) { console.error("FAIL " + name + " x" + (t.split(from).length - 1)); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok diplomacy threading");
