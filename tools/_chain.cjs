const fs = require("fs");
const p = "Solver.fs";
let lines = fs.readFileSync(p, "utf8").split("\n");
const norm = (s) => (s || "").replace(/\r/g, "");
let inBlock = false;
let fixes = 0;
for (let i = 0; i < lines.length; i++) {
  const n = norm(lines[i]);
  if (n.includes("// barns: wood/mineral caps gate everything")) inBlock = true;
  if (inBlock && n.includes("getResMax sF.Pool")) { lines[i] = lines[i].replace("sF.Pool", "sG.Pool"); fixes++; }
  if (inBlock && n.includes("getRes sF.Pool")) { lines[i] = lines[i].replace("getRes sF.Pool", "getRes sG.Pool"); fixes++; }
  if (inBlock && n.includes("policyBuild sF")) { lines[i] = lines[i].replace("policyBuild sF", "policyBuild sG"); fixes++; }
  if (inBlock && n.includes("Game.Buildings.get sG2.Bpool")) { inBlock = false; }
}
fs.writeFileSync(p, lines.join("\n"));
console.log("fixes:", fixes);
