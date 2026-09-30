#!/usr/bin/env node
"use strict";
// Explorers button (SendExplorersButtonController) in both drivers.
const fs = require("fs");

// ORIG driver: real controller
{
  const q = "oracle/runner/orig-driver.js";
  let t = fs.readFileSync(q, "utf8");
  const from = `        if (fn === "bldprobe") {`;
  const to = `        if (fn === "explore") {
          // SendExplorersButtonController: pay 1000 manpower, unlockRandomRace;
          // on failure (all races met) refund 950 → net 50
          const race = game.diplomacy.unlockRandomRace();
          if (race) game.msg("trade.new.civ", "notice");
          else game.resPool.addResEvent("manpower", 950);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: race ? 1 : 0 });
          return;
        }
        if (fn === "bldprobe") {`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL orig"); process.exit(1); }
  fs.writeFileSync(q, t.split(from).join(to));
  console.log("ok orig explore");
}
// FS driver: reuse unlockRandomRace logic + gates
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const from = `            | [ "esprobe" ] ->`;
  const to = `            | [ "explore" ] ->
                // SendExplorersButtonController (js/diplomacy.js L1897-1931):
                // pay 1000 manpower, unlockRandomRace, refund 950 on failure
                let manp0 = (match get pool "manpower" with Some r -> r.Value | None -> 0.0)
                if manp0 >= 1000.0 then
                    let pool1, _ = Game.Resources.addResEvent calendarDay "manpower" -1000.0 pool
                    pool <- pool1
                    let dp1, ev = Game.Diplomacy.unlockRandomRace dp (fun () -> rngDraws <- rngDraws + 1; rand ())
                    dp <- dp1
                    match ev.Race with
                    | Some _ -> pool <- fst (Game.Resources.addResEvent calendarDay "manpower" 0.0 pool)
                    | None ->
                        let pool2, _ = Game.Resources.addResEvent calendarDay "manpower" 950.0 pool
                        pool <- pool2
                    actionLog <- (curLogTick, "resop", m.Args, RNum (match ev.Race with Some _ -> 1.0 | None -> 0.0)) :: actionLog
                else
                    actionLog <- (curLogTick, "resop", m.Args, RText "cannot-afford") :: actionLog
            | [ "esprobe" ] ->`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL fs"); process.exit(1); }
  fs.writeFileSync(q, t.split(from).join(to));
  console.log("ok fs explore");
}
console.log("patch27 done");
