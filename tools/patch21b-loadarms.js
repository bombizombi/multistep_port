#!/usr/bin/env node
"use strict";
// Batch-21b: wire load/loadfile/saveexport/importfile into both drivers.
const fs = require("fs");

// ---------------------------------------------------------------- FS moves/resops
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["load-move",
`        | "load" -> actionLog <- (m.Tick, "load", m.Args, RNone) :: actionLog`,
`        | "load" ->
            // orig game.load(): parse the LCstorage blob, reset + apply
            applySaveBlob lcStorageSave
            actionLog <- (m.Tick, "load", m.Args, RNone) :: actionLog`],
    ["resop-arms",
`            | [ "esprobe" ] ->`,
`            | [ "loadfile"; path ] ->
                // D014 harness input: load an orig-produced blob from disk
                let loaded = System.IO.File.ReadAllText(path)
                lcStorageSave <- loaded
                applySaveBlob loaded
                actionLog <- (curLogTick, "resop", m.Args, RNum (float loaded.Length)) :: actionLog
            | [ "saveexport" ] ->
                // orig saveExport: JSON.stringify(save()) → compressToBase64
                let dataString = buildSaveString ()
                let enc = Game.LzString.compressToBase64 dataString
                let sha (s: string) =
                    use sha256 = System.Security.Cryptography.SHA256.Create()
                    System.BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes s)).Replace("-", "").ToLowerInvariant()
                System.Console.WriteLine("EXPORT len=" + string enc.Length + " sha=" + sha enc)
                actionLog <- (curLogTick, "resop", m.Args, RNum (float enc.Length)) :: actionLog
            | [ "importfile"; path ] ->
                // orig _loadSaveJson: decompress, integrity check, store the LZ
                // blob itself, then load
                let lz = System.IO.File.ReadAllText(path)
                let b64 = Game.LzString.decompressFromBase64 lz
                let utf16 = Game.LzString.decompressFromUTF16 lz
                let json =
                    if b64.IsSome && b64.Value.Length > 0 && b64.Value.[0] = '{' then b64.Value
                    elif utf16.IsSome && utf16.Value.Length > 0 && utf16.Value.[0] = '{' then utf16.Value
                    else failwith "Integrity check failure"
                lcStorageSave <- lz
                applySaveBlob lz
                actionLog <- (curLogTick, "resop", m.Args, RNum (float json.Length)) :: actionLog
            | [ "esprobe" ] ->`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL " + name); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok fs arms");
}

// ---------------------------------------------------------------- orig-driver
{
  const q = "oracle/runner/orig-driver.js";
  let t = fs.readFileSync(q, "utf8");
  const anchor = `        if (fn === "esprobe") {`;
  const insert = `        if (fn === "loadfile") {
          const loaded = require("fs").readFileSync(arg1, "utf8");
          LCstorage["com.nuclearunicorn.kittengame.savedata"] = loaded;
          game.load();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: loaded.length });
          return;
        }
        if (fn === "saveexport") {
          const data = game.save();
          const enc = game.compressLZData(JSON.stringify(data));
          console.log("EXPORT len=" + enc.length + " sha=" + require("crypto").createHash("sha256").update(enc).digest("hex"));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: enc.length });
          return;
        }
        if (fn === "importfile") {
          const lz = require("fs").readFileSync(arg1, "utf8");
          const json = game.decompressLZData(lz);
          if (!json || json[0] !== "{") throw new Error("Integrity check failure");
          LCstorage["com.nuclearunicorn.kittengame.savedata"] = lz;
          game.load();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: json.length });
          return;
        }
        if (fn === "esprobe") {`;
  if (t.split(anchor).length - 1 !== 1) { console.error("FAIL orig anchor"); process.exit(1); }
  t = t.replace(anchor, insert);
  const anchor2 = `      case "save": game.save(); return;`;
  const insert2 = `      case "save": game.save(); return;
      case "load": game.load(); return;`;
  if (t.split(anchor2).length - 1 !== 1) { console.error("FAIL orig load move"); process.exit(1); }
  t = t.replace(anchor2, insert2);
  fs.writeFileSync(q, t);
  console.log("ok orig arms");
}
console.log("patch21b done");
