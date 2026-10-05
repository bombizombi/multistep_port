
import { toString, Record } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { class_type, list_type, lambda_type, float64_type, unit_type, record_type, bool_type, option_type, string_type, int32_type } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { CraftState, UpgradeState, PolicyState, ResearchState, BuildingState, ResPool, ResourceState, ResPool_$reflection } from "./Game/Game.Types.fs.js";
import { getAllPrices, update as update_1, build, BldPool, init as init_2, providerEffect, activeEffects, get$ as get$_1, PricingContext, freshPricing, BldPool_$reflection } from "./Game/Game.Buildings.fs.js";
import { getCraftAllCount, craftByEngineers, learnSkills, SkillContext, simUpdate, starvationStep, unlockRelations, craftAll as craftAll_1, craft as craft_1, buyUpgrade as buyUpgrade_1, getTech, research as research_1, simAssignJob, assignJob as assignJob_1, unlock, CraftRatioContext, getResCraftRatio, calculateMaxKittens, VillagePool, Kitten, kittenFromSeed, WorkshopPool, SciencePool, initVillage, initWorkshop, initScience, getFreeKittens, getResProduction, scienceGroup, workshopEffectsBase, VillagePool_$reflection, WorkshopPool_$reflection, SciencePool_$reflection } from "./Game/Game.Managers.fs.js";
import { getTU, buyZU as buyZU_1, freezeSolarRevolution, buyRU as buyRU_1, praise as praise_1, ReligionMeta, ReligionPool, getRU, getZU, init as init_3, religionGroup, ReligionPool_$reflection } from "./Game/Game.Religion.fs.js";
import { getTradeBonusEffect, ChallengePool, ChallengeState, init as init_4, challengesGroup, ChallengePool_$reflection } from "./Game/Game.Challenges.fs.js";
import { getPerk, getBurnedParagonRatio, init as init_5, prestigeGroup, PrestigePool_$reflection } from "./Game/Game.Prestige.fs.js";
import { hasUnlockedRaces, update as update_2, buyEmbassies, tradeImpl, getTradeVolume, getGoldCost, getManpowerCost, DiplomacyPool, RaceState, DiplomacyContext, init as init_6, DiplomacyPool_$reflection } from "./Game/Game.Diplomacy.fs.js";
import { vsuDef, buyVSU as buyVSU_1, cfuCalculate, cfuDef, buyCFU as buyCFU_1, TimeCalcContext, TimePool, TimeMeta, init as init_7, timeGroup as timeGroup_1, TimePool_$reflection } from "./Game/Game.Time.fs.js";
import { buyBuilding as buyBuilding_1, buyProgram as buyProgram_1, SpacePool, SpaceMeta, getProgram, getBuilding, init as init_8, spaceGroup, SpacePool_$reflection } from "./Game/Game.Space.fs.js";
import { bumpStat, init as init_9, StatsPool_$reflection } from "./Game/Game.Stats.fs.js";
import { tick as tick_1, cycleYearColors, CalendarState, seasons, init as init_10, CalendarContext, CalendarState_$reflection } from "./Game/Game.Calendar.fs.js";
import { empty as empty_2, updateCaches, ManagerGroup, getEffect as getEffect_1, EffectsCache_$reflection } from "./Game/Game.Effects.fs.js";
import { settingsArr, OptsState, setBool, freshOpts, OptsState_$reflection } from "./Game/Game.Settings.fs.js";
import { defaultArg } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { updateMaxValueAll, update, UpdateContext, hasRes, payPrices, addResEvent, init as init_1, getEnergyDelta, CapContext, get$ } from "./Game/Game.Resources.fs.js";
import { toList, add as add_1, FSharpMap__get_Item, map as map_1, ofList, filter, tryFind, empty } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { equals, disposeSafe, getEnumerator, int32ToString, round, stringHash, comparePrimitives } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { find, reverse, truncate, filter as filter_1, fold, tryFind as tryFind_1, updateAt, removeAt, tryLast, contains, sumBy, tail, singleton, append, head, isEmpty, item, length, map, ofArray, choose, empty as empty_1 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { baseEffects, bldBase } from "./Game/Game.Catalog.BaseEffects.fs.js";
import { calcResourcePerTick, fixFloatPointNumber, ProductionContext, freshProductionContext } from "./Game/Game.Production.fs.js";
import { jobDefs } from "./Game/Game.Catalog.Village.fs.js";
import { op_BitwiseAnd, toInt64_unchecked, toUInt32_unchecked } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/BigInt.js";
import { resourceDefs } from "./Game/Game.Catalog.Resources.fs.js";
import { craftDefs, upgradeDefs, policyDefs, techDefs, buildingDefs } from "./Game/Game.Catalog.Defs.fs.js";
import { contains as contains_1, ofList as ofList_1, union, ofArray as ofArray_1, toList as toList_1, FSharpSet__get_IsEmpty, add, FSharpSet__Contains, empty as empty_3 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Set.js";
import { parse, min } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { getLimitedDR } from "./Game/Game.Math.fs.js";
import { StringBuilder__AppendLine_Z721C83C5, StringBuilder_$ctor } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/System.Text.js";
import { replace, split, join, printf, toText } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { item as item_1 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Array.js";
import { op_UnaryNegation_Int32, parse as parse_1 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Int32.js";
import { buildingDefs as buildingDefs_1, programDefs } from "./Game/Game.Catalog.Space.fs.js";
import { updateHappiness, HappinessContext, freshHappinessContext } from "./Game/Game.Happiness.fs.js";
import { get$ as get$_2 } from "./Game.Labels.fs.js";
import { ruDefs, raceDefs } from "./Game/Game.Catalog.World.fs.js";

/**
 * core.js logmsg subset — browser console panel
 */
export class ConsoleMsg extends Record {
    constructor(CmId, CmText, CmTag, CmHasCal, CmYear, CmDay, CmSeason) {
        super();
        this.CmId = (CmId | 0);
        this.CmText = CmText;
        this.CmTag = CmTag;
        this.CmHasCal = CmHasCal;
        this.CmYear = (CmYear | 0);
        this.CmDay = (CmDay | 0);
        this.CmSeason = CmSeason;
    }
}

export function ConsoleMsg_$reflection() {
    return record_type("kittens_land.KittensState.ConsoleMsg", [], ConsoleMsg, () => [["CmId", int32_type], ["CmText", string_type], ["CmTag", option_type(string_type)], ["CmHasCal", bool_type], ["CmYear", int32_type], ["CmDay", int32_type], ["CmSeason", string_type]]);
}

/**
 * classes.queue.manager queue group (time-14)
 */
export class QueueItem extends Record {
    constructor(QName, QType, QValue) {
        super();
        this.QName = QName;
        this.QType = QType;
        this.QValue = (QValue | 0);
    }
}

export function QueueItem_$reflection() {
    return record_type("kittens_land.KittensState.QueueItem", [], QueueItem, () => [["QName", string_type], ["QType", string_type], ["QValue", int32_type]]);
}

export class State extends Record {
    constructor(Pool, Bpool, Spool, Wpool, Vpool, Rpool, Cpool, Ppool, Dpool, Tpool, Spacep, Stpool, Calendar, Cache, CalendarDay, Ticks, IronWill, Rand, ConsoleMsgs, ConsoleUnlocked, QueueItems, Opts, TabsUnlocked) {
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
        this.Rand = Rand;
        this.ConsoleMsgs = ConsoleMsgs;
        this.ConsoleUnlocked = ConsoleUnlocked;
        this.QueueItems = QueueItems;
        this.Opts = Opts;
        this.TabsUnlocked = TabsUnlocked;
    }
}

export function State_$reflection() {
    return record_type("kittens_land.KittensState.State", [], State, () => [["Pool", ResPool_$reflection()], ["Bpool", BldPool_$reflection()], ["Spool", SciencePool_$reflection()], ["Wpool", WorkshopPool_$reflection()], ["Vpool", VillagePool_$reflection()], ["Rpool", ReligionPool_$reflection()], ["Cpool", ChallengePool_$reflection()], ["Ppool", PrestigePool_$reflection()], ["Dpool", DiplomacyPool_$reflection()], ["Tpool", TimePool_$reflection()], ["Spacep", SpacePool_$reflection()], ["Stpool", StatsPool_$reflection()], ["Calendar", CalendarState_$reflection()], ["Cache", EffectsCache_$reflection()], ["CalendarDay", int32_type], ["Ticks", int32_type], ["IronWill", bool_type], ["Rand", lambda_type(unit_type, float64_type)], ["ConsoleMsgs", list_type(ConsoleMsg_$reflection())], ["ConsoleUnlocked", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])], ["QueueItems", list_type(QueueItem_$reflection())], ["Opts", OptsState_$reflection()], ["TabsUnlocked", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])]]);
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
    const s1 = new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, cache1, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
    let prodCtx;
    const calCtx = new CalendarContext((name) => getEffect_1(s1.Cache, name), 0, false, false, false, false, false, false, false, false, false, () => 0.5, (st) => st, (st_1) => st_1, (st_4) => st_4, (st_2) => st_2, (_arg) => {
    }, (st_3) => st_3);
    const fresh = freshProductionContext(s1.Cache, s1.Calendar, calCtx);
    const jobProd = getResProduction(s1.Cache, s1.Vpool, ofList(map((j) => [j.Name, j], jobDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), s1.Wpool);
    prodCtx = (new ProductionContext(fresh.Cache, fresh.Calendar, fresh.CalendarCtx, fresh.SpaceManufacturingResearched, (rn) => defaultArg(tryFind(rn, jobProd), 0), fresh.HGScalingBonus, fresh.SteamworksOn, fresh.SteamworksEffectGlobal, fresh.ParagonProductionRatio, fresh.WinterIsComingActive, fresh.CatnipPollutionRatio, fresh.LeaderRank, fresh.MagnetoOn, fresh.SolarRevolutionRatio, fresh.SolarRevolutionPollution, fresh.DisableCMBR, fresh.CMBRBonus, (rn_1) => {
        const count = length(s1.Vpool.Kittens) | 0;
        switch (rn_1) {
            case "catnip":
                return -0.85 * count;
            case "furs":
                return -0.01 * count;
            case "ivory":
                return -0.007 * count;
            case "spice":
                return -0.001 * count;
            default:
                return 0;
        }
    }, length(s1.Vpool.Kittens), s1.Vpool.Happiness, getFreeKittens(s1.Vpool)));
    let pool1;
    const bind$0040 = s1.Pool;
    pool1 = (new ResPool(bind$0040.Order, map_1((_arg_1, res) => {
        if (res.Def.CalculatePerTick) {
            return new ResourceState(res.Def, res.Value, res.Unlocked, res.MaxValue, fixFloatPointNumber(calcResourcePerTick(prodCtx, s1.Pool, res.Def.Name)));
        }
        else {
            return res;
        }
    }, s1.Pool.ByName), bind$0040.KarmaKittens, bind$0040.EnergyProd, bind$0040.EnergyWinterProd, bind$0040.EnergyCons));
    return new State(pool1, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked);
}

export function makeRand(seed) {
    let z = toUInt32_unchecked(toInt64_unchecked(op_BitwiseAnd(seed, 4294967295n))) >>> 0;
    const sm = () => {
        z = (z + 2654435769);
        let t0 = (z ^ (z >>> 16)) >>> 0;
        t0 = (t0 * 569420461);
        t0 = ((t0 ^ (t0 >>> 15)) >>> 0);
        t0 = (t0 * 668265261);
        t0 = ((t0 ^ (t0 >>> 15)) >>> 0);
        return t0;
    };
    let a = sm();
    let b = sm();
    let c = sm();
    let d = sm();
    return () => {
        let t = a + b;
        a = ((b ^ (b >>> 9)) >>> 0);
        b = (c + ((c << 3) >>> 0));
        c = ((((c << 21) >>> 0) | (c >>> 11)) >>> 0);
        d = (d + 1);
        t = (t + d);
        c = (c + t);
        return (t >>> 0) / 4294967296;
    };
}

export const browserRand = makeRand(20261002n);

export function initSeeded(seed) {
    const fresh = new State(init_1(resourceDefs), init_2(buildingDefs), initScience(techDefs, policyDefs), initWorkshop(upgradeDefs, craftDefs), initVillage(jobDefs), init_3(), init_4(), init_5(), init_6(), init_7(), init_8(), init_9(), init_10, empty_2, 0, 0, true, makeRand(seed), empty_1(), empty_3({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), empty_1(), freshOpts(), empty_3({
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }));
    return refreshCache(fresh);
}

export function init() {
    return initSeeded(20261002n);
}

/**
 * One game tick: effect/per-tick caches, production, caps, calendar.
 */
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

export function consoleMsg(tag, text, s) {
    let matchValue, m;
    let unlocked;
    if (tag == null) {
        unlocked = true;
    }
    else {
        const tg = tag;
        unlocked = FSharpSet__Contains(s.ConsoleUnlocked, tg);
    }
    if (!unlocked) {
        return s;
    }
    else {
        const hasCal = FSharpMap__get_Item(s.Spool.Techs, "calendar").Researched;
        const msg = new ConsoleMsg((matchValue = s.ConsoleMsgs, isEmpty(matchValue) ? 0 : ((m = head(matchValue), m.CmId + 1))), text, tag, hasCal, ~~s.Calendar.Year + 1, ~~s.Calendar.Day + 1, item(s.Calendar.Season, seasons).Name);
        const msgs = append(s.ConsoleMsgs, singleton(msg));
        return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, (length(msgs) > 40) ? tail(msgs) : msgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
    }
}

export function consoleUnlockedFor(s, tag) {
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, add(tag, s.ConsoleUnlocked), s.QueueItems, s.Opts, s.TabsUnlocked);
}

export function consoleClear(s) {
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, empty_1(), s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
}

export function queueCap(s) {
    let option_1;
    const aiCoreOn = defaultArg((option_1 = get$_1(s.Bpool, "aiCore"), (option_1 != null) ? option_1.On : undefined), 0);
    const entanglerHash = defaultArg(tryFind("hashRateLevel", getBuilding(s.Spacep, "entangler").Effects), 0);
    const before = ((aiCoreOn + entanglerHash) + 3) + getEffect_1(s.Cache, "queueCap");
    return ~~Math.floor(before * (1 + getEffect_1(s.Cache, "queueCapRatio"))) | 0;
}

export function queueLength(s) {
    return sumBy((q) => {
        if (q.QValue === 0) {
            return 1;
        }
        else {
            return q.QValue | 0;
        }
    }, s.QueueItems, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
}

export function addToQueue(name, qtype, s) {
    let last;
    const nonStackable = ofArray(["tech", "upgrades", "policies", "zebraUpgrades", "spaceMission"]);
    const cap = queueCap(s) | 0;
    if (queueLength(s) >= cap) {
        return s;
    }
    else {
        const amt = (contains(qtype, nonStackable, {
            Equals: (x, y) => (x === y),
            GetHashCode: (x) => (stringHash(x) | 0),
        }) ? 1 : min(cap - queueLength(s), 1)) | 0;
        if (amt < 1) {
            return s;
        }
        else {
            const matchValue = tryLast(s.QueueItems);
            let matchResult, last_1;
            if (matchValue != null) {
                if ((last = matchValue, (last.QName === name) && !contains(qtype, nonStackable, {
                    Equals: (x_1, y_1) => (x_1 === y_1),
                    GetHashCode: (x_1) => (stringHash(x_1) | 0),
                }))) {
                    matchResult = 0;
                    last_1 = matchValue;
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
                    const items = append(removeAt(length(s.QueueItems) - 1, s.QueueItems), singleton(new QueueItem(last_1.QName, last_1.QType, last_1.QValue + amt)));
                    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, items, s.Opts, s.TabsUnlocked);
                }
                default:
                    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, append(s.QueueItems, singleton(new QueueItem(name, qtype, amt))), s.Opts, s.TabsUnlocked);
            }
        }
    }
}

