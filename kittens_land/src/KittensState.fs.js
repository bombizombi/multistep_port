
import { Record } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { UpgradeState, PolicyState, CraftState, ResPool, ResourceState, ResPool_$reflection } from "./Game/Game.Types.fs.js";
import { getAllPrices, build, update as update_1, init as init_2, providerEffect, activeEffects, get$ as get$_1, PricingContext, freshPricing, BldPool_$reflection } from "./Game/Game.Buildings.fs.js";
import { SciencePool, unlockRelations, craftAll as craftAll_1, WorkshopPool, getResCraftRatio, craft as craft_1, buyUpgrade as buyUpgrade_1, getTech, research as research_1, Kitten, simAssignJob, assignJob as assignJob_1, unlock, craftByEngineers, getResProduction, CraftRatioContext, learnSkills, SkillContext, simUpdate, starvationStep, VillagePool, calculateMaxKittens, initVillage, initWorkshop, initScience, getFreeKittens, scienceGroup, workshopEffectsBase, VillagePool_$reflection, WorkshopPool_$reflection, SciencePool_$reflection } from "./Game/Game.Managers.fs.js";
import { getZU, getRU, getTU, buyZU as buyZU_1, freezeSolarRevolution, buyRU as buyRU_1, praise as praise_1, init as init_3, religionGroup, ReligionPool_$reflection } from "./Game/Game.Religion.fs.js";
import { ChallengePool, ChallengeState, getTradeBonusEffect, init as init_4, challengesGroup, ChallengePool_$reflection } from "./Game/Game.Challenges.fs.js";
import { getPerk, getBurnedParagonRatio, init as init_5, prestigeGroup, PrestigePool_$reflection } from "./Game/Game.Prestige.fs.js";
import { buyEmbassies, tradeImpl, getTradeVolume, getGoldCost, getManpowerCost, update as update_2, DiplomacyContext, init as init_6, DiplomacyPool_$reflection } from "./Game/Game.Diplomacy.fs.js";
import { vsuDef, buyVSU as buyVSU_1, cfuCalculate, TimePool, TimeMeta, cfuDef, buyCFU as buyCFU_1, TimeCalcContext, init as init_7, timeGroup as timeGroup_1, TimePool_$reflection } from "./Game/Game.Time.fs.js";
import { getBuilding, getProgram, buyBuilding as buyBuilding_1, buyProgram as buyProgram_1, init as init_8, spaceGroup, SpacePool_$reflection } from "./Game/Game.Space.fs.js";
import { bumpStat, init as init_9, StatsPool_$reflection } from "./Game/Game.Stats.fs.js";
import { cycleYearColors, tick as tick_1, seasons, init as init_10, CalendarContext, CalendarState_$reflection } from "./Game/Game.Calendar.fs.js";
import { empty as empty_2, updateCaches, ManagerGroup, getEffect as getEffect_1, EffectsCache_$reflection } from "./Game/Game.Effects.fs.js";
import { list_type, float64_type, string_type, record_type, bool_type, int32_type } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { defaultArg } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { payPrices, hasRes, addResEvent, updateMaxValueAll, update, UpdateContext, init as init_1, getEnergyDelta, CapContext, get$ } from "./Game/Game.Resources.fs.js";
import { ofList, add, FSharpMap__get_Item, map, filter, tryFind, empty } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { stringHash, equals, comparePrimitives } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { append, isEmpty, fold, contains as contains_1, find, reverse, truncate, filter as filter_1, map as map_1, sumBy, item, length, ofArray, choose, empty as empty_1 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { baseEffects, bldBase } from "./Game/Game.Catalog.BaseEffects.fs.js";
import { calcResourcePerTick, fixFloatPointNumber, ProductionContext, freshProductionContext } from "./Game/Game.Production.fs.js";
import { resourceDefs } from "./Game/Game.Catalog.Resources.fs.js";
import { craftDefs, upgradeDefs, policyDefs, techDefs, buildingDefs } from "./Game/Game.Catalog.Defs.fs.js";
import { jobDefs } from "./Game/Game.Catalog.Village.fs.js";
import { nonSeeded } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Random.js";
import { union, contains, ofList as ofList_1, FSharpSet__Contains } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Set.js";
import { updateHappiness, HappinessContext, freshHappinessContext } from "./Game/Game.Happiness.fs.js";
import { min } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { op_UnaryNegation_Int32 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Int32.js";
import { buildingDefs as buildingDefs_1, programDefs } from "./Game/Game.Catalog.Space.fs.js";
import { get$ as get$_2 } from "./Game.Labels.fs.js";
import { ruDefs, raceDefs } from "./Game/Game.Catalog.World.fs.js";

export class State extends Record {
    constructor(Pool, Bpool, Spool, Wpool, Vpool, Rpool, Cpool, Ppool, Dpool, Tpool, Spacep, Stpool, Calendar, Cache, CalendarDay, Ticks, IronWill) {
        super();
        this.Pool = Pool;
        this.Bpool = Bpool;
        this.Spool = Spool;
        this.Wpool = Wpool;
        this.Vpool = Vpool;
        this.Rpool = Rpool;
        this.Cpool = Cpool;
        this.Ppool = Ppool;
        this.Dpool = Dpool;
        this.Tpool = Tpool;
        this.Spacep = Spacep;
        this.Stpool = Stpool;
        this.Calendar = Calendar;
        this.Cache = Cache;
        this.CalendarDay = (CalendarDay | 0);
        this.Ticks = (Ticks | 0);
        this.IronWill = IronWill;
    }
}

export function State_$reflection() {
    return record_type("kittens_land.KittensState.State", [], State, () => [["Pool", ResPool_$reflection()], ["Bpool", BldPool_$reflection()], ["Spool", SciencePool_$reflection()], ["Wpool", WorkshopPool_$reflection()], ["Vpool", VillagePool_$reflection()], ["Rpool", ReligionPool_$reflection()], ["Cpool", ChallengePool_$reflection()], ["Ppool", PrestigePool_$reflection()], ["Dpool", DiplomacyPool_$reflection()], ["Tpool", TimePool_$reflection()], ["Spacep", SpacePool_$reflection()], ["Stpool", StatsPool_$reflection()], ["Calendar", CalendarState_$reflection()], ["Cache", EffectsCache_$reflection()], ["CalendarDay", int32_type], ["Ticks", int32_type], ["IronWill", bool_type]]);
}

export function getRes(pool, name) {
    let option_1;
    return defaultArg((option_1 = get$(pool, name), (option_1 != null) ? option_1.Value : undefined), 0);
}

export function getResMax(pool, name) {
    let option_1;
    return defaultArg((option_1 = get$(pool, name), (option_1 != null) ? option_1.MaxValue : undefined), 0);
}

export function capCtx(s) {
    return new CapContext((name) => getEffect_1(s.Cache, name), 0, 0, false, false, 0);
}

export function pctx(s) {
    return new PricingContext(freshPricing.PriceRules, false, false, false, false, 0, 0, s.IronWill, 0);
}

export function getEffect(s, name) {
    return getEffect_1(s.Cache, name);
}

export function resValue(s, name) {
    return getRes(s.Pool, name);
}

export const emptyGroup = new ManagerGroup(empty({
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), empty_1());

export function groups(s) {
    let option_1, timeGroup;
    const bldGroup = new ManagerGroup(bldBase, choose((n) => {
        const matchValue = get$_1(s.Bpool, n);
        if (matchValue == null) {
            return undefined;
        }
        else {
            const b = matchValue;
            return [activeEffects(b), (name) => ((_arg) => providerEffect(b, name))];
        }
    }, s.Bpool.Order));
    const workshopGroup = new ManagerGroup(workshopEffectsBase(s.Cache, (name_1) => resValue(s, name_1), false), choose((n_1) => {
        let u;
        const matchValue_1 = tryFind(n_1, s.Wpool.Upgrades);
        let matchResult, u_1;
        if (matchValue_1 != null) {
            if ((u = matchValue_1, u.Researched)) {
                matchResult = 0;
                u_1 = matchValue_1;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0:
                return [u_1.Def.Effects, (_arg_1) => ((v) => v)];
            default:
                return undefined;
        }
    }, s.Wpool.UpgradeOrder));
    return ofArray([workshopGroup, religionGroup(s.Rpool), bldGroup, challengesGroup(s.Cpool, (name_2) => getEffect(s, name_2), defaultArg((option_1 = get$_1(s.Bpool, "tradepost"), (option_1 != null) ? option_1.Val : undefined), 0)), prestigeGroup(s.Ppool), spaceGroup(s.Pool.EnergyCons, s.Pool.EnergyProd, getEnergyDelta(false, false, s.Pool.EnergyProd, s.Pool.EnergyCons), s.Spacep), (timeGroup = (new ManagerGroup(filter((k, _arg_2) => {
        if (k.startsWith("heat")) {
            return true;
        }
        else {
            return k.startsWith("temporalFlux");
        }
    }, baseEffects), empty_1())), timeGroup), emptyGroup, scienceGroup(s.Spool), timeGroup_1(s.Tpool, false)]);
}

export function refreshCache(s) {
    const cache1 = updateCaches(s.Cache, groups(s));
    const s1 = new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, cache1, s.CalendarDay, s.Ticks, s.IronWill);
    let prodCtx;
    const calCtx = new CalendarContext((name) => getEffect_1(s1.Cache, name), 0, false, false, false, false, false, false, false, false, false, () => 0.5, (st) => st, (st_1) => st_1, (st_4) => st_4, (st_2) => st_2, (_arg) => {
    }, (st_3) => st_3);
    const fresh = freshProductionContext(s1.Cache, s1.Calendar, calCtx);
    prodCtx = (new ProductionContext(fresh.Cache, fresh.Calendar, fresh.CalendarCtx, fresh.SpaceManufacturingResearched, fresh.VillageResProduction, fresh.HGScalingBonus, fresh.SteamworksOn, fresh.SteamworksEffectGlobal, fresh.ParagonProductionRatio, fresh.WinterIsComingActive, fresh.CatnipPollutionRatio, fresh.LeaderRank, fresh.MagnetoOn, fresh.SolarRevolutionRatio, fresh.SolarRevolutionPollution, fresh.DisableCMBR, fresh.CMBRBonus, fresh.VillageResConsumption, length(s1.Vpool.Kittens), s1.Vpool.Happiness, getFreeKittens(s1.Vpool)));
    let pool1;
    const bind$0040 = s1.Pool;
    pool1 = (new ResPool(bind$0040.Order, map((_arg_1, res) => {
        if (res.Def.CalculatePerTick) {
            return new ResourceState(res.Def, res.Value, res.Unlocked, res.MaxValue, fixFloatPointNumber(calcResourcePerTick(prodCtx, s1.Pool, res.Def.Name)));
        }
        else {
            return res;
        }
    }, s1.Pool.ByName), bind$0040.KarmaKittens, bind$0040.EnergyProd, bind$0040.EnergyWinterProd, bind$0040.EnergyCons));
    return new State(pool1, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill);
}

export function init() {
    const fresh = new State(init_1(resourceDefs), init_2(buildingDefs), initScience(techDefs, policyDefs), initWorkshop(upgradeDefs, craftDefs), initVillage(jobDefs), init_3(), init_4(), init_5(), init_6(), init_7(), init_8(), init_9(), init_10, empty_2, 0, 0, true);
    return refreshCache(fresh);
}

export const browserRand = (() => {
    const r = nonSeeded();
    return () => r.NextDouble();
})();

export function dctxFor(s) {
    return new DiplomacyContext((name) => getEffect_1(s.Cache, name), (name_1) => resValue(s, name_1), (n) => getResMax(s.Pool, n), (n_1) => {
        const matchValue = get$(s.Pool, n_1);
        if (matchValue == null) {
            return false;
        }
        else {
            const r = matchValue;
            return r.Unlocked;
        }
    }, item(s.Calendar.Season, seasons).Name, false, false);
}

export function tick(s) {
    let option_1, matchValue_2, u, matchValue_3, u_1;
    const s1 = refreshCache(s);
    const uctx = new UpdateContext(capCtx(s1), (n) => {
        let r;
        const matchValue = get$(s1.Pool, n);
        let matchResult, r_1;
        if (matchValue != null) {
            if ((r = matchValue, r.Def.CalculatePerTick)) {
                matchResult = 0;
                r_1 = matchValue;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0:
                return r_1.PerTickCached;
            default:
                return 0;
        }
    }, s1.Calendar.Season, defaultArg((option_1 = get$_1(s1.Bpool, "pasture"), (option_1 != null) ? option_1.On : undefined), 0), 0, false, false);
    const pool1 = update(uctx, s1.CalendarDay, s1.Pool);
    const bpool1 = update_1(pool1, s1.Bpool);
    const s2 = new State(pool1, bpool1, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill);
    const maxKittens = calculateMaxKittens(s2.Cache, s2.Vpool) | 0;
    let vpool0;
    const bind$0040 = s2.Vpool;
    vpool0 = (new VillagePool(bind$0040.Kittens, bind$0040.NextKittenProgress, maxKittens, bind$0040.JobValues, bind$0040.JobUnlocked, bind$0040.Happiness, bind$0040.DeathTimeout, bind$0040.LeaderSeed, bind$0040.Traits));
    let kittensPerTick = 0.01 * (1 + getEffect_1(s2.Cache, "kittenGrowthRatio"));
    if (s2.Calendar.FestivalDays > 0) {
        kittensPerTick = (kittensPerTick * 2);
    }
    let catnipPerTickTrue;
    const matchValue_1 = get$(s2.Pool, "catnip");
    if (matchValue_1 == null) {
        catnipPerTickTrue = 0;
    }
    else {
        const r_2 = matchValue_1;
        catnipPerTickTrue = r_2.PerTickCached;
    }
    const catnipVal = getRes(s2.Pool, "catnip");
    const starving = (length(vpool0.Kittens) > 0) && ((catnipVal + catnipPerTickTrue) < 0);
    const preStarve = length(vpool0.Kittens) | 0;
    const vpool1 = starvationStep(catnipVal, catnipPerTickTrue, 5, false, maxKittens, vpool0);
    const growthRate = starving ? 0 : kittensPerTick;
    const beforeBirths = length(vpool1.Kittens) | 0;
    const vpool2 = simUpdate(maxKittens, growthRate, 1, browserRand, vpool1);
    const skillCtx = new SkillContext(false, (matchValue_2 = tryFind("internet", s2.Wpool.Upgrades), (matchValue_2 == null) ? false : ((u = matchValue_2, u.Researched))), (matchValue_3 = tryFind("neuralNetworks", s2.Wpool.Upgrades), (matchValue_3 == null) ? false : ((u_1 = matchValue_3, u_1.Researched))), getEffect_1(s2.Cache, "skillXP"), getEffect_1(s2.Cache, "maxKittensRatio"), s2.CalendarDay, (n_1) => (defaultArg(tryFind(n_1, vpool2.JobValues), 0) | 0), (n_2) => FSharpSet__Contains(vpool2.JobUnlocked, n_2), 1);
    const vpool3 = learnSkills(skillCtx, vpool2);
    const kittensRes = FSharpMap__get_Item(s2.Pool.ByName, "kittens");
    let pool2;
    const bind$0040_1 = s2.Pool;
    pool2 = (new ResPool(bind$0040_1.Order, add("kittens", new ResourceState(kittensRes.Def, length(vpool3.Kittens), kittensRes.Unlocked, vpool3.MaxKittens, kittensRes.PerTickCached), s2.Pool.ByName), bind$0040_1.KarmaKittens, bind$0040_1.EnergyProd, bind$0040_1.EnergyWinterProd, bind$0040_1.EnergyCons));
    let stpool1;
    let bumped;
    const sp_1 = bumpStat("totalKittens", length(vpool3.Kittens) - beforeBirths, s2.Stpool);
    bumped = bumpStat("kittensDead", preStarve - length(vpool3.Kittens), sp_1);
    stpool1 = bumped;
    const luxCount = sumBy((n_3) => {
        let r_3;
        const matchValue_4 = get$(pool2, n_3);
        let matchResult_1, r_4;
        if (matchValue_4 != null) {
            if ((r_3 = matchValue_4, (r_3.Def.Category !== "common") && (r_3.Value > 0))) {
                matchResult_1 = 0;
                r_4 = matchValue_4;
            }
            else {
                matchResult_1 = 1;
            }
        }
        else {
            matchResult_1 = 1;
        }
        switch (matchResult_1) {
            case 0:
                return 1;
            default:
                return 0;
        }
    }, pool2.Order, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
    const hctx = new HappinessContext((name_2) => getEffect_1(s2.Cache, name_2), freshHappinessContext.FascismResearched, s2.Calendar.FestivalDays, freshHappinessContext.Karma, freshHappinessContext.UpfrontPaymentResearched, luxCount, 0, freshHappinessContext.ElderBoxWithPaper, freshHappinessContext.ConsumableLuxuryCount);
    const vpool4 = new VillagePool(vpool3.Kittens, vpool3.NextKittenProgress, vpool3.MaxKittens, vpool3.JobValues, vpool3.JobUnlocked, updateHappiness(hctx, length(vpool3.Kittens), vpool3.MaxKittens), vpool3.DeathTimeout, vpool3.LeaderSeed, vpool3.Traits);
    const s3 = new State(pool2, s2.Bpool, s2.Spool, s2.Wpool, vpool4, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, stpool1, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill);
    const crCtx = new CraftRatioContext(s3.IronWill, undefined, 0, false, (n_4) => {
        let option_5;
        return defaultArg((option_5 = get$_1(s3.Bpool, n_4), (option_5 != null) ? option_5.Val : undefined), 0) | 0;
    });
    const prod = getResProduction(s3.Cache, s3.Vpool, ofList(map_1((j) => [j.Name, j], jobDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), s3.Wpool);
    const patternInput = craftByEngineers(s3.CalendarDay, s3.Cache, false, crCtx, (name_3) => resValue(s3, name_3), prod, false, 1, s3.Pool, s3.Wpool);
    const wpool1 = patternInput[1];
    const pool3 = patternInput[0];
    const pool4 = updateMaxValueAll(capCtx(s3), pool3);
    const calCtx = new CalendarContext((name_4) => getEffect_1(s3.Cache, name_4), 0, false, false, false, false, false, false, false, false, false, () => 0.5, (st) => st, (st_1) => st_1, (st_4) => st_4, (st_2) => st_2, (_arg) => {
    }, (st_3) => st_3);
    const calendar1 = tick_1(calCtx, s3.Calendar);
    let dp1;
    const dctx0 = dctxFor(s3);
    dp1 = update_2(s3.Dpool, dctx0, s3.Calendar.Year, s3.Pool.KarmaKittens, browserRand)[0];
    const s4 = new State(pool4, s3.Bpool, s3.Spool, wpool1, s3.Vpool, s3.Rpool, s3.Cpool, s3.Ppool, dp1, s3.Tpool, s3.Spacep, s3.Stpool, calendar1, s3.Cache, ~~calendar1.Day, s3.Ticks + 1, s3.IronWill);
    return refreshCache(s4);
}

export function gatherCatnip(s) {
    const pool1 = addResEvent(s.CalendarDay, "catnip", 1, s.Pool)[0];
    return new State(pool1, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
}

/**
 * Buy one unit of a building through the verified build path (pay + increment
 * + unlocks/upgrades fan-out tail).
 */
export function buyBuilding(name, s) {
    const matchValue = get$_1(s.Bpool, name);
    if (matchValue != null) {
        const patternInput = build(s.CalendarDay, s.Cache, pctx(s), s.Pool, 1, name, s.Bpool);
        const pool$0027 = patternInput[1];
        const built = patternInput[2] | 0;
        const bpool$0027 = patternInput[0];
        if (built === 0) {
            return s;
        }
        else {
            const s1 = new State(pool$0027, bpool$0027, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
            const s2 = FSharpMap__get_Item(s1.Bpool.ByName, name).Def.BreaksIronWill ? (new State(s1.Pool, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, false)) : s1;
            let s3;
            const matchValue_1 = FSharpMap__get_Item(s2.Bpool.ByName, name).Def.Unlocks;
            if (matchValue_1 == null) {
                s3 = s2;
            }
            else {
                const u = matchValue_1;
                const patternInput_1 = unlock(u.Buildings, u.Tabs, empty_1(), u.Tech, u.Policies, u.Upgrades, u.ZebraUpgrades, u.Crafts, s2.Bpool, s2.Spool, s2.Wpool);
                const wp2 = patternInput_1[2];
                const sp2 = patternInput_1[1];
                const bp2 = patternInput_1[0];
                s3 = (new State(s2.Pool, bp2, sp2, wp2, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill));
            }
            let s4;
            const matchValue_2 = FSharpMap__get_Item(s2.Bpool.ByName, name).Def.Upgrades;
            s4 = ((matchValue_2 == null) ? s3 : refreshCache(refreshCache(s3)));
            return refreshCache(s4);
        }
    }
    else {
        return s;
    }
}

export function crCtxFor(s) {
    let matchValue, p;
    return new CraftRatioContext(s.IronWill, undefined, getBurnedParagonRatio(resValue(s, "burnedParagon")), (matchValue = tryFind("monarchy", s.Spool.Policies), (matchValue == null) ? false : ((p = matchValue, p.Researched))), (n) => {
        let option_1;
        return defaultArg((option_1 = get$_1(s.Bpool, n), (option_1 != null) ? option_1.Val : undefined), 0) | 0;
    });
}

export function traditionResearched(s) {
    const matchValue = tryFind("tradition", s.Spool.Policies);
    if (matchValue == null) {
        return false;
    }
    else {
        const p = matchValue;
        return p.Researched;
    }
}

/**
 * orig getJobLimit (js/village.js L308-358) — the caps we can hit at this slice
 */
export function jobLimit(s, jobName) {
    let option_1;
    switch (jobName) {
        case "engineer":
            return defaultArg((option_1 = get$_1(s.Bpool, "factory"), (option_1 != null) ? option_1.Val : undefined), 0) | 0;
        case "ambassador":
            return 0;
        default:
            return 100000;
    }
}

export function assignJob(jobName, n, s) {
    const before = defaultArg(tryFind(jobName, s.Vpool.JobValues), 0) | 0;
    const vpool1 = assignJob_1(jobName, n, jobLimit(s, jobName), s.Vpool);
    const assigned = defaultArg(tryFind(jobName, vpool1.JobValues), 0) | 0;
    if (assigned > before) {
        const vpool2 = simAssignJob(jobName, assigned - before, vpool1);
        return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, vpool2, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
    }
    else {
        return s;
    }
}

export function unassignJob(jobName, n, s) {
    const before = defaultArg(tryFind(jobName, s.Vpool.JobValues), 0) | 0;
    const amt = min(n, before) | 0;
    if (amt <= 0) {
        return s;
    }
    else {
        const vpool1 = assignJob_1(jobName, op_UnaryNegation_Int32(amt), jobLimit(s, jobName), s.Vpool);
        const assignedKittens = filter_1((k) => equals(k.Job, jobName), vpool1.Kittens);
        const releaseSet = ofList_1(map_1((k_1) => (k_1.Seed | 0), truncate(amt, reverse(assignedKittens))), {
            Compare: (x, y) => (comparePrimitives(x, y) | 0),
        });
        const kittens$0027 = map_1((k_2) => {
            if (contains(k_2.Seed, releaseSet)) {
                return new Kitten(k_2.Name, k_2.Surname, undefined, k_2.Rank, k_2.Exp, k_2.Seed, k_2.Trait, k_2.Age, k_2.Color, k_2.Variety, k_2.Rarity, k_2.IsLeader, k_2.Skills, k_2.EngineerSpeciality);
            }
            else {
                return k_2;
            }
        }, vpool1.Kittens);
        return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, new VillagePool(kittens$0027, vpool1.NextKittenProgress, vpool1.MaxKittens, vpool1.JobValues, vpool1.JobUnlocked, vpool1.Happiness, vpool1.DeathTimeout, vpool1.LeaderSeed, vpool1.Traits), s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
    }
}

export function research(name, s) {
    let t, bind$0040;
    const patternInput = research_1(s.CalendarDay, name, s.Pool, s.Spool);
    const spool$0027 = patternInput[1];
    const pool$0027 = patternInput[0];
    const ok = patternInput[2];
    if (!ok) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, spool$0027, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        let s2;
        const matchValue = getTech(spool$0027, name);
        let matchResult, t_1;
        if (matchValue != null) {
            if ((t = matchValue, t.Def.Upgrades != null)) {
                matchResult = 0;
                t_1 = matchValue;
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
                s2 = refreshCache(refreshCache(s1));
                break;
            }
            default:
                s2 = s1;
        }
        let s3;
        const matchValue_1 = getTech(s2.Spool, name);
        if (matchValue_1 == null) {
            s3 = s2;
        }
        else {
            const t_2 = matchValue_1;
            const matchValue_2 = t_2.Def.Unlocks;
            if (matchValue_2 == null) {
                s3 = s2;
            }
            else {
                const u = matchValue_2;
                const patternInput_1 = unlock(u.Buildings, u.Tabs, u.Jobs, u.Tech, u.Policies, u.Upgrades, u.ZebraUpgrades, u.Crafts, s2.Bpool, s2.Spool, s2.Wpool);
                const wp2 = patternInput_1[2];
                const sp2 = patternInput_1[1];
                const bp2 = patternInput_1[0];
                s3 = (new State(s2.Pool, bp2, sp2, wp2, (bind$0040 = s2.Vpool, new VillagePool(bind$0040.Kittens, bind$0040.NextKittenProgress, bind$0040.MaxKittens, bind$0040.JobValues, union(ofList_1(u.Jobs, {
                    Compare: (x, y) => (comparePrimitives(x, y) | 0),
                }), s2.Vpool.JobUnlocked), bind$0040.Happiness, bind$0040.DeathTimeout, bind$0040.LeaderSeed, bind$0040.Traits)), s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill));
            }
        }
        return refreshCache(s3);
    }
}

export function buyUpgrade(name, s) {
    const patternInput = buyUpgrade_1(s.CalendarDay, name, s.Pool, s.Wpool);
    const wpool$0027 = patternInput[1];
    const pool$0027 = patternInput[0];
    const ok = patternInput[2];
    if (ok) {
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, wpool$0027, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill));
    }
    else {
        return s;
    }
}

export function craft(name, amt, s) {
    const patternInput = craft_1(s.CalendarDay, s.Cache, traditionResearched(s), crCtxFor(s), name, amt, s.Pool, s.Wpool);
    const wpool$0027 = patternInput[1];
    const pool$0027 = patternInput[0];
    const ok = patternInput[2];
    if (!ok) {
        return s;
    }
    else {
        const ratio = getResCraftRatio(s.Cache, crCtxFor(s), name);
        let wp2;
        const matchValue = tryFind(name, wpool$0027.Crafts);
        if (matchValue == null) {
            wp2 = wpool$0027;
        }
        else {
            const c = matchValue;
            wp2 = (new WorkshopPool(wpool$0027.UpgradeOrder, wpool$0027.Upgrades, wpool$0027.CraftOrder, add(name, new CraftState(c.Def, c.Unlocked, c.Value + (Math.ceil(amt) * (1 + ratio)), c.Progress, c.IsLimited, c.IsLimitedAmt), wpool$0027.Crafts), wpool$0027.ZebraOrder, wpool$0027.ZebraUpgrades));
        }
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, wp2, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill));
    }
}

export function craftAll(name, s) {
    const patternInput = craftAll_1(s.CalendarDay, s.Cache, traditionResearched(s), crCtxFor(s), (name_1) => resValue(s, name_1), name, s.Pool, s.Wpool);
    const wpool$0027 = patternInput[1];
    const pool$0027 = patternInput[0];
    const ok = patternInput[2];
    if (ok) {
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, wpool$0027, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill));
    }
    else {
        return s;
    }
}

export function praise(s) {
    let bind$0040_1;
    const faithValue = getRes(s.Pool, "faith");
    const rpool$0027 = praise_1(s.Rpool, faithValue);
    let pool$0027;
    const bind$0040 = s.Pool;
    pool$0027 = (new ResPool(bind$0040.Order, add("faith", (bind$0040_1 = FSharpMap__get_Item(s.Pool.ByName, "faith"), new ResourceState(bind$0040_1.Def, 0.0001, bind$0040_1.Unlocked, bind$0040_1.MaxValue, bind$0040_1.PerTickCached)), s.Pool.ByName), bind$0040.KarmaKittens, bind$0040.EnergyProd, bind$0040.EnergyWinterProd, bind$0040.EnergyCons));
    return new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, rpool$0027, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
}

export function buyRU(name, s) {
    const patternInput = buyRU_1(s.CalendarDay, s.Cache, s.Pool, 1, name, s.Rpool);
    const rpool$0027 = patternInput[0];
    const res = patternInput[2];
    const pool$0027 = patternInput[1];
    if (res.Bought === 0) {
        return s;
    }
    else {
        const rpool2 = freezeSolarRevolution(s.Cache, rpool$0027);
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, rpool2, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        let s2;
        const matchValue = res.UnlockFanOut;
        if (matchValue == null) {
            s2 = s1;
        }
        else {
            const u = matchValue;
            const patternInput_1 = unlock(u.Buildings, u.Tabs, u.Jobs, u.Tech, u.Policies, u.Upgrades, u.ZebraUpgrades, u.Crafts, s1.Bpool, s1.Spool, s1.Wpool);
            const wp2 = patternInput_1[2];
            const sp2 = patternInput_1[1];
            const bp2 = patternInput_1[0];
            s2 = (new State(s1.Pool, bp2, sp2, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill));
        }
        return refreshCache(s2);
    }
}

export function buyZU(name, s) {
    const patternInput = buyZU_1(s.CalendarDay, s.Cache, s.Pool, 1, name, s.Rpool);
    const rpool$0027 = patternInput[0];
    const res = patternInput[2];
    const pool$0027 = patternInput[1];
    if (res.Bought === 0) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, rpool$0027, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        let s2;
        const matchValue = res.UnlockFanOut;
        if (matchValue == null) {
            s2 = s1;
        }
        else {
            const u = matchValue;
            const patternInput_1 = unlock(u.Buildings, u.Tabs, u.Jobs, u.Tech, u.Policies, u.Upgrades, u.ZebraUpgrades, u.Crafts, s1.Bpool, s1.Spool, s1.Wpool);
            const wp2 = patternInput_1[2];
            const sp2 = patternInput_1[1];
            const bp2 = patternInput_1[0];
            s2 = (new State(s1.Pool, bp2, sp2, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill));
        }
        return refreshCache(s2);
    }
}

