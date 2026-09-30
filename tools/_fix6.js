const fs = require("fs");
const p = "oracle/runner/fs-runner/Program.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
let idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].replace(/\r/g, "").trim() === '| [ "isreadonly" ] ->') { idx = i; break; }
}
if (idx < 0) throw new Error("isreadonly anchor");
const arms = [
  '            | [ "chpend"; name ] ->',
  '                // ChallengeBtnController.togglePending (non-IW branch)',
  '                let c = cpool.Challenges.[name]',
  '                cpool <- { cpool with Challenges = cpool.Challenges |> Map.add name { c with Pending = not c.Pending } }',
  '                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog',
  '            | [ "cvis"; kind; name ] ->',
  '                // controller.updateVisible mirrors (hideResearched=false headless)',
  '                let v =',
  '                    match kind with',
  '                    | "challenge" -> cpool.Challenges.[name].Unlocked',
  '                    | "tech" ->',
  '                        let t = spool.Techs.[name]',
  '                        t.Unlocked && not t.Researched || t.Unlocked',
  '                    | "building" -> (Game.Buildings.get bpool name |> Option.map (fun b -> b.Unlocked) |> Option.defaultValue false)',
  '                    | _ -> false',
  '                actionLog <- (curLogTick, "resop", m.Args, RBool v) :: actionLog',
];
lines.splice(idx, 0, ...arms);
fs.writeFileSync(p, lines.join("\n"));
console.log("ok");
