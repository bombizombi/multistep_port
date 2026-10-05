
import { Union, Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, int32_type, record_type, list_type, tuple_type, bool_type, float64_type, option_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { calendarText, tabVisible, buildingRows, challengeRows, timeRows, spaceRows, religionRows, raceRows, upgradeRows, techRows, jobRows, queueLength, queueCap as queueCap_1, kittenSummary, craftRows, resRows, getRes, tick, resetGame, setNotation, setBoolOption, removeFromQueue, addToQueue, consoleClear, applyLoaded, parseSave, buildSaveString, saveKey, setShowHiddenRes, toggleResHidden, toggleChallengePending, buyVSU, buyCFU, buySpaceBuilding, buyProgram, buyEmbassy, trade, buyZU, buyRU, praise, craftAll, craft, buyUpgrade, research, unassignJob, assignJob, buyBuilding, refineCatnip, gatherCatnip, init as init_1, State_$reflection } from "../KittensState.fs.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.fs.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.fs.js";
import { singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Async.js";
import { mapIndexed, indexed, length, contains, filter, empty as empty_1, collect, singleton as singleton_2, map, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { stringHash, int32ToString, defaultOf } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { FSharpMap__get_Item } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { join, printf, toText } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { get$ } from "../Game.Labels.fs.js";
import { defaultArg, value as value_582 } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { HtmlHelper_createElement } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/./Html.fs.js";
import { map as map_1, collect as collect_1, empty, singleton as singleton_1, append, delay, toList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { defaultOf as defaultOf_1 } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/../../../../src/Pages/../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { get$ as get$_1 } from "../Game/Game.Buildings.fs.js";
import { hasRes } from "../Game/Game.Resources.fs.js";
import { max } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
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
    return record_type("kittens_land.Pages.Page.TipData", [], TipData, () => [["Desc", string_type], ["Flavor", option_type(string_type)], ["Prices", list_type(tuple_type(string_type, float64_type, bool_type))]]);
}

export class Model extends Record {
    constructor(Tab, S, Speed, LoopGen, Toast, Tooltip, OptionsOpen, ResEditMode, RightTab) {
        super();
        this.Tab = Tab;
        this.S = S;
        this.Speed = Speed;
        this.LoopGen = (LoopGen | 0);
        this.Toast = Toast;
        this.Tooltip = Tooltip;
        this.OptionsOpen = OptionsOpen;
        this.ResEditMode = ResEditMode;
        this.RightTab = RightTab;
    }
}

export function Model_$reflection() {
    return record_type("kittens_land.Pages.Page.Model", [], Model, () => [["Tab", string_type], ["S", State_$reflection()], ["Speed", float64_type], ["LoopGen", int32_type], ["Toast", string_type], ["Tooltip", option_type(tuple_type(float64_type, float64_type, TipData_$reflection()))], ["OptionsOpen", bool_type], ["ResEditMode", bool_type], ["RightTab", string_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Tick", "Gather", "Refine", "Buy", "Assign", "Unassign", "Research", "Upgrade", "Craft", "CraftAll", "Praise", "BuyRU", "BuyZU", "Trade", "Embassy", "Mission", "SpaceBuy", "CFUBuy", "VSUBuy", "ChallengeToggle", "SetTab", "SetRightTab", "SetSpeed", "SetTip", "ToggleOptions", "ToggleResEditMode", "ToggleResHidden", "SetShowHiddenRes", "SaveGame", "LoadGame", "ClearConsole", "QAdd", "QRemove", "ToggleOption", "SetNotation", "ResetGame", "LayoutMsg"];
    }
    static Gather = new Msg(1, []);
    static Refine = new Msg(2, []);
    static Praise = new Msg(10, []);
    static ToggleOptions = new Msg(24, []);
    static ToggleResEditMode = new Msg(25, []);
    static SaveGame = new Msg(28, []);
    static LoadGame = new Msg(29, []);
    static ClearConsole = new Msg(30, []);
    static ResetGame = new Msg(35, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[["Item", int32_type]], [], [], [["Item", string_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item", string_type]], [["Item", string_type]], [["Item1", string_type], ["Item2", float64_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", float64_type]], [["Item", option_type(tuple_type(float64_type, float64_type, TipData_$reflection()))]], [], [], [["Item", string_type]], [["Item", bool_type]], [], [], [], [["Item1", string_type], ["Item2", string_type]], [["Item", int32_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", Msg_$reflection_1()]]]);
}

export function tickCmd(speed, gen) {
    return Command_ofAsync((g) => singleton.Delay(() => singleton.Bind(sleep(~~(100 / speed)), () => singleton.Return(g))), gen, (g_1) => (new Msg(/* Tick */ 0, [g_1])));
}

export function init() {
    return [new Model("Bonfire", init_1(), 1, 1, "", undefined, false, false, "Log"), Command_batch(ofArray([Command_none(), tickCmd(1, 1)]))];
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return [new Model(model.Tab, gatherCatnip(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        case 2:
            return [new Model(model.Tab, refineCatnip(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        case 3: {
            const name = msg.fields[0];
            return [new Model(model.Tab, buyBuilding(name, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 4: {
            const n = msg.fields[1] | 0;
            const job = msg.fields[0];
            return [new Model(model.Tab, assignJob(job, n, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 5: {
            const n_1 = msg.fields[1] | 0;
            const job_1 = msg.fields[0];
            return [new Model(model.Tab, unassignJob(job_1, n_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 6: {
            const name_1 = msg.fields[0];
            return [new Model(model.Tab, research(name_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 7: {
            const name_2 = msg.fields[0];
            return [new Model(model.Tab, buyUpgrade(name_2, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 8: {
            const name_3 = msg.fields[0];
            const amt = msg.fields[1];
            return [new Model(model.Tab, craft(name_3, amt, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 9: {
            const name_4 = msg.fields[0];
            return [new Model(model.Tab, craftAll(name_4, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 10:
            return [new Model(model.Tab, praise(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        case 11: {
            const name_5 = msg.fields[0];
            return [new Model(model.Tab, buyRU(name_5, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 12: {
            const name_6 = msg.fields[0];
            return [new Model(model.Tab, buyZU(name_6, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 13: {
            const race = msg.fields[0];
            return [new Model(model.Tab, trade(race, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 14: {
            const race_1 = msg.fields[0];
            return [new Model(model.Tab, buyEmbassy(race_1, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 15: {
            const name_7 = msg.fields[0];
            return [new Model(model.Tab, buyProgram(name_7, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 16: {
            const name_8 = msg.fields[0];
            return [new Model(model.Tab, buySpaceBuilding(name_8, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 17: {
            const name_9 = msg.fields[0];
            return [new Model(model.Tab, buyCFU(name_9, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 18: {
            const name_10 = msg.fields[0];
            return [new Model(model.Tab, buyVSU(name_10, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 19: {
            const name_11 = msg.fields[0];
            return [new Model(model.Tab, toggleChallengePending(name_11, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 20: {
            const tab = msg.fields[0];
            return [new Model(tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 21: {
            const tab_1 = msg.fields[0];
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, tab_1), Command_none()];
        }
        case 22: {
            const mult = msg.fields[0];
            return [new Model(model.Tab, model.S, mult, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 23: {
            const tip = msg.fields[0];
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, tip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 24:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, !model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        case 25:
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, !model.ResEditMode, model.RightTab), Command_none()];
        case 26: {
            const name_12 = msg.fields[0];
            return [new Model(model.Tab, toggleResHidden(name_12, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 27: {
            const v = msg.fields[0];
            return [new Model(model.Tab, setShowHiddenRes(v, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 28: {
            window.localStorage.setItem(saveKey, buildSaveString(model.S));
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Game saved", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 29: {
            const stored = window.localStorage.getItem(saveKey);
            if (stored === defaultOf()) {
                return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "No saved game found", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
            }
            else {
                const matchValue = parseSave(stored);
                if (matchValue == null) {
                    return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Load failed: unrecognizable save", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
                }
                else {
                    const loaded = matchValue;
                    return [new Model(model.Tab, applyLoaded(loaded, model.S), model.Speed, model.LoopGen + 1, "Game loaded", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
                }
            }
        }
        case 30:
            return [new Model(model.Tab, consoleClear(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        case 31: {
            const qtype = msg.fields[1];
            const name_13 = msg.fields[0];
            return [new Model(model.Tab, addToQueue(name_13, qtype, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 32: {
            const idx = msg.fields[0] | 0;
            return [new Model(model.Tab, removeFromQueue(idx, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 33: {
            const name_14 = msg.fields[0];
            return [new Model(model.Tab, setBoolOption(name_14, !FSharpMap__get_Item(model.S.Opts.Bools, name_14), model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 34: {
            const n_2 = msg.fields[0];
            return [new Model(model.Tab, setNotation(n_2, model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_none()];
        }
        case 35: {
            const s$0027 = resetGame(model.S);
            return [new Model("Bonfire", s$0027, model.Speed, model.LoopGen + 1, "Game reset", model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
        }
        case 36:
            return [model, Command_none()];
        default: {
            const gen = msg.fields[0] | 0;
            if (gen === model.LoopGen) {
                return [new Model(model.Tab, tick(model.S), model.Speed, model.LoopGen, model.Toast, model.Tooltip, model.OptionsOpen, model.ResEditMode, model.RightTab), tickCmd(model.Speed, gen)];
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
    let option_5, value_502;
    const s = model.S;
    const cal = s.Calendar;
    const fmtSigned = (v) => (((v > 0) ? "+" : "") + fmt(v));
    const gameLeft = () => {
        const rect = document.getElementById("game").getBoundingClientRect();
        return [rect.left, rect.top];
    };
    const tipHandlers = (tip) => ofArray([["onMouseEnter", (ev) => {
        const patternInput = gameLeft();
        const gt = patternInput[1];
        const gl = patternInput[0];
        dispatch(new Msg(/* SetTip */ 23, [[(ev.clientX - gl) + 12, (ev.clientY - gt) + 12, tip]]));
    }], ["onMouseLeave", (_arg) => {
        dispatch(new Msg(/* SetTip */ 23, [undefined]));
    }]]);
    const pricesTip = (desc, flavorKey, prices) => {
        let option_3, option_1, f;
        return new TipData(desc, (option_3 = ((option_1 = flavorKey, (option_1 != null) ? get$(option_1) : undefined)), (option_3 != null) ? (((f = option_3, (f !== "") && (f !== value_582(flavorKey)))) ? option_3 : undefined) : undefined), map((p) => [get$("res." + p.Resource), p.Val, getRes(s.Pool, p.Resource) >= p.Val], prices));
    };
    const bldTip = (name, prices_1) => pricesTip(get$(("bld." + name) + ".desc"), ("bld." + name) + ".flavor", prices_1);
    const modernBtn = (key_3, label, amtText, enabled, tip_1, onClick) => HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["key", key_3]), delay(() => append(singleton_1(["className", enabled ? "btn nosel modern" : "btn nosel modern disabled"]), delay(() => append(singleton_1(["style", {
        position: "relative",
        display: "inline-block",
        marginRight: 8,
        marginBottom: 8,
    }]), delay(() => append(singleton_1(["tabIndex", 0]), delay(() => append((tip_1 != null) ? tipHandlers(value_582(tip_1)) : empty(), delay(() => append(singleton_1(["onClick", (_arg_1) => {
        if (enabled) {
            onClick();
        }
    }]), delay(() => singleton_1(["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "label"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "label-content"], ["children", singleton_2(label)]]))]]]))), delay(() => ((amtText !== "") ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "amt"], ["children", singleton_2(amtText)]]))) : empty())))))]]))]]]))]]))))))))))))))));
    const plainBtn = (key_24, label_1, onClick_1) => HtmlHelper_createElement("div", ofArray([["key", key_24], ["className", "btn nosel"], ["style", {
        display: "inline-block",
        marginBottom: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_2) => {
        onClick_1();
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "btnContent"], ["children", [HtmlHelper_createElement("span", ofArray([["className", "btnTitle"], ["children", singleton_2(label_1)]]))]]]))]]]));
    const resRow = (r) => {
        if (!r.Show) {
            return defaultOf_1();
        }
        else if ((r.Hidden && !model.ResEditMode) && !s.ShowHiddenRes) {
            return defaultOf_1();
        }
        else {
            const perTick = (r.PerTick !== 0) ? fmtSigned(r.PerTick) : "";
            return HtmlHelper_createElement("div", ofArray([["key", r.Name], ["role", join(" ", ["row"])], ["className", ("res-row resource_" + r.Name) + (r.Hidden ? " hidden" : "")], ["children", toList(delay(() => append(model.ResEditMode ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", !r.Hidden], ["title", "Toggle " + r.Title], ["style", {
                display: "inline-block",
            }], ["onChange", (ev_1) => {
                ev_1.target.checked;
                dispatch(new Msg(/* ToggleResHidden */ 26, [r.Name]));
            }]]))]]]))) : empty(), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell resource-name"], ["title", (((r.Title + " ") + fmt(r.Value)) + " ") + perTick], ["children", singleton_2(r.Title)]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell resAmount"], ["children", singleton_2(fmt(r.Value))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell maxRes"], ["children", singleton_2((r.Max > 0) ? ("/" + fmt(r.Max)) : "")]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-cell resPerTick"], ["children", singleton_2(perTick)]]))), delay(() => singleton_1(HtmlHelper_createElement("div", singleton_2(["className", "res-cell"])))))))))))))))]]));
        }
    };
    const workshopBuilt = defaultArg((option_5 = get$_1(s.Bpool, "workshop"), (option_5 != null) ? option_5.On : undefined), 0) > 0;
    const craftRow = (c) => {
        const shortcut = (amount, labelText, cssClass) => {
            const canCraft = hasRes(s.Pool, map((p_1) => [p_1.Resource, p_1.Val * amount], c.Prices), 0);
            if (!canCraft) {
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
    };
    const leftColumn = HtmlHelper_createElement("div", ofArray([["id", "leftColumn"], ["className", "column"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginTop: 15,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-toolbar right"], ["style", {
        textAlign: "right",
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", model.ResEditMode ? "link toggled" : "link"], ["title", "Resource settings"], ["href", "#"], ["onClick", (_arg_6) => {
        dispatch(Msg.ToggleResEditMode);
    }], ["children", [HtmlHelper_createElement("div", singleton_2(["className", "svg-icon gear"]))]]]))]]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-table"], ["role", join(" ", ["grid"])], ["children", map(resRow, resRows(s))]]))), delay(() => (model.ResEditMode ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "res-toggle-hidden"], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", s.ShowHiddenRes], ["onChange", (ev_2) => {
        dispatch(new Msg(/* SetShowHiddenRes */ 27, [ev_2.target.checked]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_2("show hidden resources")]]))]]]))) : empty())))))))]]))), delay(() => (workshopBuilt ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "sidebar-section"], ["style", {
        marginTop: 15,
    }], ["children", [HtmlHelper_createElement("div", ofArray([["className", "res-table craftTable"], ["children", map(craftRow, craftRows(s))]]))]]]))) : empty())))))]]));
    const patternInput_1 = kittenSummary(s);
    const maxKittens = patternInput_1[1] | 0;
    const kittens = patternInput_1[0] | 0;
    const happiness = patternInput_1[2];
    const queueCap = queueCap_1(s) | 0;
    const queueLen = queueLength(s) | 0;
    const buildingRow = (b_1) => modernBtn("bld." + b_1.Name, b_1.Label, (b_1.Val > 0) ? (("(" + int32ToString(b_1.Val)) + ")") : "", b_1.Enabled, bldTip(b_1.Name, b_1.Prices), () => {
        dispatch(new Msg(/* Buy */ 3, [b_1.Name]));
    });
    const techRow = (t) => modernBtn("tech." + t.Name, t.Label, "", t.Enabled, pricesTip(get$(("tech." + t.Name) + ".desc"), ("tech." + t.Name) + ".flavor", t.Prices), () => {
        dispatch(new Msg(/* Research */ 6, [t.Name]));
    });
    const upgradeRow = (u) => modernBtn("up." + u.Name, u.Label, "", u.Enabled, pricesTip(get$(("up." + u.Name) + ".desc"), ("up." + u.Name) + ".flavor", u.Prices), () => {
        dispatch(new Msg(/* Upgrade */ 7, [u.Name]));
    });
    const jobRow = (j) => {
        if (!j.Unlocked) {
            return defaultOf_1();
        }
        else {
            return HtmlHelper_createElement("div", ofArray([["key", j.Name], ["style", {
                marginBottom: 4,
            }], ["children", [HtmlHelper_createElement("a", ofArray([["className", "link"], ["style", {
                paddingRight: 8,
                cursor: "pointer",
            }], ["onClick", (_arg_7) => {
                dispatch(new Msg(/* Unassign */ 5, [j.Name, 1]));
            }], ["children", singleton_2("-")]])), HtmlHelper_createElement("a", ofArray([["className", "link"], ["style", {
                paddingRight: 8,
                cursor: "pointer",
            }], ["onClick", (_arg_8) => {
                dispatch(new Msg(/* Assign */ 4, [j.Name, 1]));
            }], ["children", singleton_2("+")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2(((j.Label + " (") + int32ToString(j.Assigned)) + ")")]))]]]));
        }
    };
    let tabContent;
    const matchValue = model.Tab;
    tabContent = ((matchValue === "Village") ? toList(delay(() => {
        let arg;
        return append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            marginBottom: 10,
        }], ["children", singleton_2((((("Kittens: " + int32ToString(kittens)) + "/") + int32ToString(maxKittens)) + " - happiness: ") + ((arg = (happiness * 100), toText(printf("%.0f%%"))(arg))))]]))), delay(() => map(jobRow, jobRows(s))));
    })) : ((matchValue === "Science") ? map(techRow, techRows(s)) : ((matchValue === "Workshop") ? map(upgradeRow, upgradeRows(s)) : ((matchValue === "Trade") ? collect((r_1) => ofArray([modernBtn("race." + r_1.Name, "Trade with " + r_1.Label, "", r_1.Tradeable, undefined, () => {
        dispatch(new Msg(/* Trade */ 13, [r_1.Name]));
    }), modernBtn("emb." + r_1.Name, "Embassy of " + r_1.Label, ("(" + int32ToString(r_1.EmbassyLevel)) + ")", r_1.Tradeable, undefined, () => {
        dispatch(new Msg(/* Embassy */ 14, [r_1.Name]));
    })]), raceRows(s)) : ((matchValue === "Religion") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_2((("Faith: " + fmt(getRes(s.Pool, "faith"))) + " - worship: ") + toText(printf("%.1f"))(s.Rpool.Faith))]]))), delay(() => append(singleton_1(plainBtn("praise", "Praise the sun!", () => {
        dispatch(Msg.Praise);
    })), delay(() => map((r_2) => modernBtn("rel." + r_2.Name, r_2.Label, (r_2.Val > 0) ? (("(" + int32ToString(r_2.Val)) + ")") : "", r_2.Enabled, undefined, () => {
        if (r_2.Kind === "zu") {
            dispatch(new Msg(/* BuyZU */ 12, [r_2.Name]));
        }
        else {
            dispatch(new Msg(/* BuyRU */ 11, [r_2.Name]));
        }
    }), religionRows(s)))))))) : ((matchValue === "Space") ? map((r_3) => modernBtn("sp." + r_3.Name, r_3.Label, (r_3.Val > 0) ? (("(" + int32ToString(r_3.Val)) + ")") : "", r_3.Enabled, undefined, () => {
        if (r_3.Kind === "mission") {
            dispatch(new Msg(/* Mission */ 15, [r_3.Name]));
        }
        else {
            dispatch(new Msg(/* SpaceBuy */ 16, [r_3.Name]));
        }
    }), spaceRows(s)) : ((matchValue === "Time") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", singleton_2((("Temporal flux: " + fmt(s.Tpool.Flux)) + " - heat: ") + fmt(s.Tpool.Heat))]]))), delay(() => map((r_4) => modernBtn("t." + r_4.Name, r_4.Label, (r_4.Val > 0) ? (("(" + int32ToString(r_4.Val)) + ")") : "", r_4.Enabled, undefined, () => {
        if (r_4.Kind === "cfu") {
            dispatch(new Msg(/* CFUBuy */ 17, [r_4.Name]));
        }
        else {
            dispatch(new Msg(/* VSUBuy */ 18, [r_4.Name]));
        }
    }), timeRows(s)))))) : ((matchValue === "Challenges") ? map((c_1) => {
        const action = c_1.Pending ? "Unmark" : (c_1.Active ? "Active!" : (c_1.Researched ? "Completed" : "Mark"));
        return modernBtn("ch." + c_1.Name, c_1.Label, action, !c_1.Researched, undefined, () => {
            dispatch(new Msg(/* ChallengeToggle */ 19, [c_1.Name]));
        });
    }, challengeRows(s)) : toList(delay(() => append(singleton_1(modernBtn("gather", get$("bld.gatherCatnip"), "", true, new TipData(get$("bld.gatherCatnip.desc"), undefined, empty_1()), () => {
        dispatch(Msg.Gather);
    })), delay(() => {
        const refinePrice = 100;
        return append(singleton_1(modernBtn("refine", get$("bld.refineCatnip"), "", getRes(s.Pool, "catnip") >= refinePrice, new TipData(get$("bld.refineCatnip.desc"), undefined, singleton_2([get$("res.catnip"), refinePrice, getRes(s.Pool, "catnip") >= refinePrice])), () => {
            dispatch(Msg.Refine);
        })), delay(() => map(buildingRow, buildingRows(s))));
    }))))))))))));
    const midTabIds = ofArray(["Bonfire", "Village", "Science", "Workshop", "Trade", "Religion", "Space", "Time", "Challenges"]);
    const visibleTabs = filter((tabId) => tabVisible(s, tabId), midTabIds);
    const activeTab = contains(model.Tab, visibleTabs, {
        Equals: (x, y) => (x === y),
        GetHashCode: (x) => (stringHash(x) | 0),
    }) ? model.Tab : "Bonfire";
    const midColumn = HtmlHelper_createElement("div", ofArray([["id", "midColumn"], ["className", "column"], ["children", [HtmlHelper_createElement("div", ofArray([["className", "tabsContainer"], ["children", toList(delay(() => collect_1((matchValue_1) => {
        const t_1 = matchValue_1[1];
        const i = matchValue_1[0] | 0;
        return append(singleton_1(HtmlHelper_createElement("a", ofArray([["key", t_1], ["className", (t_1 === activeTab) ? (("tab " + t_1) + " activeTab") : ("tab " + t_1)], ["href", "#"], ["style", {
            whiteSpace: "nowrap",
        }], ["onClick", (_arg_9) => {
            dispatch(new Msg(/* SetTab */ 20, [t_1]));
        }], ["children", singleton_2(get$("tab." + t_1))]]))), delay(() => ((i < (length(visibleTabs) - 1)) ? singleton_1(HtmlHelper_createElement("span", ofArray([["key", "sep" + t_1], ["children", singleton_2(" | ")]]))) : empty())));
    }, indexed(visibleTabs))))]])), HtmlHelper_createElement("div", ofArray([["className", "tabInner " + activeTab], ["children", tabContent]]))]]]));
    const consoleRows = map((m) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(m.CmId)], ["className", "msg"], ["children", toList(delay(() => append(m.CmHasCal ? singleton_1(HtmlHelper_createElement("span", ofArray([["style", {
        color: "#ff7f50",
        marginRight: 8,
    }], ["children", singleton_2(((((("Y" + int32ToString(m.CmYear)) + " D") + int32ToString(m.CmDay)) + " ") + m.CmSeason) + " - ")]]))) : empty(), delay(() => singleton_1(HtmlHelper_createElement("span", singleton_2(["children", singleton_2(m.CmText)])))))))]])), s.ConsoleMsgs);
    const queueRows = mapIndexed((i_1, q) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(i_1) + q.QName], ["style", {
        marginBottom: 4,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["className", "link"], ["style", {
        paddingRight: 8,
        cursor: "pointer",
    }], ["onClick", (_arg_10) => {
        dispatch(new Msg(/* QRemove */ 32, [i_1]));
    }], ["children", singleton_2("[x]")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2((((q.QName + " (") + q.QType) + ") x") + int32ToString(q.QValue))]))]]])), s.QueueItems);
    const rightColumn = HtmlHelper_createElement("div", ofArray([["id", "rightColumn"], ["className", "column"], ["style", {
        paddingLeft: 15,
        paddingRight: 15,
        width: 300,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("span", singleton_2(["id", "calendarSign"])), HtmlHelper_createElement("span", ofArray([["id", "calendarDiv"], ["children", singleton_2(calendarText(s))]]))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab-header"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("a", ofArray([["id", "logLink"], ["className", (model.RightTab === "Log") ? "active" : ""], ["href", "#"], ["onClick", (_arg_11) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Log"]));
    }], ["children", singleton_2("Log")]]))), delay(() => (tabVisible(s, "Queue") ? singleton_1(HtmlHelper_createElement("a", ofArray([["id", "queueLink"], ["className", "queueLink" + ((model.RightTab === "Queue") ? " active" : "")], ["href", "#"], ["onClick", (_arg_12) => {
        dispatch(new Msg(/* SetRightTab */ 21, ["Queue"]));
    }], ["children", singleton_2("Queue")]]))) : empty())))))]]))), delay(() => ((model.RightTab === "Queue") ? singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabQueue"], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 6,
    }], ["children", singleton_2((("Queue " + int32ToString(queueLen)) + "/") + int32ToString(queueCap))]]))), delay(() => append(queueRows, delay(() => singleton_1(plainBtn("qhut", "Queue a Hut", () => {
        dispatch(new Msg(/* QAdd */ 31, ["hut", "buildings"]));
    }))))))))]]))) : singleton_1(HtmlHelper_createElement("div", ofArray([["className", "right-tab"], ["id", "rightTabLog"], ["children", [HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("div", ofArray([["className", "console-intro"], ["style", {
        paddingTop: 10,
        borderTop: (((1 + "px ") + "solid") + " ") + "gray",
    }], ["children", singleton_2(get$("console.intro"))]])), HtmlHelper_createElement("span", ofArray([["id", "clearLog"], ["style", {
        paddingTop: 5,
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "clearLogHref"], ["href", "#"], ["onClick", (_arg_13) => {
        dispatch(Msg.ClearConsole);
    }], ["children", singleton_2("Clear log")]]))]]]))]])), HtmlHelper_createElement("div", ofArray([["id", "gameLog"], ["style", {
        overflowY: "auto",
        paddingTop: 10,
        height: 100 + "%",
    }], ["children", consoleRows]]))]]]))))))))))]]));
    let tooltip;
    const matchValue_2 = model.Tooltip;
    if (matchValue_2 != null) {
        const y_1 = matchValue_2[1];
        const x_1 = matchValue_2[0];
        const tip_2 = matchValue_2[2];
        tooltip = HtmlHelper_createElement("div", ofArray([["id", "tooltip"], ["className", "button_tooltip"], ["style", {
            top: y_1 + "px",
            left: x_1 + "px",
        }], ["children", toList(delay(() => append(((tip_2.Desc !== "") && (tip_2.Desc !== "-")) ? singleton_1(HtmlHelper_createElement("div", toList(delay(() => append(singleton_1(["className", "desc"]), delay(() => append((length(tip_2.Prices) > 0) ? singleton_1(["style", {
            borderBottom: (((1 + "px ") + "solid") + " ") + "gray",
            paddingBottom: 8,
        }]) : empty(), delay(() => singleton_1(["dangerouslySetInnerHTML", {
            __html: tip_2.Desc,
        }]))))))))) : empty(), delay(() => append(collect_1((matchValue_3) => {
            const v_2 = matchValue_3[1][1];
            const title = matchValue_3[1][0];
            const ok = matchValue_3[1][2];
            const i_2 = matchValue_3[0] | 0;
            return singleton_1(HtmlHelper_createElement("div", ofArray([["key", "price" + int32ToString(i_2)], ["className", "price-block"], ["style", {
                overflow: "hidden",
                clear: "both",
            }], ["children", [HtmlHelper_createElement("span", ofArray([["style", {
                float: "left",
                paddingRight: 10,
            }], ["children", singleton_2(title)]])), HtmlHelper_createElement("span", ofArray([["className", ok ? "" : "noRes"], ["style", {
                float: "right",
            }], ["children", singleton_2(fmt(v_2))]]))]]])));
        }, indexed(tip_2.Prices)), delay(() => {
            const matchValue_4 = tip_2.Flavor;
            if (matchValue_4 == null) {
                return empty();
            }
            else {
                const flavor = matchValue_4;
                return singleton_1(HtmlHelper_createElement("div", ofArray([["className", "flavor"], ["style", {
                    paddingTop: 20,
                    fontSize: 12 + "px",
                    fontStyle: "italic",
                }], ["children", singleton_2(flavor)]])));
            }
        }))))))]]));
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
    }], ["onClick", (_arg_14) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_2("close")]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", [HtmlHelper_createElement("label", ofArray([["htmlFor", "notationSelector"], ["children", singleton_2("Notation:")]])), HtmlHelper_createElement("br", empty_1()), HtmlHelper_createElement("select", ofArray([["id", "notationSelector"], ["value", s.Opts.Notation], ["onChange", (ev_3) => {
        dispatch(new Msg(/* SetNotation */ 34, [ev_3.target.value]));
    }], ["children", toList(delay(() => map_1((n) => HtmlHelper_createElement("option", ofArray([["key", n], ["value", n], ["children", singleton_2(n)]])), ["si", "e", "sie"])))]]))]]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => {
        HtmlHelper_createElement("label", singleton_2(["children", singleton_2(("Game speed: " + model.Speed.toString()) + "x")]));
        HtmlHelper_createElement("br", empty_1());
        return map_1((mult) => HtmlHelper_createElement("button", ofArray([["key", mult.toString()], ["style", {
            marginRight: 6,
            cursor: "pointer",
        }], ["onClick", (_arg_15) => {
            dispatch(new Msg(/* SetSpeed */ 22, [mult]));
        }], ["children", singleton_2(mult.toString() + "x")]])), [1, 3, 10]);
    }))]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 10,
    }], ["children", toList(delay(() => map_1((o) => HtmlHelper_createElement("div", ofArray([["key", o.Name], ["style", {
        marginBottom: 2,
    }], ["children", [HtmlHelper_createElement("input", ofArray([["type", "checkbox"], ["checked", FSharpMap__get_Item(s.Opts.Bools, o.Name)], ["onChange", (ev_4) => {
        ev_4.target.checked;
        dispatch(new Msg(/* ToggleOption */ 33, [o.Name]));
    }]])), HtmlHelper_createElement("label", ofArray([["style", {
        marginLeft: 6,
    }], ["children", singleton_2(o.Name)]]))]]])), settingsArr)))]])), HtmlHelper_createElement("div", singleton_2(["children", [HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Save"], ["onClick", (_arg_17) => {
        dispatch(Msg.SaveGame);
    }]])), HtmlHelper_createElement("input", ofArray([["type", "button"], ["value", "Load"], ["style", {
        marginLeft: 8,
    }], ["onClick", (_arg_18) => {
        dispatch(Msg.LoadGame);
    }]]))]])), HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 12 + "px",
        marginTop: 8,
        color: "#666",
    }], (value_502 = "Save stores to this browser\'s localStorage under its own key - the original game\'s saves are untouched.", ["children", singleton_2(value_502)])]))]]]));
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
    }], ["children", [HtmlHelper_createElement("a", ofArray([["id", "save-link"], ["href", "#"], ["onClick", (_arg_19) => {
        dispatch(Msg.SaveGame);
    }], ["children", singleton_2("Save")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "options-link"], ["href", "#"], ["onClick", (_arg_20) => {
        dispatch(Msg.ToggleOptions);
    }], ["children", singleton_2("Options")]])), HtmlHelper_createElement("span", singleton_2(["children", singleton_2(" | ")])), HtmlHelper_createElement("a", ofArray([["id", "reset-link"], ["href", "#"], ["onClick", (_arg_21) => {
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
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 36, [lm])));
}

