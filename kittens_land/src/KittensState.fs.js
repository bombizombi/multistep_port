
import { Record } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { ResPool_$reflection } from "./Game/Game.Types.fs.js";
import { getAllPrices, build, init as init_2, providerEffect, activeEffects, get$ as get$_1, PricingContext, freshPricing, BldPool_$reflection } from "./Game/Game.Buildings.fs.js";
import { unlock, initVillage, initWorkshop, initScience, scienceGroup, workshopEffectsBase, VillagePool_$reflection, WorkshopPool_$reflection, SciencePool_$reflection } from "./Game/Game.Managers.fs.js";
import { init as init_3, religionGroup, ReligionPool_$reflection } from "./Game/Game.Religion.fs.js";
import { init as init_4, challengesGroup, ChallengePool_$reflection } from "./Game/Game.Challenges.fs.js";
import { init as init_5, prestigeGroup, PrestigePool_$reflection } from "./Game/Game.Prestige.fs.js";
import { init as init_6, DiplomacyPool_$reflection } from "./Game/Game.Diplomacy.fs.js";
import { init as init_7, timeGroup as timeGroup_1, TimePool_$reflection } from "./Game/Game.Time.fs.js";
import { init as init_8, spaceGroup, SpacePool_$reflection } from "./Game/Game.Space.fs.js";
import { init as init_9, StatsPool_$reflection } from "./Game/Game.Stats.fs.js";
import { tick as tick_1, CalendarContext, init as init_10, CalendarState_$reflection } from "./Game/Game.Calendar.fs.js";
import { empty as empty_2, updateCaches, ManagerGroup, getEffect as getEffect_1, EffectsCache_$reflection } from "./Game/Game.Effects.fs.js";
import { list_type, float64_type, string_type, record_type, bool_type, int32_type } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { defaultArg } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { hasRes, addResEvent, updateMaxValueAll, update, UpdateContext, init as init_1, getEnergyDelta, CapContext, get$ } from "./Game/Game.Resources.fs.js";
import { FSharpMap__get_Item, filter, tryFind, empty } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { truncate, map, ofArray, choose, empty as empty_1 } from "../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { baseEffects, bldBase } from "./Game/Game.Catalog.BaseEffects.fs.js";
import { resourceDefs } from "./Game/Game.Catalog.Resources.fs.js";
import { craftDefs, upgradeDefs, policyDefs, techDefs, buildingDefs } from "./Game/Game.Catalog.Defs.fs.js";
import { jobDefs } from "./Game/Game.Catalog.Village.fs.js";

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
    let timeGroup, option_1;
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
    return ofArray([religionGroup(s.Rpool), emptyGroup, prestigeGroup(s.Ppool), spaceGroup(s.Pool.EnergyCons, s.Pool.EnergyProd, getEnergyDelta(false, false, s.Pool.EnergyProd, s.Pool.EnergyCons), s.Spacep), (timeGroup = (new ManagerGroup(filter((k, _arg_2) => {
        if (k.startsWith("heat")) {
            return true;
        }
        else {
            return k.startsWith("temporalFlux");
        }
    }, baseEffects), empty_1())), timeGroup), emptyGroup, scienceGroup(s.Spool), challengesGroup(s.Cpool, (name_2) => getEffect(s, name_2), defaultArg((option_1 = get$_1(s.Bpool, "tradepost"), (option_1 != null) ? option_1.Val : undefined), 0)), timeGroup_1(s.Tpool, false)]);
}

export function refreshCache(s) {
    return new State(s.Pool, s.Bpool, s.Spool, s.Wpool, s.Vpool, s.Rpool, s.Cpool, s.Ppool, s.Dpool, s.Tpool, s.Spacep, s.Stpool, s.Calendar, updateCaches(s.Cache, groups(s)), s.CalendarDay, s.Ticks, s.IronWill);
}

export function init() {
    const fresh = new State(init_1(resourceDefs), init_2(buildingDefs), initScience(techDefs, policyDefs), initWorkshop(upgradeDefs, craftDefs), initVillage(jobDefs), init_3(), init_4(), init_5(), init_6(), init_7(), init_8(), init_9(), init_10, empty_2, 0, 0, true);
    return refreshCache(fresh);
}

/**
 * One game tick: effect/per-tick caches, production, caps, calendar.
 */
export function tick(s) {
    let option_1;
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
    const pool2 = updateMaxValueAll(capCtx(s1), pool1);
    const calCtx = new CalendarContext((name) => getEffect_1(s1.Cache, name), 0, false, false, false, false, false, false, false, false, false, () => 0.5, (st) => st, (st_1) => st_1, (st_4) => st_4, (st_2) => st_2, (_arg) => {
    }, (st_3) => st_3);
    const calendar1 = tick_1(calCtx, s1.Calendar);
    return new State(pool2, s1.Bpool, s1.Spool, s1.Wpool, s1.Vpool, s1.Rpool, s1.Cpool, s1.Ppool, s1.Dpool, s1.Tpool, s1.Spacep, s1.Stpool, calendar1, s1.Cache, ~~calendar1.Day, s1.Ticks + 1, s1.IronWill);
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
    return map((n) => {
        let matchValue, r;
        return new ResRow(n, getRes(s.Pool, n), getResMax(s.Pool, n), (matchValue = get$(s.Pool, n), (matchValue == null) ? false : ((r = matchValue, r.Unlocked ? true : (r.Value > 0)))));
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
                const affordable = hasRes(s.Pool, map((p) => [p.Resource, p.Val], prices), 0);
                return new BuildingRow(n, n, true, affordable, b.Val, map((p_1) => (new PriceRow(p_1.Resource, p_1.Val)), prices));
            }
        }
        else {
            return undefined;
        }
    }, s.Bpool.Order);
}

