#!/usr/bin/env node
"use strict";
// console functions + scheduled events (CRLF-safe, line-based)
const fs = require("fs");
const p = "oracle/runner/fs-runner/Program.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
const norm = (s) => s.replace(/\r/g, "");

// find the display-formatter comment block
let fnIdx = -1;
for (let i = 1; i < lines.length; i++) {
  if (norm(lines[i]).includes("game.js display formatters") && norm(lines[i - 1]).includes("------")) {
    fnIdx = i - 1;
    break;
  }
}
if (fnIdx < 0) throw new Error("fn anchor");

const fns = [
  "    // com.nuclearunicorn.game.log.Console msg/clear/lockFilter — core-05",
  "    let consoleMsg (text: string) (typ: string option) (tag: string option) (noBullet: bool) : unit =",
  "        let mutable drop = false",
  "        match tag with",
  "        | Some tg ->",
  "            (match consoleFilters |> Map.tryFind tg with",
  "             | Some (unlocked, enabled) ->",
  "                 if not unlocked then consoleFilters <- consoleFilters |> Map.add tg (true, enabled)",
  "                 elif not enabled then drop <- true",
  "             | None -> ())",
  "        | None -> ()",
  "        if not drop then",
  "            let hasCal = (match spool.Techs |> Map.tryFind \"calendar\" with Some t -> t.Researched | None -> false)",
  "            // year.toLocaleString() — en-US, up to 3 fraction digits, no trailing zeros",
  "            let fmtYear (v: float) : string =",
  "                let s = v.ToString(\"N3\", System.Globalization.CultureInfo.GetCultureInfo(\"en-US\"))",
  "                s.TrimEnd('0').TrimEnd('.')",
  "            let season = Game.Calendar.seasons.[calendar.Season]",
  "            let numeral =",
  "                if Game.Challenges.isActive cpool \"winterIsComing\"",
  "                then [ \" I\"; \" II\"; \" III\"; \" IV\" ] |> List.item calendar.Season",
  "                else \"\"",
  "            let title = \"$calendar.season.\" + season.Name + \"$\" + numeral",
  "            let shortT = \"$calendar.season.\" + season.Name + \".short$\" + numeral",
  "            consoleMsgCounter <- consoleMsgCounter + 1",
  "            consoleMessages <-",
  "                consoleMessages",
  "                @ [ { CmId = consoleMsgCounter - 1",
  "                      CmText = text",
  "                      CmType = typ",
  "                      CmTag = tag",
  "                      CmHasCal = hasCal",
  "                      CmYear = (if hasCal then Some (fmtYear calendar.Year) else None)",
  "                      CmSeason = (if hasCal then Some title else None)",
  "                      CmSeasonShort = (if hasCal then Some shortT else None) } ]",
  "            if consoleMessages.Length > 40 then consoleMessages <- consoleMessages.Tail",
  "",
  "    let consoleClear () : unit = consoleMessages <- []",
  "",
  "    let consoleLockFilter (name: string) : bool =",
  "        match consoleFilters |> Map.tryFind name with",
  "        | Some (unlocked, enabled) ->",
  "            consoleFilters <- consoleFilters |> Map.add name (unlocked, not enabled)",
  "            true",
  "        | None -> false // orig console.error on invalid filter",
  "",
];
lines.splice(fnIdx, 0, ...fns);

// gtick scheduled events
let gIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (norm(lines[i]).trim() === "let gtick () =") { gIdx = i; break; }
}
if (gIdx < 0) throw new Error("gtick anchor");
lines.splice(gIdx + 1, 0,
  "        // game.tick head: updateScheduledEvents — probe markers fire here",
  "        if scheduledEvents > 0 then",
  "            scheduledFired <- scheduledFired + scheduledEvents",
  "            scheduledEvents <- 0");

fs.writeFileSync(p, lines.join("\n"));
console.log("ok");