export function trade(raceName, s) {
    let option_1;
    const dctx = dctxFor(s);
    const raceState = FSharpMap__get_Item(s.Dpool.Races, raceName);
    const manp = getManpowerCost(s.Dpool, dctx, 0, false);
    const gold = getGoldCost(s.Dpool, dctx, 0, false);
    const volume = getTradeVolume(dctx, empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }));
    const buyPrice = item(0, raceState.Buys).Val * volume;
    const cost = ofArray([["manpower", manp], ["gold", gold], [item(0, raceState.Buys).Resource, buyPrice]]);
    if (!hasRes(s.Pool, cost, 0)) {
        return s;
    }
    else {
        const pool$0027 = payPrices(s.CalendarDay, s.Pool, cost);
        const tradeBonus = getTradeBonusEffect(s.Cpool, (name) => getEffect_1(s.Cache, name), defaultArg((option_1 = get$_1(s.Bpool, "tradepost"), (option_1 != null) ? option_1.Val : undefined), 0));
        const dp$0027 = tradeImpl(s.Dpool, dctx, browserRand, raceName, 1, empty({
            Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
        }), getEffect_1(s.Cache, "standingRatio") * 0.015, false, getEffect_1(s.Cache, "neutralRaceEmbassyStanding"), tradeBonus, 0, false)[0];
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, dp$0027, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill));
    }
}

