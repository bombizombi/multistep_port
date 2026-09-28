
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, bool_type, option_type, class_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { empty, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { ofArray, singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";

export class JobDef extends Record {
    constructor(Name, Modifiers, CalculatedModifiers, StartsUnlocked) {
        super();
        this.Name = Name;
        this.Modifiers = Modifiers;
        this.CalculatedModifiers = CalculatedModifiers;
        this.StartsUnlocked = StartsUnlocked;
    }
}

export function JobDef_$reflection() {
    return record_type("Game.Catalog.Village.JobDef", [], JobDef, () => [["Name", string_type], ["Modifiers", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["CalculatedModifiers", option_type(class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type]))], ["StartsUnlocked", bool_type]]);
}

export class TraitDef extends Record {
    constructor(Name) {
        super();
        this.Name = Name;
    }
}

export function TraitDef_$reflection() {
    return record_type("Game.Catalog.Village.TraitDef", [], TraitDef, () => [["Name", string_type]]);
}

export const jobDefs = ofArray([new JobDef("woodcutter", ofList(singleton(["wood", 0.018]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), undefined, true), new JobDef("farmer", ofList(singleton(["catnip", 1]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), undefined, false), new JobDef("scholar", empty({
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), ofList(singleton(["science", 0.035]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), false), new JobDef("hunter", ofList(singleton(["manpower", 0.06]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), undefined, false), new JobDef("miner", ofList(singleton(["minerals", 0.05]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), undefined, false), new JobDef("priest", ofList(singleton(["faith", 0.0015]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), ofList(singleton(["faith", 0.0015]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), false), new JobDef("geologist", empty({
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), ofList(singleton(["coal", 0.015]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), false), new JobDef("engineer", empty({
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), undefined, false), new JobDef("ambassador", ofList(ofArray([["tradeVolume", 0.0007], ["embassyEffectCap", 0.00133], ["tradeBlueprintChance", 8E-05], ["tradeSpiceChance", 9E-05], ["tradeNormalResChance", 3E-05], ["cultureConsumptionAmbassadors", 20], ["spiceConsumptionAmbassadors", 0.8]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
}), ofList(ofArray([["tradeVolume", 0.0007], ["embassyEffectCap", 0.00133], ["tradeBlueprintChance", 8E-05], ["tradeSpiceChance", 9E-05], ["tradeNormalResChance", 3E-05], ["cultureConsumptionAmbassadors", 20], ["spiceConsumptionAmbassadors", 0.8]]), {
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
}), false)]);

export const traitDefs = ofArray([new TraitDef("scientist"), new TraitDef("manager"), new TraitDef("engineer"), new TraitDef("merchant"), new TraitDef("wise"), new TraitDef("metallurgist"), new TraitDef("chemist"), new TraitDef("none")]);

export const names = ofArray(["Angel", "Charlie", "Mittens", "Oreo", "Lily", "Ellie", "Amber", "Molly", "Jasper", "Oscar", "Theo", "Maddie", "Cassie", "Timber", "Meeko", "Micha", "Tami", "Plato", "Bea", "Cedar", "Cleo", "Dali", "Fiona", "Hazel", "Iggi", "Jasmine", "Kali", "Luna", "Reilly", "Reo", "Rikka", "Ruby", "Tammy", "Amy", "Henry"]);

export const surnames = ofArray(["Smoke", "Dust", "Chalk", "Fur", "Clay", "Paws", "Tails", "Sand", "Scratch", "Berry", "Shadow", "Ash", "Bark", "Bowl", "Brass", "Dusk", "Gaze", "Gleam", "Grass", "Moss", "Plaid", "Puff", "Rain", "Silk", "Silver", "Speck", "Stripes", "Tingle", "Wool", "Yarn", "Snail", "Rabbit"]);

