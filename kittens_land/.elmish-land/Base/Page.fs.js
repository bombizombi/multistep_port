
import { Record } from "../App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, list_type, string_type, class_type, lambda_type, tuple_type, unit_type } from "../App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Command$3_$reflection } from "./Command.fs.js";
import { empty } from "../App/fable_modules/fable-library-js.5.17.0/List.js";

export class Page$5 extends Record {
    constructor(Init, Update, View, Subscriptions, LayoutProps, LayoutMsgToPageMsg) {
        super();
        this.Init = Init;
        this.Update = Update;
        this.View = View;
        this.Subscriptions = Subscriptions;
        this.LayoutProps = LayoutProps;
        this.LayoutMsgToPageMsg = LayoutMsgToPageMsg;
    }
}

export function Page$5_$reflection(gen0, gen1, gen2, gen3, gen4) {
    return record_type("ElmishLand.Page`5", [gen0, gen1, gen2, gen3, gen4], Page$5, () => [["Init", lambda_type(unit_type, tuple_type(gen1, Command$3_$reflection(gen2, gen0, gen3)))], ["Update", lambda_type(gen2, lambda_type(gen1, tuple_type(gen1, Command$3_$reflection(gen2, gen0, gen3))))], ["View", lambda_type(gen1, lambda_type(lambda_type(gen2, unit_type), class_type("Fable.React.ReactElement", undefined)))], ["Subscriptions", lambda_type(gen1, list_type(tuple_type(list_type(string_type), lambda_type(lambda_type(gen2, unit_type), class_type("System.IDisposable")))))], ["LayoutProps", gen4], ["LayoutMsgToPageMsg", lambda_type(gen3, gen2)]]);
}

export function Page_from(init, update, view, layoutProps, layoutMsgToPageMsg) {
    return new Page$5(init, update, view, (_arg) => empty(), layoutProps, layoutMsgToPageMsg);
}

export function Page_withSubscriptions(subscriptions, page) {
    return new Page$5(page.Init, page.Update, page.View, subscriptions, page.LayoutProps, page.LayoutMsgToPageMsg);
}

