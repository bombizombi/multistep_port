#!/usr/bin/env node
"use strict";
// Batch-16: game-13 save builder — the exact JSON the orig _saveDataToString
// emits (key order = JS object insertion order = orig save() call order).
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

const block = `
    // --- game-13: save/load core ------------------------------------------------
    // LCstorage["com.nuclearunicorn.kittengame.savedata"] equivalent + the
    // telemetry guid (32 seeded draws at boot, mirroring generateGuid).
    let mutable telemetryGuid = ""
    do
        // orig boot: telemetry.generateGuid before any scenario move
        let pattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        let mutable g = ""
        for c in pattern do
            g <-
                if c = 'x' then
                    let d = int (rand () * 16.0)
                    g + "0123456789abcdef".[d].ToString()
                elif c = 'y' then
                    let d = int (rand () * 4.0) + 8
                    g + "0123456789abcdef".[d].ToString()
                else g + c.ToString()
        telemetryGuid <- g

    let jsonStr (s: string) : string =
        let mutable out = System.Text.StringBuilder("\\"")
        for ch in s do
            if ch = '"' then out.Append "\\\\\\"" |> ignore
            elif ch = '\\\\' then out.Append "\\\\\\\\" |> ignore
            elif ch = '\\n' then out.Append "\\\\n" |> ignore
            elif ch = '\\r' then out.Append "\\\\r" |> ignore
            elif ch = '\\t' then out.Append "\\\\t" |> ignore
            else out.Append ch |> ignore
        out.Append("\\"").ToString()

    let mutable saveDataBuilder: (unit -> string) option = None
`;

t = t.replace(`    let takeSnapshot () =`, block + `\n    let takeSnapshot () =`);

// The builder body is inserted later (needs takeSnapshot-independent helpers).
fs.writeFileSync(q, t);
console.log("save scaffolding inserted");
