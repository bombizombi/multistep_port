#!/usr/bin/env node
"use strict";
// Batch-21e: export path = PLAIN JSON.stringify (keeps nulls; JSONreplacer's
// loose `value == undefined` drops them in the storage path). Adds a plain
// builder variant for saveexport; removes the temp debug prints.
const fs = require("fs");

{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["builder-sig",
`    /// game-13 _saveDataToString: JSON.stringify(saveData, JSONreplacer) with
    /// orig key insertion order (undefined keys dropped). No LZ at <5mb.
    let buildSaveString () : string =`,
`    /// game-13 _saveDataToString: JSON.stringify(saveData, JSONreplacer) with
    /// orig key insertion order (undefined keys dropped). No LZ at <5mb.
    /// plain=true replicates export's JSON.stringify(saveData) — the loose
    /// \`value == undefined\` in JSONreplacer drops NULLS from the storage
    /// form, while the export form keeps them (motdContent/weather/faction).
    let buildSaveStringMode (plain: bool) : string =`],
    ["motd",
`        key "server"; objStart (); key "bcoinPrice"; numv 63918.0; objEnd (); sb.Append "," |> ignore`,
`        key "server"; objStart ()
        if plain then
            // preparedSaveData.server.motdContent is null — export keeps it
            key "motdContent"; raw "null"; sb.Append "," |> ignore
        key "bcoinPrice"; numv 63918.0; objEnd (); sb.Append "," |> ignore`],
    ["weather",
`        (match calendar.Weather with
         | Some w0 -> key "weather"; str w0; sb.Append "," |> ignore
         | None -> ())`,
`        (match calendar.Weather with
         | Some w0 -> key "weather"; str w0; sb.Append "," |> ignore
         | None -> if plain then (key "weather"; raw "null"; sb.Append "," |> ignore))`],
    ["faction",
`        (match voidp.Faction with Some f0 -> sb.Append "," |> ignore; key "faction"; str f0 | None -> ())`,
`        (match voidp.Faction with
         | Some f0 -> sb.Append "," |> ignore; key "faction"; str f0
         | None -> if plain then (sb.Append "," |> ignore; key "faction"; raw "null"))`],
    ["wrapper",
`    saveDataBuilder <- Some buildSaveString`,
`    let buildSaveString () : string = buildSaveStringMode false

    saveDataBuilder <- Some buildSaveString`],
    ["export-plain",
`            | [ "saveexport" ] ->
                // orig saveExport: JSON.stringify(save()) → compressToBase64
                let dataString = buildSaveString ()`,
`            | [ "saveexport" ] ->
                // orig saveExport: JSON.stringify(save()) → compressToBase64 —
                // the PLAIN stringify (nulls kept)
                let dataString = buildSaveStringMode true`],
    ["strip-expin",
`          const dataString = JSON.stringify(data);
          console.log("EXPIN len=" + dataString.length + " eqLC=" + (dataString === LCstorage["com.nuclearunicorn.kittengame.savedata"]));
          const lc = LCstorage["com.nuclearunicorn.kittengame.savedata"];
          let a = dataString, b = lc, i2 = 0;
          while (i2 < Math.min(a.length, b.length) && a[i2] === b[i2]) i2++;
          console.log("EXPDIFF at", i2, "alen", a.length, "blen", b.length);
          console.log("EXP-A:", JSON.stringify(a.slice(Math.max(0, i2 - 40), i2 + 60)));
          console.log("EXP-B:", JSON.stringify(b.slice(Math.max(0, i2 - 40), i2 + 60)));
          const enc = game.compressLZData(dataString);`,
     null],
  ];
  for (const [name, from, to] of edits) {
    if (to === null) continue; // orig-driver cleanup handled below
    if (t.split(from).length - 1 !== 1) { console.error("FAIL fs " + name); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok fs export plain");
}

{
  const q = "oracle/runner/orig-driver.js";
  let t = fs.readFileSync(q, "utf8");
  const from = `          const dataString = JSON.stringify(data);
          console.log("EXPIN len=" + dataString.length + " eqLC=" + (dataString === LCstorage["com.nuclearunicorn.kittengame.savedata"]));
          const lc = LCstorage["com.nuclearunicorn.kittengame.savedata"];
          let a = dataString, b = lc, i2 = 0;
          while (i2 < Math.min(a.length, b.length) && a[i2] === b[i2]) i2++;
          console.log("EXPDIFF at", i2, "alen", a.length, "blen", b.length);
          console.log("EXP-A:", JSON.stringify(a.slice(Math.max(0, i2 - 40), i2 + 60)));
          console.log("EXP-B:", JSON.stringify(b.slice(Math.max(0, i2 - 40), i2 + 60)));
          const enc = game.compressLZData(dataString);`;
  const to = `          const enc = game.compressLZData(JSON.stringify(data));`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL orig cleanup"); process.exit(1); }
  fs.writeFileSync(q, t.split(from).join(to));
  console.log("ok orig cleanup");
}
console.log("patch21e done");
