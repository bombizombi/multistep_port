
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { class_type, string_type, record_type, int32_type, float64_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { statCurrentDefs as statCurrentDefs_1, statDefs as statDefs_1 } from "./Game.Catalog.World.fs.js";
import { map as map_1, add, change, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { filter, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { ofList as ofList_1 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Set.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";

export class StatsContext extends Record {
    constructor(TotalYears, TranscendenceTier, KittensResValue, CalendarYear, ChallengeCompletions) {
        super();
        this.TotalYears = TotalYears;
        this.TranscendenceTier = (TranscendenceTier | 0);
        this.KittensResValue = KittensResValue;
        this.CalendarYear = CalendarYear;
        this.ChallengeCompletions = (ChallengeCompletions | 0);
    }
}

export function StatsContext_$reflection() {
    return record_type("Game.Stats.StatsContext", [], StatsContext, () => [["TotalYears", float64_type], ["TranscendenceTier", int32_type], ["KittensResValue", float64_type], ["CalendarYear", float64_type], ["ChallengeCompletions", int32_type]]);
}

export class StatsPool extends Record {
    constructor(Values, Unlocked, Current) {
        super();
        this.Values = Values;
        this.Unlocked = Unlocked;
        this.Current = Current;
    }
}

export function StatsPool_$reflection() {
    return record_type("Game.Stats.StatsPool", [], StatsPool, () => [["Values", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["Unlocked", class_type("Microsoft.FSharp.Collections.FSharpSet`1", [string_type])], ["Current", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export const statDefs = statDefs_1;

export const statCurrentDefs = statCurrentDefs_1;

export function init() {
    return new StatsPool(ofList(map((s) => [s.Name, s.InitialVal], statDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), ofList_1(map((s_2) => s_2.Name, filter((s_1) => s_1.StartsUnlocked, statDefs)), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), ofList(map((s_3) => [s_3.Name, 0], statCurrentDefs), {
        Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
    }));
}

export function resetState(_sp) {
    return init();
}

/**
 * orig getStat: the mutable meta value (callers bump it in place).
 */
export function getStat(sp, name) {
    return defaultArg(tryFind(name, sp.Values), 0);
}

export function bumpStat(name, delta, sp) {
    return new StatsPool(change(name, (_arg) => {
        if (_arg == null) {
            return delta;
        }
        else {
            const v = _arg;
            return v + delta;
        }
    }, sp.Values), sp.Unlocked, sp.Current);
}

export function setStat(name, value, sp) {
    return new StatsPool(add(name, value, sp.Values), sp.Unlocked, sp.Current);
}

/**
 * orig getStatCurrent: calculate stats recompute from live state on read.
 */
export function getStatCurrent(sp, ctx, name) {
    switch (name) {
        case "averageKittens":
            if (ctx.TotalYears !== 0) {
                ctx.TotalYears / Math.ceil(ctx.TotalYears / 100);
                return getStat(sp, "totalKittens") / Math.ceil(ctx.TotalYears / 100);
            }
            else {
                return 0;
            }
        case "transcendenceTier":
            return ctx.TranscendenceTier;
        case "totalChallengesCompleted":
            return ctx.ChallengeCompletions;
        case "timePlayed": {
            ctx.CalendarYear;
            return defaultArg(tryFind(name, sp.Current), 0);
        }
        default:
            return defaultArg(tryFind(name, sp.Current), 0);
    }
}

export function bumpStatCurrent(name, delta, sp) {
    return new StatsPool(sp.Values, sp.Unlocked, change(name, (_arg) => {
        if (_arg == null) {
            return delta;
        }
        else {
            const v = _arg;
            return v + delta;
        }
    }, sp.Current));
}

export function resetStatsCurrent(sp) {
    return new StatsPool(sp.Values, sp.Unlocked, map_1((_arg, _arg_1) => 0, sp.Current));
}

/**
 * Plain current-stat read for the save builder (no context recalc).
 */
export function getStatCurrentSimple(sp, name) {
    return defaultArg(tryFind(name, sp.Current), 0);
}

