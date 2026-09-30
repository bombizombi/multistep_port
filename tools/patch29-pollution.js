#!/usr/bin/env node
"use strict";
// Batch-29 (buildings-10): pollution engine — cathPollution accumulation,
// calculatePollutionEffects table, getPollutionLevel, cathPollutionPerTick
// cache, setpollution/pollution resops, snapshot field.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  // pollution effects table state
  ["effects-state",
`    // buildings-10: bld.cathPollution / cathPollutionPerTick (js/buildings.js)
    let mutable cathPollution = 0.0
    let mutable cathPollutionPerTick = 0.0`,
`    // buildings-10: bld.cathPollution / cathPollutionPerTick (js/buildings.js)
    let mutable cathPollution = 0.0
    let mutable cathPollutionPerTick = 0.0
    // bld.pollutionEffects table (L2395-2412)
    let mutable polCatnipRatio = 0.0
    let mutable polHappines = 0.0
    let mutable polArrivalSlowdown = 0.0
    let mutable polSolarRevolution = 0.0
    let mutable polDissipationRatio = 1e-7
    let mutable fakeHousing = 0.0 // hut/logHouse/mansionFakeBought (postApocalypse)

    /// bld.getPollutionLevel (L2939): max(floor(log10(p × 10 / 1e7)), 0)
    let getPollutionLevel () : int =
        if cathPollution <= 0.0 then 0
        else max (int (floor (System.Math.Log10 (cathPollution * 10.0 / 10000000.0)))) 0

    /// bld.calculatePollutionEffects (L2724-2784): level-branched effect table
    let calculatePollutionEffects () : unit =
        let postApoc = Game.Challenges.isActive cpool "postApocalypse"
        let base' = 10000000.0
        let pollution = cathPollution
        let level = getPollutionLevel ()
        polDissipationRatio <- if postApoc then 0.0 else 1e-7
        fakeHousing <- if postApoc && level > 8 then float (level - 8) else 0.0
        let ldr v limit = Game.Math.getLimitedDR v limit
        if level >= 4 then
            polCatnipRatio <- ldr (-0.5 - 0.1 * log pollution) 10.0 / 10.0
            polHappines <- -log pollution * 1.2
            polArrivalSlowdown <- System.Math.Log10 (max pollution 0.0) * 1.2
            polSolarRevolution <- -min (1e-10 * (pollution - base' * 1000.0) / 9.0) 1.0
        elif level = 3 then
            polCatnipRatio <- ldr (-0.5 - 0.1 * log pollution) 10.0 / 10.0
            polHappines <- -log pollution * 1.18
            polArrivalSlowdown <- System.Math.Log10 (max pollution 0.0) * 1.11
            polSolarRevolution <- 0.0
        elif level = 2 then
            polCatnipRatio <- ldr (-0.5 - 0.1 * log pollution) 10.0 / 10.0
            polHappines <- -log pollution * 1.08
            polArrivalSlowdown <- (if pollution >= base' * 100.0 / 2.0 then 1.0 + 1.68e-8 * (pollution - base' * 100.0 / 2.0) else 0.0)
            polSolarRevolution <- 0.0
        elif level = 1 then
            polCatnipRatio <- -0.2 - ((pollution - base') * 0.05 / (base' * 10.0))
            polHappines <- (if pollution >= base' * 10.0 / 2.0 then -0.00000032 * (pollution - base' * 10.0 / 2.0) else 0.0)
            polArrivalSlowdown <- 0.0
            polSolarRevolution <- 0.0
        else
            polCatnipRatio <- (if pollution >= base' / 2.0 then -0.2 * (pollution - base' / 2.0) / (base' / 2.0) else 0.0)
            polHappines <- 0.0
            polArrivalSlowdown <- 0.0
            polSolarRevolution <- 0.0
        if polCatnipRatio < -0.75 then polCatnipRatio <- -0.75

    /// bld.getUndissipatedPollutionPerTick (L3017): prod × pollutionRatio ×
    /// (1+cathPollutionRatio) + con, where pollutionRatio = 1 − cleanRatio/2
    let cacheCathPollutionPerTick () : unit =
        let bldEff (k: string) = Game.Effects.getEffect cache k
        let stageEnergy name =
            match Game.Buildings.get bpool name with
            | Some b when b.Stage = 1 && b.Def.Stages.Length > 1 ->
                (b.Def.Stages.[1].Effects |> Map.tryFind "energyProduction" |> Option.defaultValue 0.0) * float b.On
            | _ -> 0.0
        let onEnergy name =
            match Game.Buildings.get bpool name with
            | Some b -> (b.Def.Effects |> Map.tryFind "energyProduction" |> Option.defaultValue 0.0) * float b.On
            | None -> 0.0
        let satEnergy =
            let s = spacep.Buildings.["sattelite"]
            (s.Effects |> Map.tryFind "energyProduction" |> Option.defaultValue 0.0) * float s.On
        let clean = stageEnergy "pasture" + stageEnergy "aqueduct" + onEnergy "reactor" / 2.0 + satEnergy
        let polluting = onEnergy "magneto" + onEnergy "steamworks"
        let cleanRatio = if clean + polluting = 0.0 then 0.0 else clean / (clean + polluting)
        let pollutionRatio = 1.0 - cleanRatio / 2.0
        let undissipated = bldEff "cathPollutionPerTickProd" * pollutionRatio * (1.0 + bldEff "cathPollutionRatio") + bldEff "cathPollutionPerTickCon"
        let dissipation = if System.Double.IsFinite cathPollution then cathPollution * polDissipationRatio else 0.0
        cathPollutionPerTick <- undissipated - dissipation`],
  // cache hook in refreshCache (updateCaches calls it BEFORE updateResources)
  ["refresh-hook",
`    and refreshCache () =
        spacepRef := spacep
        cache <- Game.Effects.updateCaches cache (allGroups ())
        let pctx = prodCtx ()`,
`    and refreshCache () =
        spacepRef := spacep
        cache <- Game.Effects.updateCaches cache (allGroups ())
        cacheCathPollutionPerTick () // bld.cacheCathPollutionPerTick (updateCaches tail)
        let pctx = prodCtx ()`],
  // updateModel accumulation + effects recalc (after bld.update / before end)
  ["model-accumulate",
`        // smelter per-tick action (js/buildings.js L1119-1152): IW safe-switch,`,
`        calculatePollutionEffects () // bld.update tail (L2881)
        // smelter per-tick action (js/buildings.js L1119-1152): IW safe-switch,`],
];
for (const [name, from, to] of edits) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok engine");