export function buyEmbassy(raceName, s) {
    const patternInput = buyEmbassies(s.CalendarDay, s.Dpool, dctxFor(s), s.Pool, 1, raceName);
    const pool$0027 = patternInput[1];
    const dp$0027 = patternInput[0];
    const built = patternInput[2] | 0;
    if (built === 0) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, dp$0027, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        let s2;
        if (getPerk(s.Ppool, "diplomacy").Researched) {
            const spool$0027 = unlockRelations(true, (r) => (FSharpMap__get_Item(s1.Dpool.Races, r).EmbassyLevel | 0), s1.Spool)[0];
            s2 = (new State(s1.Pool, s1.Bpool, spool$0027, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill));
        }
        else {
            s2 = s1;
        }
        return refreshCache(s2);
    }
}

export function buyProgram(name, s) {
    let bind$0040;
    const patternInput = buyProgram_1((name_1) => getEffect_1(s.Cache, name_1), false, s.CalendarDay, name, 1, s.Spacep, s.Pool);
    const sp$0027 = patternInput[0];
    const pool$0027 = patternInput[1];
    const counter = patternInput[2] | 0;
    if (counter === 0) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, sp$0027, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        const def = find((d) => (d.Name === name), programDefs);
        const spool2 = map((k, v) => {
            if (contains_1(k, def.UnlocksPolicies, {
                Equals: (x, y) => (x === y),
                GetHashCode: (x) => (stringHash(x) | 0),
            })) {
                return new PolicyState(v.Def, true, v.Researched, v.Blocked, v.Effects);
            }
            else {
                return v;
            }
        }, s1.Spool.Policies);
        return refreshCache(new State(s1.Pool, s1.Bpool, (bind$0040 = s1.Spool, new SciencePool(bind$0040.TechOrder, bind$0040.Techs, bind$0040.PolicyOrder, spool2)), s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill));
    }
}

