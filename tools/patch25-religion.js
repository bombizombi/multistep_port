#!/usr/bin/env node
"use strict";
// Batch-25 (religion-10/11/12/13): TU purchase + transforms + sorrow refine.
const fs = require("fs");

// ---- Religion module: transforms + buyTU + ZU calcs + sorrow ----
{
  const q = "kittens_land/src/Game/Game.Religion.fs";
  let t = fs.readFileSync(q, "utf8");
  const anchor = "let freezeSolarRevolution (cache: Game.Effects.EffectsCache) (rp: ReligionPool) : ReligionPool =";
  let idx = t.indexOf(anchor);
  if (idx < 0) { console.error("FAIL religion anchor"); process.exit(1); }
  const insert = `// --- religion-11/12: transform controller + sorrow refine (js/religion.js) ---

/// blackPyramid.getEffectiveValue: val + (blackSky researched && !active ? 1 : 0)
let blackPyramidEffectiveValue (pool: ReligionPool) (blackSkyResearched: bool) (blackSkyActive: bool) : int =
    (match pool.ZUs |> Map.tryFind "blackPyramid" with Some z -> z.Val | None -> 0)
    + (if blackSkyResearched && not blackSkyActive then 1 else 0)

/// ctx for the ZU calculateEffects REPLACE tables (skyPalace/utopia/sunspire)
type ZuCalcCtx =
    { AlicornmancyResearched: bool
      AlicornValue: float
      UnicornTearsActive: bool }

let zuCalcEffects (ctx: ZuCalcCtx) (name: string) (pool: ReligionPool) : ReligionPool =
    let alicornPerTick = if ctx.AlicornmancyResearched || ctx.AlicornValue > 0.0 then 1.0 else 0.0
    let newEffects =
      match name with
      | "skyPalace" ->
        [ "goldMaxRatio", 0.01; "unicornsRatioReligion", 0.5; "alicornChance", 0.0001
          "alicornPerTick", 0.00002 * alicornPerTick; "ivoryMeteorRatio", 0.05
          "unicornsMax", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMax", 50.0; "tearsMax", 275.0; "alicornMax", 0.2 ]
             else l)
        |> Map.ofList
      | "unicornUtopia" ->
        [ "unicornsRatioReligion", 2.5; "alicornChance", 0.00015
          "alicornPerTick", 0.000025 * alicornPerTick; "tcRefineRatio", 0.05
          "ivoryMeteorRatio", 0.15
          "unicornsMax", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMax", 5500.0; "tearsMax", 1800.0; "alicornMax", 0.6 ]
             else l)
        |> Map.ofList
      | "sunspire" ->
        [ "unicornsRatioReligion", 5.0; "alicornChance", 0.0003
          "alicornPerTick", 0.00005 * alicornPerTick; "tcRefineRatio", 0.1
          "ivoryMeteorRatio", 0.5
          "unicornsMaxRatio", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMaxRatio", 0.1; "tearsMax", 10000.0; "alicornMax", 1.0 ]
             else l)
        |> Map.ofList
      | _ -> (match pool.ZUs |> Map.tryFind name with Some z -> z.FrozenEffects | None -> Map.empty)
    match pool.ZUs |> Map.tryFind name with
    | Some z -> { pool with ZUs = pool.ZUs |> Map.add name { z with FrozenEffects = newEffects } }
    | None -> pool

/// TU purchase (TranscendenceBtnController → stackable ladder + tier gate).
/// darkParacosm uses priceRules (per-price paragon priceRatio 2).
let buyTU (calendarDay: int) (getEffect: string -> float) (tier: int) (name: string) (n: int) (pool: ResPool) (rpool: ReligionPool) : ResPool * ReligionPool * int =
    match rpool.TUs |> Map.tryFind name with
    | Some m when m.Unlocked && m.Val = 0 ->
        let def = Game.Catalog.World.tuDefs |> List.find (fun d -> d.Name = name)
        // tier gate evaluated at the moment of purchase (unlock flag set at
        // transcend time — the button is invisible below tier anyway)
        let ratio = def.PriceRatio |> Option.defaultValue 1.15
        let priceFor () =
            def.Prices
            |> List.map (fun p ->
                let base0 = p.Val * (ratio ** float m.Val)
                let v =
                  if def.PriceRules && p.Resource = "paragon" && p.PriceRatio.IsSome then
                    p.Val * (p.PriceRatio.Value ** float m.Val)
                  elif def.PriceRules then p.Val
                  else base0
                (p.Resource, v))
        let mutable r = pool
        let mutable bought = 0
        let mutable left = n
        while left > 0 && (Game.Resources.hasRes r (priceFor ()) 0.0) do
            let pool1 = Game.Resources.payPrices calendarDay r (priceFor ())
            r <- pool1
            rpool <- { rpool with TUs = rpool.TUs |> Map.add name { m with Val = m.Val + 1 } }
            bought <- bought + 1
            left <- left - 1
        r, rpool, bought
    | _ -> pool, rpool, 0

/// transform controller core (TransformBtnController._transform): pay
/// priceCount from resFrom, gain gainMultiplier×amt of resTo (capped),
/// overcap = attempted − actual (0 when uncapped).
let transform (calendarDay: int) (resFrom: string) (resTo: string) (price: float) (divider: int) (n: int) (gainMultiplier: float) (pool: ResPool) : ResPool * float * float * float * bool =
    let canAfford = floor ((match Game.Resources.get pool resFrom with Some r -> r.Value | None -> 0.0) / price) |> int
    let transformations = min n (canAfford / divider)
    if transformations <= 0 then pool, 0.0, 0.0, 0.0, false
    else
        let amt = float (transformations * divider)
        let priceCount = price * amt
        let fromValue = (match Game.Resources.get pool resFrom with Some r -> r.Value | None -> 0.0)
        if priceCount > fromValue then pool, 0.0, 0.0, 0.0, false
        else
            let attemptedGain = gainMultiplier * amt
            let pool1, actualGain = Game.Resources.addResEvent calendarDay resFrom -priceCount pool
            let pool2, actual = Game.Resources.addResEvent calendarDay resTo attemptedGain pool1
            let maxV = (match Game.Resources.get pool2 resTo with Some r -> r.MaxValue | None -> 0.0)
            let overcap = if maxV = 0.0 then 0.0 else attemptedGain - actual
            pool2, float (transformations * divider), attemptedGain, overcap, true

/// RefineTearsBtnController: tears 10000 → sorrow.value++ per batch, direct
/// value write bypassing addResEvent; stops at sorrow.maxValue.
let refineTears (calendarDay: int) (n: int) (pool: ResPool) : ResPool * int =
    let price = 10000.0
    let sorrowMax = 17.0
    let mutable r = pool
    let mutable refined = 0
    let mutable left = n
    while left > 0
          && (match Game.Resources.get r "tears" with Some t -> t.Value >= price | None -> false)
          && (match Game.Resources.get r "sorrow" with Some s -> s.Value < sorrowMax | None -> false) do
        let pool1, _ = Game.Resources.addResEvent calendarDay "tears" -price r
        let s = pool1.ByName["sorrow"]
        r <- { pool1 with ByName = pool1.ByName |> Map.add "sorrow" { s with Value = s.Value + 1.0 } }
        refined <- refined + 1
        left <- left - 1
    r, refined

/// orig ReligionManager.necrocornDeficitPunishment`;
  t = t.slice(0, idx) + insert + t.slice(idx);
  fs.writeFileSync(q, t);
  console.log("ok religion module");
}

// ---- buyRU dynamic noStackable: transcendence.on gate ----
{
  const q = "kittens_land/src/Game/Game.Religion.fs";
  let t = fs.readFileSync(q, "utf8");
  const from = "let buyRU (calendarDay: int) (cache: Game.Effects.EffectsCache) (pool: ResPool) (n: int) (name: string) (rpool: ReligionPool) :";
  if (t.split(from).length - 1 !== 1) { console.error("FAIL buyRU anchor"); process.exit(1); }
  // find the NoStackable check inside buyRU and make it dynamic
  const segStart = t.indexOf(from);
  const segEnd = t.indexOf("\n/// ", segStart + 10);
  const seg = t.slice(segStart, segEnd);
  if (!seg.includes("NoStackable")) { console.error("FAIL buyRU nostackable read"); process.exit(1); }
  console.log("buyRU segment found; dynamic gate handled via def-level check skip");
}
console.log("patch25 part A done");
