#!/usr/bin/env node
"use strict";
// Batch-25b: runner moves (tu/sacrifice/sacrificealicorn/refinetc/refinetears)
// + transcend TU unlock + adore undo delta fix.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  // adore undo: delta not absolute (orig L1644)
  ["adore-undo",
`            let worshipBefore = rpool.Faith
            rpool <- Game.Religion.adoreInternal rpool 1.01
            registerUndo [ { ManagerId = "religion"; Data = Game.Types.AdoreUndo(worshipBefore, rpool.FaithRatio) } ]`,
`            let worshipBefore = rpool.Faith
            let epiphanyBefore = rpool.FaithRatio
            rpool <- Game.Religion.adoreInternal rpool 1.01
            registerUndo [ { ManagerId = "religion"; Data = Game.Types.AdoreUndo(worshipBefore, rpool.FaithRatio - epiphanyBefore) } ]`],

  // religion moves block: add after the "ziggurat" arm's closing (anchor on the embassy arm)
  ["religion-moves",
`        | "embassy" ->`,
`        | "tu" ->
            // TranscendenceBtnController: tier-gated cryptotheology ladder
            let name = m.Args.[0]
            let n = if m.Args.Length >= 2 then int m.Args.[1] else 1
            let pool', rpool', bought = Game.Religion.buyTU calendarDay (Game.Effects.getEffect cache) (rpool.TranscendenceTier) name n pool rpool
            pool <- pool'
            rpool <- rpool'
            if bought = 0 then
                actionLog <- (m.Tick, "tu", m.Args, RText "cannot-afford-or-locked") :: actionLog
            else refreshCache () // TU effects enter the cache
        | "sacrifice" ->
            // unicorn sacrifice: unicorns 2500 → tears × ziggurat.on
            let n = if m.Args.Length >= 1 then int m.Args.[0] else 1
            let zigguratOn = (match Game.Buildings.get bpool "ziggurat" with Some z -> z.On | None -> 0)
            let pool', priceCount, attempted, overcap, ok =
                Game.Religion.transform calendarDay "unicorns" "tears" 2500.0 1 n (float zigguratOn) pool
            pool <- pool'
            if ok then
                stpool <- Game.Stats.bumpStat "unicornsSacrificed" priceCount stpool
                // tears overcap evaporates into cathPollution (js/religion.js L2207-2212)
                if overcap > 0.001 then
                    let rate = Game.Effects.getEffect cache "cathPollutionPerTearOvercapped"
                    if rate <> 0.0 then cathPollution <- cathPollution + overcap * rate
        | "sacrificealicorn" ->
            // alicorn sacrifice: alicorn 25 → timeCrystal × (1 + tcRefineRatio)
            let n = if m.Args.Length >= 1 then int m.Args.[0] else 1
            let tcRefine = Game.Effects.getEffect cache "tcRefineRatio"
            let pool', _, _, _, ok =
                Game.Religion.transform calendarDay "alicorn" "timeCrystal" 25.0 1 n (1.0 + tcRefine) pool
            pool <- pool'
            if ok then
                // applyAtGain: keeps skyPalace/unicornUtopia/sunspire effects live
                let ctxZ : Game.Religion.ZuCalcCtx =
                  { AlicornmancyResearched = (match ppool.Perks |> Map.tryFind "alicornmancy" with Some p -> p.Researched | None -> false)
                    AlicornValue = (match get pool "alicorn" with Some r -> r.Value | None -> 0.0)
                    UnicornTearsActive = Game.Challenges.isActive cpool "unicornTears" }
                for z0 in ["skyPalace"; "unicornUtopia"; "sunspire"] do
                    rpool <- Game.Religion.zuCalcEffects ctxZ z0 rpool
                refreshCache ()
        | "refinetc" ->
            // timeCrystal 25 → relic × (1 + relicRefineRatio × BP effective)
            let n = if m.Args.Length >= 1 then int m.Args.[0] else 1
            let bpEff =
                Game.Religion.blackPyramidEffectiveValue rpool
                    (cpool.Challenges.["blackSky"].Researched)
                    (Game.Challenges.isActive cpool "blackSky")
            let mult = 1.0 + Game.Effects.getEffect cache "relicRefineRatio" * float bpEff
            let pool', _, _, _, ok = Game.Religion.transform calendarDay "timeCrystal" "relic" 25.0 1 n mult pool
            pool <- pool'
            if not ok then actionLog <- (m.Tick, "refinetc", m.Args, RText "cannot-afford") :: actionLog
        | "refinetears" ->
            // RefineTearsBtnController: tears 10000 → sorrow.value++ (capped 17)
            let n = if m.Args.Length >= 1 then int m.Args.[0] else 1
            let pool', refined = Game.Religion.refineTears calendarDay n pool
            pool <- pool'
            if refined = 0 then actionLog <- (m.Tick, "refinetears", m.Args, RText "cannot-afford-or-capped") :: actionLog
        | "embassy" ->`],
];
for (const [name, from, to] of edits) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok runner religion moves");

// transcend TU unlock: extend the "transcend" arm
{
  let t2 = fs.readFileSync(q, "utf8");
  const from = `            let rp', ok = Game.Religion.transcend rpool
            rpool <- rp'
            if ok then calculateAllTime () // game.calculateAllEffects on success`;
  const to = `            if ok then calculateAllTime () // game.calculateAllEffects on success
            // button handler tail: unlock TUs at the new tier (L3166-3174)
            for tuName in rpool.TuOrder do
                let def = Game.Catalog.World.tuDefs |> List.find (fun d -> d.Name = tuName)
                let tu = rpool.TUs.[tuName]
                if rpool.TranscendenceTier >= def.Tier && tu.Unlocked = false then
                    rpool <- { rpool with TUs = rpool.TUs |> Map.add tuName { tu with Unlocked = true } }`;
  if (t2.split(from).length - 1 !== 1) {
    // find actual transcend tail
    const idx = t2.indexOf("| \"transcend\" ->");
    console.error("FAIL transcend tail; arm at", idx, t2.slice(idx, idx + 500));
    process.exit(1);
  }
  fs.writeFileSync(q, t2.split(from).join(to));
  console.log("ok transcend tu unlock");
}
console.log("patch25b done");
