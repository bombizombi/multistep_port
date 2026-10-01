
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { float64_type, class_type, record_type, bool_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { map, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { add, tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { equals, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { value as value_1 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";

export class SettingDef extends Record {
    constructor(Name, Default, IsExtra, DevModeOnly) {
        super();
        this.Name = Name;
        this.Default = Default;
        this.IsExtra = IsExtra;
        this.DevModeOnly = DevModeOnly;
    }
}

export function SettingDef_$reflection() {
    return record_type("Game.Settings.SettingDef", [], SettingDef, () => [["Name", string_type], ["Default", bool_type], ["IsExtra", bool_type], ["DevModeOnly", bool_type]]);
}

export const settingsArr = ofArray([new SettingDef("useWorkers", true, false, false), new SettingDef("forceHighPrecision", false, false, false), new SettingDef("usePerSecondValues", true, false, false), new SettingDef("usePercentageResourceValues", false, false, false), new SettingDef("showNonApplicableButtons", false, false, false), new SettingDef("usePercentageConsumptionValues", false, false, false), new SettingDef("highlightUnavailable", true, false, false), new SettingDef("hideSell", false, false, false), new SettingDef("hideDowngrade", false, false, false), new SettingDef("hideBGImage", false, false, false), new SettingDef("tooltipsInRightColumn", false, false, false), new SettingDef("noConfirm", false, true, false), new SettingDef("IWSmelter", true, true, false), new SettingDef("disableTelemetry", false, true, false), new SettingDef("enableRedshift", false, true, false), new SettingDef("disablePollution", false, true, false), new SettingDef("enableRedshiftGflops", false, true, false), new SettingDef("useLegacyTwoInRowLayout", false, true, false), new SettingDef("useSwipeNavigation", false, true, false), new SettingDef("ksEnabled", false, true, false), new SettingDef("forceLZ", false, true, false), new SettingDef("compressSaveFile", false, true, false), new SettingDef("hodl", true, true, false), new SettingDef("disableCMBR", false, false, true)]);

export const locales = ofArray(["ru", "be", "br", "cz", "de", "es", "esl", "fr", "he", "it", "ja", "ko", "nl", "no", "pl", "uk", "zh", "zht"]);

export const schemes = ofArray(["dark", "grassy", "sleek", "black", "wood", "bluish", "grayish", "greenish", "tombstone", "spooky", "gold", "space", "school", "fluid", "vessel", "minimalist", "oil", "unicorn", "anthracite", "chocolate", "vintage", "computer", "arctic", "cyber", "factory", "catnip", "dune"]);

export const defaultSchemes = ofArray(["dark", "grassy", "sleek", "black", "wood", "bluish", "grayish", "greenish", "tombstone", "spooky"]);

export const notations = ofArray(["si", "e", "sie"]);

/**
 * game.opts shape: booleans + notation + batchSize.
 */
export class OptsState extends Record {
    constructor(Bools, Notation, BatchSize) {
        super();
        this.Bools = Bools;
        this.Notation = Notation;
        this.BatchSize = BatchSize;
    }
}

export function OptsState_$reflection() {
    return record_type("Game.Settings.OptsState", [], OptsState, () => [["Bools", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, bool_type])], ["Notation", string_type], ["BatchSize", float64_type]]);
}

export function freshOpts() {
    return new OptsState(ofList(map((s) => [s.Name, s.Default], settingsArr), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), "si", 10);
}

/**
 * orig SettingsManager.set (L279-289): writes opts, fires onChange only when
 * oldValue !== undefined && oldValue !== newValue. hodl onChange → sellBcoin
 * (js/settings.js L181-183; diplomacy.js L1208-1213: blackcoin × cryptoPrice
 * → relic, stash zeroed). Returns the new opts + whether sellBcoin fired
 * (and at which hodl value — the crypto price depends on it).
 */
export function setBool(name, value, opts) {
    const old = tryFind(name, opts.Bools);
    const opts$0027 = new OptsState(add(name, value, opts.Bools), opts.Notation, opts.BatchSize);
    const fireHodl = (((name === "hodl") && !equals(old, undefined)) && !equals(old, value)) ? value_1(old) : undefined;
    return [opts$0027, fireHodl];
}

export const migrateUseWorkersNote = "see runner loader";

