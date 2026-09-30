#!/usr/bin/env node
"use strict";
// Game.Space.sellOne (space-11 undo refund path) + register/commit wiring.
const fs = require("fs");

// Game.Space.sellOne
{
  const q = "kittens_land/src/Game/Game.Space.fs";
  let t = fs.readFileSync(q, "utf8");
  t += `
/// space.undo refund path (js/space.js undo L1267-1281): sell ONE unit via
/// PlanetBuildingBtnController.sellInternal — refund = current ladder prices
/// × refundPercentage (build undo 1.0, sell undo 0 = re-add). Requires the
/// planet to have been reached and val > 0.
let sellOne (calendarDay: int) (name: string) (pool: ResPool) (refundPercentage: float) (sp: SpacePool) : SpacePool * ResPool * bool =
    let def = Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = name)
    let m = sp.Buildings.[name]
    if m.Val = 0 || not sp.Planets.[def.Planet].Reached then sp, pool, false
    else
        let prices () =
            def.Prices
            |> List.map (fun p -> (p.Resource, p.Val * (1.1 ** float (m.Val - 1))))
        // refund at the pre-decrement ladder
        let refundPrices = prices () |> List.map (fun (r, v) -> (r, v * refundPercentage))
        let sp' = { sp with Buildings = sp.Buildings |> Map.add name { m with Val = m.Val - 1; On = m.On - 1 } }
        let mutable pool' = pool
        for (r, v) in refundPrices do
            if v > 0.0 then
                let pool1, _ = Game.Resources.addResEvent calendarDay r v pool'
                pool' <- pool1
        sp', pool', true
`;
  fs.writeFileSync(q, t);
  console.log("ok sellOne");
}
// runner: register + commit-back
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["register",
`            if counter > 0 then
                let def = Game.Catalog.Space.buildingDefs |> List.find (fun d0 -> d0.Name = name)
                // controller.build order: breakIronWill; meta.unlocks;`,
`            if counter > 0 then
                registerUndo [ { ManagerId = "space"; Data = Game.Types.SpaceUndo("build", name, counter) } ]
                let def = Game.Catalog.Space.buildingDefs |> List.find (fun d0 -> d0.Name = name)
                // controller.build order: breakIronWill; meta.unlocks;`],
    ["commit-back", null, null],
  ];
  for (const [name, from, to] of edits) {
    if (from === null) continue;
    const n = t.split(from).length - 1;
    if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
    t = t.split(from).join(to);
  }
  // commit-back: after the undo events loop, find "tpoolU <- tpool" pattern
  const idx = t.indexOf("| Game.Types.SpaceUndo");
  const tailIdx = t.indexOf("tpoolU <- tpool", idx);
  if (tailIdx < 0) { console.error("no commit site"); process.exit(1); }
  const lineEnd = t.indexOf("\n", tailIdx);
  t = t.slice(0, lineEnd + 1) + "                spacep <- spacepU\n" + t.slice(lineEnd + 1);
  fs.writeFileSync(q, t);
  console.log("ok runner space undo");
}
console.log("patch31c done");