export function buySpaceBuilding(name, s) {
    const patternInput = buyBuilding_1((name_1) => getEffect_1(s.Cache, name_1), false, s.CalendarDay, name, 1, s.Spacep, s.Pool);
    const sp$0027 = patternInput[0];
    const pool$0027 = patternInput[1];
    const counter = patternInput[2] | 0;
    if (counter === 0) {
        return s;
    }
    else {
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, sp$0027, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill));
    }
}

export function timeCalcCtxFor(s) {
    return new TimeCalcContext((name) => getEffect_1(s.Cache, name), FSharpMap__get_Item(s.Cpool.Challenges, "1000Years").On, getTU(s.Rpool, "blazar").Val, length(cycleYearColors));
}

export function buyCFU(name, s) {
    const patternInput = buyCFU_1((name_1) => getEffect_1(s.Cache, name_1), s.CalendarDay, name, 1, s.Tpool, s.Pool);
    const tp$0027 = patternInput[0];
    const pool$0027 = patternInput[1];
    const counter = patternInput[2] | 0;
    if (counter === 0) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, tp$0027, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        const def = cfuDef(name);
        const wp2 = fold((acc, up) => {
            const matchValue = tryFind(up, acc.Upgrades);
            if (matchValue == null) {
                return acc;
            }
            else {
                const u = matchValue;
                return new WorkshopPool(acc.UpgradeOrder, add(up, new UpgradeState(u.Def, true, u.Researched), acc.Upgrades), acc.CraftOrder, acc.Crafts, acc.ZebraOrder, acc.ZebraUpgrades);
            }
        }, s1.Wpool, def.UnlocksUpgrades);
        const tp2 = fold((acc_1, cfuName) => {
            const m$0027 = FSharpMap__get_Item(acc_1.CFUs, cfuName);
            return new TimePool(acc_1.Flux, acc_1.Heat, acc_1.IsAccelerated, acc_1.TestShatter, add(cfuName, new TimeMeta(m$0027.Val, m$0027.On, true, m$0027.Researched, m$0027.Heat, m$0027.DelayTicks, m$0027.IsAutomationEnabled, m$0027.Eff, m$0027.PriceRatioDyn), acc_1.CFUs), acc_1.CfuOrder, acc_1.VSUs, acc_1.VsuOrder);
        }, s1.Tpool, def.UnlocksCFU);
        const s2 = new State(s1.Pool, s1.Bpool, s1.Spool, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, tp2, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill);
        const s3 = new State(s2.Pool, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, cfuCalculate(timeCalcCtxFor(s2), name, s2.Tpool), s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill);
        return refreshCache(s3);
    }
}

