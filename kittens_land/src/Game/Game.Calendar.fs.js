
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { unit_type, bool_type, lambda_type, option_type, int32_type, record_type, class_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { length, item, ofArray, singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { equals, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { loopOrGaussianApproximation, log1p, getLimitedDR, uniformRandomInteger, jsRound } from "./Game.Math.fs.js";
import { min, max } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";

export class SeasonDef extends Record {
    constructor(Name, Modifiers) {
        super();
        this.Name = Name;
        this.Modifiers = Modifiers;
    }
}

export function SeasonDef_$reflection() {
    return record_type("Game.Calendar.SeasonDef", [], SeasonDef, () => [["Name", string_type], ["Modifiers", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export const seasons = ofArray([new SeasonDef("spring", ofList(singleton(["catnip", 1.5]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new SeasonDef("summer", ofList(singleton(["catnip", 1]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new SeasonDef("autumn", ofList(singleton(["catnip", 1]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new SeasonDef("winter", ofList(singleton(["catnip", 0.25]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}))]);

export const cycleYearColors = ofArray(["#A00000", "#DBA901", "#14CD61", "#01A9DB", "#9A2EFE"]);

export const cycleNames = ofArray(["charon", "umbra", "yarn", "helios", "cath", "redmoon", "dune", "piscine", "terminus", "kairo"]);

export const ticksPerDay = 10;

export const daysPerSeason = 100;

export class CalendarState extends Record {
    constructor(Year, Day, Season, Weather, Cycle, CycleYear, EventChance, FestivalDays, CryptoPrice, ObserveRemainingTime) {
        super();
        this.Year = Year;
        this.Day = Day;
        this.Season = (Season | 0);
        this.Weather = Weather;
        this.Cycle = (Cycle | 0);
        this.CycleYear = (CycleYear | 0);
        this.EventChance = EventChance;
        this.FestivalDays = (FestivalDays | 0);
        this.CryptoPrice = CryptoPrice;
        this.ObserveRemainingTime = (ObserveRemainingTime | 0);
    }
}

export function CalendarState_$reflection() {
    return record_type("Game.Calendar.CalendarState", [], CalendarState, () => [["Year", float64_type], ["Day", float64_type], ["Season", int32_type], ["Weather", option_type(string_type)], ["Cycle", int32_type], ["CycleYear", int32_type], ["EventChance", float64_type], ["FestivalDays", int32_type], ["CryptoPrice", float64_type], ["ObserveRemainingTime", int32_type]]);
}

export const init = new CalendarState(0, 0, 0, undefined, 0, 0, 0, 0, 1000, 0);

/**
 * Everything the calendar slices read from managers not yet ported. Fresh-state
 * values below are verified against the orig harness.
 */
export class CalendarContext extends Record {
    constructor(GetEffect, TimeAccelerationRatio, DarkFuture, ChronomancyResearched, UnicornmancyResearched, Year1000ChallengeActive, WinterIsComingResearched, WinterIsComingActive, AdvancedAutomationResearched, CommunismResearched, WinterIsComingOn, Rand, OnParadox, OnNewDayRefresh, OnNewDayTail, OnObserveTimeout, OnFlux, OnNewSeasonTail) {
        super();
        this.GetEffect = GetEffect;
        this.TimeAccelerationRatio = TimeAccelerationRatio;
        this.DarkFuture = DarkFuture;
        this.ChronomancyResearched = ChronomancyResearched;
        this.UnicornmancyResearched = UnicornmancyResearched;
        this.Year1000ChallengeActive = Year1000ChallengeActive;
        this.WinterIsComingResearched = WinterIsComingResearched;
        this.WinterIsComingActive = WinterIsComingActive;
        this.AdvancedAutomationResearched = AdvancedAutomationResearched;
        this.CommunismResearched = CommunismResearched;
        this.WinterIsComingOn = WinterIsComingOn;
        this.Rand = Rand;
        this.OnParadox = OnParadox;
        this.OnNewDayRefresh = OnNewDayRefresh;
        this.OnNewDayTail = OnNewDayTail;
        this.OnObserveTimeout = OnObserveTimeout;
        this.OnFlux = OnFlux;
        this.OnNewSeasonTail = OnNewSeasonTail;
    }
}

export function CalendarContext_$reflection() {
    return record_type("Game.Calendar.CalendarContext", [], CalendarContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["TimeAccelerationRatio", float64_type], ["DarkFuture", bool_type], ["ChronomancyResearched", bool_type], ["UnicornmancyResearched", bool_type], ["Year1000ChallengeActive", bool_type], ["WinterIsComingResearched", bool_type], ["WinterIsComingActive", bool_type], ["AdvancedAutomationResearched", bool_type], ["CommunismResearched", bool_type], ["WinterIsComingOn", bool_type], ["Rand", lambda_type(unit_type, float64_type)], ["OnParadox", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())], ["OnNewDayRefresh", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())], ["OnNewDayTail", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())], ["OnObserveTimeout", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())], ["OnFlux", lambda_type(float64_type, unit_type)], ["OnNewSeasonTail", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())]]);
}

/**
 * Season/weather production modifier (orig getWeatherMod) — catnip only.
 * `weather` comes from calendar-02 rolls; policy/challenge seams are fresh-false.
 */
export function getWeatherMod(ctx, st, resName) {
    const season = item(st.Season, seasons);
    let mod$0027 = defaultArg(tryFind(resName, season.Modifiers), 1);
    if (resName !== "catnip") {
        return mod$0027;
    }
    else if ((ctx.CommunismResearched && (season.Name === "winter")) && equals(st.Weather, "cold")) {
        return 0;
    }
    else {
        if (equals(st.Weather, "warm")) {
            mod$0027 = (mod$0027 + 0.15);
        }
        else if (equals(st.Weather, "cold")) {
            mod$0027 = (mod$0027 - 0.15);
        }
        if (season.Name === "spring") {
            mod$0027 = (mod$0027 * (1 + ctx.GetEffect("springCatnipRatio")));
        }
        return mod$0027;
    }
}

function roundToCentiday(st) {
    return new CalendarState(st.Year, jsRound(st.Day * 100) / 100, st.Season, st.Weather, st.Cycle, st.CycleYear, st.EventChance, st.FestivalDays, st.CryptoPrice, st.ObserveRemainingTime);
}

/**
 * orig calendar.tick() — progression + new-day/season/year slices. The time
 * flux bookkeeping (time-01) is the one skipped side effect; it touches no
 * snapshotted state.
 */
export function tick(ctx, st) {
    let ObserveRemainingTime, Day, Day_1, Season, Day_2, FestivalDays, Cycle;
    let st_1 = st;
    if (st_1.ObserveRemainingTime > 0) {
        st_1 = ((ObserveRemainingTime = ((st_1.ObserveRemainingTime - 1) | 0), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, ObserveRemainingTime)));
        if (st_1.ObserveRemainingTime === 0) {
            st_1 = ctx.OnObserveTimeout(st_1);
        }
    }
    const previousIntDay = Math.floor(st_1.Day);
    st_1 = ((Day = (st_1.Day + ((1 + ctx.TimeAccelerationRatio) / ticksPerDay)), new CalendarState(st_1.Year, Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
    st_1 = roundToCentiday(st_1);
    const ticksPerYear = (ticksPerDay * daysPerSeason) * length(seasons);
    if (st_1.Day < 0) {
        ctx.OnFlux((-1 / (1 + ctx.TimeAccelerationRatio)) / ticksPerYear);
    }
    else {
        ctx.OnFlux(ctx.TimeAccelerationRatio / ticksPerYear);
    }
    if (Math.floor(st_1.Day) === previousIntDay) {
        return st_1;
    }
    else {
        let newSeason = false;
        let newYear = false;
        if (st_1.Day >= daysPerSeason) {
            st_1 = ((Day_1 = (st_1.Day - daysPerSeason), new CalendarState(st_1.Year, Day_1, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
            st_1 = roundToCentiday(st_1);
            st_1 = ((Season = ((st_1.Season + 1) | 0), new CalendarState(st_1.Year, st_1.Day, Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
            newSeason = true;
            const temporalParadoxChance = ctx.GetEffect("temporalParadoxChance");
            if (ctx.Rand() < temporalParadoxChance) {
                st_1 = ((Day_2 = (-10 - ctx.GetEffect("temporalParadoxDay")), new CalendarState(st_1.Year, Day_2, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
            }
            if (st_1.Season >= length(seasons)) {
                st_1 = (new CalendarState(st_1.Year, st_1.Day, 0, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                const yearInc = (ctx.Year1000ChallengeActive && (st_1.Year >= 500)) ? 0 : 1;
                st_1 = (new CalendarState(st_1.Year + yearInc, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                newYear = true;
            }
        }
        if (st_1.Day < 0) {
            st_1 = ctx.OnParadox(st_1);
        }
        if (st_1.FestivalDays > 0) {
            st_1 = ((FestivalDays = ((st_1.FestivalDays - 1) | 0), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
            ctx.GetEffect("festivalLuxuryConsumptionRatio");
        }
        st_1 = ctx.OnNewDayTail(st_1);
        st_1 = ctx.OnNewDayRefresh(st_1);
        if (newSeason) {
            st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, 0, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
            if (st_1.Year > 3) {
                let coldChance = 175;
                let warmChance = 175;
                const effect = 1000 * ctx.GetEffect("coldChance");
                coldChance = (coldChance + effect);
                warmChance = (warmChance - effect);
                if (warmChance < 0) {
                    warmChance = 0;
                }
                if (((item(st_1.Season, seasons).Name === "winter") && ctx.WinterIsComingResearched) && !ctx.WinterIsComingActive) {
                    coldChance = 0;
                }
                const rand = uniformRandomInteger(ctx.Rand, 0, 1000);
                if (rand < warmChance) {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, "warm", st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                }
                else if (rand < (warmChance + coldChance)) {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, "cold", st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                }
                else {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, undefined, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                }
            }
            else {
                st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, undefined, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
            }
            st_1 = ctx.OnNewSeasonTail(st_1);
            if (newYear) {
                if ((st_1.Year % 1000) === 0) {
                }
                if (((~~st_1.Year % 1000) + 1) === 1000) {
                }
                const cycleYear$0027 = (st_1.CycleYear + 1) | 0;
                if (cycleYear$0027 >= length(cycleYearColors)) {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, 0, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                    const cycle$0027 = (st_1.Cycle + 1) | 0;
                    st_1 = ((Cycle = (((cycle$0027 >= length(cycleNames)) ? 0 : cycle$0027) | 0), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime)));
                }
                else {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, cycleYear$0027, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
                }
            }
        }
        return st_1;
    }
}

/**
 * Season production modifiers of the current season (calendar-02, used by game-10).
 */
export function seasonModifiers(st) {
    return item(st.Season, seasons).Modifiers;
}

export class FastForwardContext extends Record {
    constructor(GetEffect, Rand, IronWill, LibraryOn, AstronomyResearched, BlackSkyActive, Chronomancy, Unicornmancy, Astromancy, Alicornmancy, PacifismActive, AnimalResearched, ArcheryResearched, MiningResearched, CelestialMechanics, Prospecting, Seti, Year1000Active, AntimatterResearched, EnergyBalanced, UnicornsValue, ZebrasValue, ZebrasMax, AddResEvent, AddResPerTick, OnAlicornUpgrade, OnParagon, OnMillenniumKarma, OnYearsAdvanced, SpaceBeaconAction, UpdateCaches) {
        super();
        this.GetEffect = GetEffect;
        this.Rand = Rand;
        this.IronWill = IronWill;
        this.LibraryOn = LibraryOn;
        this.AstronomyResearched = AstronomyResearched;
        this.BlackSkyActive = BlackSkyActive;
        this.Chronomancy = Chronomancy;
        this.Unicornmancy = Unicornmancy;
        this.Astromancy = Astromancy;
        this.Alicornmancy = Alicornmancy;
        this.PacifismActive = PacifismActive;
        this.AnimalResearched = AnimalResearched;
        this.ArcheryResearched = ArcheryResearched;
        this.MiningResearched = MiningResearched;
        this.CelestialMechanics = CelestialMechanics;
        this.Prospecting = Prospecting;
        this.Seti = Seti;
        this.Year1000Active = Year1000Active;
        this.AntimatterResearched = AntimatterResearched;
        this.EnergyBalanced = EnergyBalanced;
        this.UnicornsValue = UnicornsValue;
        this.ZebrasValue = ZebrasValue;
        this.ZebrasMax = ZebrasMax;
        this.AddResEvent = AddResEvent;
        this.AddResPerTick = AddResPerTick;
        this.OnAlicornUpgrade = OnAlicornUpgrade;
        this.OnParagon = OnParagon;
        this.OnMillenniumKarma = OnMillenniumKarma;
        this.OnYearsAdvanced = OnYearsAdvanced;
        this.SpaceBeaconAction = SpaceBeaconAction;
        this.UpdateCaches = UpdateCaches;
    }
}

export function FastForwardContext_$reflection() {
    return record_type("Game.Calendar.FastForwardContext", [], FastForwardContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["Rand", lambda_type(unit_type, float64_type)], ["IronWill", bool_type], ["LibraryOn", bool_type], ["AstronomyResearched", bool_type], ["BlackSkyActive", bool_type], ["Chronomancy", bool_type], ["Unicornmancy", bool_type], ["Astromancy", bool_type], ["Alicornmancy", bool_type], ["PacifismActive", bool_type], ["AnimalResearched", bool_type], ["ArcheryResearched", bool_type], ["MiningResearched", bool_type], ["CelestialMechanics", bool_type], ["Prospecting", bool_type], ["Seti", bool_type], ["Year1000Active", bool_type], ["AntimatterResearched", bool_type], ["EnergyBalanced", bool_type], ["UnicornsValue", lambda_type(unit_type, float64_type)], ["ZebrasValue", lambda_type(unit_type, float64_type)], ["ZebrasMax", lambda_type(unit_type, float64_type)], ["AddResEvent", lambda_type(string_type, lambda_type(float64_type, unit_type))], ["AddResPerTick", lambda_type(string_type, lambda_type(float64_type, unit_type))], ["OnAlicornUpgrade", lambda_type(unit_type, unit_type)], ["OnParagon", lambda_type(float64_type, unit_type)], ["OnMillenniumKarma", lambda_type(float64_type, unit_type)], ["OnYearsAdvanced", lambda_type(float64_type, unit_type)], ["SpaceBeaconAction", lambda_type(unit_type, unit_type)], ["UpdateCaches", lambda_type(unit_type, unit_type)]]);
}

export function getAstroEventAutoChance(ctx) {
    if (ctx.Seti) {
        return 1;
    }
    else {
        let autoChance = ctx.GetEffect("starAutoSuccessChance");
        if (ctx.Astromancy) {
            autoChance = (autoChance * 2);
        }
        autoChance = (ctx.IronWill ? max(0.25, autoChance) : max(0, autoChance));
        return min(autoChance, 1);
    }
}

export function fastForward(ctx, st, days) {
    let CryptoPrice, CryptoPrice_1, CryptoPrice_2;
    let st_1 = st;
    const timeRatioBonus = 1 + (ctx.GetEffect("timeRatio") * 0.25);
    const chanceRatio = (ctx.Chronomancy ? 1.1 : 1) * timeRatioBonus;
    const unicornChanceRatio = (ctx.Unicornmancy ? 1.1 : 1) * timeRatioBonus;
    let totalEvents = 0;
    if ((ctx.LibraryOn ? true : ctx.AstronomyResearched) && !ctx.BlackSkyActive) {
        let eventChance = (0.0025 + ctx.GetEffect("starEventChance")) * chanceRatio;
        if (ctx.Astromancy) {
            eventChance = (eventChance * 2);
        }
        const autoChance = getAstroEventAutoChance(ctx);
        const numberEvents = jsRound((days * eventChance) * autoChance);
        if ((numberEvents > 0) && ctx.AstronomyResearched) {
            ctx.AddResEvent("starchart", numberEvents);
        }
        const celestialBonus = ctx.CelestialMechanics ? (ctx.IronWill ? 1.6 : 1.2) : 1;
        const sciBonus = ((numberEvents * 25) * celestialBonus) * (1 + ctx.GetEffect("scienceRatio"));
        ctx.AddResEvent("science", sciBonus);
        totalEvents = (totalEvents + numberEvents);
    }
    const iwChance = ctx.IronWill ? 40 : 0;
    const baseChance = 10 * chanceRatio;
    if (ctx.MiningResearched) {
        const numberEvents_1 = jsRound((days * (baseChance + iwChance)) / 10000);
        let mineralsAmt = 50 + (25 * ctx.GetEffect("mineralsRatio"));
        const minerologyBonus = ctx.GetEffect("academyMeteorBonus");
        if (ctx.IronWill) {
            mineralsAmt = (mineralsAmt + (mineralsAmt * 0.1));
        }
        mineralsAmt = (mineralsAmt * (1 + (ctx.GetEffect("mineralsPolicyRatio") / 3)));
        mineralsAmt = (mineralsAmt * (1 + minerologyBonus));
        ctx.AddResEvent("minerals", numberEvents_1 * mineralsAmt);
        if (ctx.CelestialMechanics) {
            ctx.AddResEvent("science", (numberEvents_1 * 15) * (1 + ctx.GetEffect("scienceRatio")));
        }
        if (ctx.Prospecting) {
            ctx.AddResEvent("iron", (numberEvents_1 * 5) * (1 + minerologyBonus));
        }
        totalEvents = (totalEvents + numberEvents_1);
    }
    if (ctx.IronWill) {
        if ((ctx.UnicornsValue() < 2) && ctx.ArcheryResearched) {
            const numberEvents_2 = jsRound(((days * 17) * unicornChanceRatio) / 100000);
            ctx.AddResEvent("unicorns", numberEvents_2);
            totalEvents = (totalEvents + numberEvents_2);
        }
        if ((ctx.ZebrasValue() > 0) && (ctx.ZebrasValue() < ctx.ZebrasMax())) {
            const numberEvents_3 = jsRound((days * 500) / 100000);
            ctx.AddResEvent("zebras", numberEvents_3);
            totalEvents = (totalEvents + numberEvents_3);
        }
    }
    if ((ctx.PacifismActive && (ctx.UnicornsValue() < 2)) && ctx.AnimalResearched) {
        const numberEvents_4 = jsRound(((days * 17) * unicornChanceRatio) / 100000);
        ctx.AddResEvent("unicorns", numberEvents_4);
        totalEvents = (totalEvents + numberEvents_4);
    }
    const numberEvents_5 = jsRound((days * ctx.GetEffect("riftChance")) * unicornChanceRatio);
    ctx.AddResEvent("unicorns", numberEvents_5 * 500);
    totalEvents = (totalEvents + numberEvents_5);
    const aliChance = ctx.GetEffect("alicornChance") * (1 + getLimitedDR(ctx.GetEffect("alicornPerTickRatio"), 1.2));
    const aliEvents = jsRound(days * aliChance);
    if (aliEvents >= 1) {
        ctx.AddResEvent("alicorn", aliEvents);
        ctx.OnAlicornUpgrade();
    }
    totalEvents = (totalEvents + aliEvents);
    const ivEvents = jsRound((days * ctx.GetEffect("ivoryMeteorChance")) * unicornChanceRatio);
    if (ivEvents > 0) {
        const ivoryRoll = uniformRandomInteger(ctx.Rand, 0, 1500);
        const ivory = 250 + (ivoryRoll * (1 + ctx.GetEffect("ivoryMeteorRatio")));
        ctx.AddResEvent("ivory", ivory * ivEvents);
    }
    totalEvents = (totalEvents + ivEvents);
    const yearsOffset = Math.floor(days / (daysPerSeason * length(seasons)));
    if (ctx.EnergyBalanced) {
        const yearProd = (ctx.GetEffect("antimatterProduction") * (1 + ctx.GetEffect("antimatterPolicyRatio"))) * (1 + ctx.GetEffect("pyramidPerYearRatio"));
        ctx.AddResEvent("antimatter", yearProd * yearsOffset);
    }
    ctx.SpaceBeaconAction();
    ctx.UpdateCaches();
    ctx.AddResPerTick("relic", ctx.GetEffect("relicPerDay") * days);
    const temporalParadoxChance = ctx.GetEffect("temporalParadoxChance");
    if (temporalParadoxChance > 0) {
        const daysInParadox = 10 + ctx.GetEffect("temporalParadoxDay");
        const daysBetweenParadox = daysInParadox + (100 * max(1, 1 / temporalParadoxChance));
        const percentTimeInParadox = daysInParadox / daysBetweenParadox;
        const voidStatistical = (ctx.GetEffect("temporalParadoxVoid") + 1) / 2;
        ctx.AddResEvent("void", Math.floor((voidStatistical * days) * percentTimeInParadox));
    }
    if (ctx.AntimatterResearched) {
        const cryptoBase = () => {
            const y = ctx.Rand();
            if (y < 0.3) {
                return log1p((y - 0.3) / (0.3 * 40000));
            }
            else if (y < 0.6) {
                return 0;
            }
            else {
                return log1p((y - 0.6) / (0.4 * 40000));
            }
        };
        const logIncrease = loopOrGaussianApproximation(ctx.Rand, days - 1, false, 1.249927083463528E-06, 1.4427062504448777E-10, log1p(-1 / 40000), log1p(1 / 40000), cryptoBase);
        st_1 = ((CryptoPrice = (st_1.CryptoPrice * Math.exp(logIncrease)), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, CryptoPrice, st_1.ObserveRemainingTime)));
        const r10 = uniformRandomInteger(ctx.Rand, 0, 10);
        const rf = ctx.Rand();
        st_1 = ((CryptoPrice_1 = (st_1.CryptoPrice + (((st_1.CryptoPrice * (1 - (r10 % 3))) * rf) / 40000)), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, CryptoPrice_1, st_1.ObserveRemainingTime)));
        if (st_1.CryptoPrice > 1100) {
            const rc = ctx.Rand();
            st_1 = ((CryptoPrice_2 = (st_1.CryptoPrice * (0.7 + (0.1 * rc))), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, CryptoPrice_2, st_1.ObserveRemainingTime)));
        }
    }
    let yearsOffset_1 = yearsOffset;
    if (ctx.Year1000Active && ((st_1.Year + yearsOffset_1) > 500)) {
        yearsOffset_1 = max(500 - st_1.Year, 0);
    }
    const paragon = Math.floor((st_1.Year + yearsOffset_1) / 1000) - Math.floor(st_1.Year / 1000);
    if (paragon > 0) {
        ctx.OnParagon(paragon);
    }
    ctx.OnMillenniumKarma(paragon);
    const oldYear = st_1.Year;
    st_1 = (new CalendarState(st_1.Year + yearsOffset_1, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays, st_1.CryptoPrice, st_1.ObserveRemainingTime));
    ctx.OnYearsAdvanced(yearsOffset_1);
    const numTwoYears = Math.floor(st_1.Year / 2) - Math.floor(oldYear / 2);
    if (((((numTwoYears > 0) && ctx.Alicornmancy) && ctx.PacifismActive) && ctx.AnimalResearched) && (ctx.UnicornsValue() < 2)) {
        ctx.AddResEvent("unicorns", min(2 - ctx.UnicornsValue(), numTwoYears));
    }
    return [st_1, totalEvents];
}

