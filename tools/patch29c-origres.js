#!/usr/bin/env node
"use strict";
// Add pollution resops to the orig driver.
const fs = require("fs");
const q = "oracle/runner/orig-driver.js";
let t = fs.readFileSync(q, "utf8");
const from = `        if (fn === "bldprobe") {`;
const to = `        if (fn === "setpollution") {
          game.bld.cathPollution = Number(arg1);
          game.bld.calculatePollutionEffects();
          game.bld.cacheCathPollutionPerTick();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.bld.cathPollution });
          return;
        }
        if (fn === "pollution") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.bld.cathPollution });
          return;
        }
        if (fn === "pollutiontick") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.bld.cathPollutionPerTick });
          return;
        }
        if (fn === "pollutionlevel") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.bld.getPollutionLevel() });
          return;
        }
        if (fn === "bldprobe") {`;
if (t.split(from).length - 1 !== 1) { console.error("FAIL x" + (t.split(from).length - 1)); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok orig pollution resops");
