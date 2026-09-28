
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { unit_type, bool_type, lambda_type, option_type, int32_type, record_type, class_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { length, item, ofArray, singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { equals, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { uniformRandomInteger, jsRound } from "./Game.Math.fs.js";

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
    constructor(Year, Day, Season, Weather, Cycle, CycleYear, EventChance, FestivalDays) {
        super();
        this.Year = Year;
        this.Day = Day;
        this.Season = (Season | 0);
        this.Weather = Weather;
        this.Cycle = (Cycle | 0);
        this.CycleYear = (CycleYear | 0);
        this.EventChance = EventChance;
        this.FestivalDays = (FestivalDays | 0);
    }
}

export function CalendarState_$reflection() {
    return record_type("Game.Calendar.CalendarState", [], CalendarState, () => [["Year", float64_type], ["Day", float64_type], ["Season", int32_type], ["Weather", option_type(string_type)], ["Cycle", int32_type], ["CycleYear", int32_type], ["EventChance", float64_type], ["FestivalDays", int32_type]]);
}

export const init = new CalendarState(0, 0, 0, undefined, 0, 0, 0, 0);

/**
 * Everything the calendar slices read from managers not yet ported. Fresh-state
 * values below are verified against the orig harness.
 */
export class CalendarContext extends Record {
    constructor(GetEffect, TimeAccelerationRatio, DarkFuture, ChronomancyResearched, UnicornmancyResearched, Year1000ChallengeActive, WinterIsComingResearched, WinterIsComingActive, AdvancedAutomationResearched, CommunismResearched, WinterIsComingOn, Rand, OnParadox, OnNewDayRefresh) {
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
    }
}

export function CalendarContext_$reflection() {
    return record_type("Game.Calendar.CalendarContext", [], CalendarContext, () => [["GetEffect", lambda_type(string_type, float64_type)], ["TimeAccelerationRatio", float64_type], ["DarkFuture", bool_type], ["ChronomancyResearched", bool_type], ["UnicornmancyResearched", bool_type], ["Year1000ChallengeActive", bool_type], ["WinterIsComingResearched", bool_type], ["WinterIsComingActive", bool_type], ["AdvancedAutomationResearched", bool_type], ["CommunismResearched", bool_type], ["WinterIsComingOn", bool_type], ["Rand", lambda_type(unit_type, float64_type)], ["OnParadox", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())], ["OnNewDayRefresh", lambda_type(CalendarState_$reflection(), CalendarState_$reflection())]]);
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
    return new CalendarState(st.Year, jsRound(st.Day * 100) / 100, st.Season, st.Weather, st.Cycle, st.CycleYear, st.EventChance, st.FestivalDays);
}

/**
 * orig calendar.tick() — progression + new-day/season/year slices. The time
 * flux bookkeeping (time-01) is the one skipped side effect; it touches no
 * snapshotted state.
 */
export function tick(ctx, st) {
    let Day, Day_1, Season, Day_2, Cycle;
    let st_1 = st;
    const previousIntDay = Math.floor(st_1.Day);
    st_1 = ((Day = (st_1.Day + ((1 + ctx.TimeAccelerationRatio) / ticksPerDay)), new CalendarState(st_1.Year, Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays)));
    st_1 = roundToCentiday(st_1);
    if (Math.floor(st_1.Day) === previousIntDay) {
        return st_1;
    }
    else {
        let newSeason = false;
        let newYear = false;
        if (st_1.Day >= daysPerSeason) {
            st_1 = ((Day_1 = (st_1.Day - daysPerSeason), new CalendarState(st_1.Year, Day_1, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays)));
            st_1 = roundToCentiday(st_1);
            st_1 = ((Season = ((st_1.Season + 1) | 0), new CalendarState(st_1.Year, st_1.Day, Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays)));
            newSeason = true;
            const temporalParadoxChance = ctx.GetEffect("temporalParadoxChance");
            if (ctx.Rand() < temporalParadoxChance) {
                st_1 = ((Day_2 = (-10 - ctx.GetEffect("temporalParadoxDay")), new CalendarState(st_1.Year, Day_2, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays)));
            }
            if (st_1.Season >= length(seasons)) {
                st_1 = (new CalendarState(st_1.Year, st_1.Day, 0, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
                const yearInc = (ctx.Year1000ChallengeActive && (st_1.Year >= 500)) ? 0 : 1;
                st_1 = (new CalendarState(st_1.Year + yearInc, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
                newYear = true;
            }
        }
        if (st_1.Day < 0) {
            st_1 = ctx.OnParadox(st_1);
        }
        st_1 = ctx.OnNewDayRefresh(st_1);
        if (newSeason) {
            st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, st_1.CycleYear, 0, st_1.FestivalDays));
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
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, "warm", st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
                }
                else if (rand < (warmChance + coldChance)) {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, "cold", st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
                }
                else {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, undefined, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
                }
            }
            else {
                st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, undefined, st_1.Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays));
            }
            if (newYear) {
                if ((st_1.Year % 1000) === 0) {
                }
                if (((~~st_1.Year % 1000) + 1) === 1000) {
                }
                const cycleYear$0027 = (st_1.CycleYear + 1) | 0;
                if (cycleYear$0027 >= length(cycleYearColors)) {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, 0, st_1.EventChance, st_1.FestivalDays));
                    const cycle$0027 = (st_1.Cycle + 1) | 0;
                    st_1 = ((Cycle = (((cycle$0027 >= length(cycleNames)) ? 0 : cycle$0027) | 0), new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, Cycle, st_1.CycleYear, st_1.EventChance, st_1.FestivalDays)));
                }
                else {
                    st_1 = (new CalendarState(st_1.Year, st_1.Day, st_1.Season, st_1.Weather, st_1.Cycle, cycleYear$0027, st_1.EventChance, st_1.FestivalDays));
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

