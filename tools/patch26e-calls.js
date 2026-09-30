#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const PA = '(int pollutionLevel) (Game.Challenges.isActive cpool "postApocalypse")';
const TB = '(Game.Challenges.getTradeBonusEffect cpool (Game.Effects.getEffect cache) (match Game.Buildings.get bpool "tradepost" with Some b -> float b.Val | None -> 0.0))';
const ST = '(tradepostStandingRatio ()) (policyResearched "lizardRelationsDiplomats") (Game.Effects.getEffect cache "neutralRaceEmbassyStanding") ' + TB + ' ' + PA;
const edits = [
  ["max-3911",
   "                let maxAmt = Game.Diplomacy.getMaxTradeAmt dp dctxM ambassadorEffects raceName",
   "                let maxAmt = Game.Diplomacy.getMaxTradeAmt dp dctxM " + PA + " ambassadorEffects raceName"],
  ["trade-4393",
   "                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName 1.0 ambassadorEffects",
   "                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName 1.0 ambassadorEffects " + ST],
  ["trade-4419",
   "                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName (float n) ambassadorEffects",
   "                    let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctx rand' raceName (float n) ambassadorEffects " + ST],
  ["max-4443",
   "            match Game.Diplomacy.getMaxTradeAmt dp dctxT ambassadorEffects raceName with",
   "            match Game.Diplomacy.getMaxTradeAmt dp dctxT " + PA + " ambassadorEffects raceName with"],
  ["trade-4452",
   "                let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctxT rand' raceName amt ambassadorEffects",
   "                let dp', gained, successful = Game.Diplomacy.tradeImpl dp dctxT rand' raceName amt ambassadorEffects " + ST],
];
for (const [name, from, to] of edits) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok runner call sites");
