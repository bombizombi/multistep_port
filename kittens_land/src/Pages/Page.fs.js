
import { Union, Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { bool_type, tuple_type, int32_type, float64_type, union_type, record_type, list_type, option_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { calendarText, villageTabLabel, tabVisible, challengeRows, timeRows, spaceRows as spaceRows_1, religionRows, raceRows, policyRows, jobRows, getRes, jobLimit, queueLength, queueCap as queueCap_1, kittenSummary, craftRows, buildingRows, toDisplaySeconds, getEffect, fmtRes, productionBreakdown, resRows, PriceRow, upgradeRows, techRows, priceLines, tick, resetGame, setNotation, setBoolOption, removeFromQueue, addToQueue, clearAllJobs, consoleClear, applyLoaded, parseSave, buildSaveString, saveKey, setShowHiddenRes, toggleResHidden, huntAction, researchPolicyAction, setHideResearched, toggleChallengePending, buyVSU, buyCFU, buySpaceBuilding, buyProgram, buyEmbassy, trade, buyZU, buyRU, praise, craftAll, craft, buyUpgrade, research, unassignJob, assignJob, buyBuilding, refineCatnip, gatherCatnip, init as init_1, State_$reflection, TipPriceLine_$reflection } from "../KittensState.fs.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.fs.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.fs.js";
import { singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Async.js";
import { mapIndexed, length, contains, indexed, tryFindIndex, sortBy, collect, isEmpty, filter, map, tryFind, empty, singleton as singleton_1, find, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives, stringHash, int32ToString, defaultOf } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { tryFind as tryFind_1, FSharpMap__get_Item } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { replicate, join, printf, toText } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { get$ } from "../Game.Labels.fs.js";
import { defaultArg, value as value_719 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { HtmlHelper_createElement } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/./Html.fs.js";
import { map as map_1, collect as collect_1, empty as empty_1, singleton as singleton_2, append, delay, toList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { defaultOf as defaultOf_1 } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/../../../../src/Pages/../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { get$ as get$_1 } from "../Game/Game.Buildings.fs.js";
import { hasRes } from "../Game/Game.Resources.fs.js";
import { max } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { getFreeKittens } from "../Game/Game.Managers.fs.js";
import { planetDefs } from "../Game/Game.Catalog.World.fs.js";
import { List_groupBy } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq2.js";
import { createElement } from "react";
import { defaultOf as defaultOf_2 } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/React/../../../../../src/Pages/../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { settingsArr } from "../Game/Game.Settings.fs.js";
import { Page_from } from "../../.elmish-land/Base/Page.fs.js";

export class TipData extends Record {
    constructor(Desc, Flavor, Prices) {
        super();
        this.Desc = Desc;
        this.Flavor = Flavor;
        this.Prices = Prices;
    }
}

export function TipData_$reflection() {
    return record_type("kittens_land.Pages.Page.TipData", [], TipData, () => [["Desc", string_type], ["Flavor", option_type(string_type)], ["Prices", list_type(TipPriceLine_$reflection())]]);
}

/**
 * what a hovered element points at â the view rebuilds TipData from live
 * state on every render (orig ui.js L636 re-runs tooltipUpdateFunc every
 * 5 ticks so ETAs count down while the popup is visible)
 */
export class TipSource extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["TipBld", "TipTech", "TipUp", "TipRefine", "TipRes", "TipJob"];
    }
    static TipRefine = new TipSource(3, []);
}

export function TipSource_$reflection() {
    return union_type("kittens_land.Pages.Page.TipSource", [], TipSource, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]]]);
}

export class Model extends Record {
    constructor(Tab, S, Speed, LoopGen, Toast, Tooltip, OptionsOpen, ResEditMode, BuildingFilter, JobsPanelCollapsed, RightTab) {
        super();
        this.Tab = Tab;
        this.S = S;
        this.Speed = Speed;
        this.LoopGen = (LoopGen | 0);
        this.Toast = Toast;
        this.Tooltip = Tooltip;
        this.OptionsOpen = OptionsOpen;
        this.ResEditMode = ResEditMode;
        this.BuildingFilter = BuildingFilter;
        this.JobsPanelCollapsed = JobsPanelCollapsed;
        this.RightTab = RightTab;
    }
}

