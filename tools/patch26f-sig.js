#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Diplomacy.fs";
let t = fs.readFileSync(q, "utf8");
const from = "let tradeImpl (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) (raceName: string) (totalTradeAmount: float) (ambassadorEffects: Map<string, float>) : DiplomacyPool * Map<string, float> * float =";
const to = "let tradeImpl (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) (raceName: string) (totalTradeAmount: float) (ambassadorEffects: Map<string, float>) (tradepostStandingRatio: float) (diplomatsResearched: bool) (neutralRaceEmbassyStanding: float) (pacifismTradeBonus: float) (pollutionLevel: int) (postApocalypseActive: bool) : DiplomacyPool * Map<string, float> * float =";
if (t.split(from).length - 1 !== 1) { console.error("FAIL sig x" + (t.split(from).length - 1)); process.exit(1); }
t = t.split(from).join(to);
// tradeRatio line: add pacifismTradeBonus
const from2 = `        let tradeRatio =
            1.0
            + getTradeRatio ctx
            + 0.0 // calculateTradeBonusFromPolicies: policy-gated, 0 at this slice
            + 0.0 // pacifism challenge seam`;
const to2 = `        let tradeRatio =
            1.0
            + getTradeRatio ctx
            + (calculatePhantomTradeposts ctx raceName * 0.015) // calculateTradeBonusFromPolicies (merchant seam 0)
            + pacifismTradeBonus`;
if (t.split(from2).length - 1 !== 1) { console.error("FAIL ratio x" + (t.split(from2).length - 1)); process.exit(1); }
t = t.split(from2).join(to2);
fs.writeFileSync(q, t);
console.log("ok tradeImpl complete");
