
import { Record, Union } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { tuple_type, int32_type, class_type, list_type, float64_type, record_type, option_type, bool_type, string_type, union_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";

export class RefundableRule extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Default", "EnergyBalanced"];
    }
    static Default = new RefundableRule(0, []);
    static EnergyBalanced = new RefundableRule(1, []);
}

export function RefundableRule_$reflection() {
    return union_type("Game.Types.RefundableRule", [], RefundableRule, () => [[], []]);
}

export class ResourceDef extends Record {
    constructor(Name, Category, Visible, Color, Craftable, CalculatePerTick, Persists, AiCanDestroy, Transient, Tag, IsNotRefundable, CalculatePerDay, CalculatePerTickAndDay, CalculateOnYear, RefundableRule) {
        super();
        this.Name = Name;
        this.Category = Category;
        this.Visible = Visible;
        this.Color = Color;
        this.Craftable = Craftable;
        this.CalculatePerTick = CalculatePerTick;
        this.Persists = Persists;
        this.AiCanDestroy = AiCanDestroy;
        this.Transient = Transient;
        this.Tag = Tag;
        this.IsNotRefundable = IsNotRefundable;
        this.CalculatePerDay = CalculatePerDay;
        this.CalculatePerTickAndDay = CalculatePerTickAndDay;
        this.CalculateOnYear = CalculateOnYear;
        this.RefundableRule = RefundableRule;
    }
}

export function ResourceDef_$reflection() {
    return record_type("Game.Types.ResourceDef", [], ResourceDef, () => [["Name", string_type], ["Category", string_type], ["Visible", bool_type], ["Color", option_type(string_type)], ["Craftable", bool_type], ["CalculatePerTick", bool_type], ["Persists", option_type(bool_type)], ["AiCanDestroy", bool_type], ["Transient", bool_type], ["Tag", option_type(string_type)], ["IsNotRefundable", bool_type], ["CalculatePerDay", bool_type], ["CalculatePerTickAndDay", bool_type], ["CalculateOnYear", bool_type], ["RefundableRule", RefundableRule_$reflection()]]);
}

/**
 * Live state of one resource (orig mutates the def object in place; the port
 * threads immutable state — conversion pattern #2).
 */
export class ResourceState extends Record {
    constructor(Def, Value, Unlocked, MaxValue, PerTickCached) {
        super();
        this.Def = Def;
        this.Value = Value;
        this.Unlocked = Unlocked;
        this.MaxValue = MaxValue;
        this.PerTickCached = PerTickCached;
    }
}

export function ResourceState_$reflection() {
    return record_type("Game.Types.ResourceState", [], ResourceState, () => [["Def", ResourceDef_$reflection()], ["Value", float64_type], ["Unlocked", bool_type], ["MaxValue", float64_type], ["PerTickCached", float64_type]]);
}

/**
 * The resPool registry. Order mirrors orig's resPool.resources array.
 * KarmaKittens is game.karmaKittens in orig — parked here until game-06 owns
 * GamePage state (see Game.Resources.addRes karma branch). Energy fields are
 * resPool.energyProd/energyWinterProd/energyCons (resources-07).
 */
export class ResPool extends Record {
    constructor(Order, ByName, KarmaKittens, EnergyProd, EnergyWinterProd, EnergyCons) {
        super();
        this.Order = Order;
        this.ByName = ByName;
        this.KarmaKittens = (KarmaKittens | 0);
        this.EnergyProd = EnergyProd;
        this.EnergyWinterProd = EnergyWinterProd;
        this.EnergyCons = EnergyCons;
    }
}

export function ResPool_$reflection() {
    return record_type("Game.Types.ResPool", [], ResPool, () => [["Order", list_type(string_type)], ["ByName", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ResourceState_$reflection()])], ["KarmaKittens", int32_type], ["EnergyProd", float64_type], ["EnergyWinterProd", float64_type], ["EnergyCons", float64_type]]);
}

export class Price extends Record {
    constructor(Resource, Val) {
        super();
        this.Resource = Resource;
        this.Val = Val;
    }
}

export function Price_$reflection() {
    return record_type("Game.Types.Price", [], Price, () => [["Resource", string_type], ["Val", float64_type]]);
}

export class UnlockList extends Record {
    constructor(Buildings, Tabs, Jobs, Tech, Policies, Upgrades, ZebraUpgrades, Religion, Crafts, Perks, Stages) {
        super();
        this.Buildings = Buildings;
        this.Tabs = Tabs;
        this.Jobs = Jobs;
        this.Tech = Tech;
        this.Policies = Policies;
        this.Upgrades = Upgrades;
        this.ZebraUpgrades = ZebraUpgrades;
        this.Religion = Religion;
        this.Crafts = Crafts;
        this.Perks = Perks;
        this.Stages = Stages;
    }
}

