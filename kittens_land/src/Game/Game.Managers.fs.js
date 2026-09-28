
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { float64_type, int32_type, option_type, record_type, class_type, list_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { BuildingState, UpgradeState, CraftState, mkUpgrade, CraftState_$reflection, UpgradeState_$reflection, PolicyState, ResearchState, mkPolicy, mkResearch, PolicyState_$reflection, ResearchState_$reflection } from "./Game.Types.fs.js";
import { updateAt, tail, head, isEmpty, indexed, singleton, append, length, item, filter, empty, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { change, empty as empty_1, add, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { equals, disposeSafe, getEnumerator, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { addResEvent, payPrices, hasRes } from "./Game.Resources.fs.js";
import { getEffect } from "./Game.Effects.fs.js";
import { BldPool, get$ } from "./Game.Buildings.fs.js";
import { ofList as ofList_1 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Set.js";
import { uniformRandomInteger } from "./Game.Math.fs.js";
import { traitDefs, surnames, names } from "./Game.Catalog.Village.fs.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";

export class SciencePool extends Record {
    constructor(TechOrder, Techs, PolicyOrder, Policies) {
        super();
        this.TechOrder = TechOrder;
        this.Techs = Techs;
        this.PolicyOrder = PolicyOrder;
        this.Policies = Policies;
    }
}

export function SciencePool_$reflection() {
    return record_type("Game.Managers.SciencePool", [], SciencePool, () => [["TechOrder", list_type(string_type)], ["Techs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ResearchState_$reflection()])], ["PolicyOrder", list_type(string_type)], ["Policies", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, PolicyState_$reflection()])]]);
}

export function initScience(techs, policies) {
    return new SciencePool(map((t) => t.Name, techs), ofList(map((t_1) => [t_1.Name, mkResearch(t_1)], techs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((p) => p.Name, policies), ofList(map((p_1) => [p_1.Name, mkPolicy(p_1)], policies), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }));
}

export function getTech(sp, name) {
    return tryFind(name, sp.Techs);
}

/**
 * orig TechButtonController buyItem → onPurchase: pay prices, set researched.
 */
export function research(calendarDay, name, pool, sp) {
    const matchValue = tryFind(name, sp.Techs);
    let matchResult, tech_1;
    if (matchValue != null) {
        if (!matchValue.Researched) {
            matchResult = 0;
            tech_1 = matchValue;
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
            const prices = map((p) => [p.Resource, p.Val], tech_1.Def.Prices);
            if (hasRes(pool, prices, 0)) {
                return [payPrices(calendarDay, pool, prices), new SciencePool(sp.TechOrder, add(name, new ResearchState(tech_1.Def, tech_1.Unlocked, true), sp.Techs), sp.PolicyOrder, sp.Policies), true];
            }
            else {
                return [pool, sp, false];
            }
        }
        default:
            return [pool, sp, false];
    }
}

/**
 * orig PolicyBtnController buyItem: pay prices, set researched (toggle-off not
 * needed at our stage).
 */
export function researchPolicy(calendarDay, name, pool, sp) {
    const matchValue = tryFind(name, sp.Policies);
    let matchResult, pol_1;
    if (matchValue != null) {
        if (!matchValue.Researched) {
            matchResult = 0;
            pol_1 = matchValue;
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
            const prices = map((p) => [p.Resource, p.Val], pol_1.Def.Prices);
            if (hasRes(pool, prices, 0)) {
                return [payPrices(calendarDay, pool, prices), new SciencePool(sp.TechOrder, sp.Techs, sp.PolicyOrder, add(name, new PolicyState(pol_1.Def, pol_1.Unlocked, true), sp.Policies)), true];
            }
            else {
                return [pool, sp, false];
            }
        }
        default:
            return [pool, sp, false];
    }
}

export class WorkshopPool extends Record {
    constructor(UpgradeOrder, Upgrades, CraftOrder, Crafts) {
        super();
        this.UpgradeOrder = UpgradeOrder;
        this.Upgrades = Upgrades;
        this.CraftOrder = CraftOrder;
        this.Crafts = Crafts;
    }
}

export function WorkshopPool_$reflection() {
    return record_type("Game.Managers.WorkshopPool", [], WorkshopPool, () => [["UpgradeOrder", list_type(string_type)], ["Upgrades", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, UpgradeState_$reflection()])], ["CraftOrder", list_type(string_type)], ["Crafts", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, CraftState_$reflection()])]]);
}

export function initWorkshop(upgrades, crafts) {
    return new WorkshopPool(map((u) => u.Name, upgrades), ofList(map((u_1) => [u_1.Name, mkUpgrade(u_1)], upgrades), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((c) => c.Name, crafts), ofList(map((c_1) => [c_1.Name, new CraftState(c_1, c_1.StartsUnlocked, 0)], crafts), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }));
}

export function getCraft(wp, name) {
    return tryFind(name, wp.Crafts);
}

/**
 * orig getResCraftRatio(res): workshop craftRatio effects × (1 + skill bonus).
 * Skill/leader seams are fresh (0); effect read is live.
 */
export function getResCraftRatio(cache, resName) {
    return getEffect(cache, resName + "CraftRatio");
}

/**
 * orig workshop.craft (js/workshop.js L2656): ceil amt, craftRatio bonus,
 * resource check, pay, addResEvent(craftAmt). suppressUndo/forceAll unused by
 * the runner path. Returns pool, workshop, actual amount gained, success.
 */
export function craft(calendarDay, cache, resName, amt, pool, wp) {
    const matchValue = tryFind(resName, wp.Crafts);
    if (matchValue != null) {
        const craftDef = matchValue;
        const craftRatio = getResCraftRatio(cache, resName);
        const amt_1 = Math.ceil(amt);
        const craftAmt = amt_1 * (1 + craftRatio);
        const prices = map((p) => [p.Resource, p.Val * amt_1], craftDef.Def.Prices);
        if (hasRes(pool, prices, 0)) {
            const patternInput = addResEvent(calendarDay, resName, craftAmt, payPrices(calendarDay, pool, prices));
            return [patternInput[0], wp, patternInput[1], true];
        }
        else {
            return [pool, wp, 0, false];
        }
    }
    else {
        return [pool, wp, 0, false];
    }
}

/**
 * orig UpgradeButtonController buyItem → onPurchase: pay, set researched.
 */
export function buyUpgrade(calendarDay, name, pool, wp) {
    const matchValue = tryFind(name, wp.Upgrades);
    let matchResult, upg_1;
    if (matchValue != null) {
        if (!matchValue.Researched) {
            matchResult = 0;
            upg_1 = matchValue;
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
            const prices = map((p) => [p.Resource, p.Val], upg_1.Def.Prices);
            if (hasRes(pool, prices, 0)) {
                return [payPrices(calendarDay, pool, prices), new WorkshopPool(wp.UpgradeOrder, add(name, new UpgradeState(upg_1.Def, upg_1.Unlocked, true), wp.Upgrades), wp.CraftOrder, wp.Crafts), true];
            }
            else {
                return [pool, wp, false];
            }
        }
        default:
            return [pool, wp, false];
    }
}

export function unlock(buildings, tabs, jobs, techs, policies, upgrades, bpool, sp, wp) {
    let bpool_1 = bpool;
    const enumerator = getEnumerator(buildings);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let ByName;
            const name = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue = get$(bpool_1, name);
            if (matchValue == null) {
            }
            else {
                const b = matchValue;
                bpool_1 = ((ByName = add(name, new BuildingState(b.Def, b.Val, b.On, b.Unlocked, true, b.Stage), bpool_1.ByName), new BldPool(bpool_1.Order, ByName)));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    let sp_1 = sp;
    const enumerator_1 = getEnumerator(techs);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            let Techs;
            const name_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_1 = getTech(sp_1, name_1);
            if (matchValue_1 == null) {
            }
            else {
                const t = matchValue_1;
                sp_1 = ((Techs = add(name_1, new ResearchState(t.Def, true, t.Researched), sp_1.Techs), new SciencePool(sp_1.TechOrder, Techs, sp_1.PolicyOrder, sp_1.Policies)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    const enumerator_2 = getEnumerator(policies);
    try {
        while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
            let Policies;
            const name_2 = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_2 = tryFind(name_2, sp_1.Policies);
            if (matchValue_2 == null) {
            }
            else {
                const p = matchValue_2;
                sp_1 = ((Policies = add(name_2, new PolicyState(p.Def, true, p.Researched), sp_1.Policies), new SciencePool(sp_1.TechOrder, sp_1.Techs, sp_1.PolicyOrder, Policies)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_2);
    }
    let wp_1 = wp;
    const enumerator_3 = getEnumerator(upgrades);
    try {
        while (enumerator_3["System.Collections.IEnumerator.MoveNext"]()) {
            let Upgrades;
            const name_3 = enumerator_3["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_3 = tryFind(name_3, wp_1.Upgrades);
            if (matchValue_3 == null) {
            }
            else {
                const u = matchValue_3;
                wp_1 = ((Upgrades = add(name_3, new UpgradeState(u.Def, true, u.Researched), wp_1.Upgrades), new WorkshopPool(wp_1.UpgradeOrder, Upgrades, wp_1.CraftOrder, wp_1.Crafts)));
            }
        }
    }
    finally {
        disposeSafe(enumerator_3);
    }
    return [bpool_1, sp_1, wp_1];
}

/**
 * orig game.upgrade(list): recalculate effects for metas that define
 * calculateEffects — with all such functions val-constant (session 08), this is
 * a no-op on tables whose values are already baked into the catalogs. Job
 * calculateEffects (D012) is the exception — handled by the caller (village).
 */
export class Kitten extends Record {
    constructor(Name, Surname, Job, Rank, Exp, Seed, Trait, Age) {
        super();
        this.Name = Name;
        this.Surname = Surname;
        this.Job = Job;
        this.Rank = (Rank | 0);
        this.Exp = Exp;
        this.Seed = (Seed | 0);
        this.Trait = Trait;
        this.Age = Age;
    }
}

export function Kitten_$reflection() {
    return record_type("Game.Managers.Kitten", [], Kitten, () => [["Name", string_type], ["Surname", string_type], ["Job", option_type(string_type)], ["Rank", int32_type], ["Exp", float64_type], ["Seed", int32_type], ["Trait", string_type], ["Age", float64_type]]);
}

export class VillagePool extends Record {
    constructor(Kittens, NextKittenProgress, MaxKittens, JobValues, JobUnlocked, Happiness) {
        super();
        this.Kittens = Kittens;
        this.NextKittenProgress = NextKittenProgress;
        this.MaxKittens = (MaxKittens | 0);
        this.JobValues = JobValues;
        this.JobUnlocked = JobUnlocked;
        this.Happiness = Happiness;
    }
}

export function VillagePool_$reflection() {
    return record_type("Game.Managers.VillagePool", [], VillagePool, () => [["Kittens", list_type(Kitten_$reflection())], ["NextKittenProgress", float64_type], ["MaxKittens", int32_type], ["JobValues", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, int32_type])], ["JobUnlocked", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])], ["Happiness", float64_type]]);
}

export function initVillage(jobDefs) {
    return new VillagePool(empty(), 0, 0, ofList(map((j) => [j.Name, 0], jobDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), ofList_1(map((j_2) => j_2.Name, filter((j_1) => j_1.StartsUnlocked, jobDefs)), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), 1);
}

/**
 * orig calculateSimMaxKittens: maxKittens effect (huts ×val etc. via cache).
 */
export function calculateMaxKittens(cache, pool) {
    const maxKittens = getEffect(cache, "maxKittens");
    return ~~Math.floor(maxKittens) | 0;
}

/**
 * orig sim.addKitten: ONE global PRNG draw (the kitten seed via
 * generateKittenSeed → uniformRandomInteger(0, SEED_MAX+1)); ALL attributes
 * (name/surname/trait/age) roll on the kitten's private Lehmer LCG seeded
 * from it (js/village.js L1474, L1521-1545, L1495-1517) — bit-exact port.
 */
export function generateKittenSeed(rand) {
    return ~~uniformRandomInteger(rand, 0, 1000000) | 0;
}

function kittenLcg(seed) {
    let state = (seed + 1) % 2147483647;
    return (ratio) => {
        state = ((state * 16807) % 2147483647);
        return ~~Math.floor(((state - 1) / 2147483646) * ratio) | 0;
    };
}

function makeKitten(seed) {
    const rand = kittenLcg(seed);
    const name = item(rand(length(names)), names);
    const surname = item(rand(length(surnames)), surnames);
    const trait = item(rand(length(traitDefs)), traitDefs).Name;
    let age = 1 + (rand(100) / 100);
    const age$0027 = (rand(100) < 30) ? (age + rand(30)) : age;
    age = age$0027;
    return new Kitten(name, surname, undefined, 0, 0, seed, trait, age);
}

export function addKitten(rand, pool) {
    return new VillagePool(append(pool.Kittens, singleton(makeKitten(generateKittenSeed(rand)))), pool.NextKittenProgress, pool.MaxKittens, pool.JobValues, pool.JobUnlocked, pool.Happiness);
}

/**
 * orig sim.update(kittensPerTick, times): births from progress accumulation.
 */
export function simUpdate(maxKittens, kittensPerTick, times, rand, pool) {
    let NextKittenProgress, NextKittenProgress_1;
    let pool_1 = pool;
    if (length(pool_1.Kittens) < maxKittens) {
        pool_1 = ((NextKittenProgress = (pool_1.NextKittenProgress + (times * kittensPerTick)), new VillagePool(pool_1.Kittens, NextKittenProgress, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness)));
        if (pool_1.NextKittenProgress >= 1) {
            const kittensToAdd = ~~Math.floor(pool_1.NextKittenProgress) | 0;
            pool_1 = ((NextKittenProgress_1 = (pool_1.NextKittenProgress - kittensToAdd), new VillagePool(pool_1.Kittens, NextKittenProgress_1, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness)));
            for (let forLoopVar = 1; forLoopVar <= kittensToAdd; forLoopVar++) {
                if (length(pool_1.Kittens) < maxKittens) {
                    pool_1 = addKitten(rand, pool_1);
                }
            }
            if (length(pool_1.Kittens) >= maxKittens) {
                pool_1 = (new VillagePool(pool_1.Kittens, 0, pool_1.MaxKittens, pool_1.JobValues, pool_1.JobUnlocked, pool_1.Happiness));
            }
        }
    }
    return pool_1;
}

/**
 * orig village.assignJob (manager level): amt capped by free kittens and the
 * job limit (manager default 100000 here); the counter bumps by the capped amt
 * — which can still over-count vs actual sim assignments (OBS-2 orig quirk).
 * orig getFreeKittens: kittens without a job.
 */
export function getFreeKittens(vpool) {
    return length(filter((k) => equals(k.Job, undefined), vpool.Kittens)) | 0;
}

export function assignJob(name, amt, vpool) {
    const current = defaultArg(tryFind(name, vpool.JobValues), 0) | 0;
    const capped = min(amt, min(getFreeKittens(vpool), 100000 - current)) | 0;
    if (capped > 0) {
        return new VillagePool(vpool.Kittens, vpool.NextKittenProgress, vpool.MaxKittens, add(name, current + capped, vpool.JobValues), vpool.JobUnlocked, vpool.Happiness);
    }
    else {
        return vpool;
    }
}

/**
 * orig sim.assignJob(job, amt, optimize): assign up to amt free kittens
 * (reverse iteration, no optimize at fresh — register perk not researched).
 */
export function simAssignJob(job, amt, vpool) {
    let vpool_1 = vpool;
    let freeIds = map((tuple) => (tuple[0] | 0), filter((tupledArg) => equals(tupledArg[1].Job, undefined), indexed(vpool_1.Kittens)));
    let n = amt;
    while ((n > 0) && !isEmpty(freeIds)) {
        const id = head(freeIds) | 0;
        freeIds = tail(freeIds);
        const k_1 = item(id, vpool_1.Kittens);
        vpool_1 = (new VillagePool(updateAt(id, new Kitten(k_1.Name, k_1.Surname, job, k_1.Rank, k_1.Exp, k_1.Seed, k_1.Trait, k_1.Age), vpool_1.Kittens), vpool_1.NextKittenProgress, vpool_1.MaxKittens, vpool_1.JobValues, vpool_1.JobUnlocked, vpool_1.Happiness));
        n = ((n - 1) | 0);
    }
    return vpool_1;
}

/**
 * orig village.getResProduction (updateResourceProduction): per-kitten job
 * modifier sum, scaled by skill (0 at fresh), rank, leader, happiness.
 * Job modifiers come from village-01 data (base + calculated resolutions).
 */
export function getResProduction(vpool, jobDefs) {
    let res = empty_1({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    });
    const enumerator = getEnumerator(vpool.Kittens);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let matchValue_2;
            const matchValue = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]().Job;
            if (matchValue != null) {
                const matchValue_1 = tryFind(matchValue, jobDefs);
                if (matchValue_1 != null) {
                    const jobDef = matchValue_1;
                    const enumerator_1 = getEnumerator((matchValue_2 = jobDef.CalculatedModifiers, (matchValue_2 == null) ? jobDef.Modifiers : matchValue_2));
                    try {
                        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                            const activePatternResult = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                            const baseMod = activePatternResult[1];
                            let diff = baseMod + (baseMod * 0);
                            diff = (diff * 1);
                            if (diff > 0) {
                                diff = (diff * vpool.Happiness);
                            }
                            res = change(activePatternResult[0], (_arg) => {
                                if (_arg == null) {
                                    return diff;
                                }
                                else {
                                    return _arg + diff;
                                }
                            }, res);
                        }
                    }
                    finally {
                        disposeSafe(enumerator_1);
                    }
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return res;
}

