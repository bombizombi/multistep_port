#!/usr/bin/env node
"use strict";
// reset blob fixes: challenge flip source, science booleans, usedCryochambers
// array shape, timestamp source, default loadouts
const fs = require("fs");
const p = "oracle/runner/fs-runner/Program.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
const norm = (s) => s.replace(/\r/g, "");
const findIdx = (pred, from = 0) => {
  for (let i = from; i < lines.length; i++) if (pred(norm(lines[i]))) return i;
  return -1;
};

// 1+2. challengeEntries BEFORE the pending-clear loop with active = wasPending
let i = findIdx((l) => l.trim() === "let resetInternal () : unit =");
if (i < 0) throw new Error("resetInternal");
let clearIdx = findIdx((l) => l.includes("cpool <- { cpool with Challenges = cpool.Challenges |> Map.add cn { c with Pending = false } }"), i);
if (clearIdx < 0) throw new Error("clear loop");
// the for-loop start is 2 lines above the assignment
let forIdx = clearIdx - 2;
const entries = [
  "        // challenge filterMetadata snapshot taken BEFORE the pending clear:",
  "        // the _resetInternal flip sets active = wasPending, everything else false",
  "        let challengeEntries =",
  "            cpool.Order",
  "            |> List.map (fun cn ->",
  "                let c = cpool.Challenges.[cn]",
  "                JObj",
  "                    [ (\"name\", JStr cn)",
  "                      (\"researched\", JBool c.Researched)",
  "                      (\"on\", JNum (float c.On))",
  "                      (\"unlocked\", JBool c.Unlocked)",
  "                      (\"active\", JBool c.Pending) ])",
];
lines.splice(forIdx, 0, ...entries);
// remove the OLD challengeEntries block (search after the clear loop)
let oldStart = findIdx((l) => l.trim() === "let challengeEntries =", forIdx + entries.length + 5);
if (oldStart < 0) throw new Error("old entries");
let oldEnd = findIdx((l) => l.trim() === "(\"active\", JBool c.Active) ])", oldStart);
if (oldEnd < 0) throw new Error("old entries end");
lines.splice(oldStart, oldEnd - oldStart + 2); // + trailing "let reservesJson" gap guard: next line is blank/comment
// fix the splice overshoot: oldEnd+1 might have eaten a blank line — fine.

// 3. science booleans
i = findIdx((l) => l.includes('("policyToggleResearched", JArr [])'));
if (i < 0) throw new Error("policyToggle");
lines[i] = lines[i].replace('("policyToggleResearched", JArr [])', '("policyToggleResearched", JBool false)');
lines[i + 1] = lines[i + 1].replace('("policyToggleBlocked", JArr [])', '("policyToggleBlocked", JBool false)');

// 4. usedCryochambers → array
i = findIdx((l) => l.includes('(\"usedCryochambers\", JObj [ (\"name\", JStr \"usedCryochambers\")'));
if (i < 0) throw new Error("cryo");
lines[i] = lines[i].replace(
  '("usedCryochambers", JObj [ (\"name\", JStr \"usedCryochambers\"); (\"val\", JNum 0.0); (\"on\", JNum 0.0) ])',
  '("usedCryochambers", JArr [ JObj [ (\"name\", JStr \"usedCryochambers\"); (\"val\", JNum 0.0); (\"on\", JNum 0.0) ] ])');

// 5. timestamp → curLogTick
i = findIdx((l) => l.includes('("timestamp", JNum (1759000000000.0 + float ticks * 1000.0))'));
if (i < 0) throw new Error("timestamp");
lines[i] = lines[i].replace("float ticks", "float curLogTick");

