
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { option_type, lambda_type, list_type, class_type, float64_type, string_type, record_type, bool_type, int32_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { tryFind, add, fold, FSharpMap__get_Item, ofList, empty } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { filter, sumBy, append, find, ofArray, choose, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { pactDefs, tuDefs, ruDefs, zuDefs } from "./Game.Catalog.World.fs.js";
import { getInverseUnlimitedDR, getLimitedDR, getUnlimitedDR } from "./Game.Math.fs.js";
import { max, min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { getEffect as getEffect_1, ManagerGroup } from "./Game.Effects.fs.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { payPrices, hasRes, addResEvent, addResPerTick, get$ } from "./Game.Resources.fs.js";
import { UnlockList_$reflection, Price, ResPool, ResourceState } from "./Game.Types.fs.js";

/**
 * Pact state (pactsManager metas: stackable val/on).
 */
export class PactMeta extends Record {
    constructor(Val, On, Unlocked) {
        super();
        this.Val = (Val | 0);
        this.On = (On | 0);
        this.Unlocked = Unlocked;
    }
}

export function PactMeta_$reflection() {
    return record_type("Game.Religion.PactMeta", [], PactMeta, () => [["Val", int32_type], ["On", int32_type], ["Unlocked", bool_type]]);
}

/**
 * Live meta state shared by ZU/RU/TU metas (orig mutates the def: val/on).
 * FrozenEffects carries calculateEffects output that orig writes INTO the def
 * (solarRevolution sets effects.solarRevolutionRatio at buy time; the value
 * stays frozen until another recalc event touches the meta — game.js L5878).
 */
export class ReligionMeta extends Record {
    constructor(Val, On, Unlocked, Researched, FrozenEffects) {
        super();
        this.Val = (Val | 0);
        this.On = (On | 0);
        this.Unlocked = Unlocked;
        this.Researched = Researched;
        this.FrozenEffects = FrozenEffects;
    }
}

export function ReligionMeta_$reflection() {
    return record_type("Game.Religion.ReligionMeta", [], ReligionMeta, () => [["Val", int32_type], ["On", int32_type], ["Unlocked", bool_type], ["Researched", bool_type], ["FrozenEffects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class ReligionPool extends Record {
    constructor(Faith, FaithRatio, Tcratio, TranscendenceTier, Corruption, NecrocornDeficit, FractureThreshold, Pacts, PactOrder, ActiveHolyGenocide, ZUs, RUs, TUs, ZuOrder, RuOrder, TuOrder) {
        super();
        this.Faith = Faith;
        this.FaithRatio = FaithRatio;
        this.Tcratio = Tcratio;
        this.TranscendenceTier = (TranscendenceTier | 0);
        this.Corruption = Corruption;
        this.NecrocornDeficit = NecrocornDeficit;
        this.FractureThreshold = FractureThreshold;
        this.Pacts = Pacts;
        this.PactOrder = PactOrder;
        this.ActiveHolyGenocide = (ActiveHolyGenocide | 0);
        this.ZUs = ZUs;
        this.RUs = RUs;
        this.TUs = TUs;
        this.ZuOrder = ZuOrder;
        this.RuOrder = RuOrder;
        this.TuOrder = TuOrder;
    }
}

export function ReligionPool_$reflection() {
    return record_type("Game.Religion.ReligionPool", [], ReligionPool, () => [["Faith", float64_type], ["FaithRatio", float64_type], ["Tcratio", float64_type], ["TranscendenceTier", int32_type], ["Corruption", float64_type], ["NecrocornDeficit", float64_type], ["FractureThreshold", float64_type], ["Pacts", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, PactMeta_$reflection()])], ["PactOrder", list_type(string_type)], ["ActiveHolyGenocide", int32_type], ["ZUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ReligionMeta_$reflection()])], ["RUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ReligionMeta_$reflection()])], ["TUs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ReligionMeta_$reflection()])], ["ZuOrder", list_type(string_type)], ["RuOrder", list_type(string_type)], ["TuOrder", list_type(string_type)]]);
}

function mkMeta() {
    return new ReligionMeta(0, 0, false, false, empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }));
}

export function init() {
    const idx = (defs, nameOf) => [map(nameOf, defs), ofList(map((d) => [nameOf(d), mkMeta()], defs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    })];
    const zuOrder = map((d_1) => d_1.Name, zuDefs);
    const zus = ofList(map((d_2) => {
        let bind$0040;
        return [d_2.Name, (bind$0040 = mkMeta(), new ReligionMeta(bind$0040.Val, bind$0040.On, d_2.StartsUnlocked, bind$0040.Researched, bind$0040.FrozenEffects))];
    }, zuDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    });
    const patternInput = idx(ruDefs, (d_3) => d_3.Name);
    const rus = patternInput[1];
    const ruOrder = patternInput[0];
    const patternInput_1 = idx(tuDefs, (d_4) => d_4.Name);
    const tus = patternInput_1[1];
    const tuOrder = patternInput_1[0];
    return new ReligionPool(0, 0, 0, 0, 0, 0, 50, ofList(map((d_5) => [d_5.Name, new PactMeta(0, 0, false)], pactDefs), {
        Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
    }), map((d_6) => d_6.Name, pactDefs), 0, zus, rus, tus, zuOrder, ruOrder, tuOrder);
}

export function getRU(rp, name) {
    return FSharpMap__get_Item(rp.RUs, name);
}

export function getZU(rp, name) {
    return FSharpMap__get_Item(rp.ZUs, name);
}

export function getTU(rp, name) {
    return FSharpMap__get_Item(rp.TUs, name);
}

/**
 * orig getApocryphaBonus (L1510): UDR(faithRatio, 0.1) * 0.1
 */
export function getApocryphaBonus(rp) {
    return getUnlimitedDR(rp.FaithRatio, 0.1) * 0.1;
}

/**
 * orig getSolarRevolutionRatio (L1499): LDR(UDR(faith,1000)/100,
 * 10 + solarRevolutionLimit [+ atheism tier seam]) * (1 + faithSolarRevolutionBoost)
 */
export function getSolarRevolutionRatio(rp, getEffect) {
    const uncappedBonus = (getRU(rp, "solarRevolution").On > 0) ? (getUnlimitedDR(rp.Faith, 1000) / 100) : 0;
    const limit = 10 + getEffect("solarRevolutionLimit");
    return getLimitedDR(uncappedBonus, limit) * (1 + getEffect("faithSolarRevolutionBoost"));
}

/**
 * orig _getTranscendTotalPrice (L1653): inverseUDR(exp(tier)/10, 0.1)
 */
export function getTranscendTotalPrice(tier) {
    return getInverseUnlimitedDR(Math.exp(tier) / 10, 0.1);
}

export function getTranscendNextPrice(rp) {
    return getTranscendTotalPrice(rp.TranscendenceTier + 1) - getTranscendTotalPrice(rp.TranscendenceTier);
}

/**
 * orig praise (L1536): worship += faith.value * (1 + apocrypha); faith.value = 0.0001
 */
export function praise(rp, faithValue) {
    const gained = faithValue * (1 + getApocryphaBonus(rp));
    const faith = min(rp.Faith + gained, 1.7976931348623157E+308);
    return new ReligionPool(faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
}

/**
 * orig _resetFaithInternal (L1580): faithRatio += faith/1e6 * (tt+1)^2 * ratio; faith = 0.01
 */
export function adoreInternal(rp, bonusRatio) {
    const ttPlus1 = (((getRU(rp, "transcendence").On > 0) ? rp.TranscendenceTier : 0) + 1) | 0;
    const faithRatio = rp.FaithRatio + ((((rp.Faith / 1000000) * ttPlus1) * ttPlus1) * bonusRatio);
    return new ReligionPool(0.01, min(faithRatio, 1.7976931348623157E+308), rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
}

/**
 * orig transcend (L1600): consume next price from faithRatio, tier++
 */
export function transcend(rp) {
    if (getRU(rp, "transcendence").On === 0) {
        return [rp, false];
    }
    else {
        const needNextLevel = getTranscendNextPrice(rp);
        if (rp.FaithRatio > needNextLevel) {
            return [new ReligionPool(rp.Faith, rp.FaithRatio - needNextLevel, rp.Tcratio + needNextLevel, rp.TranscendenceTier + 1, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder), true];
        }
        else {
            return [rp, false];
        }
    }
}

/**
 * orig resetState (L71-101)
 */
export function resetState(_rp) {
    let fresh;
    const idx = (defs, nameOf) => [map(nameOf, defs), ofList(map((d) => [nameOf(d), mkMeta()], defs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    })];
    const zuOrder = map((d_1) => d_1.Name, zuDefs);
    const zus = ofList(map((d_2) => {
        let bind$0040;
        return [d_2.Name, (bind$0040 = mkMeta(), new ReligionMeta(bind$0040.Val, bind$0040.On, d_2.StartsUnlocked, bind$0040.Researched, bind$0040.FrozenEffects))];
    }, zuDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    });
    const patternInput = idx(ruDefs, (d_3) => d_3.Name);
    const rus = patternInput[1];
    const ruOrder = patternInput[0];
    const patternInput_1 = idx(tuDefs, (d_4) => d_4.Name);
    const tus = patternInput_1[1];
    const tuOrder = patternInput_1[0];
    fresh = (new ReligionPool(0, 0, 0, 0, 0, 0, 50, ofList(map((d_5) => [d_5.Name, new PactMeta(0, 0, false)], pactDefs), {
        Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
    }), map((d_6) => d_6.Name, pactDefs), 0, zus, rus, tus, zuOrder, ruOrder, tuOrder));
    return fresh;
}

function metaItems(metas, effectsOf) {
    return choose((tupledArg) => {
        const name = tupledArg[0];
        const m = tupledArg[1];
        if (m.On > 0) {
            let effects;
            const statics = effectsOf(name);
            effects = fold((acc, k, v) => add(k, v, acc), statics, m.FrozenEffects);
            return [effects, (_arg) => ((v_1) => (v_1 * m.On))];
        }
        else {
            return undefined;
        }
    }, metas);
}

export const effectsBase = ofList(ofArray([["kittensKarmaPerMinneliaRatio", 0.0001], ["pactNecrocornConsumption", -0.0005]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

/**
 * Pacts stackable group contribution (effects × on) — merged into the
 * religion manager group.
 */
export function pactItems(rp) {
    return choose((def) => {
        const m = FSharpMap__get_Item(rp.Pacts, def.Name);
        if (m.On > 0) {
            return [def.Effects, (_arg) => ((v) => (v * m.On))];
        }
        else {
            return undefined;
        }
    }, pactDefs);
}

/**
 * Manager group for the global effects cache (religion slot in updateCaches).
 */
export function religionGroup(rp) {
    const zuEffects = (name) => find((d) => (d.Name === name), zuDefs).Effects;
    const ruEffects = (name_1) => find((d_1) => (d_1.Name === name_1), ruDefs).Effects;
    const tuEffects = (name_2) => find((d_2) => (d_2.Name === name_2), tuDefs).Effects;
    return new ManagerGroup(effectsBase, append(metaItems(choose((n) => {
        const option_1 = tryFind(n, rp.ZUs);
        if (option_1 != null) {
            return [n, option_1];
        }
        else {
            return undefined;
        }
    }, rp.ZuOrder), zuEffects), append(metaItems(choose((n_1) => {
        const option_3 = tryFind(n_1, rp.RUs);
        if (option_3 != null) {
            return [n_1, option_3];
        }
        else {
            return undefined;
        }
    }, rp.RuOrder), ruEffects), append(metaItems(choose((n_2) => {
        const option_5 = tryFind(n_2, rp.TUs);
        if (option_5 != null) {
            return [n_2, option_5];
        }
        else {
            return undefined;
        }
    }, rp.TuOrder), tuEffects), pactItems(rp)))));
}

/**
 * Seam context for corruption math (live reads supplied by the runner).
 */
export class CorruptionContext extends Record {
    constructor(GetEffect, Alicorns, Sorrow, FeedingFrenzyResearched) {
        super();
        this.GetEffect = GetEffect;
        this.Alicorns = Alicorns;
        this.Sorrow = Sorrow;
        this.FeedingFrenzyResearched = FeedingFrenzyResearched;
    }
}

export function CorruptionContext_$reflection() {
    return record_type("Game.Religion.CorruptionContext", [], CorruptionContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Alicorns", float64_type], ["Sorrow", float64_type], ["FeedingFrenzyResearched", bool_type]]);
}

/**
 * orig getExistNecrocornThreshold (L183): feedingFrenzy -> 1, else 0.
 */
export function getExistNecrocornThreshold(ctx) {
    if (ctx.FeedingFrenzyResearched) {
        return 1;
    }
    else {
        return 0;
    }
}

/**
 * orig getCorruptionEffects (L204-291): markers additive, exist-penalty
 * multiplicative, black radiance sqrt, feeding-frenzy interference. Pact
 * siphoning branches are seams (no pacts at this slice).
 */
export function getCorruptionEffects(ctx, pretendExistNecrocorn) {
    let existNecrocorn;
    if (pretendExistNecrocorn == null) {
        existNecrocorn = (ctx.Alicorns > getExistNecrocornThreshold(ctx));
    }
    else {
        const b = pretendExistNecrocorn;
        existNecrocorn = b;
    }
    let finalCorruptionPerTick = 0;
    if (ctx.Alicorns > 0) {
        finalCorruptionPerTick = (finalCorruptionPerTick + ctx.GetEffect("corruptionRatio"));
    }
    if (existNecrocorn) {
        const multiplier = 0.25 * (1 + ctx.GetEffect("corruptionBoostRatio"));
        finalCorruptionPerTick = (finalCorruptionPerTick * multiplier);
    }
    finalCorruptionPerTick = (finalCorruptionPerTick * (1 + Math.sqrt(ctx.Sorrow * ctx.GetEffect("blsCorruptionRatio"))));
    finalCorruptionPerTick = (finalCorruptionPerTick * (1 + ctx.GetEffect("necrocornCorruptionInterference")));
    return finalCorruptionPerTick;
}

/**
 * orig getCorruptionPerTick (L296-302)
 */
export function getCorruptionPerTick(ctx, pretendExistNecrocorn) {
    return getCorruptionEffects(ctx, pretendExistNecrocorn);
}

/**
 * orig getNecrocornDeficitConsumptionModifier (L2894-2912)
 */
export function getNecrocornDeficitConsumptionModifier(ctx, pool, rp) {
    let option_1;
    if (rp.NecrocornDeficit <= 0) {
        return 1;
    }
    else {
        const necrocornPerDay = ctx.GetEffect("necrocornPerDay");
        if (ctx.GetEffect("repayDebtOnNecrocornGeneration") !== 0) {
            return 1;
        }
        else {
            let modifier = 1 + (0.15 * (1 + (ctx.GetEffect("deficitRecoveryRatio") / 2)));
            const necrocorns = defaultArg((option_1 = get$(pool, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
            if ((necrocorns + (necrocornPerDay * modifier)) < 0) {
                return max(((necrocornPerDay * modifier) + necrocorns) / necrocornPerDay, 0);
            }
            else {
                return modifier;
            }
        }
    }
}

function setResValue(name, value, pool) {
    const res = FSharpMap__get_Item(pool.ByName, name);
    return new ResPool(pool.Order, add(name, new ResourceState(res.Def, value, res.Unlocked, res.MaxValue, res.PerTickCached), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
}

/**
 * orig corruptNecrocorns (L376-408): convert alicorns 1:1 at progress >= 1,
 * keep at least 1 alicorn, clamp progress to 1 when starved of alicorns.
 * Pacts debt is a seam (repayDebtOnNecrocornGeneration 0, deficit 0).
 * Returns necrocorns kept (debt-paid ones don't count).
 */
export function corruptNecrocorns(ctx, pool, rp) {
    let option_1, option_4;
    const alicorns = defaultArg((option_1 = get$(pool, "alicorn"), (option_1 != null) ? option_1.Value : undefined), 0);
    const maxAlicornsToCorrupt = Math.ceil(alicorns) - 1;
    const alicornsToCorrupt = Math.floor(min(rp.Corruption, maxAlicornsToCorrupt));
    if (alicornsToCorrupt > 0) {
        const rp$0027 = new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption - alicornsToCorrupt, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
        const pool1 = setResValue("alicorn", alicorns - alicornsToCorrupt, pool);
        const necrocorns = defaultArg((option_4 = get$(pool1, "necrocorn"), (option_4 != null) ? option_4.Value : undefined), 0);
        const pool2 = setResValue("necrocorn", necrocorns + alicornsToCorrupt, pool1);
        return [rp$0027, pool2, alicornsToCorrupt];
    }
    else {
        const corruption = (rp.Corruption >= 1) ? 1 : rp.Corruption;
        return [new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder), pool, 0];
    }
}

/**
 * orig pactsManager.necrocornConsumptionDays (L3004-3026). necrocornPerDay
 * effect is 0 without active pacts at this slice; deficit bookkeeping kept.
 */
export function necrocornConsumptionDays(calendarDay, ctx, days, pool, rp) {
    let option_1;
    const necrocornPerDay = ctx.GetEffect("necrocornPerDay");
    if (ctx.GetEffect("repayDebtOnNecrocornGeneration") !== 0) {
        return [new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit - (necrocornPerDay * days), rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder), pool];
    }
    else {
        let modifier = 1;
        let deficit = rp.NecrocornDeficit;
        const necrocorns = defaultArg((option_1 = get$(pool, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
        if (deficit > 0) {
            modifier = (1 + (0.15 * (1 + (ctx.GetEffect("deficitRecoveryRatio") / 2))));
        }
        if ((necrocorns + ((necrocornPerDay * days) * modifier)) < 0) {
            deficit = (deficit + max((-necrocornPerDay * days) - necrocorns, 0));
            modifier = 1;
        }
        else if (deficit > 0) {
            deficit = max(deficit + (necrocornPerDay * ((0.15 * (1 + ctx.GetEffect("deficitRecoveryRatio"))) * days)), 0);
        }
        const pool$0027 = addResPerTick(calendarDay, "necrocorn", (necrocornPerDay * modifier) * days, pool)[0];
        return [new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, deficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder), pool$0027];
    }
}

function necrocornsNaiveFFWithoutSiphoning(calendarDay, ctx, daysOffset, times, pool, rp) {
    let option_1;
    const threshold = getExistNecrocornThreshold(ctx);
    const necrocornsBefore = defaultArg((option_1 = get$(pool, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
    const corruptionPerTickUnpenalized = getCorruptionPerTick(ctx, false);
    let corruption = rp.Corruption;
    if (corruptionPerTickUnpenalized > 0) {
        const corruptionPerTickPenalized = getCorruptionPerTick(ctx, true);
        const necrocornsToPassThreshold = 1 + Math.floor(threshold - necrocornsBefore);
        let ticksUnpenalized = Math.ceil((necrocornsToPassThreshold - rp.Corruption) / corruptionPerTickUnpenalized);
        if (ticksUnpenalized < 0) {
            ticksUnpenalized = 0;
        }
        if (ticksUnpenalized > times) {
            ticksUnpenalized = times;
        }
        const ticksPenalized = times - ticksUnpenalized;
        corruption = ((corruption + (corruptionPerTickUnpenalized * ticksUnpenalized)) + (corruptionPerTickPenalized * ticksPenalized));
    }
    const rp1 = new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
    const patternInput = necrocornConsumptionDays(calendarDay, ctx, daysOffset, pool, rp1);
    const rp2 = patternInput[0];
    const pool1 = patternInput[1];
    const patternInput_1 = corruptNecrocorns(ctx, pool1, rp2);
    const rp3 = patternInput_1[0];
    const pool2 = patternInput_1[1];
    return [rp3, pool2];
}

function necrocornsNaiveFFWithSiphoning(calendarDay, ctx, daysOffset, times, pool, rp) {
    let option_1, Corruption, Corruption_1;
    const corruptionBefore = rp.Corruption;
    const threshold = getExistNecrocornThreshold(ctx);
    const necrocornRes = defaultArg((option_1 = get$(pool, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
    const debtBefore = rp.NecrocornDeficit;
    const corruptionPerTickUnpenalized = getCorruptionPerTick(ctx, false);
    const corruptionPerTickPenalized = getCorruptionPerTick(ctx, true);
    const avgDebtPerTick = -ctx.GetEffect("necrocornPerDay");
    let ticksUnpenalized = 0;
    if ((necrocornRes <= threshold) && (times > 0)) {
        const baseNecrocornsToPassThreshold = 1 + Math.floor(threshold - necrocornRes);
        let tryNumber = baseNecrocornsToPassThreshold;
        let ticksElapsed = 0;
        let giveUp = false;
        while ((ticksElapsed < times) && !giveUp) {
            ticksElapsed = ((corruptionPerTickUnpenalized !== 0) ? Math.ceil((tryNumber - corruptionBefore) / corruptionPerTickUnpenalized) : 1.7976931348623157E+308);
            const projectedDebt = debtBefore + (ticksElapsed * avgDebtPerTick);
            const targetNecrocorns = baseNecrocornsToPassThreshold + Math.floor(projectedDebt);
            if (tryNumber >= targetNecrocorns) {
            }
            else {
                tryNumber = targetNecrocorns;
                if ((avgDebtPerTick >= corruptionPerTickUnpenalized) && (tryNumber > ((baseNecrocornsToPassThreshold + debtBefore) * 2))) {
                    giveUp = true;
                    tryNumber = 1.7976931348623157E+308;
                }
            }
        }
        ticksElapsed = ((corruptionPerTickUnpenalized !== 0) ? Math.ceil((tryNumber - corruptionBefore) / corruptionPerTickUnpenalized) : 1.7976931348623157E+308);
        ticksUnpenalized = ticksElapsed;
        if (ticksUnpenalized < 0) {
            ticksUnpenalized = 0;
        }
        if (ticksUnpenalized > times) {
            ticksUnpenalized = times;
        }
    }
    const ticksPenalized = times - ticksUnpenalized;
    let daysUnpenalized = Math.floor(ticksUnpenalized / 10);
    if (Number.isNaN(daysUnpenalized)) {
        daysUnpenalized = 0;
    }
    const daysPenalized = daysOffset - daysUnpenalized;
    let rp_1 = rp;
    let pool_1 = pool;
    if (daysUnpenalized > 0) {
        const patternInput = necrocornConsumptionDays(calendarDay, ctx, daysUnpenalized, pool_1, rp_1);
        const rp$0027 = patternInput[0];
        const pool$0027 = patternInput[1];
        rp_1 = rp$0027;
        pool_1 = pool$0027;
    }
    if (ticksUnpenalized > 0) {
        rp_1 = ((Corruption = (rp_1.Corruption + (corruptionPerTickUnpenalized * ticksUnpenalized)), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, Corruption, rp_1.NecrocornDeficit, rp_1.FractureThreshold, rp_1.Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
        const patternInput_1 = corruptNecrocorns(ctx, pool_1, rp_1);
        const rp$0027_1 = patternInput_1[0];
        const pool$0027_1 = patternInput_1[1];
        rp_1 = rp$0027_1;
        pool_1 = pool$0027_1;
    }
    if (daysPenalized > 0) {
        const patternInput_2 = necrocornConsumptionDays(calendarDay, ctx, daysPenalized, pool_1, rp_1);
        const rp$0027_2 = patternInput_2[0];
        const pool$0027_2 = patternInput_2[1];
        rp_1 = rp$0027_2;
        pool_1 = pool$0027_2;
    }
    if (ticksPenalized > 0) {
        rp_1 = ((Corruption_1 = (rp_1.Corruption + (corruptionPerTickPenalized * ticksPenalized)), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, Corruption_1, rp_1.NecrocornDeficit, rp_1.FractureThreshold, rp_1.Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
    }
    const patternInput_3 = corruptNecrocorns(ctx, pool_1, rp_1);
    const rp$0027_3 = patternInput_3[0];
    const pool$0027_3 = patternInput_3[1];
    return [rp$0027_3, pool$0027_3];
}

/**
 * orig necrocornsNaiveFastForward (L622-636)
 */
export function necrocornsNaiveFastForward(calendarDay, ctx, daysOffset, times, pool, rp) {
    if (ctx.Alicorns > 0) {
        if (ctx.GetEffect("repayDebtOnNecrocornGeneration") !== 0) {
            return necrocornsNaiveFFWithSiphoning(calendarDay, ctx, daysOffset, times, pool, rp);
        }
        else {
            return necrocornsNaiveFFWithoutSiphoning(calendarDay, ctx, daysOffset, times, pool, rp);
        }
    }
    else {
        return necrocornConsumptionDays(calendarDay, ctx, daysOffset, pool, rp);
    }
}

/**
 * orig triggerOrderOfTheVoid (L628-633): voidOrder perk converts 10% of
 * produced faith (× voidResonance), at a quarter of the apocrypha bonus.
 */
export function triggerOrderOfTheVoid(voidOrderResearched, voidResonance, faithPerTick, ticks, rp) {
    if (voidOrderResearched) {
        const convertedFaith = ((ticks * faithPerTick) * 0.1) * (1 + voidResonance);
        return new ReligionPool(rp.Faith + (convertedFaith * (1 + (getApocryphaBonus(rp) / 4))), rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
    }
    else {
        return rp;
    }
}

/**
 * orig necrocornFastForward (L639+): split simulation at the
 * above-to-below-threshold edge case.
 */
export function necrocornFastForward(calendarDay, ctx, days, times, pool, rp) {
    const threshold = getExistNecrocornThreshold(ctx);
    const necrocornPerDay = ctx.GetEffect("necrocornPerDay");
    const continuouslyConsumeNecrocorns = ctx.GetEffect("repayDebtOnNecrocornGeneration") === 0;
    const ticksPerDay = times / days;
    let daysRemaining = days;
    let timesRemaining = times;
    let rp_1 = rp;
    let pool_1 = pool;
    let guard = 0;
    while (((daysRemaining > 0) ? true : (timesRemaining > 0)) && (guard < 100000)) {
        let option_1;
        guard = ((guard + 1) | 0);
        let daysUntilEdgeCase1 = Infinity;
        if (continuouslyConsumeNecrocorns && (necrocornPerDay < 0)) {
            const necrocornRes = defaultArg((option_1 = get$(pool_1, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
            if (necrocornRes > threshold) {
                const consumptionRate = -necrocornPerDay * getNecrocornDeficitConsumptionModifier(ctx, pool_1, rp_1);
                daysUntilEdgeCase1 = Math.ceil((necrocornRes - threshold) / consumptionRate);
            }
            else {
                const ticksUntilThreshold = Math.ceil(((1 + Math.floor(threshold - necrocornRes)) - rp_1.Corruption) / getCorruptionPerTick(ctx, false));
                daysUntilEdgeCase1 = Math.ceil(ticksUntilThreshold / ticksPerDay);
            }
        }
        if (Number.isNaN(daysUntilEdgeCase1)) {
            daysUntilEdgeCase1 = Infinity;
        }
        const daysToSimulate = min(daysRemaining, daysUntilEdgeCase1);
        let timesToSimulate = min(Math.ceil(daysToSimulate * ticksPerDay), timesRemaining);
        if (daysToSimulate < 1) {
            timesToSimulate = timesRemaining;
        }
        const patternInput = necrocornsNaiveFastForward(calendarDay, ctx, daysToSimulate, timesToSimulate, pool_1, rp_1);
        const rp$0027 = patternInput[0];
        const pool$0027 = patternInput[1];
        rp_1 = rp$0027;
        pool_1 = pool$0027;
        daysRemaining = (daysRemaining - daysToSimulate);
        timesRemaining = (timesRemaining - timesToSimulate);
    }
    return [rp_1, pool_1];
}

/**
 * orig praise undo: restore worship & faith stock.
 */
export function undoPraise(faithSpent, worshipGained, pool, rp) {
    if (rp.Faith >= worshipGained) {
        const rp$0027 = new ReligionPool(rp.Faith - worshipGained, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
        const pool$0027 = addResEvent(0, "faith", faithSpent, pool)[0];
        return [rp$0027, pool$0027, true];
    }
    else {
        return [rp, pool, false];
    }
}

/**
 * orig adore undo: restore epiphany & the pre-adore worship pool.
 */
export function undoAdore(worshipBefore, epiphanyGained, rp) {
    if (rp.FaithRatio >= epiphanyGained) {
        return [new ReligionPool(worshipBefore, rp.FaithRatio - epiphanyGained, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, rp.RUs, rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder), true];
    }
    else {
        return [rp, false];
    }
}

export function getPact(rp, name) {
    return FSharpMap__get_Item(rp.Pacts, name);
}

/**
 * orig countUniqueActivePacts (L2966): MAUSOLEUM_PACTS flag is TRUE in the
 * harness (localhost); fractured short-circuits the count; special skipped.
 */
export function countUniqueActivePacts(rp) {
    if (FSharpMap__get_Item(rp.Pacts, "fractured").On > 0) {
        return 0;
    }
    else {
        return sumBy((d_1) => {
            if (FSharpMap__get_Item(rp.Pacts, d_1.Name).On > 0) {
                return 1;
            }
            else {
                return 0;
            }
        }, filter((d) => !d.Special, pactDefs), {
            GetZero: () => 0,
            Add: (x, y) => ((x + y) | 0),
        }) | 0;
    }
}

export function countActivePacts(rp) {
    if (FSharpMap__get_Item(rp.Pacts, "fractured").On > 0) {
        return 0;
    }
    else {
        return sumBy((d_1) => (FSharpMap__get_Item(rp.Pacts, d_1.Name).On | 0), filter((d) => !d.Special, pactDefs), {
            GetZero: () => 0,
            Add: (x, y) => ((x + y) | 0),
        }) | 0;
    }
}

/**
 * orig getDebtPenaltyRatio (L2880-2898)
 */
export function getDebtPenaltyRatio(rp, getEffect) {
    if ((FSharpMap__get_Item(rp.Pacts, "fractured").On > 0) ? true : (rp.NecrocornDeficit >= rp.FractureThreshold)) {
        return 0;
    }
    else {
        const lowerBound = getEffect("smallDebtPunishmentExemption");
        if (rp.NecrocornDeficit <= lowerBound) {
            return 1;
        }
        else {
            return 1 - ((rp.NecrocornDeficit - lowerBound) / (rp.FractureThreshold - lowerBound));
        }
    }
}

/**
 * orig pact purchase build (L2478-2545): pactsAvailable cap, prices, deficit
 * +0.5/counter (unless notAddDeficit or positive upfront cost), payDebt
 * special pays the deficit instead. Returns updated pools.
 */
export function buyPact(calendarDay, getEffect, name, n, pool, rp) {
    let NecrocornDeficit, Pacts_1, table_2;
    const def = find((d) => (d.Name === name), pactDefs);
    let maxBld = n;
    const pactAvailableEffect = defaultArg(tryFind("pactsAvailable", def.Effects), 0);
    if (pactAvailableEffect !== 0) {
        maxBld = (min(maxBld, ~~(getEffect("pactsAvailable") / -pactAvailableEffect)) | 0);
    }
    let pact = FSharpMap__get_Item(rp.Pacts, name);
    let rp_1 = rp;
    let pool_1 = pool;
    let counter = 0;
    const prices0 = map((p) => [p.Resource, p.Val], def.Prices);
    const matchValue = def.LimitBuild;
    if (matchValue == null) {
    }
    else {
        const lb = matchValue;
        maxBld = (min(maxBld, ~~lb - pact.Val) | 0);
    }
    while ((counter < maxBld) && hasRes(pool_1, prices0, 0)) {
        let Pacts, table_1;
        rp_1 = ((Pacts = ((table_1 = rp_1.Pacts, add(name, new PactMeta(pact.Val + 1, pact.On + 1, pact.Unlocked), table_1))), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, rp_1.Corruption, rp_1.NecrocornDeficit, rp_1.FractureThreshold, Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
        pact = FSharpMap__get_Item(rp_1.Pacts, name);
        pool_1 = payPrices(calendarDay, pool_1, prices0);
        counter = ((counter + 1) | 0);
    }
    if (counter > 0) {
        if (!def.NotAddDeficit) {
            rp_1 = ((NecrocornDeficit = (rp_1.NecrocornDeficit + (0.5 * counter)), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, rp_1.Corruption, NecrocornDeficit, rp_1.FractureThreshold, rp_1.Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
        }
        if (name === "payDebt") {
            rp_1 = ((Pacts_1 = ((table_2 = rp_1.Pacts, add("payDebt", (FSharpMap__get_Item(rp_1.Pacts, "payDebt"), new PactMeta(0, 0, false)), table_2))), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, rp_1.Corruption, 0, rp_1.FractureThreshold, Pacts_1, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
        }
    }
    return [rp_1, pool_1, counter];
}

/**
 * orig onNewDay slice for pacts (calendar calls pactsManager
 * necrocornConsumptionDays(1) + payDebt.onNewDay + deficit punishment).
 */
export function pactsOnNewDay(ctx, pool, rp) {
    const patternInput = necrocornConsumptionDays(0, ctx, 1, pool, rp);
    const rp1 = patternInput[0];
    const pool1 = patternInput[1];
    const pd = FSharpMap__get_Item(rp1.Pacts, "payDebt");
    const rp2 = new ReligionPool(rp1.Faith, rp1.FaithRatio, rp1.Tcratio, rp1.TranscendenceTier, rp1.Corruption, rp1.NecrocornDeficit, rp1.FractureThreshold, add("payDebt", new PactMeta(pd.Val, pd.On, rp1.NecrocornDeficit > 0), rp1.Pacts), rp1.PactOrder, rp1.ActiveHolyGenocide, rp1.ZUs, rp1.RUs, rp1.TUs, rp1.ZuOrder, rp1.RuOrder, rp1.TuOrder);
    const rp3 = (rp2.NecrocornDeficit >= rp2.FractureThreshold) ? (new ReligionPool(rp2.Faith, rp2.FaithRatio, rp2.Tcratio, rp2.TranscendenceTier, rp2.Corruption, rp2.NecrocornDeficit, rp2.FractureThreshold, add("fractured", new PactMeta(1, 1, FSharpMap__get_Item(rp2.Pacts, "fractured").Unlocked), rp2.Pacts), rp2.PactOrder, rp2.ActiveHolyGenocide, rp2.ZUs, rp2.RUs, rp2.TUs, rp2.ZuOrder, rp2.RuOrder, rp2.TuOrder)) : rp2;
    return [rp3, pool1];
}

/**
 * stackable price ladder (identical math to Game.Buildings.getPrices; ZU adds
 * the ivory ratio override from ZigguratBtnController.getPrices L1893-1912).
 */
export function zuPrices(cache, rp, name) {
    const def = find((d) => (d.Name === name), zuDefs);
    const meta = FSharpMap__get_Item(rp.ZUs, name);
    const ratio = defaultArg(def.PriceRatio, 1);
    const eff = (name_1) => getEffect_1(cache, name_1);
    const ivoryRatio = max(ratio + eff("zigguratIvoryPriceRatio"), 1);
    const pricesDiscount = getLimitedDR(eff(name + "CostReduction"), 1);
    const priceModifier = 1 - pricesDiscount;
    return map((p) => {
        const resPriceDiscount = getLimitedDR(eff(p.Resource + "CostReduction"), 1);
        const resPriceModifier = 1 - resPriceDiscount;
        const ratioToUse = (p.Resource === "ivory") ? ivoryRatio : ratio;
        return new Price(p.Resource, ((p.Val * Math.pow(ratioToUse, meta.Val)) * resPriceModifier) * priceModifier);
    }, def.Prices);
}

/**
 * RU ladder (ReligionBtnController.getPrices L1929-1942): base ladder, then
 * faith/gold ×(1 + religionUpgradesDiscount); wise-leader seam = identity.
 */
export function ruPrices(cache, rp, name) {
    const def = find((d) => (d.Name === name), ruDefs);
    const meta = FSharpMap__get_Item(rp.RUs, name);
    const ratio = defaultArg(def.PriceRatio, 1);
    const eff = (name_1) => getEffect_1(cache, name_1);
    const pricesDiscount = getLimitedDR(eff(name + "CostReduction"), 1);
    const priceModifier = 1 - pricesDiscount;
    const discount = 1 + eff("religionUpgradesDiscount");
    return map((p) => {
        const resPriceDiscount = getLimitedDR(eff(p.Resource + "CostReduction"), 1);
        const resPriceModifier = 1 - resPriceDiscount;
        const v = ((p.Val * Math.pow(ratio, meta.Val)) * resPriceModifier) * priceModifier;
        return new Price(p.Resource, ((p.Resource === "faith") ? true : (p.Resource === "gold")) ? (v * discount) : v);
    }, def.Prices);
}

function increment(m) {
    return new ReligionMeta(m.Val + 1, m.On + 1, m.Unlocked, m.Researched, m.FrozenEffects);
}

export class ReligionBuyResult extends Record {
    constructor(Pool, Bought, UnlockFanOut, UpgradeFanOut) {
        super();
        this.Pool = Pool;
        this.Bought = (Bought | 0);
        this.UnlockFanOut = UnlockFanOut;
        this.UpgradeFanOut = UpgradeFanOut;
    }
}

export function ReligionBuyResult_$reflection() {
    return record_type("Game.Religion.ReligionBuyResult", [], ReligionBuyResult, () => [["Pool", ReligionPool_$reflection()], ["Bought", int32_type], ["UnlockFanOut", option_type(UnlockList_$reflection())], ["UpgradeFanOut", option_type(UnlockList_$reflection())]]);
}

/**
 * Buy n of a ZU while affordable at the FROZEN ladder (orig recomputes neither
 * prices nor the ladder inside the while loop — model.prices is fixed).
 */
export function buyZU(calendarDay, cache, pool, n, name, rp) {
    const def = find((d) => (d.Name === name), zuDefs);
    const prices = zuPrices(cache, rp, name);
    const priceList = map((p) => [p.Resource, p.Val], prices);
    let rp_1 = rp;
    let pool_1 = pool;
    let counter = 0;
    let maxBld = n;
    while ((counter < maxBld) && hasRes(pool_1, priceList, 0)) {
        let ZUs, table;
        const m = FSharpMap__get_Item(rp_1.ZUs, name);
        rp_1 = ((ZUs = ((table = rp_1.ZUs, add(name, increment(m), table))), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, rp_1.Corruption, rp_1.NecrocornDeficit, rp_1.FractureThreshold, rp_1.Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, ZUs, rp_1.RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
        pool_1 = payPrices(calendarDay, pool_1, priceList);
        counter = ((counter + 1) | 0);
    }
    const result = new ReligionBuyResult(rp_1, counter, def.Unlocks, def.Upgrades);
    return [rp_1, pool_1, result];
}

/**
 * Buy n of an RU. orig build() checks only model.enabled (updateEnabled
 * L2227: hasResources && !(on>0 && noStackable)) — the faith gate is
 * updateVisible UI-only and does NOT gate the buy.
 */
export function buyRU(calendarDay, cache, pool, n, name, rp) {
    const def = find((d) => (d.Name === name), ruDefs);
    const meta = FSharpMap__get_Item(rp.RUs, name);
    let noStackableNow;
    if (def.NoStackable) {
        const matchValue = tryFind("transcendence", rp.RUs);
        if (matchValue == null) {
            noStackableNow = true;
        }
        else {
            const t = matchValue;
            noStackableNow = (t.On === 0);
        }
    }
    else {
        noStackableNow = false;
    }
    if ((meta.On > 0) && noStackableNow) {
        return [rp, pool, new ReligionBuyResult(rp, 0, undefined, undefined)];
    }
    else {
        const prices = ruPrices(cache, rp, name);
        const priceList = map((p) => [p.Resource, p.Val], prices);
        let rp_1 = rp;
        let pool_1 = pool;
        let counter = 0;
        while ((counter < n) && hasRes(pool_1, priceList, 0)) {
            let RUs, table_1;
            const m = FSharpMap__get_Item(rp_1.RUs, name);
            rp_1 = ((RUs = ((table_1 = rp_1.RUs, add(name, increment(m), table_1))), new ReligionPool(rp_1.Faith, rp_1.FaithRatio, rp_1.Tcratio, rp_1.TranscendenceTier, rp_1.Corruption, rp_1.NecrocornDeficit, rp_1.FractureThreshold, rp_1.Pacts, rp_1.PactOrder, rp_1.ActiveHolyGenocide, rp_1.ZUs, RUs, rp_1.TUs, rp_1.ZuOrder, rp_1.RuOrder, rp_1.TuOrder)));
            pool_1 = payPrices(calendarDay, pool_1, priceList);
            counter = ((counter + 1) | 0);
        }
        const result = new ReligionBuyResult(rp_1, counter, def.Unlocks, def.Upgrades);
        return [rp_1, pool_1, result];
    }
}

/**
 * blackPyramid.getEffectiveValue: val + (blackSky researched && !active ? 1 : 0)
 */
export function blackPyramidEffectiveValue(pool, blackSkyResearched, blackSkyActive) {
    let matchValue, z;
    return (((matchValue = tryFind("blackPyramid", pool.ZUs), (matchValue == null) ? 0 : ((z = matchValue, z.Val)))) + ((blackSkyResearched && !blackSkyActive) ? 1 : 0)) | 0;
}

/**
 * ctx for the ZU calculateEffects REPLACE tables (skyPalace/utopia/sunspire)
 */
export class ZuCalcCtx extends Record {
    constructor(AlicornmancyResearched, AlicornValue, UnicornTearsActive) {
        super();
        this.AlicornmancyResearched = AlicornmancyResearched;
        this.AlicornValue = AlicornValue;
        this.UnicornTearsActive = UnicornTearsActive;
    }
}

export function ZuCalcCtx_$reflection() {
    return record_type("Game.Religion.ZuCalcCtx", [], ZuCalcCtx, () => [["AlicornmancyResearched", bool_type], ["AlicornValue", float64_type], ["UnicornTearsActive", bool_type]]);
}

export function zuCalcEffects(ctx, name, pool) {
    let l, l_1, l_2;
    const alicornPerTick = (ctx.AlicornmancyResearched ? true : (ctx.AlicornValue > 0)) ? 1 : 0;
    let newEffects;
    switch (name) {
        case "skyPalace": {
            newEffects = ofList((l = ofArray([["goldMaxRatio", 0.01], ["unicornsRatioReligion", 0.5], ["alicornChance", 0.0001], ["alicornPerTick", 2E-05 * alicornPerTick], ["ivoryMeteorRatio", 0.05], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), ctx.UnicornTearsActive ? append(l, ofArray([["unicornsMax", 50], ["tearsMax", 275], ["alicornMax", 0.2]])) : l), {
                Compare: (x, y) => (comparePrimitives(x, y) | 0),
            });
            break;
        }
        case "unicornUtopia": {
            newEffects = ofList((l_1 = ofArray([["unicornsRatioReligion", 2.5], ["alicornChance", 0.00015], ["alicornPerTick", 2.5E-05 * alicornPerTick], ["tcRefineRatio", 0.05], ["ivoryMeteorRatio", 0.15], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), ctx.UnicornTearsActive ? append(l_1, ofArray([["unicornsMax", 5500], ["tearsMax", 1800], ["alicornMax", 0.6]])) : l_1), {
                Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
            });
            break;
        }
        case "sunspire": {
            newEffects = ofList((l_2 = ofArray([["unicornsRatioReligion", 5], ["alicornChance", 0.0003], ["alicornPerTick", 5E-05 * alicornPerTick], ["tcRefineRatio", 0.1], ["ivoryMeteorRatio", 0.5], ["unicornsMaxRatio", 0], ["tearsMax", 0], ["alicornMax", 0]]), ctx.UnicornTearsActive ? append(l_2, ofArray([["unicornsMaxRatio", 0.1], ["tearsMax", 10000], ["alicornMax", 1]])) : l_2), {
                Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
            });
            break;
        }
        default: {
            const matchValue = tryFind(name, pool.ZUs);
            if (matchValue == null) {
                newEffects = empty({
                    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
                });
            }
            else {
                const z = matchValue;
                newEffects = z.FrozenEffects;
            }
        }
    }
    const matchValue_1 = tryFind(name, pool.ZUs);
    if (matchValue_1 == null) {
        return pool;
    }
    else {
        const z_1 = matchValue_1;
        return new ReligionPool(pool.Faith, pool.FaithRatio, pool.Tcratio, pool.TranscendenceTier, pool.Corruption, pool.NecrocornDeficit, pool.FractureThreshold, pool.Pacts, pool.PactOrder, pool.ActiveHolyGenocide, add(name, new ReligionMeta(z_1.Val, z_1.On, z_1.Unlocked, z_1.Researched, newEffects), pool.ZUs), pool.RUs, pool.TUs, pool.ZuOrder, pool.RuOrder, pool.TuOrder);
    }
}

/**
 * TU purchase (TranscendenceBtnController → stackable ladder + tier gate).
 * darkParacosm uses priceRules (per-price paragon priceRatio 2).
 */
export function buyTU(calendarDay, getEffect, tier, name, n, pool, rpool) {
    let m;
    const matchValue = tryFind(name, rpool.TUs);
    let matchResult, m_1;
    if (matchValue != null) {
        if ((m = matchValue, m.Unlocked && (m.Val === 0))) {
            matchResult = 0;
            m_1 = matchValue;
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
            const def = find((d) => (d.Name === name), tuDefs);
            const ratio = defaultArg(def.PriceRatio, 1.15);
            const priceFor = () => map((p) => {
                const base0 = p.Val * Math.pow(ratio, m_1.Val);
                const v = (def.PriceRules && (p.Resource === "paragon")) ? (8 * Math.pow(2, m_1.Val)) : (def.PriceRules ? p.Val : base0);
                return [p.Resource, v];
            }, def.Prices);
            let r = pool;
            let rp2 = rpool;
            let bought = 0;
            let left = n;
            while ((left > 0) && hasRes(r, priceFor(), 0)) {
                let TUs;
                const pool1 = payPrices(calendarDay, r, priceFor());
                r = pool1;
                rp2 = ((TUs = add(name, new ReligionMeta(m_1.Val + 1, m_1.On, m_1.Unlocked, m_1.Researched, m_1.FrozenEffects), rp2.TUs), new ReligionPool(rp2.Faith, rp2.FaithRatio, rp2.Tcratio, rp2.TranscendenceTier, rp2.Corruption, rp2.NecrocornDeficit, rp2.FractureThreshold, rp2.Pacts, rp2.PactOrder, rp2.ActiveHolyGenocide, rp2.ZUs, rp2.RUs, TUs, rp2.ZuOrder, rp2.RuOrder, rp2.TuOrder)));
                bought = ((bought + 1) | 0);
                left = ((left - 1) | 0);
            }
            return [r, rp2, bought];
        }
        default:
            return [pool, rpool, 0];
    }
}

/**
 * transform controller core (TransformBtnController._transform): pay
 * priceCount from resFrom, gain gainMultiplier×amt of resTo (capped),
 * overcap = attempted − actual (0 when uncapped).
 */
export function transform(calendarDay, resFrom, resTo, price, divider, n, gainMultiplier, pool) {
    let matchValue, r;
    const afford0 = ~~Math.floor(((matchValue = get$(pool, resFrom), (matchValue == null) ? 0 : ((r = matchValue, r.Value)))) / price) | 0;
    let gainMax;
    const matchValue_1 = get$(pool, resTo);
    if (matchValue_1 == null) {
        gainMax = 0;
    }
    else {
        const r_1 = matchValue_1;
        gainMax = r_1.MaxValue;
    }
    let gainNow;
    const matchValue_2 = get$(pool, resTo);
    if (matchValue_2 == null) {
        gainNow = 0;
    }
    else {
        const r_2 = matchValue_2;
        gainNow = r_2.Value;
    }
    const canAfford = (((gainMax !== 0) && (afford0 > 1)) ? max(1, min(afford0, ~~Math.ceil((gainMax - gainNow) / gainMultiplier))) : afford0) | 0;
    const transformations = ~~(canAfford / n) | 0;
    if (transformations <= 0) {
        return [pool, 0, 0, 0, false];
    }
    else {
        const amt = transformations * divider;
        const priceCount = price * amt;
        let fromValue;
        const matchValue_3 = get$(pool, resFrom);
        if (matchValue_3 == null) {
            fromValue = 0;
        }
        else {
            const r_3 = matchValue_3;
            fromValue = r_3.Value;
        }
        if (priceCount > fromValue) {
            return [pool, 0, 0, 0, false];
        }
        else {
            const attemptedGain = gainMultiplier * amt;
            const patternInput = addResEvent(calendarDay, resFrom, -priceCount, pool);
            const pool1 = patternInput[0];
            const actualGain = patternInput[1];
            const patternInput_1 = addResEvent(calendarDay, resTo, attemptedGain, pool1);
            const pool2 = patternInput_1[0];
            const actual = patternInput_1[1];
            let maxV;
            const matchValue_4 = get$(pool2, resTo);
            if (matchValue_4 == null) {
                maxV = 0;
            }
            else {
                const r_4 = matchValue_4;
                maxV = r_4.MaxValue;
            }
            const overcap = (maxV === 0) ? 0 : (attemptedGain - actual);
            return [pool2, price * (transformations * divider), attemptedGain, overcap, true];
        }
    }
}

/**
 * RefineTearsBtnController: tears 10000 → sorrow.value++ per batch, direct
 * value write bypassing addResEvent; stops at sorrow.maxValue.
 */
export function refineTears(calendarDay, n, pool) {
    let matchValue, t, matchValue_1, s;
    const price = 10000;
    const sorrowMax = 17;
    let r = pool;
    let refined = 0;
    let left = n;
    while (((left > 0) && ((matchValue = get$(r, "tears"), (matchValue == null) ? false : ((t = matchValue, t.Value >= price))))) && ((matchValue_1 = get$(r, "sorrow"), (matchValue_1 == null) ? false : ((s = matchValue_1, s.Value < sorrowMax))))) {
        const pool1 = addResEvent(calendarDay, "tears", -price, r)[0];
        const s_1 = FSharpMap__get_Item(pool1.ByName, "sorrow");
        r = (new ResPool(pool1.Order, add("sorrow", new ResourceState(s_1.Def, s_1.Value + 1, s_1.Unlocked, s_1.MaxValue, s_1.PerTickCached), pool1.ByName), pool1.KarmaKittens, pool1.EnergyProd, pool1.EnergyWinterProd, pool1.EnergyCons));
        refined = ((refined + 1) | 0);
        left = ((left - 1) | 0);
    }
    return [r, refined];
}

/**
 * orig ReligionManager.necrocornDeficitPunishment (deficit ≥ 50 wipes skills — later unit)
 */
export function freezeSolarRevolution(cache, rp) {
    const m = FSharpMap__get_Item(rp.RUs, "solarRevolution");
    if (m.On > 0) {
        const ratio = getSolarRevolutionRatio(rp, (name) => getEffect_1(cache, name));
        const m_1 = new ReligionMeta(m.Val, m.On, m.Unlocked, m.Researched, add("solarRevolutionRatio", ratio, m.FrozenEffects));
        return new ReligionPool(rp.Faith, rp.FaithRatio, rp.Tcratio, rp.TranscendenceTier, rp.Corruption, rp.NecrocornDeficit, rp.FractureThreshold, rp.Pacts, rp.PactOrder, rp.ActiveHolyGenocide, rp.ZUs, add("solarRevolution", m_1, rp.RUs), rp.TUs, rp.ZuOrder, rp.RuOrder, rp.TuOrder);
    }
    else {
        return rp;
    }
}

