
import { add, FSharpMap__get_Item, toList, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { ResPool, ResourceState } from "./Game.Types.fs.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { max, min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { getUnlimitedDR, getInverseUnlimitedDR, jsRound } from "./Game.Math.fs.js";

/**
 * orig constructor: clone resourceData, value = 0, unlocked = false, no cap set.
 * (setVillage is deferred until the village manager exists — resources-02 note.)
 */
export function init(defs) {
    const byName = ofList(map((d) => [d.Name, new ResourceState(d, 0, false, 0)], defs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    return new ResPool(map((d_1) => d_1.Name, defs), byName, 0);
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
        return [new ResPool(pool.Order, add(name, new ResourceState(res.Def, v5, res.Unlocked, res.MaxValue), pool.ByName), patternInput[1]), (v5 === (prevValue + addedValue)) ? addedValue : (v5 - prevValue)];
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

