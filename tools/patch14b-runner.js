#!/usr/bin/env node
"use strict";
// Batch-14 patch B: researchChallengeFull + VSU purchase + vsuCalculate +
// autumn unjam wiring.
const fs = require("fs");

// --- Game.Time.fs: VSU defs access + buyVSU/sellVSU + vsuCalculate ------------
const tp = "kittens_land/src/Game/Game.Time.fs";
let ts = fs.readFileSync(tp, "utf8");

ts = ts.replace(`// --- time-07: manual shatter heat split (ShatterTCBtnController.doShatter) -----`,
`// --- time-06: voidspace purchase + calculateEffects ----------------------------

let vsuDef (name: string) : Game.Catalog.World.VSUDef =
    Game.Catalog.World.vsuDefs |> List.find (fun d -> d.Name = name)

/// VoidSpaceBtnController.getPrices: stackable ladder; cryochambers takes the
/// karma discount 1 − LDR(0.01 × burnedParagonRatio, 1).
let vsuPrices (tp: TimePool) (burnedParagonRatio: float) (name: string) : (string * float) list =
    let def = vsuDef name
    let meta = tp.VSUs.[name]
    let ratio = def.PriceRatio |> Option.defaultValue 1.0
    def.Prices
    |> List.map (fun p ->
        let v = p.Val * ratio ** float meta.Val
        if name = "cryochambers" && p.Resource = "karma" then
            (p.Resource, v - v * Game.Math.getLimitedDR (0.01 * burnedParagonRatio) 1.0)
        else (p.Resource, v))

/// VoidSpaceBtnController.build(model, maxBld) loop (same pay-cache-recompute
/// order as the CFU ladder).
let buyVSU (calendarDay: int) (name: string) (maxBld: int) (burnedParagonRatio: float) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let mutable prices = vsuPrices tp burnedParagonRatio name
    while maxBld > 0 && cfuHasRes pool prices do
        tp <-
            { tp with
                VSUs =
                    tp.VSUs
                    |> Map.add name { tp.VSUs.[name] with Val = tp.VSUs.[name].Val + 1; On = tp.VSUs.[name].On + 1 } }
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName (-val') pool
            pool <- pool1
        counter <- counter + 1
        maxBld <- maxBld - 1
        prices <- vsuPrices tp burnedParagonRatio name
    tp, pool, counter

/// time.undo buildVSU: full-refund sellInternal at the re-derived ladder.
let sellVSU (calendarDay: int) (name: string) (endVal: int) (burnedParagonRatio: float) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    while tp.VSUs.[name].Val > endVal do
        tp <-
            { tp with
                VSUs =
                    tp.VSUs
                    |> Map.add name
                        { tp.VSUs.[name] with
                            Val = tp.VSUs.[name].Val - 1
                            On = if tp.VSUs.[name].On > tp.VSUs.[name].Val - 1 then tp.VSUs.[name].Val - 1 else tp.VSUs.[name].On } }
        let prices = vsuPrices tp burnedParagonRatio name
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName val' pool
            pool <- pool1
        counter <- counter + 1
    tp, pool, counter

/// VSU calculateEffects (calculateAllEffects voidSpace pass).
/// cryochambers: limitBuild = chronosphere.on + cryochamberSupport; on =
/// min(val, limitBuild). chronocontrol: temporalParadoxDay = 1 + bonus.
let vsuCalculate (tp: TimePool) (chronosphereOn: int) (getEffect: string -> float) : TimePool =
    let cryo = tp.VSUs.["cryochambers"]
    let limitBuild = chronosphereOn + int (getEffect "cryochamberSupport")
    let tp =
        { tp with
            VSUs =
                tp.VSUs
                |> Map.add "cryochambers"
                    { cryo with On = min cryo.Val limitBuild } }
    let ctrl = tp.VSUs.["chronocontrol"]
    { tp with
        VSUs =
            tp.VSUs
            |> Map.add "chronocontrol"
                { ctrl with
                    Eff = ctrl.Eff |> Map.add "temporalParadoxDay" (1.0 + getEffect "temporalParadoxDayBonus") } }

// --- time-07: manual shatter heat split (ShatterTCBtnController.doShatter) -----`);
fs.writeFileSync(tp, ts);
console.log("Game.Time VSU added");