export function buyVSU(name, s) {
    let bind$0040;
    const burnRatio = getBurnedParagonRatio(resValue(s, "burnedParagon"));
    const patternInput = buyVSU_1(s.CalendarDay, name, 1, burnRatio, s.Tpool, s.Pool);
    const tp$0027 = patternInput[0];
    const pool$0027 = patternInput[1];
    const counter = patternInput[2] | 0;
    if (counter === 0) {
        return s;
    }
    else {
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, tp$0027, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
        const s2 = equals(vsuDef(name).BreaksIronWill, true) ? (new State(s1.Pool, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, false)) : s1;
        let s3;
        if (name === "cryochambers") {
            const m$0027 = FSharpMap__get_Item(s2.Tpool.VSUs, "cryochambers");
            s3 = (new State(s2.Pool, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, (bind$0040 = s2.Tpool, new TimePool(bind$0040.Flux, bind$0040.Heat, bind$0040.IsAccelerated, bind$0040.TestShatter, bind$0040.CFUs, bind$0040.CfuOrder, add("cryochambers", new TimeMeta(m$0027.Val, m$0027.On, true, m$0027.Researched, m$0027.Heat, m$0027.DelayTicks, m$0027.IsAutomationEnabled, m$0027.Eff, m$0027.PriceRatioDyn), s2.Tpool.VSUs), bind$0040.VsuOrder)), s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill));
        }
        else {
            s3 = s2;
        }
        return refreshCache(s3);
    }
}

