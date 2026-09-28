
import { empty, map as map_1, add, FSharpMap__get_Item, toList, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { choose, forAll, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { ResPool, ResourceState } from "./Game.Types.fs.js";
import { equals, disposeSafe, getEnumerator, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { max, min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { uniformRandomInteger, getLimitedDR, jsOr0, getUnlimitedDR, getInverseUnlimitedDR, jsRound } from "./Game.Math.fs.js";
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, int32_type, bool_type, lambda_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { baseEffects } from "./Game.Catalog.BaseEffects.fs.js";

/**
 * orig constructor: clone resourceData, value = 0, unlocked = false, no cap set.
 * (setVillage is deferred until the village manager exists — resources-02 note.)
 */
export function init(defs) {
    const byName = ofList(map((d) => [d.Name, new ResourceState(d, 0, false, 0, 0)], defs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    return new ResPool(map((d_1) => d_1.Name, defs), byName, 0, 0, 0, 0);
}

/**
 * orig get(): the resource or None (orig returns false).
 */
export function get$(pool, name) {
    return tryFind(name, pool.ByName);
}

/**
 * orig resPool.reset(): fresh pool from the same catalog.
 */
export function reset(pool) {
    return init(map((tupledArg) => tupledArg[1].Def, toList(pool.ByName)));
}

/**
 * orig addRes(res, addedValue, allowDuringParadoxes, preventLimitCheck).
 * calendarDay is game.calendar.day (owned by calendar-01; threaded in until then).
 * Returns the updated pool and the actual delta (orig's return value).
 */
export function addRes(calendarDay, addedValue, allowDuringParadoxes, preventLimitCheck, name, pool) {
    if (((calendarDay < 0) && !allowDuringParadoxes) ? true : (addedValue === 0)) {
        return [pool, 0];
    }
    else {
        const res = FSharpMap__get_Item(pool.ByName, name);
        const prevValue = res.Value;
        const v1 = min(prevValue + addedValue, 1.7976931348623157E+308);
        const v2 = preventLimitCheck ? v1 : min(v1, max(prevValue, (res.MaxValue !== 0) ? res.MaxValue : 1.7976931348623157E+308));
        const v3 = (name === "void") ? Math.floor(v2) : v2;
        const v4 = (Number.isNaN(v3) ? true : (v3 < 1E-10)) ? 0 : v3;
        let patternInput;
        if (name === "karma") {
            const kk = ~~jsRound(getInverseUnlimitedDR(v4, 5)) | 0;
            patternInput = [getUnlimitedDR(kk, 5), kk];
        }
        else {
            patternInput = [v4, pool.KarmaKittens];
        }
        const v5 = patternInput[0];
        return [new ResPool(pool.Order, add(name, new ResourceState(res.Def, v5, res.Unlocked, res.MaxValue, res.PerTickCached), pool.ByName), patternInput[1], pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons), (v5 === (prevValue + addedValue)) ? addedValue : (v5 - prevValue)];
    }
}

/**
 * orig addResPerTick(name, value): paradox-gated (allowDuringParadoxes = false).
 */
export function addResPerTick(calendarDay, name, value, pool) {
    return addRes(calendarDay, value, false, false, name, pool);
}

/**
 * orig addResEvent(name, value): allowed during paradoxes.
 */
export function addResEvent(calendarDay, name, value, pool) {
    return addRes(calendarDay, value, true, false, name, pool);
}

export function getAmtDependsOnStock(calendarDay, fromSpec, amt, pool) {
    if (amt === 0) {
        return [pool, 0];
    }
    else {
        let amt$0027 = amt;
        const enumerator = getEnumerator(fromSpec);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const perUnit = forLoopVar[1];
                const resAvailable = FSharpMap__get_Item(pool.ByName, forLoopVar[0]).Value;
                if (resAvailable < (perUnit * amt$0027)) {
                    const amtAvailable = resAvailable / perUnit;
                    amt$0027 = min(amt$0027, amtAvailable);
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        let pool$0027 = pool;
        const enumerator_1 = getEnumerator(fromSpec);
        try {
            while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResPerTick(calendarDay, forLoopVar_1[0], -forLoopVar_1[1] * amt$0027, pool$0027);
                pool$0027 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator_1);
        }
        return [pool$0027, amt$0027 / amt];
    }
}

/**
 * Dependency seam until the real subsystems land (game-08 effects cache,
 * prestige-01, challenges, workshop). The runner builds this from its LIVE
 * effects cache; at tick 0 the cache is empty, which reproduces the
 * zero-cap state verified by the unit-res-caps fixture.
 */
export class CapContext extends Record {
    constructor(GetEffect, ParagonStorageRatio, CMBRBonus, UnicornTearsActive, SilosResearched, KarmaZebras) {
        super();
        this.GetEffect = GetEffect;
        this.ParagonStorageRatio = ParagonStorageRatio;
        this.CMBRBonus = CMBRBonus;
        this.UnicornTearsActive = UnicornTearsActive;
        this.SilosResearched = SilosResearched;
        this.KarmaZebras = (KarmaZebras | 0);
    }
}

export function CapContext_$reflection() {
    return record_type("Game.Resources.CapContext", [], CapContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["ParagonStorageRatio", float64_type], ["CMBRBonus", float64_type], ["UnicornTearsActive", bool_type], ["SilosResearched", bool_type], ["KarmaZebras", int32_type]]);
}

export function isNormalCraftableResource(res) {
    if (res.Def.Craftable) {
        return res.Def.Name !== "wood";
    }
    else {
        return false;
    }
}

/**
 * orig addResMaxRatios(res, maxValue) — global ratio chain, exact order.
 */
export function addResMaxRatios(ctx, res, maxValue) {
    const name = res.Def.Name;
    if ((name === "temporalFlux") ? true : (name === "zebras")) {
        return maxValue;
    }
    else {
        let m = maxValue;
        if (ctx.UnicornTearsActive && (((name === "unicorns") ? true : (name === "tears")) ? true : (name === "alicorn"))) {
            m = (m * (1 + ctx.GetEffect(name + "MaxRatio")));
            return m;
        }
        else {
            m = (m * (1 + ctx.ParagonStorageRatio));
            m = (m * (1 + ctx.CMBRBonus));
            m = (m * (1 + ctx.GetEffect(name + "MaxRatio")));
            if (!isNormalCraftableResource(res) && !res.Def.Transient) {
                m = (m * (1 + ctx.GetEffect("globalResourceRatio")));
            }
            if (!isNormalCraftableResource(res) && !res.Def.Transient) {
                m = (m * (1 + ctx.GetEffect("pyramidGlobalResourceRatio")));
            }
            if (equals(res.Def.Tag, "baseMetal")) {
                m = (m * (1 + ctx.GetEffect("baseMetalMaxRatio")));
            }
            if (name === "science") {
                m = (m * (1 + ctx.GetEffect("technocracyScienceCap")));
            }
            if (name === "culture") {
                m = (m * (1 + ctx.GetEffect("onAHillCultureCap")));
            }
            return m;
        }
    }
}

/**
 * orig addBarnWarehouseRatio(effects) — barn/warehouse multipliers over an
 * effect map (used by tooltips/building effects; ported for unit completeness).
 */
export function addBarnWarehouseRatio(ctx, effects) {
    const barnRatio = ctx.GetEffect("barnRatio");
    const warehouseRatio = 1 + ctx.GetEffect("warehouseRatio");
    return map_1((name, effect) => {
        let e = effect;
        if ((name === "catnipMax") && ctx.SilosResearched) {
            e = (e * (1 + (barnRatio * 0.25)));
        }
        if (((name === "woodMax") ? true : (name === "mineralsMax")) ? true : (name === "ironMax")) {
            e = (e * (1 + barnRatio));
            e = (e * warehouseRatio);
        }
        if (((name === "coalMax") ? true : (name === "titaniumMax")) ? true : (name === "goldMax")) {
            e = (e * warehouseRatio);
        }
        return e;
    }, effects);
}

/**
 * orig updateMaxValue(res) — sorrow/zebras specials + challenge branch.
 */
export function updateMaxValue(ctx, res) {
    let secondArg, matchValue;
    if (res.Def.Name === "sorrow") {
        const mv = 17 + ctx.GetEffect("blsLimit");
        return new ResourceState(res.Def, min(res.Value, mv), res.Unlocked, mv, res.PerTickCached);
    }
    else {
        let maxValue = jsOr0(ctx.GetEffect(res.Def.Name + "Max"));
        if (res.Def.Name === "zebras") {
            maxValue = ((maxValue + ctx.KarmaZebras) + 1);
        }
        const maxValue2 = min(addResMaxRatios(ctx, res, maxValue), 1.7976931348623157E+308);
        const challengeEffect = ctx.GetEffect(res.Def.Name + "MaxChallenge");
        return new ResourceState(res.Def, res.Value, res.Unlocked, max((challengeEffect !== 0) ? ((secondArg = jsOr0((matchValue = tryFind(res.Def.Name + "Max", baseEffects), (matchValue == null) ? ((maxValue2 - 1) - Number.NaN) : ((maxValue2 - 1) - matchValue))), maxValue2 + getLimitedDR(addResMaxRatios(ctx, res, challengeEffect), secondArg))) : maxValue2, 0), res.PerTickCached);
    }
}

export function updateMaxValueByName(ctx, resName, pool) {
    const matchValue = get$(pool, resName);
    if (matchValue == null) {
        return pool;
    }
    else {
        return new ResPool(pool.Order, add(resName, updateMaxValue(ctx, matchValue), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
    }
}

/**
 * orig updateMaxValueAll(): recompute every cap in resPool order.
 */
export function updateMaxValueAll(ctx, pool) {
    return new ResPool(pool.Order, map_1((_arg, res) => updateMaxValue(ctx, res), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
}

/**
 * Dependency seam for update(): production values come from game.getResourcePerTick
 * (game-10 slice — until then the runner injects an override map, mirroring how the
 * orig harness patches the method). Pasture/energy-loss terms are buildings-01;
 * at fresh state PastureOn = 0 makes EnergyLoss irrelevant.
 */
export class UpdateContext extends Record {
    constructor(Cap, GetResourcePerTick, CalendarSeason, PastureOn, EnergyLoss, EnergyChallengeResearched, EnergyChallengeActive) {
        super();
        this.Cap = Cap;
        this.GetResourcePerTick = GetResourcePerTick;
        this.CalendarSeason = (CalendarSeason | 0);
        this.PastureOn = (PastureOn | 0);
        this.EnergyLoss = EnergyLoss;
        this.EnergyChallengeResearched = EnergyChallengeResearched;
        this.EnergyChallengeActive = EnergyChallengeActive;
    }
}

export function UpdateContext_$reflection() {
    return record_type("Game.Resources.UpdateContext", [], UpdateContext, () => [["Cap", CapContext_$reflection()], ["GetResourcePerTick", lambda_type(string_type, float64_type)], ["CalendarSeason", int32_type], ["PastureOn", int32_type], ["EnergyLoss", float64_type], ["EnergyChallengeResearched", bool_type], ["EnergyChallengeActive", bool_type]]);
}

/**
 * orig updateKarma(): karma resource value tracks getUnlimitedDR(karmaKittens, 5).
 * The chapel/frescoes effect recalc on change needs religion/building managers —
 * at fresh the value never changes; wire the recalc when those units land.
 */
export function updateKarma(pool) {
    const karma = getUnlimitedDR(pool.KarmaKittens, 5);
    const res = FSharpMap__get_Item(pool.ByName, "karma");
    if (karma !== res.Value) {
        return new ResPool(pool.Order, add("karma", new ResourceState(res.Def, karma, res.Unlocked, res.MaxValue, res.PerTickCached), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
    }
    else {
        return pool;
    }
}

/**
 * orig resPool.update(): per resource — cap recompute, unlock flips, production
 * accrual; then karma; then energy accounting. Iterates in resPool order.
 */
export function update(uctx, calendarDay, pool) {
    let pool$0027 = pool;
    const enumerator = getEnumerator(pool$0027.Order);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let ByName;
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const res1 = updateMaxValue(uctx.Cap, FSharpMap__get_Item(pool$0027.ByName, name));
            if (name === "sorrow") {
                pool$0027 = ((ByName = add(name, res1, pool$0027.ByName), new ResPool(pool$0027.Order, ByName, pool$0027.KarmaKittens, pool$0027.EnergyProd, pool$0027.EnergyWinterProd, pool$0027.EnergyCons)));
            }
            else {
                let pool1;
                const ByName_1 = add(name, new ResourceState(res1.Def, res1.Value, (!res1.Unlocked && (res1.Value > 0)) ? true : ((((res1.Value === 0) && res1.Unlocked) && (((name === "zebras") ? true : (name === "paragon")) ? true : (name === "elderBox"))) ? false : res1.Unlocked), res1.MaxValue, res1.PerTickCached), pool$0027.ByName);
                pool1 = (new ResPool(pool$0027.Order, ByName_1, pool$0027.KarmaKittens, pool$0027.EnergyProd, pool$0027.EnergyWinterProd, pool$0027.EnergyCons));
                const patternInput = addResPerTick(calendarDay, name, uctx.GetResourcePerTick(name), pool1);
                pool$0027 = patternInput[0];
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const poolK = updateKarma(pool$0027);
    const energyProdRatio = 1 + uctx.Cap.GetEffect("energyProductionRatio");
    const energyProd = uctx.Cap.GetEffect("energyProduction") * energyProdRatio;
    const energyWinterProd0 = energyProd;
    const energyConsRatio = ((1 + uctx.Cap.GetEffect("energyConsumptionRatio")) + uctx.Cap.GetEffect("energyConsumptionIncrease")) * (uctx.EnergyChallengeActive ? 2 : 1);
    const energyCons = uctx.Cap.GetEffect("energyConsumption") * energyConsRatio;
    return new ResPool(poolK.Order, poolK.ByName, poolK.KarmaKittens, energyProd, (uctx.CalendarSeason !== 3) ? (energyWinterProd0 - ((uctx.PastureOn * uctx.EnergyLoss) * energyProdRatio)) : energyWinterProd0, energyCons);
}

export function getEnergyProductionRatio(ctx) {
    return 1 + ctx.GetEffect("energyProductionRatio");
}

export function getEnergyConsumptionRatio(ctx, energyChallengeActive) {
    return ((1 + ctx.GetEffect("energyConsumptionRatio")) + ctx.GetEffect("energyConsumptionIncrease")) * (energyChallengeActive ? 2 : 1);
}

/**
 * orig getEnergyDelta() — includes the energy-challenge softening branch.
 */
export function getEnergyDelta(energyChallengeResearched, energyChallengeActive, energyProd, energyCons) {
    if (energyCons === 0) {
        return 0;
    }
    else {
        let delta = energyProd / energyCons;
        if (delta < 0.25) {
            delta = 0.25;
        }
        if (energyChallengeResearched && !energyChallengeActive) {
            delta = (1 - ((1 - delta) / 2));
        }
        return delta;
    }
}

/**
 * orig fastforward(daysOffset): pre-accrues perTickCached * days * ticksPerDay
 * with limits relaxed; returns the limits map for enforceLimits. ticksPerDay is
 * a calendar constant (10, js/calendar.js L217) — threaded as a parameter.
 */
export function fastforward(ticksPerDay, daysOffset, calendarDay, pool) {
    let limits = empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    let pool$0027 = pool;
    const enumerator = getEnumerator(pool.Order);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const res = FSharpMap__get_Item(pool.ByName, name);
            if ((res.PerTickCached !== 0) && ((name !== "catnip") ? true : (res.PerTickCached >= 0))) {
                if (res.MaxValue !== 0) {
                    limits = add(name, max(res.Value, res.MaxValue), limits);
                }
                const patternInput = addRes(calendarDay, (res.PerTickCached * daysOffset) * ticksPerDay, true, true, name, pool$0027);
                pool$0027 = patternInput[0];
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return [pool$0027, limits];
}

/**
 * orig enforceLimits(limits): re-clamp values after a relaxed fast-forward.
 */
export function enforceLimits(limits, pool) {
    return new ResPool(pool.Order, map_1((name, res) => {
        if (res.MaxValue !== 0) {
            const matchValue = tryFind(name, limits);
            if (matchValue == null) {
                return res;
            }
            else {
                return new ResourceState(res.Def, min(res.Value, matchValue), res.Unlocked, res.MaxValue, res.PerTickCached);
            }
        }
        else {
            return res;
        }
    }, pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
}

/**
 * orig resConsHackForResTable(): tops up resources whose net conversion drains
 * them while gross production still covers it. Production/conversion seams are
 * game-10 slices (fresh: convertion 0 → branch never taken).
 */
export function resConsHackForResTable(calendarDay, getConvertion, getRptWithConversion, pool) {
    if (calendarDay >= 0) {
        let pool$0027 = pool;
        const enumerator = getEnumerator(pool.Order);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                let ByName;
                const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const res = FSharpMap__get_Item(pool$0027.ByName, name);
                if (res.MaxValue !== 0) {
                    const perTickConvertion = getConvertion(name);
                    if (((perTickConvertion < 0) && (getRptWithConversion(name) > 0)) && ((res.MaxValue + perTickConvertion) <= res.Value)) {
                        const res$0027 = new ResourceState(res.Def, res.Value + -perTickConvertion, res.Unlocked, res.MaxValue, res.PerTickCached);
                        pool$0027 = ((ByName = add(name, res$0027, pool$0027.ByName), new ResPool(pool$0027.Order, ByName, pool$0027.KarmaKittens, pool$0027.EnergyProd, pool$0027.EnergyWinterProd, pool$0027.EnergyCons)));
                    }
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        return pool$0027;
    }
    else {
        return pool;
    }
}

/**
 * orig hasRes(prices, amt) — JS quirk preserved: an unknown resource reads
 * `undefined < x` which is false, so the price check PASSES (loop continues).
 */
export function hasRes(pool, prices, amt) {
    const amt$0027 = (amt === 0) ? 1 : amt;
    return forAll((tupledArg) => {
        const matchValue = get$(pool, tupledArg[0]);
        if (matchValue == null) {
            return true;
        }
        else {
            return !(matchValue.Value < (tupledArg[1] * amt$0027));
        }
    }, prices);
}

/**
 * workshop seam for isStorageLimited's craftable branch (fresh: nothing unlocked).
 */
export class CraftContext extends Record {
    constructor(CraftUnlocked, CraftIsLimited) {
        super();
        this.CraftUnlocked = CraftUnlocked;
        this.CraftIsLimited = CraftIsLimited;
    }
}

export function CraftContext_$reflection() {
    return record_type("Game.Resources.CraftContext", [], CraftContext, () => [["CraftUnlocked", lambda_type(string_type, bool_type)], ["CraftIsLimited", lambda_type(string_type, bool_type)]]);
}

export const freshCraftContext = new CraftContext((_arg) => false, (_arg_1) => false);

/**
 * orig isStorageLimited(prices)
 */
export function isStorageLimited(craftCtx, pool, prices) {
    let found = false;
    const enumerator = getEnumerator(prices);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const val$0027 = forLoopVar[1];
            const name = forLoopVar[0];
            if (!found) {
                const matchValue = get$(pool, name);
                if (matchValue == null) {
                }
                else {
                    const res = matchValue;
                    if ((val$0027 === Infinity) ? true : (((res.MaxValue > 0) && (val$0027 > res.MaxValue)) && (val$0027 > res.Value))) {
                        found = true;
                    }
                    else if (res.Def.Craftable && (val$0027 > res.Value)) {
                        if (craftCtx.CraftUnlocked(name) && craftCtx.CraftIsLimited(name)) {
                            found = true;
                        }
                    }
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return found;
}

/**
 * orig payPrices(prices): addResEvent(-val) per price, in order.
 */
export function payPrices(calendarDay, pool, prices) {
    let pool$0027 = pool;
    const enumerator = getEnumerator(prices);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const patternInput = addResEvent(calendarDay, forLoopVar[0], -forLoopVar[1], pool$0027);
            pool$0027 = patternInput[0];
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return pool$0027;
}

/**
 * orig getVoidQuantity(): -1..2+ at start, 0.5 on average — one RNG draw
 * (game.rand(n) = uniformRandomInteger(0, n)).
 */
export function getVoidQuantity(ctx, rand, pool) {
    return uniformRandomInteger(rand, 0, ctx.GetEffect("temporalParadoxVoid") + 4) - 1;
}

/**
 * orig getVoidQuantityStatistically(): median of the void distribution.
 */
export function getVoidQuantityStatistically(ctx) {
    return (ctx.GetEffect("temporalParadoxVoid") + 1) / 2;
}

/**
 * orig maxAll(): cheat fill to caps.
 */
export function maxAll(pool) {
    return new ResPool(pool.Order, map_1((_arg, res) => {
        if ((res.MaxValue !== 0) && (res.Value < res.MaxValue)) {
            return new ResourceState(res.Def, res.MaxValue, res.Unlocked, res.MaxValue, res.PerTickCached);
        }
        else {
            return res;
        }
    }, pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
}

/**
 * orig resPool.save(): filterMetadata(resources, ["name","value","unlocked",
 * "isHidden","isHiddenFromCrafting"]) — undefined fields dropped. isHidden/
 * isHiddenFromCrafting are settings-level (undefined at fresh).
 */
export function save(pool) {
    return choose((name) => {
        const matchValue = get$(pool, name);
        if (matchValue == null) {
            return undefined;
        }
        else {
            const res = matchValue;
            return [name, res.Value, res.Unlocked];
        }
    }, pool.Order);
}

/**
 * orig resPool.load(): restore value/unlocked by name (perTickCached/maxValue
 * are recomputed by the pipeline, not saved).
 */
export function load(saved, pool) {
    let pool$0027 = pool;
    const enumerator = getEnumerator(saved);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let ByName;
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const name = forLoopVar[0];
            const matchValue = get$(pool$0027, name);
            if (matchValue == null) {
            }
            else {
                const res = matchValue;
                pool$0027 = ((ByName = add(name, new ResourceState(res.Def, forLoopVar[1], forLoopVar[2], res.MaxValue, res.PerTickCached), pool$0027.ByName), new ResPool(pool$0027.Order, ByName, pool$0027.KarmaKittens, pool$0027.EnergyProd, pool$0027.EnergyWinterProd, pool$0027.EnergyCons)));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return pool$0027;
}