export function UnlockList_$reflection() {
    return record_type("Game.Types.UnlockList", [], UnlockList, () => [["Buildings", list_type(string_type)], ["Tabs", list_type(string_type)], ["Jobs", list_type(string_type)], ["Tech", list_type(string_type)], ["Policies", list_type(string_type)], ["Upgrades", list_type(string_type)], ["ZebraUpgrades", list_type(string_type)], ["Religion", list_type(string_type)], ["Crafts", list_type(string_type)], ["Perks", list_type(string_type)], ["Stages", list_type(string_type)]]);
}

export class StageDef extends Record {
    constructor(StageKey, Prices, UnlockRatio, Effects) {
        super();
        this.StageKey = StageKey;
        this.Prices = Prices;
        this.UnlockRatio = UnlockRatio;
        this.Effects = Effects;
    }
}

export function StageDef_$reflection() {
    return record_type("Game.Types.StageDef", [], StageDef, () => [["StageKey", option_type(string_type)], ["Prices", list_type(Price_$reflection())], ["UnlockRatio", option_type(float64_type)], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class BuildingDef extends Record {
    constructor(Name, Tab, Stage, UnlockRatio, DefaultUnlockable, Prices, PriceRatio, LimitBuild, TogglableOnOff, NoStackable, BreaksIronWill, Effects, StartsUnlocked, StartsUnlockable, Stages, Unlocks, Upgrades, UnlockScheme) {
        super();
        this.Name = Name;
        this.Tab = Tab;
        this.Stage = (Stage | 0);
        this.UnlockRatio = UnlockRatio;
        this.DefaultUnlockable = DefaultUnlockable;
        this.Prices = Prices;
        this.PriceRatio = PriceRatio;
        this.LimitBuild = LimitBuild;
        this.TogglableOnOff = TogglableOnOff;
        this.NoStackable = NoStackable;
        this.BreaksIronWill = BreaksIronWill;
        this.Effects = Effects;
        this.StartsUnlocked = StartsUnlocked;
        this.StartsUnlockable = StartsUnlockable;
        this.Stages = Stages;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
        this.UnlockScheme = UnlockScheme;
    }
}

export function BuildingDef_$reflection() {
    return record_type("Game.Types.BuildingDef", [], BuildingDef, () => [["Name", string_type], ["Tab", option_type(string_type)], ["Stage", int32_type], ["UnlockRatio", option_type(float64_type)], ["DefaultUnlockable", bool_type], ["Prices", list_type(Price_$reflection())], ["PriceRatio", option_type(float64_type)], ["LimitBuild", option_type(float64_type)], ["TogglableOnOff", bool_type], ["NoStackable", bool_type], ["BreaksIronWill", bool_type], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["StartsUnlocked", bool_type], ["StartsUnlockable", bool_type], ["Stages", list_type(StageDef_$reflection())], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())], ["UnlockScheme", option_type(tuple_type(string_type, float64_type))]]);
}

export class TechDef extends Record {
    constructor(Name, Prices, Unlocks, Upgrades) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
    }
}

export function TechDef_$reflection() {
    return record_type("Game.Types.TechDef", [], TechDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())]]);
}

export class PolicyDef extends Record {
    constructor(Name, Prices, IsRelation, RelationGate, Unlocks) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.IsRelation = IsRelation;
        this.RelationGate = RelationGate;
        this.Unlocks = Unlocks;
    }
}

export function PolicyDef_$reflection() {
    return record_type("Game.Types.PolicyDef", [], PolicyDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["IsRelation", bool_type], ["RelationGate", option_type(tuple_type(string_type, int32_type))], ["Unlocks", option_type(UnlockList_$reflection())]]);
}

