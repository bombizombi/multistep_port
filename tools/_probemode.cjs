const fs = require("fs");
const p = "Solver.fs";
let t = fs.readFileSync(p, "utf8");
// fast probe mode: 60k ticks with mine/miner/minerals diagnostics every 10k
t = t.replace(
`    | "temple" ->`,
`    | "probe" ->
        let mutable cur = initSeeded 42L
        let mutable lastLog = 0
        while cur.Ticks < 60000 do
            if cur.Ticks % 10 = 0 then cur <- fst (applyPolicy defaultTheta cur)
            cur <- tick cur
            if cur.Ticks - lastLog >= 10000 then
                lastLog <- cur.Ticks
                let mine = Game.Buildings.get cur.Bpool "mine" |> Option.map (fun b -> sprintf "v%d" b.Val) |> Option.defaultValue "?"
                let minerJob = cur.Vpool.JobValues |> Map.tryFind "miner" |> Option.defaultValue 0
                let minerUnlocked = cur.Vpool.JobUnlocked.Contains "miner"
                let smelt = Game.Buildings.get cur.Bpool "smelter" |> Option.map (fun b -> sprintf "v%d" b.Val) |> Option.defaultValue "?"
                printfn "t=%d mine=%s minerJob=%d minerUnl=%b smelter=%s minerals=%.1f iron=%.1f woodCap=%.0f"
                    cur.Ticks mine minerJob minerUnlocked smelt (getRes cur.Pool "minerals") (getRes cur.Pool "iron") (getResMax cur.Pool "wood")
        0
    | "temple" ->`);
fs.writeFileSync(p, t);
console.log("probe mode added");
