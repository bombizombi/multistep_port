
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { float64_type, int32_type, bool_type, record_type, class_type, list_type, string_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { BuildingDef, Price, BuildingState, BuildingState_$reflection } from "./Game.Types.js";
import { add, FSharpMap__get_Item, FSharpMap__get_IsEmpty, tryFind, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { append, empty, singleton, forAll, item, length, map } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { disposeSafe, getEnumerator, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { payPrices, hasRes, addResEvent, get$ as get$_1 } from "./Game.Resources.js";
import { FSharpSet__Contains, ofList as ofList_1 } from "../../fable_modules/fable-library-js.5.17.0/Set.js";
import { defaultArg } from "../../fable_modules/fable-library-js.5.17.0/Option.js";
import { getEffect } from "./Game.Effects.js";
import { getLimitedDR } from "./Game.Math.js";
import { sumPricesWeighted } from "./Game.Challenges.js";
import { min, max } from "../../fable_modules/fable-library-js.5.17.0/Double.js";

export class BldPool extends Record {
    constructor(Order, ByName) {
        super();
        this.Order = Order;
        this.ByName = ByName;
    }
}

export function BldPool_$reflection() {
    return record_type("Game.Buildings.BldPool", [], BldPool, () => [["Order", list_type(string_type)], ["ByName", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, BuildingState_$reflection()])]]);
}

export function init(defs) {
    const byName = ofList(map((d) => [d.Name, new BuildingState(d, 0, 0, d.StartsUnlocked, d.StartsUnlockable, d.Stage)], defs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    return new BldPool(map((d_1) => d_1.Name, defs), byName);
}

export function get$(pool, name) {
    return tryFind(name, pool.ByName);
}

/**
 * orig isUnlockable(b): defaultUnlockable || unlockable flag.
 */
export function isUnlockable(b) {
    if (b.Def.DefaultUnlockable) {
        return true;
    }
    else {
        return b.Unlockable;
    }
}

/**
 * orig isUnlocked(b): unlockable AND every price has value >= price × unlockRatio.
 */
export function isUnlocked(pool, b) {
    let s_1;
    if (!isUnlockable(b)) {
        return false;
    }
    else {
        const def = b.Def;
        const stage = (length(def.Stages) > 0) ? item(b.Stage, def.Stages) : undefined;
        const patternInput = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_1 = stage, [s_1.Prices, s_1.UnlockRatio])) : [def.Prices, def.UnlockRatio]) : [def.Prices, def.UnlockRatio];
        const ratio = patternInput[1];
        if (ratio != null) {
            const ratio_1 = ratio;
            return forAll((p) => {
                const matchValue = get$_1(pool, p.Resource);
                if (matchValue == null) {
                    return false;
                }
                else {
                    return matchValue.Value >= (p.Val * ratio_1);
                }
            }, patternInput[0]);
        }
        else {
            return true;
        }
    }
}

/**
 * Challenge-dependent pricing inputs (js/buildings.js getPrices + the
 * challenge priceRules specials). PriceRules mirrors meta.priceRules (static:
 * stasisPod; dynamic: calciner/blackSky, steamworks/pacifism, field/
 * postApocalypse — recomputed wherever orig runs calculateAllEffects).
 */
export class PricingContext extends Record {
    constructor(PriceRules, UnicornTearsActive, BlackSkyActive, PacifismActive, PostApocalypseActive, PacifismOn, UsedCryochambers, IronWill, PollutionLevel) {
        super();
        this.PriceRules = PriceRules;
        this.UnicornTearsActive = UnicornTearsActive;
        this.BlackSkyActive = BlackSkyActive;
        this.PacifismActive = PacifismActive;
        this.PostApocalypseActive = PostApocalypseActive;
        this.PacifismOn = (PacifismOn | 0);
        this.UsedCryochambers = (UsedCryochambers | 0);
        this.IronWill = IronWill;
        this.PollutionLevel = PollutionLevel;
    }
}

export function PricingContext_$reflection() {
    return record_type("Game.Buildings.PricingContext", [], PricingContext, () => [["PriceRules", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])], ["UnicornTearsActive", bool_type], ["BlackSkyActive", bool_type], ["PacifismActive", bool_type], ["PostApocalypseActive", bool_type], ["PacifismOn", int32_type], ["UsedCryochambers", int32_type], ["IronWill", bool_type], ["PollutionLevel", float64_type]]);
}

