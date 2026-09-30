#!/usr/bin/env node
"use strict";
// Inject cathPollutionPerTickProd into polluting building defs (multi-line).
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Catalog.Defs.fs";
let lines = fs.readFileSync(q, "utf8").split("\n");
const additions = { mine: "0.08", quarry: "0.25", smelter: "0.15", calciner: "1", steamworks: "1", magneto: "5" };
let current = null, injected = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/\{ Name = "([a-zA-Z]+)";/);
  if (m) current = m[1];
  if (current && additions[current] && lines[i].includes("Effects = Map.ofList [") && !lines.slice(i, i + 8).some(l => l.includes("cathPollutionPerTickProd"))) {
    // append to the effects list: find the closing "];" of this Effects line(s)
    let j = i;
    while (!lines[j].includes("]") || !lines[j].includes("StartsUnlocked") && !lines[j].trim().endsWith("] }") && !(lines[j].includes("]") && lines[j].includes("Effects"))) j++;
    // simpler: insert right after the Effects = Map.ofList [ line if it ends with ] on same line
    if (lines[i].includes("]")) {
      lines[i] = lines[i].replace("Map.ofList [", "Map.ofList [ \"cathPollutionPerTickProd\", " + additions[current] + "; ");
      injected++;
      current = null;
    } else {
      // find closing line
      let k = i;
      while (!lines[k].includes("]; ")) k++;
      lines[k] = lines[k].replace("]; ", "\"cathPollutionPerTickProd\", " + additions[current] + "; ]; ");
      injected++;
      current = null;
    }
  }
}
fs.writeFileSync(q, lines.join("\n"));
console.log("injected " + injected);
