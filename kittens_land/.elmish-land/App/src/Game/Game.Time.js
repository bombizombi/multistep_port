
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { unit_type, lambda_type, list_type, record_type, class_type, string_type, option_type, float64_type, bool_type, int32_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { forAll, choose, append, map, find } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { voidUpgradeDefs, vsuDefs, cfuDefs } from "./Game.Catalog.World.js";
import { map as map_1, tryFind, add, FSharpMap__get_Item, ofList, empty } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { disposeSafe, getEnumerator, equals, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { getLimitedDR, jsRound } from "./Game.Math.js";
import { min, max } from "../../fable_modules/fable-library-js.5.17.0/Double.js";
import { get$, addResEvent } from "./Game.Resources.js";
import { defaultArg } from "../../fable_modules/fable-library-js.5.17.0/Option.js";
import { ManagerGroup } from "./Game.Effects.js";

export class TimeMeta extends Record {
    constructor(Val, On, Unlocked, Researched, Heat, DelayTicks, IsAutomationEnabled, Eff, PriceRatioDyn) {
        super();
        this.Val = (Val | 0);
        this.On = (On | 0);
        this.Unlocked = Unlocked;
        this.Researched = Researched;
        this.Heat = Heat;
        this.DelayTicks = (DelayTicks | 0);
        this.IsAutomationEnabled = IsAutomationEnabled;
        this.Eff = Eff;
        this.PriceRatioDyn = PriceRatioDyn;
    }
}

export function TimeMeta_$reflection() {
    return record_type("Game.Time.TimeMeta", [], TimeMeta, () => [["Val", int32_type], ["On", int32_type], ["Unlocked", bool_type], ["Researched", bool_type], ["Heat", float64_type], ["DelayTicks", int32_type], ["IsAutomationEnabled", option_type(bool_type)], ["Eff", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatioDyn", float64_type]]);
}

export class TimePool extends Record {
    constructor(Flux, Heat, IsAccelerated, TestShatter, CFUs, CfuOrder, VSUs, VsuOrder) {
        super();
        this.Flux = Flux;
        this.Heat = Heat;
        this.IsAccelerated = IsAccelerated;
        this.TestShatter = (TestShatter | 0);
        this.CFUs = CFUs;
        this.CfuOrder = CfuOrder;
        this.VSUs = VSUs;
        this.VsuOrder = VsuOrder;
    }
}

export function TimePool_$reflection() {
    return record_type("Game.Time.TimePool", [], TimePool, () => [["Flux", float64_type], ["Heat", float64_type], ["IsAccelerated", bool_type], ["TestShatter", int32_type], ["CFUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, TimeMeta_$reflection()])], ["CfuOrder", list_type(string_type)], ["VSUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, TimeMeta_$reflection()])], ["VsuOrder", list_type(string_type)]]);
}

function defEffects(name) {
    return find((d) => (d.Name === name), cfuDefs).Effects;
}

function vsuDefEffects(name) {
    return find((d) => (d.Name === name), vsuDefs).Effects;
}

function mkMeta(startUnlocked) {
    return new TimeMeta(0, 0, startUnlocked, false, 0, 0, undefined, empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), 0);
}

export function init() {
    return new TimePool(0, 0, false, 0, ofList(map((d_1) => {
        let d;
        return [d_1.Name, (d = d_1, new TimeMeta(0, 0, d.StartsUnlocked, false, 0, 0, undefined, d.Effects, d.PriceRatio))];
    }, cfuDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((d_2) => d_2.Name, cfuDefs), ofList(map((d_3) => {
        let bind$0040;
        return [d_3.Name, (bind$0040 = mkMeta(false), new TimeMeta(bind$0040.Val, bind$0040.On, bind$0040.Unlocked, bind$0040.Researched, bind$0040.Heat, bind$0040.DelayTicks, bind$0040.IsAutomationEnabled, d_3.Effects, bind$0040.PriceRatioDyn))];
    }, vsuDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), map((d_4) => d_4.Name, vsuDefs));
}

export function resetState(_tp) {
    return init();
}

export function getCFU(tp, name) {
    return FSharpMap__get_Item(tp.CFUs, name);
}

export function getVSU(tp, name) {
    return FSharpMap__get_Item(tp.VSUs, name);
}

export function updateCfu(tp, name, f) {
    return new TimePool(tp.Flux, tp.Heat, tp.IsAccelerated, tp.TestShatter, add(name, f(FSharpMap__get_Item(tp.CFUs, name)), tp.CFUs), tp.CfuOrder, tp.VSUs, tp.VsuOrder);
}

/**
 * Everything the CFU behavior defs read outside the time pool.
 * Mirrors the free variables of time.js calculateEffects/updateEffects.
 */
export class TimeCalcContext extends Record {
    constructor(GetEffect, Years1000On, BlazarVal, YearsPerCycle) {
        super();
        this.GetEffect = GetEffect;
        this.Years1000On = (Years1000On | 0);
        this.BlazarVal = (BlazarVal | 0);
        this.YearsPerCycle = (YearsPerCycle | 0);
    }
}

export function TimeCalcContext_$reflection() {
    return record_type("Game.Time.TimeCalcContext", [], TimeCalcContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Years1000On", int32_type], ["BlazarVal", int32_type], ["YearsPerCycle", int32_type]]);
}

/**
 * One meta's calculateEffects XOR updateEffects (game.upgrade semantics:
 * exactly one of the two runs per meta). Callers fan out via UpgradesCFU.
 */
export function cfuCalculate(ctx, name, tp) {
    let matchValue_2;
    switch (name) {
        case "blastFurnace":
            return updateCfu(tp, name, (m) => (new TimeMeta(m.Val, m.On, m.Unlocked, m.Researched, m.Heat, m.DelayTicks, m.IsAutomationEnabled, add("heatMax", 100 + ctx.GetEffect("heatMaxExpansion"), m.Eff), m.PriceRatioDyn)));
        case "controlledDelay":
            return updateCfu(tp, name, (m_1) => {
                let matchValue;
                return new TimeMeta(m_1.Val, m_1.On, m_1.Unlocked, m_1.Researched, m_1.Heat, m_1.DelayTicks, (matchValue = m_1.IsAutomationEnabled, (matchValue != null) && matchValue), m_1.Eff, m_1.PriceRatioDyn);
            });
        case "temporalAccelerator": {
            let auto;
            const matchValue_1 = FSharpMap__get_Item(tp.CFUs, name).IsAutomationEnabled;
            auto = ((matchValue_1 != null) ? matchValue_1 : (tp.TestShatter === 1));
            const tp_1 = updateCfu(tp, name, (m_2) => (new TimeMeta(m_2.Val, m_2.On, m_2.Unlocked, m_2.Researched, m_2.Heat, m_2.DelayTicks, auto, m_2.Eff, m_2.PriceRatioDyn)));
            return new TimePool(tp_1.Flux, tp_1.Heat, tp_1.IsAccelerated, equals(auto, true) ? 1 : 0, tp_1.CFUs, tp_1.CfuOrder, tp_1.VSUs, tp_1.VsuOrder);
        }
        case "temporalImpedance":
            return updateCfu(tp, name, (m_3) => (new TimeMeta(m_3.Val, m_3.On, m_3.Unlocked, m_3.Researched, m_3.Heat, m_3.DelayTicks, m_3.IsAutomationEnabled, add("timeImpedance", jsRound(1000 * (1 + ctx.GetEffect("timeRatio"))), m_3.Eff), m_3.PriceRatioDyn)));
        case "temporalPress": {
            const press = FSharpMap__get_Item(tp.CFUs, name);
            const pressAuto = ((ctx.Years1000On > 1) ? true : (ctx.BlazarVal > 2)) ? ((matchValue_2 = press.IsAutomationEnabled, (matchValue_2 != null) && matchValue_2)) : undefined;
            const yearsPerCycle = ctx.YearsPerCycle;
            return updateCfu(tp, name, (m_4) => (new TimeMeta(m_4.Val, m_4.On, m_4.Unlocked, m_4.Researched, m_4.Heat, m_4.DelayTicks, pressAuto, add("shatterYearBoost", equals(pressAuto, true) ? (5 * yearsPerCycle) : yearsPerCycle, m_4.Eff), max(1.01, 1.1 - (ctx.Years1000On * 0.001)))));
        }
        case "timeBoiler":
            return updateCfu(tp, name, (m_5) => (new TimeMeta(m_5.Val, m_5.On, m_5.Unlocked, m_5.Researched, m_5.Heat, m_5.DelayTicks, m_5.IsAutomationEnabled, add("energyConsumption", m_5.On, add("heatMaxExpansion", 10 * m_5.On, m_5.Eff)), m_5.PriceRatioDyn)));
        default:
            return tp;
    }
}

/**
 * Everything the per-tick time.update reads beyond the pools. Shatter is the
 * runner orchestration (time-07): furnace automation + manual paths land there.
 */
export class TimeUpdateContext extends Record {
    constructor(GetEffect, Shatter, GetTpool, SetTpool) {
        super();
        this.GetEffect = GetEffect;
        this.Shatter = Shatter;
        this.GetTpool = GetTpool;
        this.SetTpool = SetTpool;
    }
}

export function TimeUpdateContext_$reflection() {
    return record_type("Game.Time.TimeUpdateContext", [], TimeUpdateContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Shatter", lambda_type(int32_type, unit_type)], ["GetTpool", lambda_type(unit_type, TimePool_$reflection())], ["SetTpool", lambda_type(TimePool_$reflection(), unit_type)]]);
}

/**
 * orig gainTemporalFlux (L106-131): calendar tech gate; delta ms from the
 * harness clock; 5 flux/minute × (1 + accelerator timeRatio × val).
 */
export function gainTemporalFlux(tp, calendarResearched, nowMs, timestampMs, ticksPerSecond, pool) {
    if (!calendarResearched) {
        return [tp, pool];
    }
    else {
        const delta = nowMs - timestampMs;
        if (delta <= 0) {
            return [tp, pool];
        }
        else {
            return [tp, addResEvent(0, "temporalFlux", jsRound((delta / (60 * 1000)) * (ticksPerSecond * (1 + (FSharpMap__get_Item(tp.CFUs, "temporalAccelerator").Val * defaultArg(tryFind("timeRatio", defEffects("temporalAccelerator")), 0))))), pool)[0]];
        }
    }
}

/**
 * orig time.update (L152-178): flux burn, heat transfer into the blast
 * furnace, then every CFU with an .action — blastFurnace (delay gate,
 * automation shatter at 100 heat, cap 5 or shatterYearBoost) and timeBoiler
 * (updateEffects). calculateRedshift is a no-op here (opts.enableRedshift is
 * false; the timestamp bookkeeping keeps gainTemporalFlux semantics).
 * The pool travels in a ref: ctx.Shatter (the runner's shatterCore) mutates
 * the same TimePool instance mid-update (flux/testShatter/CFU unlocks), so a
 * by-value copy would clobber it on return.
 */
export function update(ctx, pool) {
    let option_1, Heat_1;
    let pool_1 = pool;
    let tp = ctx.GetTpool();
    const commit = () => {
        ctx.SetTpool(tp);
    };
    const fluxValue = defaultArg((option_1 = get$(pool_1, "temporalFlux"), (option_1 != null) ? option_1.Value : undefined), 0);
    if (tp.IsAccelerated && (fluxValue > 0)) {
        const patternInput = addResEvent(0, "temporalFlux", -1, pool_1);
        pool_1 = patternInput[0];
    }
    if ((fluxValue === 0) && tp.IsAccelerated) {
        tp = (new TimePool(tp.Flux, tp.Heat, false, tp.TestShatter, tp.CFUs, tp.CfuOrder, tp.VSUs, tp.VsuOrder));
        commit();
    }
    if (tp.Heat > 0) {
        const perTick = min(ctx.GetEffect("heatPerTick"), tp.Heat);
        const efficiency = 1 + ctx.GetEffect("heatEfficiency");
        tp = updateCfu(tp, "blastFurnace", (m) => (new TimeMeta(m.Val, m.On, m.Unlocked, m.Researched, m.Heat + (perTick * efficiency), m.DelayTicks, m.IsAutomationEnabled, m.Eff, m.PriceRatioDyn)));
        tp = ((Heat_1 = max(0, tp.Heat - perTick), new TimePool(tp.Flux, Heat_1, tp.IsAccelerated, tp.TestShatter, tp.CFUs, tp.CfuOrder, tp.VSUs, tp.VsuOrder)));
        commit();
    }
    const enumerator = getEnumerator(ctx.GetTpool().CfuOrder);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            if ((name === "blastFurnace") ? true : (name === "timeBoiler")) {
                tp = ctx.GetTpool();
                if (name === "blastFurnace") {
                    tp = updateCfu(tp, "blastFurnace", (m_1) => {
                        const Eff = add("heatMax", 100 + ctx.GetEffect("heatMaxExpansion"), m_1.Eff);
                        let IsAutomationEnabled;
                        const matchValue = m_1.IsAutomationEnabled;
                        IsAutomationEnabled = ((matchValue != null) && matchValue);
                        return new TimeMeta(m_1.Val, (m_1.On < m_1.Val) ? m_1.Val : m_1.On, m_1.Unlocked, m_1.Researched, m_1.Heat, m_1.DelayTicks, IsAutomationEnabled, Eff, m_1.PriceRatioDyn);
                    });
                    commit();
                    const furnace = FSharpMap__get_Item(tp.CFUs, "blastFurnace");
                    if (FSharpMap__get_Item(tp.CFUs, "controlledDelay").DelayTicks > 0) {
                        tp = updateCfu(tp, "controlledDelay", (m_2) => (new TimeMeta(m_2.Val, m_2.On, m_2.Unlocked, m_2.Researched, m_2.Heat, m_2.DelayTicks - 1, m_2.IsAutomationEnabled, m_2.Eff, m_2.PriceRatioDyn)));
                        commit();
                    }
                    else if (((furnace.On !== 0) && equals(furnace.IsAutomationEnabled, true)) && (furnace.Heat >= 100)) {
                        let limit = 5;
                        if (equals(FSharpMap__get_Item(tp.CFUs, "temporalPress").IsAutomationEnabled, true) && (tp.TestShatter === 1)) {
                            limit = max(limit, ctx.GetEffect("shatterYearBoost"));
                        }
                        let amt = Math.floor(furnace.Heat / 100);
                        if (amt > limit) {
                            amt = limit;
                        }
                        tp = updateCfu(tp, "blastFurnace", (m_3) => (new TimeMeta(m_3.Val, m_3.On, m_3.Unlocked, m_3.Researched, m_3.Heat - (100 * amt), m_3.DelayTicks, m_3.IsAutomationEnabled, m_3.Eff, m_3.PriceRatioDyn)));
                        tp = updateCfu(tp, "controlledDelay", (m_4) => (new TimeMeta(m_4.Val, m_4.On, m_4.Unlocked, m_4.Researched, m_4.Heat, m_4.On, m_4.IsAutomationEnabled, m_4.Eff, m_4.PriceRatioDyn)));
                        commit();
                        ctx.Shatter(~~amt);
                    }
                }
                else {
                    tp = updateCfu(tp, "timeBoiler", (m_5) => (new TimeMeta(m_5.Val, m_5.On, m_5.Unlocked, m_5.Researched, m_5.Heat, m_5.DelayTicks, m_5.IsAutomationEnabled, add("energyConsumption", m_5.On, add("heatMaxExpansion", 10 * m_5.On, m_5.Eff)), m_5.PriceRatioDyn)));
                    commit();
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return pool_1;
}

/**
 * orig time.js CFU provider (L26-32): CFU effects count only with the
 * chronoforge workshop tech researched; else ×on (stackable) raw. Reads the
 * DYNAMIC effects tables (calculate/updateEffects mutated them).
 */
export function timeGroup(tp, chronoforgeResearched) {
    return new ManagerGroup(empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), append(choose((n) => {
        const m = FSharpMap__get_Item(tp.CFUs, n);
        if ((m.On > 0) && chronoforgeResearched) {
            return [m.Eff, (_arg) => ((v) => (v * m.On))];
        }
        else {
            return undefined;
        }
    }, tp.CfuOrder), choose((n_1) => {
        const m_1 = FSharpMap__get_Item(tp.VSUs, n_1);
        if (m_1.On > 0) {
            return [find((d) => (d.Name === n_1), vsuDefs).Effects, (_arg_1) => ((v_1) => (v_1 * m_1.On))];
        }
        else {
            return undefined;
        }
    }, tp.VsuOrder)));
}

export function cfuDef(name) {
    return find((d) => (d.Name === name), cfuDefs);
}

/**
 * BuildingStackableBtnController.getPrices: base × ratio^val with the
 * meta-level and per-resource CostReduction LDR discounts.
 */
export function cfuPrices(tp, getEffect, name) {
    const def = cfuDef(name);
    const meta = FSharpMap__get_Item(tp.CFUs, name);
    const priceModifier = 1 - getLimitedDR(getEffect(def.Name + "CostReduction"), 1);
    return map((p) => {
        const resPriceModifier = 1 - getLimitedDR(getEffect(p.Resource + "CostReduction"), 1);
        return [p.Resource, ((p.Val * Math.pow(meta.PriceRatioDyn, meta.Val)) * resPriceModifier) * priceModifier];
    }, def.Prices);
}

export function cfuHasRes(pool, prices) {
    return forAll((tupledArg) => {
        const matchValue = get$(pool, tupledArg[0]);
        if (matchValue == null) {
            return false;
        }
        else {
            return matchValue.Value >= tupledArg[1];
        }
    }, prices);
}

export function cfuEnabled(tp, name) {
    const def = cfuDef(name);
    const meta = FSharpMap__get_Item(tp.CFUs, name);
    const matchValue = def.LimitBuild;
    let matchResult, lb_1;
    if (matchValue != null) {
        if (matchValue <= meta.Val) {
            matchResult = 0;
            lb_1 = matchValue;
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
            return false;
        default:
            return true;
    }
}

/**
 * ChronoforgeBtnController.build(model, maxBld) loop: incrementValue +
 * payPrice while affordable. Returns the pool, the updated time pool and the
 * counter.
 */
export function buyCFU(getEffect, calendarDay, name, maxBld, tp, pool) {
    let tp_1 = tp;
    let pool_1 = pool;
    let counter = 0;
    let maxBld_1 = maxBld;
    const matchValue = cfuDef(name).LimitBuild;
    let matchResult, lb_1;
    if (matchValue != null) {
        if ((matchValue - FSharpMap__get_Item(tp_1.CFUs, name).Val) < maxBld_1) {
            matchResult = 0;
            lb_1 = matchValue;
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
            maxBld_1 = ((lb_1 - FSharpMap__get_Item(tp_1.CFUs, name).Val) | 0);
            break;
        }
    }
    let prices_1 = cfuPrices(tp_1, getEffect, name);
    while ((maxBld_1 > 0) && cfuHasRes(pool_1, prices_1)) {
        tp_1 = updateCfu(tp_1, name, (m) => (new TimeMeta(m.Val + 1, m.On + 1, m.Unlocked, m.Researched, m.Heat, m.DelayTicks, m.IsAutomationEnabled, m.Eff, m.PriceRatioDyn)));
        const enumerator = getEnumerator(prices_1);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResEvent(calendarDay, forLoopVar[0], -forLoopVar[1], pool_1);
                pool_1 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        counter = ((counter + 1) | 0);
        maxBld_1 = ((maxBld_1 - 1) | 0);
        prices_1 = cfuPrices(tp_1, getEffect, name);
    }
    return [tp_1, pool_1, counter];
}

/**
 * time.undo buildCFU: sellInternal(model, val - data.val, false) with
 * refundPercentage 1.0 — decrement then refund the ladder at the new val.
 * isRefundable defaults true (no CFU price lands on antimatter/karma seams).
 */
export function sellCFU(getEffect, calendarDay, name, endVal, tp, pool) {
    let tp_1 = tp;
    let pool_1 = pool;
    let counter = 0;
    while (FSharpMap__get_Item(tp_1.CFUs, name).Val > endVal) {
        tp_1 = updateCfu(tp_1, name, (m) => (new TimeMeta(m.Val - 1, (m.On > (m.Val - 1)) ? (m.Val - 1) : m.On, m.Unlocked, m.Researched, m.Heat, m.DelayTicks, m.IsAutomationEnabled, m.Eff, m.PriceRatioDyn)));
        const enumerator = getEnumerator(cfuPrices(tp_1, getEffect, name));
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResEvent(calendarDay, forLoopVar[0], forLoopVar[1], pool_1);
                pool_1 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        counter = ((counter + 1) | 0);
    }
    return [tp_1, pool_1, counter];
}

/**
 * time.unlockAll (dev helper): every CFU unlocked.
 */
export function unlockAll(tp) {
    return new TimePool(tp.Flux, tp.Heat, tp.IsAccelerated, tp.TestShatter, map_1((_arg, m) => (new TimeMeta(m.Val, m.On, true, m.Researched, m.Heat, m.DelayTicks, m.IsAutomationEnabled, m.Eff, m.PriceRatioDyn)), tp.CFUs), tp.CfuOrder, tp.VSUs, tp.VsuOrder);
}

export function vsuDef(name) {
    return find((d) => (d.Name === name), vsuDefs);
}

/**
 * VoidSpaceBtnController.getPrices: stackable ladder; cryochambers takes the
 * karma discount 1 − LDR(0.01 × burnedParagonRatio, 1).
 */
export function vsuPrices(tp, burnedParagonRatio, name) {
    const def = vsuDef(name);
    const meta = FSharpMap__get_Item(tp.VSUs, name);
    const ratio = defaultArg(def.PriceRatio, 1);
    return map((p) => {
        const v = p.Val * Math.pow(ratio, meta.Val);
        if ((name === "cryochambers") && (p.Resource === "karma")) {
            return [p.Resource, v - (v * getLimitedDR(0.01 * burnedParagonRatio, 1))];
        }
        else {
            return [p.Resource, v];
        }
    }, def.Prices);
}

/**
 * VoidSpaceBtnController.build(model, maxBld) loop (same pay-cache-recompute
 * order as the CFU ladder).
 */
export function buyVSU(calendarDay, name, maxBld, burnedParagonRatio, tp, pool) {
    let tp_1 = tp;
    let pool_1 = pool;
    let counter = 0;
    let maxBld_1 = maxBld;
    let prices = vsuPrices(tp_1, burnedParagonRatio, name);
    while ((maxBld_1 > 0) && cfuHasRes(pool_1, prices)) {
        let VSUs, table, bind$0040;
        tp_1 = ((VSUs = ((table = tp_1.VSUs, add(name, (bind$0040 = FSharpMap__get_Item(tp_1.VSUs, name), new TimeMeta(FSharpMap__get_Item(tp_1.VSUs, name).Val + 1, FSharpMap__get_Item(tp_1.VSUs, name).On + 1, bind$0040.Unlocked, bind$0040.Researched, bind$0040.Heat, bind$0040.DelayTicks, bind$0040.IsAutomationEnabled, bind$0040.Eff, bind$0040.PriceRatioDyn)), table))), new TimePool(tp_1.Flux, tp_1.Heat, tp_1.IsAccelerated, tp_1.TestShatter, tp_1.CFUs, tp_1.CfuOrder, VSUs, tp_1.VsuOrder)));
        const enumerator = getEnumerator(prices);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResEvent(calendarDay, forLoopVar[0], -forLoopVar[1], pool_1);
                pool_1 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        counter = ((counter + 1) | 0);
        maxBld_1 = ((maxBld_1 - 1) | 0);
        prices = vsuPrices(tp_1, burnedParagonRatio, name);
    }
    return [tp_1, pool_1, counter];
}

/**
 * time.undo buildVSU: full-refund sellInternal at the re-derived ladder.
 */
export function sellVSU(calendarDay, name, endVal, burnedParagonRatio, tp, pool) {
    let tp_1 = tp;
    let pool_1 = pool;
    let counter = 0;
    while (FSharpMap__get_Item(tp_1.VSUs, name).Val > endVal) {
        let VSUs, table, bind$0040;
        tp_1 = ((VSUs = ((table = tp_1.VSUs, add(name, (bind$0040 = FSharpMap__get_Item(tp_1.VSUs, name), new TimeMeta(FSharpMap__get_Item(tp_1.VSUs, name).Val - 1, (FSharpMap__get_Item(tp_1.VSUs, name).On > (FSharpMap__get_Item(tp_1.VSUs, name).Val - 1)) ? (FSharpMap__get_Item(tp_1.VSUs, name).Val - 1) : FSharpMap__get_Item(tp_1.VSUs, name).On, bind$0040.Unlocked, bind$0040.Researched, bind$0040.Heat, bind$0040.DelayTicks, bind$0040.IsAutomationEnabled, bind$0040.Eff, bind$0040.PriceRatioDyn)), table))), new TimePool(tp_1.Flux, tp_1.Heat, tp_1.IsAccelerated, tp_1.TestShatter, tp_1.CFUs, tp_1.CfuOrder, VSUs, tp_1.VsuOrder)));
        const enumerator = getEnumerator(vsuPrices(tp_1, burnedParagonRatio, name));
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResEvent(calendarDay, forLoopVar[0], forLoopVar[1], pool_1);
                pool_1 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        counter = ((counter + 1) | 0);
    }
    return [tp_1, pool_1, counter];
}

/**
 * VSU calculateEffects (calculateAllEffects voidSpace pass).
 * cryochambers: limitBuild = chronosphere.on + cryochamberSupport; on =
 * min(val, limitBuild). chronocontrol: temporalParadoxDay = 1 + bonus.
 */
export function vsuCalculate(tp, chronosphereOn, getEffect) {
    const cryo = FSharpMap__get_Item(tp.VSUs, "cryochambers");
    const tp_1 = new TimePool(tp.Flux, tp.Heat, tp.IsAccelerated, tp.TestShatter, tp.CFUs, tp.CfuOrder, add("cryochambers", new TimeMeta(cryo.Val, min(cryo.Val, chronosphereOn + ~~getEffect("cryochamberSupport")), cryo.Unlocked, cryo.Researched, cryo.Heat, cryo.DelayTicks, cryo.IsAutomationEnabled, cryo.Eff, cryo.PriceRatioDyn), tp.VSUs), tp.VsuOrder);
    const ctrl = FSharpMap__get_Item(tp_1.VSUs, "chronocontrol");
    return new TimePool(tp_1.Flux, tp_1.Heat, tp_1.IsAccelerated, tp_1.TestShatter, tp_1.CFUs, tp_1.CfuOrder, add("chronocontrol", new TimeMeta(ctrl.Val, ctrl.On, ctrl.Unlocked, ctrl.Researched, ctrl.Heat, ctrl.DelayTicks, ctrl.IsAutomationEnabled, add("temporalParadoxDay", 1 + getEffect("temporalParadoxDayBonus"), ctrl.Eff), ctrl.PriceRatioDyn), tp_1.VSUs), tp_1.VsuOrder);
}

/**
 * Everything doShatter needs outside the pools (badges/void live runner-side).
 */
export class DoShatterContext extends Record {
    constructor(GetEffect, Years1000Researched) {
        super();
        this.GetEffect = GetEffect;
        this.Years1000Researched = Years1000Researched;
    }
}

export function DoShatterContext_$reflection() {
    return record_type("Game.Time.DoShatterContext", [], DoShatterContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Years1000Researched", bool_type]]);
}

/**
 * doShatter heat accounting: 10 heat per year (5 with 1000Years researched),
 * split between time.heat and the furnace by heatCompression, the furnace
 * share already scaled by heatEfficiency. Returns the updated time pool.
 */
export function doShatterHeat(ctx, amt, tp) {
    let Heat, Heat_2;
    const factor = ctx.Years1000Researched ? 5 : 10;
    const compression = 1 - (1 / (1 + ctx.GetEffect("heatCompression")));
    let tp_1 = tp;
    if (compression !== 0) {
        const efficiency = 1 + ctx.GetEffect("heatEfficiency");
        tp_1 = ((Heat = (tp_1.Heat + ((amt * factor) * (1 - compression))), new TimePool(tp_1.Flux, Heat, tp_1.IsAccelerated, tp_1.TestShatter, tp_1.CFUs, tp_1.CfuOrder, tp_1.VSUs, tp_1.VsuOrder)));
        tp_1 = updateCfu(tp_1, "blastFurnace", (m) => (new TimeMeta(m.Val, m.On, m.Unlocked, m.Researched, m.Heat + (((amt * factor) * compression) * efficiency), m.DelayTicks, m.IsAutomationEnabled, m.Eff, m.PriceRatioDyn)));
    }
    else {
        tp_1 = ((Heat_2 = (tp_1.Heat + (amt * factor)), new TimePool(tp_1.Flux, Heat_2, tp_1.IsAccelerated, tp_1.TestShatter, tp_1.CFUs, tp_1.CfuOrder, tp_1.VSUs, tp_1.VsuOrder)));
    }
    return tp_1;
}

export class VoidPool extends Record {
    constructor(VUs, VuOrder, Faction) {
        super();
        this.VUs = VUs;
        this.VuOrder = VuOrder;
        this.Faction = Faction;
    }
}

export function VoidPool_$reflection() {
    return record_type("Game.Time.VoidPool", [], VoidPool, () => [["VUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, TimeMeta_$reflection()])], ["VuOrder", list_type(string_type)], ["Faction", option_type(string_type)]]);
}

export function initVoid() {
    return new VoidPool(ofList(map((d) => {
        let bind$0040;
        return [d.Name, (bind$0040 = mkMeta(false), new TimeMeta(bind$0040.Val, bind$0040.On, bind$0040.Unlocked, bind$0040.Researched, bind$0040.Heat, bind$0040.DelayTicks, bind$0040.IsAutomationEnabled, empty({
            Compare: (x, y) => (comparePrimitives(x, y) | 0),
        }), bind$0040.PriceRatioDyn))];
    }, voidUpgradeDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), map((d_1) => d_1.Name, voidUpgradeDefs), undefined);
}

export function resetVoid(_vp) {
    return initVoid();
}

export function getVU(vp, name) {
    return FSharpMap__get_Item(vp.VUs, name);
}

export function voidGroup(vp) {
    return new ManagerGroup(empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), choose((n) => {
        const m = FSharpMap__get_Item(vp.VUs, n);
        if (m.On > 0) {
            return [empty({
                Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
            }), (_arg) => ((v) => (v * m.On))];
        }
        else {
            return undefined;
        }
    }, vp.VuOrder));
}

