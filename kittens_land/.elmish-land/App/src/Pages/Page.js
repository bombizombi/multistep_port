
import { Union, Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { bool_type, tuple_type, int32_type, float64_type, union_type, record_type, list_type, option_type, string_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { crCtxFor, toDisplaySeconds, productionBreakdown, priceLines, calendarText, villageTabLabel, tabVisible, buildingRows, challengeRows, statRows, timeRows, spaceRows as spaceRows_1, religionRows, raceRows, isStorageLimited, upgradeRows, policyRows, techRows, censusRows, jobRows, jobLimit, PriceRow, getRes, getEffect, queueLength, queueCap as queueCap_1, kittenSummary, craftRows, resRows, fmtRes, tick, resetGame, setNotation, setBoolOption, removeFromQueue, addToQueue, clearAllJobs, consoleClear, applyLoaded, parseSave, buildSaveString, saveKey, setShowHiddenRes, toggleResHidden, buyPerkAction, transcendAction, adoreAction, sellBuilding, holdFestivalAction, huntAction, researchPolicyAction, setHideResearchedUpgrades, setHideResearched, toggleChallengePending, buyVSU, buyCFU, buySpaceBuilding, buyProgram, buyEmbassy, trade, buyZU, buyRU, praise, craftAll, craft, buyUpgrade, research, unassignJob, assignJob, buyBuilding, refineCatnip, gatherCatnip, init as init_1, State_$reflection, TipPriceLine_$reflection } from "../KittensState.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.js";
import { singleton } from "../../fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../fable_modules/fable-library-js.5.17.0/Async.js";
import { tryFind as tryFind_1, find, mapIndexed, length, contains, indexed, tryFindIndex, sortBy, collect, head, isEmpty, filter, map, empty as empty_1, singleton as singleton_2, ofArray } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives, stringHash, int32ToString, defaultOf } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { forAll, tryFind, FSharpMap__get_Item } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { replicate, join, printf, toText } from "../../fable_modules/fable-library-js.5.17.0/String.js";
import { HtmlHelper_createElement } from "../../fable_modules/Feliz.3.3.3/Html.fs.js";
import { map as map_1, collect as collect_1, empty, singleton as singleton_1, append, delay, toList } from "../../fable_modules/fable-library-js.5.17.0/Seq.js";
import { defaultArg, value as value_847 } from "../../fable_modules/fable-library-js.5.17.0/Option.js";
import { get$ } from "../Game/Game.Buildings.js";
import { defaultOf as defaultOf_1 } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { hasRes } from "../Game/Game.Resources.js";
import { max } from "../../fable_modules/fable-library-js.5.17.0/Double.js";
import { get$ as get$_1 } from "../Game.Labels.js";
import { getResCraftRatio, getFreeKittens } from "../Game/Game.Managers.js";
import { planetDefs, perkDefs } from "../Game/Game.Catalog.World.js";
import { getTranscendNextPrice, getRU } from "../Game/Game.Religion.js";
import { List_groupBy } from "../../fable_modules/fable-library-js.5.17.0/Seq2.js";
import { createElement } from "react";
import { defaultOf as defaultOf_2 } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { getEffect as getEffect_1 } from "../Game/Game.Effects.js";
import { settingsArr } from "../Game/Game.Settings.js";
import { Page_from } from "../../.elmish-land/Base/Page.js";

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
        return ["TipBld", "TipTech", "TipUp", "TipRefine", "TipRes", "TipJob", "TipFestival", "TipCraft"];
    }
    static TipRefine = new TipSource(3, []);
    static TipFestival = new TipSource(6, []);
}