export const freshPricing = new PricingContext(ofList_1(singleton("stasisPod"), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), false, false, false, false, 0, 0, false, 0);

/**
 * orig getPrices core: base × ratio^(val + fakeBought) with the meta- and
 * per-resource CostReduction LDR discounts, then the priceRules specials.
 * The temporary unicornTears/postApocalypse add-ons are appended by
 * getExtraPrices (paid on buy, never refunded).
 */
export function getPricesWith(cache, pctx, additionalBought, b) {
    let s_1, s_3, arg0__25, arg1__21;
    const def = b.Def;
    const stage = (length(def.Stages) > 0) ? item(b.Stage, def.Stages) : undefined;
    const prices = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_1 = stage, s_1.Prices)) : def.Prices) : def.Prices;
    const ratio = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_3 = stage, defaultArg(s_3.PriceRatio, 1))) : defaultArg(b.Def.PriceRatio, 1)) : defaultArg(b.Def.PriceRatio, 1);
    const eff = (name) => getEffect(cache, name);
    const priceModifier = 1 - getLimitedDR(eff(def.Name + "CostReduction"), 1);
    const valExp = b.Val + (eff(def.Name + "FakeBought") + additionalBought);
    const baseLoop = map((p) => {
        let arg0__9, s_5;
        const resPriceModifier = 1 - getLimitedDR(eff(p.Resource + "CostReduction"), 1);
        return new Price(p.Resource, ((p.Val * ((arg0__9 = ((stage != null) ? ((length(stage.Prices) > 0) ? ((s_5 = stage, ratio)) : ratio) : ratio), Math.pow(arg0__9, valExp)))) * resPriceModifier) * priceModifier);
    }, prices);
    let priceRulesBranch;
    const baseP = map((p_1) => {
        const resPriceModifier_1 = 1 - getLimitedDR(eff(p_1.Resource + "CostReduction"), 1);
        return new Price(p_1.Resource, ((p_1.Val * Math.pow(ratio, valExp)) * resPriceModifier_1) * priceModifier);
    }, prices);
    const baseP_1 = ((pctx.BlackSkyActive && (def.Name === "calciner")) && (b.Val === 0)) ? map((pr) => {
        if (pr.Resource === "titanium") {
            return new Price(pr.Resource, 0);
        }
        else {
            return new Price(pr.Resource, pr.Val * 11);
        }
    }, baseP) : baseP;
    priceRulesBranch = (((pctx.PacifismActive && (def.Name === "steamworks")) && (b.Val === 0)) ? map((pr_1) => {
        if (pr_1.Resource === "blueprint") {
            return new Price(pr_1.Resource, (pctx.PacifismOn * 5) + 1);
        }
        else {
            return pr_1;
        }
    }, baseP_1) : baseP_1);
    const withRules = FSharpSet__Contains(pctx.PriceRules, def.Name) ? priceRulesBranch : baseLoop;
    if (pctx.UnicornTearsActive && (b.Val > 0)) {
        let weight;
        const w = sumPricesWeighted(map((p_2) => [p_2.Resource, p_2.Val], prices));
        weight = ((w > 0) ? (w * ((arg0__25 = eff("bonfireTearsPriceRatioChallenge"), (arg1__21 = (b.Val - 1), Math.pow(arg0__25, arg1__21))))) : w);
        if (weight > 1000000000) {
            singleton(1);
        }
        else if (weight > 100000) {
            singleton(1);
        }
        else if (weight >= 100) {
            singleton(1);
        }
        else {
            empty();
        }
    }
    else if (((pctx.PostApocalypseActive && (def.Name === "field")) && (pctx.PollutionLevel >= 5)) && (b.Val >= max((95 - pctx.UsedCryochambers) - pctx.PollutionLevel, 7 + (pctx.IronWill ? 8 : 0)))) {
        singleton(1);
    }
    else {
        empty();
    }
    return withRules;
}

/**
 * Temporary (paid on buy, never refunded) add-on prices.
 */
