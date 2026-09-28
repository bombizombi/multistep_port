
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, class_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { tryFind, empty as empty_1 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { baseEffects } from "./Game.Catalog.BaseEffects.fs.js";

export class EffectsCache extends Record {
    constructor(Values) {
        super();
        this.Values = Values;
    }
}

export function EffectsCache_$reflection() {
    return record_type("Game.Effects.EffectsCache", [], EffectsCache, () => [["Values", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export const empty = new EffectsCache(empty_1({
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}));

/**
 * game.getEffect(name) — missing effects read as 0 (JS `|| 0` at call sites;
 * the cache itself simply lacks the key).
 */
export function getEffect(cache, name) {
    const matchValue = tryFind(name, cache.Values);
    if (matchValue == null) {
        return 0;
    }
    else {
        return matchValue;
    }
}

/**
 * orig updateCaches() fresh slice: re-seed from the base tables. Managers with
 * no state (workshop/religion/village/... at fresh) contribute nothing.
 */
export function updateCaches(cache) {
    return new EffectsCache(baseEffects);
}

