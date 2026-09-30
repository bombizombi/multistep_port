#!/usr/bin/env node
"use strict";
// one-shot: swap the craft/hunt filter booleans for the full console filter map
const fs = require("fs");
const p = "oracle/runner/fs-runner/Program.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
let fixes = 0;
const loaderReplacement = [
  "                      consoleFilters <-",
  "                          fs0",
  "                          |> List.fold (fun acc (fname, fv) ->",
  "                              match acc |> Map.tryFind fname with",
  "                              | Some (_, en) ->",
  "                                  let unl =",
  "                                      match fv with",
  "                                      | JObj kv ->",
  "                                          (match kv |> List.tryFind (fun (k, _) -> k = \"unlocked\") with",
  "                                           | Some (_, JBool b) -> b",
  "                                           | _ -> false)",
  "                                      | _ -> false",
  "                                  acc |> Map.add fname (unl, en)",
  "                              | None -> acc) consoleFilters",
];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('(f0 = "craft" && craftFilterUnlocked) || (f0 = "hunt" && huntFilterUnlocked)')) {
    lines[i] = lines[i].replace(
      '(f0 = "craft" && craftFilterUnlocked) || (f0 = "hunt" && huntFilterUnlocked)',
      '(consoleFilters |> Map.tryFind f0 |> Option.map (fun (u, _) -> u) |> Option.defaultValue false)');
    fixes++;
  } else if (lines[i].trim() === "craftFilterUnlocked <- false") {
    lines[i] = lines[i].replace(
      "craftFilterUnlocked <- false",
      "consoleFilters <- consoleFilterNames |> List.map (fun f -> (f, (false, true))) |> Map.ofList");
    fixes++;
  } else if (lines[i].trim() === "huntFilterUnlocked <- false") {
    lines[i] = "";
    fixes++;
  } else if (lines[i].includes("craftFilterUnlocked <- jboolF")) {
    lines.splice(i, 1, ...loaderReplacement);
    i += loaderReplacement.length - 1;
    fixes++;
  } else if (lines[i].includes("if manpowerAfter < manpowerBefore then huntFilterUnlocked <- true")) {
    lines[i] = lines[i].replace("huntFilterUnlocked <- true", 'consoleFilters <- consoleFilters |> Map.add "hunt" (true, true)');
    fixes++;
  } else if (lines[i].includes("craftFilterUnlocked <- true // craftAll emits")) {
    lines[i] = lines[i].replace(
      "craftFilterUnlocked <- true // craftAll emits the craft-tag msg",
      'consoleFilters <- consoleFilters |> Map.add "craft" (true, true) // craftAll emits the craft-tag msg');
    fixes++;
  }
}
fs.writeFileSync(p, lines.join("\n"));
console.log("fixes:", fixes);