export function getExtraPrices(cache, pctx, b) {
    let s_1, arg0__4, arg1__3, arg0__20;
    const def = b.Def;
    const stage = (length(def.Stages) > 0) ? item(b.Stage, def.Stages) : undefined;
    const prices = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_1 = stage, s_1.Prices)) : def.Prices) : def.Prices;
    const eff = (name) => getEffect(cache, name);
    const priceModifier = 1 - getLimitedDR(eff(def.Name + "CostReduction"), 1);
    if (pctx.UnicornTearsActive && (b.Val > 0)) {
        let weight;
        const w = sumPricesWeighted(map((p) => [p.Resource, p.Val], prices));
        weight = ((w > 0) ? (w * ((arg0__4 = eff("bonfireTearsPriceRatioChallenge"), (arg1__3 = (b.Val - 1), Math.pow(arg0__4, arg1__3))))) : w);
        if (weight > 1000000000) {
            return singleton(new Price("alicorn", (Math.log(weight) - 19.7232) * priceModifier));
        }
        else if (weight > 100000) {
            return singleton(new Price("tears", (weight / 100000) * priceModifier));
        }
        else if (weight >= 100) {
            return singleton(new Price("unicorns", (weight / 100) * priceModifier));
        }
        else {
            return empty();
        }
    }
    else if (((pctx.PostApocalypseActive && (def.Name === "field")) && (pctx.PollutionLevel >= 5)) && (b.Val >= max((95 - pctx.UsedCryochambers) - pctx.PollutionLevel, 7 + (pctx.IronWill ? 8 : 0)))) {
        const builtWithUnobtainium = max((b.Val + pctx.UsedCryochambers) - 100, 0);
        return singleton(new Price("unobtainium", 15 * ((arg0__20 = defaultArg(b.Def.PriceRatio, 1), Math.pow(arg0__20, builtWithUnobtainium)))));
    }
    else {
        return empty();
    }
}

/**
 * Normal (refundable) ladder with the priceRules specials.
 */
export function getPrices(cache, pctx, b) {
    let s_1, s_3;
    const def = b.Def;
    const stage = (length(def.Stages) > 0) ? item(b.Stage, def.Stages) : undefined;
    const prices = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_1 = stage, s_1.Prices)) : def.Prices) : def.Prices;
    const ratio = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_3 = stage, defaultArg(s_3.PriceRatio, 1))) : defaultArg(b.Def.PriceRatio, 1)) : defaultArg(b.Def.PriceRatio, 1);
    const eff = (name) => getEffect(cache, name);
    const priceModifier = 1 - getLimitedDR(eff(def.Name + "CostReduction"), 1);
    const valExp = b.Val + eff(def.Name + "FakeBought");
    const baseLoop = map((p) => {
        let arg0__7, s_5;
        const resPriceModifier = 1 - getLimitedDR(eff(p.Resource + "CostReduction"), 1);
        return new Price(p.Resource, ((p.Val * ((arg0__7 = ((stage != null) ? ((length(stage.Prices) > 0) ? ((s_5 = stage, ratio)) : ratio) : ratio), Math.pow(arg0__7, valExp)))) * resPriceModifier) * priceModifier);
    }, prices);
    let priceRulesBranch;
    const baseP = map((p_1) => {
        const resPriceModifier_1 = 1 - getLimitedDR(eff(p_1.Resource + "CostReduction"), 1);
        return new Price(p_1.Resource, ((p_1.Val * Math.pow(ratio, valExp)) * resPriceModifier_1) * priceModifier);
    }, prices);
    const baseP_1 = ((pctx.BlackSkyActive && (def.Name === "calciner")) && (b.Val === 0)) ? map((pr) => {
        if (pr.Resource === "titanium") {
            return new Price(pr.Resource, 0);
        }
        else {
            return new Price(pr.Resource, pr.Val * 11);
        }
    }, baseP) : baseP;
    priceRulesBranch = (((pctx.PacifismActive && (def.Name === "steamworks")) && (b.Val === 0)) ? map((pr_1) => {
        if (pr_1.Resource === "blueprint") {
            return new Price(pr_1.Resource, (pctx.PacifismOn * 5) + 1);
        }
        else {
            return pr_1;
        }
    }, baseP_1) : baseP_1);
    if (FSharpSet__Contains(pctx.PriceRules, def.Name)) {
        return priceRulesBranch;
    }
    else {
        return baseLoop;
    }
}

/**
 * Combined affordability view (orig hasResources over the full price list).
 */
