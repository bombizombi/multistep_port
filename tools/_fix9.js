#!/usr/bin/env node
"use strict";
const fs = require("fs");
const p = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(p, "utf8");
t = t.replace("    let jsonOfValue (v: JsValue) : string =", "    let rec jsonOfValue (v: JsValue) : string =");
t = t.replace(
  "    let mutable pausedReset = false // post-_resetInternal pause (isPaused)",
  "    let mutable pausedReset = false // post-_resetInternal pause (isPaused)\n    let mutable karmaZebras = 0 // game.karmaZebras");
t = t.replace("          KarmaZebras = 0 }", "          KarmaZebras = karmaZebras }");
t = t.replace('key "karmaZebras"; intv pool.KarmaZebras', 'key "karmaZebras"; intv karmaZebras');
const oldKz = [
  "        let mutable kz = pool.KarmaZebras",
  "        if (match get pool \"zebras\" with Some r -> r.Value | None -> 0.0) > 0.0 && ironWill then",
  "            kz <- kz + bonusZebras",
  "        pool <- { pool with KarmaZebras = kz }",
].join("\n");
const newKz = [
  "        if (match get pool \"zebras\" with Some r -> r.Value | None -> 0.0) > 0.0 && ironWill then",
  "            karmaZebras <- karmaZebras + bonusZebras",
].join("\n");
if (!t.includes(oldKz)) throw new Error("kz anchor");
t = t.replace(oldKz, newKz);
t = t.replace('|> jset "karmaZebras" (JNum (float pool.KarmaZebras))', '|> jset "karmaZebras" (JNum (float karmaZebras))');
const oldReset = ["            queueSort <- true", "            consoleFilters"].join("\n");
const newReset = [
  "            queueSort <- true",
  "            karmaZebras <- 0",
  "            pausedReset <- false",
  "            resetPendingFlag <- false",
  "            consoleFilters",
].join("\n");
if (!t.includes(oldReset)) throw new Error("reset anchor");
t = t.replace(oldReset, newReset);
fs.writeFileSync(p, t);
console.log("ok");