export function removeFromQueue(index, s) {
    if ((index < 0) ? true : (index >= length(s.QueueItems))) {
        return s;
    }
    else {
        const it = item(index, s.QueueItems);
        if ((it.QValue - 1) === 0) {
            return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, removeAt(index, s.QueueItems), s.Opts, s.TabsUnlocked);
        }
        else {
            return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, updateAt(index, new QueueItem(it.QName, it.QType, it.QValue - 1), s.QueueItems), s.Opts, s.TabsUnlocked);
        }
    }
}

export function toDisplaySeconds(secondsRaw) {
    if (secondsRaw !== secondsRaw) {
        return "0s";
    }
    else {
        const secNum = Math.floor(secondsRaw);
        if (secNum < 1) {
            return "0s";
        }
        else {
            const yearSecs = 86400 * 365;
            const years = Math.floor(secNum / yearSecs);
            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            if (years < 1000000) {
                days = Math.floor((secNum - (years * yearSecs)) / 86400);
                hours = Math.floor(((secNum - (years * yearSecs)) - (days * 86400)) / 3600);
                minutes = Math.floor((((secNum - (years * yearSecs)) - (days * 86400)) - (hours * 3600)) / 60);
                seconds = ((((secNum - (years * yearSecs)) - (days * 86400)) - (hours * 3600)) - (minutes * 60));
            }
            let t = "";
            if (years > 0) {
                t = ((t + years.toString()) + "y ");
            }
            if (years < 1) {
                if (days > 0) {
                    t = ((t + days.toString()) + "d ");
                }
                if (days < 1) {
                    if (hours > 0) {
                        t = ((t + hours.toString()) + "h ");
                    }
                    if (minutes > 0) {
                        t = ((t + minutes.toString()) + "m ");
                    }
                    if (seconds > 0) {
                        t = ((t + seconds.toString()) + "s");
                    }
                }
            }
            return t.trim();
        }
    }
}

export function setBoolOption(name, value, s) {
    const patternInput = setBool(name, value, s.Opts);
    const opts$0027 = patternInput[0];
    const _sellBcoin = patternInput[1];
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, opts$0027, s.TabsUnlocked);
}

export function setNotation(n, s) {
    let bind$0040;
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, (bind$0040 = s.Opts, new OptsState(bind$0040.Bools, n, bind$0040.BatchSize)), s.TabsUnlocked);
}

/**
 * game-17 reset core for the browser slice: karma ladder + paragon + bonus
 * zebras, challenge pending->active flip, stats bumps, fresh pools. The
 * byte-exact post-reset save blob stays in the oracle (game-17).
 */
