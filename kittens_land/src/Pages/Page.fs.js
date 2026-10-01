
import { Union, Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, int32_type, record_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { buildingRows, craftRows, upgradeRows, techRows, jobRows, challengeRows, timeRows, spaceRows, religionRows, getRes, raceRows, kittenSummary, resRows, tick, toggleChallengePending, buyVSU, buyCFU, buySpaceBuilding, buyProgram, buyEmbassy, trade, buyZU, buyRU, praise, craftAll, craft, buyUpgrade, research, unassignJob, assignJob, buyBuilding, gatherCatnip, init as init_1, State_$reflection } from "../KittensState.fs.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.fs.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.fs.js";
import { singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Async.js";
import { item, empty as empty_1, append as append_1, singleton as singleton_1, filter, map, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { createObj, int32ToString } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { join, printf, toText } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { HtmlHelper_createElement } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/./Html.fs.js";
import { map as map_1, empty, singleton as singleton_2, append, delay, toList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { seasons } from "../Game/Game.Calendar.fs.js";
import { Page_from } from "../../.elmish-land/Base/Page.fs.js";

export class Model extends Record {
    constructor(Tab, S) {
        super();
        this.Tab = Tab;
        this.S = S;
    }
}

export function Model_$reflection() {
    return record_type("kittens_land.Pages.Page.Model", [], Model, () => [["Tab", string_type], ["S", State_$reflection()]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Tick", "Gather", "Buy", "Assign", "Unassign", "Research", "Upgrade", "CraftOne", "CraftAll", "SetTab", "Praise", "BuyRU", "BuyZU", "Trade", "Embassy", "Mission", "SpaceBuy", "CFUBuy", "VSUBuy", "ChallengeToggle", "LayoutMsg"];
    }
    static Tick = new Msg(0, []);
    static Gather = new Msg(1, []);
    static Praise = new Msg(10, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[], [], [["Item", string_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item1", string_type], ["Item2", int32_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", Msg_$reflection_1()]]]);
}

export function tickCmd() {
    return Command_ofAsync(() => singleton.Delay(() => singleton.Bind(sleep(100), () => singleton.Return(undefined))), undefined, () => Msg.Tick);
}

export function init() {
    return [new Model("Bonfire", init_1()), Command_batch(ofArray([Command_none(), tickCmd()]))];
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return [new Model(model.Tab, gatherCatnip(model.S)), Command_none()];
        case 2: {
            const name = msg.fields[0];
            return [new Model(model.Tab, buyBuilding(name, model.S)), Command_none()];
        }
        case 3: {
            const n = msg.fields[1] | 0;
            const job = msg.fields[0];
            return [new Model(model.Tab, assignJob(job, n, model.S)), Command_none()];
        }
        case 4: {
            const n_1 = msg.fields[1] | 0;
            const job_1 = msg.fields[0];
            return [new Model(model.Tab, unassignJob(job_1, n_1, model.S)), Command_none()];
        }
        case 5: {
            const name_1 = msg.fields[0];
            return [new Model(model.Tab, research(name_1, model.S)), Command_none()];
        }
        case 6: {
            const name_2 = msg.fields[0];
            return [new Model(model.Tab, buyUpgrade(name_2, model.S)), Command_none()];
        }
        case 7: {
            const name_3 = msg.fields[0];
            return [new Model(model.Tab, craft(name_3, 1, model.S)), Command_none()];
        }
        case 8: {
            const name_4 = msg.fields[0];
            return [new Model(model.Tab, craftAll(name_4, model.S)), Command_none()];
        }
        case 9: {
            const tab = msg.fields[0];
            return [new Model(tab, model.S), Command_none()];
        }
        case 10:
            return [new Model(model.Tab, praise(model.S)), Command_none()];
        case 11: {
            const name_5 = msg.fields[0];
            return [new Model(model.Tab, buyRU(name_5, model.S)), Command_none()];
        }
        case 12: {
            const name_6 = msg.fields[0];
            return [new Model(model.Tab, buyZU(name_6, model.S)), Command_none()];
        }
        case 13: {
            const race = msg.fields[0];
            return [new Model(model.Tab, trade(race, model.S)), Command_none()];
        }
        case 14: {
            const race_1 = msg.fields[0];
            return [new Model(model.Tab, buyEmbassy(race_1, model.S)), Command_none()];
        }
        case 15: {
            const name_7 = msg.fields[0];
            return [new Model(model.Tab, buyProgram(name_7, model.S)), Command_none()];
        }
        case 16: {
            const name_8 = msg.fields[0];
            return [new Model(model.Tab, buySpaceBuilding(name_8, model.S)), Command_none()];
        }
        case 17: {
            const name_9 = msg.fields[0];
            return [new Model(model.Tab, buyCFU(name_9, model.S)), Command_none()];
        }
        case 18: {
            const name_10 = msg.fields[0];
            return [new Model(model.Tab, buyVSU(name_10, model.S)), Command_none()];
        }
        case 19: {
            const name_11 = msg.fields[0];
            return [new Model(model.Tab, toggleChallengePending(name_11, model.S)), Command_none()];
        }
        case 20:
            return [model, Command_none()];
        default:
            return [new Model(model.Tab, tick(model.S)), Command_batch(ofArray([Command_none(), tickCmd()]))];
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

export function priceText(prices) {
    return join("; ", map((p) => ((p.Resource + " ") + fmt(p.Val)), prices));
}

export function tabStyle(active) {
    return ofArray([["paddingTop", 4], ["paddingBottom", 4], ["paddingLeft", 14], ["paddingRight", 14], ["marginRight", 6], ["fontFamily", "monospace"], ["fontSize", 14 + "px"], ["cursor", "pointer"], ["border", (((1 + "px ") + "solid") + " ") + "#6a5830"], ["backgroundColor", active ? "#6a5830" : "#3a2f18"], ["color", "#e8e0c8"]]);
}

export function btnStyle(enabled) {
    return ofArray([["paddingTop", 4], ["paddingBottom", 4], ["paddingLeft", 12], ["paddingRight", 12], ["fontFamily", "monospace"], ["fontSize", 13 + "px"], ["backgroundColor", "#3a2f18"], ["color", "#e8e0c8"], ["border", (((1 + "px ") + "solid") + " ") + "#6a5830"], ["cursor", enabled ? "pointer" : "default"]]);
}

export function view(model, dispatch) {
    const s = model.S;
    const rows = filter((r) => r.Show, resRows(s));
    const cal = s.Calendar;
    const resRow = (r_1) => HtmlHelper_createElement("div", ofArray([["key", r_1.Name], ["style", {
        fontSize: 14 + "px",
    }], ["children", singleton_1(((r_1.Name + ": ") + fmt(r_1.Value)) + (((r_1.Max > 0) && (r_1.Max < 1000000)) ? ("/" + fmt(r_1.Max)) : ""))]]));
    const buildingRow = (b) => HtmlHelper_createElement("div", ofArray([["key", b.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: b.Enabled ? 1 : 0.45,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(b.Enabled))], ["disabled", !b.Enabled], ["onClick", (_arg) => {
        dispatch(new Msg(/* Buy */ 2, [b.Name]));
    }], ["children", singleton_1(b.Label + ((b.Val > 0) ? ((" (" + int32ToString(b.Val)) + ")") : ""))]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(priceText(b.Prices))]]))]]]));
    const jobRow = (j) => HtmlHelper_createElement("div", ofArray([["key", j.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 8 + "px ",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(j.Assigned > 0))], ["disabled", j.Assigned === 0], ["onClick", (_arg_1) => {
        dispatch(new Msg(/* Unassign */ 4, [j.Name, 1]));
    }], ["children", singleton_1("-")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_2) => {
        dispatch(new Msg(/* Assign */ 3, [j.Name, 1]));
    }], ["children", singleton_1("+")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 110,
    }], ["children", singleton_1(((j.Label + " (") + int32ToString(j.Assigned)) + ")")]]))]]]));
    const techRow = (t) => HtmlHelper_createElement("div", ofArray([["key", t.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: t.Researched ? 0.6 : (t.Enabled ? 1 : 0.45),
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(t.Enabled ? true : t.Researched))], ["disabled", !t.Enabled], ["onClick", (_arg_3) => {
        dispatch(new Msg(/* Research */ 5, [t.Name]));
    }], ["children", singleton_1(t.Researched ? "done" : "Research")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 170,
    }], ["children", singleton_1(t.Label)]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(priceText(t.Prices))]]))]]]));
    const upgradeRow = (u) => HtmlHelper_createElement("div", ofArray([["key", u.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: u.Researched ? 0.6 : (u.Enabled ? 1 : 0.45),
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(u.Enabled ? true : u.Researched))], ["disabled", !u.Enabled], ["onClick", (_arg_4) => {
        dispatch(new Msg(/* Upgrade */ 6, [u.Name]));
    }], ["children", singleton_1(u.Researched ? "done" : "Buy")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 200,
    }], ["children", singleton_1(u.Label)]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(priceText(u.Prices))]]))]]]));
    const craftRow = (c) => HtmlHelper_createElement("div", ofArray([["key", c.Name], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_5) => {
        dispatch(new Msg(/* CraftOne */ 7, [c.Name]));
    }], ["children", singleton_1("Craft")]])), HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(true))], ["onClick", (_arg_6) => {
        dispatch(new Msg(/* CraftAll */ 8, [c.Name]));
    }], ["children", singleton_1("All")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 130,
    }], ["children", singleton_1(((c.Label + " (") + fmt(c.Value)) + ")")]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(priceText(c.Prices))]]))]]]));
    const patternInput = kittenSummary(s);
    const maxKittens = patternInput[1] | 0;
    const kittens = patternInput[0] | 0;
    const happiness = patternInput[2];
    const buyRow = (label, btnText, enabled, valText, priceText_1, key_99, act) => HtmlHelper_createElement("div", ofArray([["key", key_99], ["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: enabled ? 1 : 0.45,
    }], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("button", ofArray([["style", createObj(btnStyle(enabled))], ["disabled", !enabled], ["onClick", (_arg_7) => {
        dispatch(act);
    }], ["children", singleton_1(btnText)]]))), delay(() => append(singleton_2(HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 13 + "px",
        width: 200,
    }], ["children", singleton_1(label + valText)]]))), delay(() => ((priceText_1 !== "") ? singleton_2(HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(priceText_1)]]))) : empty())))))))]]));
    let tabContentV3;
    const matchValue = model.Tab;
    tabContentV3 = ((matchValue === "Diplomacy") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_1("Races (trade needs manpower + gold; unlock rolls happen at year gates)")]]))), delay(() => append(map((r_2) => buyRow(r_2.Label, "Trade", r_2.Tradeable, ((" — standing " + toText(printf("%.2f"))(r_2.Standing)) + ", embassies ") + int32ToString(r_2.EmbassyLevel), "", "race." + r_2.Name, new Msg(/* Trade */ 13, [r_2.Name])), raceRows(s)), delay(() => map((r_3) => buyRow(r_3.Label, "Embassy", r_3.Tradeable, " — level " + int32ToString(r_3.EmbassyLevel), "", "emb." + r_3.Name, new Msg(/* Embassy */ 14, [r_3.Name])), raceRows(s)))))))) : ((matchValue === "Religion") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 14 + "px",
        marginBottom: 10,
        color: "#d4c290",
    }], ["children", singleton_1((("Faith: " + fmt(getRes(s.Pool, "faith"))) + " — worship: ") + toText(printf("%.1f"))(s.Rpool.Faith))]]))), delay(() => append(singleton_2(HtmlHelper_createElement("button", ofArray([["style", createObj(append_1(btnStyle(true), singleton_1(["marginBottom", 10])))], ["onClick", (_arg_8) => {
        dispatch(Msg.Praise);
    }], ["children", singleton_1("Praise the sun!")]]))), delay(() => map((r_4) => buyRow(r_4.Label, (r_4.Kind === "zu") ? "Build" : "Adore", r_4.Enabled, (" (" + int32ToString(r_4.Val)) + ")", "", "rel." + r_4.Name, (r_4.Kind === "zu") ? (new Msg(/* BuyZU */ 12, [r_4.Name])) : (new Msg(/* BuyRU */ 11, [r_4.Name]))), religionRows(s)))))))) : ((matchValue === "Space") ? map((r_5) => buyRow(r_5.Label, (r_5.Kind === "mission") ? "Launch" : "Build", r_5.Enabled, (" (" + int32ToString(r_5.Val)) + ")", "", "sp." + r_5.Name, (r_5.Kind === "mission") ? (new Msg(/* Mission */ 15, [r_5.Name])) : (new Msg(/* SpaceBuy */ 16, [r_5.Name]))), spaceRows(s)) : ((matchValue === "Time") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_1((("Temporal flux: " + fmt(s.Tpool.Flux)) + " — heat: ") + fmt(s.Tpool.Heat))]]))), delay(() => map((r_6) => buyRow(r_6.Label, (r_6.Kind === "cfu") ? "Build" : "Buy", r_6.Enabled, (" (" + int32ToString(r_6.Val)) + ")", "", "t." + r_6.Name, (r_6.Kind === "cfu") ? (new Msg(/* CFUBuy */ 17, [r_6.Name])) : (new Msg(/* VSUBuy */ 18, [r_6.Name]))), timeRows(s)))))) : ((matchValue === "Challenges") ? toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 13 + "px",
        marginBottom: 8,
        color: "#b0a480",
    }], ["children", singleton_1("Marked challenges activate on the next reset")]]))), delay(() => map((c_1) => buyRow(c_1.Label, c_1.Pending ? "Unmark" : (c_1.Active ? "Active!" : (c_1.Researched ? "Completed" : "Mark")), !c_1.Researched, (c_1.On > 0) ? ((" (x" + int32ToString(c_1.On)) + ")") : "", "", "ch." + c_1.Name, new Msg(/* ChallengeToggle */ 19, [c_1.Name])), challengeRows(s)))))) : empty_1())))));
    let tabContent;
    const matchValue_1 = model.Tab;
    switch (matchValue_1) {
        case "Diplomacy":
        case "Religion":
        case "Space":
        case "Time":
        case "Challenges": {
            tabContent = tabContentV3;
            break;
        }
        case "Village": {
            tabContent = toList(delay(() => {
                let arg_2;
                return append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
                    fontSize: 14 + "px",
                    marginBottom: 10,
                    color: "#d4c290",
                }], ["children", singleton_1((((("Kittens: " + int32ToString(kittens)) + "/") + int32ToString(maxKittens)) + " - happiness: ") + ((arg_2 = (happiness * 100), toText(printf("%.0f%%"))(arg_2))))]]))), delay(() => map(jobRow, filter((j_1) => j_1.Unlocked, jobRows(s)))));
            }));
            break;
        }
        case "Science": {
            tabContent = map(techRow, techRows(s));
            break;
        }
        case "Workshop": {
            tabContent = toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
                fontSize: 13 + "px",
                marginBottom: 8,
                color: "#b0a480",
            }], ["children", singleton_1("Upgrades")]]))), delay(() => append(map(upgradeRow, upgradeRows(s)), delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
                fontSize: 13 + "px",
                marginBottom: 8,
                marginTop: 12,
                color: "#b0a480",
            }], ["children", singleton_1("Crafts")]]))), delay(() => map(craftRow, craftRows(s))))))))));
            break;
        }
        default:
            tabContent = toList(delay(() => append(singleton_2(HtmlHelper_createElement("button", ofArray([["style", createObj(append_1(btnStyle(true), ofArray([["display", "block"], ["marginBottom", 10]])))], ["onClick", (_arg_9) => {
                dispatch(Msg.Gather);
            }], ["children", singleton_1("Gather catnip")]]))), delay(() => map(buildingRow, buildingRows(s))))));
    }
    const tabs = ofArray(["Bonfire", "Village", "Science", "Workshop", "Diplomacy", "Religion", "Space", "Time", "Challenges"]);
    return HtmlHelper_createElement("div", ofArray([["style", {
        fontFamily: "monospace",
        padding: 20,
        backgroundColor: "#1a1408",
        color: "#e8e0c8",
        minHeight: 100 + "vh",
    }], ["children", [HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 18 + "px",
        marginBottom: 10,
        color: "#d4c290",
    }], ["children", singleton_1((((("Year " + int32ToString(~~cal.Year + 1)) + ", Day ") + int32ToString(~~cal.Day + 1)) + " - ") + item(cal.Season, seasons).Name.toLocaleUpperCase())]])), HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        flexWrap: "wrap",
        gap: 18 + "px ",
        marginBottom: 14,
    }], ["children", map(resRow, rows)]])), HtmlHelper_createElement("div", ofArray([["style", {
        marginBottom: 14,
    }], ["children", toList(delay(() => map_1((t_1) => HtmlHelper_createElement("button", ofArray([["key", t_1], ["style", createObj(tabStyle(model.Tab === t_1))], ["onClick", (_arg_10) => {
        dispatch(new Msg(/* SetTab */ 9, [t_1]));
    }], ["children", singleton_1(t_1)]])), tabs)))]])), HtmlHelper_createElement("div", ofArray([["style", {
        borderTop: (((1 + "px ") + "solid") + " ") + "#4a3c20",
        paddingTop: 12,
    }], ["children", tabContent]]))]]]));
}

export function page(_shared, _route) {
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 20, [lm])));
}

