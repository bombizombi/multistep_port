
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, list_type, string_type, class_type, lambda_type, tuple_type, unit_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Command$3_$reflection } from "./Command.js";
import { empty } from "../../fable_modules/fable-library-js.5.17.0/List.js";

export class Layout$3 extends Record {
    constructor(Init, Update, RouteChanged, View, Subscriptions) {
        super();
        this.Init = Init;
        this.Update = Update;
        this.RouteChanged = RouteChanged;
        this.View = View;
        this.Subscriptions = Subscriptions;
    }
}

export function Layout$3_$reflection(gen0, gen1, gen2) {
    return record_type("ElmishLand.Layout`3", [gen0, gen1, gen2], Layout$3, () => [["Init", lambda_type(unit_type, tuple_type(gen1, Command$3_$reflection(gen2, gen0, gen2)))], ["Update", lambda_type(gen2, lambda_type(gen1, tuple_type(gen1, Command$3_$reflection(gen2, gen0, gen2))))], ["RouteChanged", lambda_type(gen1, tuple_type(gen1, Command$3_$reflection(gen2, gen0, gen2)))], ["View", lambda_type(gen1, lambda_type(class_type("Fable.React.ReactElement", undefined), lambda_type(lambda_type(gen2, unit_type), class_type("Fable.React.ReactElement", undefined))))], ["Subscriptions", lambda_type(gen1, list_type(tuple_type(list_type(string_type), lambda_type(lambda_type(gen2, unit_type), class_type("System.IDisposable")))))]]);
}

export function Layout_from(init, update, routeChanged, view) {
    return new Layout$3(init, update, routeChanged, view, (_arg) => empty());
}

export function Layout_withSubscriptions(subscriptions, layout) {
    return new Layout$3(layout.Init, layout.Update, layout.RouteChanged, layout.View, subscriptions);
}

