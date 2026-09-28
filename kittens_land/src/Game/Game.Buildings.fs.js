
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, class_type, list_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Price, BuildingState, BuildingState_$reflection } from "./Game.Types.fs.js";
import { add, FSharpMap__get_Item, FSharpMap__get_IsEmpty, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { forAll, item, length, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { disposeSafe, getEnumerator, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { payPrices, hasRes, get$ as get$_1 } from "./Game.Resources.fs.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { getEffect } from "./Game.Effects.fs.js";
import { getLimitedDR } from "./Game.Math.fs.js";
import { min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";

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
 * orig BuildingStackableBtnController.getPrices: val × priceRatio^count with
 * CostReduction effects folded via getLimitedDR(x, 1). Stage prices override
 * the def prices when present.
 */
export function getPrices(cache, b) {
    let s_1;
    const def = b.Def;
    const stage = (length(def.Stages) > 0) ? item(b.Stage, def.Stages) : undefined;
    const prices = (stage != null) ? ((length(stage.Prices) > 0) ? ((s_1 = stage, s_1.Prices)) : def.Prices) : def.Prices;
    const ratio = defaultArg(b.Def.PriceRatio, 1);
    const eff = (name) => getEffect(cache, name);
    const priceModifier = 1 - getLimitedDR(eff(def.Name + "CostReduction"), 1);
    return map((p) => {
        let arg0__5, s_3;
        const resPriceModifier = 1 - getLimitedDR(eff(p.Resource + "CostReduction"), 1);
        return new Price(p.Resource, ((p.Val * ((arg0__5 = ((stage != null) ? ((length(stage.Prices) > 0) ? ((s_3 = stage, ratio)) : ratio) : ratio), Math.pow(arg0__5, b.Val)))) * resPriceModifier) * priceModifier);
    }, prices);
}

/**
 * orig buildings provider getEffect (js/buildings.js L144-175): Max-suffixed
 * effects (except library) and biolab Ratios scale with VAL; everything else
 * with ON; coalRatioGlobal raw. Stageable buildings read the active stage table.
 */
export function providerEffect(b, effectName) {
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
    if (effectName === "coalRatioGlobal") {
        return effectValue;
    }
    else if ((effectName.endsWith("Max") && (def.Name !== "library")) ? true : ((def.Name === "biolab") && effectName.endsWith("Ratio"))) {
        return effectValue * b.Val;
    }
    else {
        return effectValue * b.On;
    }
}

/**
 * orig build(): buy up to n while affordable; increments val (and on for
 * non-togglable). Returns how many were built.
 */
export function build(calendarDay, cache, pool, n, name, bpool) {
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
        const prices = getPrices(cache, b);
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

