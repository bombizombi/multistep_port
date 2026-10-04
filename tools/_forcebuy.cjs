const fs = require("fs");
const p = "Solver.fs";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
`            // probe at t=2001: force-buy a hut and see what happens`,
`            // probe: force-buy smelter at t=40001
            if cur.Ticks = 40001 then
                let before = Game.Buildings.get cur.Bpool "smelter" |> Option.map (fun b -> b.Val) |> Option.defaultValue -1
                let cur2 = buyBuilding "smelter" cur
                printfn "PROBE smelter force-buy: before=%d after=%d minerals=%f" before (Game.Buildings.get cur2.Bpool "smelter" |> Option.map (fun b -> b.Val) |> Option.defaultValue -1) (getRes cur2.Pool "minerals")
            // probe at t=2001: force-buy a hut and see what happens`);
fs.writeFileSync(p, t);
console.log("force-buy probe");
