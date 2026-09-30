const fs = require("fs");
const p = "oracle/runner/orig-driver.js";
let lines = fs.readFileSync(p, "utf8").split("\n");
let idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (fn === "isreadonly")')) { idx = i; break; }
}
if (idx < 0) throw new Error("anchor");
const arms = [
  '        if (fn === "chpend") {',
  '          const c = new classes.ui.ChallengeBtnController(game);',
  '          const m = { options: { id: arg1 }, pending: false };',
  '          m.metadata = c.getMetadata(m);',
  '          c.togglePending(m);',
  '          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });',
  '          return;',
  '        }',
  '        if (fn === "cvis") {',
  '          let v = false;',
  '          if (arg1 === "challenge") {',
  '            const c = new classes.ui.ChallengeBtnController(game);',
  '            const m = { options: { id: arg2 }, visible: false };',
  '            m.metadata = c.getMetadata(m);',
  '            c.updateVisible(m);',
  '            v = m.visible;',
  '          } else if (arg1 === "tech") {',
  '            const c = new com.nuclearunicorn.game.ui.TechButtonController(game);',
  '            const m = { options: { id: arg2 }, visible: false };',
  '            m.metadata = c.getMetadata(m);',
  '            c.updateVisible(m);',
  '            v = m.visible;',
  '          } else if (arg1 === "building") {',
  '            const c = new classes.ui.btn.BuildingBtnModernController(game);',
  '            const m = { options: { building: arg2 }, visible: false };',
  '            m.metadata = c.getMetadata(m);',
  '            c.updateVisible(m);',
  '            v = m.visible;',
  '          }',
  '          actionLog.push({ tick: tickIndex, action: "resop", args, result: v });',
  '          return;',
  '        }',
];
lines.splice(idx, 0, ...arms);
fs.writeFileSync(p, lines.join("\n"));
console.log("ok");