export function resetGame(s) {
    let table_4, table_3, table_2, bind$0040_2, bind$0040_3, bind$0040_4, bind$0040_5;
    const kittens = round(getRes(s.Pool, "kittens") * (1 + getEffect_1(s.Cache, "simScalingRatio")));
    const anarchy = FSharpMap__get_Item(s.Cpool.Challenges, "anarchy").Researched;
    const k2 = anarchy ? (kittens * 2) : kittens;
    let karmaKittens = 0;
    if (k2 > 35) {
        karmaKittens = ((karmaKittens + ~~(k2 - 35)) | 0);
    }
    if (k2 > 60) {
        karmaKittens = ((karmaKittens + ~~((k2 - 60) * 3)) | 0);
    }
    if (k2 > 100) {
        karmaKittens = ((karmaKittens + ~~((k2 - 100) * 4)) | 0);
    }
    if (k2 > 150) {
        karmaKittens = ((karmaKittens + ~~((k2 - 150) * 5)) | 0);
    }
    if (k2 > 300) {
        karmaKittens = ((karmaKittens + ~~((k2 - 300) * 10)) | 0);
    }
    if (k2 > 750) {
        karmaKittens = ((karmaKittens + ~~((k2 - 750) * 15)) | 0);
    }
    const paragonPoints = (kittens > 70) ? (kittens - 70) : 0;
    const totalScience = sumBy((n) => {
        const td = FSharpMap__get_Item(s.Spool.Techs, n);
        if (td.Researched) {
            const matchValue = tryFind_1((p0) => (p0.Resource === "science"), td.Def.Prices);
            if (matchValue == null) {
                return 0;
            }
            else {
                const p0_1 = matchValue;
                return p0_1.Val;
            }
        }
        else {
            return 0;
        }
    }, s.Spool.TechOrder, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
    const bonusZebras = ((FSharpMap__get_Item(s.Spool.Techs, "archery").Researched ? 1 : 0) + ~~Math.floor(getLimitedDR(totalScience / 10000, 100))) | 0;
    const fresh = init();
    const cpool2 = new ChallengePool(map_1((n_1, c) => {
        const old = FSharpMap__get_Item(s.Cpool.Challenges, n_1);
        return new ChallengeState(old.Unlocked, c.Pending, old.Pending, old.Researched, old.On);
    }, fresh.Cpool.Challenges), fresh.Cpool.Order);
    let pool2;
    const bind$0040_1 = fresh.Pool;
    const KarmaKittens = (s.Pool.KarmaKittens + karmaKittens) | 0;
    pool2 = (new ResPool(bind$0040_1.Order, (table_4 = ((table_3 = ((table_2 = add_1("paragon", (bind$0040_2 = FSharpMap__get_Item(fresh.Pool.ByName, "paragon"), new ResourceState(bind$0040_2.Def, paragonPoints, bind$0040_2.Unlocked, bind$0040_2.MaxValue, bind$0040_2.PerTickCached)), fresh.Pool.ByName), add_1("burnedParagon", (bind$0040_3 = FSharpMap__get_Item(fresh.Pool.ByName, "burnedParagon"), new ResourceState(bind$0040_3.Def, getRes(s.Pool, "burnedParagon"), bind$0040_3.Unlocked, bind$0040_3.MaxValue, bind$0040_3.PerTickCached)), table_2))), add_1("temporalFlux", (bind$0040_4 = FSharpMap__get_Item(fresh.Pool.ByName, "temporalFlux"), new ResourceState(bind$0040_4.Def, getRes(s.Pool, "temporalFlux"), bind$0040_4.Unlocked, bind$0040_4.MaxValue, bind$0040_4.PerTickCached)), table_3))), add_1("timeCrystal", (bind$0040_5 = FSharpMap__get_Item(fresh.Pool.ByName, "timeCrystal"), new ResourceState(bind$0040_5.Def, getRes(s.Pool, "timeCrystal"), bind$0040_5.Unlocked, bind$0040_5.MaxValue, bind$0040_5.PerTickCached)), table_4)), KarmaKittens, bind$0040_1.EnergyProd, bind$0040_1.EnergyWinterProd, bind$0040_1.EnergyCons));
    const stpool2 = bumpStat("totalResets", 1, bumpStat("totalParagon", paragonPoints, fresh.Stpool));
    return new State(pool2, fresh.Bpool, fresh.Spool, fresh.Wpool, fresh.Vpool, fresh.Rpool, cpool2, fresh.Ppool, fresh.Dpool, fresh.Tpool, fresh.Spacep, stpool2, fresh.Calendar, fresh.Cache, fresh.CalendarDay, fresh.Ticks, fresh.IronWill, s.Rand, empty_1(), fresh.ConsoleUnlocked, fresh.QueueItems, s.Opts, fresh.TabsUnlocked);
}

export const saveKey = "kittens_land.savedata.v1";

export function buildSaveString(s) {
    let arg, arg_1;
    const sb = StringBuilder_$ctor();
    const line = (x) => {
        StringBuilder__AppendLine_Z721C83C5(sb, x);
    };
    line("klv1");
    line((arg = (~~s.Calendar.Year | 0), (arg_1 = int32ToString(s.Calendar.Season), toText(printf("cal|%d|%s|%d|%d"))(arg)(arg_1)(s.Calendar.FestivalDays)(s.Ticks))));
    const enumerator = getEnumerator(s.Pool.Order);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_5, arg_6, r;
            const n = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue = get$(s.Pool, n);
            let matchResult, r_1;
            if (matchValue != null) {
                if ((r = matchValue, r.Unlocked ? true : (r.Value > 0))) {
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
                case 0: {
                    line((arg_5 = toText(printf("%g"))(r_1.Value), (arg_6 = ((r_1.Unlocked ? 1 : 0) | 0), toText(printf("res|%s|%s|%d"))(n)(arg_5)(arg_6))));
                    break;
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const enumerator_1 = getEnumerator(s.Bpool.Order);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_11, b;
            const n_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_1 = get$_1(s.Bpool, n_1);
            let matchResult_1, b_1;
            if (matchValue_1 != null) {
                if ((b = matchValue_1, b.Val > 0)) {
                    matchResult_1 = 0;
                    b_1 = matchValue_1;
                }
                else {
                    matchResult_1 = 1;
                }
            }
            else {
                matchResult_1 = 1;
            }
            switch (matchResult_1) {
                case 0: {
                    line((arg_11 = ((b_1.Unlocked ? 1 : 0) | 0), toText(printf("bld|%s|%d|%d|%d"))(n_1)(b_1.Val)(b_1.On)(arg_11)));
                    break;
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    const enumerator_2 = getEnumerator(s.Spool.TechOrder);
    try {
        while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_13, arg_14;
            const n_2 = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const td = FSharpMap__get_Item(s.Spool.Techs, n_2);
            if (td.Researched ? true : td.Unlocked) {
                line((arg_13 = ((td.Unlocked ? 1 : 0) | 0), (arg_14 = ((td.Researched ? 1 : 0) | 0), toText(printf("tech|%s|%d|%d"))(n_2)(arg_13)(arg_14))));
            }
        }
    }
    finally {
        disposeSafe(enumerator_2);
    }
    const enumerator_3 = getEnumerator(s.Spool.PolicyOrder);
    try {
        while (enumerator_3["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_16, arg_17;
            const n_3 = enumerator_3["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const p = FSharpMap__get_Item(s.Spool.Policies, n_3);
            if (p.Researched ? true : p.Unlocked) {
                line((arg_16 = ((p.Unlocked ? 1 : 0) | 0), (arg_17 = ((p.Researched ? 1 : 0) | 0), toText(printf("pol|%s|%d|%d"))(n_3)(arg_16)(arg_17))));
            }
        }
    }
    finally {
        disposeSafe(enumerator_3);
    }
    const enumerator_4 = getEnumerator(s.Wpool.UpgradeOrder);
    try {
        while (enumerator_4["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_19, arg_20;
            const n_4 = enumerator_4["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const u = FSharpMap__get_Item(s.Wpool.Upgrades, n_4);
            if (u.Researched ? true : u.Unlocked) {
                line((arg_19 = ((u.Unlocked ? 1 : 0) | 0), (arg_20 = ((u.Researched ? 1 : 0) | 0), toText(printf("upg|%s|%d|%d"))(n_4)(arg_19)(arg_20))));
            }
        }
    }
    finally {
        disposeSafe(enumerator_4);
    }
    const enumerator_5 = getEnumerator(s.Wpool.CraftOrder);
    try {
        while (enumerator_5["System.Collections.IEnumerator.MoveNext"]()) {
            const n_5 = enumerator_5["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const c = FSharpMap__get_Item(s.Wpool.Crafts, n_5);
            if (c.Value > 0) {
                line(toText(printf("crf|%s|%g"))(n_5)(c.Value));
            }
        }
    }
    finally {
        disposeSafe(enumerator_5);
    }
    const enumerator_6 = getEnumerator(s.Vpool.Kittens);
    try {
        while (enumerator_6["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_24, matchValue_2, j;
            const k = enumerator_6["System.Collections.Generic.IEnumerator`1.get_Current"]();
            line((arg_24 = ((matchValue_2 = k.Job, (matchValue_2 == null) ? "-" : ((j = matchValue_2, j)))), toText(printf("kit|%d|%s"))(k.Seed)(arg_24)));
        }
    }
    finally {
        disposeSafe(enumerator_6);
    }
    const enumerator_7 = getEnumerator(toList(s.Vpool.JobValues));
    try {
        while (enumerator_7["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator_7["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const v = forLoopVar[1] | 0;
            const k_1 = forLoopVar[0];
            if (v > 0) {
                line(toText(printf("job|%s|%d"))(k_1)(v));
            }
        }
    }
    finally {
        disposeSafe(enumerator_7);
    }
    line(toText(printf("rel|%g|%g|%d"))(s.Rpool.Faith)(s.Rpool.FaithRatio)(s.Rpool.TranscendenceTier));
    const enumerator_8 = getEnumerator(s.Rpool.ZuOrder);
    try {
        while (enumerator_8["System.Collections.IEnumerator.MoveNext"]()) {
            const n_6 = enumerator_8["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m = getZU(s.Rpool, n_6);
            if (m.Val > 0) {
                line(toText(printf("zu|%s|%d"))(n_6)(m.Val));
            }
        }
    }
    finally {
        disposeSafe(enumerator_8);
    }
    const enumerator_9 = getEnumerator(s.Rpool.RuOrder);
    try {
        while (enumerator_9["System.Collections.IEnumerator.MoveNext"]()) {
            const n_7 = enumerator_9["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m_1 = getRU(s.Rpool, n_7);
            if (m_1.Val > 0) {
                line(toText(printf("ru|%s|%d"))(n_7)(m_1.Val));
            }
        }
    }
    finally {
        disposeSafe(enumerator_9);
    }
    const enumerator_10 = getEnumerator(s.Dpool.RaceOrder);
    try {
        while (enumerator_10["System.Collections.IEnumerator.MoveNext"]()) {
            const n_8 = enumerator_10["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const r0 = FSharpMap__get_Item(s.Dpool.Races, n_8);
            if (r0.Unlocked) {
                line(toText(printf("race|%s|%d"))(n_8)(r0.EmbassyLevel));
            }
        }
    }
    finally {
        disposeSafe(enumerator_10);
    }
    const enumerator_11 = getEnumerator(s.Spacep.ProgramOrder);
    try {
        while (enumerator_11["System.Collections.IEnumerator.MoveNext"]()) {
            const n_9 = enumerator_11["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m_2 = getProgram(s.Spacep, n_9);
            if ((m_2.Val > 0) ? true : (m_2.On > 0)) {
                line(toText(printf("msn|%s|%d|%d"))(n_9)(m_2.Val)(m_2.On));
            }
        }
    }
    finally {
        disposeSafe(enumerator_11);
    }
    const enumerator_12 = getEnumerator(s.Spacep.BuildingOrder);
    try {
        while (enumerator_12["System.Collections.IEnumerator.MoveNext"]()) {
            const n_10 = enumerator_12["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m_3 = getBuilding(s.Spacep, n_10);
            if (m_3.Val > 0) {
                line(toText(printf("sbld|%s|%d"))(n_10)(m_3.Val));
            }
        }
    }
    finally {
        disposeSafe(enumerator_12);
    }
    const enumerator_13 = getEnumerator(s.Tpool.CfuOrder);
    try {
        while (enumerator_13["System.Collections.IEnumerator.MoveNext"]()) {
            const n_11 = enumerator_13["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m_4 = FSharpMap__get_Item(s.Tpool.CFUs, n_11);
            if (m_4.Val > 0) {
                line(toText(printf("cfu|%s|%d|%d|%g"))(n_11)(m_4.Val)(m_4.On)(m_4.Heat));
            }
        }
    }
    finally {
        disposeSafe(enumerator_13);
    }
    const enumerator_14 = getEnumerator(s.Tpool.VsuOrder);
    try {
        while (enumerator_14["System.Collections.IEnumerator.MoveNext"]()) {
            const n_12 = enumerator_14["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m_5 = FSharpMap__get_Item(s.Tpool.VSUs, n_12);
            if (m_5.Val > 0) {
                line(toText(printf("vsu|%s|%d"))(n_12)(m_5.Val));
            }
        }
    }
    finally {
        disposeSafe(enumerator_14);
    }
    const enumerator_15 = getEnumerator(s.QueueItems);
    try {
        while (enumerator_15["System.Collections.IEnumerator.MoveNext"]()) {
            const q = enumerator_15["System.Collections.Generic.IEnumerator`1.get_Current"]();
            line(toText(printf("q|%s|%s|%d"))(q.QType)(q.QName)(q.QValue));
        }
    }
    finally {
        disposeSafe(enumerator_15);
    }
    line(toText(printf("opts|%s|%g"))(s.Opts.Notation)(s.Opts.BatchSize));
    if (!FSharpSet__get_IsEmpty(s.TabsUnlocked)) {
        line("tabs|" + join(",", toList_1(s.TabsUnlocked)));
    }
    const enumerator_16 = getEnumerator(settingsArr);
    try {
        while (enumerator_16["System.Collections.IEnumerator.MoveNext"]()) {
            let arg_53;
            const b_2 = enumerator_16["System.Collections.Generic.IEnumerator`1.get_Current"]();
            line((arg_53 = ((FSharpMap__get_Item(s.Opts.Bools, b_2.Name) ? 1 : 0) | 0), toText(printf("opt|%s|%d"))(b_2.Name)(arg_53)));
        }
    }
    finally {
        disposeSafe(enumerator_16);
    }
    return toString(sb);
}

export function parseSave(text) {
    const lines = ofArray(split(replace(text, "\r", ""), ["\n"], undefined, 0));
    let matchResult;
    if (!isEmpty(lines)) {
        if (head(lines) === "klv1") {
            matchResult = 0;
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
            const folded = fold((s0, ln) => {
                let bind$0040, bind$0040_1, bind$0040_2, bind$0040_4, bind$0040_5, bind$0040_7, bind$0040_8, bind$0040_9, bind$0040_11, bind$0040_12, bind$0040_13, bind$0040_14, bind$0040_15, bind$0040_16, bind$0040_17, bind$0040_18, bind$0040_19, bind$0040_20, bind$0040_21, bind$0040_22, QType, bind$0040_24;
                const parts = split(ln, ["|"], undefined, 0);
                const matchValue = item_1(0, parts);
                let matchResult_1;
                switch (matchValue) {
                    case "cal": {
                        if (parts.length >= 4) {
                            matchResult_1 = 0;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "res": {
                        if (parts.length >= 4) {
                            matchResult_1 = 1;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "bld": {
                        if (parts.length >= 5) {
                            matchResult_1 = 2;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "tech": {
                        if (parts.length >= 4) {
                            matchResult_1 = 3;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "pol": {
                        if (parts.length >= 4) {
                            matchResult_1 = 4;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "upg": {
                        if (parts.length >= 4) {
                            matchResult_1 = 5;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "crf": {
                        if (parts.length >= 3) {
                            matchResult_1 = 6;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "kit": {
                        if (parts.length >= 3) {
                            matchResult_1 = 7;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "job": {
                        if (parts.length >= 3) {
                            matchResult_1 = 8;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "rel": {
                        if (parts.length >= 4) {
                            matchResult_1 = 9;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "zu": {
                        if (parts.length >= 3) {
                            matchResult_1 = 10;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "ru": {
                        if (parts.length >= 3) {
                            matchResult_1 = 11;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "race": {
                        if (parts.length >= 3) {
                            matchResult_1 = 12;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "msn": {
                        if (parts.length >= 4) {
                            matchResult_1 = 13;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "sbld": {
                        if (parts.length >= 3) {
                            matchResult_1 = 14;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "cfu": {
                        if (parts.length >= 5) {
                            matchResult_1 = 15;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "vsu": {
                        if (parts.length >= 3) {
                            matchResult_1 = 16;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "q": {
                        if (parts.length >= 4) {
                            matchResult_1 = 17;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "opts": {
                        if (parts.length >= 3) {
                            matchResult_1 = 18;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "tabs": {
                        if (parts.length >= 2) {
                            matchResult_1 = 19;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    case "opt": {
                        if (parts.length >= 3) {
                            matchResult_1 = 20;
                        }
                        else {
                            matchResult_1 = 21;
                        }
                        break;
                    }
                    default:
                        matchResult_1 = 21;
                }
                switch (matchResult_1) {
                    case 0:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, (bind$0040 = s0.Calendar, new CalendarState(parse(item_1(1, parts)), bind$0040.Day, bind$0040.Season, bind$0040.Weather, bind$0040.Cycle, bind$0040.CycleYear, bind$0040.EventChance, parse_1(item_1(3, parts), 511, false, 32), bind$0040.CryptoPrice, bind$0040.ObserveRemainingTime)), s0.Cache, s0.CalendarDay, (parts.length > 4) ? parse_1(item_1(4, parts), 511, false, 32) : 0, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 1:
                        return new State((bind$0040_1 = s0.Pool, new ResPool(bind$0040_1.Order, add_1(item_1(1, parts), (bind$0040_2 = FSharpMap__get_Item(s0.Pool.ByName, item_1(1, parts)), new ResourceState(bind$0040_2.Def, parse(item_1(2, parts)), item_1(3, parts) === "1", bind$0040_2.MaxValue, bind$0040_2.PerTickCached)), s0.Pool.ByName), bind$0040_1.KarmaKittens, bind$0040_1.EnergyProd, bind$0040_1.EnergyWinterProd, bind$0040_1.EnergyCons)), s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 2:
                        return new State(s0.Pool, new BldPool(s0.Bpool.Order, add_1(item_1(1, parts), (bind$0040_4 = FSharpMap__get_Item(s0.Bpool.ByName, item_1(1, parts)), new BuildingState(bind$0040_4.Def, parse_1(item_1(2, parts), 511, false, 32), parse_1(item_1(3, parts), 511, false, 32), item_1(4, parts) === "1", bind$0040_4.Unlockable, bind$0040_4.Stage)), s0.Bpool.ByName)), s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 3:
                        return new State(s0.Pool, s0.Bpool, (bind$0040_5 = s0.Spool, new SciencePool(bind$0040_5.TechOrder, add_1(item_1(1, parts), new ResearchState(FSharpMap__get_Item(s0.Spool.Techs, item_1(1, parts)).Def, item_1(2, parts) === "1", item_1(3, parts) === "1"), s0.Spool.Techs), bind$0040_5.PolicyOrder, bind$0040_5.Policies)), s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 4:
                        return new State(s0.Pool, s0.Bpool, (bind$0040_7 = s0.Spool, new SciencePool(bind$0040_7.TechOrder, bind$0040_7.Techs, bind$0040_7.PolicyOrder, add_1(item_1(1, parts), (bind$0040_8 = FSharpMap__get_Item(s0.Spool.Policies, item_1(1, parts)), new PolicyState(bind$0040_8.Def, item_1(2, parts) === "1", item_1(3, parts) === "1", bind$0040_8.Blocked, bind$0040_8.Effects)), s0.Spool.Policies))), s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 5:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, (bind$0040_9 = s0.Wpool, new WorkshopPool(bind$0040_9.UpgradeOrder, add_1(item_1(1, parts), new UpgradeState(FSharpMap__get_Item(s0.Wpool.Upgrades, item_1(1, parts)).Def, item_1(2, parts) === "1", item_1(3, parts) === "1"), s0.Wpool.Upgrades), bind$0040_9.CraftOrder, bind$0040_9.Crafts, bind$0040_9.ZebraOrder, bind$0040_9.ZebraUpgrades)), s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 6:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, (bind$0040_11 = s0.Wpool, new WorkshopPool(bind$0040_11.UpgradeOrder, bind$0040_11.Upgrades, bind$0040_11.CraftOrder, add_1(item_1(1, parts), (bind$0040_12 = FSharpMap__get_Item(s0.Wpool.Crafts, item_1(1, parts)), new CraftState(bind$0040_12.Def, true, parse(item_1(2, parts)), bind$0040_12.Progress, bind$0040_12.IsLimited, bind$0040_12.IsLimitedAmt)), s0.Wpool.Crafts), bind$0040_11.ZebraOrder, bind$0040_11.ZebraUpgrades)), s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 7: {
                        const k = kittenFromSeed(parse(item_1(1, parts)));
                        const k2 = (item_1(2, parts) === "-") ? k : (new Kitten(k.Name, k.Surname, item_1(2, parts), k.Rank, k.Exp, k.Seed, k.Trait, k.Age, k.Color, k.Variety, k.Rarity, k.IsLeader, k.Skills, k.EngineerSpeciality));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, (bind$0040_13 = s0.Vpool, new VillagePool(append(s0.Vpool.Kittens, singleton(k2)), bind$0040_13.NextKittenProgress, bind$0040_13.MaxKittens, bind$0040_13.JobValues, bind$0040_13.JobUnlocked, bind$0040_13.Happiness, bind$0040_13.DeathTimeout, bind$0040_13.LeaderSeed, bind$0040_13.Traits)), s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 8:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, (bind$0040_14 = s0.Vpool, new VillagePool(bind$0040_14.Kittens, bind$0040_14.NextKittenProgress, bind$0040_14.MaxKittens, add_1(item_1(1, parts), parse_1(item_1(2, parts), 511, false, 32), s0.Vpool.JobValues), bind$0040_14.JobUnlocked, bind$0040_14.Happiness, bind$0040_14.DeathTimeout, bind$0040_14.LeaderSeed, bind$0040_14.Traits)), s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 9:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, (bind$0040_15 = s0.Rpool, new ReligionPool(parse(item_1(1, parts)), parse(item_1(2, parts)), bind$0040_15.Tcratio, parse_1(item_1(3, parts), 511, false, 32), bind$0040_15.Corruption, bind$0040_15.NecrocornDeficit, bind$0040_15.FractureThreshold, bind$0040_15.Pacts, bind$0040_15.PactOrder, bind$0040_15.ActiveHolyGenocide, bind$0040_15.ZUs, bind$0040_15.RUs, bind$0040_15.TUs, bind$0040_15.ZuOrder, bind$0040_15.RuOrder, bind$0040_15.TuOrder)), s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    case 10: {
                        const m = getZU(s0.Rpool, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, (bind$0040_16 = s0.Rpool, new ReligionPool(bind$0040_16.Faith, bind$0040_16.FaithRatio, bind$0040_16.Tcratio, bind$0040_16.TranscendenceTier, bind$0040_16.Corruption, bind$0040_16.NecrocornDeficit, bind$0040_16.FractureThreshold, bind$0040_16.Pacts, bind$0040_16.PactOrder, bind$0040_16.ActiveHolyGenocide, add_1(item_1(1, parts), new ReligionMeta(parse_1(item_1(2, parts), 511, false, 32), m.On, true, m.Researched, m.FrozenEffects), s0.Rpool.ZUs), bind$0040_16.RUs, bind$0040_16.TUs, bind$0040_16.ZuOrder, bind$0040_16.RuOrder, bind$0040_16.TuOrder)), s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 11: {
                        const m_1 = getRU(s0.Rpool, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, (bind$0040_17 = s0.Rpool, new ReligionPool(bind$0040_17.Faith, bind$0040_17.FaithRatio, bind$0040_17.Tcratio, bind$0040_17.TranscendenceTier, bind$0040_17.Corruption, bind$0040_17.NecrocornDeficit, bind$0040_17.FractureThreshold, bind$0040_17.Pacts, bind$0040_17.PactOrder, bind$0040_17.ActiveHolyGenocide, bind$0040_17.ZUs, add_1(item_1(1, parts), new ReligionMeta(parse_1(item_1(2, parts), 511, false, 32), m_1.On, m_1.Unlocked, m_1.Researched, m_1.FrozenEffects), s0.Rpool.RUs), bind$0040_17.TUs, bind$0040_17.ZuOrder, bind$0040_17.RuOrder, bind$0040_17.TuOrder)), s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 12: {
                        const r0 = FSharpMap__get_Item(s0.Dpool.Races, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, (bind$0040_18 = s0.Dpool, new DiplomacyPool(add_1(item_1(1, parts), new RaceState(true, parse_1(item_1(2, parts), 511, false, 32), r0.Energy, r0.Duration, r0.Sells, r0.Buys), s0.Dpool.Races), bind$0040_18.RaceOrder, bind$0040_18.NonRandomTrades, bind$0040_18.NonRandomResetDays, bind$0040_18.BaseGoldCost, bind$0040_18.BaseManpowerCost)), s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 13: {
                        const m_2 = getProgram(s0.Spacep, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, (bind$0040_19 = s0.Spacep, new SpacePool(add_1(item_1(1, parts), new SpaceMeta(parse_1(item_1(2, parts), 511, false, 32), parse_1(item_1(3, parts), 511, false, 32), true, m_2.Effects), s0.Spacep.Programs), bind$0040_19.ProgramOrder, bind$0040_19.Buildings, bind$0040_19.BuildingOrder, bind$0040_19.Planets, bind$0040_19.PlanetOrder)), s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 14: {
                        const m_3 = getBuilding(s0.Spacep, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, (bind$0040_20 = s0.Spacep, new SpacePool(bind$0040_20.Programs, bind$0040_20.ProgramOrder, add_1(item_1(1, parts), new SpaceMeta(parse_1(item_1(2, parts), 511, false, 32), m_3.On, true, m_3.Effects), s0.Spacep.Buildings), bind$0040_20.BuildingOrder, bind$0040_20.Planets, bind$0040_20.PlanetOrder)), s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 15: {
                        const m_4 = FSharpMap__get_Item(s0.Tpool.CFUs, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, (bind$0040_21 = s0.Tpool, new TimePool(bind$0040_21.Flux, bind$0040_21.Heat, bind$0040_21.IsAccelerated, bind$0040_21.TestShatter, add_1(item_1(1, parts), new TimeMeta(parse_1(item_1(2, parts), 511, false, 32), parse_1(item_1(3, parts), 511, false, 32), true, m_4.Researched, parse(item_1(4, parts)), m_4.DelayTicks, m_4.IsAutomationEnabled, m_4.Eff, m_4.PriceRatioDyn), s0.Tpool.CFUs), bind$0040_21.CfuOrder, bind$0040_21.VSUs, bind$0040_21.VsuOrder)), s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 16: {
                        const m_5 = FSharpMap__get_Item(s0.Tpool.VSUs, item_1(1, parts));
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, (bind$0040_22 = s0.Tpool, new TimePool(bind$0040_22.Flux, bind$0040_22.Heat, bind$0040_22.IsAccelerated, bind$0040_22.TestShatter, bind$0040_22.CFUs, bind$0040_22.CfuOrder, add_1(item_1(1, parts), new TimeMeta(parse_1(item_1(2, parts), 511, false, 32), m_5.On, true, m_5.Researched, m_5.Heat, m_5.DelayTicks, m_5.IsAutomationEnabled, m_5.Eff, m_5.PriceRatioDyn), s0.Tpool.VSUs), bind$0040_22.VsuOrder)), s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, s0.TabsUnlocked);
                    }
                    case 17:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, append(s0.QueueItems, singleton((QType = item_1(1, parts), new QueueItem(item_1(2, parts), QType, parse_1(item_1(3, parts), 511, false, 32))))), s0.Opts, s0.TabsUnlocked);
                    case 18:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, new OptsState(s0.Opts.Bools, item_1(1, parts), parse(item_1(2, parts))), s0.TabsUnlocked);
                    case 19:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, s0.Opts, ofArray_1(split(item_1(1, parts), [","], undefined, 0), {
                            Compare: (x, y) => (comparePrimitives(x, y) | 0),
                        }));
                    case 20:
                        return new State(s0.Pool, s0.Bpool, s0.Spool, s0.Wpool, s0.Vpool, s0.Rpool, s0.Cpool, s0.Ppool, s0.Dpool, s0.Tpool, s0.Spacep, s0.Stpool, s0.Calendar, s0.Cache, s0.CalendarDay, s0.Ticks, s0.IronWill, s0.Rand, s0.ConsoleMsgs, s0.ConsoleUnlocked, s0.QueueItems, (bind$0040_24 = s0.Opts, new OptsState(add_1(item_1(1, parts), item_1(2, parts) === "1", s0.Opts.Bools), bind$0040_24.Notation, bind$0040_24.BatchSize)), s0.TabsUnlocked);
                    default:
                        return s0;
                }
            }, init(), lines);
            return folded;
        }
        default:
            return undefined;
    }
}

export function applyLoaded(loaded, old) {
    let bind$0040;
    const s1 = new State(loaded.Pool, loaded.Bpool, loaded.Spool, loaded.Wpool, loaded.Vpool, loaded.Rpool, loaded.Cpool, loaded.Ppool, loaded.Dpool, loaded.Tpool, loaded.Spacep, loaded.Stpool, loaded.Calendar, loaded.Cache, loaded.CalendarDay, loaded.Ticks, loaded.IronWill, loaded.Rand, old.ConsoleMsgs, old.ConsoleUnlocked, loaded.QueueItems, loaded.Opts, loaded.TabsUnlocked);
    const maxKittens = calculateMaxKittens(s1.Cache, s1.Vpool) | 0;
    const s2 = new State(s1.Pool, s1.Bpool, s1.Spool, s1.Wpool, (bind$0040 = s1.Vpool, new VillagePool(bind$0040.Kittens, bind$0040.NextKittenProgress, maxKittens, bind$0040.JobValues, bind$0040.JobUnlocked, bind$0040.Happiness, bind$0040.DeathTimeout, bind$0040.LeaderSeed, bind$0040.Traits)), s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked);
    const kittensRes = FSharpMap__get_Item(s2.Pool.ByName, "kittens");
    let pool2;
    const bind$0040_1 = s2.Pool;
    pool2 = (new ResPool(bind$0040_1.Order, add_1("kittens", new ResourceState(kittensRes.Def, length(s2.Vpool.Kittens), length(s2.Vpool.Kittens) > 0, s2.Vpool.MaxKittens, kittensRes.PerTickCached), s2.Pool.ByName), bind$0040_1.KarmaKittens, bind$0040_1.EnergyProd, bind$0040_1.EnergyWinterProd, bind$0040_1.EnergyCons));
    return refreshCache(new State(pool2, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, s2.TabsUnlocked));
}

export function gatherCatnip(s) {
    const pool1 = addResEvent(s.CalendarDay, "catnip", 1, s.Pool)[0];
    return new State(pool1, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
}

/**
 * orig bld.refineCatnip + RefineCatnipButtonController: pay 100 catnip
 * (50 with advancedRefinement), gain 1 wood x craft ratio
 */
export function refineCatnip(s) {
    let matchValue_1, p;
    let enriched;
    const matchValue = tryFind("advancedRefinement", s.Wpool.Upgrades);
    if (matchValue == null) {
        enriched = false;
    }
    else {
        const u = matchValue;
        enriched = u.Researched;
    }
    const price = enriched ? 50 : 100;
    if (getRes(s.Pool, "catnip") < price) {
        return s;
    }
    else {
        const ratio = getResCraftRatio(s.Cache, new CraftRatioContext(s.IronWill, undefined, getBurnedParagonRatio(resValue(s, "burnedParagon")), (matchValue_1 = tryFind("monarchy", s.Spool.Policies), (matchValue_1 == null) ? false : ((p = matchValue_1, p.Researched))), (n) => {
            let option_1;
            return defaultArg((option_1 = get$_1(s.Bpool, n), (option_1 != null) ? option_1.Val : undefined), 0) | 0;
        }), "wood");
        const pool1 = payPrices(s.CalendarDay, s.Pool, singleton(["catnip", price]));
        const pool2 = addResEvent(s.CalendarDay, "wood", 1 + ratio, pool1)[0];
        return refreshCache(new State(pool2, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked));
    }
}

/**
 * Buy one unit of a building through the verified build path (pay + increment
 * + unlocks/upgrades fan-out tail).
 */
export function buyBuilding(name, s) {
    let bind$0040;
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
            const s1 = new State(pool$0027, bpool$0027, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
            const s2 = FSharpMap__get_Item(s1.Bpool.ByName, name).Def.BreaksIronWill ? (new State(s1.Pool, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, false, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked)) : s1;
            let s3;
            const matchValue_1 = FSharpMap__get_Item(s2.Bpool.ByName, name).Def.Unlocks;
            if (matchValue_1 == null) {
                s3 = s2;
            }
            else {
                const u = matchValue_1;
                const patternInput_1 = unlock(u.Buildings, u.Tabs, u.Jobs, u.Tech, u.Policies, u.Upgrades, u.ZebraUpgrades, u.Crafts, s2.Bpool, s2.Spool, s2.Wpool);
                const wp2 = patternInput_1[2];
                const sp2 = patternInput_1[1];
                const bp2 = patternInput_1[0];
                s3 = (new State(s2.Pool, bp2, sp2, wp2, (bind$0040 = s2.Vpool, new VillagePool(bind$0040.Kittens, bind$0040.NextKittenProgress, bind$0040.MaxKittens, bind$0040.JobValues, union(ofList_1(u.Jobs, {
                    Compare: (x, y) => (comparePrimitives(x, y) | 0),
                }), s2.Vpool.JobUnlocked), bind$0040.Happiness, bind$0040.DeathTimeout, bind$0040.LeaderSeed, bind$0040.Traits)), s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, union(ofList_1(u.Tabs, {
                    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
                }), s2.TabsUnlocked)));
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
        return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, vpool2, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
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
        const releaseSet = ofList_1(map((k_1) => (k_1.Seed | 0), truncate(amt, reverse(assignedKittens))), {
            Compare: (x, y) => (comparePrimitives(x, y) | 0),
        });
        const kittens$0027 = map((k_2) => {
            if (contains_1(k_2.Seed, releaseSet)) {
                return new Kitten(k_2.Name, k_2.Surname, undefined, k_2.Rank, k_2.Exp, k_2.Seed, k_2.Trait, k_2.Age, k_2.Color, k_2.Variety, k_2.Rarity, k_2.IsLeader, k_2.Skills, k_2.EngineerSpeciality);
            }
            else {
                return k_2;
            }
        }, vpool1.Kittens);
        return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, new VillagePool(kittens$0027, vpool1.NextKittenProgress, vpool1.MaxKittens, vpool1.JobValues, vpool1.JobUnlocked, vpool1.Happiness, vpool1.DeathTimeout, vpool1.LeaderSeed, vpool1.Traits), s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
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
        const s1 = new State(pool$0027, s.Bpool, spool$0027, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
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
                }), s2.Vpool.JobUnlocked), bind$0040.Happiness, bind$0040.DeathTimeout, bind$0040.LeaderSeed, bind$0040.Traits)), s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, union(ofList_1(u.Tabs, {
                    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
                }), s2.TabsUnlocked)));
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
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, wpool$0027, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked));
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
            wp2 = (new WorkshopPool(wpool$0027.UpgradeOrder, wpool$0027.Upgrades, wpool$0027.CraftOrder, add_1(name, new CraftState(c.Def, c.Unlocked, c.Value + (Math.ceil(amt) * (1 + ratio)), c.Progress, c.IsLimited, c.IsLimitedAmt), wpool$0027.Crafts), wpool$0027.ZebraOrder, wpool$0027.ZebraUpgrades));
        }
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, wp2, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked));
    }
}

export function craftAll(name, s) {
    const patternInput = craftAll_1(s.CalendarDay, s.Cache, traditionResearched(s), crCtxFor(s), (name_1) => resValue(s, name_1), name, s.Pool, s.Wpool);
    const wpool$0027 = patternInput[1];
    const pool$0027 = patternInput[0];
    const ok = patternInput[2];
    if (!ok) {
        return s;
    }
    else {
        const s1 = FSharpSet__Contains(s.ConsoleUnlocked, "craft") ? consoleMsg("craft", "You crafted " + name, s) : consoleUnlockedFor(s, "craft");
        return refreshCache(new State(pool$0027, s1.Bpool, s1.Spool, wpool$0027, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked));
    }
}

export function praise(s) {
    let bind$0040_1;
    const faithValue = getRes(s.Pool, "faith");
    const rpool$0027 = praise_1(s.Rpool, faithValue);
    let pool$0027;
    const bind$0040 = s.Pool;
    pool$0027 = (new ResPool(bind$0040.Order, add_1("faith", (bind$0040_1 = FSharpMap__get_Item(s.Pool.ByName, "faith"), new ResourceState(bind$0040_1.Def, 0.0001, bind$0040_1.Unlocked, bind$0040_1.MaxValue, bind$0040_1.PerTickCached)), s.Pool.ByName), bind$0040.KarmaKittens, bind$0040.EnergyProd, bind$0040.EnergyWinterProd, bind$0040.EnergyCons));
    const s1 = FSharpSet__Contains(s.ConsoleUnlocked, "faith") ? consoleMsg("faith", ("You praise the gods: +" + toText(printf("%.1f"))(faithValue)) + " faith", s) : consoleUnlockedFor(s, "faith");
    return new State(pool$0027, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, rpool$0027, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked);
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, rpool2, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
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
            s2 = (new State(s1.Pool, bp2, sp2, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, union(ofList_1(u.Tabs, {
                Compare: (x, y) => (comparePrimitives(x, y) | 0),
            }), s1.TabsUnlocked)));
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, rpool$0027, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
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
            s2 = (new State(s1.Pool, bp2, sp2, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, union(ofList_1(u.Tabs, {
                Compare: (x, y) => (comparePrimitives(x, y) | 0),
            }), s1.TabsUnlocked)));
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
        const dp$0027 = tradeImpl(s.Dpool, dctx, s.Rand, raceName, 1, empty({
            Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
        }), getEffect_1(s.Cache, "standingRatio") * 0.015, false, getEffect_1(s.Cache, "neutralRaceEmbassyStanding"), tradeBonus, 0, false)[0];
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, dp$0027, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked));
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, dp$0027, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
        let s2;
        if (getPerk(s.Ppool, "diplomacy").Researched) {
            const spool$0027 = unlockRelations(true, (r) => (FSharpMap__get_Item(s1.Dpool.Races, r).EmbassyLevel | 0), s1.Spool)[0];
            s2 = (new State(s1.Pool, s1.Bpool, spool$0027, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked));
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, sp$0027, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
        const def = find((d) => (d.Name === name), programDefs);
        const spool2 = map_1((k, v) => {
            if (contains(k, def.UnlocksPolicies, {
                Equals: (x, y) => (x === y),
                GetHashCode: (x) => (stringHash(x) | 0),
            })) {
                return new PolicyState(v.Def, true, v.Researched, v.Blocked, v.Effects);
            }
            else {
                return v;
            }
        }, s1.Spool.Policies);
        return refreshCache(new State(s1.Pool, s1.Bpool, (bind$0040 = s1.Spool, new SciencePool(bind$0040.TechOrder, bind$0040.Techs, bind$0040.PolicyOrder, spool2)), s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked));
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
        return refreshCache(new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, sp$0027, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked));
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, tp$0027, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
        const def = cfuDef(name);
        const wp2 = fold((acc, up) => {
            const matchValue = tryFind(up, acc.Upgrades);
            if (matchValue == null) {
                return acc;
            }
            else {
                const u = matchValue;
                return new WorkshopPool(acc.UpgradeOrder, add_1(up, new UpgradeState(u.Def, true, u.Researched), acc.Upgrades), acc.CraftOrder, acc.Crafts, acc.ZebraOrder, acc.ZebraUpgrades);
            }
        }, s1.Wpool, def.UnlocksUpgrades);
        const tp2 = fold((acc_1, cfuName) => {
            const m$0027 = FSharpMap__get_Item(acc_1.CFUs, cfuName);
            return new TimePool(acc_1.Flux, acc_1.Heat, acc_1.IsAccelerated, acc_1.TestShatter, add_1(cfuName, new TimeMeta(m$0027.Val, m$0027.On, true, m$0027.Researched, m$0027.Heat, m$0027.DelayTicks, m$0027.IsAutomationEnabled, m$0027.Eff, m$0027.PriceRatioDyn), acc_1.CFUs), acc_1.CfuOrder, acc_1.VSUs, acc_1.VsuOrder);
        }, s1.Tpool, def.UnlocksCFU);
        const s2 = new State(s1.Pool, s1.Bpool, s1.Spool, wp2, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, tp2, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked);
        const s3 = new State(s2.Pool, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, cfuCalculate(timeCalcCtxFor(s2), name, s2.Tpool), s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, s2.TabsUnlocked);
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
        const s1 = new State(pool$0027, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, tp$0027, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
        const s2 = equals(vsuDef(name).BreaksIronWill, true) ? (new State(s1.Pool, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, false, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked)) : s1;
        let s3;
        if (name === "cryochambers") {
            const m$0027 = FSharpMap__get_Item(s2.Tpool.VSUs, "cryochambers");
            s3 = (new State(s2.Pool, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, (bind$0040 = s2.Tpool, new TimePool(bind$0040.Flux, bind$0040.Heat, bind$0040.IsAccelerated, bind$0040.TestShatter, bind$0040.CFUs, bind$0040.CfuOrder, add_1("cryochambers", new TimeMeta(m$0027.Val, m$0027.On, true, m$0027.Researched, m$0027.Heat, m$0027.DelayTicks, m$0027.IsAutomationEnabled, m$0027.Eff, m$0027.PriceRatioDyn), s2.Tpool.VSUs), bind$0040.VsuOrder)), s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, s2.TabsUnlocked));
        }
        else {
            s3 = s2;
        }
        return refreshCache(s3);
    }
}

export function toggleChallengePending(name, s) {
    const c = FSharpMap__get_Item(s.Cpool.Challenges, name);
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, new ChallengePool(add_1(name, new ChallengeState(c.Unlocked, !c.Pending, c.Active, c.Researched, c.On), s.Cpool.Challenges), s.Cpool.Order), s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, s.Cache, s.CalendarDay, s.Ticks, s.IronWill, s.Rand, s.ConsoleMsgs, s.ConsoleUnlocked, s.QueueItems, s.Opts, s.TabsUnlocked);
}

export function queueTick(s) {
    let matchValue_2, rest;
    const matchValue = s.QueueItems;
    if (!isEmpty(matchValue)) {
        const first = head(matchValue);
        let patternInput;
        const matchValue_1 = first.QType;
        switch (matchValue_1) {
            case "buildings": {
                const s1 = buyBuilding(first.QName, s);
                patternInput = [s1, FSharpMap__get_Item(s1.Bpool.ByName, first.QName).Val > FSharpMap__get_Item(s.Bpool.ByName, first.QName).Val];
                break;
            }
            case "tech": {
                const s1_1 = research(first.QName, s);
                patternInput = [s1_1, FSharpMap__get_Item(s1_1.Spool.Techs, first.QName).Researched];
                break;
            }
            default:
                patternInput = [s, false];
        }
        const s2 = patternInput[0];
        const bought = patternInput[1];
        if (bought) {
            return new State(s2.Pool, s2.Bpool, s2.Spool, s2.Wpool, s2.Vpool, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, s2.Stpool, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, (matchValue_2 = s2.QueueItems, !isEmpty(matchValue_2) ? ((rest = tail(matchValue_2), rest)) : empty_1()), s2.Opts, s2.TabsUnlocked);
        }
        else {
            return s2;
        }
    }
    else {
        return s;
    }
}

export function tick(s) {
    let option_1, matchValue_2, u, matchValue_3, u_1, tabs_1, tabs;
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
    const s2 = new State(pool1, bpool1, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, s1.Calendar, s1.Cache, s1.CalendarDay, s1.Ticks, s1.IronWill, s1.Rand, s1.ConsoleMsgs, s1.ConsoleUnlocked, s1.QueueItems, s1.Opts, s1.TabsUnlocked);
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
    const vpool2 = simUpdate(maxKittens, growthRate, 1, s.Rand, vpool1);
    const skillCtx = new SkillContext(false, (matchValue_2 = tryFind("internet", s2.Wpool.Upgrades), (matchValue_2 == null) ? false : ((u = matchValue_2, u.Researched))), (matchValue_3 = tryFind("neuralNetworks", s2.Wpool.Upgrades), (matchValue_3 == null) ? false : ((u_1 = matchValue_3, u_1.Researched))), getEffect_1(s2.Cache, "skillXP"), getEffect_1(s2.Cache, "maxKittensRatio"), s2.CalendarDay, (n_1) => (defaultArg(tryFind(n_1, vpool2.JobValues), 0) | 0), (n_2) => FSharpSet__Contains(vpool2.JobUnlocked, n_2), 1);
    const vpool3 = learnSkills(skillCtx, vpool2);
    const kittensRes = FSharpMap__get_Item(s2.Pool.ByName, "kittens");
    let pool2;
    const bind$0040_1 = s2.Pool;
    pool2 = (new ResPool(bind$0040_1.Order, add_1("kittens", new ResourceState(kittensRes.Def, length(vpool3.Kittens), kittensRes.Unlocked, vpool3.MaxKittens, kittensRes.PerTickCached), s2.Pool.ByName), bind$0040_1.KarmaKittens, bind$0040_1.EnergyProd, bind$0040_1.EnergyWinterProd, bind$0040_1.EnergyCons));
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
    const s3 = new State(pool2, s2.Bpool, s2.Spool, s2.Wpool, vpool4, s2.Rpool, s2.Cpool, s2.Ppool, s2.Dpool, s2.Tpool, s2.Spacep, stpool1, s2.Calendar, s2.Cache, s2.CalendarDay, s2.Ticks, s2.IronWill, s2.Rand, s2.ConsoleMsgs, s2.ConsoleUnlocked, s2.QueueItems, s2.Opts, s2.TabsUnlocked);
    const crCtx = new CraftRatioContext(s3.IronWill, undefined, 0, false, (n_4) => {
        let option_5;
        return defaultArg((option_5 = get$_1(s3.Bpool, n_4), (option_5 != null) ? option_5.Val : undefined), 0) | 0;
    });
    const prod = getResProduction(s3.Cache, s3.Vpool, ofList(map((j) => [j.Name, j], jobDefs), {
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
    dp1 = update_2(s3.Dpool, dctx0, s3.Calendar.Year, s3.Pool.KarmaKittens, () => s.Rand())[0];
    const s4 = new State(pool4, s3.Bpool, s3.Spool, wpool1, s3.Vpool, s3.Rpool, s3.Cpool, s3.Ppool, dp1, s3.Tpool, s3.Spacep, s3.Stpool, calendar1, s3.Cache, ~~calendar1.Day, s3.Ticks + 1, s3.IronWill, s3.Rand, s3.ConsoleMsgs, s3.ConsoleUnlocked, s3.QueueItems, s3.Opts, s3.TabsUnlocked);
    const s4_1 = new State(s4.Pool, s4.Bpool, s4.Spool, s4.Wpool, s4.Vpool, s4.Rpool, s4.Cpool, s4.Ppool, s4.Dpool, s4.Tpool, s4.Spacep, s4.Stpool, s4.Calendar, s4.Cache, s4.CalendarDay, s4.Ticks, s4.IronWill, s4.Rand, s4.ConsoleMsgs, s4.ConsoleUnlocked, s4.QueueItems, s4.Opts, (tabs_1 = ((tabs = s4.TabsUnlocked, (getRes(s4.Pool, "faith") > 0) ? add("religion", tabs) : tabs)), hasUnlockedRaces(s4.Dpool) ? add("trade", tabs_1) : tabs_1));
    const s5 = queueTick(s4_1);
    return refreshCache(s5);
}

export class ResRow extends Record {
    constructor(Name, Title, Value, Max, PerTick, Show) {
        super();
        this.Name = Name;
        this.Title = Title;
        this.Value = Value;
        this.Max = Max;
        this.PerTick = PerTick;
        this.Show = Show;
    }
}

export function ResRow_$reflection() {
    return record_type("kittens_land.KittensState.ResRow", [], ResRow, () => [["Name", string_type], ["Title", string_type], ["Value", float64_type], ["Max", float64_type], ["PerTick", float64_type], ["Show", bool_type]]);
}

export function resRows(s) {
    return map((n) => {
        const matchValue = get$(s.Pool, n);
        if (matchValue != null) {
            const r = matchValue;
            let inCraftTable;
            const matchValue_1 = tryFind(n, s.Wpool.Crafts);
            if (matchValue_1 == null) {
                inCraftTable = false;
            }
            else {
                const c = matchValue_1;
                inCraftTable = c.Unlocked;
            }
            const hasVisibility = r.Unlocked ? true : ((n === "kittens") && (r.MaxValue > 0));
            const perTick = r.Def.CalculatePerTick ? r.PerTickCached : 0;
            return new ResRow(n, get$_2("res." + n), r.Value, r.MaxValue, perTick, hasVisibility && !inCraftTable);
        }
        else {
            return new ResRow(n, n, 0, 0, 0, false);
        }
    }, s.Pool.Order);
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
    constructor(Name, Label, Prices, Value, Unlocked, AllCount) {
        super();
        this.Name = Name;
        this.Label = Label;
        this.Prices = Prices;
        this.Value = Value;
        this.Unlocked = Unlocked;
        this.AllCount = (AllCount | 0);
    }
}

export function CraftRow_$reflection() {
    return record_type("kittens_land.KittensState.CraftRow", [], CraftRow, () => [["Name", string_type], ["Label", string_type], ["Prices", list_type(PriceRow_$reflection())], ["Value", float64_type], ["Unlocked", bool_type], ["AllCount", int32_type]]);
}

export function jobRows(s) {
    return map((jd) => (new JobRow(jd.Name, get$_2("job." + jd.Name), defaultArg(tryFind(jd.Name, s.Vpool.JobValues), 0), FSharpSet__Contains(s.Vpool.JobUnlocked, jd.Name))), jobDefs);
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
                const prices = map((p) => (new PriceRow(p.Resource, p.Val)), t_1.Def.Prices);
                const affordable = hasRes(s.Pool, map((p_1) => [p_1.Resource, p_1.Val], t_1.Def.Prices), 0);
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
                const prices = map((p) => (new PriceRow(p.Resource, p.Val)), u_1.Def.Prices);
                const affordable = hasRes(s.Pool, map((p_1) => [p_1.Resource, p_1.Val], u_1.Def.Prices), 0);
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
                const prices = map((p) => (new PriceRow(p.Resource, p.Val)), c_1.Def.Prices);
                const allCount = ~~getCraftAllCount(s.Cache, traditionResearched(s), (name) => resValue(s, name), s.Wpool, n) | 0;
                return new CraftRow(n, get$_2("craft." + n), prices, c_1.Value, true, allCount);
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
    return map((n_1) => {
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
    const ruRows = map((n_1) => {
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
    const zuRows = map((n_3) => {
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
    const progRows = map((n_1) => {
        const m = getProgram(s.Spacep, n_1);
        const def = find((d) => (d.Name === n_1), programDefs);
        const affordable = hasRes(s.Pool, map((p) => [p.Resource, p.Val], def.Prices), 0);
        return new SpaceRow(n_1, get$_2("mission." + n_1), "mission", m.Val, affordable);
    }, filter_1((n) => {
        if (getProgram(s.Spacep, n).Unlocked) {
            return getProgram(s.Spacep, n).Val === 0;
        }
        else {
            return false;
        }
    }, s.Spacep.ProgramOrder));
    const bldRows = map((n_3) => {
        const m_1 = getBuilding(s.Spacep, n_3);
        const def_1 = find((d_1) => (d_1.Name === n_3), buildingDefs_1);
        const prices = map((p_1) => {
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
    const cfuRows = map((n_1) => {
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
            affordable = hasRes(s.Pool, map((p) => [p.Resource, p.Val * ratio], def.Prices), 0);
        }
        return new TimeRow(n_1, get$_2("cfu." + n_1), "cfu", m.Val, affordable && !capped);
    }, filter_1((n) => FSharpMap__get_Item(s.Tpool.CFUs, n).Unlocked, s.Tpool.CfuOrder));
    const vsuRows = map((n_3) => {
        const m_1 = FSharpMap__get_Item(s.Tpool.VSUs, n_3);
        const def_1 = vsuDef(n_3);
        const affordable_1 = hasRes(s.Pool, map((p_1) => [p_1.Resource, p_1.Val], def_1.Prices), 0);
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
    return map((n_1) => {
        const c = FSharpMap__get_Item(s.Cpool.Challenges, n_1);
        return new ChallengeRow(n_1, get$_2("challenge." + n_1), true, c.Pending, c.Active, c.Researched, c.On);
    }, filter_1((n) => FSharpMap__get_Item(s.Cpool.Challenges, n).Unlocked, s.Cpool.Order));
}

export function buildingRows(s) {
    return choose((n) => {
        const matchValue = get$_1(s.Bpool, n);
        if (matchValue != null) {
            const b = matchValue;
            if (!b.Unlocked && !b.Def.DefaultUnlockable) {
                return undefined;
            }
            else {
                const prices = getAllPrices(s.Cache, pctx(s), b);
                const affordable = hasRes(s.Pool, map((p) => [p.Resource, p.Val], prices), 0);
                return new BuildingRow(n, get$_2("bld." + n), true, affordable, b.Val, map((p_1) => (new PriceRow(p_1.Resource, p_1.Val)), prices));
            }
        }
        else {
            return undefined;
        }
    }, s.Bpool.Order);
}

/**
 * orig game.tabs visible flags — which mid-column tabs the player sees
 * (Bonfire always; others revealed via unlock({tabs}) or side conditions)
 */
export function tabVisible(s, tabId) {
    switch (tabId) {
        case "Bonfire":
            return true;
        case "Village":
            return FSharpSet__Contains(s.TabsUnlocked, "village");
        case "Science":
            return FSharpSet__Contains(s.TabsUnlocked, "science");
        case "Workshop":
            return FSharpSet__Contains(s.TabsUnlocked, "workshop");
        case "Trade":
            return FSharpSet__Contains(s.TabsUnlocked, "trade");
        case "Religion":
            return FSharpSet__Contains(s.TabsUnlocked, "religion");
        case "Space":
            return FSharpSet__Contains(s.TabsUnlocked, "space");
        case "Time":
            return FSharpSet__Contains(s.TabsUnlocked, "time");
        case "Queue":
            return FSharpSet__Contains(s.TabsUnlocked, "queue");
        case "Challenges": {
            const matchValue = tryFind("adjustmentBureau", s.Ppool.Perks);
            if (matchValue == null) {
                return false;
            }
            else {
                const p = matchValue;
                return p.Researched;
            }
        }
        default:
            return false;
    }
}

/**
 * orig ui.updateCalendar: season title only until the "calendar" tech is
 * researched, then "Year {0} - {1}, day {2}" (raw 0-based values, like orig)
 */
export function calendarText(s) {
    const seasonTitle = get$_2("season." + item(s.Calendar.Season, seasons).Name);
    let hasCalendarTech;
    const matchValue = tryFind("calendar", s.Spool.Techs);
    if (matchValue == null) {
        hasCalendarTech = false;
    }
    else {
        const t = matchValue;
        hasCalendarTech = t.Researched;
    }
    if (hasCalendarTech) {
        return replace(replace(replace(get$_2("calendar.year.full"), "{0}", int32ToString(~~s.Calendar.Year)), "{1}", seasonTitle), "{2}", int32ToString(~~s.Calendar.Day));
    }
    else {
        return seasonTitle;
    }
}

