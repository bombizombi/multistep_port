#!/usr/bin/env node
"use strict";
// Batch-14 patch: challenge-aware building pricing (priceRules + unicornTears).
const fs = require("fs");
const p = "kittens_land/src/Game/Game.Buildings.fs";
let s = fs.readFileSync(p, "utf8");

const oldFn = `/// orig BuildingStackableBtnController.getPrices: val × priceRatio^count with
/// CostReduction effects folded via getLimitedDR(x, 1). Stage prices override
/// the def prices when present.
let getPrices (cache: Game.Effects.EffectsCache) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let ratio = b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount

    prices
    |> List.map (fun p ->
        let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
        let resPriceModifier = 1.0 - resPriceDiscount
        let resourcePriceRatio =
            match stage with
            | Some s when s.Prices.Length > 0 -> ratio // stage prices use def ratio (orig reads meta ratio)
            | _ -> ratio
        { Resource = p.Resource
          Val = p.Val * resourcePriceRatio ** float b.Val * resPriceModifier * priceModifier })`;

const newFn = `/// Challenge-dependent pricing inputs (js/buildings.js getPrices + the
/// challenge priceRules specials). PriceRules mirrors meta.priceRules (static:
/// stasisPod; dynamic: calciner/blackSky, steamworks/pacifism, field/
/// postApocalypse — recomputed wherever orig runs calculateAllEffects).
type PricingContext =
    { PriceRules: Set<string>
      UnicornTearsActive: bool
      BlackSkyActive: bool
      PacifismActive: bool
      PostApocalypseActive: bool
      PacifismOn: int
      UsedCryochambers: int
      IronWill: bool
      PollutionLevel: float }

let freshPricing : PricingContext =
    { PriceRules = Set.ofList ["stasisPod"]
      UnicornTearsActive = false
      BlackSkyActive = false
      PacifismActive = false
      PostApocalypseActive = false
      PacifismOn = 0
      UsedCryochambers = 0
      IronWill = false
      PollutionLevel = 0.0 }

/// orig getPrices core: base × ratio^(val + fakeBought) with the meta- and
/// per-resource CostReduction LDR discounts, then the priceRules specials.
/// The temporary unicornTears/postApocalypse add-ons are appended by
/// getExtraPrices (paid on buy, never refunded).
let getPricesWith (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (additionalBought: int) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let ratio = b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    let fakeBought = eff (def.Name + "FakeBought") + float additionalBought
    let valExp = float b.Val + fakeBought

    let baseLoop =
        prices
        |> List.map (fun p ->
            let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
            let resPriceModifier = 1.0 - resPriceDiscount
            let resourcePriceRatio =
                match stage with
                | Some s when s.Prices.Length > 0 -> ratio // stage prices use def ratio (orig reads meta ratio)
                | _ -> ratio
            { Resource = p.Resource
              Val = p.Val * resourcePriceRatio ** valExp * resPriceModifier * priceModifier })

    let priceRulesBranch =
        // (stasisPod fewZebrasPrices deferred to the zebra slice — scenarios
        // never buy stasisPod; multPriceRatio has no catalog entries here)
        let base =
            prices
            |> List.map (fun p ->
                let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
                let resPriceModifier = 1.0 - resPriceDiscount
                { Resource = p.Resource
                  Val = p.Val * ratio ** valExp * resPriceModifier * priceModifier })
        let base =
            if pctx.BlackSkyActive && def.Name = "calciner" && b.Val = 0 then
                base
                |> List.map (fun pr ->
                    if pr.Resource = "titanium" then { pr with Val = 0.0 } else { pr with Val = pr.Val * 11.0 })
            else base
        if pctx.PacifismActive && def.Name = "steamworks" && b.Val = 0 then
            base
            |> List.map (fun pr ->
                if pr.Resource = "blueprint" then { pr with Val = float (pctx.PacifismOn * 5 + 1) } else pr)
        else base

    let withRules = if pctx.PriceRules.Contains def.Name then priceRulesBranch else baseLoop

    let extra =
        if pctx.UnicornTearsActive && b.Val > 0 then
            let weight =
                let w = Game.Challenges.sumPricesWeighted (prices |> List.map (fun p -> (p.Resource, p.Val)))
                if w > 0.0 then w * (eff "bonfireTearsPriceRatioChallenge") ** float (b.Val - 1) else w
            if weight > 1e9 then [ 1 ] // alicorn
            elif weight > 100000.0 then [ 1 ] // tears
            elif weight >= 100.0 then [ 1 ] // unicorns
            else []
        elif pctx.PostApocalypseActive && def.Name = "field"
             && pctx.PollutionLevel >= 5.0
             && float b.Val >= max (95.0 - float pctx.UsedCryochambers - pctx.PollutionLevel) (7.0 + (if pctx.IronWill then 8.0 else 0.0)) then [ 1 ]
        else []

    withRules

/// Temporary (paid on buy, never refunded) add-on prices.
let getExtraPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    if pctx.UnicornTearsActive && b.Val > 0 then
        let weight =
            let w = Game.Challenges.sumPricesWeighted (prices |> List.map (fun p -> (p.Resource, p.Val)))
            if w > 0.0 then w * (eff "bonfireTearsPriceRatioChallenge") ** float (b.Val - 1) else w
        if weight > 1e9 then
            [ { Resource = "alicorn"; Val = (System.Math.Log weight - 19.7232) * priceModifier } ]
        elif weight > 100000.0 then
            [ { Resource = "tears"; Val = weight / 100000.0 * priceModifier } ]
        elif weight >= 100.0 then
            [ { Resource = "unicorns"; Val = weight / 100.0 * priceModifier } ]
        else []
    elif pctx.PostApocalypseActive && def.Name = "field"
         && pctx.PollutionLevel >= 5.0
         && float b.Val >= max (95.0 - float pctx.UsedCryochambers - pctx.PollutionLevel) (7.0 + (if pctx.IronWill then 8.0 else 0.0)) then
        let builtWithUnobtainium = max (float (b.Val + pctx.UsedCryochambers) - 100.0) 0.0
        [ { Resource = "unobtainium"; Val = 15.0 * (b.Def.PriceRatio |> Option.defaultValue 1.0) ** builtWithUnobtainium } ]
    else []

/// Normal (refundable) ladder with the priceRules specials.
let getPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let ratio = b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    let fakeBought = eff (def.Name + "FakeBought")
    let valExp = float b.Val + fakeBought

    let baseLoop =
        prices
        |> List.map (fun p ->
            let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
            let resPriceModifier = 1.0 - resPriceDiscount
            let resourcePriceRatio =
                match stage with
                | Some s when s.Prices.Length > 0 -> ratio
                | _ -> ratio
            { Resource = p.Resource
              Val = p.Val * resourcePriceRatio ** valExp * resPriceModifier * priceModifier })

    let priceRulesBranch =
        let base =
            prices
            |> List.map (fun p ->
                let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
                let resPriceModifier = 1.0 - resPriceDiscount
                { Resource = p.Resource
                  Val = p.Val * ratio ** valExp * resPriceModifier * priceModifier })
        let base =
            if pctx.BlackSkyActive && def.Name = "calciner" && b.Val = 0 then
                base
                |> List.map (fun pr ->
                    if pr.Resource = "titanium" then { pr with Val = 0.0 } else { pr with Val = pr.Val * 11.0 })
            else base
        if pctx.PacifismActive && def.Name = "steamworks" && b.Val = 0 then
            base
            |> List.map (fun pr ->
                if pr.Resource = "blueprint" then { pr with Val = float (pctx.PacifismOn * 5 + 1) } else pr)
        else base

    if pctx.PriceRules.Contains def.Name then priceRulesBranch else baseLoop

/// Combined affordability view (orig hasResources over the full price list).
let getAllPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    getPrices cache pctx b @ getExtraPrices cache pctx b`;

if (!s.includes(oldFn)) { console.error("anchor not found"); process.exit(1); }
s = s.replace(oldFn, newFn);
fs.writeFileSync(p, s);
console.log("buildings pricing updated");
