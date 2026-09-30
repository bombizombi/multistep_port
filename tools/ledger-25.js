#!/usr/bin/env node
"use strict";
// buildings-10 (session 2026-09-30-25)
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const id = "buildings-10";
const needle = `{ id: "${id}",`;
const idx = t.indexOf(needle);
if (idx < 0) { console.error("no entry"); process.exit(1); }
const segEnd = t.indexOf("recon:", idx);
const seg = t.slice(idx, segEnd);
if (!seg.includes("status: not-started")) { console.error("not not-started"); process.exit(1); }
const ver = "Pollution engine: getPollutionLevel (log10 table), calculatePollutionEffects level branches 0-4+ (catnipRatio clamped -0.75, happiness, arrivalSlowdown, solarRevolutionPollution), dissipation (1e-7, 0 postApocalypse), accumulation L4532 (clamped 0), cache in updateCaches; wired: prodCtx catnip ratio + SR pollution (wood/catnip gate in Production), happiness pollution term, birth slowdown; resops setpollution/pollution/tick/level — pollution.cat IDENTICAL (natural 9.99/tick accumulation, decay, levels 0-2)";
t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-25", verification: "${ver}"`) + t.slice(segEnd);
fs.writeFileSync(q, t);
console.log("ok buildings-10");
