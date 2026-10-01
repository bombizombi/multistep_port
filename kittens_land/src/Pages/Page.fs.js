
import { Union } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Msg_$reflection as Msg_$reflection_1 } from "./Layout.fs.js";
import { Command_none, Command_batch, Command_ofAsync } from "../../.elmish-land/Base/Command.fs.js";
import { singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/AsyncBuilder.js";
import { sleep } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Async.js";
import { buildingRows, resRows, tick, buyBuilding, gatherCatnip, init as init_1 } from "../KittensState.fs.js";
import { map, singleton as singleton_1, filter, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { HtmlHelper_createElement } from "../../.elmish-land/App/fable_modules/Feliz.3.3.3/./Html.fs.js";
import { int32ToString } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { join, printf, toText } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/String.js";
import { singleton as singleton_2, append, delay, toList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { Page_from } from "../../.elmish-land/Base/Page.fs.js";

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Tick", "Gather", "Buy", "LayoutMsg"];
    }
    static Tick = new Msg(0, []);
    static Gather = new Msg(1, []);
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Page.Msg", [], Msg, () => [[], [], [["Item", string_type]], [["Item", Msg_$reflection_1()]]]);
}

export function tickCmd() {
    return Command_ofAsync(() => singleton.Delay(() => singleton.Bind(sleep(100), () => singleton.Return(undefined))), undefined, () => Msg.Tick);
}

export function init() {
    return [init_1(), Command_batch(ofArray([Command_none(), tickCmd()]))];
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return [gatherCatnip(model), Command_none()];
        case 2: {
            const name = msg.fields[0];
            return [buyBuilding(name, model), Command_none()];
        }
        case 3:
            return [model, Command_none()];
        default:
            return [tick(model), Command_none()];
    }
}

export function view(model, dispatch) {
    const rows = filter((r) => r.Show, resRows(model));
    const buildings = buildingRows(model);
    const cal = model.Calendar;
    const resRow = (r_1) => HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 14 + "px",
    }], ["children", singleton_1(((r_1.Name + ": ") + ((r_1.Value >= 1000) ? int32ToString(~~r_1.Value) : toText(printf("%.1f"))(r_1.Value))) + (((r_1.Max > 0) && (r_1.Max < 1000000)) ? ("/" + int32ToString(~~r_1.Max)) : ""))]]));
    const buildingRow = (b) => HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        alignItems: "center",
        gap: 10 + "px ",
        marginBottom: 6,
        opacity: b.Enabled ? 1 : 0.45,
    }], ["children", [HtmlHelper_createElement("button", ofArray([["style", {
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 12,
        paddingRight: 12,
        fontFamily: "monospace",
        fontSize: 13 + "px",
        backgroundColor: "#3a2f18",
        color: "#e8e0c8",
        border: (((1 + "px ") + "solid") + " ") + "#6a5830",
        cursor: b.Enabled ? "pointer" : "default",
    }], ["disabled", !b.Enabled], ["onClick", (_arg) => {
        dispatch(new Msg(/* Buy */ 2, [b.Name]));
    }], ["children", singleton_1(b.Label + ((b.Val > 0) ? ((" (" + int32ToString(b.Val)) + ")") : ""))]])), HtmlHelper_createElement("span", ofArray([["style", {
        fontSize: 12 + "px",
        color: "#b0a480",
    }], ["children", singleton_1(join("; ", map((p) => ((p.Resource + " ") + int32ToString(~~p.Val)), b.Prices)))]]))]]]));
    return HtmlHelper_createElement("div", ofArray([["style", {
        fontFamily: "monospace",
        padding: 20,
        backgroundColor: "#1a1408",
        color: "#e8e0c8",
        minHeight: 100 + "vh",
    }], ["children", [HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 18 + "px",
        marginBottom: 12,
        color: "#d4c290",
    }], ["children", singleton_1((((("Year " + int32ToString(~~cal.Year + 1)) + ", Day ") + int32ToString(~~cal.Day + 1)) + " — ") + int32ToString(cal.Season).toLocaleUpperCase())]])), HtmlHelper_createElement("div", ofArray([["style", {
        display: "flex",
        flexWrap: "wrap",
        gap: 18 + "px ",
        marginBottom: 16,
    }], ["children", map(resRow, rows)]])), HtmlHelper_createElement("div", ofArray([["style", {
        borderTop: (((1 + "px ") + "solid") + " ") + "#4a3c20",
        paddingTop: 12,
    }], ["children", toList(delay(() => append(singleton_2(HtmlHelper_createElement("div", ofArray([["style", {
        fontSize: 16 + "px",
        marginBottom: 8,
        color: "#d4c290",
    }], ["children", singleton_1("Bonfire")]]))), delay(() => append(singleton_2(HtmlHelper_createElement("button", ofArray([["style", {
        display: "block",
        marginBottom: 10,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 14,
        paddingRight: 14,
        fontFamily: "monospace",
        fontSize: 14 + "px",
        backgroundColor: "#3a2f18",
        color: "#e8e0c8",
        border: (((1 + "px ") + "solid") + " ") + "#6a5830",
        cursor: "pointer",
    }], ["onClick", (_arg_1) => {
        dispatch(Msg.Gather);
    }], ["children", singleton_1("Gather catnip")]]))), delay(() => map(buildingRow, buildings)))))))]]))]]]));
}

export function Msg_WrapLayout_1BA2C68A(m) {
    return new Msg(/* LayoutMsg */ 3, [m]);
}

export function page(_shared, _route) {
    return Page_from(init, update, view, undefined, (lm) => (new Msg(/* LayoutMsg */ 3, [lm])));
}

