
import { Union, Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, record_type, int32_type, float64_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { buildingRows, challengeRows, timeRows, spaceRows, religionRows, getRes, raceRows, craftRows, upgradeRows, techRows, jobRows, queueLength, queueCap as queueCap_1, kittenSummary, resRows, tick, resetGame, setNotation, setBoolOption, removeFromQueue, addToQueue, consoleClear, applyLoaded, parseSave, buildSaveString, saveKey, toggleChallengePending, buyVSU, buyCFU, buySpaceBuilding, buyProgram, buyEmbassy, trade, buyZU, buyRU, praise, craftAll, craft, buyUpgrade, research, unassignJob, assignJob, buyBuilding, gatherCatnip, init as init_1, State_$reflection } from "../KittensState.fs.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.fs.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.fs.js";
import { singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Async.js";
import { item, append as append_1, mapIndexed, singleton as singleton_2, map, filter, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { createObj, int32ToString, defaultOf } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { FSharpMap__get_Item } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { join, printf, toText } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { HtmlHelper_createElement } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/./Html.fs.js";
import { map as map_1, empty, singleton as singleton_1, append, delay, toList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { settingsArr } from "../Game/Game.Settings.fs.js";
import { seasons } from "../Game/Game.Calendar.fs.js";
import { Page_from } from "../../.elmish-land/Base/Page.fs.js";

export class Model extends Record {
    constructor(Tab, S, Speed, LoopGen, Toast) {
        super();
        this.Tab = Tab;
        this.S = S;
        this.Speed = Speed;
        this.LoopGen = (LoopGen | 0);
        this.Toast = Toast;
    }
}

export function Model_$reflection() {
    return record_type("kittens_land.Pages.Page.Model", [], Model, () => [["Tab", string_type], ["S", State_$reflection()], ["Speed", float64_type], ["LoopGen", int32_type], ["Toast", string_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Tick", "Gather", "Buy", "Assign", "Unassign", "Research", "Upgrade", "CraftOne", "CraftAll", "Praise", "BuyRU", "BuyZU", "Trade", "Embassy", "Mission", "SpaceBuy", "CFUBuy", "VSUBuy", "ChallengeToggle", "SetTab", "SetSpeed", "SaveGame", "LoadGame", "ClearConsole", "QAdd", "QRemove", "ToggleOption", "SetNotation", "ResetGame", "LayoutMsg"];
    }
    static Gather = new Msg(1, []);
    static Praise = new Msg(9, []);
    static SaveGame = new Msg(21, []);
    static LoadGame = new Msg(22, []);
    static ClearConsole = new Msg(23, []);
    static ResetGame = new Msg(28, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[["Item", int32_type]], [], [["Item", string_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", float64_type]], [], [], [], [["Item1", string_type], ["Item2", string_type]], [["Item", int32_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", Msg_$reflection_1()]]]);
}

export function tickCmd(speed, gen) {
    return Command_ofAsync((g) => singleton.Delay(() => singleton.Bind(sleep(~~(100 / speed)), () => singleton.Return(g))), gen, (g_1) => (new Msg(/* Tick */ 0, [g_1])));
}

export function init() {
    return [new Model("Bonfire", init_1(), 1, 1, ""), Command_batch(ofArray([Command_none(), tickCmd(1, 1)]))];
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return [new Model(model.Tab, gatherCatnip(model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        case 2: {
            const name = msg.fields[0];
            return [new Model(model.Tab, buyBuilding(name, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 3: {
            const n = msg.fields[1] | 0;
            const job = msg.fields[0];
            return [new Model(model.Tab, assignJob(job, n, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 4: {
            const n_1 = msg.fields[1] | 0;
            const job_1 = msg.fields[0];
            return [new Model(model.Tab, unassignJob(job_1, n_1, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 5: {
            const name_1 = msg.fields[0];
            return [new Model(model.Tab, research(name_1, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 6: {
            const name_2 = msg.fields[0];
            return [new Model(model.Tab, buyUpgrade(name_2, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 7: {
            const name_3 = msg.fields[0];
            return [new Model(model.Tab, craft(name_3, 1, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 8: {
            const name_4 = msg.fields[0];
            return [new Model(model.Tab, craftAll(name_4, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 9:
            return [new Model(model.Tab, praise(model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        case 10: {
            const name_5 = msg.fields[0];
            return [new Model(model.Tab, buyRU(name_5, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 11: {
            const name_6 = msg.fields[0];
            return [new Model(model.Tab, buyZU(name_6, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 12: {
            const race = msg.fields[0];
            return [new Model(model.Tab, trade(race, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 13: {
            const race_1 = msg.fields[0];
            return [new Model(model.Tab, buyEmbassy(race_1, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 14: {
            const name_7 = msg.fields[0];
            return [new Model(model.Tab, buyProgram(name_7, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 15: {
            const name_8 = msg.fields[0];
            return [new Model(model.Tab, buySpaceBuilding(name_8, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 16: {
            const name_9 = msg.fields[0];
            return [new Model(model.Tab, buyCFU(name_9, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 17: {
            const name_10 = msg.fields[0];
            return [new Model(model.Tab, buyVSU(name_10, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 18: {
            const name_11 = msg.fields[0];
            return [new Model(model.Tab, toggleChallengePending(name_11, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 19: {
            const tab = msg.fields[0];
            return [new Model(tab, model.S, model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 20: {
            const mult = msg.fields[0];
            return [new Model(model.Tab, model.S, mult, model.LoopGen, model.Toast), Command_none()];
        }
        case 21: {
            window.localStorage.setItem(saveKey, buildSaveString(model.S));
            return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Game saved"), Command_none()];
        }
        case 22: {
            const stored = window.localStorage.getItem(saveKey);
            if (stored === defaultOf()) {
                return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "No saved game found"), Command_none()];
            }
            else {
                const matchValue = parseSave(stored);
                if (matchValue == null) {
                    return [new Model(model.Tab, model.S, model.Speed, model.LoopGen, "Load failed: unrecognizable save"), Command_none()];
                }
                else {
                    const loaded = matchValue;
                    return [new Model(model.Tab, applyLoaded(loaded, model.S), model.Speed, model.LoopGen + 1, "Game loaded"), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
                }
            }
        }
        case 23:
            return [new Model(model.Tab, consoleClear(model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        case 24: {
            const qtype = msg.fields[1];
            const name_12 = msg.fields[0];
            return [new Model(model.Tab, addToQueue(name_12, qtype, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 25: {
            const idx = msg.fields[0] | 0;
            return [new Model(model.Tab, removeFromQueue(idx, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 26: {
            const name_13 = msg.fields[0];
            return [new Model(model.Tab, setBoolOption(name_13, !FSharpMap__get_Item(model.S.Opts.Bools, name_13), model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 27: {
            const n_2 = msg.fields[0];
            return [new Model(model.Tab, setNotation(n_2, model.S), model.Speed, model.LoopGen, model.Toast), Command_none()];
        }
        case 28: {
            const s$0027 = resetGame(model.S);
            return [new Model(model.Tab, s$0027, model.Speed, model.LoopGen + 1, "Game reset"), Command_batch(ofArray([Command_none(), tickCmd(model.Speed, model.LoopGen + 1)]))];
        }
        case 29:
            return [model, Command_none()];
        default: {
            const gen = msg.fields[0] | 0;
            if (gen === model.LoopGen) {
                return [new Model(model.Tab, tick(model.S), model.Speed, model.LoopGen, model.Toast), tickCmd(model.Speed, gen)];
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
    const s = model.S;
    const rows = filter((r) => r.Show, resRows(s));
    const cal = s.Calendar;
    const tabStyle = (active) => ofArray([["paddingTop", 4], ["paddingBottom", 4], ["paddingLeft", 14], ["paddingRight", 14], ["marginRight", 6], ["fontFamily", "monospace"], ["fontSize", 14 + "px"], ["cursor", "pointer"], ["border", (((1 + "px ") + "solid") + " ") + "#6a5830"], ["backgroundColor", active ? "#6a5830" : "#3a2f18"], ["color", "#e8e0c8"]]);
    const btnStyle = (enabled) => ofArray([["paddingTop", 4], ["paddingBottom", 4], ["paddingLeft", 12], ["paddingRight", 12], ["fontFamily", "monospace"], ["fontSize", 13 + "px"], ["backgroundColor", "#3a2f18"], ["color", "#e8e0c8"], ["border", (((1 + "px ") + "solid") + " ") + "#6a5830"], ["cursor", enabled ? "pointer" : "default"]]);
    const priceText = (prices) => join("; ", map((p0) => ((p0.Resource + " ") + fmt(p0.Val)), prices));
    const buyRow = (label, btnText, enabled_1, valText, priceText_1, key_21, act) => HtmlHelper_createElement("div", ofArray([["key", key_21], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: enabled_1 ? 1 : 0.45,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(enabled_1))], ["disabled", !enabled_1], ["onClick", (_arg) => {
        dispatch(act);
    }], ["children", singleton_2(btnText)]]))), delay(() => append(singleton_1(HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 220,
    }], ["children", singleton_2(label + valText)]]))), delay(() => ((priceText_1 !== "") ? singleton_1(HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_2(priceText_1)]]))) : empty())))))))]]));
    const resRow = (r_1) => HtmlHelper_createElement("div", ofArray([["key", r_1.Name], ["style", {
        fontSize: 14 + "px",
    }], ["children", singleton_2(((r_1.Name + ": ") + fmt(r_1.Value)) + (((r_1.Max > 0) && (r_1.Max < 1000000)) ? ("/" + fmt(r_1.Max)) : ""))]]));
    const buildingRow = (b) => HtmlHelper_createElement("div", ofArray([["key", b.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: b.Enabled ? 1 : 0.45,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(b.Enabled))], ["disabled", !b.Enabled], ["onClick", (_arg_1) => {
        dispatch(new Msg(/* Buy */ 2, [b.Name]));
    }], ["children", singleton_2(b.Label + ((b.Val > 0) ? ((" (" + int32ToString(b.Val)) + ")") : ""))]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_2(priceText(b.Prices))]]))]]]));
    const jobRow = (j) => HtmlHelper_createElement("div", ofArray([["key", j.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 8 + "px ",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(j.Assigned > 0))], ["disabled", j.Assigned === 0], ["onClick", (_arg_2) => {
        dispatch(new Msg(/* Unassign */ 4, [j.Name, 1]));
    }], ["children", singleton_2("-")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_3) => {
        dispatch(new Msg(/* Assign */ 3, [j.Name, 1]));
    }], ["children", singleton_2("+")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 110,
    }], ["children", singleton_2(((j.Label + " (") + int32ToString(j.Assigned)) + ")")]]))]]]));
    const techRow = (t) => HtmlHelper_createElement("div", ofArray([["key", t.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: t.Researched ? 0.6 : (t.Enabled ? 1 : 0.45),
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(t.Enabled ? true : t.Researched))], ["disabled", !t.Enabled], ["onClick", (_arg_4) => {
        dispatch(new Msg(/* Research */ 5, [t.Name]));
    }], ["children", singleton_2(t.Researched ? "done" : "Research")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 170,
    }], ["children", singleton_2(t.Label)]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_2(priceText(t.Prices))]]))]]]));
    const upgradeRow = (u) => HtmlHelper_createElement("div", ofArray([["key", u.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: u.Researched ? 0.6 : (u.Enabled ? 1 : 0.45),
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(u.Enabled ? true : u.Researched))], ["disabled", !u.Enabled], ["onClick", (_arg_5) => {
        dispatch(new Msg(/* Upgrade */ 6, [u.Name]));
    }], ["children", singleton_2(u.Researched ? "done" : "Buy")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 200,
    }], ["children", singleton_2(u.Label)]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_2(priceText(u.Prices))]]))]]]));
    const craftRow = (c) => HtmlHelper_createElement("div", ofArray([["key", c.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_6) => {
        dispatch(new Msg(/* CraftOne */ 7, [c.Name]));
    }], ["children", singleton_2("Craft")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_7) => {
        dispatch(new Msg(/* CraftAll */ 8, [c.Name]));
    }], ["children", singleton_2("All")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 130,
    }], ["children", singleton_2(((c.Label + " (") + fmt(c.Value)) + ")")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_2(priceText(c.Prices))]]))]]]));
    const patternInput = kittenSummary(s);
    const maxKittens = patternInput[1] | 0;
    const kittens = patternInput[0] | 0;
    const happiness = patternInput[2];
    const queueCap = queueCap_1(s) | 0;
    const queueLen = queueLength(s) | 0;
    const queueRows = mapIndexed((i, q) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(i) + q.QName], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_8) => {
        dispatch(new Msg(/* QRemove */ 25, [i]));
    }], ["children", singleton_2("x")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
    }], ["children", singleton_2((((q.QName + " (") + q.QType) + ") x") + int32ToString(q.QValue))]]))]]])), s.QueueItems);
    const consoleRows = map((m) => HtmlHelper_createElement("div", ofArray([["key", int32ToString(m.CmId)], ["style", {
        fontSize: 12 + "px",
        marginBottom: 4,
        color: "#c8b890",
    }], ["children", toList(delay(() => append(m.CmHasCal ? singleton_1(HtmlHelper_createElement("span", ofArray([["style", {
        color: "#8a7850",
        marginRight: 8,
    }], ["children", singleton_2(((((("Y" + int32ToString(m.CmYear)) + " D") + int32ToString(m.CmDay)) + " ") + m.CmSeason) + " - ")]]))) : empty(), delay(() => singleton_1(HtmlHelper_createElement("span", singleton_2(["children", singleton_2(m.CmText)])))))))]])), s.ConsoleMsgs);
    const optRow = (name) => {
        const v = FSharpMap__get_Item(s.Opts.Bools, name);
        return HtmlHelper_createElement("div", ofArray([["key", name], ["style", {
            display: "flex",
            alignItems: "center",
            gap: 10 + "px ",
            marginBottom: 6,
        }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_9) => {
            dispatch(new Msg(/* ToggleOption */ 26, [name]));
        }], ["children", singleton_2(v ? "on" : "off")]])), HtmlHelper_createElement("span", ofArray([["style", {
            fontSize: 13 + "px",
        }], ["children", singleton_2(name)]]))]]]));
    };
    let tabContent;
    const matchValue = model.Tab;
    tabContent = ((matchValue === "Village") ? toList(delay(() => {
        let arg;
        return append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            fontSize: 14 + "px",
            marginBottom: 10,
            color: "#d4c290",
        }], ["children", singleton_2((((("Kittens: " + int32ToString(kittens)) + "/") + int32ToString(maxKittens)) + " - happiness: ") + ((arg = (happiness * 100), toText(printf("%.0f%%"))(arg))))]]))), delay(() => map(jobRow, filter((j_1) => j_1.Unlocked, jobRows(s)))));
    })) : ((matchValue === "Science") ? map(techRow, techRows(s)) : ((matchValue === "Workshop") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2("Upgrades")]]))), delay(() => append(map(upgradeRow, upgradeRows(s)), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        marginTop: 12,
        color: "#b0a480",
    }], ["children", singleton_2("Crafts")]]))), delay(() => map(craftRow, craftRows(s)))))))))) : ((matchValue === "Diplomacy") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2("Races (unlock rolls happen at year gates; trade needs manpower + gold)")]]))), delay(() => append(map((r_2) => buyRow(r_2.Label, "Trade", r_2.Tradeable, ((" - standing " + toText(printf("%.2f"))(r_2.Standing)) + ", embassies ") + int32ToString(r_2.EmbassyLevel), "", "race." + r_2.Name, new Msg(/* Trade */ 12, [r_2.Name])), raceRows(s)), delay(() => map((r_3) => buyRow(r_3.Label, "Embassy", r_3.Tradeable, " - level " + int32ToString(r_3.EmbassyLevel), "", "emb." + r_3.Name, new Msg(/* Embassy */ 13, [r_3.Name])), raceRows(s)))))))) : ((matchValue === "Religion") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 14 + "px",
        marginBottom: 10,
        color: "#d4c290",
    }], ["children", singleton_2((("Faith: " + fmt(getRes(s.Pool, "faith"))) + " - worship: ") + toText(printf("%.1f"))(s.Rpool.Faith))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("button", ofArray([["style", createObj(append_1(btnStyle(true), singleton_2(["marginBottom", 10])))], ["onClick", (_arg_10) => {
        dispatch(Msg.Praise);
    }], ["children", singleton_2("Praise the sun!")]]))), delay(() => map((r_4) => buyRow(r_4.Label, (r_4.Kind === "zu") ? "Build" : "Adore", r_4.Enabled, (" (" + int32ToString(r_4.Val)) + ")", "", "rel." + r_4.Name, (r_4.Kind === "zu") ? (new Msg(/* BuyZU */ 11, [r_4.Name])) : (new Msg(/* BuyRU */ 10, [r_4.Name]))), religionRows(s)))))))) : ((matchValue === "Space") ? map((r_5) => buyRow(r_5.Label, (r_5.Kind === "mission") ? "Launch" : "Build", r_5.Enabled, (" (" + int32ToString(r_5.Val)) + ")", "", "sp." + r_5.Name, (r_5.Kind === "mission") ? (new Msg(/* Mission */ 14, [r_5.Name])) : (new Msg(/* SpaceBuy */ 15, [r_5.Name]))), spaceRows(s)) : ((matchValue === "Time") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2((("Temporal flux: " + fmt(s.Tpool.Flux)) + " - heat: ") + fmt(s.Tpool.Heat))]]))), delay(() => map((r_6) => buyRow(r_6.Label, (r_6.Kind === "cfu") ? "Build" : "Buy", r_6.Enabled, (" (" + int32ToString(r_6.Val)) + ")", "", "t." + r_6.Name, (r_6.Kind === "cfu") ? (new Msg(/* CFUBuy */ 16, [r_6.Name])) : (new Msg(/* VSUBuy */ 17, [r_6.Name]))), timeRows(s)))))) : ((matchValue === "Challenges") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2("Marked challenges activate on the next reset (Settings tab)")]]))), delay(() => map((c_1) => buyRow(c_1.Label, c_1.Pending ? "Unmark" : (c_1.Active ? "Active!" : (c_1.Researched ? "Completed" : "Mark")), !c_1.Researched, (c_1.On > 0) ? ((" (x" + int32ToString(c_1.On)) + ")") : "", "", "ch." + c_1.Name, new Msg(/* ChallengeToggle */ 18, [c_1.Name])), challengeRows(s)))))) : ((matchValue === "Queue") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2(((("Queue " + int32ToString(queueLen)) + "/") + int32ToString(queueCap)) + " - the head item is attempted every 10 ticks")]]))), delay(() => append(queueRows, delay(() => singleton_1(HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_11) => {
        dispatch(new Msg(/* QAdd */ 24, ["hut", "buildings"]));
    }], ["children", singleton_2("Queue a Hut")]]))))))))) : ((matchValue === "Settings") ? toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2("Notation: " + s.Opts.Notation)]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        gap: 8 + "px ",
        marginBottom: 12,
    }], ["children", toList(delay(() => map_1((n) => HtmlHelper_createElement("button", ofArray([["key", n], ["style", createObj(btnStyle(s.Opts.Notation === n))], ["onClick", (_arg_12) => {
        dispatch(new Msg(/* SetNotation */ 27, [n]));
    }], ["children", singleton_2(n)]])), ["si", "e", "sie"])))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2(("Game speed: " + model.Speed.toString()) + "x")]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        gap: 8 + "px ",
        marginBottom: 12,
    }], ["children", toList(delay(() => map_1((mult) => HtmlHelper_createElement("button", ofArray([["key", mult.toString()], ["style", createObj(btnStyle(model.Speed === mult))], ["onClick", (_arg_13) => {
        dispatch(new Msg(/* SetSpeed */ 20, [mult]));
    }], ["children", singleton_2(mult.toString() + "x")]])), [1, 3, 10])))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_2("Options")]]))), delay(() => append(map((o) => optRow(o.Name), settingsArr), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        marginTop: 12,
        color: "#b0a480",
    }], ["children", singleton_2("Save / load")]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        gap: 8 + "px ",
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_14) => {
        dispatch(Msg.SaveGame);
    }], ["children", singleton_2("Save")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_15) => {
        dispatch(Msg.LoadGame);
    }], ["children", singleton_2("Load")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_16) => {
        dispatch(Msg.ResetGame);
    }], ["children", singleton_2("Reset")]]))]]]))), delay(() => {
        let value_390;
        return singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
            fontSize: 11 + "px",
            marginTop: 6,
            color: "#8a7850",
        }], (value_390 = "Save stores to this browser\'s localStorage under its own key - the original game\'s saves are untouched.", ["children", singleton_2(value_390)])])));
    })))))))))))))))))) : toList(delay(() => append(singleton_1(HtmlHelper_createElement("button", ofArray([["style", createObj(append_1(btnStyle(true), ofArray([["display", "block"], ["marginBottom", 10]])))], ["onClick", (_arg_17) => {
        dispatch(Msg.Gather);
    }], ["children", singleton_2("Gather catnip")]]))), delay(() => map(buildingRow, buildingRows(s))))))))))))))));
    const tabs = ofArray(["Bonfire", "Village", "Science", "Workshop", "Diplomacy", "Religion", "Space", "Time", "Challenges", "Queue", "Settings"]);
    const consolePanel = HtmlHelper_createElement("div", ofArray([["style", {
        borderTop: (((1 + "px ") + "solid") + " ") + "#4a3c20",
        marginTop: 16,
        paddingTop: 10,
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        color: "#d4c290",
    }], ["children", singleton_2("Log")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_18) => {
        dispatch(Msg.ClearConsole);
    }], ["children", singleton_2("Clear log")]]))]]]))), delay(() => consoleRows))))]]));
    return HtmlHelper_createElement("div", ofArray([["style", {
        fontFamily: "monospace",
        padding: 20,
        backgroundColor: "#1a1408",
        color: "#e8e0c8",
        minHeight: 100 + "vh",
    }], ["children", toList(delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 18 + "px",
        marginBottom: 10,
        color: "#d4c290",
    }], ["children", singleton_2((((("Year " + int32ToString(~~cal.Year + 1)) + ", Day ") + int32ToString(~~cal.Day + 1)) + " - ") + item(cal.Season, seasons).Name.toLocaleUpperCase())]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        flexWrap: "wrap",
        gap: 18 + "px ",
        marginBottom: 14,
    }], ["children", map(resRow, rows)]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 14,
    }], ["children", toList(delay(() => map_1((t_1) => HtmlHelper_createElement("button", ofArray([["key", t_1], ["style", createObj(tabStyle(model.Tab === t_1))], ["onClick", (_arg_19) => {
        dispatch(new Msg(/* SetTab */ 19, [t_1]));
    }], ["children", singleton_2(t_1)]])), tabs)))]]))), delay(() => append(singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        borderTop: (((1 + "px ") + "solid") + " ") + "#4a3c20",
        paddingTop: 12,
    }], ["children", tabContent]]))), delay(() => append(singleton_1(consolePanel), delay(() => ((model.Toast !== "") ? singleton_1(HtmlHelper_createElement("div", ofArray([["style", {
        position: "fixed",
        bottom: 14,
        right: 14,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 14,
        paddingRight: 14,
        backgroundColor: "#6a5830",
        color: "#f0e8d0",
        fontSize: 13 + "px",
    }], ["children", singleton_2(model.Toast)]]))) : empty())))))))))))))]]));
}

export function page(_shared, _route) {
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 29, [lm])));
}

