#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/orig-driver.js";
let t = fs.readFileSync(q, "utf8");
const from = [
`          const meta = game.religion.getTU(name);`,
`          if (game.religion.transcendenceTier < meta.tier) {`].join("\n");
const to = [
`          const meta = game.religion.getTU(name);`,
`          // button handler tier-unlock loop (L3166-3174)`,
`          for (const tu of game.religion.transcendenceUpgrades) {`,
`            const check = (!tu.evaluateLocks || tu.evaluateLocks(game));`,
`            if (check && game.religion.transcendenceTier >= tu.tier) tu.unlocked = true;`,
`          }`,
`          if (game.religion.transcendenceTier < meta.tier) {`].join("\n");
if (t.split(from).length - 1 !== 1) { console.error("FAIL x" + (t.split(from).length - 1)); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok orig unlock loop");
