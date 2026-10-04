const fs = require("fs");
const p = "Solver.fs";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
`    let policyBuild (sCur: State) (name: string) : State =
        match Game.Buildings.get sCur.Bpool name with
        | Some b when b.Unlocked ->
            let prices = Game.Buildings.getAllPrices sCur.Cache (pctx sCur) b
            if Game.Resources.hasRes sCur.Pool (prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0 then`,
`    let policyBuild (sCur: State) (name: string) : State =
        let traceIt = sCur.Ticks >= 40000 && sCur.Ticks < 40100 && name = "smelter"
        match Game.Buildings.get sCur.Bpool name with
        | Some b when b.Unlocked ->
            let prices = Game.Buildings.getAllPrices sCur.Cache (pctx sCur) b
            if traceIt then printfn "TRACE smelter: prices=%A minerals=%f hasRes=%b" (prices |> List.map (fun p0 -> (p0.Resource, p0.Val))) (getRes sCur.Pool "minerals") (Game.Resources.hasRes sCur.Pool (prices |> List.map (fun p0 -> (p0.Resource, p0.Val))) 0.0)
            if Game.Resources.hasRes sCur.Pool (prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0 then`);
fs.writeFileSync(p, t);
console.log("trace added");
