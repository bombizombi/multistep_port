
import { Record, Union } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { int32_type, class_type, list_type, float64_type, record_type, option_type, bool_type, string_type, union_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";

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
    return record_type("Game.Types.ResourceDef", [], ResourceDef, () => [["Name", string_type], ["Category", string_type], ["Visible", bool_type], ["Color", option_type(string_type)], ["Craftable", bool_type], ["CalculatePerTick", bool_type], ["Persists", bool_type], ["AiCanDestroy", bool_type], ["Transient", bool_type], ["Tag", option_type(string_type)], ["IsNotRefundable", bool_type], ["CalculatePerDay", bool_type], ["CalculatePerTickAndDay", bool_type], ["CalculateOnYear", bool_type], ["RefundableRule", RefundableRule_$reflection()]]);
}

/**
 * Live state of one resource (orig mutates the def object in place; the port
 * threads immutable state — conversion pattern #2).
 */
export class ResourceState extends Record {
    constructor(Def, Value, Unlocked, MaxValue) {
        super();
        this.Def = Def;
        this.Value = Value;
        this.Unlocked = Unlocked;
        this.MaxValue = MaxValue;
    }
}

export function ResourceState_$reflection() {
    return record_type("Game.Types.ResourceState", [], ResourceState, () => [["Def", ResourceDef_$reflection()], ["Value", float64_type], ["Unlocked", bool_type], ["MaxValue", float64_type]]);
}

/**
 * The resPool registry. Order mirrors orig's resPool.resources array.
 * KarmaKittens is game.karmaKittens in orig — parked here until game-06 owns
 * GamePage state (see Game.Resources.addRes karma branch).
 */
export class ResPool extends Record {
    constructor(Order, ByName, KarmaKittens) {
        super();
        this.Order = Order;
        this.ByName = ByName;
        this.KarmaKittens = (KarmaKittens | 0);
    }
}

export function ResPool_$reflection() {
    return record_type("Game.Types.ResPool", [], ResPool, () => [["Order", list_type(string_type)], ["ByName", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ResourceState_$reflection()])], ["KarmaKittens", int32_type]]);
}

