const fs = require("fs");
const p = "Solver.fs";
let t = fs.readFileSync(p, "utf8");
const anchor = `    | "debug" ->`;
const templeMode = `    | "temple" ->
        // single full-length run with the default policy: where does it stall?
        let gstart = System.Diagnostics.Stopwatch.StartNew()
        let ticks, plan, final = runPolicyTo Temple defaultTheta 42L 600000 (initSeeded 42L)
        gstart.Stop()
        printfn "temple run: ticks=%d wall=%.0f s actions=%d" ticks gstart.Elapsed.TotalSeconds plan.Length
        let lib = Game.Buildings.get final.Bpool "library" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0
        let sciMax = Game.Effects.getEffect final.Cache "scienceMax"
        let goldOre = (match final.Wpool.Upgrades |> Map.tryFind "goldOre" with Some u -> u.Researched | None -> false)
        let smelters = (Game.Buildings.get final.Bpool "smelter" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0)
        printfn "libraries=%d sciMax=%.0f sci=%.0f goldOre=%b smelters=%d gold=%.1f" lib sciMax (getRes final.Pool "science") goldOre smelters (getRes final.Pool "gold")
        printfn "researched=%A" (final.Spool.TechOrder |> List.filter (fun n -> final.Spool.Techs.[n].Researched))
        if ticks >= 0 then
            System.IO.File.WriteAllText("../oracle/scenarios/temple-solver.cat", emitCat "temple-solver" 42 plan)
            printfn "plan written (%d actions)" plan.Length
        0
`;
if (!t.includes(anchor)) throw new Error("debug anchor");
t = t.replace(anchor, templeMode + anchor);
fs.writeFileSync(p, t);
console.log("temple mode added (v2)");
