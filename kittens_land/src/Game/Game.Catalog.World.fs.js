
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, option_type, class_type, int32_type, list_type, float64_type, bool_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { UnlockList, Price, UnlockList_$reflection, Price_$reflection } from "./Game.Types.fs.js";
import { empty as empty_1, ofArray, singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { ofList, empty } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";

export class RaceDef extends Record {
    constructor(Name, StartsUnlocked, Standing, Hidden, EmbassyPrices, EmbassyLevel, RaceEffects, Buys, Sells, Unlocks) {
        super();
        this.Name = Name;
        this.StartsUnlocked = StartsUnlocked;
        this.Standing = Standing;
        this.Hidden = Hidden;
        this.EmbassyPrices = EmbassyPrices;
        this.EmbassyLevel = (EmbassyLevel | 0);
        this.RaceEffects = RaceEffects;
        this.Buys = Buys;
        this.Sells = Sells;
        this.Unlocks = Unlocks;
    }
}

export function RaceDef_$reflection() {
    return record_type("Game.Catalog.World.RaceDef", [], RaceDef, () => [["Name", string_type], ["StartsUnlocked", bool_type], ["Standing", float64_type], ["Hidden", bool_type], ["EmbassyPrices", list_type(Price_$reflection())], ["EmbassyLevel", int32_type], ["RaceEffects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["Buys", list_type(Price_$reflection())], ["Sells", list_type(SellDef_$reflection())], ["Unlocks", option_type(UnlockList_$reflection())]]);
}

export class SellDef extends Record {
    constructor(Name, Value, Chance, Width, MinLevel, Seasons) {
        super();
        this.Name = Name;
        this.Value = Value;
        this.Chance = Chance;
        this.Width = Width;
        this.MinLevel = MinLevel;
        this.Seasons = Seasons;
    }
}

export function SellDef_$reflection() {
    return record_type("Game.Catalog.World.SellDef", [], SellDef, () => [["Name", string_type], ["Value", float64_type], ["Chance", float64_type], ["Width", float64_type], ["MinLevel", option_type(int32_type)], ["Seasons", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class ZUDef extends Record {
    constructor(Name, Prices, Effects, PriceRatio, StartsUnlocked, Unlocks, Upgrades) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.PriceRatio = PriceRatio;
        this.StartsUnlocked = StartsUnlocked;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
    }
}

export function ZUDef_$reflection() {
    return record_type("Game.Catalog.World.ZUDef", [], ZUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatio", option_type(float64_type)], ["StartsUnlocked", bool_type], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())]]);
}

export class RUDef extends Record {
    constructor(Name, Prices, Effects, PriceRatio, FaithGate, NoStackable, Unlocks, Upgrades) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.PriceRatio = PriceRatio;
        this.FaithGate = FaithGate;
        this.NoStackable = NoStackable;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
    }
}

export function RUDef_$reflection() {
    return record_type("Game.Catalog.World.RUDef", [], RUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatio", option_type(float64_type)], ["FaithGate", option_type(float64_type)], ["NoStackable", bool_type], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())]]);
}

export class TUDef extends Record {
    constructor(Name, Prices, Effects, PriceRatio, Unlocks, Upgrades) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.PriceRatio = PriceRatio;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
    }
}

export function TUDef_$reflection() {
    return record_type("Game.Catalog.World.TUDef", [], TUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatio", option_type(float64_type)], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())]]);
}

export class PactDef extends Record {
    constructor(Name, Prices, Effects, Special, NotAddDeficit, LimitBuild) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.Special = Special;
        this.NotAddDeficit = NotAddDeficit;
        this.LimitBuild = LimitBuild;
    }
}

export function PactDef_$reflection() {
    return record_type("Game.Catalog.World.PactDef", [], PactDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["Special", bool_type], ["NotAddDeficit", bool_type], ["LimitBuild", option_type(float64_type)]]);
}

export class ProgramDef extends Record {
    constructor(Name, Prices) {
        super();
        this.Name = Name;
        this.Prices = Prices;
    }
}

export function ProgramDef_$reflection() {
    return record_type("Game.Catalog.World.ProgramDef", [], ProgramDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())]]);
}

export class PlanetDef extends Record {
    constructor(Name, Buildings) {
        super();
        this.Name = Name;
        this.Buildings = Buildings;
    }
}

export function PlanetDef_$reflection() {
    return record_type("Game.Catalog.World.PlanetDef", [], PlanetDef, () => [["Name", string_type], ["Buildings", list_type(string_type)]]);
}

export class SpaceBuildingDef extends Record {
    constructor(Name, Planet, Prices, Effects) {
        super();
        this.Name = Name;
        this.Planet = Planet;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function SpaceBuildingDef_$reflection() {
    return record_type("Game.Catalog.World.SpaceBuildingDef", [], SpaceBuildingDef, () => [["Name", string_type], ["Planet", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class PerkDef extends Record {
    constructor(Name, Prices, Effects, StartsUnlocked, Unlocks, Upgrades, HasHandler) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.StartsUnlocked = StartsUnlocked;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
        this.HasHandler = HasHandler;
    }
}

export function PerkDef_$reflection() {
    return record_type("Game.Catalog.World.PerkDef", [], PerkDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["StartsUnlocked", bool_type], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())], ["HasHandler", bool_type]]);
}

export class AchievementDef extends Record {
    constructor(Name, Hidden, HasCondition, HasStarCondition) {
        super();
        this.Name = Name;
        this.Hidden = Hidden;
        this.HasCondition = HasCondition;
        this.HasStarCondition = HasStarCondition;
    }
}

export function AchievementDef_$reflection() {
    return record_type("Game.Catalog.World.AchievementDef", [], AchievementDef, () => [["Name", string_type], ["Hidden", bool_type], ["HasCondition", bool_type], ["HasStarCondition", bool_type]]);
}

export class BadgeDef extends Record {
    constructor(Name, Difficulty, HasCondition) {
        super();
        this.Name = Name;
        this.Difficulty = Difficulty;
        this.HasCondition = HasCondition;
    }
}

export function BadgeDef_$reflection() {
    return record_type("Game.Catalog.World.BadgeDef", [], BadgeDef, () => [["Name", string_type], ["Difficulty", option_type(string_type)], ["HasCondition", bool_type]]);
}

export class StatDef extends Record {
    constructor(Name, InitialVal, StartsUnlocked, HasCalculate) {
        super();
        this.Name = Name;
        this.InitialVal = InitialVal;
        this.StartsUnlocked = StartsUnlocked;
        this.HasCalculate = HasCalculate;
    }
}

export function StatDef_$reflection() {
    return record_type("Game.Catalog.World.StatDef", [], StatDef, () => [["Name", string_type], ["InitialVal", float64_type], ["StartsUnlocked", bool_type], ["HasCalculate", bool_type]]);
}

export class StatCurrentDef extends Record {
    constructor(Name, HasCalculate) {
        super();
        this.Name = Name;
        this.HasCalculate = HasCalculate;
    }
}

export function StatCurrentDef_$reflection() {
    return record_type("Game.Catalog.World.StatCurrentDef", [], StatCurrentDef, () => [["Name", string_type], ["HasCalculate", bool_type]]);
}

export class CFUDef extends Record {
    constructor(Name, Prices, Effects, PriceRatio, LimitBuild, StartsUnlocked, HasAction, UnlocksUpgrades, UnlocksCFU, UpgradesCFU, AutomationInit) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.PriceRatio = PriceRatio;
        this.LimitBuild = LimitBuild;
        this.StartsUnlocked = StartsUnlocked;
        this.HasAction = HasAction;
        this.UnlocksUpgrades = UnlocksUpgrades;
        this.UnlocksCFU = UnlocksCFU;
        this.UpgradesCFU = UpgradesCFU;
        this.AutomationInit = AutomationInit;
    }
}

export function CFUDef_$reflection() {
    return record_type("Game.Catalog.World.CFUDef", [], CFUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatio", float64_type], ["LimitBuild", option_type(int32_type)], ["StartsUnlocked", bool_type], ["HasAction", bool_type], ["UnlocksUpgrades", list_type(string_type)], ["UnlocksCFU", list_type(string_type)], ["UpgradesCFU", list_type(string_type)], ["AutomationInit", option_type(bool_type)]]);
}

export class VSUDef extends Record {
    constructor(Name, Prices, Effects, PriceRatio, BreaksIronWill) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.PriceRatio = PriceRatio;
        this.BreaksIronWill = BreaksIronWill;
    }
}

export function VSUDef_$reflection() {
    return record_type("Game.Catalog.World.VSUDef", [], VSUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["PriceRatio", option_type(float64_type)], ["BreaksIronWill", option_type(bool_type)]]);
}

export class CycleDef extends Record {
    constructor(Name, Effects) {
        super();
        this.Name = Name;
        this.Effects = Effects;
    }
}

export function CycleDef_$reflection() {
    return record_type("Game.Catalog.World.CycleDef", [], CycleDef, () => [["Name", string_type], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

/**
 * village map biomes — RNG skeleton data only (village-14/15 slice): the
 * fauna roll consumes 1-3 draws per biome per tick and MUST mirror orig.
 */
export class BiomeDef extends Record {
    constructor(Name, FaunaNames, FaunaPenalty) {
        super();
        this.Name = Name;
        this.FaunaNames = FaunaNames;
        this.FaunaPenalty = FaunaPenalty;
    }
}

export function BiomeDef_$reflection() {
    return record_type("Game.Catalog.World.BiomeDef", [], BiomeDef, () => [["Name", string_type], ["FaunaNames", list_type(string_type)], ["FaunaPenalty", float64_type]]);
}

export class StackOptions extends Record {
    constructor(NoStack, LDRLimit, CapMagnitude) {
        super();
        this.NoStack = NoStack;
        this.LDRLimit = LDRLimit;
        this.CapMagnitude = CapMagnitude;
    }
}

export function StackOptions_$reflection() {
    return record_type("Game.Catalog.World.StackOptions", [], StackOptions, () => [["NoStack", bool_type], ["LDRLimit", option_type(float64_type)], ["CapMagnitude", option_type(float64_type)]]);
}

export class ChallengeDef extends Record {
    constructor(Name, StartsUnlocked, Effects, StackOptions, Unlocks) {
        super();
        this.Name = Name;
        this.StartsUnlocked = StartsUnlocked;
        this.Effects = Effects;
        this.StackOptions = StackOptions;
        this.Unlocks = Unlocks;
    }
}

export function ChallengeDef_$reflection() {
    return record_type("Game.Catalog.World.ChallengeDef", [], ChallengeDef, () => [["Name", string_type], ["StartsUnlocked", bool_type], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["StackOptions", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, StackOptions_$reflection()])], ["Unlocks", option_type(UnlockList_$reflection())]]);
}

export class VoidUpgradeDef extends Record {
    constructor(Name, Prices) {
        super();
        this.Name = Name;
        this.Prices = Prices;
    }
}

export function VoidUpgradeDef_$reflection() {
    return record_type("Game.Catalog.World.VoidUpgradeDef", [], VoidUpgradeDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())]]);
}

export const raceDefs = ofArray([new RaceDef("lizards", false, 0.25, false, singleton(new Price("culture", 100)), 0, empty({
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), singleton(new Price("minerals", 1000)), ofArray([new SellDef("wood", 500, 1, 0.08, undefined, ofList(ofArray([["spring", -0.05], ["summer", 0.35], ["autumn", 0.15], ["winter", 0.05]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new SellDef("beam", 10, 0.25, 0.15, 5, ofList(ofArray([["spring", -0.15], ["summer", 0.2], ["autumn", 0.2], ["winter", 0.1]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new SellDef("scaffold", 1, 0.1, 0.1, 10, ofList(ofArray([["spring", -0.1], ["summer", 0.05], ["autumn", 0.3], ["winter", 0.1]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new SellDef("manuscript", 4, -0.03, 0.42, 25, ofList(ofArray([["spring", 0.08], ["summer", 0.5], ["autumn", -0.04], ["winter", -0.12]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new SellDef("furs", 12, -0.06, 0.25, 40, ofList(ofArray([["spring", -0.05], ["summer", 0.2], ["autumn", 0.1], ["winter", -0.5]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}))]), undefined), new RaceDef("sharks", false, 0, false, singleton(new Price("culture", 100)), 0, empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), singleton(new Price("iron", 100)), ofArray([new SellDef("catnip", 35000, 1, 0.15, undefined, ofList(ofArray([["spring", 0.2], ["summer", -0.05], ["autumn", 0.15], ["winter", 0.45]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new SellDef("parchment", 5, 0.25, 0.25, 5, ofList(ofArray([["spring", 0.15], ["summer", -0.35], ["autumn", -0.05], ["winter", 0.4]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new SellDef("manuscript", 3, 0.15, 0.25, 10, ofList(ofArray([["spring", -0.15], ["summer", -0.35], ["autumn", 0.35], ["winter", 0.1]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new SellDef("compedium", 1, 0.1, 0.25, 15, ofList(ofArray([["spring", 0.4], ["summer", 0.2], ["autumn", -0.15], ["winter", -0.3]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
})), new SellDef("oil", 160, -0.01, 0.7, 25, ofList(ofArray([["spring", 0.2], ["summer", -0.1], ["autumn", -0.1], ["winter", 0.3]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
})), new SellDef("plastic", 0.5, -0.2, 0.7, 40, ofList(ofArray([["spring", 0.25], ["summer", 0.1], ["autumn", -0.2], ["winter", -0.1]]), {
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
}))]), undefined), new RaceDef("griffins", false, -0.15, false, singleton(new Price("culture", 1000)), 0, empty({
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
}), singleton(new Price("wood", 500)), ofArray([new SellDef("iron", 250, 1, 0.12, undefined, ofList(ofArray([["spring", -0.25], ["summer", -0.05], ["autumn", 0.35], ["winter", -0.2]]), {
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
})), new SellDef("steel", 25, 0.25, 0.1, 5, ofList(ofArray([["spring", -0.15], ["summer", 0.1], ["autumn", 0.15], ["winter", -0.4]]), {
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
})), new SellDef("gear", 5, 0.1, 0.25, 10, ofList(ofArray([["spring", 0], ["summer", 0.1], ["autumn", 0.25], ["winter", -0.35]]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
})), new SellDef("alloy", 2, -0.05, 0.18, 20, ofList(ofArray([["spring", -0.05], ["summer", 0.05], ["autumn", 0.2], ["winter", -0.2]]), {
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
})), new SellDef("microchip", 6, -0.125, 0.5, 30, ofList(ofArray([["spring", -0.25], ["summer", 0.05], ["autumn", 0.3], ["winter", -0.7]]), {
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
}))]), undefined), new RaceDef("nagas", false, 0, true, singleton(new Price("culture", 500)), 0, empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
}), singleton(new Price("ivory", 500)), ofArray([new SellDef("minerals", 1000, 1, 0.18, undefined, ofList(ofArray([["spring", 0.25], ["summer", 0.05], ["autumn", -0.35], ["winter", -0.05]]), {
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
})), new SellDef("slab", 5, 0.75, 0.15, 5, ofList(ofArray([["spring", 0.3], ["summer", 0.075], ["autumn", -0.4], ["winter", -0.075]]), {
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
})), new SellDef("concrate", 5, 0.25, 0.05, 10, ofList(ofArray([["spring", 0.4], ["summer", 0.1], ["autumn", -0.45], ["winter", -0.1]]), {
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
})), new SellDef("megalith", 1, 0.1, 0.1, 15, ofList(ofArray([["spring", 0.48], ["summer", 0.12], ["autumn", -0.48], ["winter", -0.12]]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
})), new SellDef("uranium", 0.2, -0.08, 0.1, 40, ofList(ofArray([["spring", 0.6], ["summer", 0.1], ["autumn", -0.4], ["winter", -0.3]]), {
    Compare: (x_24, y_24) => (comparePrimitives(x_24, y_24) | 0),
})), new SellDef("thorium", 0.05, -0.16, 0.04, 55, ofList(ofArray([["spring", 0.5], ["summer", 0.2], ["autumn", -0.7], ["winter", -0.3]]), {
    Compare: (x_25, y_25) => (comparePrimitives(x_25, y_25) | 0),
}))]), undefined), new RaceDef("zebras", false, -0.3, true, singleton(new Price("culture", 25000)), 0, empty({
    Compare: (x_26, y_26) => (comparePrimitives(x_26, y_26) | 0),
}), singleton(new Price("slab", 50)), ofArray([new SellDef("iron", 300, 1, 0.08, undefined, ofList(ofArray([["spring", 0], ["summer", 0.15], ["autumn", -0.1], ["winter", -0.2]]), {
    Compare: (x_27, y_27) => (comparePrimitives(x_27, y_27) | 0),
})), new SellDef("plate", 2, 0.65, 0.25, undefined, ofList(ofArray([["spring", 0.05], ["summer", -0.15], ["autumn", 0.05], ["winter", 0.25]]), {
    Compare: (x_28, y_28) => (comparePrimitives(x_28, y_28) | 0),
})), new SellDef("alloy", 0.25, 0.05, 0.05, 5, ofList(ofArray([["spring", -0.02], ["summer", 0], ["autumn", 0.03], ["winter", 0.08]]), {
    Compare: (x_29, y_29) => (comparePrimitives(x_29, y_29) | 0),
})), new SellDef("steel", 0.01, -0.05, 0.1, 15, ofList(ofArray([["spring", -0.15], ["summer", -0.15], ["autumn", 0], ["winter", 0.3]]), {
    Compare: (x_30, y_30) => (comparePrimitives(x_30, y_30) | 0),
})), new SellDef("starchart", 0.05, -0.15, 0.6, 30, ofList(ofArray([["spring", 0.2], ["summer", -0.5], ["autumn", 0.15], ["winter", -0.8]]), {
    Compare: (x_31, y_31) => (comparePrimitives(x_31, y_31) | 0),
})), new SellDef("coal", 0.004, -0.2, 0.25, 50, ofList(ofArray([["spring", 0.05], ["summer", 0.2], ["autumn", 0.05], ["winter", -0.15]]), {
    Compare: (x_32, y_32) => (comparePrimitives(x_32, y_32) | 0),
})), new SellDef("unobtainium", 1E-06, -0.245, 0.3, 80, ofList(ofArray([["spring", -0.1], ["summer", 0.6], ["autumn", 0.2], ["winter", -0.4]]), {
    Compare: (x_33, y_33) => (comparePrimitives(x_33, y_33) | 0),
}))]), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["zebraRelationsAppeasement", "zebraRelationsBellicosity"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RaceDef("spiders", false, 0.15, true, singleton(new Price("culture", 5000)), 0, empty({
    Compare: (x_34, y_34) => (comparePrimitives(x_34, y_34) | 0),
}), singleton(new Price("scaffold", 50)), ofArray([new SellDef("coal", 350, 1, 0.15, undefined, ofList(ofArray([["spring", 0], ["summer", 0.05], ["autumn", 0.15], ["winter", -0.05]]), {
    Compare: (x_35, y_35) => (comparePrimitives(x_35, y_35) | 0),
})), new SellDef("oil", 100, 0.25, 0.15, 5, ofList(ofArray([["spring", 0.11], ["summer", -0.01], ["autumn", 0.04], ["winter", -0.06]]), {
    Compare: (x_36, y_36) => (comparePrimitives(x_36, y_36) | 0),
})), new SellDef("plastic", 1, -0.2, 0.8, 15, ofList(ofArray([["spring", 1], ["summer", -0.3], ["autumn", -0.6], ["winter", 2]]), {
    Compare: (x_37, y_37) => (comparePrimitives(x_37, y_37) | 0),
}))]), undefined), new RaceDef("dragons", false, 0, true, singleton(new Price("culture", 7500)), 0, empty({
    Compare: (x_38, y_38) => (comparePrimitives(x_38, y_38) | 0),
}), singleton(new Price("titanium", 250)), ofArray([new SellDef("uranium", 1, 0.95, 0.25, undefined, empty({
    Compare: (x_39, y_39) => (comparePrimitives(x_39, y_39) | 0),
})), new SellDef("thorium", 1, 0.5, 0.25, 5, empty({
    Compare: (x_40, y_40) => (comparePrimitives(x_40, y_40) | 0),
})), new SellDef("temporalFlux", 0.2, -0.075, 0.18, 30, empty({
    Compare: (x_41, y_41) => (comparePrimitives(x_41, y_41) | 0),
})), new SellDef("antimatter", 0.1, -0.175, 0.18, 50, empty({
    Compare: (x_42, y_42) => (comparePrimitives(x_42, y_42) | 0),
}))]), undefined), new RaceDef("leviathans", false, 0, true, empty_1(), 0, empty({
    Compare: (x_43, y_43) => (comparePrimitives(x_43, y_43) | 0),
}), singleton(new Price("unobtainium", 5000)), ofArray([new SellDef("starchart", 250, 0.5, 0.8, undefined, empty({
    Compare: (x_44, y_44) => (comparePrimitives(x_44, y_44) | 0),
})), new SellDef("timeCrystal", 0.25, 0.98, 0.15, undefined, empty({
    Compare: (x_45, y_45) => (comparePrimitives(x_45, y_45) | 0),
})), new SellDef("sorrow", 1, 0.15, 0.1, undefined, empty({
    Compare: (x_46, y_46) => (comparePrimitives(x_46, y_46) | 0),
})), new SellDef("relic", 1, 0.05, 0, undefined, empty({
    Compare: (x_47, y_47) => (comparePrimitives(x_47, y_47) | 0),
})), new SellDef("temporalFlux", 3, -0.1, 0.2, undefined, empty({
    Compare: (x_48, y_48) => (comparePrimitives(x_48, y_48) | 0),
})), new SellDef("tears", 1500, -0.1, 0.8, undefined, empty({
    Compare: (x_49, y_49) => (comparePrimitives(x_49, y_49) | 0),
}))]), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["transkittenism", "necrocracy", "radicalXenophobia"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()))]);

export const zuDefs = ofArray([new ZUDef("unicornTomb", ofArray([new Price("ivory", 500), new Price("tears", 5)]), ofList(ofArray([["unicornsRatioReligion", 0.05], ["faithMax", 0], ["tearsMax", 0]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), 1.15, true, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("ivoryTower", ofArray([new Price("ivory", 25000), new Price("tears", 25)]), ofList(ofArray([["unicornsRatioReligion", 0.1], ["riftChance", 0.0005], ["tearsMax", 0]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("ivoryCitadel", ofArray([new Price("ivory", 50000), new Price("tears", 50)]), ofList(ofArray([["unicornsRatioReligion", 0.25], ["ivoryMeteorChance", 0.0005], ["unicornsMax", 0], ["tearsMax", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("skyPalace", ofArray([new Price("ivory", 125000), new Price("tears", 500), new Price("megalith", 5)]), ofList(ofArray([["goldMaxRatio", 0], ["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["ivoryMeteorRatio", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("unicornUtopia", ofArray([new Price("gold", 500), new Price("ivory", 1000000), new Price("tears", 5000)]), ofList(ofArray([["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["tcRefineRatio", 0], ["ivoryMeteorRatio", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("sunspire", ofArray([new Price("gold", 1250), new Price("ivory", 750000), new Price("tears", 25000)]), ofList(ofArray([["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["tcRefineRatio", 0], ["ivoryMeteorRatio", 0], ["unicornsMaxRatio", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), 1.15, false, undefined, undefined), new ZUDef("marker", ofArray([new Price("unobtainium", 2500), new Price("spice", 50000), new Price("tears", 5000), new Price("megalith", 750)]), ofList(singleton(["corruptionRatio", 1E-06]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["siphoning", "feedingFrenzy", "upfrontPayment"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined), new ZUDef("unicornGraveyard", ofArray([new Price("necrocorn", 5), new Price("megalith", 1000)]), ofList(ofArray([["cultureMaxRatioBonus", 0.01], ["blackLibraryBonus", 0.02]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), 1.15, false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), new UnlockList(singleton("ziggurat"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new ZUDef("unicornNecropolis", ofArray([new Price("alicorn", 100), new Price("necrocorn", 15), new Price("void", 5), new Price("megalith", 2500)]), ofList(singleton(["corruptionBoostRatio", 0.1]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), 1.15, false, undefined, undefined), new ZUDef("blackPyramid", ofArray([new Price("unobtainium", 5000), new Price("spice", 150000), new Price("sorrow", 5), new Price("megalith", 2500)]), ofList(ofArray([["pyramidGlobalResourceRatio", 0], ["pyramidGlobalProductionRatio", 0], ["pyramidFaithRatio", 0], ["deficitRecoveryRatio", 0], ["blackLibraryBonus", 0], ["pyramidSpaceCompendiumRatio", 0], ["craftRatio", 0], ["UniversalKnowHow", 0], ["pyramidPerYearRatio", 0], ["timeRatio", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), 1.15, false, undefined, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()))]);

export const ruDefs = ofArray([new RUDef("solarchant", singleton(new Price("faith", 100)), ofList(singleton(["faithRatioReligion", 0.1]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), 2.5, 150, true, undefined, undefined), new RUDef("scholasticism", singleton(new Price("faith", 250)), empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), 2.5, 300, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("goldenSpire", ofArray([new Price("gold", 150), new Price("faith", 350)]), empty({
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), 2.5, 500, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("sunAltar", ofArray([new Price("gold", 250), new Price("faith", 500)]), empty({
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), 2.5, 750, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("stainedGlass", ofArray([new Price("gold", 250), new Price("faith", 500)]), empty({
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), 2.5, 750, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("solarRevolution", ofArray([new Price("gold", 500), new Price("faith", 750)]), ofList(singleton(["solarRevolutionRatio", 0]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), undefined, 1000, true, undefined, undefined), new RUDef("basilica", ofArray([new Price("gold", 750), new Price("faith", 1250)]), empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), 2.5, 10000, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("templars", ofArray([new Price("gold", 3000), new Price("faith", 3500)]), empty({
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), 2.5, 75000, true, undefined, new UnlockList(ofArray(["temple", "ziggurat"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new RUDef("apocripha", ofArray([new Price("gold", 5000), new Price("faith", 5000)]), empty({
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), undefined, 100000, true, undefined, undefined), new RUDef("transcendence", ofArray([new Price("gold", 7500), new Price("faith", 7500)]), empty({
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), undefined, 125000, true, undefined, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["solarchant", "scholasticism", "goldenSpire", "sunAltar", "stainedGlass", "basilica", "templars", "frescoes"]), empty_1(), empty_1(), empty_1())), new RUDef("frescoes", ofArray([new Price("gold", 5000), new Price("faith", 4000), new Price("spice", 8000)]), empty({
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), 2.5, 200000, true, undefined, new UnlockList(singleton("chapel"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()))]);

export const tuDefs = ofArray([new TUDef("blackObelisk", singleton(new Price("relic", 100)), ofList(singleton(["solarRevolutionLimit", 0.05]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), 1.15, undefined, undefined), new TUDef("blackNexus", singleton(new Price("relic", 5000)), ofList(singleton(["relicRefineRatio", 1]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), 1.15, undefined, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new TUDef("blackCore", singleton(new Price("relic", 10000)), ofList(singleton(["blsLimit", 1]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), 1.15, undefined, undefined), new TUDef("singularity", singleton(new Price("relic", 25000)), ofList(singleton(["globalResourceRatio", 0.1]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), 1.15, undefined, undefined), new TUDef("blackLibrary", singleton(new Price("relic", 30000)), ofList(singleton(["compendiaTTBoostRatio", 0.02]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), 1.15, undefined, undefined), new TUDef("blackRadiance", singleton(new Price("relic", 37500)), ofList(singleton(["blsCorruptionRatio", 0.0012]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), 1.15, undefined, undefined), new TUDef("blazar", singleton(new Price("relic", 50000)), ofList(ofArray([["timeRatio", 0.1], ["rrRatio", 0.02]]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), 1.15, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new TUDef("darkNova", ofArray([new Price("relic", 75000), new Price("void", 7500)]), ofList(singleton(["energyProductionRatio", 0.02]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), 1.15, undefined, undefined), new TUDef("mausoleum", ofArray([new Price("relic", 50000), new Price("void", 12500), new Price("necrocorn", 10)]), ofList(singleton(["pactsAvailable", 1]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), 1.15, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["siphoning", "feedingFrenzy", "upfrontPayment"]), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), singleton("feedingFrenzy"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new TUDef("holyGenocide", ofArray([new Price("relic", 100000), new Price("void", 25000)]), ofList(ofArray([["maxKittensRatio", -0.01], ["simScalingRatio", 0.02], ["activeHG", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), 1.15, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), new UnlockList(empty_1(), empty_1(), singleton("ambassador"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new TUDef("darkParacosm", ofArray([new Price("relic", 230000), new Price("void", 29000), new Price("paragon", 8)]), ofList(singleton(["milleninumParagon", 1]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), 1.75, undefined, undefined)]);

export const pactDefs = ofArray([new PactDef("pactOfCleansing", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", 0.003], ["pactGlobalResourceRatio", 0.0005]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), false, false, undefined), new PactDef("pactOfDestruction", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", -0.0001], ["pactGlobalProductionRatio", 0.0005]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), false, false, undefined), new PactDef("pactOfExtermination", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactFaithRatio", 0.001]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), false, false, undefined), new PactDef("pactOfPurity", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", 0.005], ["pactBlackLibraryBoost", 0.0005], ["pactSpaceCompendiumRatio", 0.001]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), false, false, undefined), new PactDef("pactOfArcane", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactcraftRatio", 0.001], ["pactUniversalKnowHow", 0.1]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), false, false, undefined), new PactDef("pactOfChronicler", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactPerYearRatio", 0.003], ["umbraBoostRatio", 0.1], ["pacttimeRatio", 0.1]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), false, false, undefined), new PactDef("payDebt", singleton(new Price("necrocorn", 0)), ofList(singleton(["pactsAvailable", 0]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), true, true, 1), new PactDef("fractured", singleton(new Price("catnip", 1)), ofList(ofArray([["pyramidGlobalResourceRatio", -0.5], ["pyramidGlobalProductionRatio", -0.5], ["pyramidFaithRatio", -0.5], ["pactsAvailable", 0]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), true, false, 1)]);

export const programDefs = ofArray([new ProgramDef("orbitalLaunch", ofArray([new Price("oil", 15000), new Price("manpower", 5000), new Price("science", 100000), new Price("starchart", 250)])), new ProgramDef("moonMission", ofArray([new Price("titanium", 5000), new Price("oil", 45000), new Price("science", 125000), new Price("starchart", 500)])), new ProgramDef("duneMission", ofArray([new Price("titanium", 7000), new Price("science", 175000), new Price("starchart", 1000), new Price("kerosene", 75)])), new ProgramDef("piscineMission", ofArray([new Price("titanium", 9000), new Price("science", 200000), new Price("starchart", 1500), new Price("kerosene", 250)])), new ProgramDef("heliosMission", ofArray([new Price("titanium", 15000), new Price("science", 250000), new Price("starchart", 3000), new Price("kerosene", 1250)])), new ProgramDef("terminusMission", ofArray([new Price("titanium", 12000), new Price("science", 225000), new Price("starchart", 2500), new Price("kerosene", 750)])), new ProgramDef("kairoMission", ofArray([new Price("titanium", 20000), new Price("science", 300000), new Price("starchart", 5000), new Price("kerosene", 7500)])), new ProgramDef("rorschachMission", ofArray([new Price("titanium", 80000), new Price("science", 500000), new Price("starchart", 15000), new Price("kerosene", 25000)])), new ProgramDef("yarnMission", ofArray([new Price("titanium", 35000), new Price("science", 350000), new Price("starchart", 7500), new Price("kerosene", 12000)])), new ProgramDef("umbraMission", ofArray([new Price("science", 500000), new Price("starchart", 25000), new Price("kerosene", 25000), new Price("thorium", 15000)])), new ProgramDef("charonMission", ofArray([new Price("science", 750000), new Price("starchart", 75000), new Price("kerosene", 35000), new Price("thorium", 35000)])), new ProgramDef("centaurusSystemMission", ofArray([new Price("titanium", 40000), new Price("science", 800000), new Price("starchart", 100000), new Price("kerosene", 50000), new Price("thorium", 50000)])), new ProgramDef("furthestRingMission", ofArray([new Price("science", 1250000), new Price("starchart", 500000), new Price("kerosene", 75000), new Price("thorium", 75000)]))]);

export const planetDefs = ofArray([new PlanetDef("cath", ofArray(["spaceElevator", "sattelite", "spaceStation"])), new PlanetDef("moon", ofArray(["moonOutpost", "moonBase"])), new PlanetDef("dune", ofArray(["planetCracker", "hydrofracturer", "spiceRefinery"])), new PlanetDef("piscine", ofArray(["researchVessel", "orbitalArray"])), new PlanetDef("helios", ofArray(["sunlifter", "containmentChamber", "heatsink", "sunforge"])), new PlanetDef("terminus", singleton("cryostation")), new PlanetDef("kairo", singleton("spaceBeacon")), new PlanetDef("yarn", ofArray(["terraformingStation", "hydroponics"])), new PlanetDef("umbra", ofArray(["hrHarvester", "navigationRelay", "spaceShuttle"])), new PlanetDef("charon", singleton("entangler")), new PlanetDef("centaurusSystem", ofArray(["tectonic", "moltenCore"])), new PlanetDef("furthestRing", empty_1())]);

export const spaceBuildingDefs = ofArray([new SpaceBuildingDef("spaceElevator", "cath", ofArray([new Price("titanium", 6000), new Price("unobtainium", 50), new Price("science", 75000)]), ofList(ofArray([["oilReductionRatio", 0], ["spaceRatio", 0], ["prodTransferBonus", 0]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new SpaceBuildingDef("sattelite", "cath", ofArray([new Price("titanium", 2500), new Price("oil", 15000), new Price("science", 100000), new Price("starchart", 325)]), ofList(ofArray([["observatoryRatio", 0], ["starchartPerTickBaseSpace", 0], ["energyConsumption", 0], ["energyProduction", 0]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new SpaceBuildingDef("spaceStation", "cath", ofArray([new Price("oil", 35000), new Price("science", 150000), new Price("starchart", 425), new Price("alloy", 750)]), ofList(ofArray([["scienceRatio", 0], ["maxKittens", 0], ["energyConsumption", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new SpaceBuildingDef("moonOutpost", "moon", ofArray([new Price("oil", 55000), new Price("uranium", 500), new Price("science", 100000), new Price("starchart", 650), new Price("concrate", 150), new Price("alloy", 750)]), ofList(ofArray([["uraniumPerTickCon", 0], ["unobtainiumPerTickSpace", 0], ["energyConsumption", 0]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new SpaceBuildingDef("moonBase", "moon", ofArray([new Price("titanium", 9500), new Price("oil", 70000), new Price("unobtainium", 50), new Price("science", 100000), new Price("starchart", 700), new Price("concrate", 250)]), ofList(ofArray([["catnipMax", 0], ["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["unobtainiumMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new SpaceBuildingDef("planetCracker", "dune", ofArray([new Price("science", 125000), new Price("starchart", 2500), new Price("alloy", 1750), new Price("kerosene", 50)]), ofList(ofArray([["uraniumPerTickSpace", 0], ["uraniumMax", 0]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new SpaceBuildingDef("hydrofracturer", "dune", ofArray([new Price("science", 150000), new Price("starchart", 750), new Price("alloy", 1025), new Price("kerosene", 100)]), ofList(singleton(["oilPerTickAutoprodSpace", 0]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new SpaceBuildingDef("spiceRefinery", "dune", ofArray([new Price("science", 75000), new Price("starchart", 500), new Price("alloy", 500), new Price("kerosene", 125)]), ofList(singleton(["spicePerTickAutoprodSpace", 0]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new SpaceBuildingDef("researchVessel", "piscine", ofArray([new Price("titanium", 12500), new Price("starchart", 100), new Price("alloy", 2500), new Price("kerosene", 250)]), ofList(ofArray([["scienceMax", 0], ["starchartPerTickBaseSpace", 0]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new SpaceBuildingDef("orbitalArray", "piscine", ofArray([new Price("science", 250000), new Price("starchart", 2000), new Price("eludium", 100), new Price("kerosene", 500)]), ofList(ofArray([["spaceRatio", 0], ["energyConsumption", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new SpaceBuildingDef("sunlifter", "helios", ofArray([new Price("science", 500000), new Price("eludium", 225), new Price("kerosene", 2500)]), ofList(ofArray([["antimatterProduction", 0], ["energyProduction", 0]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
})), new SpaceBuildingDef("containmentChamber", "helios", ofArray([new Price("science", 500000), new Price("kerosene", 2500)]), ofList(ofArray([["antimatterMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
})), new SpaceBuildingDef("heatsink", "helios", ofArray([new Price("science", 125000), new Price("relic", 1), new Price("kerosene", 5000), new Price("thorium", 12500)]), empty({
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
})), new SpaceBuildingDef("sunforge", "helios", ofArray([new Price("antimatter", 250), new Price("science", 100000), new Price("relic", 1), new Price("kerosene", 1250)]), ofList(singleton(["baseMetalMaxRatio", 0.01]), {
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
})), new SpaceBuildingDef("cryostation", "terminus", ofArray([new Price("science", 200000), new Price("concrate", 1500), new Price("eludium", 25), new Price("kerosene", 500)]), ofList(ofArray([["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["uraniumMax", 0], ["unobtainiumMax", 0]]), {
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
})), new SpaceBuildingDef("spaceBeacon", "kairo", ofArray([new Price("antimatter", 50), new Price("starchart", 25000), new Price("alloy", 25000), new Price("kerosene", 7500)]), ofList(ofArray([["scienceMax", 25000], ["starchartPerTickBaseSpace", 0.025], ["relicPerDay", 0]]), {
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
})), new SpaceBuildingDef("terraformingStation", "yarn", ofArray([new Price("uranium", 5000), new Price("antimatter", 25), new Price("kerosene", 5000)]), ofList(singleton(["maxKittens", 1]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
})), new SpaceBuildingDef("hydroponics", "yarn", ofArray([new Price("unobtainium", 1), new Price("kerosene", 500)]), ofList(ofArray([["catnipRatio", 0.025], ["catnipMaxRatio", 0.1], ["terraformingMaxKittensRatio", 0]]), {
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
})), new SpaceBuildingDef("hrHarvester", "umbra", ofArray([new Price("antimatter", 1250), new Price("relic", 25)]), ofList(singleton(["energyProduction", 1]), {
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
})), new SpaceBuildingDef("navigationRelay", "umbra", ofArray([new Price("titanium", 50000), new Price("concrate", 5000)]), empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
})), new SpaceBuildingDef("spaceShuttle", "umbra", ofArray([new Price("antimatter", 50), new Price("eludium", 500)]), empty({
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
})), new SpaceBuildingDef("entangler", "charon", ofArray([new Price("antimatter", 5250), new Price("relic", 1250), new Price("eludium", 5000)]), ofList(ofArray([["gflopsConsumption", 0.1], ["hashrate", 0], ["hashRateLevel", 0], ["nextHashLevelAt", 0], ["hrProgress", 0], ["energyConsumption", 25]]), {
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
})), new SpaceBuildingDef("tectonic", "centaurusSystem", ofArray([new Price("antimatter", 500), new Price("thorium", 75000)]), ofList(singleton(["energyProduction", 0]), {
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
})), new SpaceBuildingDef("moltenCore", "centaurusSystem", ofArray([new Price("uranium", 5000000), new Price("science", 25000000)]), ofList(singleton(["tectonicBonus", 0.05]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
}))]);

export const perkDefs = ofArray([new PerkDef("engeneering", singleton(new Price("paragon", 5)), ofList(singleton(["priceRatio", -0.01]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), true, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["megalomania", "goldenRatio", "codexVox"]), empty_1()), undefined, false), new PerkDef("codexVox", singleton(new Price("paragon", 25)), ofList(ofArray([["manuscriptCraftRatio", 0.25], ["manuscriptGlobalCraftRatio", 0.05]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("codexLogos"), empty_1()), undefined, false), new PerkDef("codexLogos", singleton(new Price("paragon", 50)), ofList(ofArray([["manuscriptGlobalCraftRatio", 0.05], ["compediumCraftRatio", 0.25], ["compediumGlobalCraftRatio", 0.05]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["codexAgrum", "codexLeviathanianus"]), empty_1()), undefined, false), new PerkDef("codexAgrum", singleton(new Price("paragon", 75)), ofList(ofArray([["manuscriptGlobalCraftRatio", 0.05], ["compediumGlobalCraftRatio", 0.05], ["blueprintCraftRatio", 0.25], ["blueprintGlobalCraftRatio", 0.05]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), false, undefined, undefined, false), new PerkDef("megalomania", singleton(new Price("paragon", 10)), empty({
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("blackCodex"), empty_1()), undefined, false), new PerkDef("blackCodex", singleton(new Price("paragon", 25)), empty({
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined, false), new PerkDef("codexLeviathanianus", singleton(new Price("paragon", 75)), empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined, false), new PerkDef("goldenRatio", singleton(new Price("paragon", 50)), ofList(ofArray([["priceRatio", -0.016180339887498948], ["queueCap", 1]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("divineProportion"), empty_1()), undefined, false), new PerkDef("divineProportion", singleton(new Price("paragon", 100)), ofList(ofArray([["priceRatio", -0.017777777777777778], ["queueCap", 2]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("vitruvianFeline"), empty_1()), undefined, false), new PerkDef("vitruvianFeline", singleton(new Price("paragon", 250)), ofList(singleton(["priceRatio", -0.02]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("renaissance"), empty_1()), undefined, false), new PerkDef("renaissance", singleton(new Price("paragon", 750)), ofList(ofArray([["priceRatio", -0.0225], ["queueCap", 2]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), false, undefined, undefined, false), new PerkDef("diplomacy", singleton(new Price("paragon", 5)), ofList(singleton(["standingRatio", 0.1]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
}), true, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["zebraDiplomacy", "ambassadors"]), empty_1()), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), singleton("lizardRelationsEcologists"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), true), new PerkDef("zebraDiplomacy", singleton(new Price("paragon", 35)), empty({
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("zebraCovenant"), empty_1()), undefined, false), new PerkDef("zebraCovenant", singleton(new Price("paragon", 75)), empty({
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("navigationDiplomacy"), empty_1()), undefined, false), new PerkDef("navigationDiplomacy", singleton(new Price("paragon", 300)), empty({
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
}), false, undefined, undefined, false), new PerkDef("ambassadors", singleton(new Price("paragon", 100)), empty({
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
}), false, new UnlockList(empty_1(), empty_1(), singleton("ambassador"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("treaties"), empty_1()), undefined, false), new PerkDef("treaties", singleton(new Price("paragon", 500)), ofList(ofArray([["embassiesPerAmbassadorSlot", 30], ["ambassadorBoostPerRank", 0.1]]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
}), false, undefined, new UnlockList(empty_1(), empty_1(), singleton("ambassador"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), false), new PerkDef("chronomancy", singleton(new Price("paragon", 25)), empty({
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
}), true, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["astromancy", "anachronomancy", "unicornmancy"]), empty_1()), undefined, false), new PerkDef("astromancy", singleton(new Price("paragon", 50)), empty({
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), undefined, false), new PerkDef("unicornmancy", singleton(new Price("paragon", 125)), empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("alicornmancy"), empty_1()), undefined, false), new PerkDef("alicornmancy", singleton(new Price("paragon", 200)), empty({
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
}), false, undefined, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1()), false), new PerkDef("anachronomancy", singleton(new Price("paragon", 125)), empty({
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
}), false, undefined, undefined, false), new PerkDef("carnivals", singleton(new Price("paragon", 25)), empty({
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
}), true, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("numerology"), empty_1()), undefined, false), new PerkDef("willenfluff", singleton(new Price("paragon", 150)), ofList(singleton(["kittenGrowthRatio", 0.75]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("pawgan"), empty_1()), undefined, false), new PerkDef("pawgan", singleton(new Price("paragon", 400)), ofList(singleton(["kittenGrowthRatio", 1.5]), {
    Compare: (x_24, y_24) => (comparePrimitives(x_24, y_24) | 0),
}), false, undefined, undefined, false), new PerkDef("numerology", singleton(new Price("paragon", 50)), empty({
    Compare: (x_25, y_25) => (comparePrimitives(x_25, y_25) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), ofArray(["numeromancy", "willenfluff", "voidOrder"]), empty_1()), undefined, false), new PerkDef("numeromancy", singleton(new Price("paragon", 250)), empty({
    Compare: (x_26, y_26) => (comparePrimitives(x_26, y_26) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("malkuth"), empty_1()), undefined, false), new PerkDef("malkuth", singleton(new Price("paragon", 500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_27, y_27) => (comparePrimitives(x_27, y_27) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("yesod"), empty_1()), undefined, false), new PerkDef("yesod", singleton(new Price("paragon", 750)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_28, y_28) => (comparePrimitives(x_28, y_28) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("hod"), empty_1()), undefined, false), new PerkDef("hod", singleton(new Price("paragon", 1250)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_29, y_29) => (comparePrimitives(x_29, y_29) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("netzach"), empty_1()), undefined, false), new PerkDef("netzach", singleton(new Price("paragon", 1750)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_30, y_30) => (comparePrimitives(x_30, y_30) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("tiferet"), empty_1()), undefined, false), new PerkDef("tiferet", singleton(new Price("paragon", 2500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_31, y_31) => (comparePrimitives(x_31, y_31) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("gevurah"), empty_1()), undefined, false), new PerkDef("gevurah", singleton(new Price("paragon", 5000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_32, y_32) => (comparePrimitives(x_32, y_32) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("chesed"), empty_1()), undefined, false), new PerkDef("chesed", singleton(new Price("paragon", 7500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_33, y_33) => (comparePrimitives(x_33, y_33) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("binah"), empty_1()), undefined, false), new PerkDef("binah", singleton(new Price("paragon", 15000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_34, y_34) => (comparePrimitives(x_34, y_34) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("chokhmah"), empty_1()), undefined, false), new PerkDef("chokhmah", singleton(new Price("paragon", 30000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_35, y_35) => (comparePrimitives(x_35, y_35) | 0),
}), false, new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("keter"), empty_1()), undefined, false), new PerkDef("keter", singleton(new Price("paragon", 60000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_36, y_36) => (comparePrimitives(x_36, y_36) | 0),
}), false, undefined, undefined, false), new PerkDef("voidOrder", singleton(new Price("paragon", 75)), empty({
    Compare: (x_37, y_37) => (comparePrimitives(x_37, y_37) | 0),
}), false, undefined, undefined, false), new PerkDef("adjustmentBureau", singleton(new Price("paragon", 5)), empty({
    Compare: (x_38, y_38) => (comparePrimitives(x_38, y_38) | 0),
}), true, new UnlockList(empty_1(), singleton("challenges"), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), singleton("ascoh"), empty_1()), undefined, false), new PerkDef("ascoh", singleton(new Price("paragon", 5)), empty({
    Compare: (x_39, y_39) => (comparePrimitives(x_39, y_39) | 0),
}), false, undefined, undefined, false)]);

export const achievementDefs = ofArray([new AchievementDef("theElderLegacy", true, true, false), new AchievementDef("unicornConspiracy", false, true, false), new AchievementDef("uniception", false, true, false), new AchievementDef("sinsOfEmpire", false, true, false), new AchievementDef("anachronox", false, true, false), new AchievementDef("deadSpace", false, true, false), new AchievementDef("sadnessAbyss", false, true, false), new AchievementDef("ironWill", false, true, false), new AchievementDef("uberkatzhen", false, true, false), new AchievementDef("hundredYearsSolitude", false, true, false), new AchievementDef("soilUptuned", false, true, false), new AchievementDef("atlasUnmeowed", false, true, false), new AchievementDef("meowMeowRevolution", false, true, false), new AchievementDef("spaceOddity", false, true, true), new AchievementDef("jupiterAscending", false, true, true), new AchievementDef("veryLargeArray", false, true, false), new AchievementDef("shadowOfTheColossus", false, true, false), new AchievementDef("sunGod", false, true, false), new AchievementDef("heartOfDarkness", false, true, false), new AchievementDef("winterIsComing", false, true, false), new AchievementDef("youMonster", false, true, true), new AchievementDef("superUnethicalClimax", false, true, false), new AchievementDef("systemShock", false, true, false), new AchievementDef("lotusMachine", false, true, false), new AchievementDef("serenity", false, true, true), new AchievementDef("utopiaProject", false, true, true), new AchievementDef("deathStranding", false, true, false), new AchievementDef("cathammer", false, true, true), new AchievementDef("eternalBacchanalia", false, true, false), new AchievementDef("challenger", false, true, true), new AchievementDef("betterSafeThanSorry", false, true, true)]);

export const badgeDefs = ofArray([new BadgeDef("lotus", "A", true), new BadgeDef("ivoryTower", "S+", false), new BadgeDef("useless", "F", true), new BadgeDef("beta", "B", true), new BadgeDef("silentHill", "S", true), new BadgeDef("evergreen", "F", false), new BadgeDef("deadSpace", "S", true), new BadgeDef("reginaNoctis", "S", true), new BadgeDef("ghostInTheMachine", "S", false), new BadgeDef("abOwo", "A", false), new BadgeDef("cleanPaws", "C", false), new BadgeDef("sequenceBreak", "D", true), new BadgeDef("fantasticFurColor", "F", true), new BadgeDef("whatYearIsIt", "C", false), new BadgeDef("tardis", "C", false), new BadgeDef("wheredThisComeFrom", "S", false), new BadgeDef("lostDates", "B", true), new BadgeDef("buffet", "A", true), new BadgeDef("newHome", "D", true), new BadgeDef("betterSafeThanSorry", "E", false), new BadgeDef("soLongAndThanksForAllTheHay", "S", true)]);

export const statDefs = ofArray([new StatDef("totalKittens", 0, true, false), new StatDef("kittensDead", 0, true, false), new StatDef("totalYears", 0, true, false), new StatDef("totalResets", 0, true, false), new StatDef("totalParagon", 0, false, false), new StatDef("eventsObserved", 0, false, false), new StatDef("unicornsSacrificed", 0, false, false), new StatDef("buildingsConstructed", 0, false, false), new StatDef("totalClicks", 0, false, false), new StatDef("totalTrades", 0, false, false), new StatDef("totalCrafts", 0, false, false), new StatDef("averageKittens", 0, false, true), new StatDef("transcendenceTier", 0, false, true), new StatDef("totalChallengesCompleted", 0, false, true)]);

export const statCurrentDefs = ofArray([new StatCurrentDef("totalTrades", false), new StatCurrentDef("totalCrafts", false), new StatCurrentDef("averageKittens", true), new StatCurrentDef("timePlayed", true)]);

export const cfuDefs = ofArray([new CFUDef("temporalBattery", singleton(new Price("timeCrystal", 5)), ofList(singleton(["temporalFluxMax", 750]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), 1.25, undefined, true, false, empty_1(), empty_1(), empty_1(), undefined), new CFUDef("blastFurnace", ofArray([new Price("timeCrystal", 25), new Price("relic", 5)]), ofList(ofArray([["heatPerTick", 0.02], ["heatMax", 100]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), 1.25, undefined, true, true, singleton("tachyonModerator"), singleton("timeBoiler"), empty_1(), false), new CFUDef("timeBoiler", singleton(new Price("timeCrystal", 25000)), ofList(ofArray([["heatMaxExpansion", 10], ["energyConsumption", 1]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), 1.25, undefined, false, true, empty_1(), empty_1(), singleton("blastFurnace"), undefined), new CFUDef("controlledDelay", ofArray([new Price("timeCrystal", 1), new Price("gear", 10)]), ofList(singleton(["energyConsumption", 0.75]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), 1, 25, false, false, empty_1(), empty_1(), empty_1(), false), new CFUDef("temporalAccelerator", ofArray([new Price("timeCrystal", 10), new Price("relic", 1000)]), ofList(singleton(["timeRatio", 0.05]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), 1.25, undefined, true, false, empty_1(), empty_1(), singleton("temporalImpedance"), false), new CFUDef("temporalImpedance", ofArray([new Price("timeCrystal", 100), new Price("relic", 250)]), ofList(singleton(["timeImpedance", 1000]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), 1.05, undefined, false, false, empty_1(), empty_1(), empty_1(), undefined), new CFUDef("ressourceRetrieval", singleton(new Price("timeCrystal", 1000)), ofList(singleton(["shatterTCGain", 0.01]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), 1.3, 100, false, false, empty_1(), empty_1(), empty_1(), undefined), new CFUDef("temporalPress", ofArray([new Price("timeCrystal", 100), new Price("void", 10)]), ofList(ofArray([["shatterYearBoost", 0], ["energyConsumption", 5]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), 1.1, undefined, false, false, empty_1(), empty_1(), empty_1(), false)]);

export const vsuDefs = ofArray([new VSUDef("cryochambers", ofArray([new Price("karma", 1), new Price("timeCrystal", 2), new Price("void", 100)]), ofList(singleton(["maxKittens", 1]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), 1.25, true), new VSUDef("usedCryochambers", empty_1(), empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), 1.25, undefined), new VSUDef("voidHoover", ofArray([new Price("antimatter", 1000), new Price("timeCrystal", 10), new Price("void", 250)]), ofList(singleton(["temporalParadoxVoid", 1]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), 1.25, undefined), new VSUDef("voidRift", singleton(new Price("void", 75)), ofList(ofArray([["umbraBoostRatio", 0.1], ["globalResourceRatio", 0.02]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), 1.3, undefined), new VSUDef("chronocontrol", ofArray([new Price("temporalFlux", 3000), new Price("timeCrystal", 30), new Price("void", 500)]), ofList(ofArray([["temporalParadoxDay", 0], ["energyConsumption", 15]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), 1.25, undefined), new VSUDef("voidResonator", ofArray([new Price("timeCrystal", 1000), new Price("relic", 10000), new Price("void", 50)]), ofList(singleton(["voidResonance", 0.1]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), 1.25, undefined)]);

export const cycleDefs = ofArray([new CycleDef("charon", ofList(ofArray([["moonOutpost-unobtainiumPerTickSpace", 0.9], ["entangler-gflopsConsumption", 2]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new CycleDef("umbra", ofList(ofArray([["hydrofracturer-oilPerTickAutoprodSpace", 0.75], ["planetCracker-uraniumPerTickSpace", 0.9], ["hrHarvester-energyProduction", 1.5]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new CycleDef("yarn", ofList(ofArray([["hydroponics-catnipRatio", 2], ["researchVessel-starchartPerTickBaseSpace", 0.5]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new CycleDef("helios", ofList(ofArray([["cryostation-woodMax", 0.9], ["cryostation-mineralsMax", 0.9], ["cryostation-coalMax", 0.9], ["cryostation-ironMax", 0.9], ["cryostation-titaniumMax", 0.9], ["cryostation-oilMax", 0.9], ["cryostation-uraniumMax", 0.9], ["cryostation-unobtainiumMax", 0.9], ["sunlifter-energyProduction", 1.5]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new CycleDef("cath", ofList(ofArray([["spaceStation-scienceRatio", 1.5], ["sattelite-observatoryRatio", 2], ["sattelite-starchartPerTickBaseSpace", 2], ["spaceBeacon-starchartPerTickBaseSpace", 0.1], ["spaceElevator-prodTransferBonus", 2]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new CycleDef("redmoon", ofList(ofArray([["moonOutpost-unobtainiumPerTickSpace", 1.2], ["entangler-gflopsConsumption", 0.5]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new CycleDef("dune", ofList(ofArray([["hydrofracturer-oilPerTickAutoprodSpace", 1.5], ["planetCracker-uraniumPerTickSpace", 1.1], ["hrHarvester-energyProduction", 0.75]]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new CycleDef("piscine", ofList(ofArray([["hydroponics-catnipRatio", 0.5], ["researchVessel-starchartPerTickBaseSpace", 1.5]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new CycleDef("terminus", ofList(ofArray([["cryostation-woodMax", 1.2], ["cryostation-mineralsMax", 1.2], ["cryostation-coalMax", 1.2], ["cryostation-ironMax", 1.2], ["cryostation-titaniumMax", 1.2], ["cryostation-oilMax", 1.2], ["cryostation-uraniumMax", 1.2], ["cryostation-unobtainiumMax", 1.2], ["sunlifter-energyProduction", 0.5]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new CycleDef("kairo", ofList(ofArray([["spaceStation-scienceRatio", 0.75], ["sattelite-observatoryRatio", 0.75], ["sattelite-starchartPerTickBaseSpace", 0.75], ["spaceBeacon-starchartPerTickBaseSpace", 5], ["spaceElevator-prodTransferBonus", 0.5]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}))]);

export const biomeDefs = ofArray([new BiomeDef("village", empty_1(), 0), new BiomeDef("plains", ofArray(["grass snake", "raptor", "vole"]), 1), new BiomeDef("hills", ofArray(["rock lizard", "centipede", "stone toad", "cave bat"]), 1), new BiomeDef("forest", empty_1(), 1.5), new BiomeDef("boneForest", singleton("bone spider"), 1), new BiomeDef("rainForest", ofArray(["poison frog", "razor leech", "jaguar", "giant centipede"]), 1), new BiomeDef("mountain", ofArray(["mountain goat", "rock worm", "yeti cub"]), 1), new BiomeDef("volcano", ofArray(["magma slug", "lava beetle"]), 1), new BiomeDef("desert", ofArray(["sand viper", "scorpion", "dune beetle", "sand raptor"]), 1), new BiomeDef("bloodDesert", ofArray(["blood scarab", "crimson basilisk"]), 1), new BiomeDef("swamp", ofArray(["bog toad", "swamp serpent", "poison spore"]), 1), new BiomeDef("cath", empty_1(), 1), new BiomeDef("redmoon", empty_1(), 1)]);

export const challengeDefs = ofArray([new ChallengeDef("ironWill", true, empty({
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), undefined), new ChallengeDef("winterIsComing", true, ofList(ofArray([["springCatnipRatio", 0.05], ["summerSolarFarmRatio", 0.05], ["coldChance", 0], ["coldHarshness", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), ofList(ofArray([["springCatnipRatio", new StackOptions(false, 2, undefined)], ["summerSolarFarmRatio", new StackOptions(false, 2, undefined)], ["coldChance", new StackOptions(false, 0.825, undefined)], ["coldHarshness", new StackOptions(false, 1, undefined)]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), undefined), new ChallengeDef("anarchy", true, ofList(ofArray([["masterSkillMultiplier", 0.2], ["kittenLaziness", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), ofList(ofArray([["masterSkillMultiplier", new StackOptions(false, 4, undefined)], ["kittenLaziness", new StackOptions(true, 0.25, undefined)]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), undefined), new ChallengeDef("energy", false, ofList(ofArray([["energyConsumptionRatio", -0.02], ["energyConsumptionIncrease", 0]]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), ofList(singleton(["energyConsumptionRatio", new StackOptions(false, 1, undefined)]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), undefined), new ChallengeDef("atheism", false, ofList(ofArray([["faithSolarRevolutionBoost", 0.1], ["cultureMaxChallenge", 0], ["scienceMaxChallenge", 0], ["manpowerMaxChallenge", 0], ["challengeHappiness", 0]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), ofList(singleton(["faithSolarRevolutionBoost", new StackOptions(false, 4, undefined)]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), undefined), new ChallengeDef("1000Years", false, ofList(ofArray([["shatterCostReduction", -0.02], ["shatterCostIncreaseChallenge", 0], ["shatterVoidCost", 0], ["temporalPressCap", 0], ["heatEfficiency", 0.1], ["heatCompression", 0.05]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), ofList(ofArray([["shatterCostReduction", new StackOptions(false, 1, undefined)], ["heatEfficiency", new StackOptions(false, undefined, 3)]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
}), new UnlockList(empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1(), empty_1())), new ChallengeDef("blackSky", false, ofList(ofArray([["corruptionBoostRatioChallenge", 0.1], ["bskSattelitePenalty", 0]]), {
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
}), ofList(ofArray([["corruptionBoostRatioChallenge", new StackOptions(false, 2, undefined)], ["bskSattelitePenalty", new StackOptions(false, 30, undefined)]]), {
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
}), undefined), new ChallengeDef("pacifism", false, ofList(ofArray([["alicornPerTickRatio", 0.1], ["tradeKnowledge", 1], ["weaponEfficency", 0], ["policyFakeBought", 0], ["embassyFakeBought", 0], ["steamworksFakeBought", 0], ["tradeKnowledgeRatio", 0]]), {
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
}), ofList(ofArray([["tradeKnowledgeRatio", new StackOptions(true, undefined, undefined)], ["weaponEfficency", new StackOptions(false, undefined, 1)]]), {
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
}), undefined), new ChallengeDef("unicornTears", false, ofList(ofArray([["bonfireTearsPriceRatioChallenge", 0], ["scienceTearsPricesChallenge", 0], ["workshopTearsPricesChallenge", 0], ["cathPollutionPerTearOvercapped", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0], ["zigguratIvoryPriceRatio", -0.003]]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
}), ofList(ofArray([["bonfireTearsPriceRatioChallenge", new StackOptions(true, 2.5, undefined)], ["scienceTearsPricesChallenge", new StackOptions(false, 75, undefined)], ["workshopTearsPricesChallenge", new StackOptions(false, 1, undefined)], ["cathPollutionPerTearOvercapped", new StackOptions(true, undefined, undefined)], ["unicornsMax", new StackOptions(true, undefined, undefined)], ["tearsMax", new StackOptions(true, undefined, undefined)], ["alicornMax", new StackOptions(true, undefined, undefined)], ["zigguratIvoryPriceRatio", new StackOptions(false, 0.075, undefined)]]), {
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
}), undefined), new ChallengeDef("postApocalypse", false, ofList(ofArray([["arrivalSlowdown", 0], ["cryochamberSupport", 1]]), {
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
}), empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
}), undefined)]);

export const voidUpgradeDefs = singleton(new VoidUpgradeDef("spaceCathedral", singleton(new Price("relic", 1))));