export function TipSource_$reflection() {
    return union_type("kittens_land.Pages.Page.TipSource", [], TipSource, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [], [["Item", string_type]]]);
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
        return ["Tick", "Gather", "Refine", "Buy", "Assign", "Unassign", "Research", "Upgrade", "Craft", "CraftAll", "Praise", "BuyRU", "BuyZU", "Trade", "Embassy", "Mission", "SpaceBuy", "CFUBuy", "VSUBuy", "ChallengeToggle", "SetTab", "SetRightTab", "SetSpeed", "SetTip", "ToggleOptions", "ToggleResEditMode", "ToggleJobsPanel", "ToggleResHidden", "SetShowHiddenRes", "SaveGame", "LoadGame", "ClearConsole", "ClearAllJobs", "SetHideResearched", "SetHideResearchedUpgrades", "SetBuildingFilter", "ResearchPolicy", "Hunt", "HoldFestival", "Sell", "Adore", "Transcend", "BuyPerk", "QAdd", "QRemove", "ToggleOption", "SetNotation", "ResetGame", "LayoutMsg"];
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
    static Hunt = new Msg(37, []);
    static HoldFestival = new Msg(38, []);
    static Adore = new Msg(40, []);
    static Transcend = new Msg(41, []);
    static ResetGame = new Msg(47, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[["Item", int32_type]], [], [], [["Item", string_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item", string_type]], [["Item", string_type]], [["Item1", string_type], ["Item2", float64_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", float64_type]], [["Item", option_type(tuple_type(float64_type, float64_type, TipSource_$reflection()))]], [], [], [], [["Item", string_type]], [["Item", bool_type]], [], [], [], [], [["Item", bool_type]], [["Item", bool_type]], [["Item", string_type]], [["Item", string_type]], [], [], [["Item", string_type]], [], [], [["Item", string_type]], [["Item1", string_type], ["Item2", string_type]], [["Item", int32_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", Msg_$reflection_1()]]]);
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
        case 3:
            return [new Model(model.Tab, buyBuilding(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 4:
            return [new Model(model.Tab, assignJob(msg.fields[0], msg.fields[1], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 5:
            return [new Model(model.Tab, unassignJob(msg.fields[0], msg.fields[1], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 6:
            return [new Model(model.Tab, research(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 7:
            return [new Model(model.Tab, buyUpgrade(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 8:
            return [new Model(model.Tab, craft(msg.fields[0], msg.fields[1], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 9:
            return [new Model(model.Tab, craftAll(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 10:
            return [new Model(model.Tab, praise(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 11:
            return [new Model(model.Tab, buyRU(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 12:
            return [new Model(model.Tab, buyZU(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 13:
            return [new Model(model.Tab, trade(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 14:
            return [new Model(model.Tab, buyEmbassy(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 15:
            return [new Model(model.Tab, buyProgram(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 16:
            return [new Model(model.Tab, buySpaceBuilding(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 17:
            return [new Model(model.Tab, buyCFU(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 18:
            return [new Model(model.Tab, buyVSU(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 19:
            return [new Model(model.Tab, toggleChallengePending(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 20:
            return [new Model(msg.fields[0], model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 21:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, msg.fields[0]), Command_none()];
        case 22:
            return [new Model(model.Tab, model.S, msg.fields[0], model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 23:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, msg.fields[0], model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 24:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, !model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 26:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, !model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 25:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, !model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 33:
            return [new Model(model.Tab, setHideResearched(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 34:
            return [new Model(model.Tab, setHideResearchedUpgrades(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 35:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, msg.fields[0], model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 36:
            return [new Model(model.Tab, researchPolicyAction(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 37:
            return [new Model(model.Tab, huntAction(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 38:
            return [new Model(model.Tab, holdFestivalAction(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 39:
            return [new Model(model.Tab, sellBuilding(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 40:
            return [new Model(model.Tab, adoreAction(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 41:
            return [new Model(model.Tab, transcendAction(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 42:
            return [new Model(model.Tab, buyPerkAction(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 27:
            return [new Model(model.Tab, toggleResHidden(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 28:
            return [new Model(model.Tab, setShowHiddenRes(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
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
                    return [new Model(model.Tab, applyLoaded(matchValue, model.S), model.Speed, model.LoopGen + 1, "Game loaded", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
                }
            }
        }
        case 31:
            return [new Model(model.Tab, consoleClear(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 32:
            return [new Model(model.Tab, clearAllJobs(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 43:
            return [new Model(model.Tab, addToQueue(msg.fields[0], msg.fields[1], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 44:
            return [new Model(model.Tab, removeFromQueue(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 45: {
            const name_17 = msg.fields[0];
            return [new Model(model.Tab, setBoolOption(name_17, !FSharpMap__get_Item(model.S.Opts.Bools, name_17), model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        }
        case 46:
            return [new Model(model.Tab, setNotation(msg.fields[0], model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_none()];
        case 47:
            return [new Model("Bonfire", resetGame(model.S), model.Speed, model.LoopGen + 1, "Game reset", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.BuildingFilter, model.JobsPanelCollapsed, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
        case 48:
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
    let option_8, progress, perTickKittens, arg, option_5, value_767;
    const s = model.S;
    const tipHandlers = (src) => ofArray([["onMouseEnter", (ev) => {
        let patternInput;
        const rect = document.getElementById("game").getBoundingClientRect();
        patternInput = [rect.left, rect.top];
        dispatch(new Msg(/* SetTip */ 23, [[(ev.clientX - patternInput[0]) + 12, (ev.clientY - patternInput[1]) + 12, src]]));
    }], ["onMouseLeave", (_arg) => {
        dispatch(new Msg(/* SetTip */ 23, [undefined]));
    }]]);
    const modernBtnL = (key_3, label_1, amtText, enabled, limited, tip, onClick, extraLinks) => {
        const limitedCls = (!enabled && limited) && FSharpMap__get_Item(s.Opts.Bools, "highlightUnavailable");
        return HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["key", key_3]), delay(() => append(singleton_1(["className", enabled ? "btn nosel modern" : ("btn nosel modern disabled" + (limitedCls ? " limited" : ""))]), delay(() => append(singleton_1(["style", {
            position: "relative",
            display: "block",
            marginBottom: 8,
            width: 264,
        }]), delay(() => append(singleton_1(["tabIndex", 0]), delay(() => append((tip != null) ? tipHandlers(value_847(tip)) : empty(), delay(() => append(singleton_1(["onClick", (_arg_1) => {
            if (enabled) {
                onClick();
            }
        }]), delay(() => singleton_1(["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "label"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "label-content"], ["children", singleton_2(label_1)]]))]]]))), delay(() => ((amtText !== "") ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "amt"], ["children", singleton_2(amtText)]]))) : empty())))))]]))), delay(() => extraLinks))))]]))]]))))))))))))))));
    };
    const modernBtn = (key_24, label_2, amtText_1, enabled_1, tip_1, onClick_1) => modernBtnL(key_24, label_2, amtText_1, enabled_1, false, tip_1, onClick_1, empty_1());
    const plainBtn = (key_25, label_3, onClick_2) => HtmlHelper_createElement("div", ofArray([["key", key_25], ["className", "btn nosel"], ["style", {
        display: "inline-block",
        marginBottom: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_2) => {
        onClick_2();
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_2(label_3)]]))]]]))]]]));
    const usePerSecond = FSharpMap__get_Item(s.Opts.Bools, "usePerSecondValues");
    const workshopBuilt = defaultArg((option_8 = get$(s.Bpool, "workshop"), (option_8 != null) ? option_8.On : undefined), 0) > 0;
    const leftColumn = HtmlHelper_createElement("div", ofArray([["id", "leftColumn"], ["className", "column"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginTop: 15,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-toolbar right"], ["style", {
        textAlign: "right",
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", model.ResEditMode ? "link toggled" : "link"], ["title", "Resource settings"], ["href", "#"], ["onClick", (_arg_6) => {
        dispatch(Msg.ToggleResEditMode);
    }], ["children", [HtmlHelper_createElement("div", singleton_2(["className", "svg-icon gear"]))]]]))]]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-table"], ["role", join(" ", ["grid"])], ["children", map((r_2) => {
        if (!r_2.Show) {
            return defaultOf_1();
        }
        else if ((r_2.Hidden && !model.ResEditMode) && !s.ShowHiddenRes) {
            return defaultOf_1();
        }
        else {
            let perTick_1;
            const perTick = r_2.PerTick;
            const v_2 = usePerSecond ? (perTick * 10) : perTick;
            perTick_1 = ((v_2 !== 0) ? (fmtRes(v_2) + (usePerSecond ? "/s" : "")) : "");
            return HtmlHelper_createElement("div", ofArray([["key", r_2.Name], ["role", join(" ", ["row"])], ["className", ("res-row resource_" + r_2.Name) + (r_2.Hidden ? " hidden" : "")], ["children", toList(delay(() => append(model.ResEditMode ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", !r_2.Hidden], ["title", "Toggle " + r_2.Title], ["style", {
                display: "inline-block",
            }], ["onChange", (ev_1) => {
                ev_1.target.checked;
                dispatch(new Msg(/* ToggleResHidden */ 27, [r_2.Name]));
            }]]))]]]))) : empty(), delay(() => append(singleton_1(HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["className", "res-cell resource-name"]), delay(() => append(tipHandlers(new TipSource(/* TipRes */ 4, [r_2.Name])), delay(() => singleton_1(["children", singleton_2(r_2.Title)]))))))))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell resAmount"], ["children", singleton_2(fmtRes(r_2.Value))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell maxRes"], ["children", singleton_2((r_2.Max > 0) ? ("/" + fmtRes(r_2.Max)) : "")]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell resPerTick"], ["children", singleton_2(perTick_1)]]))), delay(() => singleton_1(HtmlHelper_createElement("div", singleton_2(["className", "res-cell"])))))))))))))))]]));
        }
    }, resRows(s))]]))), delay(() => (model.ResEditMode ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-toggle-hidden"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.ShowHiddenRes], ["onChange", (ev_2) => {
        dispatch(new Msg(/* SetShowHiddenRes */ 28, [ev_2.target.checked]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_2("show hidden resources")]]))]]]))) : empty())))))))]]))), delay(() => (workshopBuilt ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "sidebar-section"], ["style", {
        marginTop: 15,
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "res-table craftTable"], ["children", map((c) => {
        const shortcut = (amount, labelText, cssClass) => {
            if (!hasRes(s.Pool, map((p) => [p.Resource, p.Val * amount], c.Prices), 0)) {
                return defaultOf_1();
            }
            else {
                return HtmlHelper_createElement("div", ofArray([["key", c.Name + cssClass], ["className", "res-cell craft-link " + cssClass], ["title", "+" + labelText], ["onClick", (_arg_4) => {
                    dispatch(new Msg(/* Craft */ 8, [c.Name, amount]));
                }], ["children", singleton_2("+" + labelText)]]));
            }
        };
        return HtmlHelper_createElement("div", ofArray([["key", c.Name], ["className", "res-row craft resource_" + c.Name], ["children", [HtmlHelper_createElement("div", ofArray([["className", "res-cell resource-name"], ["children", singleton_2(c.Label)]])), HtmlHelper_createElement("div", ofArray([["className", "res-cell resource-value"], ["children", singleton_2(fmt(c.Value))]])), shortcut(1, fmt(1), "craft-1pc"), shortcut(max(25, ~~((c.AllCount * 5) / 100)), int32ToString(max(25, ~~((c.AllCount * 5) / 100))), "craft-5pc"), shortcut(max(100, ~~((c.AllCount * 10) / 100)), int32ToString(max(100, ~~((c.AllCount * 10) / 100))), "craft-10pc"), HtmlHelper_createElement("div", ofArray([["key", c.Name + "all"], ["className", "res-cell craft-link all"], ["title", "+" + int32ToString(c.AllCount)], ["onClick", (_arg_5) => {
            dispatch(new Msg(/* CraftAll */ 9, [c.Name]));
        }], ["children", singleton_2("all")]]))]]]));
    }, craftRows(s))]]))]]]))) : empty())))))]]));
    const patternInput_2 = kittenSummary(s);
    const queueCap = queueCap_1(s) | 0;
    const queueLen = queueLength(s) | 0;
    let tabContent;
    const matchValue = model.Tab;
    tabContent = ((matchValue === "Village") ? toList(delay(() => {
        let arg_1;
        return append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 10,
        }], ["children", singleton_2((((("Kittens: " + int32ToString(patternInput_2[0])) + "/") + int32ToString(patternInput_2[1])) + " - happiness: ") + ((arg_1 = (patternInput_2[2] * 100), toText(printf("%.0f%%"))(arg_1))))]]))), delay(() => {
            const huntCost = 100 - getEffect(s, "huntCatpowerDiscount");
            let archeryResearched;
            const matchValue_1 = tryFind("archery", s.Spool.Techs);
            archeryResearched = ((matchValue_1 == null) ? false : matchValue_1.Researched);
            const pacifismActive = FSharpMap__get_Item(s.Cpool.Challenges, "pacifism").Active;
            const manpower = getRes(s.Pool, "manpower");
            return append((archeryResearched && !pacifismActive) ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", (manpower >= huntCost) ? "btn nosel" : "btn nosel disabled"], ["style", {
                display: "inline-block",
                marginBottom: 10,
                cursor: "pointer",
            }], ["onClick", (_arg_7) => {
                if (manpower >= huntCost) {
                    dispatch(Msg.Hunt);
                }
            }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_2(get$_1("village.hunt"))]]))]]]))]]]))) : empty(), delay(() => {
                const festivalAffordable = hasRes(s.Pool, map((p0) => [p0.Resource, p0.Val], ofArray([new PriceRow("manpower", 1500), new PriceRow("culture", 5000), new PriceRow("parchment", 2500)])), 0);
                return append(singleton_1(modernBtnL("festival", get$_1("village.btn.festival"), "", festivalAffordable, false, TipSource.TipFestival, () => {
                    dispatch(Msg.HoldFestival);
                }, empty_1())), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "toggle"], ["style", {
                    float: "right",
                }], ["onClick", (_arg_8) => {
                    dispatch(Msg.ToggleJobsPanel);
                }], ["children", singleton_2(model.JobsPanelCollapsed ? "+" : "-")]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2("Jobs")]]))), delay(() => (!model.JobsPanelCollapsed ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", toList(delay(() => append(map((j) => {
                    if (!j.Unlocked) {
                        return defaultOf_1();
                    }
                    else {
                        const free = getFreeKittens(s.Vpool) | 0;
                        const limit = jobLimit(s, j.Name) | 0;
                        const canAssign = (free > 0) && (j.Assigned < limit);
                        const descKey_2 = ("job." + j.Name) + ".desc";
                        ("job." + j.Name) + ".flavor";
                        const desc_4 = get$_1(descKey_2);
                        const tip_2 = ((desc_4 !== "") && (desc_4 !== descKey_2)) ? (new TipSource(/* TipJob */ 5, [j.Name])) : undefined;
                        const jobLink = (title, msg) => HtmlHelper_createElement("a", ofArray([["key", j.Name + title], ["href", "#"], ["className", (title.length > 4) ? "small" : ""], ["style", {
                            paddingLeft: 2,
                            float: "right",
                            cursor: "pointer",
                        }], ["onClick", (ev_4) => {
                            ev_4.stopPropagation();
                            dispatch(msg);
                        }], ["children", singleton_2(title)]]));
                        return HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["key", j.Name]), delay(() => append(singleton_1(["className", canAssign ? "btn nosel modern" : "btn nosel modern disabled"]), delay(() => append(singleton_1(["style", {
                            position: "relative",
                            display: "block",
                            marginBottom: 8,
                            width: 264,
                        }]), delay(() => append(singleton_1(["tabIndex", 0]), delay(() => append((tip_2 != null) ? tipHandlers(value_847(tip_2)) : empty(), delay(() => append(singleton_1(["onClick", (ev_5) => {
                            if (canAssign) {
                                dispatch(ev_5.ctrlKey ? (new Msg(/* Assign */ 4, [j.Name, 10])) : (new Msg(/* Assign */ 4, [j.Name, 1])));
                            }
                        }]), delay(() => singleton_1(["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_2(((j.Label + " (") + int32ToString(j.Assigned)) + ")")]])), HtmlHelper_createElement("div", ofArray([["style", {
                            float: "right",
                        }], ["children", toList(delay(() => append((j.Assigned > 0) ? singleton_1(jobLink("[-]", new Msg(/* Unassign */ 5, [j.Name, 1]))) : empty(), delay(() => append((j.Assigned > 0) ? singleton_1(jobLink("[-all]", new Msg(/* Unassign */ 5, [j.Name, j.Assigned]))) : empty(), delay(() => append(singleton_1(jobLink("[+]", new Msg(/* Assign */ 4, [j.Name, 1]))), delay(() => ((free > 1) ? singleton_1(jobLink("[+all]", new Msg(/* Assign */ 4, [j.Name, free]))) : empty())))))))))]]))]]]))]]))))))))))))))));
                    }
                }, jobRows(s)), delay(() => singleton_1(plainBtn("clearJobs", "Clear", () => {
                    dispatch(Msg.ClearAllJobs);
                }))))))]]))) : empty())))))))]]))), delay(() => singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["style", {
                    marginTop: 15,
                }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2("Census")]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", map((k) => {
                    let option_11;
                    const jobText = defaultArg((option_11 = k.Job, (option_11 != null) ? (", " + option_11) : undefined), "");
                    return HtmlHelper_createElement("div", ofArray([["key", ("cen." + k.Name) + int32ToString(k.Age)], ["style", {
                        marginBottom: 2,
                    }], ["children", singleton_2(((((k.Name + ", ") + int32ToString(k.Age)) + " years old, ") + k.Trait) + jobText)]]));
                }, censusRows(s))]]))]]])))))));
            }));
        }));
    })) : ((matchValue === "Science") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        float: "right",
    }], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.HideResearched], ["onChange", (ev_6) => {
        dispatch(new Msg(/* SetHideResearched */ 33, [ev_6.target.checked]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_2(get$_1("science.toggleResearched.label"))]]))]]]))), delay(() => append(map((t_1) => modernBtnL("tech." + t_1.Name, t_1.Label, t_1.Researched ? "(Complete)" : "", t_1.Enabled, t_1.Limited, new TipSource(/* TipTech */ 1, [t_1.Name]), () => {
        dispatch(new Msg(/* Research */ 6, [t_1.Name]));
    }, empty_1()), filter((t_3) => !(t_3.Researched && s.HideResearched), techRows(s))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["style", {
        marginTop: 15,
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2("Policies")]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", toList(delay(() => append(map((p_2) => modernBtn("pol." + p_2.Name, p_2.Label, p_2.Researched ? "(Complete)" : "", p_2.Enabled, undefined, () => {
        dispatch(new Msg(/* ResearchPolicy */ 36, [p_2.Name]));
    }), filter((p_1) => !(p_1.Researched && s.HideResearched), policyRows(s))), delay(() => (isEmpty(policyRows(s)) ? singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#777",
    }], ["children", singleton_2("No policies unlocked yet.")]]))) : empty())))))]]))]]]))), delay(() => {
        let metaphysicsResearched;
        const matchValue_2 = tryFind("metaphysics", s.Spool.Techs);
        metaphysicsResearched = ((matchValue_2 == null) ? false : matchValue_2.Researched);
        const paragon = getRes(s.Pool, "paragon");
        return (metaphysicsResearched && (paragon > 0)) ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["style", {
            marginTop: 15,
        }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2(get$_1("prestige.panel.label"))]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", toList(delay(() => append(map((d_1) => {
            const affordable = hasRes(s.Pool, map((p0_1) => [p0_1.Resource, p0_1.Val], d_1.Prices), 0);
            return modernBtn("perk." + d_1.Name, get$_1("perk." + d_1.Name), isEmpty(d_1.Prices) ? "" : (("(" + fmtRes(head(d_1.Prices).Val)) + " paragon)"), affordable, undefined, () => {
                dispatch(new Msg(/* BuyPerk */ 42, [d_1.Name]));
            });
        }, filter((d) => {
            const matchValue_3 = tryFind(d.Name, s.Ppool.Perks);
            if (matchValue_3 == null) {
                return false;
            }
            else {
                return !matchValue_3.Researched;
            }
        }, perkDefs)), delay(() => (forAll((_arg_9, m_1) => m_1.Researched, s.Ppool.Perks) ? singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            fontSize: 12 + "px",
            color: "#777",
        }], ["children", singleton_2("All perks researched.")]]))) : empty())))))]]))]]]))) : empty();
    })))))))) : ((matchValue === "Workshop") ? toList(delay(() => {
        let arg_2;
        const craftRatio = getEffect(s, "craftRatio");
        return append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            float: "left",
        }], ["children", singleton_2((arg_2 = (~~(craftRatio * 100) | 0), toText(printf("Craft effectiveness: +%d%%"))(arg_2)))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            float: "right",
        }], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.HideResearchedUpgrades], ["onChange", (ev_7) => {
            dispatch(new Msg(/* SetHideResearchedUpgrades */ 34, [ev_7.target.checked]));
        }]])), HtmlHelper_createElement("label", ofArray([["style", {
            marginLeft: 6,
        }], ["children", singleton_2(get$_1("workshop.toggleResearched.label"))]]))]]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", singleton_2(["style", {
            clear: "both",
        }]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2(get$_1("workshop.upgradePanel.label"))]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", map((u_1) => modernBtnL("up." + u_1.Name, u_1.Label, "", u_1.Enabled, u_1.Limited, new TipSource(/* TipUp */ 2, [u_1.Name]), () => {
            dispatch(new Msg(/* Upgrade */ 7, [u_1.Name]));
        }, empty_1()), filter((u_2) => !(u_2.Researched && s.HideResearchedUpgrades), upgradeRows(s)))]]))]]]))), delay(() => singleton_1(HtmlHelper_createElement("div", ofArray([["className", "panelContainer"], ["style", {
            marginTop: 15,
        }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "title"], ["children", singleton_2(get$_1("workshop.craftPanel.label"))]])), HtmlHelper_createElement("div", ofArray([["className", "container"], ["children", map((c_1) => {
            const affordable_1 = hasRes(s.Pool, map((p0_2) => [p0_2.Resource, p0_2.Val * 1], c_1.Prices), 0);
            return modernBtnL("craft." + c_1.Name, c_1.Label, (c_1.Value > 0) ? (("(" + fmtRes(c_1.Value)) + ")") : "", affordable_1, isStorageLimited(s, c_1.Prices), new TipSource(/* TipCraft */ 7, [c_1.Name]), () => {
                dispatch(new Msg(/* Craft */ 8, [c_1.Name, 1]));
            }, empty_1());
        }, craftRows(s))]]))]]])))))))))));
    })) : ((matchValue === "Trade") ? collect((r_3) => ofArray([HtmlHelper_createElement("div", ofArray([["key", "info." + r_3.Name], ["style", {
        marginBottom: 4,
    }], ["children", singleton_2((((r_3.Label + " — standing ") + toText(printf("%.2f"))(r_3.Standing)) + ", embassies: ") + int32ToString(r_3.EmbassyLevel))]])), modernBtn("race." + r_3.Name, "Trade with " + r_3.Label, "", r_3.Tradeable, undefined, () => {
        dispatch(new Msg(/* Trade */ 13, [r_3.Name]));
    }), modernBtn("emb." + r_3.Name, "Embassy of " + r_3.Label, ("(" + int32ToString(r_3.EmbassyLevel)) + ")", r_3.Tradeable, undefined, () => {
        dispatch(new Msg(/* Embassy */ 14, [r_3.Name]));
    })]), raceRows(s)) : ((matchValue === "Religion") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_2((("Faith: " + fmt(getRes(s.Pool, "faith"))) + " - worship: ") + toText(printf("%.1f"))(s.Rpool.Faith))]]))), delay(() => append(singleton_1(plainBtn("praise", "Praise the sun!", () => {
        dispatch(Msg.Praise);
    })), delay(() => append((getRU(s.Rpool, "transcendence").Val > 0) ? append(singleton_1(modernBtnL("adore", get$_1("religion.adoreBtn.label"), "", true, false, undefined, () => {
        dispatch(Msg.Adore);
    }, empty_1())), delay(() => {
        const nextPrice = getTranscendNextPrice(s.Rpool);
        return append(singleton_1(modernBtnL("transcend", get$_1("religion.transcendBtn.label"), (s.Rpool.TranscendenceTier > 0) ? (("(T" + int32ToString(s.Rpool.TranscendenceTier)) + ")") : "", s.Rpool.FaithRatio > nextPrice, false, undefined, () => {
            dispatch(Msg.Transcend);
        }, empty_1())), delay(() => singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 10,
            fontSize: 12 + "px",
            color: "#777",
        }], ["children", singleton_2((("epiphany: " + fmtRes(s.Rpool.FaithRatio)) + " - next tier: ") + fmtRes(nextPrice))]])))));
    })) : empty(), delay(() => map((r_4) => modernBtn("rel." + r_4.Name, r_4.Label, (r_4.Val > 0) ? (("(" + int32ToString(r_4.Val)) + ")") : "", r_4.Enabled, undefined, () => {
        if (r_4.Kind === "zu") {
            dispatch(new Msg(/* BuyZU */ 12, [r_4.Name]));
        }
        else {
            dispatch(new Msg(/* BuyRU */ 11, [r_4.Name]));
        }
    }), religionRows(s)))))))))) : ((matchValue === "Space") ? toList(delay(() => {
        const spaceRows = spaceRows_1(s);
        const planetOrder = map((p_3) => p_3.Name, planetDefs);
        const groups = sortBy((tupledArg) => (defaultArg(tryFindIndex((p_4) => (p_4 === tupledArg[0]), planetOrder), 999) | 0), List_groupBy((r_6) => r_6.Planet, filter((r_5) => (r_5.Kind === "sbld"), spaceRows), {
            Equals: (x, y) => (x === y),
            GetHashCode: (x) => (stringHash(x) | 0),
        }), {
            Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
        });
        return append(map((r_8) => modernBtn("sp." + r_8.Name, r_8.Label, (r_8.Val > 0) ? (("(" + int32ToString(r_8.Val)) + ")") : "", r_8.Enabled, undefined, () => {
            dispatch(new Msg(/* Mission */ 15, [r_8.Name]));
        }), filter((r_7) => (r_7.Kind === "mission"), spaceRows)), delay(() => collect_1((matchValue_4) => {
            const planet_1 = matchValue_4[0];
            return append((planet_1 !== "") ? singleton_1(HtmlHelper_createElement("div", ofArray([["key", "planet." + planet_1], ["style", {
                marginTop: 12,
                marginBottom: 6,
                fontWeight: "bold",
            }], ["children", singleton_2(get$_1("planet." + planet_1))]]))) : empty(), delay(() => map((r_9) => modernBtn("sp." + r_9.Name, r_9.Label, (r_9.Val > 0) ? (("(" + int32ToString(r_9.Val)) + ")") : "", r_9.Enabled, undefined, () => {
                dispatch(new Msg(/* SpaceBuy */ 16, [r_9.Name]));
            }), matchValue_4[1])));
        }, groups)));
    })) : ((matchValue === "Time") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_2((("Temporal flux: " + fmt(s.Tpool.Flux)) + " - heat: ") + fmt(s.Tpool.Heat))]]))), delay(() => map((r_10) => modernBtn("t." + r_10.Name, r_10.Label, (r_10.Val > 0) ? (("(" + int32ToString(r_10.Val)) + ")") : "", r_10.Enabled, undefined, () => {
        if (r_10.Kind === "cfu") {
            dispatch(new Msg(/* CFUBuy */ 17, [r_10.Name]));
        }
        else {
            dispatch(new Msg(/* VSUBuy */ 18, [r_10.Name]));
        }
    }), timeRows(s)))))) : ((matchValue === "Stats") ? toList(delay(() => collect_1((matchValue_5) => append(singleton_1(HtmlHelper_createElement("h1", ofArray([["style", {
        fontSize: 18 + "px",
        marginTop: 14,
    }], ["children", singleton_2(matchValue_5[0])]]))), delay(() => singleton_1(HtmlHelper_createElement("table", ofArray([["className", "statTable"], ["children", map((r_11) => HtmlHelper_createElement("tr", ofArray([["key", "stat." + r_11.Title], ["children", [HtmlHelper_createElement("td", singleton_2(["children", singleton_2(r_11.Unlocked ? r_11.Title : "???")])), HtmlHelper_createElement("td", ofArray([["style", {
        paddingLeft: 14,
    }], ["children", singleton_2(r_11.Unlocked ? fmt(r_11.Value) : "")]]))]]])), matchValue_5[1])]]))))), statRows(s)))) : ((matchValue === "Challenges") ? map((c_2) => modernBtn("ch." + c_2.Name, c_2.Label, c_2.Pending ? "Unmark" : (c_2.Active ? "Active!" : (c_2.Researched ? "Completed" : "Mark")), !c_2.Researched, undefined, () => {
        dispatch(new Msg(/* ChallengeToggle */ 19, [c_2.Name]));
    }), challengeRows(s)) : toList(delay(() => {
        const rows_2 = buildingRows(s);
        let filteredRows;
        const matchValue_6 = model.BuildingFilter;
        switch (matchValue_6) {
            case "available":
            case "enabled": {
                filteredRows = filter((b_4) => b_4.Enabled, rows_2);
                break;
            }
            case "togglable": {
                filteredRows = filter((b_5) => b_5.Togglable, rows_2);
                break;
            }
            default:
                filteredRows = rows_2;
        }
        return append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 8,
        }], ["children", toList(delay(() => collect_1((matchValue_7) => {
            const fid = matchValue_7[0];
            return singleton_1(HtmlHelper_createElement("a", ofArray([["key", fid], ["className", (model.BuildingFilter === fid) ? "activeTab" : ""], ["href", "#"], ["style", {
                marginRight: 6,
            }], ["onClick", (_arg_11) => {
                dispatch(new Msg(/* SetBuildingFilter */ 35, [fid]));
            }], ["children", singleton_2(get$_1(matchValue_7[1]))]])));
        }, [["all", "filter.all"], ["available", "filter.available"], ["enabled", "filter.enabled"], ["togglable", "filter.togglable"]])))]]))), delay(() => {
            let children;
            const btns = toList(delay(() => append(singleton_1(modernBtn("gather", get$_1("bld.gatherCatnip"), "", true, new TipSource(/* TipBld */ 0, ["gatherCatnip"]), () => {
                dispatch(Msg.Gather);
            })), delay(() => append(singleton_1(modernBtn("refine", get$_1("bld.refineCatnip"), "", getRes(s.Pool, "catnip") >= 100, TipSource.TipRefine, () => {
                dispatch(Msg.Refine);
            })), delay(() => map((b_3) => modernBtnL("bld." + b_3.Name, b_3.Label, (b_3.Val > 0) ? (("(" + int32ToString(b_3.Val)) + ")") : "", b_3.Enabled, b_3.Limited, new TipSource(/* TipBld */ 0, [b_3.Name]), () => {
                dispatch(new Msg(/* Buy */ 3, [b_3.Name]));
            }, ((b_3.Val > 0) && !FSharpMap__get_Item(s.Opts.Bools, "hideSell")) ? singleton_2(HtmlHelper_createElement("a", ofArray([["key", "sell." + b_3.Name], ["href", "#"], ["className", "small"], ["style", {
                paddingLeft: 2,
                float: "right",
                cursor: "pointer",
            }], ["onClick", (ev_3) => {
                ev_3.stopPropagation();
                dispatch(new Msg(/* Sell */ 39, [b_3.Name]));
            }], ["children", singleton_2(get$_1("btn.sell"))]]))) : empty_1()), filteredRows)))))));
            const left = map((tuple) => tuple[1], filter((tupledArg_1) => ((tupledArg_1[0] % 2) === 0), indexed(btns)));
            const right = map((tuple_1) => tuple_1[1], filter((tupledArg_2) => ((tupledArg_2[0] % 2) === 1), indexed(btns)));
            return singleton_1(HtmlHelper_createElement("div", ofArray([["className", "bldTopContainer"], ["children", [HtmlHelper_createElement("table", ofArray([["style", {
                width: 100 + "%",
                borderCollapse: "collapse",
                cellSpacing: "0",
            }], ["children", [(children = ofArray([HtmlHelper_createElement("td", ofArray([["style", {
                verticalAlign: "top",
            }], ["children", left]])), HtmlHelper_createElement("td", ofArray([["style", {
                verticalAlign: "top",
            }], ["children", right]]))]), createElement("tr", defaultOf_2(), ...children))]]]))]]])));
        }));
    })))))))))));
    const visibleTabs = filter((tabId) => tabVisible(s, tabId), ofArray(["Bonfire", "Village", "Science", "Workshop", "Trade", "Religion", "Space", "Time", "Challenges", "Stats"]));
    const activeTab = contains(model.Tab, visibleTabs, {
        Equals: (x_2, y_2) => (x_2 === y_2),
        GetHashCode: (x_2) => (stringHash(x_2) | 0),
    }) ? model.Tab : "Bonfire";
    const midColumn = HtmlHelper_createElement("div", ofArray([["id", "midColumn"], ["className", "column"], ["children", [HtmlHelper_createElement("div", ofArray([["className", "tabsContainer"], ["children", toList(delay(() => collect_1((matchValue_8) => {
        const t_5 = matchValue_8[1];
        let label_4;
        if (t_5 === "Village") {
            const patternInput_3 = villageTabLabel(s);
            const title_2 = patternInput_3[0];
            const free_1 = patternInput_3[1] | 0;
            label_4 = ((free_1 > 0) ? HtmlHelper_createElement("span", singleton_2(["children", [HtmlHelper_createElement("span", singleton_2(["children", singleton_2(title_2)])), HtmlHelper_createElement("span", ofArray([["className", "genericWarning"], ["children", singleton_2(("(" + int32ToString(free_1)) + ")")]]))]])) : HtmlHelper_createElement("span", singleton_2(["children", singleton_2(title_2)])));
        }
        else {
            label_4 = HtmlHelper_createElement("span", singleton_2(["children", singleton_2(get$_1("tab." + t_5))]));
        }
        return append(singleton_1(HtmlHelper_createElement("a", ofArray([["key", t_5], ["className", (t_5 === activeTab) ? (("tab " + t_5) + " activeTab") : ("tab " + t_5)], ["href", "#"], ["style", {
            whiteSpace: "nowrap",
        }], ["onClick", (_arg_14) => {
            dispatch(new Msg(/* SetTab */ 20, [t_5]));
        }], ["children", [label_4]]]))), delay(() => ((matchValue_8[0] < (length(visibleTabs) - 1)) ? singleton_1(HtmlHelper_createElement("span", ofArray([["key", "sep" + t_5], ["children", singleton_2(" | ")]]))) : empty())));
    }, indexed(visibleTabs))))]])), HtmlHelper_createElement("div", ofArray([["className", "tabInner " + activeTab], ["children", tabContent]]))]]]));
    const consoleRows = map((m_2) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(m_2.CmId)], ["className", "msg"], ["children", toList(delay(() => append(m_2.CmHasCal ? singleton_1(HtmlHelper_createElement("span", ofArray([["style", {
        color: "#ff7f50",
        marginRight: 8,
    }], ["children", singleton_2(((((("Y" + int32ToString(m_2.CmYear)) + " D") + int32ToString(m_2.CmDay)) + " ") + m_2.CmSeason) + " - ")]]))) : empty(), delay(() => singleton_1(HtmlHelper_createElement("span", singleton_2(["children", singleton_2(m_2.CmText)])))))))]])), s.ConsoleMsgs);
    const queueRows = mapIndexed((i_3, q) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(i_3) + q.QName], ["style", {
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", "link"], ["style", {
        paddingRight: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_15) => {
        dispatch(new Msg(/* QRemove */ 44, [i_3]));
    }], ["children", singleton_2("[x]")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2((((q.QName + " (") + q.QType) + ") x") + int32ToString(q.QValue))]))]]])), s.QueueItems);
    const rightColumn = HtmlHelper_createElement("div", ofArray([["id", "rightColumn"], ["className", "column"], ["style", {
        paddingLeft: 15,
        paddingRight: 15,
        width: 300,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("span", singleton_2(["id", "calendarSign"])), HtmlHelper_createElement("span", ofArray([["id", "calendarDiv"], ["children", singleton_2(calendarText(s))]]))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab-header"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("a", ofArray([["id", "logLink"], ["className", (model.RightTab === "Log") ? "active" : ""], ["href", "#"], ["onClick", (_arg_16) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Log"]));
    }], ["children", singleton_2("Log")]]))), delay(() => (tabVisible(s, "Queue") ? singleton_1(HtmlHelper_createElement("a", ofArray([["id", "queueLink"], ["className", "queueLink" + ((model.RightTab === "Queue") ? " active" : "")], ["href", "#"], ["onClick", (_arg_17) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Queue"]));
    }], ["children", singleton_2("Queue")]]))) : empty())))))]]))), delay(() => ((model.RightTab === "Queue") ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabQueue"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 6,
    }], ["children", singleton_2((("Queue " + int32ToString(queueLen)) + "/") + int32ToString(queueCap))]]))), delay(() => append(queueRows, delay(() => singleton_1(plainBtn("qhut", "Queue a Hut", () => {
        dispatch(new Msg(/* QAdd */ 43, ["hut", "buildings"]));
    }))))))))]]))) : singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabLog"], ["children", [HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("div", ofArray([["className", "console-intro"], ["style", {
        paddingTop: 10,
        borderTop: (((1 + "px ") + "solid") + " ") + "gray",
    }], ["children", singleton_2(get$_1("console.intro"))]])), HtmlHelper_createElement("span", ofArray([["id", "clearLog"], ["style", {
        paddingTop: 5,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "clearLogHref"], ["href", "#"], ["onClick", (_arg_18) => {
        dispatch(Msg.ClearConsole);
    }], ["children", singleton_2("Clear log")]]))]]]))]])), HtmlHelper_createElement("div", ofArray([["id", "gameLog"], ["style", {
        overflowY: "auto",
        paddingTop: 10,
        height: 100 + "%",
    }], ["children", consoleRows]]))]]]))))))))))]]));
    let tooltip;
    const matchValue_9 = model.Tooltip;
    if (matchValue_9 != null) {
        const y_3 = matchValue_9[1];
        const x_3 = matchValue_9[0];
        let tip_3;
        const src_1 = matchValue_9[2];
        const pricesTip = (desc, flavorKey, prices) => {
            let option_3, option_1, f;
            return new TipData(desc, (option_3 = ((option_1 = flavorKey, (option_1 != null) ? get$_1(option_1) : undefined)), (option_3 != null) ? (((f = option_3, (f !== "") && (f !== value_847(flavorKey)))) ? option_3 : undefined) : undefined), priceLines(s, false, prices));
        };
        switch (src_1.tag) {
            case 1: {
                const name_1 = src_1.fields[0];
                const row = find((t) => (t.Name === name_1), techRows(s));
                const effectDesc = get$_1(("tech." + name_1) + ".effectDesc");
                const desc_1 = get$_1(("tech." + name_1) + ".desc");
                tip_3 = pricesTip(((row.Researched && (effectDesc !== "")) && (effectDesc !== (("tech." + name_1) + ".effectDesc"))) ? ((((desc_1 + "<br>") + get$_1("res.effect")) + ": ") + effectDesc) : desc_1, ("tech." + name_1) + ".flavor", row.Prices);
                break;
            }
            case 2: {
                const name_2 = src_1.fields[0];
                tip_3 = pricesTip(get$_1(("up." + name_2) + ".desc"), ("up." + name_2) + ".flavor", find((u) => (u.Name === name_2), upgradeRows(s)).Prices);
                break;
            }
            case 3: {
                tip_3 = pricesTip(get$_1("bld.refineCatnip.desc"), undefined, singleton_2(new PriceRow("catnip", 100)));
                break;
            }
            case 4: {
                const name_3 = src_1.fields[0];
                const r_1 = find((r) => (r.Name === name_3), resRows(s));
                const patternInput_1 = productionBreakdown(s, name_3);
                const village = patternInput_1[1];
                const net = patternInput_1[2];
                const baseProd = patternInput_1[0];
                const line = (label, v_1) => ((((("<div>" + label) + ": ") + ((v_1 >= 0) ? "+" : "")) + fmtRes(v_1)) + "</div>");
                tip_3 = (new TipData((name_3 === "kittens") ? ((progress = s.Vpool.NextKittenProgress, (perTickKittens = (0.01 * (1 + getEffect(s, "kittenGrowthRatio"))), (((((("<div>[" + ((arg = (progress * 100), toText(printf("%.0f"))(arg)))) + "%]</div>") + "<div>") + get$_1("res.toNextKitten")) + ": ") + toDisplaySeconds((1 - progress) / (perTickKittens * 10))) + "</div>"))) : ((((baseProd !== 0) ? line(get$_1("res.stack.production"), baseProd) : "") + ((village !== 0) ? line(get$_1("res.stack.village"), village) : "")) + ((net < 0) ? (((("<div>" + get$_1("res.toZero")) + ": ") + toDisplaySeconds(r_1.Value / (-net * 10))) + "</div>") : ((((net > 0) && (r_1.Max > 0)) && (r_1.Value < r_1.Max)) ? (((("<div>" + get$_1("res.toCap")) + ": ") + toDisplaySeconds((r_1.Max - r_1.Value) / (net * 10))) + "</div>") : ""))), undefined, empty_1()));
                break;
            }
            case 7: {
                const name_4 = src_1.fields[0];
                const row_1 = find((c0) => (c0.Name === name_4), craftRows(s));
                const ratio = getResCraftRatio(s.Cache, crCtxFor(s), name_4);
                const bonus = (name_4 === "wood") ? 0 : (ratio - getEffect_1(s.Cache, "craftRatio"));
                const descKey = ("craft." + name_4) + ".desc";
                const baseDesc = get$_1(descKey);
                tip_3 = pricesTip((((baseDesc !== "") && (baseDesc !== descKey)) ? baseDesc : "") + ((bonus > 0) ? (("<br><br>Effectiveness bonus: +" + fmtRes(100 * bonus)) + "%") : ""), undefined, row_1.Prices);
                break;
            }
            case 6: {
                tip_3 = pricesTip(get$_1("village.btn.festival.desc"), undefined, ofArray([new PriceRow("manpower", 1500), new PriceRow("culture", 5000), new PriceRow("parchment", 2500)]));
                break;
            }
            case 5: {
                const name_5 = src_1.fields[0];
                const descKey_1 = ("job." + name_5) + ".desc";
                const flavorKey_1 = ("job." + name_5) + ".flavor";
                const desc_3 = get$_1(descKey_1);
                const flavor = get$_1(flavorKey_1);
                tip_3 = (new TipData(((desc_3 !== "") && (desc_3 !== descKey_1)) ? desc_3 : "", ((flavor !== "") && (flavor !== flavorKey_1)) ? flavor : undefined, empty_1()));
                break;
            }
            default: {
                const name = src_1.fields[0];
                const prices_1 = defaultArg((option_5 = tryFind_1((b) => (b.Name === name), buildingRows(s)), (option_5 != null) ? option_5.Prices : undefined), empty_1());
                tip_3 = pricesTip(get$_1(("bld." + name) + ".desc"), ("bld." + name) + ".flavor", prices_1);
            }
        }
        tooltip = (((tip_3.Desc === "") && isEmpty(tip_3.Prices)) ? defaultOf_1() : HtmlHelper_createElement("div", ofArray([["id", "tooltip"], ["className", "button_tooltip"], ["style", {
            top: y_3 + "px",
            left: x_3 + "px",
        }], ["children", toList(delay(() => append(((tip_3.Desc !== "") && (tip_3.Desc !== "-")) ? singleton_1(HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["className", "desc"]), delay(() => append((length(tip_3.Prices) > 0) ? singleton_1(["style", {
            borderBottom: (((1 + "px ") + "solid") + " ") + "gray",
            paddingBottom: 8,
        }]) : empty(), delay(() => singleton_1(["dangerouslySetInnerHTML", {
            __html: tip_3.Desc,
        }]))))))))) : empty(), delay(() => {
            const renderLine = (l) => HtmlHelper_createElement("div", ofArray([["key", ("price" + int32ToString(l.Indent)) + l.Title], ["className", "price-block"], ["style", {
                overflow: "hidden",
                clear: "both",
            }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("span", ofArray([["className", (l.Indent > 0) ? "rawRes" : ""], ["style", {
                float: "left",
                paddingRight: 10,
            }], ["children", singleton_2(replicate(l.Indent * 3, " ") + l.Title)]]))), delay(() => append(singleton_1(HtmlHelper_createElement("span", ofArray([["className", l.HasRes ? "" : "noRes"], ["style", {
                float: "right",
            }], ["children", singleton_2(l.DisplayValue)]]))), delay(() => map(renderLine, l.Children)))))))]]));
            return append(map_1(renderLine, tip_3.Prices), delay(() => {
                const matchValue_10 = tip_3.Flavor;
                if (matchValue_10 == null) {
                    return empty();
                }
                else {
                    const flavor_1 = matchValue_10;
                    return singleton_1(HtmlHelper_createElement("div", ofArray([["className", "flavor"], ["style", {
                        paddingTop: 20,
                        fontSize: 12 + "px",
                        fontStyle: "italic",
                    }], ["children", singleton_2(flavor_1)]])));
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
    }], ["onClick", (_arg_19) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_2("close")]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", [HtmlHelper_createElement("label", ofArray([["htmlFor", "notationSelector"], ["children", singleton_2("Notation:")]])), HtmlHelper_createElement("br", empty_1()), HtmlHelper_createElement("select", ofArray([["id", "notationSelector"], ["value", s.Opts.Notation], ["onChange", (ev_8) => {
        dispatch(new Msg(/* SetNotation */ 46, [ev_8.target.value]));
    }], ["children", toList(delay(() => map_1((n) => HtmlHelper_createElement("option", ofArray([["key", n], ["value", n], ["children", singleton_2(n)]])), ["si", "e", "sie"])))]]))]]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("label", singleton_2(["children", singleton_2(("Game speed: " + model.Speed.toString()) + "x")]))), delay(() => append(singleton_1(HtmlHelper_createElement("br", empty_1())), delay(() => map_1((mult) => HtmlHelper_createElement("button", ofArray([["key", mult.toString()], ["style", {
        marginRight: 6,
        cursor: "pointer",
    }], ["onClick", (_arg_20) => {
        dispatch(new Msg(/* SetSpeed */ 22, [mult]));
    }], ["children", singleton_2(mult.toString() + "x")]])), [1, 3, 10])))))))]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => map_1((o) => HtmlHelper_createElement("div", ofArray([["key", o.Name], ["style", {
        marginBottom: 2,
    }], ["children", [HtmlHelper_createElement("input", ofArray([["id", "opt." + o.Name], ["type", "checkbox"], ["checked", FSharpMap__get_Item(s.Opts.Bools, o.Name)], ["onChange", (ev_9) => {
        ev_9.target.checked;
        dispatch(new Msg(/* ToggleOption */ 45, [o.Name]));
    }]])), HtmlHelper_createElement("label", ofArray([["htmlFor", "opt." + o.Name], ["style", {
        marginLeft: 6,
        cursor: "pointer",
    }], ["children", singleton_2(o.Name)]]))]]])), settingsArr)))]])), HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Save"], ["onClick", (_arg_22) => {
        dispatch(Msg.SaveGame);
    }]])), HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Load"], ["style", {
        marginLeft: 8,
    }], ["onClick", (_arg_23) => {
        dispatch(Msg.LoadGame);
    }]]))]])), HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 12 + "px",
        marginTop: 8,
        color: "#666",
    }], (value_767 = "Save stores to this browser\'s localStorage under its own key - the original game\'s saves are untouched.", ["children", singleton_2(value_767)])]))]]]));
    const topBar = HtmlHelper_createElement("div", ofArray([["id", "topBar"], ["children", [HtmlHelper_createElement("div", ofArray([["style", {
        paddingLeft: 10,
        minWidth: 0,
        maxWidth: 400,
        overflow: "hidden",
        textOverflow: "ellipsis",
    }], ["children", [HtmlHelper_createElement("span", ofArray([["className", "gameTitle"], ["children", singleton_2("Kittens Game")]]))]]])), HtmlHelper_createElement("div", ofArray([["className", "links-block"], ["style", {
        paddingTop: 3,
        display: "inline-flex",
        paddingRight: 10,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "save-link"], ["href", "#"], ["onClick", (_arg_24) => {
        dispatch(Msg.SaveGame);
    }], ["children", singleton_2("Save")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "options-link"], ["href", "#"], ["onClick", (_arg_25) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_2("Options")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "reset-link"], ["href", "#"], ["onClick", (_arg_26) => {
        if (window.confirm("Are you sure you want to reset the game? All your progress will be lost.")) {
            dispatch(Msg.ResetGame);
        }
    }], ["children", singleton_2("Reset")]]))]]]))]]]));
    return HtmlHelper_createElement("div", ofArray([["id", "gamePageContainer"], ["children", toList(delay(() => append(singleton_1(topBar), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["id", "game"], ["children", [leftColumn, midColumn, rightColumn, tooltip]]]))), delay(() => append(singleton_1(optionsDialog), delay(() => ((model.Toast !== "") ? singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
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
    }], ["children", singleton_2(model.Toast)]]))) : empty())))))))))]]));
}

export function page(_shared, _route) {
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 48, [lm])));
}

