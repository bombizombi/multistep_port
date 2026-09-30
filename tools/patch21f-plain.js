#!/usr/bin/env node
"use strict";
// Batch-21f: complete the PLAIN (export) stringify form — all null-valued
// keys the JSONreplacer drops from the storage form:
// village.currentBiome/lastBiome, buildings[].isAutomationEnabled (declared
// metas), time.cfu[].isAutomationEnabled (declared metas), game.lastBackup.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  ["village-biomes-nulls",
`        arrEnd (); sb.Append "," |> ignore
        key "hadKittenHunters"; boolv false; sb.Append "," |> ignore`,
`        arrEnd (); sb.Append "," |> ignore
        if plain then
            // map.currentBiome / map.lastBiome are null at this slice
            key "currentBiome"; raw "null"; sb.Append "," |> ignore
            key "lastBiome"; raw "null"; sb.Append "," |> ignore
        key "hadKittenHunters"; boolv false; sb.Append "," |> ignore`],
  ["bld-automation",
`            if b.Def.Stages.Length > 0 then sb.Append "," |> ignore; key "stage"; intv b.Stage
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "bldData"`,
`            if b.Def.Stages.Length > 0 then sb.Append "," |> ignore; key "stage"; intv b.Stage
            // plain form keeps the declared-but-nulled isAutomationEnabled
            if plain && Game.Catalog.Defs.automationBuildingSet.Contains n then
                sb.Append "," |> ignore; key "isAutomationEnabled"; raw "null"
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "bldData"`],
  ["cfu-automation",
`            if (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = n)).AutomationInit.IsSome && m.IsAutomationEnabled <> None then
                sb.Append "," |> ignore
                key "isAutomationEnabled"
                boolv (m.IsAutomationEnabled = Some true)`,
`            let cfuDef = Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = n)
            if cfuDef.AutomationInit.IsSome then
                sb.Append "," |> ignore
                key "isAutomationEnabled"
                (match m.IsAutomationEnabled with
                 | Some b -> boolv b
                 // plain form keeps the reset null (replacer drops it)
                 | None -> if plain then raw "null" else boolv false)`],
  ["game-lastbackup",
`        let firstO = ref true
        for on, ov in opts do
            sep firstO
            key on; raw ov
        objEnd ()
        objEnd ()`,
`        let firstO = ref true
        for on, ov in opts do
            sep firstO
            key on; raw ov
        objEnd ()
        if plain then
            sb.Append "," |> ignore; key "lastBackup"; raw "null"
        objEnd ()`],
  ["automation-set",
`    let buildSaveString () : string = buildSaveStringMode false`,
`    // buildings whose defs declare isAutomationEnabled (js/buildings.js:
    // warehouse, calciner, steamworks, oilWell, factory, reactor)
    let automationBuildingSet =
        set [ "warehouse"; "calciner"; "steamworks"; "oilWell"; "factory"; "reactor" ]

    let buildSaveString () : string = buildSaveStringMode false`],
];
for (const [name, from, to] of edits) {
  if (t.split(from).length - 1 !== 1) { console.error("FAIL " + name); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok plain form complete");