export function toggleChallengePending(name, s) {
    const c = FSharpMap__get_Item(s.Cpool.Challenges, name);
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, new ChallengePool(add(name, new ChallengeState(c.Unlocked, !c.Pending, c.Active, c.Researched, c.On), s.Cpool.Challenges), s.Cpool.Order), s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill);
}

export class ResRow extends Record {
    constructor(Name, Value, Max, Show) {
        super();
        this.Name = Name;
        this.Value = Value;
        this.Max = Max;
        this.Show = Show;
    }
}

export function ResRow_$reflection() {
    return record_type("kittens_land.KittensState.ResRow", [], ResRow, () => [["Name", string_type], ["Value", float64_type], ["Max", float64_type], ["Show", bool_type]]);
}

export function resRows(s) {
    return map_1((n) => {
        let matchValue, r;
        return new ResRow(n, getRes(s.Pool, n), getResMax(s.Pool, n), (matchValue = get$(s.Pool, n), (matchValue == null) ? false : ((r = matchValue, (r.Unlocked ? true : (r.Value > 0)) ? true : (r.Def.Name === "catnip")))));
    }, truncate(10, s.Pool.Order));
}

export class PriceRow extends Record {
    constructor(Resource, Val) {
        super();
        this.Resource = Resource;
        this.Val = Val;
    }
}

export function PriceRow_$reflection() {
    return record_type("kittens_land.KittensState.PriceRow", [], PriceRow, () => [["Resource", string_type], ["Val", float64_type]]);
}

export class BuildingRow extends Record {
    constructor(Name, Label, Visible, Enabled, Val, Prices) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Visible = Visible;
        this.Enabled = Enabled;
        this.Val = (Val | 0);
        this.Prices = Prices;
    }
}

