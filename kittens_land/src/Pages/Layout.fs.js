
import { Union } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Command_none } from "../../.elmish-land/Base/Command.fs.js";
import { Layout_from } from "../../.elmish-land/Base/Layout.fs.js";

export class Msg extends Union {
    constructor() {
        super();
        this.tag = 0;
        this.fields = [];
    }
    cases() {
        return ["NoOp"];
    }
    static NoOp = new Msg();
}

export function Msg_$reflection() {
    return union_type("kittens_land.Pages.Layout.Msg", [], Msg, () => [[]]);
}

export function init() {
    return [undefined, Command_none()];
}

export function update(msg, model) {
    return [model, Command_none()];
}

export function routeChanged(model) {
    return [model, Command_none()];
}

export function view(_model, content, _dispatch) {
    return content;
}

export function layout(_props, _route, _shared) {
    return Layout_from(init, (msg, model) => update(msg, undefined), () => routeChanged(undefined), (_model, content, _dispatch) => view(undefined, content, _dispatch));
}