export function getAllPrices(cache, pctx, b) {
    return append(getPrices(cache, pctx, b), getExtraPrices(cache, pctx, b));
}

/**
 * orig buildings provider getEffect (js/buildings.js L144-175): Max-suffixed
 * effects (except library) and biolab Ratios scale with VAL; everything else
 * with ON; coalRatioGlobal raw. Stageable buildings read the active stage table.
 * orig addBarnWarehouseRatio inputs (resources.js L896-911): barn/warehouse
 * calculateEffects scale their storage tables by the barnRatio/warehouseRatio
 * upgrade effects; silos boost barn catnip storage when researched.
 */
export class StorageRatioContext extends Record {
    constructor(BarnRatio, WarehouseRatio, SilosResearched) {
        super();
        this.BarnRatio = BarnRatio;
        this.WarehouseRatio = WarehouseRatio;
        this.SilosResearched = SilosResearched;
    }
}

export function StorageRatioContext_$reflection() {
    return record_type("Game.Buildings.StorageRatioContext", [], StorageRatioContext, () => [["BarnRatio", float64_type], ["WarehouseRatio", float64_type], ["SilosResearched", bool_type]]);
}

export function providerEffect(ctx, b, effectName) {
    const def = b.Def;
    const stageTable = (length(def.Stages) > 0) ? item(min(b.Stage, length(def.Stages) - 1), def.Stages).Effects : undefined;
    let effectValue;
    if (stageTable == null) {
        effectValue = defaultArg(tryFind(effectName, def.Effects), 0);
    }
    else {
        const st = stageTable;
        effectValue = (!FSharpMap__get_IsEmpty(st) ? defaultArg(tryFind(effectName, st), 0) : defaultArg(tryFind(effectName, def.Effects), 0));
    }
    const effectValue_1 = (def.Name === "barn") ? (((effectName === "catnipMax") && ctx.SilosResearched) ? (effectValue * (1 + (ctx.BarnRatio * 0.25))) : ((((effectName === "woodMax") ? true : (effectName === "mineralsMax")) ? true : (effectName === "ironMax")) ? (effectValue * (1 + ctx.BarnRatio)) : effectValue)) : ((def.Name === "warehouse") ? ((((effectName === "woodMax") ? true : (effectName === "mineralsMax")) ? true : (effectName === "ironMax")) ? (effectValue * (1 + ctx.WarehouseRatio)) : effectValue) : effectValue);
    if (effectName === "coalRatioGlobal") {
        return effectValue_1;
    }
    else if ((effectName.endsWith("Max") && (def.Name !== "library")) ? true : ((def.Name === "biolab") && effectName.endsWith("Ratio"))) {
        return effectValue_1 * b.Val;
    }
    else {
        return effectValue_1 * b.On;
    }
}

/**
 * orig mutates building meta effects in place (updateEffects actions);
 * the fs mirror replaces the Def's static effects with a dynamic table per
 * BuildingState. Kept immutable here — callers thread the new pool.
 */
export function setEffects(bpool, name, f) {
    let bind$0040;
    const b = FSharpMap__get_Item(bpool.ByName, name);
    return new BldPool(bpool.Order, add(name, new BuildingState((bind$0040 = b.Def, new BuildingDef(bind$0040.Name, bind$0040.Tab, bind$0040.Stage, bind$0040.UnlockRatio, bind$0040.DefaultUnlockable, bind$0040.Prices, bind$0040.PriceRatio, bind$0040.LimitBuild, bind$0040.TogglableOnOff, bind$0040.NoStackable, bind$0040.BreaksIronWill, f(b.Def.Effects), bind$0040.StartsUnlocked, bind$0040.StartsUnlockable, bind$0040.Stages, bind$0040.Unlocks, bind$0040.Upgrades, bind$0040.UnlockScheme)), b.Val, b.On, b.Unlocked, b.Unlockable, b.Stage), bpool.ByName));
}

/**
 * Sell ONE unit back at the CURRENT ladder: decrement val/on, recompute the
 * price ladder at the new val, refund prices × refundPercentage (0.5) for
 * refundable resources. Returns updated pools + whether the sale happened.
 */