export function Model_$reflection() {
    return record_type("kittens_land.Pages.Page.Model", [], Model, () => [["Tab", string_type], ["S", State_$reflection()], ["Speed", float64_type], ["LoopGen", int32_type], ["Toast", string_type], ["Tooltip", option_type(tuple_type(float64_type, float64_type, TipSource_$reflection()))], ["OptionsOpen", bool_type], ["ResEditMode", bool_type], ["BuildingFilter", string_type], ["JobsPanelCollapsed", bool_type], ["RightTab", string_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Tick", "Gather", "Refine", "Buy", "Assign", "Unassign", "Research", "Upgrade", "Craft", "CraftAll", "Praise", "BuyRU", "BuyZU", "Trade", "Embassy", "Mission", "SpaceBuy", "CFUBuy", "VSUBuy", "ChallengeToggle", "SetTab", "SetRightTab", "SetSpeed", "SetTip", "ToggleOptions", "ToggleResEditMode", "ToggleJobsPanel", "ToggleResHidden", "SetShowHiddenRes", "SaveGame", "LoadGame", "ClearConsole", "ClearAllJobs", "SetHideResearched", "SetBuildingFilter", "ResearchPolicy", "Hunt", "QAdd", "QRemove", "ToggleOption", "SetNotation", "ResetGame", "LayoutMsg"];
    }
    static Gather = new Msg(1, []);
    static Refine = new Msg(2, []);
    static Praise = new Msg(10, []);
    static ToggleOptions = new Msg(24, []);
    static ToggleResEditMode = new Msg(25, []);
    static ToggleJobsPanel = new Msg(26, []);
    static SaveGame = new Msg(29, []);
    static LoadGame = new Msg(30, []);
    static ClearConsole = new Msg(31, []);
    static ClearAllJobs = new Msg(32, []);
    static Hunt = new Msg(36, []);
    static ResetGame = new Msg(41, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[["Item", int32_type]], [], [], [["Item", string_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item", string_type]], [["Item", string_type]], [["Item1", string_type], ["Item2", float64_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", float64_type]], [["Item", option_type(tuple_type(float64_type, float64_type, TipSource_$reflection()))]], [], [], [], [["Item", string_type]], [["Item", bool_type]], [], [], [], [], [["Item", bool_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item1", string_type], ["Item2", string_type]], [["Item", int32_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", Msg_$reflection_1()]]]);
}

export function tickCmd(speed, gen) {
    return Command_ofAsync((g) => singleton.Delay(() => singleton.Bind(sleep(~~(100 / speed)), () => singleton.Return(g))), gen, (g_1) => (new Msg(/* Tick */ 0, [g_1])));
}

export function init() {
    return [new Model("Bonfire", init_1(), 1, 1, "", undefined, false, false, "all", false, "Log"), Command_batch(ofArray([Command_none(), tickCmd(1, 1)]))];
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return [new Model(model.Tab, gatherCatnip(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 2:
            return [new Model(model.Tab, refineCatnip(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 3: {
            const name = msg.fields[0];
            return [new Model(model.Tab, buyBuilding(name, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 4: {
            const n = msg.fields[1] | 0;
            const job = msg.fields[0];
            return [new Model(model.Tab, assignJob(job, n, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 5: {
            const n_1 = msg.fields[1] | 0;
            const job_1 = msg.fields[0];
            return [new Model(model.Tab, unassignJob(job_1, n_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 6: {
            const name_1 = msg.fields[0];
            return [new Model(model.Tab, research(name_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 7: {
            const name_2 = msg.fields[0];
            return [new Model(model.Tab, buyUpgrade(name_2, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 8: {
            const name_3 = msg.fields[0];
            const amt = msg.fields[1];
            return [new Model(model.Tab, craft(name_3, amt, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 9: {
            const name_4 = msg.fields[0];
            return [new Model(model.Tab, craftAll(name_4, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 10:
            return [new Model(model.Tab, praise(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 11: {
            const name_5 = msg.fields[0];
            return [new Model(model.Tab, buyRU(name_5, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 12: {
            const name_6 = msg.fields[0];
            return [new Model(model.Tab, buyZU(name_6, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 13: {
            const race = msg.fields[0];
            return [new Model(model.Tab, trade(race, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 14: {
            const race_1 = msg.fields[0];
            return [new Model(model.Tab, buyEmbassy(race_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 15: {
            const name_7 = msg.fields[0];
            return [new Model(model.Tab, buyProgram(name_7, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 16: {
            const name_8 = msg.fields[0];
            return [new Model(model.Tab, buySpaceBuilding(name_8, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 17: {
            const name_9 = msg.fields[0];
            return [new Model(model.Tab, buyCFU(name_9, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 18: {
            const name_10 = msg.fields[0];
            return [new Model(model.Tab, buyVSU(name_10, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 19: {
            const name_11 = msg.fields[0];
            return [new Model(model.Tab, toggleChallengePending(name_11, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 20: {
            const tab = msg.fields[0];
            return [new Model(tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 21: {
            const tab_1 = msg.fields[0];
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, tab_1), Command_none()];
        }
        case 22: {
            const mult = msg.fields[0];
            return [new Model(model.Tab, model.S, mult, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 23: {
            const tip = msg.fields[0];
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, tip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 24:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, !model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 26:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, !model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 25:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, !model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 33: {
            const v = msg.fields[0];
            return [new Model(model.Tab, setHideResearched(v, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 34: {
            const f = msg.fields[0];
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, f, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 35: {
            const name_12 = msg.fields[0];
            return [new Model(model.Tab, researchPolicyAction(name_12, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 36:
            return [new Model(model.Tab, huntAction(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 27: {
            const name_13 = msg.fields[0];
            return [new Model(model.Tab, toggleResHidden(name_13, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 28: {
            const v_1 = msg.fields[0];
            return [new Model(model.Tab, setShowHiddenRes(v_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 29: {
            window.localStorage.setItem(saveKey, buildSaveString(model.S));
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Game saved", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 30: {
            const stored = window.localStorage.getItem(saveKey);
            if (stored === defaultOf()) {
                return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "No saved game found", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
            }
            else {
                const matchValue = parseSave(stored);
                if (matchValue == null) {
                    return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Load failed: unrecognizable save", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
                }
                else {
                    const loaded = matchValue;
                    return [new Model(model.Tab, applyLoaded(loaded, model.S), model.Speed, model.LoopGen + 1, "Game loaded", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
                }
            }
        }
        case 31:
            return [new Model(model.Tab, consoleClear(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 32:
            return [new Model(model.Tab, clearAllJobs(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 37: {
            const qtype = msg.fields[1];
            const name_14 = msg.fields[0];
            return [new Model(model.Tab, addToQueue(name_14, qtype, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 38: {
            const idx = msg.fields[0] | 0;
            return [new Model(model.Tab, removeFromQueue(idx, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 39: {
            const name_15 = msg.fields[0];
            return [new Model(model.Tab, setBoolOption(name_15, !FSharpMap__get_Item(model.S.Opts.Bools, name_15), model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 40: {
            const n_2 = msg.fields[0];
            return [new Model(model.Tab, setNotation(n_2, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 41: {
            const s$0027 = resetGame(model.S);
            return [new Model("Bonfire", s$0027, model.Speed, model.LoopGen + 1, "Game reset", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
        }
        case 42:
            return [model, Command_none()];
        default: {
            const gen = msg.fields[0] | 0;
            if (gen === model.LoopGen) {
                return [new Model(model.Tab, tick(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), tickCmd(model.Speed, gen)];
            }
            else {
                return [model, Command_none()];
            }
        }
    }
}

export function fmt(v) {
    if (v >= 1000) {
        return int32ToString(~~v);
    }
    else if (v === ~~v) {
        return int32ToString(~~v);
    }
    else {
        return toText(printf("%.1f"))(v);
    }
}

export function view(model, dispatch) {
    let option_8, value_639;
    const s = model.S;
    const cal = s.Calendar;
    const fmtSigned = (v) => (((v > 0) ? "+" : "") + fmt(v));
    const gameLeft = () => {
        const rect = document.getElementById("game").getBoundingClientRect();
        return [rect.left, rect.top];
    };
    const tipHandlers = (src) => ofArray([["onMouseEnter", (ev) => {
        const patternInput = gameLeft();
        const gt = patternInput[1];
        const gl = patternInput[0];
        dispatch(new Msg(/* SetTip */ 23, [[(ev.clientX - gl) + 12, (ev.clientY - gt) + 12, src]]));
    }], ["onMouseLeave", (_arg) => {
        dispatch(new Msg(/* SetTip */ 23, [undefined]));
    }]]);
    const renderTip = (src_1) => {
        let arg, option_5;
        const pricesTip = (desc, flavorKey, prices) => {
            let option_3, option_1, f;
            return new TipData(desc, (option_3 = ((option_1 = flavorKey, (option_1 != null) ? get$(option_1) : undefined)), (option_3 != null) ? (((f = option_3, (f !== "") && (f !== value_719(flavorKey)))) ? option_3 : undefined) : undefined), priceLines(s, false, prices));
        };
        switch (src_1.tag) {
            case 1: {
                const name_1 = src_1.fields[0];
                const row = find((t) => (t.Name === name_1), techRows(s));
                const effectDesc = get$(("tech." + name_1) + ".effectDesc");
                const desc_1 = get$(("tech." + name_1) + ".desc");
                const body = ((row.Researched && (effectDesc !== "")) && (effectDesc !== (("tech." + name_1) + ".effectDesc"))) ? ((((desc_1 + "<br>") + get$("res.effect")) + ": ") + effectDesc) : desc_1;
                return pricesTip(body, ("tech." + name_1) + ".flavor", row.Prices);
            }
            case 2: {
                const name_2 = src_1.fields[0];
                return pricesTip(get$(("up." + name_2) + ".desc"), ("up." + name_2) + ".flavor", find((u) => (u.Name === name_2), upgradeRows(s)).Prices);
            }
            case 3: {
                const refinePrice = 100;
                return pricesTip(get$("bld.refineCatnip.desc"), undefined, singleton_1(new PriceRow("catnip", refinePrice)));
            }
            case 4: {
                const name_3 = src_1.fields[0];
                const r_1 = find((r) => (r.Name === name_3), resRows(s));
                const patternInput_1 = productionBreakdown(s, name_3);
                const village = patternInput_1[1];
                const net = patternInput_1[2];
                const baseProd = patternInput_1[0];
                const line = (label, v_1) => ((((("<div>" + label) + ": ") + ((v_1 >= 0) ? "+" : "")) + fmtRes(v_1)) + "</div>");
                let body_1;
                if (name_3 === "kittens") {
                    const progress = s.Vpool.NextKittenProgress;
                    const perTickKittens = 0.01 * (1 + getEffect(s, "kittenGrowthRatio"));
                    body_1 = ((((((("<div>[" + ((arg = (progress * 100), toText(printf("%.0f"))(arg)))) + "%]</div>") + "<div>") + get$("res.toNextKitten")) + ": ") + toDisplaySeconds((1 - progress) / (perTickKittens * 10))) + "</div>");
                }
                else {
                    body_1 = ((((baseProd !== 0) ? line(get$("res.stack.production"), baseProd) : "") + ((village !== 0) ? line(get$("res.stack.village"), village) : "")) + ((net < 0) ? (((("<div>" + get$("res.toZero")) + ": ") + toDisplaySeconds(r_1.Value / (-net * 10))) + "</div>") : ((((net > 0) && (r_1.Max > 0)) && (r_1.Value < r_1.Max)) ? (((("<div>" + get$("res.toCap")) + ": ") + toDisplaySeconds((r_1.Max - r_1.Value) / (net * 10))) + "</div>") : "")));
                }
                return new TipData(body_1, undefined, empty());
            }
            case 5: {
                const name_4 = src_1.fields[0];
                const descKey = ("job." + name_4) + ".desc";
                const flavorKey_1 = ("job." + name_4) + ".flavor";
                const desc_2 = get$(descKey);
                const flavor = get$(flavorKey_1);
                return new TipData(((desc_2 !== "") && (desc_2 !== descKey)) ? desc_2 : "", ((flavor !== "") && (flavor !== flavorKey_1)) ? flavor : undefined, empty());
            }
            default: {
                const name = src_1.fields[0];
                const prices_1 = defaultArg((option_5 = tryFind((b) => (b.Name === name), buildingRows(s)), (option_5 != null) ? option_5.Prices : undefined), empty());
                return pricesTip(get$(("bld." + name) + ".desc"), ("bld." + name) + ".flavor", prices_1);
            }
        }
    };
    const modernBtn = (key_3, label_1, amtText, enabled, tip, onClick) => HtmlHelper_createElement("div", toList(delay(() => append(singleton_2(["key", key_3]), delay(() => append(singleton_2(["className", enabled ? "btn nosel modern" : "btn nosel modern disabled"]), delay(() => append(singleton_2(["style", {
        position: "relative",
        display: "block",
        marginBottom: 8,
        width: 264,
    }]), delay(() => append(singleton_2(["tabIndex", 0]), delay(() => append((tip != null) ? tipHandlers(value_719(tip)) : empty_1(), delay(() => append(singleton_2(["onClick", (_arg_1) => {
        if (enabled) {
            onClick();
        }
    }]), delay(() => singleton_2(["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "label"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "label-content"], ["children", singleton_1(label_1)]]))]]]))), delay(() => ((amtText !== "") ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "amt"], ["children", singleton_1(amtText)]]))) : empty_1())))))]]))]]]))]]))))))))))))))));
    const plainBtn = (key_24, label_2, onClick_1) => HtmlHelper_createElement("div", ofArray([["key", key_24], ["className", "btn nosel"], ["style", {
        display: "inline-block",
        marginBottom: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_2) => {
        onClick_1();
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_1(label_2)]]))]]]))]]]));
    const usePerSecond = FSharpMap__get_Item(s.Opts.Bools, "usePerSecondValues");
    const rateDisplay = (perTick) => {
        const v_2 = usePerSecond ? (perTick * 10) : perTick;
        if (v_2 !== 0) {
            return fmtRes(v_2) + (usePerSecond ? "/s" : "");
        }
        else {
            return "";
        }
    };
    const resRow = (r_2) => {
        if (!r_2.Show) {
            return defaultOf_1();
        }
        else if ((r_2.Hidden && !model.ResEditMode) && !s.ShowHiddenRes) {
            return defaultOf_1();
        }
        else {
            const perTick_1 = rateDisplay(r_2.PerTick);
            const tipSrc = new TipSource(/* TipRes */ 4, [r_2.Name]);
            return HtmlHelper_createElement("div", ofArray([["key", r_2.Name], ["role", join(" ", ["row"])], ["className", ("res-row resource_" + r_2.Name) + (r_2.Hidden ? " hidden" : "")], ["children", toList(delay(() => append(model.ResEditMode ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-cell"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", !r_2.Hidden], ["title", "Toggle " + r_2.Title], ["style", {
                display: "inline-block",
            }], ["onChange", (ev_1) => {
                ev_1.target.checked;
                dispatch(new Msg(/* ToggleResHidden */ 27, [r_2.Name]));
            }]]))]]]))) : empty_1(), delay(() => append(singleton_2(HtmlHelper_createElement("div", toList(delay(() => append(singleton_2(["className", "res-cell resource-name"]), delay(() => append(tipHandlers(tipSrc), delay(() => singleton_2(["children", singleton_1(r_2.Title)]))))))))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-cell resAmount"], ["children", singleton_1(fmtRes(r_2.Value))]]))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-cell maxRes"], ["children", singleton_1((r_2.Max > 0) ? ("/" + fmtRes(r_2.Max)) : "")]]))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-cell resPerTick"], ["children", singleton_1(perTick_1)]]))), delay(() => singleton_2(HtmlHelper_createElement("div", singleton_1(["className", "res-cell"])))))))))))))))]]));
        }
    };
    const workshopBuilt = defaultArg((option_8 = get$_1(s.Bpool, "workshop"), (option_8 != null) ? option_8.On : undefined), 0) > 0;
    const craftRow = (c) => {
        const shortcut = (amount, labelText, cssClass) => {
            const canCraft = hasRes(s.Pool, map((p) => [p.Resource, p.Val * amount], c.Prices), 0);
            if (!canCraft) {
                return defaultOf_1();
            }
            else {
                return HtmlHelper_createElement("div", ofArray([["key", c.Name + cssClass], ["className", "res-cell craft-link " + cssClass], ["title", "+" + labelText], ["onClick", (_arg_4) => {
                    dispatch(new Msg(/* Craft */ 8, [c.Name, amount]));
                }], ["children", singleton_1("+" + labelText)]]));
            }
        };
        return HtmlHelper_createElement("div", ofArray([["key", c.Name], ["className", "res-row craft resource_" + c.Name], ["children", [HtmlHelper_createElement("div", ofArray([["className", "res-cell resource-name"], ["children", singleton_1(c.Label)]])), HtmlHelper_createElement("div", ofArray([["className", "res-cell resource-value"], ["children", singleton_1(fmt(c.Value))]])), shortcut(1, fmt(1), "craft-1pc"), shortcut(max(25, ~~((c.AllCount * 5) / 100)), int32ToString(max(25, ~~((c.AllCount * 5) / 100))), "craft-5pc"), shortcut(max(100, ~~((c.AllCount * 10) / 100)), int32ToString(max(100, ~~((c.AllCount * 10) / 100))), "craft-10pc"), HtmlHelper_createElement("div", ofArray([["key", c.Name + "all"], ["className", "res-cell craft-link all"], ["title", "+" + int32ToString(c.AllCount)], ["onClick", (_arg_5) => {
            dispatch(new Msg(/* CraftAll */ 9, [c.Name]));
        }], ["children", singleton_1("all")]]))]]]));
    };
    const leftColumn = HtmlHelper_createElement("div", ofArray([["id", "leftColumn"], ["className", "column"], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        marginTop: 15,
    }], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-toolbar right"], ["style", {
        textAlign: "right",
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", model.ResEditMode ? "link toggled" : "link"], ["title", "Resource settings"], ["href", "#"], ["onClick", (_arg_6) => {
        dispatch(Msg.ToggleResEditMode);
    }], ["children", [HtmlHelper_createElement("div", singleton_1(["className", "svg-icon gear"]))]]]))]]]))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-table"], ["role", join(" ", ["grid"])], ["children", map(resRow, resRows(s))]]))), delay(() => (model.ResEditMode ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "res-toggle-hidden"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.ShowHiddenRes], ["onChange", (ev_2) => {
        dispatch(new Msg(/* SetShowHiddenRes */ 28, [ev_2.target.checked]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_1("show hidden resources")]]))]]]))) : empty_1())))))))]]))), delay(() => (workshopBuilt ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "sidebar-section"], ["style", {
        marginTop: 15,
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "res-table craftTable"], ["children", map(craftRow, craftRows(s))]]))]]]))) : empty_1())))))]]));
    const patternInput_2 = kittenSummary(s);
    const maxKittens = patternInput_2[1] | 0;
    const kittens = patternInput_2[0] | 0;
    const happiness = patternInput_2[2];
    const queueCap = queueCap_1(s) | 0;
    const queueLen = queueLength(s) | 0;
    const buildingRow = (b_3) => modernBtn("bld." + b_3.Name, b_3.Label, (b_3.Val > 0) ? (("(" + int32ToString(b_3.Val)) + ")") : "", b_3.Enabled, new TipSource(/* TipBld */ 0, [b_3.Name]), () => {
        dispatch(new Msg(/* Buy */ 3, [b_3.Name]));
    });
    const techRow = (t_1) => modernBtn("tech." + t_1.Name, t_1.Label, t_1.Researched ? "(Complete)" : "", t_1.Enabled, new TipSource(/* TipTech */ 1, [t_1.Name]), () => {
        dispatch(new Msg(/* Research */ 6, [t_1.Name]));
    });
    const upgradeRow = (u_1) => modernBtn("up." + u_1.Name, u_1.Label, "", u_1.Enabled, new TipSource(/* TipUp */ 2, [u_1.Name]), () => {
        dispatch(new Msg(/* Upgrade */ 7, [u_1.Name]));
    });
    const jobRow = (j) => {
        if (!j.Unlocked) {
            return defaultOf_1();
        }
        else {
            const free = getFreeKittens(s.Vpool) | 0;
            const limit = jobLimit(s, j.Name) | 0;
            const canAssign = (free > 0) && (j.Assigned < limit);
            const descKey_1 = ("job." + j.Name) + ".desc";
            const flavorKey_2 = ("job." + j.Name) + ".flavor";
            const desc_3 = get$(descKey_1);
            const tip_1 = ((desc_3 !== "") && (desc_3 !== descKey_1)) ? (new TipSource(/* TipJob */ 5, [j.Name])) : undefined;
            const jobLink = (title, msg) => HtmlHelper_createElement("a", ofArray([["key", j.Name + title], ["href", "#"], ["className", (title.length > 4) ? "small" : ""], ["style", {
                paddingLeft: 2,
                float: "right",
                cursor: "pointer",
            }], ["onClick", (ev_3) => {
                ev_3.stopPropagation();
                dispatch(msg);
            }], ["children", singleton_1(title)]]));
            return HtmlHelper_createElement("div", toList(delay(() => append(singleton_2(["key", j.Name]), delay(() => append(singleton_2(["className", canAssign ? "btn nosel modern" : "btn nosel modern disabled"]), delay(() => append(singleton_2(["style", {
                position: "relative",
                display: "block",
                marginBottom: 8,
                width: 264,
            }]), delay(() => append(singleton_2(["tabIndex", 0]), delay(() => append((tip_1 != null) ? tipHandlers(value_719(tip_1)) : empty_1(), delay(() => append(singleton_2(["onClick", (ev_4) => {
                if (canAssign) {
                    dispatch(ev_4.ctrlKey ? (new Msg(/* Assign */ 4, [j.Name, 10])) : (new Msg(/* Assign */ 4, [j.Name, 1])));
                }
            }]), delay(() => singleton_2(["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_1(((j.Label + " (") + int32ToString(j.Assigned)) + ")")]])), HtmlHelper_createElement("div", ofArray([["style", {
                float: "right",
            }], ["children", toList(delay(() => append((j.Assigned > 0) ? singleton_2(jobLink("[-]", new Msg(/* Unassign */ 5, [j.Name, 1]))) : empty_1(), delay(() => append((j.Assigned > 0) ? singleton_2(jobLink("[-all]", new Msg(/* Unassign */ 5, [j.Name, j.Assigned]))) : empty_1(), delay(() => append(singleton_2(jobLink("[+]", new Msg(/* Assign */ 4, [j.Name, 1]))), delay(() => ((free > 1) ? singleton_2(jobLink("[+all]", new Msg(/* Assign */ 4, [j.Name, free]))) : empty_1())))))))))]]))]]]))]]))))))))))))))));
        }
    };
    let tabContent;
    const matchValue = model.Tab;
    tabContent = ((matchValue === "Village") ? toList(delay(() => {
        let arg_1;
        return append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 10,
        }], ["children", singleton_1((((("Kittens: " + int32ToString(kittens)) + "/") + int32ToString(maxKittens)) + " - happiness: ") + ((arg_1 = (happiness * 100), toText(printf("%.0f%%"))(arg_1))))]]))), delay(() => {
            const huntCost = 100 - getEffect(s, "huntCatpowerDiscount");
            let archeryResearched;
            const matchValue_1 = tryFind_1("archery", s.Spool.Techs);
            if (matchValue_1 == null) {
                archeryResearched = false;
            }
            else {
                const t_2 = matchValue_1;
                archeryResearched = t_2.Researched;
            }
            const pacifismActive = FSharpMap__get_Item(s.Cpool.Challenges, "pacifism").Active;
            const manpower = getRes(s.Pool, "manpower");
            return append((archeryResearched && !pacifismActive) ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", (manpower >= huntCost) ? "btn nosel" : "btn nosel disabled"], ["style", {
                display: "inline-block",
                marginBottom: 10,
                cursor: "pointer",
            }], ["onClick", (_arg_7) => {
                if (manpower >= huntCost) {
                    dispatch(Msg.Hunt);
                }
            }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_1(get$("village.hunt"))]]))]]]))]]]))) : empty_1(), delay(() => singleton_2(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "toggle"], ["style", {
                float: "right",
            }], ["onClick", (_arg_8) => {
                dispatch(Msg.ToggleJobsPanel);
            }], ["children", singleton_1(model.JobsPanelCollapsed ? "+" : "-")]]))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_1("Jobs")]]))), delay(() => (!model.JobsPanelCollapsed ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", toList(delay(() => append(map(jobRow, jobRows(s)), delay(() => singleton_2(plainBtn("clearJobs", "Clear", () => {
                dispatch(Msg.ClearAllJobs);
            }))))))]]))) : empty_1())))))))]])))));
        }));
    })) : ((matchValue === "Science") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        float: "right",
    }], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.HideResearched], ["onChange", (ev_5) => {
        dispatch(new Msg(/* SetHideResearched */ 33, [ev_5.target.checked]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_1(get$("science.toggleResearched.label"))]]))]]]))), delay(() => append(map(techRow, filter((t_3) => !(t_3.Researched && s.HideResearched), techRows(s))), delay(() => singleton_2(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["style", {
        marginTop: 15,
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_1("Policies")]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", toList(delay(() => append(map((p_2) => modernBtn("pol." + p_2.Name, p_2.Label, p_2.Researched ? "(Complete)" : "", p_2.Enabled, undefined, () => {
        dispatch(new Msg(/* ResearchPolicy */ 35, [p_2.Name]));
    }), filter((p_1) => !(p_1.Researched && s.HideResearched), policyRows(s))), delay(() => (isEmpty(policyRows(s)) ? singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#777",
    }], ["children", singleton_1("No policies unlocked yet.")]]))) : empty_1())))))]]))]]]))))))))) : ((matchValue === "Workshop") ? map(upgradeRow, upgradeRows(s)) : ((matchValue === "Trade") ? collect((r_3) => ofArray([HtmlHelper_createElement("div", ofArray([["key", "info." + r_3.Name], ["style", {
        marginBottom: 4,
    }], ["children", singleton_1((((r_3.Label + " — standing ") + toText(printf("%.2f"))(r_3.Standing)) + ", embassies: ") + int32ToString(r_3.EmbassyLevel))]])), modernBtn("race." + r_3.Name, "Trade with " + r_3.Label, "", r_3.Tradeable, undefined, () => {
        dispatch(new Msg(/* Trade */ 13, [r_3.Name]));
    }), modernBtn("emb." + r_3.Name, "Embassy of " + r_3.Label, ("(" + int32ToString(r_3.EmbassyLevel)) + ")", r_3.Tradeable, undefined, () => {
        dispatch(new Msg(/* Embassy */ 14, [r_3.Name]));
    })]), raceRows(s)) : ((matchValue === "Religion") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_1((("Faith: " + fmt(getRes(s.Pool, "faith"))) + " - worship: ") + toText(printf("%.1f"))(s.Rpool.Faith))]]))), delay(() => append(singleton_2(plainBtn("praise", "Praise the sun!", () => {
        dispatch(Msg.Praise);
    })), delay(() => map((r_4) => modernBtn("rel." + r_4.Name, r_4.Label, (r_4.Val > 0) ? (("(" + int32ToString(r_4.Val)) + ")") : "", r_4.Enabled, undefined, () => {
        if (r_4.Kind === "zu") {
            dispatch(new Msg(/* BuyZU */ 12, [r_4.Name]));
        }
        else {
            dispatch(new Msg(/* BuyRU */ 11, [r_4.Name]));
        }
    }), religionRows(s)))))))) : ((matchValue === "Space") ? toList(delay(() => {
        const spaceRows = spaceRows_1(s);
        const planetOrder = map((p_3) => p_3.Name, planetDefs);
        const groups = sortBy((tupledArg) => {
            const planet = tupledArg[0];
            return defaultArg(tryFindIndex((p_4) => (p_4 === planet), planetOrder), 999) | 0;
        }, List_groupBy((r_6) => r_6.Planet, filter((r_5) => (r_5.Kind === "sbld"), spaceRows), {
            Equals: (x, y) => (x === y),
            GetHashCode: (x) => (stringHash(x) | 0),
        }), {
            Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
        });
        return append(map((r_8) => modernBtn("sp." + r_8.Name, r_8.Label, (r_8.Val > 0) ? (("(" + int32ToString(r_8.Val)) + ")") : "", r_8.Enabled, undefined, () => {
            dispatch(new Msg(/* Mission */ 15, [r_8.Name]));
        }), filter((r_7) => (r_7.Kind === "mission"), spaceRows)), delay(() => collect_1((matchValue_2) => {
            const rows = matchValue_2[1];
            const planet_1 = matchValue_2[0];
            return append((planet_1 !== "") ? singleton_2(HtmlHelper_createElement("div", ofArray([["key", "planet." + planet_1], ["style", {
                marginTop: 12,
                marginBottom: 6,
                fontWeight: "bold",
            }], ["children", singleton_1(get$("planet." + planet_1))]]))) : empty_1(), delay(() => map((r_9) => modernBtn("sp." + r_9.Name, r_9.Label, (r_9.Val > 0) ? (("(" + int32ToString(r_9.Val)) + ")") : "", r_9.Enabled, undefined, () => {
                dispatch(new Msg(/* SpaceBuy */ 16, [r_9.Name]));
            }), rows)));
        }, groups)));
    })) : ((matchValue === "Time") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_1((("Temporal flux: " + fmt(s.Tpool.Flux)) + " - heat: ") + fmt(s.Tpool.Heat))]]))), delay(() => map((r_10) => modernBtn("t." + r_10.Name, r_10.Label, (r_10.Val > 0) ? (("(" + int32ToString(r_10.Val)) + ")") : "", r_10.Enabled, undefined, () => {
        if (r_10.Kind === "cfu") {
            dispatch(new Msg(/* CFUBuy */ 17, [r_10.Name]));
        }
        else {
            dispatch(new Msg(/* VSUBuy */ 18, [r_10.Name]));
        }
    }), timeRows(s)))))) : ((matchValue === "Challenges") ? map((c_1) => {
        const action = c_1.Pending ? "Unmark" : (c_1.Active ? "Active!" : (c_1.Researched ? "Completed" : "Mark"));
        return modernBtn("ch." + c_1.Name, c_1.Label, action, !c_1.Researched, undefined, () => {
            dispatch(new Msg(/* ChallengeToggle */ 19, [c_1.Name]));
        });
    }, challengeRows(s)) : toList(delay(() => {
        const rows_1 = buildingRows(s);
        let filteredRows;
        const matchValue_3 = model.BuildingFilter;
        switch (matchValue_3) {
            case "available":
            case "enabled": {
                filteredRows = filter((b_4) => b_4.Enabled, rows_1);
                break;
            }
            case "togglable": {
                filteredRows = filter((b_5) => b_5.Togglable, rows_1);
                break;
            }
            default:
                filteredRows = rows_1;
        }
        return append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 8,
        }], ["children", toList(delay(() => collect_1((matchValue_4) => {
            const fkey = matchValue_4[1];
            const fid = matchValue_4[0];
            return singleton_2(HtmlHelper_createElement("a", ofArray([["key", fid], ["className", (model.BuildingFilter === fid) ? "activeTab" : ""], ["href", "#"], ["style", {
                marginRight: 6,
            }], ["onClick", (_arg_10) => {
                dispatch(new Msg(/* SetBuildingFilter */ 34, [fid]));
            }], ["children", singleton_1(get$(fkey))]])));
        }, [["all", "filter.all"], ["available", "filter.available"], ["enabled", "filter.enabled"], ["togglable", "filter.togglable"]])))]]))), delay(() => {
            let children;
            const btns = toList(delay(() => append(singleton_2(modernBtn("gather", get$("bld.gatherCatnip"), "", true, new TipSource(/* TipBld */ 0, ["gatherCatnip"]), () => {
                dispatch(Msg.Gather);
            })), delay(() => append(singleton_2(modernBtn("refine", get$("bld.refineCatnip"), "", getRes(s.Pool, "catnip") >= 100, TipSource.TipRefine, () => {
                dispatch(Msg.Refine);
            })), delay(() => map(buildingRow, filteredRows)))))));
            const left = map((tuple) => tuple[1], filter((tupledArg_1) => {
                const i = tupledArg_1[0] | 0;
                return (i % 2) === 0;
            }, indexed(btns)));
            const right = map((tuple_1) => tuple_1[1], filter((tupledArg_2) => {
                const i_1 = tupledArg_2[0] | 0;
                return (i_1 % 2) === 1;
            }, indexed(btns)));
            return singleton_2(HtmlHelper_createElement("div", ofArray([["className", "bldTopContainer"], ["children", [HtmlHelper_createElement("table", ofArray([["style", {
                width: 100 + "%",
                borderCollapse: "collapse",
                cellSpacing: "0",
            }], ["children", [(children = ofArray([HtmlHelper_createElement("td", ofArray([["style", {
                verticalAlign: "top",
            }], ["children", left]])), HtmlHelper_createElement("td", ofArray([["style", {
                verticalAlign: "top",
            }], ["children", right]]))]), createElement("tr", defaultOf_2(), ...children))]]]))]]])));
        }));
    }))))))))));
    const midTabIds = ofArray(["Bonfire", "Village", "Science", "Workshop", "Trade", "Religion", "Space", "Time", "Challenges"]);
    const visibleTabs = filter((tabId) => tabVisible(s, tabId), midTabIds);
    const activeTab = contains(model.Tab, visibleTabs, {
        Equals: (x_2, y_2) => (x_2 === y_2),
        GetHashCode: (x_2) => (stringHash(x_2) | 0),
    }) ? model.Tab : "Bonfire";
    const midColumn = HtmlHelper_createElement("div", ofArray([["id", "midColumn"], ["className", "column"], ["children", [HtmlHelper_createElement("div", ofArray([["className", "tabsContainer"], ["children", toList(delay(() => collect_1((matchValue_5) => {
        const t_4 = matchValue_5[1];
        const i_2 = matchValue_5[0] | 0;
        let label_3;
        if (t_4 === "Village") {
            const patternInput_3 = villageTabLabel(s);
            const title_1 = patternInput_3[0];
            const free_1 = patternInput_3[1] | 0;
            label_3 = ((free_1 > 0) ? HtmlHelper_createElement("span", singleton_1(["children", [HtmlHelper_createElement("span", singleton_1(["children", singleton_1(title_1)])), HtmlHelper_createElement("span", ofArray([["className", "genericWarning"], ["children", singleton_1(("(" + int32ToString(free_1)) + ")")]]))]])) : HtmlHelper_createElement("span", singleton_1(["children", singleton_1(title_1)])));
        }
        else {
            label_3 = HtmlHelper_createElement("span", singleton_1(["children", singleton_1(get$("tab." + t_4))]));
        }
        return append(singleton_2(HtmlHelper_createElement("a", ofArray([["key", t_4], ["className", (t_4 === activeTab) ? (("tab " + t_4) + " activeTab") : ("tab " + t_4)], ["href", "#"], ["style", {
            whiteSpace: "nowrap",
        }], ["onClick", (_arg_13) => {
            dispatch(new Msg(/* SetTab */ 20, [t_4]));
        }], ["children", [label_3]]]))), delay(() => ((i_2 < (length(visibleTabs) - 1)) ? singleton_2(HtmlHelper_createElement("span", ofArray([["key", "sep" + t_4], ["children", singleton_1(" | ")]]))) : empty_1())));
    }, indexed(visibleTabs))))]])), HtmlHelper_createElement("div", ofArray([["className", "tabInner " + activeTab], ["children", tabContent]]))]]]));
    const consoleRows = map((m) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(m.CmId)], ["className", "msg"], ["children", toList(delay(() => append(m.CmHasCal ? singleton_2(HtmlHelper_createElement("span", ofArray([["style", {
        color: "#ff7f50",
        marginRight: 8,
    }], ["children", singleton_1(((((("Y" + int32ToString(m.CmYear)) + " D") + int32ToString(m.CmDay)) + " ") + m.CmSeason) + " - ")]]))) : empty_1(), delay(() => singleton_2(HtmlHelper_createElement("span", singleton_1(["children", singleton_1(m.CmText)])))))))]])), s.ConsoleMsgs);
    const queueRows = mapIndexed((i_3, q) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(i_3) + q.QName], ["style", {
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", "link"], ["style", {
        paddingRight: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_14) => {
        dispatch(new Msg(/* QRemove */ 38, [i_3]));
    }], ["children", singleton_1("[x]")]])), HtmlHelper_createElement("span", singleton_1(["children", singleton_1((((q.QName + " (") + q.QType) + ") x") + int32ToString(q.QValue))]))]]])), s.QueueItems);
    const rightColumn = HtmlHelper_createElement("div", ofArray([["id", "rightColumn"], ["className", "column"], ["style", {
        paddingLeft: 15,
        paddingRight: 15,
        width: 300,
    }], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", singleton_1(["children", [HtmlHelper_createElement("span", singleton_1(["id", "calendarSign"])), HtmlHelper_createElement("span", ofArray([["id", "calendarDiv"], ["children", singleton_1(calendarText(s))]]))]]))), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["className", "right-tab-header"], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("a", ofArray([["id", "logLink"], ["className", (model.RightTab === "Log") ? "active" : ""], ["href", "#"], ["onClick", (_arg_15) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Log"]));
    }], ["children", singleton_1("Log")]]))), delay(() => (tabVisible(s, "Queue") ? singleton_2(HtmlHelper_createElement("a", ofArray([["id", "queueLink"], ["className", "queueLink" + ((model.RightTab === "Queue") ? " active" : "")], ["href", "#"], ["onClick", (_arg_16) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Queue"]));
    }], ["children", singleton_1("Queue")]]))) : empty_1())))))]]))), delay(() => ((model.RightTab === "Queue") ? singleton_2(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabQueue"], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 6,
    }], ["children", singleton_1((("Queue " + int32ToString(queueLen)) + "/") + int32ToString(queueCap))]]))), delay(() => append(queueRows, delay(() => singleton_2(plainBtn("qhut", "Queue a Hut", () => {
        dispatch(new Msg(/* QAdd */ 37, ["hut", "buildings"]));
    }))))))))]]))) : singleton_2(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabLog"], ["children", [HtmlHelper_createElement("div", singleton_1(["children", [HtmlHelper_createElement("div", ofArray([["className", "console-intro"], ["style", {
        paddingTop: 10,
        borderTop: (((1 + "px ") + "solid") + " ") + "gray",
    }], ["children", singleton_1(get$("console.intro"))]])), HtmlHelper_createElement("span", ofArray([["id", "clearLog"], ["style", {
        paddingTop: 5,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "clearLogHref"], ["href", "#"], ["onClick", (_arg_17) => {
        dispatch(Msg.ClearConsole);
    }], ["children", singleton_1("Clear log")]]))]]]))]])), HtmlHelper_createElement("div", ofArray([["id", "gameLog"], ["style", {
        overflowY: "auto",
        paddingTop: 10,
        height: 100 + "%",
    }], ["children", consoleRows]]))]]]))))))))))]]));
    let tooltip;
    const matchValue_6 = model.Tooltip;
    if (matchValue_6 != null) {
        const y_3 = matchValue_6[1];
        const x_3 = matchValue_6[0];
        const src_2 = matchValue_6[2];
        const tip_2 = renderTip(src_2);
        tooltip = (((tip_2.Desc === "") && isEmpty(tip_2.Prices)) ? defaultOf_1() : HtmlHelper_createElement("div", ofArray([["id", "tooltip"], ["className", "button_tooltip"], ["style", {
            top: y_3 + "px",
            left: x_3 + "px",
        }], ["children", toList(delay(() => append(((tip_2.Desc !== "") && (tip_2.Desc !== "-")) ? singleton_2(HtmlHelper_createElement("div", toList(delay(() => append(singleton_2(["className", "desc"]), delay(() => append((length(tip_2.Prices) > 0) ? singleton_2(["style", {
            borderBottom: (((1 + "px ") + "solid") + " ") + "gray",
            paddingBottom: 8,
        }]) : empty_1(), delay(() => singleton_2(["dangerouslySetInnerHTML", {
            __html: tip_2.Desc,
        }]))))))))) : empty_1(), delay(() => {
            const renderLine = (l) => HtmlHelper_createElement("div", ofArray([["key", ("price" + int32ToString(l.Indent)) + l.Title], ["className", "price-block"], ["style", {
                overflow: "hidden",
                clear: "both",
            }], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("span", ofArray([["className", (l.Indent > 0) ? "rawRes" : ""], ["style", {
                float: "left",
                paddingRight: 10,
            }], ["children", singleton_1(replicate(l.Indent * 3, " ") + l.Title)]]))), delay(() => append(singleton_2(HtmlHelper_createElement("span", ofArray([["className", l.HasRes ? "" : "noRes"], ["style", {
                float: "right",
            }], ["children", singleton_1(l.DisplayValue)]]))), delay(() => map(renderLine, l.Children)))))))]]));
            return append(map_1(renderLine, tip_2.Prices), delay(() => {
                const matchValue_7 = tip_2.Flavor;
                if (matchValue_7 == null) {
                    return empty_1();
                }
                else {
                    const flavor_1 = matchValue_7;
                    return singleton_2(HtmlHelper_createElement("div", ofArray([["className", "flavor"], ["style", {
                        paddingTop: 20,
                        fontSize: 12 + "px",
                        fontStyle: "italic",
                    }], ["children", singleton_1(flavor_1)]])));
                }
            }));
        }))))]])));
    }
    else {
        tooltip = defaultOf_1();
    }
    const optionsDialog = !model.OptionsOpen ? defaultOf_1() : HtmlHelper_createElement("div", ofArray([["id", "optionsDiv"], ["className", "dialog help"], ["style", {
        display: "block",
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "dialogClose"], ["className", "close"], ["href", "#"], ["style", {
        position: "absolute",
        top: 10,
        right: 15,
    }], ["onClick", (_arg_18) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_1("close")]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", [HtmlHelper_createElement("label", ofArray([["htmlFor", "notationSelector"], ["children", singleton_1("Notation:")]])), HtmlHelper_createElement("br", empty()), HtmlHelper_createElement("select", ofArray([["id", "notationSelector"], ["value", s.Opts.Notation], ["onChange", (ev_6) => {
        dispatch(new Msg(/* SetNotation */ 40, [ev_6.target.value]));
    }], ["children", toList(delay(() => map_1((n) => HtmlHelper_createElement("option", ofArray([["key", n], ["value", n], ["children", singleton_1(n)]])), ["si", "e", "sie"])))]]))]]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => {
        HtmlHelper_createElement("label", singleton_1(["children", singleton_1(("Game speed: " + model.Speed.toString()) + "x")]));
        HtmlHelper_createElement("br", empty());
        return map_1((mult) => HtmlHelper_createElement("button", ofArray([["key", mult.toString()], ["style", {
            marginRight: 6,
            cursor: "pointer",
        }], ["onClick", (_arg_19) => {
            dispatch(new Msg(/* SetSpeed */ 22, [mult]));
        }], ["children", singleton_1(mult.toString() + "x")]])), [1, 3, 10]);
    }))]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => map_1((o) => HtmlHelper_createElement("div", ofArray([["key", o.Name], ["style", {
        marginBottom: 2,
    }], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", FSharpMap__get_Item(s.Opts.Bools, o.Name)], ["onChange", (ev_7) => {
        ev_7.target.checked;
        dispatch(new Msg(/* ToggleOption */ 39, [o.Name]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_1(o.Name)]]))]]])), settingsArr)))]])), HtmlHelper_createElement("div", singleton_1(["children", [HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Save"], ["onClick", (_arg_21) => {
        dispatch(Msg.SaveGame);
    }]])), HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Load"], ["style", {
        marginLeft: 8,
    }], ["onClick", (_arg_22) => {
        dispatch(Msg.LoadGame);
    }]]))]])), HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 12 + "px",
        marginTop: 8,
        color: "#666",
    }], (value_639 = "Save stores to this browser\'s localStorage under its own key - the original game\'s saves are untouched.", ["children", singleton_1(value_639)])]))]]]));
    const topBar = HtmlHelper_createElement("div", ofArray([["id", "topBar"], ["children", [HtmlHelper_createElement("div", ofArray([["style", {
        paddingLeft: 10,
        minWidth: 0,
        maxWidth: 400,
        overflow: "hidden",
        textOverflow: "ellipsis",
    }], ["children", [HtmlHelper_createElement("span", ofArray([["className", "gameTitle"], ["children", singleton_1("Kittens Game")]]))]]])), HtmlHelper_createElement("div", ofArray([["className", "links-block"], ["style", {
        paddingTop: 3,
        display: "inline-flex",
        paddingRight: 10,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "save-link"], ["href", "#"], ["onClick", (_arg_23) => {
        dispatch(Msg.SaveGame);
    }], ["children", singleton_1("Save")]])), HtmlHelper_createElement("span", singleton_1(["children", singleton_1(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "options-link"], ["href", "#"], ["onClick", (_arg_24) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_1("Options")]])), HtmlHelper_createElement("span", singleton_1(["children", singleton_1(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "reset-link"], ["href", "#"], ["onClick", (_arg_25) => {
        if (window.confirm("Are you sure you want to reset the game? All your progress will be lost.")) {
            dispatch(Msg.ResetGame);
        }
    }], ["children", singleton_1("Reset")]]))]]]))]]]));
    return HtmlHelper_createElement("div", ofArray([["id", "gamePageContainer"], ["children", toList(delay(() => append(singleton_2(topBar), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["id", "game"], ["children", [leftColumn, midColumn, rightColumn, tooltip]]]))), delay(() => append(singleton_2(optionsDialog), delay(() => ((model.Toast !== "") ? singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        position: "fixed",
        bottom: 14,
        right: 14,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 14,
        paddingRight: 14,
        backgroundColor: "#eee",
        border: (((1 + "px ") + "solid") + " ") + "#888",
        color: "black",
        fontSize: 13 + "px",
    }], ["children", singleton_1(model.Toast)]]))) : empty_1())))))))))]]));
}

export function page(_shared, _route) {
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 42, [lm])));
}

