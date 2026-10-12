
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { list_type, tuple_type, lambda_type, record_type, class_type, float64_type, string_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { change, FSharpMap__get_Item, add, containsKey, toList, ofList, tryFind, empty as empty_1 } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { stringHash, disposeSafe, getEnumerator, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { append, map } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { defaultArg } from "../../fable_modules/fable-library-js.5.17.0/Option.js";
import { List_distinct } from "../../fable_modules/fable-library-js.5.17.0/Seq2.js";
import { getLimitedDR } from "./Game.Math.js";

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
 * core.js _hasLimitedDiminishingReturn: demand ratios diminish as a WHOLE.
 */
export function hasLimitedDR(name) {
    if ((((name === "catnipDemandRatio") ? true : (name === "fursDemandRatio")) ? true : (name === "ivoryDemandRatio")) ? true : (name === "spiceDemandRatio")) {
        return true;
    }
    else {
        return name === "unhappinessRatio";
    }
}

/**
 * One manager group for aggregation: base table (may be empty) + items, each
 * an effect table plus a PROVIDER — (effectName → effectValue → contribution),
 * exactly like core.js metadata.provider.getEffect. Buildings: Max-suffix ×val
 * (library excepted), coalRatioGlobal raw, rest ×on (Game.Buildings.provider).
 * Research/upgrades: raw contribution, gated by the caller on researched.
 */
export class ManagerGroup extends Record {
    constructor(Base, Items) {
        super();
        this.Base = Base;
        this.Items = Items;
    }
}

export function ManagerGroup_$reflection() {
    return record_type("Game.Effects.ManagerGroup", [], ManagerGroup, () => [["Base", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["Items", list_type(tuple_type(class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type]), lambda_type(string_type, lambda_type(float64_type, float64_type))))]]);
}

function aggregateGroup(g) {
    let names, enumerator;
    let existing = ofList(map((n) => [n, defaultArg(tryFind(n, g.Base), 0)], (names = map((tuple) => tuple[0], toList(g.Base)), ((enumerator = getEnumerator(g.Items), (() => {
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                names = append(names, map((tuple_1) => tuple_1[0], toList(forLoopVar[0])));
            }
        }
        finally {
            disposeSafe(enumerator);
        }
    })()), List_distinct(names, {
        Equals: (x, y) => (x === y),
        GetHashCode: (x) => (stringHash(x) | 0),
    })))), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    });
    const enumerator_1 = getEnumerator(g.Items);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const enumerator_2 = getEnumerator(forLoopVar_1[0]);
            try {
                while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
                    let table_4;
                    const activePatternResult = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    const name = activePatternResult[0];
                    if (containsKey(name, existing)) {
                        const contribution = forLoopVar_1[1](name)(activePatternResult[1]);
                        if (contribution !== 0) {
                            existing = ((table_4 = existing, add(name, FSharpMap__get_Item(existing, name) + contribution, table_4)));
                        }
                    }
                }
            }
            finally {
                disposeSafe(enumerator_2);
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    return existing;
}

/**
 * orig updateCaches fresh+buildings slice: the per-manager aggregation with
 * LDR folding, summed into the global cache in the fixed manager order.
 */
export function updateCaches(cache, groups) {
    let globalEffects = empty_1({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    const enumerator = getEnumerator(groups);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const enumerator_1 = getEnumerator(aggregateGroup(enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]()));
            try {
                while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                    const activePatternResult = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    const name = activePatternResult[0];
                    let effect_1 = activePatternResult[1];
                    if (hasLimitedDR(name) && (effect_1 !== 0)) {
                        effect_1 = getLimitedDR(effect_1, 1);
                    }
                    globalEffects = change(name, (_arg) => {
                        if (_arg == null) {
                            return effect_1;
                        }
                        else {
                            return _arg + effect_1;
                        }
                    }, globalEffects);
                }
            }
            finally {
                disposeSafe(enumerator_1);
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return new EffectsCache(globalEffects);
}

