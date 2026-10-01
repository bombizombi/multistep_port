
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { option_type, lambda_type, float64_type, int32_type, bool_type, record_type, class_type, list_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { BuildingState, Price, UpgradeState, UpgradeDef, CraftState, mkUpgrade, CraftState_$reflection, UpgradeState_$reflection, PolicyState, mkPolicy, ResearchState, mkResearch, PolicyState_$reflection, ResearchState_$reflection } from "./Game.Types.fs.js";
import { updateAt, tail, head, isEmpty, indexed, sortWith, forAll, skip, take, singleton, append, contains, length, item, filter, reverse, cons, find, tryFind as tryFind_1, fold, exists, empty as empty_1, sumBy, choose, ofArray, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { change, toList, FSharpMap__get_IsEmpty, FSharpMap__get_Item, tryFind, map as map_1, empty, add, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { stringHash, disposeSafe, getEnumerator, equals, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { max, min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { jsRound, uniformRandomInteger, getInverseUnlimitedDR, getLimitedDR, getUnlimitedDR } from "./Game.Math.fs.js";
import { getEffect, ManagerGroup } from "./Game.Effects.fs.js";
import { isStorageLimited, CraftContext, get$, addResEvent, payPrices, hasRes } from "./Game.Resources.fs.js";
import { blocks, requiredLeaderJob } from "./Game.Catalog.Policies.fs.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { zebraUpgradeDefs } from "./Game.Catalog.Defs.fs.js";
import { resourceDefs } from "./Game.Catalog.Resources.fs.js";
import { BldPool, get$ as get$_1 } from "./Game.Buildings.fs.js";
import { ofList as ofList_1 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Set.js";
import { jobDefs as jobDefs_1, traitDefs, surnames, names } from "./Game.Catalog.Village.fs.js";

export class SciencePool extends Record {
    constructor(TechOrder, Techs, PolicyOrder, Policies) {
        super();
        this.TechOrder = TechOrder;
        this.Techs = Techs;
        this.PolicyOrder = PolicyOrder;
        this.Policies = Policies;
    }
}

export function SciencePool_$reflection() {
    return record_type("Game.Managers.SciencePool", [], SciencePool, () => [["TechOrder", list_type(string_type)], ["Techs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ResearchState_$reflection()])], ["PolicyOrder", list_type(string_type)], ["Policies", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, PolicyState_$reflection()])]]);
}

export function initScience(techs, policies) {
    return new SciencePool(map((t) => t.Name, techs), ofList(map((t_1) => {
        let bind$0040;
        return [t_1.Name, (bind$0040 = mkResearch(t_1), new ResearchState(bind$0040.Def, t_1.Name === "calendar", bind$0040.Researched))];
    }, techs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((p) => p.Name, policies), ofList(map((p_1) => [p_1.Name, mkPolicy(p_1)], policies), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }));
}

export const scienceEffectsBase = ofList(ofArray([["environmentHappinessBonusModifier", 1], ["environmentUnhappinessModifier", 1]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

/**
 * inputs the policy calculateEffects bodies read (js/science.js L854-2160)
 */
export class PolicyCalcCtx extends Record {
    constructor(IronWill, NagaEmbassies, SpiderEmbassies, CycleYear, PactsAvailable, FracturedOn, UncappedHousing) {
        super();
        this.IronWill = IronWill;
        this.NagaEmbassies = (NagaEmbassies | 0);
        this.SpiderEmbassies = (SpiderEmbassies | 0);
        this.CycleYear = (CycleYear | 0);
        this.PactsAvailable = PactsAvailable;
        this.FracturedOn = (FracturedOn | 0);
        this.UncappedHousing = (UncappedHousing | 0);
    }
}

export function PolicyCalcCtx_$reflection() {
    return record_type("Game.Managers.PolicyCalcCtx", [], PolicyCalcCtx, () => [["IronWill", bool_type], ["NagaEmbassies", int32_type], ["SpiderEmbassies", int32_type], ["CycleYear", int32_type], ["PactsAvailable", float64_type], ["FracturedOn", int32_type], ["UncappedHousing", int32_type]]);
}

/**
 * policy calculateEffects bodies — mutate the live table in place, exactly
 * like orig (incl. the socialism bug that substitutes a LOCAL empty table).
 */
export function policyCalcEffects(ctx, name, effects) {
    switch (name) {
        case "liberty":
            return add("maxKittens", ctx.IronWill ? 0 : 1, effects);
        case "authocracy":
            return add("rankLeaderBonusConversion", 0.004 * ctx.UncappedHousing, effects);
        case "socialism":
            return empty({
                Compare: (x, y) => (comparePrimitives(x, y) | 0),
            });
        case "radicalXenophobia": {
            const pa = (ctx.FracturedOn >= 1) ? 0 : 5;
            return add("pactsAvailable", pa, effects);
        }
        case "sharkRelationsBotanists": {
            const e = add("woodRatio", 0, add("refinePolicyRatio", 0.25, effects));
            if (ctx.IronWill) {
                return add("woodRatio", 0.25, add("refinePolicyRatio", 0, e));
            }
            else {
                return e;
            }
        }
        case "nagaRelationsMasons": {
            const e_1 = min(ctx.NagaEmbassies * 0.0025, 0.1);
            const bcr = (ctx.NagaEmbassies > 40) ? ((ctx.NagaEmbassies - 40) * 0.02) : 0;
            return add("blueprintCraftRatio", bcr, add("nagaBlueprintTradeChance", e_1, effects));
        }
        case "spiderRelationsGeologists": {
            const bonus = min(0.002 * ctx.SpiderEmbassies, 0.15);
            return map_1((_arg, _arg_1) => bonus, effects);
        }
        case "dragonRelationsAstrologers": {
            const cycle = ctx.CycleYear + 1;
            return add("starchartPolicyRatio", cycle * 0.03, add("starEventChance", cycle * 0.004, effects));
        }
        case "feedingFrenzy":
            return add("feedEldersEfficiencyRatio", getUnlimitedDR(ctx.PactsAvailable, 50), effects);
        default:
            return effects;
    }
}

/**
 * recalc a researched policy's live effects (orig calculateEffects call)
 */
export function recalcPolicy(ctx, name, sp) {
    let p;
    const matchValue = tryFind(name, sp.Policies);
    let matchResult, p_1;
    if (matchValue != null) {
        if ((p = matchValue, p.Researched)) {
            matchResult = 0;
            p_1 = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0:
            return new SciencePool(sp.TechOrder, sp.Techs, sp.PolicyOrder, add(name, new PolicyState(p_1.Def, p_1.Unlocked, p_1.Researched, p_1.Blocked, policyCalcEffects(ctx, name, p_1.Effects)), sp.Policies));
        default:
            return sp;
    }
}

/**
 * science manager group: researched policies contribute their live tables
 * raw (orig registerMeta("research") — researched && effects), plus the
 * manager effectsBase keys
 */
export function scienceGroup(sp) {
    return new ManagerGroup(scienceEffectsBase, choose((n) => {
        const p = FSharpMap__get_Item(sp.Policies, n);
        if (p.Researched && !FSharpMap__get_IsEmpty(p.Effects)) {
            return [p.Effects, (_arg) => ((v) => v)];
        }
        else {
            return undefined;
        }
    }, sp.PolicyOrder));
}

export function getTech(sp, name) {
    return tryFind(name, sp.Techs);
}

/**
 * orig TechButtonController buyItem → onPurchase: pay prices, set researched.
 */
export function research(calendarDay, name, pool, sp) {
    let tech;
    const matchValue = tryFind(name, sp.Techs);
    let matchResult, tech_1;
    if (matchValue != null) {
        if ((tech = matchValue, !tech.Researched)) {
            matchResult = 0;
            tech_1 = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const prices = map((p) => [p.Resource, p.Val], tech_1.Def.Prices);
            if (hasRes(pool, prices, 0)) {
                const pool$0027 = payPrices(calendarDay, pool, prices);
                const sp$0027 = new SciencePool(sp.TechOrder, add(name, new ResearchState(tech_1.Def, tech_1.Unlocked, true), sp.Techs), sp.PolicyOrder, sp.Policies);
                return [pool$0027, sp$0027, true];
            }
            else {
                return [pool, sp, false];
            }
        }
        default:
            return [pool, sp, false];
    }
}

/**
 * orig PolicyBtnController purchase inputs (shouldBeBought + getPrices)
 */
export class PolicyBuyCtx extends Record {
    constructor(Calc, GetEffect, PriestLeader, AiLevel, Necrocorns, ActivePacts) {
        super();
        this.Calc = Calc;
        this.GetEffect = GetEffect;
        this.PriestLeader = PriestLeader;
        this.AiLevel = AiLevel;
        this.Necrocorns = Necrocorns;
        this.ActivePacts = (ActivePacts | 0);
    }
}

export function PolicyBuyCtx_$reflection() {
    return record_type("Game.Managers.PolicyBuyCtx", [], PolicyBuyCtx, () => [["Calc", PolicyCalcCtx_$reflection()], ["GetEffect", lambda_type(string_type, float64_type)], ["PriestLeader", bool_type], ["AiLevel", float64_type], ["Necrocorns", float64_type], ["ActivePacts", int32_type]]);
}

/**
 * orig PolicyBtnController.buyItem — prices ×1.25^policyFakeBought (pacifism),
 * shouldBeBought gates (leader job, aiLevel, upfront necrocorns, blocks),
 * permanent rival blocking, onPurchase (researched → calc) → onResearch.
 * Result codes: OkBought | AlreadyBought | CannotAfford | NeedsLeader
 * | AiLevelTooHigh | UpfrontCost | BlockedRival
 */
export function researchPolicy(calendarDay, name, bctx, pool, sp) {
    let pol;
    const matchValue = tryFind(name, sp.Policies);
    let matchResult, pol_1;
    if (matchValue != null) {
        if ((pol = matchValue, !pol.Researched)) {
            matchResult = 0;
            pol_1 = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const fake = bctx.GetEffect("policyFakeBought");
            const prices = map((p) => [p.Resource, p.Val * Math.pow(1.25, fake)], pol_1.Def.Prices);
            if (!hasRes(pool, prices, 0)) {
                return [pool, sp, "CannotAfford"];
            }
            else if (pol_1.Blocked) {
                return [pool, sp, "BlockedSelf"];
            }
            else if (equals(tryFind(name, requiredLeaderJob), "priest") && !bctx.PriestLeader) {
                return [pool, sp, "NeedsLeader"];
            }
            else if ((name === "transkittenism") && (bctx.AiLevel >= 15)) {
                return [pool, sp, "AiLevelTooHigh"];
            }
            else if ((name === "upfrontPayment") && (bctx.Necrocorns < ((2 * bctx.ActivePacts) + sumBy((p_1) => p_1.Val, pol_1.Def.Prices, {
                GetZero: () => 0,
                Add: (x, y) => (x + y),
            })))) {
                return [pool, sp, "UpfrontCost"];
            }
            else {
                const rivals = defaultArg(tryFind(name, blocks), empty_1());
                const rivalResearched = exists((r0) => {
                    const matchValue_1 = tryFind(r0, sp.Policies);
                    if (matchValue_1 == null) {
                        return false;
                    }
                    else {
                        const p_2 = matchValue_1;
                        return p_2.Researched;
                    }
                }, rivals);
                if (rivalResearched) {
                    const sp$0027 = new SciencePool(sp.TechOrder, sp.Techs, sp.PolicyOrder, add(name, new PolicyState(pol_1.Def, pol_1.Unlocked, pol_1.Researched, true, pol_1.Effects), sp.Policies));
                    return [pool, sp$0027, "BlockedRival"];
                }
                else {
                    const pool$0027 = payPrices(calendarDay, pool, prices);
                    const sp1 = new SciencePool(sp.TechOrder, sp.Techs, sp.PolicyOrder, add(name, new PolicyState(pol_1.Def, pol_1.Unlocked, true, pol_1.Blocked, pol_1.Effects), sp.Policies));
                    const rivals_1 = defaultArg(tryFind(name, blocks), empty_1());
                    const sp1b = fold((acc, r0_1) => {
                        const matchValue_2 = tryFind(r0_1, acc.Policies);
                        if (matchValue_2 == null) {
                            return acc;
                        }
                        else {
                            const rp = matchValue_2;
                            return new SciencePool(acc.TechOrder, acc.Techs, acc.PolicyOrder, add(r0_1, new PolicyState(rp.Def, rp.Unlocked, rp.Researched, true, rp.Effects), acc.Policies));
                        }
                    }, sp1, rivals_1);
                    const sp2 = recalcPolicy(bctx.Calc, name, sp1b);
                    let patternInput_1;
                    if (name === "upfrontPayment") {
                        const required = 2 * bctx.ActivePacts;
                        if (required > 0) {
                            const pool1 = addResEvent(calendarDay, "necrocorn", -required, pool$0027)[0];
                            patternInput_1 = [pool1, sp2];
                        }
                        else {
                            patternInput_1 = [pool$0027, sp2];
                        }
                    }
                    else {
                        patternInput_1 = [pool$0027, sp2];
                    }
                    const sp3 = patternInput_1[1];
                    const pool2 = patternInput_1[0];
                    return [pool2, sp3, "OkBought"];
                }
            }
        }
        default:
            return [pool, sp, "AlreadyBought"];
    }
}

export class WorkshopPool extends Record {
    constructor(UpgradeOrder, Upgrades, CraftOrder, Crafts, ZebraOrder, ZebraUpgrades) {
        super();
        this.UpgradeOrder = UpgradeOrder;
        this.Upgrades = Upgrades;
        this.CraftOrder = CraftOrder;
        this.Crafts = Crafts;
        this.ZebraOrder = ZebraOrder;
        this.ZebraUpgrades = ZebraUpgrades;
    }
}

export function WorkshopPool_$reflection() {
    return record_type("Game.Managers.WorkshopPool", [], WorkshopPool, () => [["UpgradeOrder", list_type(string_type)], ["Upgrades", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, UpgradeState_$reflection()])], ["CraftOrder", list_type(string_type)], ["Crafts", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, CraftState_$reflection()])], ["ZebraOrder", list_type(string_type)], ["ZebraUpgrades", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, UpgradeState_$reflection()])]]);
}

export function initWorkshop(upgrades, crafts) {
    return new WorkshopPool(map((u) => u.Name, upgrades), ofList(map((u_1) => [u_1.Name, mkUpgrade(u_1)], upgrades), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((c) => c.Name, crafts), ofList(map((c_1) => [c_1.Name, new CraftState(c_1, c_1.StartsUnlocked, 0, 0, false, false)], crafts), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), map((u_2) => u_2.Name, zebraUpgradeDefs), ofList(map((u_3) => [u_3.Name, new UpgradeState(new UpgradeDef(u_3.Name, u_3.Prices, u_3.Effects, false), false, false)], zebraUpgradeDefs), {
        Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
    }));
}

export function getCraft(wp, name) {
    return tryFind(name, wp.Crafts);
}

export function getZebraUpgrade(wp, name) {
    return tryFind(name, wp.ZebraUpgrades);
}

/**
 * orig getResCraftRatio(res): workshop craftRatio effects × (1 + skill bonus).
 * Skill/leader seams are fresh (0); effect read is live.
 * Leader craft bonus (orig getEffectLeader): engineer +0.05, metallurgist
 * +0.1 (tag), chemist +0.075 (tag); all × (1 + burnedParagonRatio) × monarchy.
 */
export function getEffectLeaderCraft(leaderTrait_1, trait, burnedParagonRatio, monarchyResearched) {
    let t;
    let matchResult, t_1;
    if (leaderTrait_1 != null) {
        if ((t = leaderTrait_1, t === trait)) {
            matchResult = 0;
            t_1 = leaderTrait_1;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const leaderRatio = monarchyResearched ? 1.95 : 1;
            const baseB = (trait === "engineer") ? 0.05 : ((trait === "metallurgist") ? 0.1 : ((trait === "chemist") ? 0.075 : 0));
            return (baseB * (1 + burnedParagonRatio)) * leaderRatio;
        }
        default:
            return 0;
    }
}

/**
 * orig game.getCraftRatio(tag) + getResCraftRatio (game.js L4412-4448): wood
 * takes the refine special (early return — craftRatio never applies to wood).
 * Inputs for the craft-ratio computation (bld values for blueprint/kerosene).
 */
export class CraftRatioContext extends Record {
    constructor(IronWill, LeaderTrait, BurnedParagonRatio, MonarchyResearched, BldVal) {
        super();
        this.IronWill = IronWill;
        this.LeaderTrait = LeaderTrait;
        this.BurnedParagonRatio = BurnedParagonRatio;
        this.MonarchyResearched = MonarchyResearched;
        this.BldVal = BldVal;
    }
}

export function CraftRatioContext_$reflection() {
    return record_type("Game.Managers.CraftRatioContext", [], CraftRatioContext, () => [["IronWill", bool_type], ["LeaderTrait", option_type(string_type)], ["BurnedParagonRatio", float64_type], ["MonarchyResearched", bool_type], ["BldVal", lambda_type(string_type, int32_type)]]);
}

export function resourceTag(resName) {
    const matchValue = tryFind_1((r) => (r.Name === resName), resourceDefs);
    if (matchValue == null) {
        return "";
    }
    else {
        const d = matchValue;
        return defaultArg(d.Tag, "");
    }
}

export function getResCraftRatio(cache, ctx, resName) {
    const eff = (name) => getEffect(cache, name);
    if (resName === "wood") {
        const policyRefineRatio = eff("refinePolicyRatio");
        const refineRatio = policyRefineRatio + ((1 + policyRefineRatio) * eff("refineRatio"));
        if (ctx.IronWill) {
            return ((1 + refineRatio) * ((1 + eff("woodRatio")) + (eff("woodPolicyRatio") / 3))) - 1;
        }
        else {
            return refineRatio;
        }
    }
    else {
        const tag = resourceTag(resName);
        let ratio = (eff("craftRatio") + getEffectLeaderCraft(ctx.LeaderTrait, "engineer", ctx.BurnedParagonRatio, ctx.MonarchyResearched)) + getEffectLeaderCraft(ctx.LeaderTrait, tag, ctx.BurnedParagonRatio, ctx.MonarchyResearched);
        if (resName === "blueprint") {
            ratio = (ratio + ((((ctx.BldVal("library") + ctx.BldVal("academy")) + ctx.BldVal("observatory")) + ctx.BldVal("biolab")) * eff("cadBlueprintCraftRatio")));
        }
        if (resName === "kerosene") {
            ratio = (ratio * (1 + ((ctx.BldVal("factory") * 0.75) * eff("factoryRefineRatio"))));
        }
        ratio = (ratio + eff(resName + "CraftRatio"));
        ratio = (ratio * (1 + eff(resName + "GlobalCraftRatio")));
        return ratio;
    }
}

/**
 * orig getCraftPrice (js/workshop.js L2634-2654): manuscript takes the tradition
 * policy override; ship scales starchart by the satnav LDR (sattelite.on seam 0);
 * everything else returns the recipe prices verbatim.
 */
export function getCraftPrice(cache, traditionResearched, craft_1) {
    if ((craft_1.Name === "manuscript") && traditionResearched) {
        return ofArray([new Price("parchment", 20), new Price("culture", 300)]);
    }
    else if (craft_1.Name === "ship") {
        const satnavRatioOn = getEffect(cache, "satnavRatio") * 0;
        return map((p) => {
            if (p.Resource === "starchart") {
                return new Price(p.Resource, p.Val * (1 - getLimitedDR(satnavRatioOn, 0.75)));
            }
            else {
                return p;
            }
        }, craft_1.Prices);
    }
    else {
        return craft_1.Prices;
    }
}

/**
 * orig workshop.craft (js/workshop.js L2656-2701): ceil amt, craftRatio bonus,
 * negative-amt guard, resource check on the SCALED prices, pay, addResEvent.
 * Returns pool, workshop, success. (stats totalCrafts + undo are UI seams.)
 */
export function craft(calendarDay, cache, traditionResearched, crCtx, resName, amt, pool, wp) {
    const matchValue = tryFind(resName, wp.Crafts);
    if (matchValue != null) {
        const craftDef = matchValue;
        const craftRatio = getResCraftRatio(cache, crCtx, resName);
        const amt_1 = Math.ceil(amt);
        const craftAmt = amt_1 * (1 + craftRatio);
        let stockValue;
        const matchValue_1 = get$(pool, resName);
        if (matchValue_1 == null) {
            stockValue = 0;
        }
        else {
            const r = matchValue_1;
            stockValue = r.Value;
        }
        if ((amt_1 < 0) && (stockValue < Math.abs(craftAmt))) {
            return [pool, wp, false];
        }
        else {
            const prices = map((p) => [p.Resource, p.Val * amt_1], getCraftPrice(cache, traditionResearched, craftDef.Def));
            if (hasRes(pool, prices, 0)) {
                const poolPaid = payPrices(calendarDay, pool, prices);
                const patternInput = addResEvent(calendarDay, resName, craftAmt, poolPaid);
                const poolGained = patternInput[0];
                const _gained = patternInput[1];
                return [poolGained, wp, true];
            }
            else {
                return [pool, wp, false];
            }
        }
    }
    else {
        return [pool, wp, false];
    }
}

function getCraftAllCountInternal(getResValue, prices) {
    let minAmt = 1.7976931348623157E+308;
    const enumerator = getEnumerator(prices);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const p = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const allAmt = getResValue(p.Resource) / p.Val;
            if (allAmt < minAmt) {
                minAmt = allAmt;
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return minAmt;
}

/**
 * orig getCraftAllCount (L2787): floor of the internal minimum.
 */
export function getCraftAllCount(cache, traditionResearched, getResValue, wp, craftName) {
    const matchValue = tryFind(craftName, wp.Crafts);
    if (matchValue != null) {
        const craft_1 = matchValue;
        const prices = getCraftPrice(cache, traditionResearched, craft_1.Def);
        return Math.floor(getCraftAllCountInternal(getResValue, prices));
    }
    else {
        return 0;
    }
}

/**
 * orig craftAll (L2807): craft the floor maximum with bypassResourceCheck.
 */
export function craftAll(calendarDay, cache, traditionResearched, crCtx, getResValue, craftName, pool, wp) {
    const minAmt = getCraftAllCount(cache, traditionResearched, getResValue, wp, craftName);
    if ((0 < minAmt) && (minAmt < 1.7976931348623157E+308)) {
        const patternInput = craft(calendarDay, cache, traditionResearched, crCtx, craftName, minAmt, pool, wp);
        const wp$0027 = patternInput[1];
        const pool$0027 = patternInput[0];
        const ok = patternInput[2];
        return [pool$0027, wp$0027, ok];
    }
    else {
        return [pool, wp, false];
    }
}

/**
 * orig getEffectEngineer (L2734-2752): per-engineer craft progress per tick.
 */
export function getEffectEngineer(cache, prodCache, neuralNetworksResearched, wp, resName) {
    const matchValue = tryFind(resName, wp.Crafts);
    if (matchValue != null) {
        const craft_1 = matchValue;
        const kittenResProduction = defaultArg(tryFind("ES" + resName, prodCache), 0) * (neuralNetworksResearched ? 2 : 1);
        let tierCraftRatioRaw;
        const matchValue_1 = craft_1.Def.Tier;
        if (matchValue_1 == null) {
            tierCraftRatioRaw = 0;
        }
        else {
            const t = matchValue_1;
            tierCraftRatioRaw = (getEffect(cache, ("t" + t.toString()) + "CraftRatio") + getEffect(cache, "UniversalKnowHow"));
        }
        const tierCraftRatio = (tierCraftRatioRaw === 0) ? 1 : tierCraftRatioRaw;
        const ticksPerSecond = 5;
        const handicap = craft_1.Def.ProgressHandicap;
        return (kittenResProduction * tierCraftRatio) / ((600 * ticksPerSecond) * handicap);
    }
    else {
        return 0;
    }
}

/**
 * orig workshop.fastforward(update) effectsBase slice (L2885-2884): oilMax /
 * scienceMax / cultureMax / faithMax — manuscript/compendia caps. Called every
 * tick from workshop.update BEFORE craftByEngineers.
 */
export function workshopEffectsBase(cache, getResValue, codexResearched) {
    let scaling;
    const oilMax = Math.floor(getResValue("tanker") * 500);
    const scienceMaxCap = getEffect(cache, "scienceMax");
    const compendiaScienceMax = Math.floor(getResValue("compedium") * 10);
    const scienceMax = min(compendiaScienceMax, scienceMaxCap);
    const cultureBonusRaw = Math.floor(getResValue("manuscript"));
    const cultureMax = getUnlimitedDR(cultureBonusRaw, 0.01) * (1 + getEffect(cache, "cultureFromManuscripts"));
    const faithFromManuscripts = getEffect(cache, "faithFromManuscripts");
    let faithMax;
    if (faithFromManuscripts > 0) {
        const faithMaxBld = getEffect(cache, "faithMax");
        const unimpededCap = 10000 + (faithMaxBld * 0.15);
        const stripe = 0.02;
        const threshold = getInverseUnlimitedDR(unimpededCap, stripe);
        faithMax = (((cultureBonusRaw > threshold) ? ((scaling = getLimitedDR(1 + (0.021715 * Math.log(cultureBonusRaw / threshold)), 10), unimpededCap * scaling)) : getUnlimitedDR(cultureBonusRaw, stripe)) * faithFromManuscripts);
    }
    else {
        faithMax = 0;
    }
    return ofList(ofArray([["oilMax", oilMax], ["scienceMax", scienceMax], ["cultureMax", cultureMax], ["faithMax", faithMax]]), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
}

/**
 * orig craftByEngineers (L2890-2915): progress accumulation + auto-craft.
 * `times` = ticks elapsed (1 per tick from update). The isStorageLimited
 * craftable branch reads the PRE-tick craft states (orig reads the live meta
 * objects, which the loop mutates one craft at a time).
 */
export function craftByEngineers(calendarDay, cache, traditionResearched, crCtx, getResValue, prodCache, neuralNetworksResearched, times, pool, wp) {
    let pool_1 = pool;
    let crafts = wp.Crafts;
    let craftsDone = 0;
    const craftCtx = new CraftContext((n) => {
        let option_1;
        return defaultArg((option_1 = tryFind(n, wp.Crafts), (option_1 != null) ? option_1.Unlocked : undefined), false);
    }, (n_1) => {
        let option_4;
        return defaultArg((option_4 = tryFind(n_1, wp.Crafts), (option_4 != null) ? option_4.IsLimited : undefined), false);
    });
    const enumerator = getEnumerator(wp.CraftOrder);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let table_3, bind$0040, table_4, bind$0040_1, table_5, bind$0040_2;
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const craftState = FSharpMap__get_Item(crafts, name);
            const priceList = getCraftPrice(cache, traditionResearched, craftState.Def);
            const prices = map((p) => [p.Resource, p.Val], priceList);
            const isLimited = isStorageLimited(craftCtx, pool_1, prices);
            crafts = add(name, new CraftState(craftState.Def, craftState.Unlocked, craftState.Value, craftState.Progress, isLimited, craftState.IsLimitedAmt), crafts);
            if (craftState.Value === 0) {
            }
            else {
                const currentProgress = max(craftState.Progress, 0) + (times * getEffectEngineer(cache, prodCache, neuralNetworksResearched, wp, name));
                if (currentProgress >= 1) {
                    const currentProgress_1 = min(currentProgress, getCraftAllCountInternal(getResValue, priceList));
                    const units = Math.floor(currentProgress_1);
                    if (!isLimited) {
                        const patternInput = craft(calendarDay, cache, traditionResearched, crCtx, name, units, pool_1, new WorkshopPool(wp.UpgradeOrder, wp.Upgrades, wp.CraftOrder, crafts, wp.ZebraOrder, wp.ZebraUpgrades));
                        const pool$0027 = patternInput[0];
                        const ok = patternInput[2];
                        const _wpIgnored = patternInput[1];
                        if (ok) {
                            pool_1 = pool$0027;
                            craftsDone = (craftsDone + units);
                            crafts = ((table_3 = crafts, add(name, (bind$0040 = FSharpMap__get_Item(crafts, name), new CraftState(bind$0040.Def, bind$0040.Unlocked, bind$0040.Value, currentProgress_1 - units, bind$0040.IsLimited, bind$0040.IsLimitedAmt)), table_3)));
                        }
                    }
                }
                else if (hasRes(pool_1, prices, currentProgress)) {
                    crafts = ((table_4 = crafts, add(name, (bind$0040_1 = FSharpMap__get_Item(crafts, name), new CraftState(bind$0040_1.Def, bind$0040_1.Unlocked, bind$0040_1.Value, currentProgress, bind$0040_1.IsLimited, false)), table_4)));
                }
                else {
                    crafts = ((table_5 = crafts, add(name, (bind$0040_2 = FSharpMap__get_Item(crafts, name), new CraftState(bind$0040_2.Def, bind$0040_2.Unlocked, bind$0040_2.Value, bind$0040_2.Progress, bind$0040_2.IsLimited, true)), table_5)));
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return [pool_1, new WorkshopPool(wp.UpgradeOrder, wp.Upgrades, wp.CraftOrder, crafts, wp.ZebraOrder, wp.ZebraUpgrades), craftsDone];
}

/**
 * orig UpgradeButtonController buyItem → onPurchase: pay, set researched.
 */
export function buyUpgrade(calendarDay, name, pool, wp) {
    let upg;
    const matchValue = tryFind(name, wp.Upgrades);
    let matchResult, upg_1;
    if (matchValue != null) {
        if ((upg = matchValue, !upg.Researched)) {
            matchResult = 0;
            upg_1 = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const prices = map((p) => [p.Resource, p.Val], upg_1.Def.Prices);
            if (hasRes(pool, prices, 0)) {
                const pool$0027 = payPrices(calendarDay, pool, prices);
                const wp$0027 = new WorkshopPool(wp.UpgradeOrder, add(name, new UpgradeState(upg_1.Def, upg_1.Unlocked, true), wp.Upgrades), wp.CraftOrder, wp.Crafts, wp.ZebraOrder, wp.ZebraUpgrades);
                return [pool$0027, wp$0027, true];
            }
            else {
                return [pool, wp, false];
            }
        }
        default:
            return [pool, wp, false];
    }
}

/**
 * orig workshop.unlock (L2919-2932): mark researched, run handler (seam),
 * fan out unlocks/upgrades. Returns updated pool + fan-outs for the dispatcher.
 */
export function unlockZebraUpgrade(name, wp) {
    let z;
    const matchValue = tryFind(name, wp.ZebraUpgrades);
    let matchResult, z_1;
    if (matchValue != null) {
        if ((z = matchValue, !z.Researched)) {
            matchResult = 0;
            z_1 = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const def = find((u) => (u.Name === name), zebraUpgradeDefs);
            const wp$0027 = new WorkshopPool(wp.UpgradeOrder, wp.Upgrades, wp.CraftOrder, wp.Crafts, wp.ZebraOrder, add(name, new UpgradeState(z_1.Def, z_1.Unlocked, true), wp.ZebraUpgrades));
            return [wp$0027, def.Unlocks, def.Upgrades];
        }
        default:
            return [wp, undefined, undefined];
    }
}

export const defaultFaunaNames = ofArray(["giant moth", "mantis", "slime mold"]);

/**
 * orig checkRelation (L2232-2234): race embassy level >= needed. The caller
 * reads the live embassy level (Managers compiles before Diplomacy).
 */
export function checkRelation(embassyLevel, embassyNeeded) {
    return embassyLevel >= embassyNeeded;
}

/**
 * orig unlockRelations (L2236-2245): with the diplomacy perk, all relation
 * policies unlock. Called on load + after every embassy purchase.
 */
export function unlockRelations(diplomacyPerkResearched, getEmbassyLevel, sp) {
    if (diplomacyPerkResearched) {
        let sp_1 = sp;
        let unlockedList = empty_1();
        const enumerator = getEnumerator(toList(sp_1.Policies));
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                let Policies;
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const pol = forLoopVar[1];
                const name = forLoopVar[0];
                let gateOpen;
                const matchValue = pol.Def.RelationGate;
                if (matchValue == null) {
                    gateOpen = pol.Def.IsRelation;
                }
                else {
                    const race = matchValue[0];
                    const needed = matchValue[1] | 0;
                    gateOpen = (getEmbassyLevel(race) >= needed);
                }
                if ((pol.Def.IsRelation && gateOpen) && !pol.Unlocked) {
                    sp_1 = ((Policies = add(name, new PolicyState(pol.Def, true, pol.Researched, pol.Blocked, pol.Effects), sp_1.Policies), new SciencePool(sp_1.TechOrder, sp_1.Techs, sp_1.PolicyOrder, Policies)));
                    unlockedList = cons(name, unlockedList);
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        return [sp_1, reverse(unlockedList)];
    }
    else {
        return [sp, empty_1()];
    }
}

/**
 * orig science.getPrices: leader seam (wise scientist → identity at this
 * slice) + unicornTears challenge branch (seam). Prices are the static table.
 */
export function getTechPrices(sp, name) {
    const matchValue = tryFind(name, sp.Techs);
    if (matchValue == null) {
        return empty_1();
    }
    else {
        const t = matchValue;
        return t.Def.Prices;
    }
}

/**
 * orig workshop.undo: fail unless the crafted stock is still there; then
 * un-gain the product and refund exactly what was spent.
 */
export function undoCraft(calendarDay, craft_1, gained, spent, pool) {
    let option_1;
    const stock = defaultArg((option_1 = get$(pool, craft_1), (option_1 != null) ? option_1.Value : undefined), 0);
    if (stock < gained) {
        return [pool, false];
    }
    else {
        const pool1 = addResEvent(calendarDay, craft_1, -gained, pool)[0];
        let pool$0027 = pool1;
        const enumerator = getEnumerator(spent);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const value_1 = forLoopVar[1];
                const name = forLoopVar[0];
                const p = addResEvent(calendarDay, name, value_1, pool$0027)[0];
                pool$0027 = p;
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        return [pool$0027, true];
    }
}

export function unlock(buildings, tabs, jobs, techs, policies, upgrades, zebraUpgrades, crafts, bpool, sp, wp) {
    let bpool_1 = bpool;
    const enumerator = getEnumerator(buildings);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let ByName;
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue = get$_1(bpool_1, name);
            if (matchValue == null) {
            }
            else {
                const b = matchValue;
                bpool_1 = ((ByName = add(name, new BuildingState(b.Def, b.Val, b.On, b.Unlocked, true, b.Stage), bpool_1.ByName), new BldPool(bpool_1.Order, ByName)));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    let sp_1 = sp;
    const enumerator_1 = getEnumerator(techs);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            let Techs;
            const name_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_1 = getTech(sp_1, name_1);
            if (matchValue_1 == null) {
            }
            else {
                const t = matchValue_1;
                sp_1 = ((Techs = add(name_1, new ResearchState(t.Def, true, t.Researched), sp_1.Techs), new SciencePool(sp_1.TechOrder, Techs, sp_1.PolicyOrder, sp_1.Policies)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    const enumerator_2 = getEnumerator(policies);
    try {
        while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
            let Policies;
            const name_2 = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_2 = tryFind(name_2, sp_1.Policies);
            if (matchValue_2 == null) {
            }
            else {
                const p = matchValue_2;
                sp_1 = ((Policies = add(name_2, new PolicyState(p.Def, true, p.Researched, p.Blocked, p.Effects), sp_1.Policies), new SciencePool(sp_1.TechOrder, sp_1.Techs, sp_1.PolicyOrder, Policies)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_2);
    }
    let wp_1 = wp;
    const enumerator_3 = getEnumerator(upgrades);
    try {
        while (enumerator_3["System.Collections.IEnumerator.MoveNext"]()) {
            let Upgrades;
            const name_3 = enumerator_3["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_3 = tryFind(name_3, wp_1.Upgrades);
            if (matchValue_3 == null) {
            }
            else {
                const u = matchValue_3;
                wp_1 = ((Upgrades = add(name_3, new UpgradeState(u.Def, true, u.Researched), wp_1.Upgrades), new WorkshopPool(wp_1.UpgradeOrder, Upgrades, wp_1.CraftOrder, wp_1.Crafts, wp_1.ZebraOrder, wp_1.ZebraUpgrades)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_3);
    }
    const enumerator_4 = getEnumerator(zebraUpgrades);
    try {
        while (enumerator_4["System.Collections.IEnumerator.MoveNext"]()) {
            let ZebraUpgrades;
            const name_4 = enumerator_4["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_4 = tryFind(name_4, wp_1.ZebraUpgrades);
            if (matchValue_4 == null) {
            }
            else {
                const z = matchValue_4;
                wp_1 = ((ZebraUpgrades = add(name_4, new UpgradeState(z.Def, true, z.Researched), wp_1.ZebraUpgrades), new WorkshopPool(wp_1.UpgradeOrder, wp_1.Upgrades, wp_1.CraftOrder, wp_1.Crafts, wp_1.ZebraOrder, ZebraUpgrades)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_4);
    }
    const enumerator_5 = getEnumerator(crafts);
    try {
        while (enumerator_5["System.Collections.IEnumerator.MoveNext"]()) {
            let Crafts;
            const name_5 = enumerator_5["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_5 = tryFind(name_5, wp_1.Crafts);
            if (matchValue_5 == null) {
            }
            else {
                const c = matchValue_5;
                wp_1 = ((Crafts = add(name_5, new CraftState(c.Def, true, c.Value, c.Progress, c.IsLimited, c.IsLimitedAmt), wp_1.Crafts), new WorkshopPool(wp_1.UpgradeOrder, wp_1.Upgrades, wp_1.CraftOrder, Crafts, wp_1.ZebraOrder, wp_1.ZebraUpgrades)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_5);
    }
    return [bpool_1, sp_1, wp_1];
}

/**
 * orig game.upgrade(list): recalculate effects for metas that define
 * calculateEffects — with all such functions val-constant (session 08), this is
 * a no-op on tables whose values are already baked into the catalogs. Job
 * calculateEffects (D012) is the exception — handled by the caller (village).
 */
export class Kitten extends Record {
    constructor(Name, Surname, Job, Rank, Exp, Seed, Trait, Age, Color, Variety, Rarity, IsLeader, Skills, EngineerSpeciality) {
        super();
        this.Name = Name;
        this.Surname = Surname;
        this.Job = Job;
        this.Rank = (Rank | 0);
        this.Exp = Exp;
        this.Seed = (Seed | 0);
        this.Trait = Trait;
        this.Age = Age;
        this.Color = (Color | 0);
        this.Variety = (Variety | 0);
        this.Rarity = (Rarity | 0);
        this.IsLeader = IsLeader;
        this.Skills = Skills;
        this.EngineerSpeciality = EngineerSpeciality;
    }
}

export function Kitten_$reflection() {
    return record_type("Game.Managers.Kitten", [], Kitten, () => [["Name", string_type], ["Surname", string_type], ["Job", option_type(string_type)], ["Rank", int32_type], ["Exp", float64_type], ["Seed", int32_type], ["Trait", string_type], ["Age", float64_type], ["Color", int32_type], ["Variety", int32_type], ["Rarity", int32_type], ["IsLeader", bool_type], ["Skills", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["EngineerSpeciality", option_type(string_type)]]);
}

export class VillagePool extends Record {
    constructor(Kittens, NextKittenProgress, MaxKittens, JobValues, JobUnlocked, Happiness, DeathTimeout, LeaderSeed, Traits) {
        super();
        this.Kittens = Kittens;
        this.NextKittenProgress = NextKittenProgress;
        this.MaxKittens = (MaxKittens | 0);
        this.JobValues = JobValues;
        this.JobUnlocked = JobUnlocked;
        this.Happiness = Happiness;
        this.DeathTimeout = (DeathTimeout | 0);
        this.LeaderSeed = LeaderSeed;
        this.Traits = Traits;
    }
}

export function VillagePool_$reflection() {
    return record_type("Game.Managers.VillagePool", [], VillagePool, () => [["Kittens", list_type(Kitten_$reflection())], ["NextKittenProgress", float64_type], ["MaxKittens", int32_type], ["JobValues", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, int32_type])], ["JobUnlocked", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])], ["Happiness", float64_type], ["DeathTimeout", int32_type], ["LeaderSeed", option_type(int32_type)], ["Traits", list_type(string_type)]]);
}

export function initVillage(jobDefs) {
    return new VillagePool(empty_1(), 0, 0, ofList(map((j) => [j.Name, 0], jobDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), ofList_1(map((j_2) => j_2.Name, filter((j_1) => j_1.StartsUnlocked, jobDefs)), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), 1, 0, undefined, empty_1());
}

/**
 * orig calculateSimMaxKittens: maxKittens effect (huts ×val etc. via cache).
 */
export function calculateMaxKittens(cache, pool) {
    const maxKittens = getEffect(cache, "maxKittens");
    return ~~Math.floor(maxKittens) | 0;
}

/**
 * orig sim.addKitten: ONE global PRNG draw (the kitten seed via
 * generateKittenSeed → uniformRandomInteger(0, SEED_MAX+1)); ALL attributes
 * (name/surname/trait/age) roll on the kitten's private Lehmer LCG seeded
 * from it (js/village.js L1474, L1521-1545, L1495-1517) — bit-exact port.
 */
export function generateKittenSeed(rand) {
    return ~~uniformRandomInteger(rand, 0, 1000000) | 0;
}

function kittenLcg(seed) {
    let state = (seed + 1) % 2147483647;
    return (ratio) => {
        state = ((state * 16807) % 2147483647);
        return ~~Math.floor(((state - 1) / 2147483646) * ratio) | 0;
    };
}

function generateIdentity(rand) {
    const name = item(rand(length(names)), names);
    const surname = item(rand(length(surnames)), surnames);
    const trait = item(rand(length(traitDefs)), traitDefs).Name;
    let age = 5 + rand(10);
    if (rand(100) < 30) {
        age = (age + rand(30));
    }
    let color = 0;
    let variety = 0;
    if (rand(100) <= 10) {
        color = ((rand(6) + 1) | 0);
        if (rand(100) <= 10) {
            variety = ((rand(4) + 1) | 0);
        }
    }
    let rarity = 0;
    if (rand(100) <= 5) {
        rarity = ((rand(2) + 1) | 0);
        if (rand(100) <= 10) {
            rarity = ((rarity + 1) | 0);
        }
    }
    return new Kitten(name, surname, undefined, 0, 0, 0, trait, age, color, variety, rarity, false, empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), undefined);
}

function makeKitten(seed) {
    const bind$0040 = generateIdentity(kittenLcg(seed));
    return new Kitten(bind$0040.Name, bind$0040.Surname, bind$0040.Job, bind$0040.Rank, bind$0040.Exp, seed, bind$0040.Trait, bind$0040.Age, bind$0040.Color, bind$0040.Variety, bind$0040.Rarity, bind$0040.IsLeader, bind$0040.Skills, bind$0040.EngineerSpeciality);
}

/**
 * orig `new Kitten()` without a seed: identity rolls on the GAME rand
 * (Math.random under the headless driver). village.load constructs one per
 * saved kitten — the draws are burned even when loadSeeded/loadCompressed
 * then overwrite the identity.
 */
export function kittenWithGameRand(rand) {
    const r = (ratio) => (~~Math.floor(rand() * ratio) | 0);
    return generateIdentity(r);
}

/**
 * orig Kitten.loadSeeded: _normalizeSeed (floor, NaN→0, clamp 0..SEED_MAX
 * 999999) + _generateAttributes — identity is deterministically regenerated
 * from the seed; the caller applies skills/exp/job/rank/isLeader on top.
 */
export function kittenFromSeed(seed) {
    const s = Math.floor(seed);
    const s_1 = Number.isNaN(s) ? 0 : s;
    return makeKitten(~~max(0, min(999999, s_1)));
}

export function addKitten(rand, pool) {
    const seed = generateKittenSeed(rand) | 0;
    const kitten = makeKitten(seed);
    const traits = contains(kitten.Trait, pool.Traits, {
        Equals: (x, y) => (x === y),
        GetHashCode: (x) => (stringHash(x) | 0),
    }) ? pool.Traits : cons(kitten.Trait, pool.Traits);
    return new VillagePool(append(pool.Kittens, singleton(kitten)), pool.NextKittenProgress, pool.MaxKittens, pool.JobValues, pool.JobUnlocked, pool.Happiness, pool.DeathTimeout, pool.LeaderSeed, traits);
}

/**
 * Everything the skill-learning half of sim.update reads.
 */
export class SkillContext extends Record {
    constructor(AnarchyActive, InternetResearched, NeuralNetworksResearched, SkillXPEffect, MaxKittensRatioLDR, Day, GetJobValue, GetJobUnlocked, Times) {
        super();
        this.AnarchyActive = AnarchyActive;
        this.InternetResearched = InternetResearched;
        this.NeuralNetworksResearched = NeuralNetworksResearched;
        this.SkillXPEffect = SkillXPEffect;
        this.MaxKittensRatioLDR = MaxKittensRatioLDR;
        this.Day = (Day | 0);
        this.GetJobValue = GetJobValue;
        this.GetJobUnlocked = GetJobUnlocked;
        this.Times = (Times | 0);
    }
}

export function SkillContext_$reflection() {
    return record_type("Game.Managers.SkillContext", [], SkillContext, () => [["AnarchyActive", bool_type], ["InternetResearched", bool_type], ["NeuralNetworksResearched", bool_type], ["SkillXPEffect", float64_type], ["MaxKittensRatioLDR", float64_type], ["Day", int32_type], ["GetJobValue", lambda_type(string_type, int32_type)], ["GetJobUnlocked", lambda_type(string_type, bool_type)], ["Times", int32_type]]);
}

/**
 * orig sim.update skill half (L3285-3338): frequency applies only at
 * times=1; each working kitten learns its job skill (+exp) and either spreads
 * to other unlocked jobs (neuralNetworks) or forgets them.
 */
export function learnSkills(ctx, pool) {
    const kittens = pool.Kittens;
    const hgSkillModifier = (length(pool.Kittens) <= pool.MaxKittens) ? (1 / (1 + getLimitedDR(ctx.MaxKittensRatioLDR, 1))) : 1;
    const baseSkillXP = ctx.InternetResearched ? max((length(pool.Kittens) * hgSkillModifier) / 10000, 0.01) : 0.01;
    const skillXP = (baseSkillXP + ctx.SkillXPEffect) * ctx.Times;
    const skillsCap = 20001;
    const updated = map((kitten) => {
        let table_1, Exp, job;
        let kitten_1 = kitten;
        const matchValue = kitten_1.Job;
        let matchResult, job_1;
        if (matchValue != null) {
            if ((job = matchValue, (ctx.Day >= 0) && !ctx.AnarchyActive)) {
                matchResult = 0;
                job_1 = matchValue;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0: {
                const jobSkill = defaultArg(tryFind(job_1, kitten_1.Skills), 0);
                let skills = kitten_1.Skills;
                if (!((job_1 === "engineer") && equals(kitten_1.EngineerSpeciality, undefined))) {
                    if (jobSkill < skillsCap) {
                        skills = ((table_1 = skills, add(job_1, min(jobSkill + skillXP, skillsCap), table_1)));
                    }
                    kitten_1 = ((Exp = (kitten_1.Exp + skillXP), new Kitten(kitten_1.Name, kitten_1.Surname, kitten_1.Job, kitten_1.Rank, Exp, kitten_1.Seed, kitten_1.Trait, kitten_1.Age, kitten_1.Color, kitten_1.Variety, kitten_1.Rarity, kitten_1.IsLeader, kitten_1.Skills, kitten_1.EngineerSpeciality)));
                }
                if (ctx.NeuralNetworksResearched) {
                    const enumerator = getEnumerator(map((j) => j.Name, jobDefs_1));
                    try {
                        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                            let table_3;
                            const jobName = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                            if (ctx.GetJobUnlocked(jobName) && (ctx.GetJobValue(jobName) > 0)) {
                                const s = defaultArg(tryFind(jobName, skills), 0);
                                if (s !== skillsCap) {
                                    skills = ((table_3 = skills, add(jobName, min(s + ((ctx.Times * 0.001) * ctx.GetJobValue(jobName)), skillsCap), table_3)));
                                }
                            }
                        }
                    }
                    finally {
                        disposeSafe(enumerator);
                    }
                }
                else {
                    skills = map_1((sk, v) => {
                        if ((sk !== job_1) && (v > 0)) {
                            const decay = min(ctx.Times * 0.001, v);
                            return v - decay;
                        }
                        else {
                            return v;
                        }
                    }, skills);
                }
                kitten_1 = (new Kitten(kitten_1.Name, kitten_1.Surname, kitten_1.Job, kitten_1.Rank, kitten_1.Exp, kitten_1.Seed, kitten_1.Trait, kitten_1.Age, kitten_1.Color, kitten_1.Variety, kitten_1.Rarity, kitten_1.IsLeader, skills, kitten_1.EngineerSpeciality));
                return kitten_1;
            }
            default:
                return kitten_1;
        }
    }, kittens);
    return new VillagePool(updated, pool.NextKittenProgress, pool.MaxKittens, pool.JobValues, pool.JobUnlocked, pool.Happiness, pool.DeathTimeout, pool.LeaderSeed, pool.Traits);
}

/**
 * orig sim.update(kittensPerTick, times): births from progress accumulation.
 */
export function simUpdate(maxKittens, kittensPerTick, times, rand, pool) {
    let NextKittenProgress, NextKittenProgress_1;
    let pool_1 = pool;
    if (length(pool_1.Kittens) < maxKittens) {
        pool_1 = ((NextKittenProgress = (pool_1.NextKittenProgress + (times * kittensPerTick)), new VillagePool(pool_1.Kittens, NextKittenProgress, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness, pool_1.DeathTimeout, pool_1.LeaderSeed, pool_1.Traits)));
        if (pool_1.NextKittenProgress >= 1) {
            const kittensToAdd = ~~Math.floor(pool_1.NextKittenProgress) | 0;
            pool_1 = ((NextKittenProgress_1 = (pool_1.NextKittenProgress - kittensToAdd), new VillagePool(pool_1.Kittens, NextKittenProgress_1, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness, pool_1.DeathTimeout, pool_1.LeaderSeed, pool_1.Traits)));
            for (let forLoopVar = 1; forLoopVar <= kittensToAdd; forLoopVar++) {
                if (length(pool_1.Kittens) < maxKittens) {
                    pool_1 = addKitten(rand, pool_1);
                }
            }
            if (length(pool_1.Kittens) >= maxKittens) {
                pool_1 = (new VillagePool(pool_1.Kittens, 0, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness, pool_1.DeathTimeout, pool_1.LeaderSeed, pool_1.Traits));
            }
        }
    }
    return new VillagePool(pool_1.Kittens, pool_1.NextKittenProgress, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness, pool_1.DeathTimeout, pool_1.LeaderSeed, pool_1.Traits);
}

/**
 * orig village.assignJob (manager level): amt capped by free kittens and the
 * job limit (manager default 100000 here); the counter bumps by the capped amt
 * — which can still over-count vs actual sim assignments (OBS-2 orig quirk).
 * orig getFreeKittens: kittens without a job.
 */
export function getFreeKittens(vpool) {
    return length(filter((k) => equals(k.Job, undefined), vpool.Kittens)) | 0;
}

/**
 * orig sim.killKittens(amount): removes the LAST n kittens (their job counters
 * decremented — orig routes through village.unassignJob, which also decrements
 * the craft.value of dead engineers via unassignCraftJobIfEngineer). Returns
 * the dead engineers' specialities for the caller's craft bookkeeping. Stats
 * seam (stats-01). Orig tail: updateResourceProduction + updateResources —
 * the CALLER (runner) mirrors those cache refreshes.
 */
export function killKittens(amount, vpool) {
    let LeaderSeed;
    const amount_1 = min(amount, length(vpool.Kittens)) | 0;
    const survivors = take(length(vpool.Kittens) - amount_1, vpool.Kittens);
    let jobValues = vpool.JobValues;
    let deadSpecialities = empty_1();
    const enumerator = getEnumerator(skip(length(vpool.Kittens) - amount_1, vpool.Kittens));
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let table_1;
            const k = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue = k.Job;
            if (matchValue == null) {
            }
            else {
                const j = matchValue;
                const cur = defaultArg(tryFind(j, jobValues), 0) | 0;
                jobValues = ((table_1 = jobValues, add(j, max(0, cur - 1), table_1)));
            }
            const matchValue_1 = k.EngineerSpeciality;
            if (matchValue_1 == null) {
            }
            else {
                const sp = matchValue_1;
                deadSpecialities = cons(sp, deadSpecialities);
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    let leaderDead;
    const matchValue_2 = vpool.LeaderSeed;
    if (matchValue_2 == null) {
        leaderDead = false;
    }
    else {
        const ls = matchValue_2 | 0;
        leaderDead = forAll((k_1) => (k_1.Seed !== ls), survivors);
    }
    return [(LeaderSeed = (leaderDead ? undefined : vpool.LeaderSeed), new VillagePool(survivors, vpool.NextKittenProgress, vpool.MaxKittens, jobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, LeaderSeed, vpool.Traits)), deadSpecialities];
}

/**
 * orig village.update starvation branch (L430-462): kittens > 0 and catnip
 * value + perTick < 0 -> kill min(1, |resDiff| rounded), deathTimeout = tps*5;
 * else deathTimeout decrements. winterIsComing freeze branch folded in.
 */
export function starvationStep(catnipValue, catnipPerTick, ticksPerSecond, winterIsComingActive, maxKittens, vpool) {
    const kittens = length(vpool.Kittens) | 0;
    if (kittens > 0) {
        const resDiff = catnipValue + catnipPerTick;
        const starving = (resDiff < 0) ? true : (winterIsComingActive && (kittens > maxKittens));
        if (starving) {
            let starved = ~~Math.abs(jsRound(resDiff));
            if (starved > 1) {
                starved = 1;
            }
            if ((starved > 0) && (vpool.DeathTimeout <= 0)) {
                const patternInput = killKittens(starved, vpool);
                const vpool$0027 = patternInput[0];
                const _deadSpecialities = patternInput[1];
                return new VillagePool(vpool$0027.Kittens, vpool$0027.NextKittenProgress, vpool$0027.MaxKittens, vpool$0027.JobValues, vpool$0027.JobUnlocked, vpool$0027.Happiness, ~~(ticksPerSecond * 5), vpool$0027.LeaderSeed, vpool$0027.Traits);
            }
            else {
                return new VillagePool(vpool.Kittens, vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout - 1, vpool.LeaderSeed, vpool.Traits);
            }
        }
        else {
            return vpool;
        }
    }
    else {
        return vpool;
    }
}

/**
 * orig makeLeader(kitten) (L750-769). The theocracy gate is a policy seam
 * (not researched at this slice). anarchy clears the leader.
 */
export function makeLeader(anarchyActive, theocracyBlocks, seed, vpool) {
    const cleared = new VillagePool(map((k) => {
        if (k.IsLeader) {
            return new Kitten(k.Name, k.Surname, k.Job, k.Rank, k.Exp, k.Seed, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, false, k.Skills, k.EngineerSpeciality);
        }
        else {
            return k;
        }
    }, vpool.Kittens), vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits);
    if ((anarchyActive ? true : equals(seed, undefined)) ? true : theocracyBlocks) {
        return new VillagePool(cleared.Kittens, cleared.NextKittenProgress, cleared.MaxKittens, cleared.JobValues, cleared.JobUnlocked, cleared.Happiness, cleared.DeathTimeout, undefined, cleared.Traits);
    }
    else if (seed != null) {
        const s = seed | 0;
        const kittens = map((k_1) => {
            if (k_1.Seed === s) {
                return new Kitten(k_1.Name, k_1.Surname, k_1.Job, k_1.Rank, k_1.Exp, k_1.Seed, k_1.Trait, k_1.Age, k_1.Color, k_1.Variety, k_1.Rarity, true, k_1.Skills, k_1.EngineerSpeciality);
            }
            else {
                return k_1;
            }
        }, cleared.Kittens);
        return new VillagePool(kittens, cleared.NextKittenProgress, cleared.MaxKittens, cleared.JobValues, cleared.JobUnlocked, cleared.Happiness, cleared.DeathTimeout, s, cleared.Traits);
    }
    else {
        return cleared;
    }
}

/**
 * orig getLeaderBonus(rank) (L776-781): rank 0 → 1.0, else (rank+1)/1.4,
 * authocracy doubles it.
 */
export function getLeaderBonus(authocracyResearched, rank) {
    const bonus = (rank === 0) ? 1 : ((rank + 1) / 1.4);
    if (authocracyResearched) {
        return bonus * 2;
    }
    else {
        return bonus;
    }
}

/**
 * The leader's current trait (from the leader seed).
 */
export function leaderTrait(vpool) {
    const matchValue = vpool.LeaderSeed;
    if (matchValue != null) {
        const s = matchValue | 0;
        const option_1 = tryFind_1((k) => (k.Seed === s), vpool.Kittens);
        if (option_1 != null) {
            return option_1.Trait;
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}

/**
 * orig getRankExp(rank) (L224-226): 500 × 1.75^rank.
 */
export function getRankExp(rank) {
    return 500 * Math.pow(1.75, rank);
}

/**
 * orig getValueModifierPerSkill (L1292-1324): anarchy zeroes it; the top tier
 * scales by (1 + masterSkillMultiplier); everything × (1 + skillMultiplier).
 */
export function getValueModifierPerSkill(anarchyActive, masterSkillMultiplier, skillMultiplier, value) {
    if (anarchyActive) {
        return 0;
    }
    else {
        const bonus = (value < 100) ? 0 : ((value < 500) ? 0.0125 : ((value < 1200) ? 0.025 : ((value < 2500) ? 0.045 : ((value < 5000) ? 0.075 : ((value < 9000) ? 0.125 : (0.1875 * (1 + masterSkillMultiplier)))))));
        return bonus * (1 + skillMultiplier);
    }
}

/**
 * orig getSkillExpRange (L1326-1341).
 */
export function getSkillExpRange(value) {
    if (value < 100) {
        return [0, 100];
    }
    else if (value < 500) {
        return [100, 500];
    }
    else if (value < 2500) {
        return [500, 2500];
    }
    else if (value < 5000) {
        return [2500, 5000];
    }
    else if (value < 9000) {
        return [5000, 9000];
    }
    else if (value < 20000) {
        return [9000, 20000];
    }
    else {
        return [20000, value];
    }
}

/**
 * expToPromote (L3706-3714): sum of getRankExp over the rank span.
 */
export function expToPromote(rankBase, rankFinal, expNeeded) {
    let total = 0;
    for (let i = 0; i <= ((rankFinal - rankBase) - 1); i++) {
        total = (total + getRankExp(rankBase + i));
    }
    if (total > expNeeded) {
        return [false, 0];
    }
    else {
        return [true, total];
    }
}

/**
 * goldToPromote (L3716-3726): 25 × rank per step.
 */
export function goldToPromote(rankBase, rankFinal, goldNeeded) {
    let total = 0;
    for (let i = 0; i <= ((rankFinal - rankBase) - 1); i++) {
        total = (total + (25 * ((rankBase + i) + 1)));
    }
    if (total > goldNeeded) {
        return [false, 0];
    }
    else {
        return [true, total];
    }
}

/**
 * sim.promote (L3655-3704): returns 1 promoted / 0 ineligible / -1 no gold /
 * -2 no exp. Mutates the kitten list (rank, exp) and the gold pool.
 */
export function promote(anarchyActive_mut, rankTarget_mut, seed_mut, vpool_mut, pool_mut) {
    promote:
    while (true) {
        const anarchyActive = anarchyActive_mut, rankTarget = rankTarget_mut, seed = seed_mut, vpool = vpool_mut, pool = pool_mut;
        let option_1;
        if (anarchyActive) {
            return [vpool, pool, 0];
        }
        else {
            const matchValue = tryFind_1((k) => (k.Seed === seed), vpool.Kittens);
            if (matchValue != null) {
                const kitten = matchValue;
                const kittenRank = kitten.Rank | 0;
                let patternInput;
                if (rankTarget != null) {
                    const r = rankTarget | 0;
                    patternInput = [r, r - kittenRank];
                }
                else {
                    patternInput = [kittenRank + 1, 1];
                }
                const rankFinal = patternInput[0] | 0;
                const rankDiff = patternInput[1] | 0;
                if (rankDiff <= 0) {
                    return [vpool, pool, 0];
                }
                else {
                    const patternInput_1 = expToPromote(kittenRank, rankFinal, kitten.Exp);
                    const expOk = patternInput_1[0];
                    const expCost = patternInput_1[1];
                    const gold = defaultArg((option_1 = get$(pool, "gold"), (option_1 != null) ? option_1.Value : undefined), 0);
                    const patternInput_2 = goldToPromote(kittenRank, rankFinal, gold);
                    const goldOk = patternInput_2[0];
                    const goldCost = patternInput_2[1];
                    if (expOk && goldOk) {
                        const kittens = map((k_1) => {
                            if (k_1.Seed === seed) {
                                return new Kitten(k_1.Name, k_1.Surname, k_1.Job, rankFinal, k_1.Exp - expCost, k_1.Seed, k_1.Trait, k_1.Age, k_1.Color, k_1.Variety, k_1.Rarity, k_1.IsLeader, k_1.Skills, k_1.EngineerSpeciality);
                            }
                            else {
                                return k_1;
                            }
                        }, vpool.Kittens);
                        const pool1 = addResEvent(0, "gold", -goldCost, pool)[0];
                        return [new VillagePool(kittens, vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits), pool1, 1];
                    }
                    else if (rankDiff > 1) {
                        anarchyActive_mut = anarchyActive;
                        rankTarget_mut = undefined;
                        seed_mut = seed;
                        vpool_mut = vpool;
                        pool_mut = pool;
                        continue promote;
                    }
                    else if (expOk && !goldOk) {
                        return [vpool, pool, -1];
                    }
                    else {
                        return [vpool, pool, -2];
                    }
                }
            }
            else {
                return [vpool, pool, 0];
            }
        }
        break;
    }
}

/**
 * orig sim.sortKittensByExp (village.js L3395-3400): rank asc then exp asc
 * (JS stable sort → F# stable List.sortWith). Used by cryochamber reserves.
 */
export function sortKittensByExp(pool) {
    const sorted = sortWith((a, b) => {
        if (a.Rank !== b.Rank) {
            return comparePrimitives(a.Rank, b.Rank) | 0;
        }
        else {
            return comparePrimitives(a.Exp, b.Exp) | 0;
        }
    }, pool.Kittens);
    return new VillagePool(sorted, pool.NextKittenProgress, pool.MaxKittens, pool.JobValues, pool.JobUnlocked, pool.Happiness, pool.DeathTimeout, pool.LeaderSeed, pool.Traits);
}

export function assignJob(name, amt, jobLimit, vpool) {
    const current = defaultArg(tryFind(name, vpool.JobValues), 0) | 0;
    const free = getFreeKittens(vpool) | 0;
    const capped = min(amt, min(free, jobLimit - current)) | 0;
    if (capped > 0) {
        return new VillagePool(vpool.Kittens, vpool.NextKittenProgress, vpool.MaxKittens, add(name, current + capped, vpool.JobValues), vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits);
    }
    else {
        return vpool;
    }
}

/**
 * orig sim.assignJob(job, amt, optimize): assign up to amt free kittens
 * (reverse iteration, no optimize at fresh — register perk not researched).
 */
export function simAssignJob(job, amt, vpool) {
    let vpool_1 = vpool;
    let freeIds = reverse(map((tuple) => (tuple[0] | 0), filter((tupledArg) => {
        const k = tupledArg[1];
        return equals(k.Job, undefined);
    }, indexed(vpool_1.Kittens))));
    let n = amt;
    while ((n > 0) && !isEmpty(freeIds)) {
        const id = head(freeIds) | 0;
        freeIds = tail(freeIds);
        const k_1 = item(id, vpool_1.Kittens);
        vpool_1 = (new VillagePool(updateAt(id, new Kitten(k_1.Name, k_1.Surname, job, k_1.Rank, k_1.Exp, k_1.Seed, k_1.Trait, k_1.Age, k_1.Color, k_1.Variety, k_1.Rarity, k_1.IsLeader, k_1.Skills, k_1.EngineerSpeciality), vpool_1.Kittens), vpool_1.NextKittenProgress, vpool_1.MaxKittens, vpool_1.JobValues, vpool_1.JobUnlocked, vpool_1.Happiness, vpool_1.DeathTimeout, vpool_1.LeaderSeed, vpool_1.Traits));
        n = ((n - 1) | 0);
    }
    return vpool_1;
}

/**
 * orig village.updateResourceProduction (js/village.js L626-728): the CACHED
 * per-kitten production map. Orig refreshes this on a 10-tick timer, on job
 * assignment/promotion, and lazily on first read (village.js L603-605) — the
 * runner owns that timing; this function is the pure recompute. Includes the
 * engineer "ES<craft>" keys (L691-721).
 */
export function getResProduction(cache, vpool, jobDefs, wp) {
    let res = empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    const happiness = vpool.Happiness;
    const eff = (name) => getEffect(cache, name);
    const anarchyActive = eff("kittenLaziness") > 0;
    const authocracyResearched = false;
    let leaderRank;
    const matchValue = vpool.LeaderSeed;
    if (matchValue == null) {
        leaderRank = undefined;
    }
    else {
        const ls = matchValue | 0;
        const option_1 = tryFind_1((k) => (k.Seed === ls), vpool.Kittens);
        leaderRank = ((option_1 != null) ? option_1.Rank : undefined);
    }
    const enumerator = getEnumerator(vpool.Kittens);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const k_2 = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_1 = k_2.Job;
            if (matchValue_1 != null) {
                const jobName = matchValue_1;
                const matchValue_2 = tryFind(jobName, jobDefs);
                if (matchValue_2 != null) {
                    const jobDef = matchValue_2;
                    let modifiers;
                    const matchValue_3 = jobDef.CalculatedModifiers;
                    if (matchValue_3 == null) {
                        modifiers = jobDef.Modifiers;
                    }
                    else {
                        const m = matchValue_3;
                        modifiers = m;
                    }
                    const skill = defaultArg(tryFind(jobName, k_2.Skills), 0);
                    const skillMod = getValueModifierPerSkill(anarchyActive, eff("masterSkillMultiplier"), eff("skillMultiplier"), skill);
                    const rankMultiplier = 1 + (eff(jobName + "BoostPerRank") * k_2.Rank);
                    const enumerator_1 = getEnumerator(modifiers);
                    try {
                        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                            const activePatternResult = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                            const resName = activePatternResult[0];
                            const baseMod = activePatternResult[1];
                            let diff = baseMod + (baseMod * skillMod);
                            diff = (diff * rankMultiplier);
                            if (diff > 0) {
                                if (k_2.IsLeader) {
                                    diff = (diff * getLeaderBonus(authocracyResearched, k_2.Rank));
                                }
                                else if (leaderRank == null) {
                                }
                                else {
                                    const lr = leaderRank | 0;
                                    diff = (diff * (1 + ((getLeaderBonus(authocracyResearched, lr) - 1) * eff("boostFromLeader"))));
                                }
                                diff = (diff * happiness);
                            }
                            res = change(resName, (_arg) => {
                                if (_arg == null) {
                                    return diff;
                                }
                                else {
                                    const prev = _arg;
                                    return prev + diff;
                                }
                            }, res);
                        }
                    }
                    finally {
                        disposeSafe(enumerator_1);
                    }
                    if (jobName === "engineer") {
                        const matchValue_4 = k_2.EngineerSpeciality;
                        if (matchValue_4 != null) {
                            const speciality = matchValue_4;
                            const matchValue_5 = tryFind(speciality, wp.Crafts);
                            if (matchValue_5 != null) {
                                const craftState = matchValue_5;
                                const automationBonus = eff(speciality + "AutomationBonus");
                                let diff_1 = 1 + automationBonus;
                                let rankDiff;
                                const matchValue_6 = craftState.Def.Tier;
                                if (matchValue_6 == null) {
                                    rankDiff = 0;
                                }
                                else {
                                    const t = matchValue_6;
                                    rankDiff = (t - k_2.Rank);
                                }
                                if (rankDiff > 0) {
                                    diff_1 = (diff_1 - ((diff_1 * rankDiff) * 0.15));
                                }
                                diff_1 = (diff_1 + (diff_1 * skillMod));
                                if (diff_1 > 0) {
                                    if (k_2.IsLeader) {
                                        diff_1 = (diff_1 * getLeaderBonus(authocracyResearched, k_2.Rank));
                                    }
                                    else if (leaderRank == null) {
                                    }
                                    else {
                                        const lr_1 = leaderRank | 0;
                                        diff_1 = (diff_1 * (1 + ((getLeaderBonus(authocracyResearched, lr_1) - 1) * eff("boostFromLeader"))));
                                    }
                                }
                                if (diff_1 > 0) {
                                    diff_1 = (diff_1 * happiness);
                                }
                                const key = "ES" + speciality;
                                res = change(key, (_arg_1) => {
                                    if (_arg_1 == null) {
                                        return diff_1;
                                    }
                                    else {
                                        const prev_1 = _arg_1;
                                        return prev_1 + diff_1;
                                    }
                                }, res);
                            }
                        }
                    }
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return res;
}

/**
 * orig village.getFreeEngineers (L573-578): engineers minus sum of craft values.
 */
export function getFreeEngineers(vpool, wp) {
    const engineerCount = defaultArg(tryFind("engineer", vpool.JobValues), 0);
    const assigned = sumBy((n) => FSharpMap__get_Item(wp.Crafts, n).Value, wp.CraftOrder, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
    return engineerCount - assigned;
}

/**
 * orig sim.assignCraftJob (L3577-3615): give the speciality to one free
 * engineer kitten (reverse iteration, optimize seam skipped — no register).
 */
export function simAssignCraftJob(craftName, vpool) {
    let value;
    let assignedId = -1;
    let i = length(vpool.Kittens) - 1;
    while ((assignedId < 0) && (i >= 0)) {
        const k = item(i, vpool.Kittens);
        if (equals(k.Job, "engineer") && equals(k.EngineerSpeciality, undefined)) {
            assignedId = (i | 0);
        }
        i = ((i - 1) | 0);
    }
    if (assignedId >= 0) {
        const k_1 = item(assignedId, vpool.Kittens);
        return [new VillagePool((value = (new Kitten(k_1.Name, k_1.Surname, k_1.Job, k_1.Rank, k_1.Exp, k_1.Seed, k_1.Trait, k_1.Age, k_1.Color, k_1.Variety, k_1.Rarity, k_1.IsLeader, k_1.Skills, craftName)), updateAt(assignedId, value, vpool.Kittens)), vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits), true];
    }
    else {
        return [vpool, false];
    }
}

/**
 * orig sim.unassignCraftJobIfEngineer (L3652-3659)
 */
export function unassignCraftJobIfEngineer(vpool, kittenId) {
    const k = item(kittenId, vpool.Kittens);
    const matchValue = k.Job;
    const matchValue_1 = k.EngineerSpeciality;
    let matchResult, speciality;
    if (matchValue != null) {
        if (matchValue === "engineer") {
            if (matchValue_1 != null) {
                matchResult = 0;
                speciality = matchValue_1;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0:
            return [new VillagePool(updateAt(kittenId, new Kitten(k.Name, k.Surname, k.Job, k.Rank, k.Exp, k.Seed, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, k.IsLeader, k.Skills, undefined), vpool.Kittens), vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits), speciality];
        default: {
            const k$0027 = !equals(k.EngineerSpeciality, undefined) ? (new Kitten(k.Name, k.Surname, k.Job, k.Rank, k.Exp, k.Seed, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, k.IsLeader, k.Skills, undefined)) : k;
            return [new VillagePool(updateAt(kittenId, k$0027, vpool.Kittens), vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits), undefined];
        }
    }
}

/**
 * orig sim.clearCraftJobs (L3663-3673)
 */
export function clearCraftJobs(vpool) {
    return new VillagePool(map((k) => {
        if (!equals(k.EngineerSpeciality, undefined)) {
            return new Kitten(k.Name, k.Surname, k.Job, k.Rank, k.Exp, k.Seed, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, k.IsLeader, k.Skills, undefined);
        }
        else {
            return k;
        }
    }, vpool.Kittens), vpool.NextKittenProgress, vpool.MaxKittens, vpool.JobValues, vpool.JobUnlocked, vpool.Happiness, vpool.DeathTimeout, vpool.LeaderSeed, vpool.Traits);
}

/**
 * orig Kitten._mergeSSN (SAVE_PACKET_OFFSET 100): pack 7 small ints base-100.
 */
export function mergeSSN(values) {
    let result = 0;
    const enumerator = getEnumerator(reverse(values));
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const v = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]() | 0;
            result = (((result * 100) + v) | 0);
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return result | 0;
}

