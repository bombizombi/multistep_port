const fs = require("fs");
const p = "Solver.fs";
let t = fs.readFileSync(p, "utf8");

// 1. barns: keep wood headroom — build while wood is near cap
t = t.replace(
`            let sG =
                if goldOreDone && smelters < 10 then policyBuild sF "smelter" else sF
            let fields = (Game.Buildings.get sG.Bpool "field" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0)
            let sH = if fields < theta.FieldTarget then policyBuild sG "field" else sH2 sG
            sH)`,
`            let sG =
                if goldOreDone && smelters < 10 then policyBuild sF "smelter" else sF
            // barns: wood/mineral caps gate everything — build while near cap
            let sG2 =
                let woodCap = getResMax sF.Pool "wood"
                let woodNow = getRes sF.Pool "wood"
                if woodCap > 0.0 && woodNow >= woodCap * 0.8 then policyBuild sF "barn" else sF
            let fields = (Game.Buildings.get sG2.Bpool "field" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0)
            let sH = if fields < theta.FieldTarget then policyBuild sG2 "field" else sH2 sG2
            sH)`);

// 2. miners: assign once the mine exists (minerals for slabs + goldOre)
t = t.replace(
`        let targets = [ "woodcutter", nWood; "farmer", nFarmer; "hunter", nHunter; "scholar", max 0 nScholar ]`,
`        let nMiner =
            if s.Vpool.JobUnlocked.Contains "miner" && kittens >= 8 then
                min 5 (int (System.Math.Floor(float kittens * 0.15)))
            else 0
        let targets =
            [ "woodcutter", nWood; "farmer", nFarmer; "hunter", nHunter; "miner", nMiner; "scholar", max 0 nScholar ]`);

// 3. build mines earlier (minerals unlock the whole gold chain)
t = t.replace(
`            let sF = if kittens >= theta.BuildMineAt then policyBuild sE "mine" else sE`,
`            let sF = policyBuild sE "mine" // cheap (wood 100), unlocks miner job`);
fs.writeFileSync(p, t);
console.log("barns+miners+mines added");
