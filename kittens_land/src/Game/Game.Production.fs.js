
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { getEffect as getEffect_1, EffectsCache_$reflection } from "./Game.Effects.fs.js";
import { getWeatherMod, CalendarContext_$reflection, CalendarState_$reflection } from "./Game.Calendar.fs.js";
import { record_type, option_type, int32_type, lambda_type, float64_type, string_type, bool_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { jsRound } from "./Game.Math.fs.js";
import { get$ } from "./Game.Resources.fs.js";
import { ResourceDef, RefundableRule } from "./Game.Types.fs.js";
import { max } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";

export class ProductionContext extends Record {
    constructor(Cache, Calendar, CalendarCtx, SpaceManufacturingResearched, VillageResProduction, HGScalingBonus, SteamworksOn, SteamworksEffectGlobal, ParagonProductionRatio, WinterIsComingActive, CatnipPollutionRatio, LeaderRank, MagnetoOn, SolarRevolutionRatio, SolarRevolutionPollution, DisableCMBR, CMBRBonus, VillageResConsumption, Kittens, Happiness, FreeKittens) {
        super();
        this.Cache = Cache;
        this.Calendar = Calendar;
        this.CalendarCtx = CalendarCtx;
        this.SpaceManufacturingResearched = SpaceManufacturingResearched;
        this.VillageResProduction = VillageResProduction;
        this.HGScalingBonus = HGScalingBonus;
        this.SteamworksOn = (SteamworksOn | 0);
        this.SteamworksEffectGlobal = SteamworksEffectGlobal;
        this.ParagonProductionRatio = ParagonProductionRatio;
        this.WinterIsComingActive = WinterIsComingActive;
        this.CatnipPollutionRatio = CatnipPollutionRatio;
        this.LeaderRank = (LeaderRank | 0);
        this.MagnetoOn = (MagnetoOn | 0);
        this.SolarRevolutionRatio = SolarRevolutionRatio;
        this.SolarRevolutionPollution = SolarRevolutionPollution;
        this.DisableCMBR = DisableCMBR;
        this.CMBRBonus = CMBRBonus;
        this.VillageResConsumption = VillageResConsumption;
        this.Kittens = (Kittens | 0);
        this.Happiness = Happiness;
        this.FreeKittens = (FreeKittens | 0);
    }
}

export function ProductionContext_$reflection() {
    return record_type("Game.Production.ProductionContext", [], ProductionContext, () => [["Cache", EffectsCache_$reflection()], ["Calendar", CalendarState_$reflection()], ["CalendarCtx", CalendarContext_$reflection()], ["SpaceManufacturingResearched", bool_type], ["VillageResProduction", lambda_type(string_type, float64_type)], ["HGScalingBonus", float64_type], ["SteamworksOn", int32_type], ["SteamworksEffectGlobal", lambda_type(string_type, option_type(float64_type))], ["ParagonProductionRatio", float64_type], ["WinterIsComingActive", bool_type], ["CatnipPollutionRatio", float64_type], ["LeaderRank", int32_type], ["MagnetoOn", int32_type], ["SolarRevolutionRatio", float64_type], ["SolarRevolutionPollution", float64_type], ["DisableCMBR", bool_type], ["CMBRBonus", float64_type], ["VillageResConsumption", lambda_type(string_type, float64_type)], ["Kittens", int32_type], ["Happiness", float64_type], ["FreeKittens", int32_type]]);
}

export function freshProductionContext(cache, cal, calCtx) {
    return new ProductionContext(cache, cal, calCtx, false, (_arg) => 0, 1, 0, (_arg_1) => undefined, 0, false, 0, 0, 0, 0, 0, false, 0, (_arg_2) => 0, 0, 1, 0);
}

/**
 * game.fixFloatPointNumber — strips floating-point dust below 1e-7.
 */
export function fixFloatPointNumber(number) {
    const adjusted = Math.floor(number * 10000000) / 10000000;
    const roundDiff = jsRound((number - adjusted) * 10000000);
    if (!Number.isNaN(roundDiff) && (roundDiff !== 0)) {
        return Math.floor((number + 1E-14) * 10000000) / 10000000;
    }
    else {
        return adjusted;
    }
}

/**
 * orig getResourcePerTickConvertion (game.js L4619-4623): fixFloat(PerTickCon
 * − ambassadorConsumption), ambassadors not modeled at this slice (0).
 */
export function getResourcePerTickConvertion(ctx, resName) {
    return fixFloatPointNumber(getEffect_1(ctx.Cache, resName + "PerTickCon"));
}

/**
 * orig getResourcePerDay (game.js L4595-4601): PerDay effect; necrocorn adds
 * the deficit-consumption modifier + corruptionPerTick × ticksPerDay.
 */
export function getResourcePerDay(getEffect, necrocornModifier, corruptionPerTick, ticksPerDay, resName) {
    if (resName === "necrocorn") {
        return (necrocornModifier * getEffect(resName + "PerDay")) + (corruptionPerTick * ticksPerDay);
    }
    else {
        return getEffect(resName + "PerDay");
    }
}

/**
 * orig getResourceOnYearProduction (game.js L4605-4612): Production ×
 * (1+PolicyRatio) × (1+pyramidPerYearRatio); antimatter gated on energy.
 */
export function getResourceOnYearProduction(getEffect, energyProd, energyCons, resName) {
    if ((resName === "antimatter") && (energyProd < energyCons)) {
        return 0;
    }
    else {
        return (getEffect(resName + "Production") * (1 + getEffect(resName + "PolicyRatio"))) * (1 + getEffect("pyramidPerYearRatio"));
    }
}

/**
 * orig getCMBRBonus (game.js L4404-4406): isCMBREnabled ? 0.2 : 0
 */
export function getCMBRBonus(isCmbREnabled) {
    if (isCmbREnabled) {
        return 0.2;
    }
    else {
        return 0;
    }
}

/**
 * orig calcResourcePerTick(resName) — the full term chain in exact order.
 * The pool supplies the resource def (flags) and the sorrow value.
 */
export function calcResourcePerTick(ctx, pool, resName) {
    let def;
    const matchValue = get$(pool, resName);
    if (matchValue == null) {
        def = (new ResourceDef(resName, "", false, undefined, false, true, undefined, false, false, undefined, false, false, false, false, RefundableRule.Default));
    }
    else {
        const r = matchValue;
        def = r.Def;
    }
    const eff = (name) => getEffect_1(ctx.Cache, name);
    let perTick = eff(resName + "PerTickBase");
    const spaceRatio = 1 + eff("spaceRatio");
    if (ctx.SpaceManufacturingResearched && (resName !== "uranium")) {
    }
    const perTickBaseSpace = eff(resName + "PerTickBaseSpace") * spaceRatio;
    perTick = (perTick + perTickBaseSpace);
    perTick = (perTick * getWeatherMod(ctx.CalendarCtx, ctx.Calendar, resName));
    const resProduction0 = ctx.VillageResProduction(resName);
    const resProduction = resProduction0 * ctx.HGScalingBonus;
    perTick = (perTick + resProduction);
    const workshopResRatio = eff(resName + "JobRatio");
    perTick = (perTick + (resProduction * workshopResRatio));
    perTick = (perTick * (1 + eff(resName + "GlobalRatio")));
    perTick = (perTick * (1 + eff(resName + "Ratio")));
    perTick = (perTick * (1 + eff(resName + "RatioReligion")));
    perTick = (perTick * (1 + eff(resName + "SuperRatio")));
    if (ctx.SteamworksOn > 0) {
        const matchValue_1 = ctx.SteamworksEffectGlobal(resName + "RatioGlobal");
        if (matchValue_1 == null) {
        }
        else {
            const swEffectGlobal = matchValue_1;
            perTick = (perTick * (1 + swEffectGlobal));
        }
    }
    let paragonProductionRatio = ctx.ParagonProductionRatio;
    if ((resName === "catnip") && ctx.WinterIsComingActive) {
        paragonProductionRatio = 0;
    }
    perTick = (perTick * (1 + paragonProductionRatio));
    if (resName === "catnip") {
        perTick = (perTick * (1 + ctx.CatnipPollutionRatio));
    }
    let paragonSpaceProductionRatio = 1 + (paragonProductionRatio * 0.05);
    const perTickAutoprod = (eff(resName + "PerTickAutoprod") * paragonSpaceProductionRatio) * (1 + (eff("rankLeaderBonusConversion") * ctx.LeaderRank));
    perTick = (perTick + perTickAutoprod);
    if ((!def.Transient && (ctx.MagnetoOn > 0)) && (resName !== "catnip")) {
        perTick = (perTick * (1 + eff("magnetoRatio")));
        paragonSpaceProductionRatio = (paragonSpaceProductionRatio + (paragonSpaceProductionRatio * eff("magnetoRatio")));
    }
    if ((!def.Transient && (resName !== "uranium")) && (resName !== "catnip")) {
        perTick = (perTick * (1 + eff("productionRatio")));
        paragonSpaceProductionRatio = (paragonSpaceProductionRatio + (paragonSpaceProductionRatio * eff("productionRatio")));
    }
    const solarPollution = ((resName === "wood") ? true : (resName === "catnip")) ? ctx.SolarRevolutionPollution : 0;
    perTick = (perTick * (1 + (ctx.SolarRevolutionRatio * (1 + solarPollution))));
    if (!ctx.DisableCMBR && (resName !== "coal")) {
        perTick = (perTick * (1 + ctx.CMBRBonus));
    }
    paragonSpaceProductionRatio = (paragonSpaceProductionRatio * (1 + ctx.SolarRevolutionRatio));
    perTick = (perTick + eff(resName + "PerTickProd"));
    perTick = (perTick + ((eff(resName + "PerTickAutoprodSpace") * spaceRatio) * (1 + ((paragonSpaceProductionRatio - 1) * eff("prodTransferBonus")))));
    perTick = (perTick + (eff(resName + "PerTickSpace") * spaceRatio));
    perTick = (perTick + (eff(resName + "PerTick") * (1 + eff(resName + "PerTickRatio"))));
    let resConsumption = ctx.VillageResConsumption(resName);
    resConsumption = (resConsumption * (1 + eff(resName + "DemandRatio")));
    if (((resName === "catnip") && (ctx.Kittens > 0)) && (ctx.Happiness > 1)) {
        const hapinnessConsumption = max((ctx.Happiness * (1 + eff("hapinnessConsumptionRatio"))) - 1, 0);
        resConsumption = (resConsumption + (((resConsumption * hapinnessConsumption) * (1 + eff(resName + "DemandWorkerRatioGlobal"))) * (1 - (ctx.FreeKittens / ctx.Kittens))));
    }
    let sorrowValue;
    const matchValue_2 = get$(pool, "sorrow");
    if (matchValue_2 == null) {
        sorrowValue = 0;
    }
    else {
        const s = matchValue_2;
        sorrowValue = s.Value;
    }
    perTick = (perTick * (1 + (sorrowValue * eff("blsProductionBonus"))));
    perTick = (perTick * (1 + eff("pyramidGlobalProductionRatio")));
    if (resName === "faith") {
        perTick = (perTick * (1 + eff("pyramidFaithRatio")));
    }
    perTick = (perTick * (1 + eff(resName + "PolicyRatio")));
    perTick = (perTick + resConsumption);
    if (Number.isNaN(perTick)) {
        return 0;
    }
    else {
        return perTick;
    }
}

