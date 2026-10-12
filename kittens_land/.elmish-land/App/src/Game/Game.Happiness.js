
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, int32_type, bool_type, lambda_type, float64_type, string_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";

export class HappinessContext extends Record {
    constructor(GetEffect, FascismResearched, FestivalDays, Karma, UpfrontPaymentResearched, LuxuryCount, PollutionHappines, ElderBoxWithPaper, ConsumableLuxuryCount) {
        super();
        this.GetEffect = GetEffect;
        this.FascismResearched = FascismResearched;
        this.FestivalDays = (FestivalDays | 0);
        this.Karma = Karma;
        this.UpfrontPaymentResearched = UpfrontPaymentResearched;
        this.LuxuryCount = (LuxuryCount | 0);
        this.PollutionHappines = PollutionHappines;
        this.ElderBoxWithPaper = ElderBoxWithPaper;
        this.ConsumableLuxuryCount = (ConsumableLuxuryCount | 0);
    }
}

export function HappinessContext_$reflection() {
    return record_type("Game.Happiness.HappinessContext", [], HappinessContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["FascismResearched", bool_type], ["FestivalDays", int32_type], ["Karma", float64_type], ["UpfrontPaymentResearched", bool_type], ["LuxuryCount", int32_type], ["PollutionHappines", float64_type], ["ElderBoxWithPaper", bool_type], ["ConsumableLuxuryCount", int32_type]]);
}

export const freshHappinessContext = new HappinessContext((_arg) => 0, false, 0, 0, false, 0, 0, false, 0);

/**
 * orig getUnhappiness(): (kittens − 5) × 2 × (1 + unhappinessRatio).
 */
export function getUnhappiness(ctx, kittens) {
    if (ctx.FascismResearched) {
        return 0;
    }
    else {
        return ((kittens - 5) * 2) * (1 + ctx.GetEffect("unhappinessRatio"));
    }
}

/**
 * orig updateHappines() → village.happiness ∈ [0.25 .. ] (fraction of 100).
 */
export function updateHappiness(ctx, kittens, maxKittens) {
    let happiness = 100;
    const unhappiness = getUnhappiness(ctx, kittens);
    if (kittens > 5) {
        happiness = (happiness - unhappiness);
    }
    happiness = (happiness + ((((ctx.GetEffect("happiness") + ctx.GetEffect("environmentHappinessBonus")) + ctx.GetEffect("environmentUnhappiness")) + ctx.GetEffect("challengeHappiness")) + ctx.PollutionHappines));
    const perLuxury = 10 + ctx.GetEffect("luxuryHappinessBonus");
    happiness = (happiness + (ctx.LuxuryCount * perLuxury));
    if (ctx.ElderBoxWithPaper) {
        happiness = (happiness - perLuxury);
    }
    happiness = (happiness + (ctx.ConsumableLuxuryCount * ctx.GetEffect("consumableLuxuryHappiness")));
    if (ctx.FestivalDays > 0) {
        happiness = (happiness + (30 * (1 + ctx.GetEffect("festivalRatio"))));
    }
    happiness = (happiness + ctx.Karma);
    const overpopulation = (kittens - maxKittens) | 0;
    if (overpopulation > 0) {
        happiness = (happiness - (overpopulation * 2));
    }
    if (happiness < 25) {
        happiness = 25;
    }
    return happiness / 100;
}

