#!/usr/bin/env node
"use strict";
// Prod ctx: catnip pollution + SR pollution gating (wood/catnip only) +
// happiness pollution term + birth slowdown + setpollution/pollution resops.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  // prodCtx: feed the live catnip ratio + SR pollution
  ["prodctx-wiring",
`    let pctx () : Game.Buildings.PricingContext =`,
`    let prodCtx () : Game.Production.ProductionContext =
        let fresh = Game.Production.freshProductionContext cache calendar (calCtx ())
        { fresh with
            CatnipPollutionRatio = polCatnipRatio
            SolarRevolutionPollution = polSolarRevolution }
    let pctx () : Game.Buildings.PricingContext =`],
  // Production: SR pollution only applies to wood/catnip
  ["prod-sr-gate", null, null],
  // happiness: pollution term
  ["happiness-term",
`        let hctx : Game.Happiness.HappinessContext =
            { Game.Happiness.freshHappinessContext with
                LuxuryCount = luxCount
                FestivalDays = calendar.FestivalDays
                GetEffect = Game.Effects.getEffect cache }`,
`        let hctx : Game.Happiness.HappinessContext =
            { Game.Happiness.freshHappinessContext with
                LuxuryCount = luxCount
                FestivalDays = calendar.FestivalDays
                GetEffect = Game.Effects.getEffect cache
                PollutionHappines = polHappines }`],
  // birth slowdown
  ["birth-slowdown",
`        let mutable kittensPerTick = 0.01 * (1.0 + Game.Effects.getEffect cache "kittenGrowthRatio")`,
`        let mutable kittensPerTick = 0.01 * (1.0 + Game.Effects.getEffect cache "kittenGrowthRatio")
        // calculateKittensPerTick pollution tail (js/village.js L415-418)
        let arrivalSlowdown = polArrivalSlowdown + Game.Effects.getEffect cache "arrivalSlowdown"
        if arrivalSlowdown > 1.0 then kittensPerTick <- kittensPerTick / arrivalSlowdown`],
  // resops: setpollution + pollution probes
  ["pollution-resops",
`            | [ "esprobe" ] ->`,
`            | [ "setpollution"; valueArg ] ->
                // D014 injection: bld.cathPollution = value
                cathPollution <- float valueArg
                calculatePollutionEffects ()
                cacheCathPollutionPerTick ()
                actionLog <- (curLogTick, "resop", m.Args, RNum cathPollution) :: actionLog
            | [ "pollution" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum cathPollution) :: actionLog
            | [ "pollutiontick" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum cathPollutionPerTick) :: actionLog
            | [ "pollutionlevel" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum (float (getPollutionLevel ()))) :: actionLog
            | [ "esprobe" ] ->`],
];
for (const [name, from, to] of edits) {
  if (from === null) continue;
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok wiring");
