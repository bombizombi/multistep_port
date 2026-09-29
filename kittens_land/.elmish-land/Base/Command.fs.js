
import { Union } from "../App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, lambda_type, unit_type, list_type } from "../App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Cmd_map, Cmd_ofEffect, Cmd_OfPromise_either, Cmd_OfPromise_perform } from "../App/fable_modules/Fable.Elmish.5.0.2/cmd.fs.js";
import { Cmd_OfAsyncWith_either, Cmd_OfAsyncWith_perform } from "../App/fable_modules/Fable.Elmish.5.0.2/./cmd.fs.js";
import { AsyncHelpers_start } from "../App/fable_modules/Fable.Elmish.5.0.2/./prelude.fs.js";
import { map, singleton } from "../App/fable_modules/fable-library-js.5.17.0/List.js";
import { RouteModule_format } from "./Routes.fs.js";
import { RouterModule_nav } from "./Router.fs.js";

export class Command$3 extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["None", "Batch", "Cmd", "SharedMsg", "LayoutMsg"];
    }
    static None = new Command$3(0, []);
}

export function Command$3_$reflection(gen0, gen1, gen2) {
    return union_type("ElmishLand.Command`3", [gen0, gen1, gen2], Command$3, () => [[], [["Item", list_type(Command$3_$reflection(gen0, gen1, gen2))]], [["Item", list_type(lambda_type(lambda_type(gen0, unit_type), unit_type))]], [["Item", gen1]], [["Item", gen2]]]);
}

export function Command_none() {
    return Command$3.None;
}

export function Command_ofPromise(p, arg, ofSuccess) {
    return new Command$3(/* Cmd */ 2, [Cmd_OfPromise_perform(p, arg, ofSuccess)]);
}

export function Command_tryOfPromise(p, arg, ofSuccess, ofError) {
    return new Command$3(/* Cmd */ 2, [Cmd_OfPromise_either(p, arg, ofSuccess, ofError)]);
}

export function Command_ofAsync(p, arg, ofSuccess) {
    return new Command$3(/* Cmd */ 2, [Cmd_OfAsyncWith_perform((x) => {
        AsyncHelpers_start(x);
    }, p, arg, ofSuccess)]);
}

export function Command_tryOfAsync(p, arg, ofSuccess, ofError) {
    return new Command$3(/* Cmd */ 2, [Cmd_OfAsyncWith_either((x) => {
        AsyncHelpers_start(x);
    }, p, arg, ofSuccess, ofError)]);
}

export function Command_ofCmd(cmd) {
    return new Command$3(/* Cmd */ 2, [cmd]);
}

export function Command_ofMsg(msg) {
    return new Command$3(/* Cmd */ 2, [singleton((dispatch) => {
        dispatch(msg);
    })]);
}

export function Command_batch(cmds) {
    return new Command$3(/* Batch */ 1, [cmds]);
}

export function Command_ofShared(msg) {
    return new Command$3(/* SharedMsg */ 3, [msg]);
}

export function Command_ofLayout(msg) {
    return new Command$3(/* LayoutMsg */ 4, [msg]);
}

export function Command_navigate(route) {
    let fullPath;
    return Command_ofCmd((fullPath = RouteModule_format(route), Cmd_ofEffect((_arg_1) => {
        RouterModule_nav(singleton(fullPath), 1, 1);
    })));
}

export function Command_map(f, mapLayout, command) {
    switch (command.tag) {
        case 1: {
            const cmds = command.fields[0];
            return new Command$3(/* Batch */ 1, [map((command_1) => Command_map(f, mapLayout, command_1), cmds)]);
        }
        case 2: {
            const cmd = command.fields[0];
            return new Command$3(/* Cmd */ 2, [Cmd_map(f, cmd)]);
        }
        case 3: {
            const msg = command.fields[0];
            return new Command$3(/* SharedMsg */ 3, [msg]);
        }
        case 4: {
            const msg_1 = command.fields[0];
            return new Command$3(/* LayoutMsg */ 4, [mapLayout(msg_1)]);
        }
        default:
            return Command$3.None;
    }
}

