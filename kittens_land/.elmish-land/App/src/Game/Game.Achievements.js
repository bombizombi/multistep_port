
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { list_type, class_type, record_type, bool_type, int32_type, lambda_type, float64_type, string_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { add, FSharpMap__get_Item, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { exists, map } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { badgeDefs, achievementDefs } from "./Game.Catalog.World.js";
import { disposeSafe, getEnumerator, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";

export class AchContext extends Record {
    constructor(ResValue, KittensResMax, DeadKittens, Happiness, KittenCount, MaxKittens, Faith, FestivalDays, TrueYear, ObservatoryOn, ZigguratVal, LeviathanEnergy, TotalYears, TotalResets, JupiterAscending, ParagonValue, MoonMissionOn, IronWill, MineVal, WarehouseVal, PastureVal, MagnetoVal, FactoryVal, SteamworksVal) {
        super();
        this.ResValue = ResValue;
        this.KittensResMax = KittensResMax;
        this.DeadKittens = DeadKittens;
        this.Happiness = Happiness;
        this.KittenCount = (KittenCount | 0);
        this.MaxKittens = (MaxKittens | 0);
        this.Faith = Faith;
        this.FestivalDays = FestivalDays;
        this.TrueYear = TrueYear;
        this.ObservatoryOn = (ObservatoryOn | 0);
        this.ZigguratVal = (ZigguratVal | 0);
        this.LeviathanEnergy = LeviathanEnergy;
        this.TotalYears = TotalYears;
        this.TotalResets = TotalResets;
        this.JupiterAscending = JupiterAscending;
        this.ParagonValue = ParagonValue;
        this.MoonMissionOn = MoonMissionOn;
        this.IronWill = IronWill;
        this.MineVal = (MineVal | 0);
        this.WarehouseVal = (WarehouseVal | 0);
        this.PastureVal = (PastureVal | 0);
        this.MagnetoVal = (MagnetoVal | 0);
        this.FactoryVal = (FactoryVal | 0);
        this.SteamworksVal = (SteamworksVal | 0);
    }
}

export function AchContext_$reflection() {
    return record_type("Game.Achievements.AchContext", [], AchContext, () => [["ResValue", lambda_type(string_type, float64_type)], ["KittensResMax", float64_type], ["DeadKittens", float64_type], ["Happiness", float64_type], ["KittenCount", int32_type], ["MaxKittens", int32_type], ["Faith", float64_type], ["FestivalDays", float64_type], ["TrueYear", float64_type], ["ObservatoryOn", int32_type], ["ZigguratVal", int32_type], ["LeviathanEnergy", float64_type], ["TotalYears", float64_type], ["TotalResets", float64_type], ["JupiterAscending", bool_type], ["ParagonValue", float64_type], ["MoonMissionOn", bool_type], ["IronWill", bool_type], ["MineVal", int32_type], ["WarehouseVal", int32_type], ["PastureVal", int32_type], ["MagnetoVal", int32_type], ["FactoryVal", int32_type], ["SteamworksVal", int32_type]]);
}

export class AchMeta extends Record {
    constructor(Unlocked, StarUnlocked) {
        super();
        this.Unlocked = Unlocked;
        this.StarUnlocked = StarUnlocked;
    }
}

export function AchMeta_$reflection() {
    return record_type("Game.Achievements.AchMeta", [], AchMeta, () => [["Unlocked", bool_type], ["StarUnlocked", bool_type]]);
}

export class BadgeMeta extends Record {
    constructor(Unlocked) {
        super();
        this.Unlocked = Unlocked;
    }
}

export function BadgeMeta_$reflection() {
    return record_type("Game.Achievements.BadgeMeta", [], BadgeMeta, () => [["Unlocked", bool_type]]);
}

export class AchPool extends Record {
    constructor(Achievements, AchievementOrder, Badges, BadgeOrder, BadgesUnlocked) {
        super();
        this.Achievements = Achievements;
        this.AchievementOrder = AchievementOrder;
        this.Badges = Badges;
        this.BadgeOrder = BadgeOrder;
        this.BadgesUnlocked = BadgesUnlocked;
    }
}

export function AchPool_$reflection() {
    return record_type("Game.Achievements.AchPool", [], AchPool, () => [["Achievements", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, AchMeta_$reflection()])], ["AchievementOrder", list_type(string_type)], ["Badges", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, BadgeMeta_$reflection()])], ["BadgeOrder", list_type(string_type)], ["BadgesUnlocked", bool_type]]);
}

function mkAch() {
    return new AchMeta(false, false);
}

function mkBadge() {
    return new BadgeMeta(false);
}