// 6. default loadouts (village-17 data; reset() recreates them when empty)
i = findIdx((l) => l.includes('(\"loadouts\", JArr [])'));
if (i < 0) throw new Error("loadouts");
const lo = [
  '                     ("loadouts", defaultLoadoutsJson)',
];
lines[i] = lines[i].replace('("loadouts", JArr [])', '("loadouts", defaultLoadoutsJson)');
// insert the data + builder before resetInternal
let ri = findIdx((l) => l.trim() === "let resetInternal () : unit =");
const loData = [
  "    // village.loadoutController default loadouts (village-17 data slice; the",
  "    // $I() mock titles, static job tables, trait/job pairings)",
  "    let loJob (idx: int) (name: string) (value: int) : string * JsValue =",
  "        (string idx, JObj [ (\"name\", JStr name); (\"value\", JNum (float value)) ])",
  "    let loEntry (title: string) (jobs: (int * string * int) list) (traitName: string) (traitTitle: string) (leaderJob: string) : JsValue =",
  "        JObj",
  "            [ (\"title\", JStr title)",
  "              (\"jobs\", JObj (jobs |> List.map (fun (idx, n, v) -> loJob idx n v)))",
  "              (\"engineerJobs\", JObj [])",
  "              (\"leaderTrait\", JObj [ (\"name\", JStr traitName); (\"title\", JStr traitTitle) ])",
  "              (\"leaderJob\", JStr leaderJob)",
  "              (\"pinned\", JBool false)",
  "              (\"isDefault\", JBool true)",
  "              (\"lastSelected\", JBool false) ]",
  "    let defaultLoadoutsJson : JsValue =",
  "        JArr",
  "            [ loEntry \"$village.loadout.default.balanced.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 1); (2, \"scholar\", 1); (3, \"hunter\", 1); (4, \"miner\", 1); (5, \"priest\", 1); (6, \"geologist\", 1) ]",
  "                  \"engineer\" \"$village.trait.engineer$\" \"farmer\"",
  "              loEntry \"$village.loadout.default.farming.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 5); (2, \"scholar\", 1); (3, \"hunter\", 1); (4, \"miner\", 1); (5, \"priest\", 1); (6, \"geologist\", 1) ]",
  "                  \"engineer\" \"$village.trait.engineer$\" \"farmer\"",
  "              loEntry \"$village.loadout.default.gathering.title$\"",
  "                  [ (0, \"woodcutter\", 5); (1, \"farmer\", 2); (2, \"scholar\", 1); (3, \"hunter\", 1); (4, \"miner\", 5); (5, \"priest\", 1) ]",
  "                  \"engineer\" \"$village.trait.engineer$\" \"woodcutter\"",
  "              loEntry \"$village.loadout.default.hunting.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 2); (2, \"scholar\", 1); (3, \"hunter\", 10); (4, \"miner\", 1); (5, \"priest\", 1) ]",
  "                  \"manager\" \"$village.trait.manager$\" \"hunter\"",
  "              loEntry \"$village.loadout.default.research.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 2); (2, \"scholar\", 10); (3, \"hunter\", 1); (4, \"miner\", 1); (5, \"priest\", 1) ]",
  "                  \"scientist\" \"$village.trait.scientist$\" \"scholar\"",
  "              loEntry \"$village.loadout.default.religion.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 2); (2, \"scholar\", 1); (3, \"hunter\", 1); (4, \"miner\", 1); (5, \"priest\", 10) ]",
  "                  \"wise\" \"$village.trait.wise$\" \"priest\"",
  "              loEntry \"$village.loadout.default.trade.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 2); (2, \"scholar\", 1); (3, \"hunter\", 5); (4, \"miner\", 1); (5, \"priest\", 1); (6, \"geologist\", 5) ]",
  "                  \"merchant\" \"$village.trait.merchant$\" \"geologist\"",
  "              loEntry \"$village.loadout.default.metallurgy.title$\"",
  "                  [ (0, \"woodcutter\", 1); (1, \"farmer\", 2); (2, \"scholar\", 1); (3, \"hunter\", 1); (4, \"miner\", 5); (5, \"priest\", 1); (6, \"geologist\", 5) ]",
  "                  \"metallurgist\" \"$village.trait.metallurgist$\" \"geologist\" ]",
  "",
];
lines.splice(ri, 0, ...loData);
fs.writeFileSync(p, lines.join("\n"));
console.log("reset fixes applied");
