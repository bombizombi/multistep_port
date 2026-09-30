#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "tools/patch23-policies.js";
let t = fs.readFileSync(q, "utf8");
const from = [
`                // onResearch hooks`,
`                let pool2, sp3 =`,
`                    if name = "cryochamberExtraction" then`,
`                        let v = sp2.Policies |> Map.tryFind name // (policy stays; the VSU bump is runner-side)`,
`                        pool', sp2`,
`                    elif name = "upfrontPayment" then`].join("\n");
const to = [
`                // onResearch hooks (cryochamberExtraction VSU bump is runner-side)`,
`                let pool2, sp3 =`,
`                    if name = "upfrontPayment" then`].join("\n");
if (t.split(from).length - 1 !== 1) { console.error("FAIL"); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok cleaned");
