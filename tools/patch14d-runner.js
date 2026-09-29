#!/usr/bin/env node
"use strict";
// aiCore per-tick action + BuildingState effects updater.
const fs = require("fs");

// 1. Game.Buildings: setEffects helper (orig mutates meta.effects in place)
const bp = "kittens_land/src/Game/Game.Buildings.fs";
let bs = fs.readFileSync(bp, "utf8");
if (!bs.includes("let setEffects")) {
  bs = bs.replace(`// --- game-19: bld build undo (sellInternal at 50% refund, core.js L1949-1972) --`,
`/// orig mutates building meta effects in place (updateEffects actions);
/// the fs mirror replaces the Def's static effects with a dynamic table per
/// BuildingState. Kept immutable here — callers thread the new pool.
let setEffects (bpool: BldPool) (name: string) (f: Map<string, float> -> Map<string, float>) : BldPool =
    let b = bpool.ByName[name]
    let def' = { b.Def with Effects = f b.Def.Effects }
    { bpool with ByName = bpool.ByName |> Map.add name { b with Def = def' } }

// --- game-19: bld build undo (sellInternal at 50% refund, core.js L1949-1972) --`);
  fs.writeFileSync(bp, bs);
  console.log("setEffects added");
}

// 2. runner: aiCore action before steamworks block
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const anchor = `        // steamworks per-tick automation action (js/buildings.js L1327-1377):`;
const block = `        // aiCore per-tick action (js/buildings.js L2172-2175): gflops accrual +
        // updateEffects (non-proportional energy/aiLevel table). Def-order: runs
        // before the steamworks action.
        (match Game.Buildings.get bpool "aiCore" with
         | Some ai when ai.On > 0 ->
             let aiCoreProductivness = Game.Effects.getEffect cache "aiCoreProductivness"
             let gflopsBase = 0.02 * (1.0 + aiCoreProductivness)
             let gflopsRes = pool.ByName["gflops"]
             pool <- { pool with ByName = pool.ByName |> Map.add "gflops" { gflopsRes with Value = gflopsRes.Value + gflopsBase * float ai.On } }
             let aiLevel = Game.Math.jsRound (System.Math.Log (max gflopsRes.Value 1.0)) |> float
             bpool <-
                 Game.Buildings.setEffects bpool "aiCore" (fun eff ->
                     eff
                     |> Map.add "energyConsumption" ((3.0 * float ai.On + 5.0) / 4.0)
                     |> Map.add "gflopsPerTickBase" gflopsBase
                     |> Map.add "aiLevel" aiLevel)
         | None -> ())
${anchor}`;
if (!t.includes(anchor)) { console.error("anchor missing"); process.exit(1); }
t = t.replace(anchor, block);
fs.writeFileSync(q, t);
console.log("aiCore action added");