export function sellOne(calendarDay, cache, pctx, pool, name, refundPercentage, bpool) {
    const matchValue = get$(bpool, name);
    if (matchValue != null) {
        if (matchValue.Val <= 0) {
            const b_1 = matchValue;
            return [bpool, pool, false];
        }
        else {
            const b_2 = matchValue;
            const b$0027 = new BuildingState(b_2.Def, b_2.Val - 1, (b_2.On > (b_2.Val - 1)) ? (b_2.Val - 1) : b_2.On, b_2.Unlocked, b_2.Unlockable, b_2.Stage);
            const bpool$0027 = new BldPool(bpool.Order, add(name, b$0027, bpool.ByName));
            let pool$0027 = pool;
            const enumerator = getEnumerator(getPrices(cache, pctx, b$0027));
            try {
                while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                    let matchValue_1;
                    const p = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    if ((matchValue_1 = get$_1(pool$0027, p.Resource), (matchValue_1 == null) ? false : !matchValue_1.Def.IsNotRefundable)) {
                        const patternInput = addResEvent(calendarDay, p.Resource, p.Val * refundPercentage, pool$0027);
                        pool$0027 = patternInput[0];
                    }
                }
            }
            finally {
                disposeSafe(enumerator);
            }
            return [bpool$0027, pool$0027, true];
        }
    }
    else {
        return [bpool, pool, false];
    }
}

/**
 * orig build(): buy up to n while affordable; increments val (and on for
 * non-togglable). Returns how many were built.
 */
export function build(calendarDay, cache, pctx, pool, n, name, bpool) {
    let ByName, table;
    let bpool_1 = bpool;
    let b = FSharpMap__get_Item(bpool_1.ByName, name);
    let pool_1 = pool;
    let built = 0;
    let maxBld = n;
    const matchValue = b.Def.LimitBuild;
    let matchResult, limit_1;
    if (matchValue != null) {
        if ((matchValue - b.Val) < maxBld) {
            matchResult = 0;
            limit_1 = matchValue;
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
            maxBld = (~~(limit_1 - b.Val) | 0);
            break;
        }
    }
    let afford = true;
    while ((built < maxBld) && afford) {
        const prices = getAllPrices(cache, pctx, b);
        if (hasRes(pool_1, map((p) => [p.Resource, p.Val], prices), 0)) {
            const poolPaid = payPrices(calendarDay, pool_1, map((p_1) => [p_1.Resource, p_1.Val], prices));
            pool_1 = poolPaid;
            let b$0027;
            const Val = (b.Val + 1) | 0;
            const On = (b.Def.TogglableOnOff ? b.On : (b.On + 1)) | 0;
            b$0027 = (new BuildingState(b.Def, Val, On, b.Unlocked, b.Unlockable, b.Stage));
            b = b$0027;
            built = ((built + 1) | 0);
        }
        else {
            afford = false;
        }
    }
    if (built > 0) {
    }
    bpool_1 = ((ByName = ((table = bpool_1.ByName, add(name, b, table))), new BldPool(bpool_1.Order, ByName)));
    return [bpool_1, pool_1, built];
}

export function activeEffects(b) {
    if (length(b.Def.Stages) > 0) {
        const st = item(min(b.Stage, length(b.Def.Stages) - 1), b.Def.Stages);
        if (!FSharpMap__get_IsEmpty(st.Effects)) {
            return st.Effects;
        }
        else {
            return b.Def.Effects;
        }
    }
    else {
        return b.Def.Effects;
    }
}

/**
 * orig bld.update(): flip `unlocked` per-tick from the unlockRatio rule
 * (isUnlockable + every price at unlockRatio coverage); un-flip if patched off.
 */
export function update(pool, bpool) {
    let bpool_1 = bpool;
    const enumerator = getEnumerator(bpool_1.Order);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let ByName, ByName_1;
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const b = FSharpMap__get_Item(bpool_1.ByName, name);
            if (!b.Unlocked) {
                if (isUnlocked(pool, b)) {
                    bpool_1 = ((ByName = add(name, new BuildingState(b.Def, b.Val, b.On, true, b.Unlockable, b.Stage), bpool_1.ByName), new BldPool(bpool_1.Order, ByName)));
                }
            }
            else if (!isUnlockable(b)) {
                bpool_1 = ((ByName_1 = add(name, new BuildingState(b.Def, b.Val, b.On, false, b.Unlockable, b.Stage), bpool_1.ByName), new BldPool(bpool_1.Order, ByName_1)));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return bpool_1;
}