export function BuildingRow_$reflection() {
    return record_type("kittens_land.KittensState.BuildingRow", [], BuildingRow, () => [["Name", string_type], ["Label", string_type], ["Visible", bool_type], ["Enabled", bool_type], ["Val", int32_type], ["Prices", list_type(PriceRow_$reflection())]]);
}

export class JobRow extends Record {
    constructor(Name, Label, Assigned, Unlocked) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Assigned = (Assigned | 0);
        this.Unlocked = Unlocked;
    }
}

export function JobRow_$reflection() {
    return record_type("kittens_land.KittensState.JobRow", [], JobRow, () => [["Name", string_type], ["Label", string_type], ["Assigned", int32_type], ["Unlocked", bool_type]]);
}

export class TechRow extends Record {
    constructor(Name, Label, Prices, Unlocked, Researched, Enabled) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Prices = Prices;
        this.Unlocked = Unlocked;
        this.Researched = Researched;
        this.Enabled = Enabled;
    }
}

export function TechRow_$reflection() {
    return record_type("kittens_land.KittensState.TechRow", [], TechRow, () => [["Name", string_type], ["Label", string_type], ["Prices", list_type(PriceRow_$reflection())], ["Unlocked", bool_type], ["Researched", bool_type], ["Enabled", bool_type]]);
}

export class UpgradeRow extends Record {
    constructor(Name, Label, Prices, Unlocked, Researched, Enabled) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Prices = Prices;
        this.Unlocked = Unlocked;
        this.Researched = Researched;
        this.Enabled = Enabled;
    }
}

export function UpgradeRow_$reflection() {
    return record_type("kittens_land.KittensState.UpgradeRow", [], UpgradeRow, () => [["Name", string_type], ["Label", string_type], ["Prices", list_type(PriceRow_$reflection())], ["Unlocked", bool_type], ["Researched", bool_type], ["Enabled", bool_type]]);
}

export class CraftRow extends Record {
    constructor(Name, Label, Prices, Value, Unlocked) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Prices = Prices;
        this.Value = Value;
        this.Unlocked = Unlocked;
    }
}

export function CraftRow_$reflection() {
    return record_type("kittens_land.KittensState.CraftRow", [], CraftRow, () => [["Name", string_type], ["Label", string_type], ["Prices", list_type(PriceRow_$reflection())], ["Value", float64_type], ["Unlocked", bool_type]]);
}

export function jobRows(s) {
    return map_1((jd) => (new JobRow(jd.Name, get$_2("job." + jd.Name), defaultArg(tryFind(jd.Name, s.Vpool.JobValues), 0), FSharpSet__Contains(s.Vpool.JobUnlocked, jd.Name))), jobDefs);
}

export function kittenSummary(s) {
    return [length(s.Vpool.Kittens), s.Vpool.MaxKittens, s.Vpool.Happiness];
}

export function techRows(s) {
    return choose((n) => {
        let t;
        const matchValue = tryFind(n, s.Spool.Techs);
        let matchResult, t_1;
        if (matchValue != null) {
            if ((t = matchValue, t.Unlocked)) {
                matchResult = 0;
                t_1 = matchValue;
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
                const prices = map_1((p) => (new PriceRow(p.Resource, p.Val)), t_1.Def.Prices);
                const affordable = hasRes(s.Pool, map_1((p_1) => [p_1.Resource, p_1.Val], t_1.Def.Prices), 0);
                return new TechRow(n, get$_2("tech." + n), prices, true, t_1.Researched, affordable && !t_1.Researched);
            }
            default:
                return undefined;
        }
    }, s.Spool.TechOrder);
}

export function upgradeRows(s) {
    return choose((n) => {
        let u;
        const matchValue = tryFind(n, s.Wpool.Upgrades);
        let matchResult, u_1;
        if (matchValue != null) {
            if ((u = matchValue, u.Unlocked)) {
                matchResult = 0;
                u_1 = matchValue;
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
                const prices = map_1((p) => (new PriceRow(p.Resource, p.Val)), u_1.Def.Prices);
                const affordable = hasRes(s.Pool, map_1((p_1) => [p_1.Resource, p_1.Val], u_1.Def.Prices), 0);
                return new UpgradeRow(n, get$_2("up." + n), prices, true, u_1.Researched, affordable && !u_1.Researched);
            }
            default:
                return undefined;
        }
    }, s.Wpool.UpgradeOrder);
}

export function craftRows(s) {
    return choose((n) => {
        let c;
        const matchValue = tryFind(n, s.Wpool.Crafts);
        let matchResult, c_1;
        if (matchValue != null) {
            if ((c = matchValue, c.Unlocked)) {
                matchResult = 0;
                c_1 = matchValue;
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
                const prices = map_1((p) => (new PriceRow(p.Resource, p.Val)), c_1.Def.Prices);
                return new CraftRow(n, get$_2("craft." + n), prices, c_1.Value, true);
            }
            default:
                return undefined;
        }
    }, s.Wpool.CraftOrder);
}

export class RaceRow extends Record {
    constructor(Name, Label, Unlocked, Standing, EmbassyLevel, Tradeable) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Unlocked = Unlocked;
        this.Standing = Standing;
        this.EmbassyLevel = (EmbassyLevel | 0);
        this.Tradeable = Tradeable;
    }
}

export function RaceRow_$reflection() {
    return record_type("kittens_land.KittensState.RaceRow", [], RaceRow, () => [["Name", string_type], ["Label", string_type], ["Unlocked", bool_type], ["Standing", float64_type], ["EmbassyLevel", int32_type], ["Tradeable", bool_type]]);
}

export function raceRows(s) {
    return map_1((n_1) => {
        const def = find((r) => (r.Name === n_1), raceDefs);
        return new RaceRow(n_1, get$_2("race." + n_1), true, find((r_1) => (r_1.Name === n_1), raceDefs).Standing, FSharpMap__get_Item(s.Dpool.Races, n_1).EmbassyLevel, !isEmpty(def.Buys));
    }, filter_1((n) => FSharpMap__get_Item(s.Dpool.Races, n).Unlocked, s.Dpool.RaceOrder));
}

export class ReligionRow extends Record {
    constructor(Name, Label, Kind, Val, Unlocked, Enabled) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Kind = Kind;
        this.Val = (Val | 0);
        this.Unlocked = Unlocked;
        this.Enabled = Enabled;
    }
}

export function ReligionRow_$reflection() {
    return record_type("kittens_land.KittensState.ReligionRow", [], ReligionRow, () => [["Name", string_type], ["Label", string_type], ["Kind", string_type], ["Val", int32_type], ["Unlocked", bool_type], ["Enabled", bool_type]]);
}

