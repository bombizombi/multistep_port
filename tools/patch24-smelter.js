#!/usr/bin/env node
"use strict";
// Smelter per-tick action (js/buildings.js L1119-1152): IW safe-switch +
// stock-capped wood/minerals consumption scaling the con/autoprod effects.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  // getAmtDependsOnStock in Game.Resources
  ["res-amtdep", null, null],
];
// -- Game.Resources.getAmtDependsOnStock --
{
  const rq = "kittens_land/src/Game/Game.Resources.fs";
  let rt = fs.readFileSync(rq, "utf8");
  const anchor = "/// orig updateMaxValueAll(): recompute every cap in resPool order.";
  const insert = `/// orig getAmtDependsOnStock(from, amt): cap amt by stock, then deduct the
/// consumption via addResPerTick for each entry.
let getAmtDependsOnStock (addResPerTick: string -> float -> unit) (pool: ResPool) (from0: (string * float) list) (amt: float) : float =
    if amt = 0.0 then 0.0
    else
        let mutable amt = amt
        for (resName, need) in from0 do
            let resAvailable = (match get pool resName with Some r -> r.Value | None -> 0.0)
            let resNeeded = need * amt
            if resAvailable < resNeeded then
                let amtAvailable = resAvailable / need
                amt <- min amt amtAvailable
        for (resName, need) in from0 do
            addResPerTick resName (-need * amt)
        amt

` + anchor;
  if (rt.split(anchor).length - 1 !== 1) { console.error("FAIL res anchor"); process.exit(1); }
  fs.writeFileSync(rq, rt.replace(anchor, insert));
  console.log("ok getAmtDependsOnStock");
}
// -- runner: smelter action in updateModelBody before the aiCore block --
{
  let t2 = fs.readFileSync(q, "utf8");
  const anchor = `        bpool <- Game.Buildings.update pool bpool
        // aiCore per-tick action (js/buildings.js L2172-2175): gflops accrual +`;
  const insert = `        bpool <- Game.Buildings.update pool bpool
        // smelter per-tick action (js/buildings.js L1119-1152): IW safe-switch,
        // stock-capped wood/minerals draw scaling the con/autoprod effects
        (match Game.Buildings.get bpool "smelter" with
         | Some sm when sm.On > 0 ->
             let iron = pool.ByName["iron"]
             // game.opts.IWSmelter defaults true (settings-01)
             if ironWill && iron.Value > iron.MaxValue * 0.95 then
                 bpool <- { bpool with ByName = bpool.ByName |> Map.add "smelter" { sm with On = 0 } }
             else
                 let calc = sm.Def.Effects
                 let calcKey k = calc |> Map.tryFind k |> Option.defaultValue 0.0
                 let amt =
                     Game.Resources.getAmtDependsOnStock
                         (fun resName amount ->
                             let pool1, _ = Game.Resources.addResPerTick calendarDay resName amount pool
                             pool <- pool1)
                         pool
                         [ ("wood", -(calcKey "woodPerTickCon")); ("minerals", -(calcKey "mineralsPerTickCon")) ]
                         (float sm.On)
                 let scaleKeys = [ "woodPerTickCon"; "mineralsPerTickCon"; "coalPerTickAutoprod"; "ironPerTickAutoprod"; "titaniumPerTickAutoprod"; "goldPerTickAutoprod" ]
                 bpool <- Game.Buildings.setEffects bpool "smelter" (fun e0 -> scaleKeys |> List.fold (fun acc k -> acc |> Map.add k (calcKey k * amt)) e0)
         | _ -> ())
        // aiCore per-tick action (js/buildings.js L2172-2175): gflops accrual +`;
  if (t2.split(anchor).length - 1 !== 1) { console.error("FAIL runner anchor"); process.exit(1); }
  fs.writeFileSync(q, t2.replace(anchor, insert));
  console.log("ok smelter action");
}
