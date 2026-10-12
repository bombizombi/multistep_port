
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { option_type, float64_type, list_type, class_type, string_type, record_type, bool_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { choose, find, map } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { perkDefs } from "./Game.Catalog.World.js";
import { FSharpMap__get_IsEmpty, empty, add, FSharpMap__get_Item, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { getLimitedDR, getUnlimitedDR } from "./Game.Math.js";
import { UnlockList_$reflection } from "./Game.Types.js";
import { payPrices, hasRes } from "./Game.Resources.js";
import { ManagerGroup } from "./Game.Effects.js";

export class PerkMeta extends Record {
    constructor(Unlocked, Researched) {
        super();
        this.Unlocked = Unlocked;
        this.Researched = Researched;
    }
}

export function PerkMeta_$reflection() {
    return record_type("Game.Prestige.PerkMeta", [], PerkMeta, () => [["Unlocked", bool_type], ["Researched", bool_type]]);
}

export class PrestigePool extends Record {
    constructor(Perks, PerkOrder, HideResearched) {
        super();
        this.Perks = Perks;
        this.PerkOrder = PerkOrder;
        this.HideResearched = HideResearched;
    }
}

export function PrestigePool_$reflection() {
    return record_type("Game.Prestige.PrestigePool", [], PrestigePool, () => [["Perks", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, PerkMeta_$reflection()])], ["PerkOrder", list_type(string_type)], ["HideResearched", bool_type]]);
}

export function init() {
    const order = map((p) => p.Name, perkDefs);
    return new PrestigePool(ofList(map((p_1) => [p_1.Name, new PerkMeta(p_1.StartsUnlocked, false)], perkDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), order, false);
}

export function getPerk(pp, name) {
    return FSharpMap__get_Item(pp.Perks, name);
}

export function resetState(_pp) {
    return init();
}

/**
 * orig getSpentParagon (L526-535): sums perk.paragon — no def defines that
 * field in this version, so it is 0 (kept for contract completeness).
 */
export function getSpentParagon(pp) {
    return 0;
}

export function getParagonRatio(getEffect) {
    return 1 + getEffect("paragonRatio");
}

/**
 * orig getBurnedParagonRatio (L552-554): UDR(burnedParagon.value, 500)
 */
export function getBurnedParagonRatio(burnedParagon) {
    return getUnlimitedDR(burnedParagon, 500);
}

/**
 * orig getParagonProductionRatio (L556-572): LDR-capped paragon production +
 * burned-paragon production (×4 cap in dark future — darkFutureYears seam -1)
 */
export function getParagonProductionRatio(getEffect, paragon, burnedParagon) {
    const paragonRatio = getParagonRatio(getEffect);
    let productionRatioParagon = (paragon * 0.01) * paragonRatio;
    productionRatioParagon = getLimitedDR(productionRatioParagon, 2 * paragonRatio);
    let productionRatioBurnedParagon = (burnedParagon * 0.01) * paragonRatio;
    productionRatioBurnedParagon = getLimitedDR(productionRatioBurnedParagon, 1 * paragonRatio);
    return productionRatioParagon + productionRatioBurnedParagon;
}

/**
 * orig getParagonStorageRatio (L574-583): every 100 paragon → +10% storage;
 * burned paragon /500 in dark future, /2000 before (seam: pre-dark-future)
 */
export function getParagonStorageRatio(getEffect, paragon, burnedParagon) {
    const paragonRatio = getParagonRatio(getEffect);
    let storageRatio = (paragon / 1000) * paragonRatio;
    storageRatio = (storageRatio + ((burnedParagon / 2000) * paragonRatio));
    return storageRatio;
}

/**
 * orig getResetBonusBreakdown (L588-600): marginal fractions a reset would add
 */
export class ResetBonus extends Record {
    constructor(Happiness, Storage, Production) {
        super();
        this.Happiness = Happiness;
        this.Storage = Storage;
        this.Production = Production;
    }
}

export function ResetBonus_$reflection() {
    return record_type("Game.Prestige.ResetBonus", [], ResetBonus, () => [["Happiness", float64_type], ["Storage", float64_type], ["Production", float64_type]]);
}

export function getResetBonusBreakdown(getEffect, paragon, extraParagon, extraKarma) {
    const paragonRatio = getParagonRatio(getEffect);
    const prodCur = getLimitedDR((paragon * 0.01) * paragonRatio, 2 * paragonRatio);
    return new ResetBonus(extraKarma / 100, (extraParagon / 1000) * paragonRatio, getLimitedDR(((paragon + extraParagon) * 0.01) * paragonRatio, 2 * paragonRatio) - prodCur);
}

export class PerkBuyResult extends Record {
    constructor(Pool, Bought, UnlockFanOut, UpgradeFanOut, RunsDiplomacyHandler) {
        super();
        this.Pool = Pool;
        this.Bought = Bought;
        this.UnlockFanOut = UnlockFanOut;
        this.UpgradeFanOut = UpgradeFanOut;
        this.RunsDiplomacyHandler = RunsDiplomacyHandler;
    }
}

export function PerkBuyResult_$reflection() {
    return record_type("Game.Prestige.PerkBuyResult", [], PerkBuyResult, () => [["Pool", PrestigePool_$reflection()], ["Bought", bool_type], ["UnlockFanOut", option_type(UnlockList_$reflection())], ["UpgradeFanOut", option_type(UnlockList_$reflection())], ["RunsDiplomacyHandler", bool_type]]);
}

/**
 * orig buyItem gates: metaphysics researched (controller L622-631) +
 * !researched + hasResources (core.js L2477-2491). onPurchase: handler →
 * unlock → upgrade.
 */
export function buyPerk(calendarDay, metaphysicsResearched, pool, name, pp) {
    const def = find((p) => (p.Name === name), perkDefs);
    const meta = FSharpMap__get_Item(pp.Perks, name);
    if (!metaphysicsResearched ? true : meta.Researched) {
        return [pp, pool, new PerkBuyResult(pp, false, undefined, undefined, false)];
    }
    else {
        const prices = map((p_1) => [p_1.Resource, p_1.Val], def.Prices);
        if (!hasRes(pool, prices, 0)) {
            return [pp, pool, new PerkBuyResult(pp, false, undefined, undefined, false)];
        }
        else {
            const pool$0027 = payPrices(calendarDay, pool, prices);
            const pp$0027 = new PrestigePool(add(name, new PerkMeta(meta.Unlocked, true), pp.Perks), pp.PerkOrder, pp.HideResearched);
            return [pp$0027, pool$0027, new PerkBuyResult(pp$0027, true, def.Unlocks, def.Upgrades, def.HasHandler)];
        }
    }
}

/**
 * Manager group for the global effects cache (prestige slot): research
 * provider — researched perks contribute their raw effects.
 */
export function prestigeGroup(pp) {
    return new ManagerGroup(empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), choose((def) => {
        if (FSharpMap__get_Item(pp.Perks, def.Name).Researched && !FSharpMap__get_IsEmpty(def.Effects)) {
            return [def.Effects, (_arg) => ((v) => v)];
        }
        else {
            return undefined;
        }
    }, perkDefs));
}

