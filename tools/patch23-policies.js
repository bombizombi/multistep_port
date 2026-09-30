#!/usr/bin/env node
"use strict";
// Batch-23 (science-03/05/06/07/08/11): policy effects + purchase semantics.
const fs = require("fs");

// ---------------------------------------------------------- Game.Types.fs
{
  const q = "kittens_land/src/Game/Game.Types.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["policy-state",
`type PolicyState =
    { Def: PolicyDef
      Unlocked: bool
      Researched: bool }`,
`type PolicyState =
    { Def: PolicyDef
      Unlocked: bool
      Researched: bool
      // js/science.js: policies carry live effects tables (calculateEffects
      // mutates them) and purchases permanently block rivals
      Blocked: bool
      Effects: Map<string, float> }`],
    ["mkpolicy",
`let mkPolicy (def: PolicyDef) : PolicyState = { Def = def; Unlocked = false; Researched = false }`,
`let mkPolicy (def: PolicyDef) : PolicyState =
    { Def = def
      Unlocked = false
      Researched = false
      Blocked = false
      Effects = Game.Catalog.Policies.effects |> Map.tryFind def.Name |> Option.defaultValue Map.empty }`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL types " + name); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok types");
}

// ------------------------------------------------------- Game.Managers.fs
{
  const q = "kittens_land/src/Game/Game.Managers.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["init-effects",
`      Policies = policies |> List.map (fun p -> (p.Name, mkPolicy p)) |> Map.ofList }`,
`      Policies = policies |> List.map (fun p -> (p.Name, mkPolicy p)) |> Map.ofList }

/// science effectsBase (js/science.js L2163-2166)
let scienceEffectsBase : Map<string, float> =
    Map.ofList ["environmentHappinessBonusModifier", 1.0; "environmentUnhappinessModifier", 1.0]

/// inputs the policy calculateEffects bodies read (js/science.js L854-2160)
type PolicyCalcCtx =
    { IronWill: bool
      NagaEmbassies: int
      SpiderEmbassies: int
      CycleYear: int
      PactsAvailable: float
      FracturedOn: int
      UncappedHousing: int }

/// policy calculateEffects bodies — mutate the live table in place, exactly
/// like orig (incl. the socialism bug that substitutes a LOCAL empty table).
let policyCalcEffects (ctx: PolicyCalcCtx) (name: string) (effects: Map<string, float>) : Map<string, float> =
    match name with
    | "liberty" -> effects |> Map.add "maxKittens" (if ctx.IronWill then 0.0 else 1.0)
    | "authocracy" -> effects |> Map.add "rankLeaderBonusConversion" (0.004 * float ctx.UncappedHousing)
    | "socialism" -> Map.empty // orig bug: builds a local empty table and swaps it in
    | "radicalXenophobia" ->
        let pa = if ctx.FracturedOn >= 1 then 0.0 else 5.0
        effects |> Map.add "pactsAvailable" pa
    | "sharkRelationsBotanists" ->
        let e = effects |> Map.add "refinePolicyRatio" 0.25 |> Map.add "woodRatio" 0.0
        if ctx.IronWill then e |> Map.add "refinePolicyRatio" 0.0 |> Map.add "woodRatio" 0.25 else e
    | "nagaRelationsMasons" ->
        let e = ctx.NagaEmbassies * 0.0025 |> min 0.1
        let bcr = if ctx.NagaEmbassies > 40 then float (ctx.NagaEmbassies - 40) * 0.02 else 0.0
        effects |> Map.add "nagaBlueprintTradeChance" e |> Map.add "blueprintCraftRatio" bcr
    | "spiderRelationsGeologists" ->
        let bonus = min (0.002 * float ctx.SpiderEmbassies) 0.15
        effects |> Map.map (fun _ _ -> bonus)
    | "dragonRelationsAstrologers" ->
        let cycle = float ctx.CycleYear + 1.0
        effects |> Map.add "starEventChance" (cycle * 0.004) |> Map.add "starchartPolicyRatio" (cycle * 0.03)
    | "feedingFrenzy" ->
        effects |> Map.add "feedEldersEfficiencyRatio" (Game.Math.getUnlimitedDR ctx.PactsAvailable 50.0)
    | _ -> effects

/// recalc a researched policy's live effects (orig calculateEffects call)
let recalcPolicy (ctx: PolicyCalcCtx) (name: string) (sp: SciencePool) : SciencePool =
    match sp.Policies |> Map.tryFind name with
    | Some p when p.Researched ->
        sp <- { sp with Policies = sp.Policies |> Map.add name { p with Effects = policyCalcEffects ctx name p.Effects } }
        sp
    | _ -> sp

/// science manager group: researched policies contribute their live tables
/// raw (orig registerMeta("research") — researched && effects), plus the
/// manager effectsBase keys
let scienceGroup (sp: SciencePool) : Game.Effects.ManagerGroup =
    { Base = scienceEffectsBase
      Items =
        sp.PolicyOrder
        |> List.choose (fun n ->
            let p = sp.Policies.[n]
            if p.Researched && not p.Effects.IsEmpty then Some(p.Effects, fun _ v -> v)
            else None) }`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL managers " + name); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok managers core");
}