// VSUDef needs PriceRatio — check catalog type
const cw = "kittens_land/src/Game/Game.Catalog.World.fs";
let cws = fs.readFileSync(cw, "utf8");
if (!cws.includes("type VSUDef =")) { console.error("VSUDef missing"); process.exit(1); }
if (!cws.includes("type VSUDef =\n    { Name: string; Prices: Price list; Effects: Map<string, float>; PriceRatio: float option }")) {
  cws = cws.replace(
    "type VSUDef = { Name: string; Prices: Price list; Effects: Map<string, float> }",
    "type VSUDef = { Name: string; Prices: Price list; Effects: Map<string, float>; PriceRatio: float option }");
  // add PriceRatio to each literal (orig: battery-ish ratios; usedCryochambers/voidHoover/voidRift/chronocontrol/voidResonator 1.25, cryochambers 1.25)
  cws = cws.replace('{ Name = "cryochambers"; Prices = [{ Resource = "karma"; Val = 1 }; { Resource = "timeCrystal"; Val = 2 }; { Resource = "void"; Val = 100 }]; Effects = Map.ofList ["maxKittens", 1] }',
                    '{ Name = "cryochambers"; Prices = [{ Resource = "karma"; Val = 1 }; { Resource = "timeCrystal"; Val = 2 }; { Resource = "void"; Val = 100 }]; Effects = Map.ofList ["maxKittens", 1]; PriceRatio = Some 1.25 }');
  cws = cws.replace('{ Name = "usedCryochambers"; Prices = []; Effects = Map.empty }',
                    '{ Name = "usedCryochambers"; Prices = []; Effects = Map.empty; PriceRatio = Some 1.25 }');
  cws = cws.replace('{ Name = "voidHoover"; Prices = [{ Resource = "antimatter"; Val = 1000 }; { Resource = "timeCrystal"; Val = 10 }; { Resource = "void"; Val = 250 }]; Effects = Map.ofList ["temporalParadoxVoid", 1] }',
                    '{ Name = "voidHoover"; Prices = [{ Resource = "antimatter"; Val = 1000 }; { Resource = "timeCrystal"; Val = 10 }; { Resource = "void"; Val = 250 }]; Effects = Map.ofList ["temporalParadoxVoid", 1]; PriceRatio = Some 1.25 }');
  cws = cws.replace('{ Name = "voidRift"; Prices = [{ Resource = "void"; Val = 75 }]; Effects = Map.ofList ["umbraBoostRatio", 0.1; "globalResourceRatio", 0.02] }',
                    '{ Name = "voidRift"; Prices = [{ Resource = "void"; Val = 75 }]; Effects = Map.ofList ["umbraBoostRatio", 0.1; "globalResourceRatio", 0.02]; PriceRatio = Some 1.3 }');
  cws = cws.replace('{ Name = "chronocontrol"; Prices = [{ Resource = "temporalFlux"; Val = 3000 }; { Resource = "timeCrystal"; Val = 30 }; { Resource = "void"; Val = 500 }]; Effects = Map.ofList ["temporalParadoxDay", 0; "energyConsumption", 15] }',
                    '{ Name = "chronocontrol"; Prices = [{ Resource = "temporalFlux"; Val = 3000 }; { Resource = "timeCrystal"; Val = 30 }; { Resource = "void"; Val = 500 }]; Effects = Map.ofList ["temporalParadoxDay", 0; "energyConsumption", 15]; PriceRatio = Some 1.25 }');
  cws = cws.replace('{ Name = "voidResonator"; Prices = [{ Resource = "timeCrystal"; Val = 1000 }; { Resource = "relic"; Val = 10000 }; { Resource = "void"; Val = 50 }]; Effects = Map.ofList ["voidResonance", 0.1] }',
                    '{ Name = "voidResonator"; Prices = [{ Resource = "timeCrystal"; Val = 1000 }; { Resource = "relic"; Val = 10000 }; { Resource = "void"; Val = 50 }]; Effects = Map.ofList ["voidResonance", 0.1]; PriceRatio = Some 1.25 }');
  fs.writeFileSync(cw, cws);
  console.log("VSUDef catalog updated");
}

// --- Game.Calendar.fs: autumn unjam hook ---------------------------------------
const cal = "kittens_land/src/Game/Game.Calendar.fs";
let cs = fs.readFileSync(cal, "utf8");
if (!cs.includes("OnNewSeasonTail")) {
  cs = cs.replace(`      OnFlux: float -> unit }  // time.flux bookkeeping (time-01); arg = delta`,
`      OnFlux: float -> unit // time.flux bookkeeping (time-01); arg = delta
      OnNewSeasonTail: CalendarState -> CalendarState // steamworks autumn unjam seam`);
  cs = cs.replace(`            if newYear then`,
`            // onNewSeason tail: steamworks unjam at autumn (season 2) with
            // advancedAutomation (js/calendar.js L951-953); pasture upgrade
            // fan-out is a buildings seam
            st <- ctx.OnNewSeasonTail st

            if newYear then`);
  fs.writeFileSync(cal, cs);
  console.log("calendar autumn unjam hook added");
}
console.log("patch B done");
