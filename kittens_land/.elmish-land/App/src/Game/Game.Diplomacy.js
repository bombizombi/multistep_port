
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { option_type, lambda_type, class_type, string_type, record_type, list_type, float64_type, int32_type, bool_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { SellDef, raceDefs, SellDef_$reflection } from "./Game.Catalog.World.js";
import { ResPool, ResourceState, Price, Price_$reflection } from "./Game.Types.js";
import { forAll, item, tryItem, length, isEmpty, filter, mapIndexed, sumBy, exists, map, find } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { empty, tryFind, add, FSharpMap__get_Item, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { disposeSafe, getEnumerator, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { max, min } from "../../fable_modules/fable-library-js.5.17.0/Double.js";
import { getZU } from "./Game.Religion.js";
import { defaultArg } from "../../fable_modules/fable-library-js.5.17.0/Option.js";
import { payPrices, hasRes, addResEvent, get$ } from "./Game.Resources.js";
import { irwinHallRandom, binominalRandomInteger, getLimitedDR } from "./Game.Math.js";
import { buildingDefs } from "./Game.Catalog.Defs.js";

/**
 * Live race state (orig mutates the def: unlocked/embassyLevel/energy/duration
 * AND the sells/buys params via updateSharkScribes — diplomacy-04).
 */
export class RaceState extends Record {
    constructor(Unlocked, EmbassyLevel, Energy, Duration, Sells, Buys) {
        super();
        this.Unlocked = Unlocked;
        this.EmbassyLevel = (EmbassyLevel | 0);
        this.Energy = Energy;
        this.Duration = Duration;
        this.Sells = Sells;
        this.Buys = Buys;
    }
}

export function RaceState_$reflection() {
    return record_type("Game.Diplomacy.RaceState", [], RaceState, () => [["Unlocked", bool_type], ["EmbassyLevel", int32_type], ["Energy", float64_type], ["Duration", float64_type], ["Sells", list_type(SellDef_$reflection())], ["Buys", list_type(Price_$reflection())]]);
}

export class DiplomacyPool extends Record {
    constructor(Races, RaceOrder, NonRandomTrades, NonRandomResetDays, BaseGoldCost, BaseManpowerCost) {
        super();
        this.Races = Races;
        this.RaceOrder = RaceOrder;
        this.NonRandomTrades = NonRandomTrades;
        this.NonRandomResetDays = NonRandomResetDays;
        this.BaseGoldCost = BaseGoldCost;
        this.BaseManpowerCost = BaseManpowerCost;
    }
}

export function DiplomacyPool_$reflection() {
    return record_type("Game.Diplomacy.DiplomacyPool", [], DiplomacyPool, () => [["Races", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, RaceState_$reflection()])], ["RaceOrder", list_type(string_type)], ["NonRandomTrades", float64_type], ["NonRandomResetDays", float64_type], ["BaseGoldCost", float64_type], ["BaseManpowerCost", float64_type]]);
}

function freshRace(n) {
    const def = find((r) => (r.Name === n), raceDefs);
    return new RaceState(false, 0, 0, 0, def.Sells, def.Buys);
}

export function init() {
    const order = map((r) => r.Name, raceDefs);
    return new DiplomacyPool(ofList(map((n) => [n, freshRace(n)], order), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), order, 0, 0, 15, 50);
}

/**
 * Per-tick seam context (no manager object in the port; callers supply live reads).
 */
export class DiplomacyContext extends Record {
    constructor(GetEffect, GetResValue, GetResMax, IsResUnlocked, Season, NuclearFissionResearched, IronWill) {
        super();
        this.GetEffect = GetEffect;
        this.GetResValue = GetResValue;
        this.GetResMax = GetResMax;
        this.IsResUnlocked = IsResUnlocked;
        this.Season = Season;
        this.NuclearFissionResearched = NuclearFissionResearched;
        this.IronWill = IronWill;
    }
}

export function DiplomacyContext_$reflection() {
    return record_type("Game.Diplomacy.DiplomacyContext", [], DiplomacyContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["GetResValue", lambda_type(string_type, float64_type)], ["GetResMax", lambda_type(string_type, float64_type)], ["IsResUnlocked", lambda_type(string_type, bool_type)], ["Season", string_type], ["NuclearFissionResearched", bool_type], ["IronWill", bool_type]]);
}

export function getRace(dp, name) {
    return FSharpMap__get_Item(dp.Races, name);
}

export function hasUnlockedRaces(dp) {
    return exists((n) => FSharpMap__get_Item(dp.Races, n).Unlocked, dp.RaceOrder);
}

