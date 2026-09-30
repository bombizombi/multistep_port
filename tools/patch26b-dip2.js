#!/usr/bin/env node
"use strict";
// Batch-26b: costs w/ postApocalypse, embassy fake, trade bonus, unlock draw.
const fs = require("fs");

// Game.Diplomacy.fs
{
  const q = "kittens_land/src/Game/Game.Diplomacy.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["costs-pa",
`let getManpowerCost (dp: DiplomacyPool) (ctx: DiplomacyContext) : float =
    let manpowerCost = dp.BaseManpowerCost - ctx.GetEffect "tradeCatpowerDiscount"
    if manpowerCost < 0.0 then 0.0 else manpowerCost

let getGoldCost (dp: DiplomacyPool) (ctx: DiplomacyContext) : float =
    let goldCost = dp.BaseGoldCost - ctx.GetEffect "tradeGoldDiscount"
    if goldCost < 0.0 then 0.0 else goldCost`,
`let getManpowerCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) : float =
    let manpowerCost = dp.BaseManpowerCost - ctx.GetEffect "tradeCatpowerDiscount"
    let manpowerCost = if postApocalypseMultiplier () then manpowerCost * (1.0 + float pollutionLevel) else manpowerCost
    if manpowerCost < 0.0 then 0.0 else manpowerCost

let getGoldCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) : float =
    let goldCost = dp.BaseGoldCost - ctx.GetEffect "tradeGoldDiscount"
    let goldCost = if postApocalypseMultiplier () then goldCost * (1.0 + float pollutionLevel) else goldCost
    if goldCost < 0.0 then 0.0 else goldCost`],
    ["unlock-draw",
`            if unmetRaces.IsEmpty then
                (dp, noneEvent)
            else
                let raceId = int (floor (rand () * float unmetRaces.Length))`,
`            // orig consumes the draw even when unmetRaces is empty (L521)
            let raceId = int (floor (rand () * float unmetRaces.Length))
            if unmetRaces.IsEmpty then
                (dp, noneEvent)
            else`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL dipb " + name + " x" + (t.split(from).length - 1)); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok diplomacy module part 2");
}

// The postApocalypseMultiplier helper — as a ctx-free seam function injected
// by the runner; declare a mutable in Diplomacy? Simplest: a module-level
// function reference isn't idiomatic here — use a ctx flag instead. Patch the
// costs back to take a bool.
{
  const q = "kittens_land/src/Game/Game.Diplomacy.fs";
  let t = fs.readFileSync(q, "utf8");
  const from = `let getManpowerCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) : float =
    let manpowerCost = dp.BaseManpowerCost - ctx.GetEffect "tradeCatpowerDiscount"
    let manpowerCost = if postApocalypseMultiplier () then manpowerCost * (1.0 + float pollutionLevel) else manpowerCost
    if manpowerCost < 0.0 then 0.0 else manpowerCost

let getGoldCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) : float =
    let goldCost = dp.BaseGoldCost - ctx.GetEffect "tradeGoldDiscount"
    let goldCost = if postApocalypseMultiplier () then goldCost * (1.0 + float pollutionLevel) else goldCost
    if goldCost < 0.0 then 0.0 else goldCost`;
  const to = `let getManpowerCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) (postApocalypseActive: bool) : float =
    let manpowerCost = dp.BaseManpowerCost - ctx.GetEffect "tradeCatpowerDiscount"
    let manpowerCost = if postApocalypseActive then manpowerCost * (1.0 + float pollutionLevel) else manpowerCost
    if manpowerCost < 0.0 then 0.0 else manpowerCost

let getGoldCost (dp: DiplomacyPool) (ctx: DiplomacyContext) (pollutionLevel: int) (postApocalypseActive: bool) : float =
    let goldCost = dp.BaseGoldCost - ctx.GetEffect "tradeGoldDiscount"
    let goldCost = if postApocalypseActive then goldCost * (1.0 + float pollutionLevel) else goldCost
    if goldCost < 0.0 then 0.0 else goldCost`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL costs ctx"); process.exit(1); }
  fs.writeFileSync(q, t.split(from).join(to));
  console.log("ok costs ctx flag");
}

// Runner call-site fixes for costs + standing probe
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["standing-probe",
`                actionLog <- (curLogTick, "resop", m.Args, RNum(Game.Diplomacy.getFinalStanding dp dctx name)) :: actionLog`,
`                actionLog <-
                    (curLogTick, "resop", m.Args,
                     RNum(Game.Diplomacy.getFinalStanding dp dctx name
                         (Game.Effects.getEffect cache "standingRatio" * 0.0 + tradepostStandingRatio ())
                         (policyResearched "lizardRelationsDiplomats")
                         (Game.Effects.getEffect cache "neutralRaceEmbassyStanding")))
                    :: actionLog`],
  ];
  for (const [name, from, to] of edits) {
    const n = t.split(from).length - 1;
    if (n !== 1) { console.error("FAIL runner " + name + " x" + n); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok runner standing");
}
console.log("patch26b done");