export function init() {
    return new AchPool(ofList(map((a) => [a.Name, mkAch()], achievementDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), map((a_1) => a_1.Name, achievementDefs), ofList(map((b) => [b.Name, mkBadge()], badgeDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), map((b_1) => b_1.Name, badgeDefs), false);
}

export function resetState(_ap) {
    return init();
}

export function get$(ap, name) {
    return FSharpMap__get_Item(ap.Achievements, name);
}

export function getBadge(ap, name) {
    return FSharpMap__get_Item(ap.Badges, name);
}

export function unlockAchievement(name, ap) {
    const a = FSharpMap__get_Item(ap.Achievements, name);
    if (!a.Unlocked) {
        return new AchPool(add(name, new AchMeta(true, a.StarUnlocked), ap.Achievements), ap.AchievementOrder, ap.Badges, ap.BadgeOrder, ap.BadgesUnlocked);
    }
    else {
        return ap;
    }
}

export function unlockStarAchievement(name, ap) {
    const a = FSharpMap__get_Item(ap.Achievements, name);
    if (!a.StarUnlocked) {
        return new AchPool(add(name, new AchMeta(a.Unlocked, true), ap.Achievements), ap.AchievementOrder, ap.Badges, ap.BadgeOrder, ap.BadgesUnlocked);
    }
    else {
        return ap;
    }
}

export function unlockBadge(name, ap) {
    if (!FSharpMap__get_Item(ap.Badges, name).Unlocked) {
        return new AchPool(ap.Achievements, ap.AchievementOrder, add(name, new BadgeMeta(true), ap.Badges), ap.BadgeOrder, true);
    }
    else {
        return ap;
    }
}

function evalCondition(ctx, name) {
    const res = (r) => ctx.ResValue(r);
    switch (name) {
        case "theElderLegacy":
            return false;
        case "unicornConspiracy":
            return res("unicorns") > 0;
        case "uniception":
            return res("tears") > 0;
        case "sinsOfEmpire":
            return res("alicorn") > 0;
        case "anachronox":
            return res("timeCrystal") > 0;
        case "deadSpace":
            return res("necrocorn") > 0;
        case "sadnessAbyss":
            return res("sorrow") >= 100;
        case "ironWill":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.MineVal > 0;
            }
            else {
                return false;
            }
        case "uberkatzhen":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.WarehouseVal > 0;
            }
            else {
                return false;
            }
        case "hundredYearsSolitude":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.SteamworksVal > 0;
            }
            else {
                return false;
            }
        case "soilUptuned":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.PastureVal >= 45;
            }
            else {
                return false;
            }
        case "atlasUnmeowed":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.MagnetoVal > 0;
            }
            else {
                return false;
            }
        case "meowMeowRevolution":
            if (ctx.IronWill && (ctx.KittenCount === 0)) {
                return ctx.FactoryVal > 0;
            }
            else {
                return false;
            }
        case "spaceOddity":
            if (ctx.IronWill) {
                return ctx.MoonMissionOn;
            }
            else {
                return false;
            }
        case "veryLargeArray":
            return ctx.ObservatoryOn >= 100;
        case "shadowOfTheColossus":
            if (ctx.ZigguratVal > 0) {
                return ctx.MaxKittens === 1;
            }
            else {
                return false;
            }
        case "sunGod":
            return ctx.Faith >= 696342;
        case "heartOfDarkness":
            return res("zebras") > 1;
        case "winterIsComing":
            return ctx.DeadKittens >= 10;
        case "youMonster":
            return ctx.DeadKittens >= 100;
        case "superUnethicalClimax":
        case "systemShock":
            return false;
        case "lotusMachine":
            return res("karma") >= 1;
        case "serenity":
            if (ctx.KittenCount >= 50) {
                return ctx.DeadKittens === 0;
            }
            else {
                return false;
            }
        case "utopiaProject":
            if (ctx.Happiness >= 1.5) {
                return ctx.KittenCount > 35;
            }
            else {
                return false;
            }
        case "deathStranding":
            return false;
        case "cathammer":
            return ctx.TotalYears >= 40000;
        case "jupiterAscending":
            return ctx.JupiterAscending;
        case "eternalBacchanalia":
            return ctx.FestivalDays >= ((100 * 100) * 1);
        case "challenger":
            return false;
        case "betterSafeThanSorry":
            return false;
        default:
            return false;
    }
}

function evalBadgeCondition(ctx, name) {
    switch (name) {
        case "lotus":
            return ctx.TotalResets >= 50;
        case "useless":
            return undefined;
        case "beta":
            return false;
        case "silentHill":
            return false;
        case "deadSpace":
            return (ctx.ResValue("kittens") >= 1000) && (ctx.KittensResMax === 0);
        case "reginaNoctis":
            return (ctx.ResValue("kittens") >= 500) && (ctx.ResValue("alicorn") === 0);
        case "sequenceBreak":
            return false;
        case "fantasticFurColor":
            return false;
        case "lostDates":
            return false;
        case "buffet":
            return ctx.LeviathanEnergy >= 1000;
        case "newHome":
            return false;
        case "soLongAndThanksForAllTheHay":
            return Math.abs(ctx.ResValue("alicorn") - 42) < 1E-12;
        default:
            return undefined;
    }
}

/**
 * orig update() (L495-522): poll conditions; then the lostDates title gamble
 * consumes ONE game.rand(100) draw per poll (frequency 50 in the timer).
 */
export function update(ctx, rand, ap) {
    let ap_1 = ap;
    const enumerator = getEnumerator(achievementDefs);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let matchValue;
            const def = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const a = FSharpMap__get_Item(ap_1.Achievements, def.Name);
            if ((!a.Unlocked && def.HasCondition) && evalCondition(ctx, def.Name)) {
                ap_1 = unlockAchievement(def.Name, ap_1);
            }
            if (!a.StarUnlocked && def.HasStarCondition) {
                if ((matchValue = def.Name, (matchValue === "spaceOddity") ? ((ctx.IronWill && ctx.MoonMissionOn) && (ctx.ParagonValue < 10)) : ((matchValue === "jupiterAscending") ? ctx.JupiterAscending : ((matchValue === "cathammer") && (ctx.TrueYear >= 40000))))) {
                    ap_1 = unlockStarAchievement(def.Name, ap_1);
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const enumerator_1 = getEnumerator(badgeDefs);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const def_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const matchValue_1 = evalBadgeCondition(ctx, def_1.Name);
            if (matchValue_1 == null) {
            }
            else {
                const hit = matchValue_1;
                if (!FSharpMap__get_Item(ap_1.Badges, def_1.Name).Unlocked && hit) {
                    ap_1 = unlockBadge(def_1.Name, ap_1);
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    rand();
    return [ap_1, 0];
}

export function hasUnlocked(ap) {
    return exists((n) => FSharpMap__get_Item(ap.Achievements, n).Unlocked, ap.AchievementOrder);
}