export function getSumEmbassyLevels(dp) {
    return sumBy((n) => (FSharpMap__get_Item(dp.Races, n).EmbassyLevel | 0), dp.RaceOrder, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
}

export function resetState(dp) {
    return new DiplomacyPool(ofList(map((n) => [n, freshRace(n)], dp.RaceOrder), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), dp.RaceOrder, 0, 0, 15, 50);
}

/**
 * orig updateSharkScribes (L531-583): per-day scaling of the sharks' sell/buy
 * params. timeElapsed = year + trueYear (flux seam 0); chronosphere branch
 * seam false; blackLibrary ratio seam 1. Mutates a COPY in the race state.
 */
export function updateSharkScribes(dp, timeElapsed, scribesResearched) {
    const sharks = FSharpMap__get_Item(dp.Races, "sharks");
    if (!scribesResearched) {
        return new DiplomacyPool(add("sharks", new RaceState(sharks.Unlocked, sharks.EmbassyLevel, sharks.Energy, sharks.Duration, mapIndexed((i, sl) => {
            switch (i) {
                case 1:
                    return new SellDef(sl.Name, 5, 0.25, sl.Width, sl.MinLevel, sl.Seasons);
                case 2:
                    return new SellDef(sl.Name, 3, 0.15, sl.Width, sl.MinLevel, sl.Seasons);
                default:
                    return sl;
            }
        }, sharks.Sells), mapIndexed((i_1, b) => {
            if (i_1 === 0) {
                return new Price(b.Resource, 100);
            }
            else {
                return b;
            }
        }, sharks.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost);
    }
    else {
        const te = (timeElapsed < 0) ? 0 : timeElapsed;
        const parchmentChance = min(0.4 + (te / 33333), 1);
        const parchmentValue = (5 + (Math.pow(te, 1.25) / 1000)) * 1;
        const manuscriptChance = min(0.2 + (te / 100000), 1);
        const manuscriptValue = (3.3 + (te / 545)) * 1;
        let rawValue = te / 8;
        if (rawValue < 301) {
            rawValue = (50 * Math.floor(rawValue / 50));
        }
        else if (rawValue < 501) {
            rawValue = (100 * Math.floor(rawValue / 100));
        }
        else if (rawValue < 1501) {
            rawValue = (250 * Math.floor(rawValue / 250));
        }
        else if (rawValue < 2501) {
            rawValue = (500 * Math.floor(rawValue / 500));
        }
        else if (rawValue < 10001) {
            rawValue = (1250 * Math.floor(rawValue / 1250));
        }
        else {
            rawValue = 11111;
        }
        const ironVal = max(125, rawValue);
        return new DiplomacyPool(add("sharks", new RaceState(sharks.Unlocked, sharks.EmbassyLevel, sharks.Energy, sharks.Duration, mapIndexed((i_2, sl_1) => {
            switch (i_2) {
                case 1:
                    return new SellDef(sl_1.Name, parchmentValue, parchmentChance, sl_1.Width, sl_1.MinLevel, sl_1.Seasons);
                case 2:
                    return new SellDef(sl_1.Name, manuscriptValue, manuscriptChance, sl_1.Width, sl_1.MinLevel, sl_1.Seasons);
                default:
                    return sl_1;
            }
        }, sharks.Sells), mapIndexed((i_3, b_1) => {
            if (i_3 === 0) {
                return new Price(b_1.Resource, ironVal);
            }
            else {
                return b_1;
            }
        }, sharks.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost);
    }
}

/**
 * orig diplomacy.onNewDay (L723-744): nonRandom anti-exploit decay, scribes
 * refresh, leviathan visit expiry/countdown.
 */
export function onNewDay(dp, timeElapsed, scribesResearched) {
    const dp_2 = updateSharkScribes((dp.NonRandomResetDays > 0) ? (new DiplomacyPool(dp.Races, dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays - 1, dp.BaseGoldCost, dp.BaseManpowerCost)) : (new DiplomacyPool(dp.Races, dp.RaceOrder, 0, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost)), timeElapsed, scribesResearched);
    const elders = FSharpMap__get_Item(dp_2.Races, "leviathans");
    if ((elders.Duration <= 0) && elders.Unlocked) {
        return new DiplomacyPool(add("leviathans", new RaceState(false, elders.EmbassyLevel, elders.Energy, elders.Duration, elders.Sells, elders.Buys), dp_2.Races), dp_2.RaceOrder, dp_2.NonRandomTrades, dp_2.NonRandomResetDays, dp_2.BaseGoldCost, dp_2.BaseManpowerCost);
    }
    else if (elders.Duration > 0) {
        return new DiplomacyPool(add("leviathans", new RaceState(elders.Unlocked, elders.EmbassyLevel, elders.Energy, elders.Duration - 1, elders.Sells, elders.Buys), dp_2.Races), dp_2.RaceOrder, dp_2.NonRandomTrades, dp_2.NonRandomResetDays, dp_2.BaseGoldCost, dp_2.BaseManpowerCost);
    }
    else {
        return dp_2;
    }
}

/**
 * orig unlockElders (L707-720): leviathans visit for 5 years (+1/energy);
 * no stacking, elders do not like being first.
 */
export function unlockElders(dp, daysPerYear) {
    const elders = FSharpMap__get_Item(dp.Races, "leviathans");
    if ((elders.Duration !== 0) ? true : !hasUnlockedRaces(dp)) {
        return dp;
    }
    else {
        return new DiplomacyPool(add("leviathans", new RaceState(true, elders.EmbassyLevel, elders.Energy, daysPerYear * (5 + Math.floor(elders.Energy)), elders.Sells, elders.Buys), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost);
    }
}

/**
 * orig getMarkerCap (L1162-1168): marker.getEffectiveValue = val × (1 +
 * corruptionBoostRatioChallenge seam 1), × 5 + 5, scaled by leviathansEnergyModifier.
 */
export function getMarkerCap(rp, ctx) {
    const marker = getZU(rp, "marker");
    return Math.floor(((marker.Val * 5) + 5) * (1 + ctx.GetEffect("leviathansEnergyModifier")));
}

/**
 * orig feedElders (L1170-1197): necrocorns → leviathan energy, clamped at the
 * marker cap. amt floors to necrocorn stock; 0 → displeased (duration reset).
 */
export function feedElders(dp, ctx, rp, pool, amtRequested) {
    let option_1;
    const ncorns = defaultArg((option_1 = get$(pool, "necrocorn"), (option_1 != null) ? option_1.Value : undefined), 0);
    const elders = FSharpMap__get_Item(dp.Races, "leviathans");
    const cleanRequest = (amtRequested < 1) ? 1 : amtRequested;
    const amt = Math.floor(min(cleanRequest, ncorns));
    if (amt > 0) {
        let energy = elders.Energy + (amt * (1 + ctx.GetEffect("feedEldersEfficiencyRatio")));
        const markerCap = getMarkerCap(rp, ctx);
        if (energy > markerCap) {
            energy = markerCap;
        }
        const res = FSharpMap__get_Item(pool.ByName, "necrocorn");
        const pool$0027 = new ResPool(pool.Order, add("necrocorn", new ResourceState(res.Def, res.Value - amt, res.Unlocked, res.MaxValue, res.PerTickCached), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
        return [new DiplomacyPool(add("leviathans", new RaceState(elders.Unlocked, elders.EmbassyLevel, energy, elders.Duration, elders.Sells, elders.Buys), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), pool$0027];
    }
    else {
        const res_1 = FSharpMap__get_Item(pool.ByName, "necrocorn");
        const pool$0027_1 = new ResPool(pool.Order, add("necrocorn", new ResourceState(res_1.Def, 0, res_1.Unlocked, res_1.MaxValue, res_1.PerTickCached), pool.ByName), pool.KarmaKittens, pool.EnergyProd, pool.EnergyWinterProd, pool.EnergyCons);
        return [new DiplomacyPool(add("leviathans", new RaceState(elders.Unlocked, elders.EmbassyLevel, elders.Energy, 0, elders.Sells, elders.Buys), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), pool$0027_1];
    }
}

/**
 * Side effects of deterministic unlock gates (zebras: caravanserai upgrade +
 * zebra relation policies become unlocked — orig L510-513).
 */
export class UnlockEvent extends Record {
    constructor(Race, UnlockCaravanserai, UnlockZebraPolicies) {
        super();
        this.Race = Race;
        this.UnlockCaravanserai = UnlockCaravanserai;
        this.UnlockZebraPolicies = UnlockZebraPolicies;
    }
}

export function UnlockEvent_$reflection() {
    return record_type("Game.Diplomacy.UnlockEvent", [], UnlockEvent, () => [["Race", option_type(string_type)], ["UnlockCaravanserai", bool_type], ["UnlockZebraPolicies", bool_type]]);
}

export const noneEvent = new UnlockEvent(undefined, false, false);

/**
 * orig unlockRandomRace (L484-528): deterministic gates first (nagas/zebras/
 * spiders/dragons), then ONE Math.random draw among unmet non-hidden races.
 */
export function unlockRandomRace(dp, ctx, rand) {
    let bind$0040, bind$0040_1, bind$0040_2, bind$0040_3, bind$0040_4;
    const def = (name) => find((r) => (r.Name === name), raceDefs);
    const unmetRaces = filter((n) => {
        if (!FSharpMap__get_Item(dp.Races, n).Unlocked) {
            return !def(n).Hidden;
        }
        else {
            return false;
        }
    }, dp.RaceOrder);
    const hasLockedHiddenRaces = exists((n_1) => {
        if (!FSharpMap__get_Item(dp.Races, n_1).Unlocked) {
            return def(n_1).Hidden;
        }
        else {
            return false;
        }
    }, dp.RaceOrder);
    if (isEmpty(unmetRaces) && !hasLockedHiddenRaces) {
        return [dp, noneEvent];
    }
    else if (!FSharpMap__get_Item(dp.Races, "nagas").Unlocked && (ctx.GetResValue("culture") >= 1500)) {
        return [new DiplomacyPool(add("nagas", (bind$0040 = FSharpMap__get_Item(dp.Races, "nagas"), new RaceState(true, bind$0040.EmbassyLevel, bind$0040.Energy, bind$0040.Duration, bind$0040.Sells, bind$0040.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), new UnlockEvent("nagas", noneEvent.UnlockCaravanserai, noneEvent.UnlockZebraPolicies)];
    }
    else if (!FSharpMap__get_Item(dp.Races, "zebras").Unlocked && (ctx.GetResValue("ship") >= 1)) {
        return [new DiplomacyPool(add("zebras", (bind$0040_1 = FSharpMap__get_Item(dp.Races, "zebras"), new RaceState(true, bind$0040_1.EmbassyLevel, bind$0040_1.Energy, bind$0040_1.Duration, bind$0040_1.Sells, bind$0040_1.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), new UnlockEvent("zebras", true, true)];
    }
    else if ((!FSharpMap__get_Item(dp.Races, "spiders").Unlocked && (ctx.GetResValue("ship") >= 100)) && (ctx.GetResMax("science") > 125000)) {
        return [new DiplomacyPool(add("spiders", (bind$0040_2 = FSharpMap__get_Item(dp.Races, "spiders"), new RaceState(true, bind$0040_2.EmbassyLevel, bind$0040_2.Energy, bind$0040_2.Duration, bind$0040_2.Sells, bind$0040_2.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), new UnlockEvent("spiders", noneEvent.UnlockCaravanserai, noneEvent.UnlockZebraPolicies)];
    }
    else if (!FSharpMap__get_Item(dp.Races, "dragons").Unlocked && ctx.NuclearFissionResearched) {
        return [new DiplomacyPool(add("dragons", (bind$0040_3 = FSharpMap__get_Item(dp.Races, "dragons"), new RaceState(true, bind$0040_3.EmbassyLevel, bind$0040_3.Energy, bind$0040_3.Duration, bind$0040_3.Sells, bind$0040_3.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), new UnlockEvent("dragons", noneEvent.UnlockCaravanserai, noneEvent.UnlockZebraPolicies)];
    }
    else {
        const raceId = ~~Math.floor(rand() * length(unmetRaces)) | 0;
        if (isEmpty(unmetRaces)) {
            return [dp, noneEvent];
        }
        else {
            const matchValue = tryItem(raceId, unmetRaces);
            if (matchValue == null) {
                return [dp, noneEvent];
            }
            else {
                const name_1 = matchValue;
                return [new DiplomacyPool(add(name_1, (bind$0040_4 = FSharpMap__get_Item(dp.Races, name_1), new RaceState(true, bind$0040_4.EmbassyLevel, bind$0040_4.Energy, bind$0040_4.Duration, bind$0040_4.Sells, bind$0040_4.Buys)), dp.Races), dp.RaceOrder, dp.NonRandomTrades, dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost), new UnlockEvent(name_1, noneEvent.UnlockCaravanserai, noneEvent.UnlockZebraPolicies)];
            }
        }
    }
}

/**
 * orig diplomacy.update (L588-610) fresh slice: race unlock once the year gate
 * passes. unlockYear = 20 at fresh (karmaKittens 0, prestige perk seams off).
 */
export function update(dp, ctx, year, karmaKittens, rand) {
    if (!hasUnlockedRaces(dp)) {
        if (year < ((karmaKittens > 0) ? 5 : 20)) {
            return [dp, noneEvent];
        }
        else {
            return unlockRandomRace(dp, ctx, rand);
        }
    }
    else {
        return [dp, noneEvent];
    }
}

export function getManpowerCost(dp, ctx, pollutionLevel, postApocalypseActive) {
    const manpowerCost = dp.BaseManpowerCost - ctx.GetEffect("tradeCatpowerDiscount");
    const manpowerCost_1 = postApocalypseActive ? (manpowerCost * (1 + pollutionLevel)) : manpowerCost;
    if (manpowerCost_1 < 0) {
        return 0;
    }
    else {
        return manpowerCost_1;
    }
}

export function getGoldCost(dp, ctx, pollutionLevel, postApocalypseActive) {
    const goldCost = dp.BaseGoldCost - ctx.GetEffect("tradeGoldDiscount");
    const goldCost_1 = postApocalypseActive ? (goldCost * (1 + pollutionLevel)) : goldCost;
    if (goldCost_1 < 0) {
        return 0;
    }
    else {
        return goldCost_1;
    }
}

/**
 * orig getTradeVolume (L1082): (1 + tradeVolume) * (1 + ambassador tradeVolume)
 */
export function getTradeVolume(ctx, ambassadorEffects) {
    return (1 + ctx.GetEffect("tradeVolume")) * (1 + defaultArg(tryFind("tradeVolume", ambassadorEffects), 0));
}

/**
 * orig getTradeRatio (L404): tradeRatio effect + merchant leader seam (0).
 */
export function getTradeRatio(ctx) {
    return ctx.GetEffect("tradeRatio");
}

/**
 * orig calculateStandingFromPolicies: policy-gated, 0 at this slice.
 * orig calculatePhantomTradeposts (L1222-1231): globalRelationsBonus +
 * zebra/nonZebra relation modifiers from policies
 */
export function calculatePhantomTradeposts(ctx, raceName) {
    return ctx.GetEffect("globalRelationsBonus") + ((raceName === "zebras") ? ctx.GetEffect("zebraRelationModifier") : ctx.GetEffect("nonZebraRelationModifier"));
}

/**
 * orig calculateStandingFromPolicies (L1232-1236): phantom × tradepost standingRatio
 */
export function calculateStandingFromPolicies(ctx, tradepostStandingRatio, raceName) {
    return calculatePhantomTradeposts(ctx, raceName) * tradepostStandingRatio;
}

export function getFinalStanding(dp, ctx, raceName, tradepostStandingRatio, diplomatsResearched, neutralRaceEmbassyStanding) {
    const def = find((r) => (r.Name === raceName), raceDefs);
    const race = FSharpMap__get_Item(dp.Races, raceName);
    const bonusStanding = ctx.GetEffect("standingRatio") + calculateStandingFromPolicies(ctx, tradepostStandingRatio, raceName);
    if (def.Standing < 0) {
        return min(def.Standing + bonusStanding, 0);
    }
    else if (def.Standing === 0) {
        if (diplomatsResearched) {
            return max(((bonusStanding + (race.EmbassyLevel * neutralRaceEmbassyStanding)) - 0.25) / 3, 0);
        }
        else {
            return 0;
        }
    }
    else {
        return def.Standing + (bonusStanding / 2);
    }
}

export function getAmbassadorEffect(ambassadorEffects, name) {
    return defaultArg(tryFind(name, ambassadorEffects), 0);
}

/**
 * orig isValidTrade (L456-462)
 */
export function isValidTrade(dp, ctx, sell, raceName, ambassadorEffects) {
    const race = FSharpMap__get_Item(dp.Races, raceName);
    let hasHighEnoughEmbassyLevel;
    const matchValue = sell.MinLevel;
    hasHighEnoughEmbassyLevel = ((matchValue == null) ? true : (race.EmbassyLevel >= matchValue));
    const isResourceTradeable = ((ctx.IsResUnlocked(sell.Name) ? true : (sell.Name === "coal")) ? true : (sell.Name === "uranium")) ? true : (raceName === "leviathans");
    const positiveChance = (sell.Chance + getAmbassadorEffect(ambassadorEffects, "tradeNormalResChance")) > 0;
    if (hasHighEnoughEmbassyLevel && isResourceTradeable) {
        return positiveChance;
    }
    else {
        return false;
    }
}

export function getBlueprintTradeChance(ambassadorEffects, raceName, ctx) {
    const retVal = 0.1 + getAmbassadorEffect(ambassadorEffects, "tradeBlueprintChance");
    if (raceName === "nagas") {
        return retVal + ctx.GetEffect("nagaBlueprintTradeChance");
    }
    else {
        return retVal;
    }
}

export function getSpiceTradeChance(dp, ambassadorEffects, raceName, ctx) {
    const embassyEffect = ctx.IronWill ? 0.0025 : 0.01;
    const baseChance = 0.35 + getAmbassadorEffect(ambassadorEffects, "tradeSpiceChance");
    const race = FSharpMap__get_Item(dp.Races, raceName);
    return baseChance * (1 + (!isEmpty(find((r) => (r.Name === raceName), raceDefs).EmbassyPrices) ? (race.EmbassyLevel * embassyEffect) : 0));
}

export function getResourceTradeChance(dp, ctx, sell, raceName, ambassadorEffects) {
    const embassyEffect = ctx.IronWill ? 0.0025 : 0.01;
    if (!isValidTrade(dp, ctx, sell, raceName, ambassadorEffects)) {
        return 0;
    }
    else {
        const baseChance = sell.Chance + getAmbassadorEffect(ambassadorEffects, "tradeNormalResChance");
        if (baseChance <= 0) {
            return 0;
        }
        else {
            const race = FSharpMap__get_Item(dp.Races, raceName);
            return baseChance * (1 + (!isEmpty(find((r) => (r.Name === raceName), raceDefs).EmbassyPrices) ? getLimitedDR(race.EmbassyLevel * embassyEffect, 0.75 + getAmbassadorEffect(ambassadorEffects, "embassyEffectCap")) : 0));
        }
    }
}

export class TradeResults extends Record {
    constructor(Failed, Normal, Bonus) {
        super();
        this.Failed = Failed;
        this.Normal = Normal;
        this.Bonus = Bonus;
    }
}

export function TradeResults_$reflection() {
    return record_type("Game.Diplomacy.TradeResults", [], TradeResults, () => [["Failed", float64_type], ["Normal", float64_type], ["Bonus", float64_type]]);
}

/**
 * orig calculateFailedNormalBonusTrades (L813-853)
 */
export function calculateFailedNormalBonusTrades(ctx, rand, standing, numTrades, nonRandom) {
    if (standing < 0) {
        const failed = min(nonRandom, numTrades) + binominalRandomInteger(rand, max(numTrades - nonRandom, 0), -standing);
        return new TradeResults(failed, numTrades - failed, 0);
    }
    else if (standing > 0) {
        if (standing >= 1) {
            return new TradeResults(0, 0, numTrades);
        }
        else {
            const bonus = binominalRandomInteger(rand, max(numTrades - nonRandom, 0), standing);
            return new TradeResults(0, numTrades - bonus, bonus);
        }
    }
    else {
        return new TradeResults(0, numTrades, 0);
    }
}

/**
 * orig _fuzzGainedAmount (L963): amount + width * (irwinHall(amount) - amount/2)
 */
export function fuzzGainedAmount(rand, amount, width) {
    return amount + (width * (irwinHallRandom(rand, amount) - (amount / 2)));
}

/**
 * orig tradeImpl (L859-961): pure computation + nonRandom bookkeeping.
 * Returns bought resources (name → amount) + updated NonRandomTrades state.
 * Returns (pool, boughtResources, successfulTradeAmount).
 */
export function tradeImpl(dp, ctx, rand, raceName, totalTradeAmount, ambassadorEffects, tradepostStandingRatio, diplomatsResearched, neutralRaceEmbassyStanding, pacifismTradeBonus, pollutionLevel, postApocalypseActive) {
    let table_3, NonRandomTrades_1;
    find((r) => (r.Name === raceName), raceDefs);
    const raceState = FSharpMap__get_Item(dp.Races, raceName);
    const tradeResults = calculateFailedNormalBonusTrades(ctx, rand, getFinalStanding(dp, ctx, raceName, tradepostStandingRatio, diplomatsResearched, neutralRaceEmbassyStanding), totalTradeAmount, dp.NonRandomTrades);
    const dp_1 = new DiplomacyPool(dp.Races, dp.RaceOrder, max(dp.NonRandomTrades - tradeResults.Failed, 0), dp.NonRandomResetDays, dp.BaseGoldCost, dp.BaseManpowerCost);
    const normalTradeAmount = tradeResults.Normal;
    const bonusTradeAmount = tradeResults.Bonus;
    const successfullTradeAmount = normalTradeAmount + bonusTradeAmount;
    if (successfullTradeAmount === 0) {
        return [dp_1, empty({
            Compare: (x, y) => (comparePrimitives(x, y) | 0),
        }), 0];
    }
    else {
        let dp_2 = dp_1;
        const race = FSharpMap__get_Item(dp_2.Races, raceName);
        const duration = min(race.Duration, 100 * (4 + Math.floor(race.Energy)));
        dp_2 = (new DiplomacyPool(add(raceName, new RaceState(race.Unlocked, race.EmbassyLevel, race.Energy, duration, race.Sells, race.Buys), dp_2.Races), dp_2.RaceOrder, dp_2.NonRandomTrades, dp_2.NonRandomResetDays, dp_2.BaseGoldCost, dp_2.BaseManpowerCost));
        const tradeVolume = getTradeVolume(ctx, ambassadorEffects);
        const tradeRatio = ((1 + getTradeRatio(ctx)) + (calculatePhantomTradeposts(ctx, raceName) * 0.015)) + pacifismTradeBonus;
        const raceRatio = 1 + (race.Energy * 0.02);
        let bought = empty({
            Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
        });
        const enumerator = getEnumerator(raceState.Sells);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const sell = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const tradeChance = getResourceTradeChance(dp_2, ctx, sell, raceName, ambassadorEffects);
                if (tradeChance !== 0) {
                    let eligibleForResNormal = normalTradeAmount;
                    let eligibleForResBonus = bonusTradeAmount;
                    if ((tradeChance < 1) && (dp_2.NonRandomTrades !== 0)) {
                        eligibleForResNormal = max(normalTradeAmount - dp_2.NonRandomTrades, 0);
                        eligibleForResBonus = max(bonusTradeAmount - max(dp_2.NonRandomTrades - normalTradeAmount, 0), 0);
                    }
                    const passedNormal = binominalRandomInteger(rand, eligibleForResNormal, tradeChance);
                    const passedBonus = binominalRandomInteger(rand, eligibleForResBonus, tradeChance);
                    if ((passedNormal + passedBonus) !== 0) {
                        const amt = (((((fuzzGainedAmount(rand, passedNormal, sell.Width) + (fuzzGainedAmount(rand, passedBonus, sell.Width) * 1.25)) * sell.Value) * tradeRatio) * raceRatio) * (1 + defaultArg(tryFind(ctx.Season, sell.Seasons), 0))) * tradeVolume;
                        bought = add(sell.Name, amt, bought);
                    }
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        const spiceChance = getSpiceTradeChance(dp_2, ambassadorEffects, raceName, ctx);
        let eligibleForSpice = successfullTradeAmount;
        if ((spiceChance < 1) && (dp_2.NonRandomTrades !== 0)) {
            eligibleForSpice = max(successfullTradeAmount - dp_2.NonRandomTrades, 0);
        }
        const spiceTradeAmount = binominalRandomInteger(rand, eligibleForSpice, spiceChance);
        let spiceAmt = (25 * spiceTradeAmount) + ((50 * tradeRatio) * irwinHallRandom(rand, spiceTradeAmount));
        if (spiceChance > 1) {
            spiceAmt = (spiceAmt * spiceChance);
        }
        bought = ((table_3 = bought, add("spice", spiceAmt, table_3)));
        const blueprintTradeChance = getBlueprintTradeChance(ambassadorEffects, raceName, ctx);
        let eligibleForBlueprint = successfullTradeAmount;
        if ((blueprintTradeChance < 1) && (dp_2.NonRandomTrades !== 0)) {
            eligibleForBlueprint = max(successfullTradeAmount - dp_2.NonRandomTrades, 0);
        }
        const blueprintAmt = Math.floor(binominalRandomInteger(rand, eligibleForBlueprint, blueprintTradeChance));
        bought = add("blueprint", blueprintAmt, bought);
        if (raceName === "zebras") {
            const shipAmount = ctx.GetResValue("ship");
            const tradepostTradeRatio = defaultArg(tryFind("tradeRatio", find((b) => (b.Name === "tradepost"), buildingDefs).Effects), 0);
            const zebraRelationModifierTitanium = ctx.GetEffect("zebraRelationModifier") * tradepostTradeRatio;
            const titaniumTradeChance = 0.15 + (shipAmount * 0.0035);
            let eligibleForTitanium = successfullTradeAmount;
            if ((titaniumTradeChance < 1) && (dp_2.NonRandomTrades !== 0)) {
                eligibleForTitanium = max(successfullTradeAmount - dp_2.NonRandomTrades, 0);
            }
            const titaniumAmt = (((1.5 + (shipAmount * 0.03)) * (1 + zebraRelationModifierTitanium)) * tradeVolume) * binominalRandomInteger(rand, eligibleForTitanium, titaniumTradeChance);
            bought = add("titanium", titaniumAmt, bought);
        }
        dp_2 = ((NonRandomTrades_1 = max(dp_2.NonRandomTrades - successfullTradeAmount, 0), new DiplomacyPool(dp_2.Races, dp_2.RaceOrder, NonRandomTrades_1, dp_2.NonRandomResetDays, dp_2.BaseGoldCost, dp_2.BaseManpowerCost)));
        return [dp_2, bought, successfullTradeAmount];
    }
}

/**
 * orig getMaxTradeAmt (L1084-1107): min of affordable trades across gold /
 * manpower / the buy resource; None when 0 or unbounded. (JS returns undefined.)
 */
export function getMaxTradeAmt(dp, ctx, pollutionLevel, postApocalypseActive, ambassadorEffects, raceName) {
    const raceState = FSharpMap__get_Item(dp.Races, raceName);
    const manpowerCost = getManpowerCost(dp, ctx, pollutionLevel, postApocalypseActive);
    const goldCost = getGoldCost(dp, ctx, pollutionLevel, postApocalypseActive);
    const volume = getTradeVolume(ctx, ambassadorEffects);
    const goldAmt = Math.floor(ctx.GetResValue("gold") / max(goldCost, 1));
    const manpAmt = Math.floor(ctx.GetResValue("manpower") / max(manpowerCost, 1));
    const buyAmt = Math.floor(ctx.GetResValue(item(0, raceState.Buys).Resource) / (item(0, raceState.Buys).Val * volume));
    const minAmt = min(goldAmt + ((goldCost > 0) ? 0 : 1.7976931348623157E+308), min(manpAmt + ((manpowerCost > 0) ? 0 : 1.7976931348623157E+308), buyAmt));
    if ((minAmt === 1.7976931348623157E+308) ? true : (minAmt === 0)) {
        return undefined;
    }
    else {
        return minAmt;
    }
}

/**
 * orig trade undo: only while every gained resource is still in stock; then
 * un-gain, un-spend, and re-arm the anti-exploit nonRandom counter.
 */
export function undoTrade(calendarDay, trades, spent, gained, pool, dp) {
    if (!forAll((tupledArg) => {
        let option_1;
        return defaultArg((option_1 = get$(pool, tupledArg[0]), (option_1 != null) ? option_1.Value : undefined), 0) >= tupledArg[1];
    }, gained)) {
        return [dp, pool, false];
    }
    else {
        let pool_1 = pool;
        const enumerator = getEnumerator(gained);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput = addResEvent(calendarDay, forLoopVar[0], -forLoopVar[1], pool_1);
                pool_1 = patternInput[0];
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        const enumerator_1 = getEnumerator(spent);
        try {
            while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const patternInput_1 = addResEvent(calendarDay, forLoopVar_1[0], forLoopVar_1[1], pool_1);
                pool_1 = patternInput_1[0];
            }
        }
        finally {
            disposeSafe(enumerator_1);
        }
        return [new DiplomacyPool(dp.Races, dp.RaceOrder, dp.NonRandomTrades + trades, 45, dp.BaseGoldCost, dp.BaseManpowerCost), pool_1, true];
    }
}

/**
 * orig EmbassyButtonController getPrices: culture × (1 - embassyCostReduction)
 * × 1.15^(embassyLevel + embassyFakeBought)
 */
export function embassyPrices(dp, ctx, raceName) {
    const def = find((r) => (r.Name === raceName), raceDefs);
    const race = FSharpMap__get_Item(dp.Races, raceName);
    const priceCoeficient = 1 - ctx.GetEffect("embassyCostReduction");
    return map((p) => {
        let arg1__3;
        return new Price(p.Resource, (p.Val * priceCoeficient) * ((arg1__3 = (race.EmbassyLevel + ctx.GetEffect("embassyFakeBought")), Math.pow(1.15, arg1__3))));
    }, def.EmbassyPrices);
}

/**
 * Buy n embassies while affordable (build loop; increments embassyLevel).
 * Requires writing researched + race unlocked (buyItem gates L1626-1643) —
 * the caller checks those gates and passes n>0 only when they hold.
 */
export function buyEmbassies(calendarDay, dp, ctx, pool, n, raceName) {
    let dp_1 = dp;
    let pool_1 = pool;
    let counter = 0;
    let stop = false;
    while (!stop && (counter < n)) {
        const prices = map((p) => [p.Resource, p.Val], embassyPrices(dp_1, ctx, raceName));
        if (hasRes(pool_1, prices, 0)) {
            pool_1 = payPrices(calendarDay, pool_1, prices);
            const race = FSharpMap__get_Item(dp_1.Races, raceName);
            dp_1 = (new DiplomacyPool(add(raceName, new RaceState(race.Unlocked, race.EmbassyLevel + 1, race.Energy, race.Duration, race.Sells, race.Buys), dp_1.Races), dp_1.RaceOrder, dp_1.NonRandomTrades, dp_1.NonRandomResetDays, dp_1.BaseGoldCost, dp_1.BaseManpowerCost));
            counter = ((counter + 1) | 0);
        }
        else {
            stop = true;
        }
    }
    return [dp_1, pool_1, counter];
}