export function religionRows(s) {
    const ruRows = map_1((n_1) => {
        const m_1 = getRU(s.Rpool, n_1);
        return new ReligionRow(n_1, get$_2("ru." + n_1), "ru", m_1.Val, true, true);
    }, filter_1((n) => {
        let matchValue, f;
        const def = find((d) => (d.Name === n), ruDefs);
        const m = getRU(s.Rpool, n);
        if ((def.FaithGate != null) && m.Unlocked) {
            if (m.Val > 0) {
                return true;
            }
            else {
                return s.Rpool.Faith >= ((matchValue = def.FaithGate, (matchValue == null) ? 0 : ((f = matchValue, f))));
            }
        }
        else {
            return false;
        }
    }, s.Rpool.RuOrder));
    const zuRows = map_1((n_3) => {
        const m_2 = getZU(s.Rpool, n_3);
        return new ReligionRow(n_3, get$_2("zu." + n_3), "zu", m_2.Val, true, true);
    }, filter_1((n_2) => getZU(s.Rpool, n_2).Unlocked, s.Rpool.ZuOrder));
    return append(zuRows, ruRows);
}

export class SpaceRow extends Record {
    constructor(Name, Label, Kind, Val, Enabled) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Kind = Kind;
        this.Val = (Val | 0);
        this.Enabled = Enabled;
    }
}

export function SpaceRow_$reflection() {
    return record_type("kittens_land.KittensState.SpaceRow", [], SpaceRow, () => [["Name", string_type], ["Label", string_type], ["Kind", string_type], ["Val", int32_type], ["Enabled", bool_type]]);
}

export function spaceRows(s) {
    const progRows = map_1((n_1) => {
        const m = getProgram(s.Spacep, n_1);
        const def = find((d) => (d.Name === n_1), programDefs);
        const affordable = hasRes(s.Pool, map_1((p) => [p.Resource, p.Val], def.Prices), 0);
        return new SpaceRow(n_1, get$_2("mission." + n_1), "mission", m.Val, affordable);
    }, filter_1((n) => {
        if (getProgram(s.Spacep, n).Unlocked) {
            return getProgram(s.Spacep, n).Val === 0;
        }
        else {
            return false;
        }
    }, s.Spacep.ProgramOrder));
    const bldRows = map_1((n_3) => {
        const m_1 = getBuilding(s.Spacep, n_3);
        const def_1 = find((d_1) => (d_1.Name === n_3), buildingDefs_1);
        const prices = map_1((p_1) => {
            const ratio = Math.pow(1.05, m_1.Val);
            return [p_1.Resource, p_1.Val * ratio];
        }, def_1.Prices);
        const affordable_1 = hasRes(s.Pool, prices, 0);
        return new SpaceRow(n_3, get$_2("sbld." + n_3), "sbld", m_1.Val, affordable_1);
    }, filter_1((n_2) => getBuilding(s.Spacep, n_2).Unlocked, s.Spacep.BuildingOrder));
    return append(progRows, bldRows);
}

export class TimeRow extends Record {
    constructor(Name, Label, Kind, Val, Enabled) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Kind = Kind;
        this.Val = (Val | 0);
        this.Enabled = Enabled;
    }
}

export function TimeRow_$reflection() {
    return record_type("kittens_land.KittensState.TimeRow", [], TimeRow, () => [["Name", string_type], ["Label", string_type], ["Kind", string_type], ["Val", int32_type], ["Enabled", bool_type]]);
}

export function timeRows(s) {
    const cfuRows = map_1((n_1) => {
        let lb;
        const m = FSharpMap__get_Item(s.Tpool.CFUs, n_1);
        const def = cfuDef(n_1);
        let capped;
        const matchValue = def.LimitBuild;
        let matchResult, lb_1;
        if (matchValue != null) {
            if ((lb = (matchValue | 0), lb <= m.Val)) {
                matchResult = 0;
                lb_1 = matchValue;
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
                capped = true;
                break;
            }
            default:
                capped = false;
        }
        let affordable;
        if (capped) {
            affordable = false;
        }
        else {
            const ratio = Math.pow(def.PriceRatio, m.Val);
            affordable = hasRes(s.Pool, map_1((p) => [p.Resource, p.Val * ratio], def.Prices), 0);
        }
        return new TimeRow(n_1, get$_2("cfu." + n_1), "cfu", m.Val, affordable && !capped);
    }, filter_1((n) => FSharpMap__get_Item(s.Tpool.CFUs, n).Unlocked, s.Tpool.CfuOrder));
    const vsuRows = map_1((n_3) => {
        const m_1 = FSharpMap__get_Item(s.Tpool.VSUs, n_3);
        const def_1 = vsuDef(n_3);
        const affordable_1 = hasRes(s.Pool, map_1((p_1) => [p_1.Resource, p_1.Val], def_1.Prices), 0);
        return new TimeRow(n_3, get$_2("vsu." + n_3), "vsu", m_1.Val, affordable_1);
    }, filter_1((n_2) => {
        if (n_2 !== "usedCryochambers") {
            return FSharpMap__get_Item(s.Tpool.VSUs, n_2).Unlocked;
        }
        else {
            return false;
        }
    }, s.Tpool.VsuOrder));
    return append(cfuRows, vsuRows);
}

export class ChallengeRow extends Record {
    constructor(Name, Label, Unlocked, Pending, Active, Researched, On) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Unlocked = Unlocked;
        this.Pending = Pending;
        this.Active = Active;
        this.Researched = Researched;
        this.On = (On | 0);
    }
}

export function ChallengeRow_$reflection() {
    return record_type("kittens_land.KittensState.ChallengeRow", [], ChallengeRow, () => [["Name", string_type], ["Label", string_type], ["Unlocked", bool_type], ["Pending", bool_type], ["Active", bool_type], ["Researched", bool_type], ["On", int32_type]]);
}

export function challengeRows(s) {
    return map_1((n_1) => {
        const c = FSharpMap__get_Item(s.Cpool.Challenges, n_1);
        return new ChallengeRow(n_1, get$_2("challenge." + n_1), true, c.Pending, c.Active, c.Researched, c.On);
    }, filter_1((n) => FSharpMap__get_Item(s.Cpool.Challenges, n).Unlocked, s.Cpool.Order));
}

export function buildingRows(s) {
    return choose((n) => {
        const matchValue = get$_1(s.Bpool, n);
        if (matchValue != null) {
            const b = matchValue;
            if (!b.Unlocked) {
                return undefined;
            }
            else {
                const prices = getAllPrices(s.Cache, pctx(s), b);
                const affordable = hasRes(s.Pool, map_1((p) => [p.Resource, p.Val], prices), 0);
                return new BuildingRow(n, get$_2("bld." + n), true, affordable, b.Val, map_1((p_1) => (new PriceRow(p_1.Resource, p_1.Val)), prices));
            }
        }
        else {
            return undefined;
        }
    }, s.Bpool.Order);
}

