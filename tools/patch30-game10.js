#!/usr/bin/env node
"use strict";
// Batch-30 (game-10): production query probes — per-tick-with-conversion,
// per-day, on-year production, CMBR bonus.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

// add query helpers to Game.Production
{
  const pq = "kittens_land/src/Game/Game.Production.fs";
  let pt = fs.readFileSync(pq, "utf8");
  const anchor = "/// orig calcResourcePerTick(resName) — the full term chain in exact order.";
  const ins = `/// orig getResourcePerTickConvertion (game.js L4619-4623): fixFloat(PerTickCon
/// − ambassadorConsumption), ambassadors not modeled at this slice (0).
let getResourcePerTickConvertion (ctx: ProductionContext) (resName: string) : float =
    fixFloatPointNumber (ctx.GetEffect (resName + "PerTickCon"))

/// orig getResourcePerDay (game.js L4595-4601): PerDay effect; necrocorn adds
/// the deficit-consumption modifier + corruptionPerTick × ticksPerDay.
let getResourcePerDay (getEffect: string -> float) (necrocornModifier: float) (corruptionPerTick: float) (ticksPerDay: float) (resName: string) : float =
    if resName = "necrocorn" then
        necrocornModifier * getEffect (resName + "PerDay") + corruptionPerTick * ticksPerDay
    else getEffect (resName + "PerDay")

/// orig getResourceOnYearProduction (game.js L4605-4612): Production ×
/// (1+PolicyRatio) × (1+pyramidPerYearRatio); antimatter gated on energy.
let getResourceOnYearProduction (getEffect: string -> float) (energyProd: float) (energyCons: float) (resName: string) : float =
    if resName = "antimatter" && energyProd < energyCons then 0.0
    else getEffect (resName + "Production") * (1.0 + getEffect (resName + "PolicyRatio")) * (1.0 + getEffect "pyramidPerYearRatio")

/// orig getCMBRBonus (game.js L4404-4406): isCMBREnabled ? 0.2 : 0
let getCMBRBonus (isCmbREnabled: bool) : float = if isCmbREnabled then 0.2 else 0.0

` + anchor;
  if (pt.split(anchor).length - 1 !== 1) { console.error("FAIL prod anchor"); process.exit(1); }
  fs.writeFileSync(pq, pt.replace(anchor, ins));
  console.log("ok prod helpers");
}
// runner probes
{
  let t2 = fs.readFileSync(q, "utf8");
  const from = `            | [ "esprobe" ] ->`;
  const to = `            | [ "ptd"; resName ] ->
                // getResourcePerTick(name, true): cached + conversion
                let cached = (match get pool resName with Some r when r.Def.CalculatePerTick -> r.PerTickCached | _ -> 0.0)
                let conv = Game.Production.getResourcePerTickConvertion (prodCtx ()) resName
                actionLog <- (curLogTick, "resop", m.Args, RNum (cached + conv)) :: actionLog
            | [ "perday"; resName ] ->
                let modifier = Game.Religion.getNecrocornDeficitConsumptionModifier rpool
                let corruption = rpool.Corruption
                actionLog <-
                    (curLogTick, "resop", m.Args,
                     RNum (Game.Production.getResourcePerDay (Game.Effects.getEffect cache) modifier corruption Game.Calendar.ticksPerDay resName))
                    :: actionLog
            | [ "onyear"; resName ] ->
                actionLog <-
                    (curLogTick, "resop", m.Args,
                     RNum (Game.Production.getResourceOnYearProduction (Game.Effects.getEffect cache) pool.EnergyProd pool.EnergyCons resName))
                    :: actionLog
            | [ "cmbr" ] ->
                actionLog <- (curLogTick, "resop", m.Args, RNum (Game.Production.getCMBRBonus opts.Bools.["isCMBREnabled"])) :: actionLog
            | [ "esprobe" ] ->`;
  if (t2.split(from).length - 1 !== 1) { console.error("FAIL runner x" + (t2.split(from).length - 1)); process.exit(1); }
  fs.writeFileSync(q, t2.split(from).join(to));
  console.log("ok runner probes");
}
// ORIG probes
{
  const oq = "oracle/runner/orig-driver.js";
  let ot = fs.readFileSync(oq, "utf8");
  const from = `        if (fn === "bldprobe") {`;
  const to = `        if (fn === "ptd") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.getResourcePerTick(arg1, true) });
          return;
        }
        if (fn === "perday") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.getResourcePerDay(arg1) });
          return;
        }
        if (fn === "onyear") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.getResourceOnYearProduction(arg1) });
          return;
        }
        if (fn === "cmbr") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.getCMBRBonus() });
          return;
        }
        if (fn === "bldprobe") {`;
  if (ot.split(from).length - 1 !== 1) { console.error("FAIL orig x" + (ot.split(from).length - 1)); process.exit(1); }
  fs.writeFileSync(oq, ot.split(from).join(to));
  console.log("ok orig probes");
}
console.log("patch30 done");
