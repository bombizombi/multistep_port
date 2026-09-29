#!/usr/bin/env node
"use strict";
// fs: lzprobe resop mirroring the orig driver's LZString probe.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
if (!t.includes("lzprobe")) {
  t = t.replace(
`            | [ "savedump" ] ->`,
`            | [ "lzprobe" ] ->
                let sample = "kittens game save probe: {\\"saveVersion\\":15,\\"catnip\\":54.61999999999768,\\"кітки\\":\\"太陽\\"} 0123456789 aaaabbbbbb"
                let utf16 = Game.LzString.compressToUTF16 sample
                let b64 = Game.LzString.compressToBase64 sample
                let sha (s: string) =
                    use sha256 = System.Security.Cryptography.SHA256.Create()
                    System.BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes s)).Replace("-", "").ToLowerInvariant()
                System.Console.WriteLine("LZPROBE utf16len=" + string utf16.Length + " utf16sha=" + sha utf16)
                System.Console.WriteLine("LZPROBE b64len=" + string b64.Length + " b64sha=" + sha b64)
                System.Console.WriteLine("LZPROBE roundtrip=" + (if (Game.LzString.decompressFromUTF16 utf16) = Some sample then "true" else "false"))
                actionLog <- (curLogTick, "resop", m.Args, RNum (float utf16.Length)) :: actionLog
            | [ "savedump" ] ->`);
  fs.writeFileSync(q, t);
}
console.log("fs lzprobe added");