// researchPolicy → full purchase chain (gates + pricing + blocks + calc)
{
  const q = "kittens_land/src/Game/Game.Managers.fs";
  let t = fs.readFileSync(q, "utf8");
  const from = `/// orig PolicyBtnController buyItem: pay prices, set researched (toggle-off not
/// needed at our stage).
let researchPolicy (calendarDay: int) (name: string) (pool: ResPool) (sp: SciencePool) : ResPool * SciencePool * bool =
    match sp.Policies |> Map.tryFind name with
    | Some pol when not pol.Researched ->
        let prices = pol.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))
        if Game.Resources.hasRes pool prices 0.0 then
            let pool' = Game.Resources.payPrices calendarDay pool prices
            let sp' = { sp with Policies = sp.Policies |> Map.add name { pol with Researched = true } }
            pool', sp', true
        else
            pool, sp, false
    | _ -> pool, sp, false`;
  const to = `/// orig PolicyBtnController purchase inputs (shouldBeBought + getPrices)
type PolicyBuyCtx =
    { Calc: PolicyCalcCtx
      GetEffect: string -> float
      PriestLeader: bool
      AiLevel: float
      Necrocorns: float
      ActivePacts: int }

/// orig PolicyBtnController.buyItem — prices ×1.25^policyFakeBought (pacifism),
/// shouldBeBought gates (leader job, aiLevel, upfront necrocorns, blocks),
/// permanent rival blocking, onPurchase (researched → calc) → onResearch.
/// Result codes: OkBought | AlreadyBought | CannotAfford | NeedsLeader
/// | AiLevelTooHigh | UpfrontCost | BlockedRival
let researchPolicy (calendarDay: int) (name: string) (bctx: PolicyBuyCtx) (pool: ResPool) (sp: SciencePool) : ResPool * SciencePool * string =
    match sp.Policies |> Map.tryFind name with
    | Some pol when not pol.Researched ->
        let fake = bctx.GetEffect "policyFakeBought"
        let prices = pol.Def.Prices |> List.map (fun p -> (p.Resource, p.Val * (1.25 ** fake)))
        if not (Game.Resources.hasRes pool prices 0.0) then pool, sp, "CannotAfford"
        elif (Game.Catalog.Policies.requiredLeaderJob |> Map.tryFind name) = Some "priest" && not bctx.PriestLeader then
            pool, sp, "NeedsLeader"
        elif name = "transkittenism" && bctx.AiLevel >= 15.0 then pool, sp, "AiLevelTooHigh"
        elif name = "upfrontPayment" && bctx.Necrocorns < 2.0 * float bctx.ActivePacts + (pol.Def.Prices |> List.sumBy (fun p -> p.Val)) then
            pool, sp, "UpfrontCost"
        else
            // blocks scan: if a rival is already researched → blocked=true forever
            let rivals = Game.Catalog.Policies.blocks |> Map.tryFind name |> Option.defaultValue []
            let rivalResearched = rivals |> List.exists (fun r0 -> (match sp.Policies |> Map.tryFind r0 with Some p -> p.Researched | None -> false))
            if rivalResearched then
                let sp' = { sp with Policies = sp.Policies |> Map.add name { pol with Blocked = true } }
                pool, sp', "BlockedRival"
            else
                let pool' = Game.Resources.payPrices calendarDay pool prices
                let sp1 = { sp with Policies = sp.Policies |> Map.add name { pol with Researched = true } }
                let sp2 = recalcPolicy bctx.Calc name sp1
                // onResearch hooks (cryochamberExtraction VSU bump is runner-side)
                let pool2, sp3 =
                    if name = "upfrontPayment" then
                        let required = 2.0 * float bctx.ActivePacts
                        if required > 0.0 then
                            let pool1, _ = Game.Resources.addResEvent calendarDay "necrocorn" -required pool'
                            pool1, sp2
                        else pool', sp2
                    else pool', sp2
                pool2, sp3, "OkBought"
    | _ -> pool, sp, "AlreadyBought"`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL researchPolicy"); process.exit(1); }
  t = t.split(from).join(to);
  fs.writeFileSync(q, t);
  console.log("ok researchPolicy");
}
console.log("patch23 part A done");
