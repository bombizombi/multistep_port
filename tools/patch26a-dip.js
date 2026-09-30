#!/usr/bin/env node
"use strict";
// Batch-26 (diplomacy-09/10/11/12): standing math, duration clamp,
// embassyFakeBought, unlock draw edge, postApocalypse costs, explorers.
const fs = require("fs");

// ---- Game.Diplomacy.fs ----
{
  const q = "kittens_land/src/Game/Game.Diplomacy.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    // standing from policies + diplomats branch
    ["standing-policies",
`let calculateStandingFromPolicies (_raceName: string) : float = 0.0`,
`/// orig calculatePhantomTradeposts (L1222-1231): globalRelationsBonus +
/// zebra/nonZebra relation modifiers from policies
let calculatePhantomTradeposts (ctx: DiplomacyContext) (raceName: string) : float =
    ctx.GetEffect "globalRelationsBonus"
    + (if raceName = "zebras" then ctx.GetEffect "zebraRelationModifier" else ctx.GetEffect "nonZebraRelationModifier")

/// orig calculateStandingFromPolicies (L1232-1236): phantom × tradepost standingRatio
let calculateStandingFromPolicies (ctx: DiplomacyContext) (tradepostStandingRatio: float) (raceName: string) : float =
    calculatePhantomTradeposts ctx raceName * tradepostStandingRatio`],
    ["final-standing",
`let getFinalStanding (dp: DiplomacyPool) (ctx: DiplomacyContext) (raceName: string) : float =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let race = dp.Races.[raceName]
    let bonusStanding = ctx.GetEffect "standingRatio" + calculateStandingFromPolicies raceName
    if def.Standing < 0.0 then
        min (def.Standing + bonusStanding) 0.0
    elif def.Standing = 0.0 then
        // lizardRelationsDiplomats seam: not researched at this slice → 0
        0.0
    else
        def.Standing + bonusStanding / 2.0`,
`let getFinalStanding (dp: DiplomacyPool) (ctx: DiplomacyContext) (raceName: string) (tradepostStandingRatio: float) (diplomatsResearched: bool) (neutralRaceEmbassyStanding: float) : float =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let race = dp.Races.[raceName]
    let bonusStanding = ctx.GetEffect "standingRatio" + calculateStandingFromPolicies ctx tradepostStandingRatio raceName
    if def.Standing < 0.0 then
        min (def.Standing + bonusStanding) 0.0
    elif def.Standing = 0.0 then
        if diplomatsResearched then
            let b = bonusStanding + float race.EmbassyLevel * neutralRaceEmbassyStanding
            max ((b - 0.25) / 3.0) 0.0
        else 0.0
    else
        def.Standing + bonusStanding / 2.0`],
    ["duration-cap",
`        let race = dp.Races.[raceName]
        let durationCap = 100.0 * (1.0 + floor race.Energy) // daysPerSeason=100, seasonsPerYear=1... see note
        // NOTE: orig reads calendar.daysPerSeason * (calendar.seasonsPerYear + floor(energy));
        // those are 100 and 1 at this slice.
        let duration = min race.Duration durationCap`,
`        let race = dp.Races.[raceName]
        // orig L884: daysPerSeason × (seasonsPerYear + floor(energy)) = 100×(4+E)
        let durationCap = 100.0 * (4.0 + floor race.Energy)
        let duration = min race.Duration durationCap`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL dip " + name + " x" + (t.split(from).length - 1)); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok diplomacy module part 1");
}
console.log("patch26a done");
