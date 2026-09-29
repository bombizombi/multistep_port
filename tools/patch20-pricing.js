#!/usr/bin/env node
"use strict";
// Batch-20 (space-09/10): exact controller pricing. Mission getPrices
// (oil/manpower reductions, blackSky orbitalLaunch x11/starchart-0, on-reset +
// rorschach on=1 + in-progress gate); PlanetBuilding getPrices (priceRatio ||
// 1.15, oil 1.05 ladder, CostReduction effects, blackSky sattelite x14).
const fs = require("fs");

{
  const q = "kittens_land/src/Game/Game.Space.fs";
  let t = fs.readFileSync(q, "utf8");

  const start = t.indexOf("/// orig MissionBtnController buyItem");
  const endMarker = "// --- js/space.js L226-963: per-building calculated effects -------------------";
  const end = t.indexOf(endMarker);
  if (start < 0 || end < 0) { console.error("anchors missing"); process.exit(1); }

  const body = `/// per-building priceRatio (js/space.js defs); orig controller default 1.15
let priceRatio (name: string) : float =
    match name with
    | "sattelite" -> 1.08
    | "spaceElevator" -> 1.15
    | "spaceStation" -> 1.12
    | "moonOutpost" -> 1.12
    | "moonBase" -> 1.12
    | "planetCracker" -> 1.18
    | "hydrofracturer" -> 1.18
    | "spiceRefinery" -> 1.15
    | "researchVessel" -> 1.15
    | "orbitalArray" -> 1.15
    | "sunlifter" -> 1.15
    | "containmentChamber" -> 1.125
    | "heatsink" -> 1.12
    | "sunforge" -> 1.12
    | "cryostation" -> 1.12
    | "spaceBeacon" -> 1.15
    | "terraformingStation" -> 1.25
    | "hydroponics" -> 1.15
    | "hrHarvester" -> 1.15
    | "navigationRelay" -> 1.2
    | "spaceShuttle" -> 1.15
    | "entangler" -> 1.15
    | "tectonic" -> 1.25
    | "moltenCore" -> 1.25
    | _ -> 1.15

/// SpaceProgramBtnController.getPrices (js/space.js L1298-1321): oil/manpower
/// reductions, blackSky orbitalLaunch starchart→0 / rest ×11.
let missionPrices (getEffect: string -> float) (blackSkyActive: bool) (name: string) (def: Game.Catalog.Space.SpaceProgramDef) : (string * float) list =
    def.Prices
    |> List.map (fun p ->
        let mutable v = float p.Val
        if p.Resource = "oil" then
            v <- v * (1.0 - Game.Math.getLimitedDR (getEffect "oilReductionRatio") 0.75)
        if p.Resource = "manpower" then
            v <- v * (1.0 - Game.Math.getLimitedDR (getEffect "catpowerReductionRatio") 0.75)
        if blackSkyActive && name = "orbitalLaunch" then
            v <- (if p.Resource = "starchart" then 0.0 else v * 11.0)
        (p.Resource, v))

/// PlanetBuildingBtnController.getPrices (js/space.js L1396-1428): priceRatio
/// ladder (oil 1.05), oilReductionRatio, per-meta + per-resource
/// CostReduction effects, blackSky sattelite (val=0) starchart→0 / rest ×14.
let buildingPrices
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (def: Game.Catalog.Space.SpaceBuildingDef)
    (val0: int)
    : (string * float) list =
    let ratio = priceRatio def.Name
    let metaDiscount = 1.0 - Game.Math.getLimitedDR (getEffect (def.Name + "CostReduction")) 1.0
    let oilDiscount = 1.0 - Game.Math.getLimitedDR (getEffect "oilReductionRatio") 0.75
    def.Prices
    |> List.map (fun p ->
        let mutable v =
            if p.Resource <> "oil" then float p.Val * (ratio ** float val0)
            else (float p.Val * (1.05 ** float val0)) * oilDiscount
        let resDiscount = 1.0 - Game.Math.getLimitedDR (getEffect (p.Resource + "CostReduction")) 1.0
        v <- v * metaDiscount * resDiscount
        if blackSkyActive && def.Name = "sattelite" && val0 = 0 then
            v <- (if p.Resource = "starchart" then 0.0 else v * 14.0)
        (p.Resource, v))

/// orig MissionBtnController build (L1322-1345 via StackableBtn build +
/// updateEnabled): gate on unlocked + not in-progress (val≠0 && on=0); after
/// the purchase loop metadata.on is reset to 0 — except rorschachMission
/// which completes instantly (on=1). Unlocks fire on the first completion.
let buyProgram
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (calendarDay: int)
    (name: string)
    (maxBld: int)
    (sp: SpacePool)
    (pool: ResPool)
    : SpacePool * ResPool * int =
    let mutable sp = sp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let def = Game.Catalog.Space.programDefs |> List.find (fun d -> d.Name = name)
    let m0 = sp.Programs.[name]
    let enabled = m0.Unlocked && not (m0.Val <> 0 && m0.On = 0)
    if enabled then
        let prices () = missionPrices getEffect blackSkyActive name def
        while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
            let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
            pool <- pool1
            sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with Val = sp.Programs.[name].Val + 1 } }
            counter <- counter + 1
            maxBld <- maxBld - 1
            if counter = 1 then
                // unlocks fire on the first completion (missions are val=1 metas)
                for pn in def.UnlocksPlanets do
                    let pl = sp.Planets.[pn]
                    sp <- { sp with Planets = sp.Planets |> Map.add pn { pl with Unlocked = true } }
                for mn in def.UnlocksMissions do
                    let m = sp.Programs.[mn]
                    sp <- { sp with Programs = sp.Programs |> Map.add mn { m with Unlocked = true } }
        // build() resets on, then rorschach completes instantly (no route)
        sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with On = 0 } }
        if name = "rorschachMission" then
            sp <- { sp with Programs = sp.Programs |> Map.add name { sp.Programs.[name] with On = 1 } }
    sp, pool, counter

/// SpaceBuildingBtnController.build: gated on unlocked (planet-reached is a
/// precondition of unlock); prices re-read per purchase.
let buyBuilding
    (getEffect: string -> float)
    (blackSkyActive: bool)
    (calendarDay: int)
    (name: string)
    (maxBld: int)
    (sp: SpacePool)
    (pool: ResPool)
    : SpacePool * ResPool * int =
    let mutable sp = sp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let def = Game.Catalog.Space.buildingDefs |> List.find (fun d -> d.Name = name)
    if sp.Buildings.[name].Unlocked && sp.Planets.[def.Planet].Reached then
        let prices () = buildingPrices getEffect blackSkyActive def sp.Buildings.[name].Val
        while maxBld > 0 && (match Game.Resources.hasRes pool (prices ()) 0.0 with true -> true | _ -> false) do
            let pool1 = Game.Resources.payPrices calendarDay pool (prices ())
            pool <- pool1
            sp <- { sp with Buildings = sp.Buildings |> Map.add name { sp.Buildings.[name] with Val = sp.Buildings.[name].Val + 1; On = sp.Buildings.[name].On + 1 } }
            counter <- counter + 1
            maxBld <- maxBld - 1
    sp, pool, counter

`;
  t = t.slice(0, start) + body + t.slice(end);
  fs.writeFileSync(q, t);
  console.log("ok Game.Space.fs buy flows");
}

// runner call sites
const fs2 = require("fs");
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs2.readFileSync(q, "utf8");
  const edits = [
    ["mission-callsite",
`            let sp2, pool2, counter = Game.Space.buyProgram calendarDay name 1 spacep pool`,
`            let sp2, pool2, counter = Game.Space.buyProgram (Game.Effects.getEffect cache) (Game.Challenges.isActive cpool "blackSky") calendarDay name 1 spacep pool`],
    ["sbuilding-callsite",
`            let sp2, pool2, counter = Game.Space.buyBuilding calendarDay name n spacep pool`,
`            let sp2, pool2, counter = Game.Space.buyBuilding (Game.Effects.getEffect cache) (Game.Challenges.isActive cpool "blackSky") calendarDay name n spacep pool`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error(`FAIL ${name}`); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs2.writeFileSync(q, t);
  console.log("ok runner call sites");
}
console.log("patch20 done");
