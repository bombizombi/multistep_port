const fs = require("fs");
// FS move arms + probe
let p = "oracle/runner/fs-runner/Program.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
let idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].replace(/\r/g, "").trim() === '| "burnparagon" ->') { idx = i; break; }
}
if (idx < 0) throw new Error("burnparagon anchor");
const arms = [
  '        | "reset" ->',
  '            // game.reset: confirm auto-OK → onRunReset + pending clears +',
  '            // resetAutomatic schedule (fires at next tick start)',
  '            resetPendingFlag <- true',
  '        | "applyreset" ->',
  '            // window.location.reload() equivalent: load the post-reset blob;',
  '            // load() catches its own broken-load quirk headlessly',
  '            if pausedReset then applySaveBlob lcStorageSave',
  '            actionLog <- (m.Tick, "applyreset", m.Args, RNum 0.0) :: actionLog',
];
lines.splice(idx, 0, ...arms);
// resop probe
let r = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].replace(/\r/g, "").trim() === '| [ "isreadonly" ] ->') { r = i; break; }
}
if (r < 0) throw new Error("isreadonly");
lines.splice(r, 0,
  '            | [ "resetprestige" ] ->',
  '                let (kk, pp) = getResetPrestige ()',
  '                actionLog <- (curLogTick, "resop", m.Args, RRes (sprintf "%s/%s" (string kk) (string pp))) :: actionLog');
fs.writeFileSync(p, lines.join("\n"));
console.log("fs ok");

// orig driver
p = "oracle/runner/orig-driver.js";
lines = fs.readFileSync(p, "utf8").split("\n");
idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('case "burnparagon"')) { idx = i; break; }
}
if (idx < 0) throw new Error("orig burnparagon");
lines.splice(idx, 0,
  '      case "reset": game.reset(); return; // confirm auto-OK → schedule',
  '      case "applyreset": {',
  '        if (game.isPaused) { try { game.load(); } catch (e) { /* broken-load quirk */ } }',
  '        actionLog.push({ tick: tickIndex, action, args, result: 0 });',
  '        return;',
  '      }');
idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (fn === "isreadonly")')) { idx = i; break; }
}
if (idx < 0) throw new Error("orig isreadonly");
lines.splice(idx, 0,
  '        if (fn === "resetprestige") {',
  '          const rp = game.getResetPrestige();',
  '          actionLog.push({ tick: tickIndex, action: "resop", args, result: `${rp.karmaKittens}/${rp.paragonPoints}` });',
  '          return;',
  '        }');
fs.writeFileSync(p, lines.join("\n"));
console.log("orig ok");
