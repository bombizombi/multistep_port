
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, int32_type, bool_type, unit_type, lambda_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { get$, addResEvent } from "./Game.Resources.fs.js";
import { irwinHallRandom, geometricRandom, binominalRandomInteger } from "./Game.Math.fs.js";
import { max } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";

export class HuntContext extends Record {
    constructor(GetEffect, Rand, Zebras, IronWill, GoldOreResearched, AlicornmancyResearched, UnicornPastureVal) {
        super();
        this.GetEffect = GetEffect;
        this.Rand = Rand;
        this.Zebras = Zebras;
        this.IronWill = IronWill;
        this.GoldOreResearched = GoldOreResearched;
        this.AlicornmancyResearched = AlicornmancyResearched;
        this.UnicornPastureVal = (UnicornPastureVal | 0);
    }
}

export function HuntContext_$reflection() {
    return record_type("Game.Village.HuntContext", [], HuntContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Rand", lambda_type(unit_type, float64_type)], ["Zebras", float64_type], ["IronWill", bool_type], ["GoldOreResearched", bool_type], ["AlicornmancyResearched", bool_type], ["UnicornPastureVal", int32_type]]);
}

/**
 * orig getHuntUnicornChance (village.js L1121).
 */
export function getHuntUnicornChance(ctx) {
    if (ctx.AlicornmancyResearched && (ctx.UnicornPastureVal === 0)) {
        return 0.25;
    }
    else {
        return 0.005 + (0.005 * ctx.GetEffect("hunterRatio"));
    }
}

/**
 * orig gainHuntRes(squads) — roll order IS the contract:
 * unicorns (binomial) → bloodstone gate (zebras ≥ 10) → gold (ironWill +
 * goldOre) → ivory (binomial + 2 irwin-halls) → furs (binomial + 2 irwin-halls).
 */
export function gainHuntRes(ctx, squads, pool) {
    let matchValue;
    const rand = ctx.Rand;
    const pool_1 = addResEvent(0, "unicorns", binominalRandomInteger(rand, squads, getHuntUnicornChance(ctx)), pool)[0];
    let pool_3;
    if (ctx.Zebras >= 10) {
        const bloodstoneRatio = 1 + ctx.GetEffect("bloodstoneRatio");
        let bloodstoneSquads = squads;
        let pool_2 = pool_1;
        if (((matchValue = get$(pool_1, "bloodstone"), (matchValue == null) ? 0 : matchValue.Value)) === 0) {
            const huntsUntilBloodstone = geometricRandom(rand, 0.05 * bloodstoneRatio);
            if (huntsUntilBloodstone <= bloodstoneSquads) {
                pool_2 = addResEvent(0, "bloodstone", 1, pool_2)[0];
            }
            bloodstoneSquads = max(0, bloodstoneSquads - huntsUntilBloodstone);
        }
        pool_3 = addResEvent(0, "bloodstone", binominalRandomInteger(rand, bloodstoneSquads, 0.005 * bloodstoneRatio), pool_2)[0];
    }
    else {
        pool_3 = pool_1;
    }
    const hunterRatio = ctx.GetEffect("hunterRatio");
    let pool_4;
    if (ctx.IronWill && ctx.GoldOreResearched) {
        const goldHunts = binominalRandomInteger(rand, squads, 0.25);
        pool_4 = addResEvent(0, "gold", (5 * irwinHallRandom(rand, goldHunts)) + ((5 * hunterRatio) * irwinHallRandom(rand, goldHunts)), pool_3)[0];
    }
    else {
        pool_4 = pool_3;
    }
    const ivoryHunts = binominalRandomInteger(rand, squads, 0.45 + (0.02 * hunterRatio));
    const pool_5 = addResEvent(0, "ivory", (50 * irwinHallRandom(rand, ivoryHunts)) + ((40 * hunterRatio) * irwinHallRandom(rand, ivoryHunts)), pool_4)[0];
    return addResEvent(0, "furs", (80 * irwinHallRandom(rand, squads)) + ((65 * hunterRatio) * irwinHallRandom(rand, squads)), pool_5)[0];
}

/**
 * orig huntFraction(divisor): squads affordable at manpowerCost
 * (100 − huntCatpowerDiscount); spend + loot. Returns updated pool.
 */
export function huntFraction(ctx, divisor, pool) {
    const manpowerCost = 100 - ctx.GetEffect("huntCatpowerDiscount");
    let squads;
    const matchValue = get$(pool, "manpower");
    if (matchValue == null) {
        squads = 0;
    }
    else {
        const m = matchValue;
        squads = Math.floor(Math.floor(m.Value / manpowerCost) / divisor);
    }
    if (squads >= 1) {
        return gainHuntRes(ctx, squads, addResEvent(0, "manpower", -squads * manpowerCost, pool)[0]);
    }
    else {
        return pool;
    }
}

/**
 * orig village.huntAll(): huntFraction(1).
 */
export function huntAll(ctx, pool) {
    return huntFraction(ctx, 1, pool);
}