export class UpgradeDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function UpgradeDef_$reflection() {
    return record_type("Game.Types.UpgradeDef", [], UpgradeDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class CraftDef extends Record {
    constructor(Name, Prices, Tier, IgnoreBonuses, ProgressHandicap, StartsUnlocked) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Tier = Tier;
        this.IgnoreBonuses = IgnoreBonuses;
        this.ProgressHandicap = ProgressHandicap;
        this.StartsUnlocked = StartsUnlocked;
    }
}

export function CraftDef_$reflection() {
    return record_type("Game.Types.CraftDef", [], CraftDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Tier", option_type(float64_type)], ["IgnoreBonuses", bool_type], ["ProgressHandicap", float64_type], ["StartsUnlocked", bool_type]]);
}

/**
 * Live building state (orig mutates the def; conversion pattern #2).
 */
export class BuildingState extends Record {
    constructor(Def, Val, On, Unlocked, Unlockable, Stage) {
        super();
        this.Def = Def;
        this.Val = (Val | 0);
        this.On = (On | 0);
        this.Unlocked = Unlocked;
        this.Unlockable = Unlockable;
        this.Stage = (Stage | 0);
    }
}

export function BuildingState_$reflection() {
    return record_type("Game.Types.BuildingState", [], BuildingState, () => [["Def", BuildingDef_$reflection()], ["Val", int32_type], ["On", int32_type], ["Unlocked", bool_type], ["Unlockable", bool_type], ["Stage", int32_type]]);
}

/**
 * Live tech/policy/upgrade state.
 */
export class ResearchState extends Record {
    constructor(Def, Unlocked, Researched) {
        super();
        this.Def = Def;
        this.Unlocked = Unlocked;
        this.Researched = Researched;
    }
}

export function ResearchState_$reflection() {
    return record_type("Game.Types.ResearchState", [], ResearchState, () => [["Def", TechDef_$reflection()], ["Unlocked", bool_type], ["Researched", bool_type]]);
}

export class PolicyState extends Record {
    constructor(Def, Unlocked, Researched) {
        super();
        this.Def = Def;
        this.Unlocked = Unlocked;
        this.Researched = Researched;
    }
}

export function PolicyState_$reflection() {
    return record_type("Game.Types.PolicyState", [], PolicyState, () => [["Def", PolicyDef_$reflection()], ["Unlocked", bool_type], ["Researched", bool_type]]);
}

export class UpgradeState extends Record {
    constructor(Def, Unlocked, Researched) {
        super();
        this.Def = Def;
        this.Unlocked = Unlocked;
        this.Researched = Researched;
    }
}

export function UpgradeState_$reflection() {
    return record_type("Game.Types.UpgradeState", [], UpgradeState, () => [["Def", UpgradeDef_$reflection()], ["Unlocked", bool_type], ["Researched", bool_type]]);
}

export class CraftState extends Record {
    constructor(Def, Unlocked, Value, Progress, IsLimited, IsLimitedAmt) {
        super();
        this.Def = Def;
        this.Unlocked = Unlocked;
        this.Value = Value;
        this.Progress = Progress;
        this.IsLimited = IsLimited;
        this.IsLimitedAmt = IsLimitedAmt;
    }
}

export function CraftState_$reflection() {
    return record_type("Game.Types.CraftState", [], CraftState, () => [["Def", CraftDef_$reflection()], ["Unlocked", bool_type], ["Value", float64_type], ["Progress", float64_type], ["IsLimited", bool_type], ["IsLimitedAmt", bool_type]]);
}

/**
 * Zebra upgrade (workshop-10): research meta bought with bloodstone/science.
 */
export class ZebraUpgradeDef extends Record {
    constructor(Name, Prices, Effects, Unlocks, Upgrades) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
        this.Unlocks = Unlocks;
        this.Upgrades = Upgrades;
    }
}

export function ZebraUpgradeDef_$reflection() {
    return record_type("Game.Types.ZebraUpgradeDef", [], ZebraUpgradeDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["Unlocks", option_type(UnlockList_$reflection())], ["Upgrades", option_type(UnlockList_$reflection())]]);
}

/**
 * Manager-specific undo payloads (orig: opaque `data` objects per manager).
 */
export class UndoData extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["BuildUndo", "CFUUndo", "VSUUndo", "CraftUndo", "TradeUndo", "PraiseUndo", "AdoreUndo"];
    }
}

export function UndoData_$reflection() {
    return union_type("Game.Types.UndoData", [], UndoData, () => [[["building", string_type], ["count", int32_type]], [["metaId", string_type], ["val_", int32_type]], [["metaId", string_type], ["val_", int32_type]], [["craft", string_type], ["gained", float64_type], ["spent", list_type(tuple_type(string_type, float64_type))]], [["trades", float64_type], ["spent", list_type(tuple_type(string_type, float64_type))], ["gained", list_type(tuple_type(string_type, float64_type))]], [["faithSpent", float64_type], ["worshipGained", float64_type]], [["worshipBefore", float64_type], ["epiphanyGained", float64_type]]]);
}

export class UndoEvent extends Record {
    constructor(ManagerId, Data) {
        super();
        this.ManagerId = ManagerId;
        this.Data = Data;
    }
}

export function UndoEvent_$reflection() {
    return record_type("Game.Types.UndoEvent", [], UndoEvent, () => [["ManagerId", string_type], ["Data", UndoData_$reflection()]]);
}

export class UndoChange extends Record {
    constructor(Ttl, Events) {
        super();
        this.Ttl = (Ttl | 0);
        this.Events = Events;
    }
}

export function UndoChange_$reflection() {
    return record_type("Game.Types.UndoChange", [], UndoChange, () => [["Ttl", int32_type], ["Events", list_type(UndoEvent_$reflection())]]);
}

export function mkResearch(def) {
    return new ResearchState(def, false, false);
}

export function mkPolicy(def) {
    return new PolicyState(def, false, false);
}

export function mkUpgrade(def) {
    return new UpgradeState(def, false, false);
}

