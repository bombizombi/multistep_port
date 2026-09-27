
import { Record, Union } from "./fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, list_type, string_type, class_type, lambda_type, tuple_type, unit_type, union_type } from "./fable_modules/fable-library-js.5.17.0/Reflection.js";
import { layout as layout_3, Msg_$reflection as Msg_$reflection_1 } from "../../src/Pages/Layout.fs.js";
import { page, Msg_$reflection as Msg_$reflection_2 } from "../../src/Pages/Page.fs.js";
import { subscriptions, update as update_2, init as init_2, SharedMsg_$reflection } from "../../src/Shared.fs.js";
import { RouteModule_parse, Route, Route_$reflection } from "../Base/Routes.fs.js";
import { Command_none, Command_batch, Command_map, Command$3_$reflection } from "../Base/Command.fs.js";
import { Cmd_map, Cmd_none, Cmd_batch } from "./fable_modules/Fable.Elmish.5.0.2/cmd.fs.js";
import { ofArray, singleton, map } from "./fable_modules/fable-library-js.5.17.0/List.js";
import { equals, compare, curry2, uncurry2, Exception } from "./fable_modules/fable-library-js.5.17.0/Util.js";
import { tryFind, empty, change } from "./fable_modules/fable-library-js.5.17.0/Map.js";
import { RouterModule_urlSegments } from "../Base/./Router.fs.js";
import { printf, interpolate, toConsole } from "./fable_modules/fable-library-js.5.17.0/String.js";
import { view as view_1 } from "../../src/Pages/NotFound.fs.js";
import { RouterModule_subscribeToUrlChanges } from "../Base/Router.fs.js";
import { Sub_none, Sub_map, Sub_batch } from "./fable_modules/Fable.Elmish.5.0.2/sub.fs.js";
import { singleton as singleton_1, append, delay, toList } from "./fable_modules/fable-library-js.5.17.0/Seq.js";
import { ProgramModule_run } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../Fable.Elmish.5.0.2/program.fs.js";
import { ProgramModule_mkProgram, ProgramModule_withErrorHandler, ProgramModule_withSubscription } from "./fable_modules/Fable.Elmish.5.0.2/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../Fable.Elmish.React.5.6.0/react.fs.js";

export class LayoutName extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Main", "None"];
    }
    static Main = new LayoutName(0, []);
    static None = new LayoutName(1, []);
}

export function LayoutName_$reflection() {
    return union_type("ElmishLand.kittens_land.App.LayoutName", [], LayoutName, () => [[], []]);
}

export class Layout extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Main", "None"];
    }
    static None = new Layout(1, []);
}

export function Layout_$reflection() {
    return union_type("ElmishLand.kittens_land.App.Layout", [], Layout, () => [[["Item1", unit_type], ["Item2", unit_type]], []]);
}

export class LayoutMsg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["MainMsg", "NoOp"];
    }
    static NoOp = new LayoutMsg(1, []);
}

export function LayoutMsg_$reflection() {
    return union_type("ElmishLand.kittens_land.App.LayoutMsg", [], LayoutMsg, () => [[["Item", Msg_$reflection_1()]], []]);
}

export class PageMsg extends Union {
    constructor(Item) {
        super();
        this.tag = 0;
        this.fields = [Item];
    }
    cases() {
        return ["HomeMsg"];
    }
}

export function PageMsg_$reflection() {
    return union_type("ElmishLand.kittens_land.App.PageMsg", [], PageMsg, () => [[["Item", Msg_$reflection_2()]]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["SharedMsg", "RouteChanged", "PageMsg", "LayoutMsg"];
    }
}

export function Msg_$reflection() {
    return union_type("ElmishLand.kittens_land.App.Msg", [], Msg, () => [[["Item", SharedMsg_$reflection()]], [["Item", Route_$reflection()]], [["Item", PageMsg_$reflection()]], [["Item", LayoutMsg_$reflection()]]]);
}

export class MappedPage$4 extends Record {
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

export function MappedPage$4_$reflection(gen0, gen1, gen2, gen3) {
    return record_type("ElmishLand.kittens_land.App.MappedPage`4", [gen0, gen1, gen2, gen3], MappedPage$4, () => [["Init", lambda_type(unit_type, tuple_type(gen1, Command$3_$reflection(Msg_$reflection(), SharedMsg_$reflection(), Msg_$reflection())))], ["Update", lambda_type(gen0, lambda_type(gen1, tuple_type(gen1, Command$3_$reflection(Msg_$reflection(), SharedMsg_$reflection(), Msg_$reflection()))))], ["View", lambda_type(gen1, lambda_type(lambda_type(gen0, unit_type), class_type("Fable.React.ReactElement", undefined)))], ["Subscriptions", lambda_type(gen1, list_type(tuple_type(list_type(string_type), lambda_type(lambda_type(gen0, unit_type), class_type("System.IDisposable")))))], ["LayoutProps", gen3], ["LayoutMsgToPageMsg", lambda_type(gen2, gen0)]]);
}

export class PageModel extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Home", "NotFound"];
    }
    static NotFound = new PageModel(1, []);
}

export function PageModel_$reflection() {
    return union_type("ElmishLand.kittens_land.App.PageModel", [], PageModel, () => [[["Item", unit_type]], []]);
}

export class Page extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Home", "NotFound"];
    }
    static NotFound = new Page(1, []);
}

export function Page_$reflection() {
    return union_type("ElmishLand.kittens_land.App.Page", [], Page, () => [[["Item", lambda_type(unit_type, MappedPage$4_$reflection(Msg_$reflection_2(), unit_type, Msg_$reflection_1(), unit_type))]], []]);
}

export class Model extends Record {
    constructor(Shared, CurrentRoute, CurrentPage, CurrentPageModel, CurrentLayout, CurrentLayoutName, PageModelByLayout) {
        super();
        this.Shared = Shared;
        this.CurrentRoute = CurrentRoute;
        this.CurrentPage = CurrentPage;
        this.CurrentPageModel = CurrentPageModel;
        this.CurrentLayout = CurrentLayout;
        this.CurrentLayoutName = CurrentLayoutName;
        this.PageModelByLayout = PageModelByLayout;
    }
}

export function Model_$reflection() {
    return record_type("ElmishLand.kittens_land.App.Model", [], Model, () => [["Shared", unit_type], ["CurrentRoute", Route_$reflection()], ["CurrentPage", Page_$reflection()], ["CurrentPageModel", PageModel_$reflection()], ["CurrentLayout", Layout_$reflection()], ["CurrentLayoutName", LayoutName_$reflection()], ["PageModelByLayout", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [LayoutName_$reflection(), Page_$reflection()])]]);
}

export function commandToCmd(fromSharedMsg, fromLayoutMsg, command) {
    switch (command.tag) {
        case 1:
            return Cmd_batch(map((command_1) => commandToCmd(fromSharedMsg, fromLayoutMsg, command_1), command.fields[0]));
        case 2:
            return command.fields[0];
        case 3: {
            const msg_1 = fromSharedMsg(command.fields[0]);
            return singleton((dispatch) => {
                dispatch(msg_1);
            });
        }
        case 4: {
            const msg_3 = fromLayoutMsg(command.fields[0]);
            return singleton((dispatch_1) => {
                dispatch_1(msg_3);
            });
        }
        default:
            return Cmd_none();
    }
}

export function sharedCommandToCmd(command) {
    switch (command.tag) {
        case 1:
            return Cmd_batch(map(sharedCommandToCmd, command.fields[0]));
        case 2:
            return Cmd_map((Item) => (new Msg(/* SharedMsg */ 0, [Item])), command.fields[0]);
        case 3:
            return singleton((dispatch) => {
                dispatch(new Msg(/* SharedMsg */ 0, [command.fields[0]]));
            });
        case 4:
            throw new Exception("Layout messages should not occur in shared commands");
        default:
            return Cmd_none();
    }
}

export function getMainLayout(currentLayout, currentRoute, sharedModel, layoutProps) {
    const layout = layout_3(layoutProps, currentRoute, sharedModel);
    if (currentLayout.tag === 0) {
        return layout.RouteChanged(currentLayout.fields[1]);
    }
    else {
        return layout.Init();
    }
}

export function mapPage(f, mapLayout, p) {
    return new MappedPage$4(() => {
        const tupledArg = p.Init();
        return [tupledArg[0], Command_map(f, mapLayout, tupledArg[1])];
    }, uncurry2((arg_2) => {
        const f$0027 = curry2(p.Update)(arg_2);
        return (arg_1) => {
            const tupledArg_1 = f$0027(arg_1);
            return [tupledArg_1[0], Command_map(f, mapLayout, tupledArg_1[1])];
        };
    }), p.View, p.Subscriptions, p.LayoutProps, p.LayoutMsgToPageMsg);
}

export function initHomePage(model, route, sharedCmd) {
    const mapPage_1 = (sharedModel) => mapPage((arg) => (new Msg(/* PageMsg */ 2, [new PageMsg(arg)])), (arg_1) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_1])])), page(sharedModel, route));
    const mappedPage = mapPage_1(model.Shared);
    const patternInput = mappedPage.Init();
    const patternInput_1 = getMainLayout(model.CurrentLayout, new Route(/* Home */ 0, [route]), model.Shared, mappedPage.LayoutProps);
    return [new Model(model.Shared, new Route(/* Home */ 0, [route]), new Page(/* Home */ 0, [mapPage_1]), new PageModel(/* Home */ 0, [patternInput[0]]), new Layout(/* Main */ 0, [mappedPage.LayoutProps, patternInput_1[0]]), LayoutName.Main, change(LayoutName.Main, (_arg) => (new Page(/* Home */ 0, [mapPage_1])), model.PageModelByLayout)), commandToCmd((Item_8) => (new Msg(/* SharedMsg */ 0, [Item_8])), (x) => x, Command_batch(ofArray([sharedCmd, patternInput[1], Command_map((arg_2) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_2])])), (arg_3) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_3])])), patternInput_1[1])])))];
}

export function init() {
    const initialUrl = RouteModule_parse(RouterModule_urlSegments(window.location.hash, 1));
    const patternInput = init_2();
    const defaultModel = new Model(patternInput[0], initialUrl, Page.NotFound, PageModel.NotFound, Layout.None, LayoutName.None, empty({
        Compare: (x, y) => (compare(x, y) | 0),
    }));
    if (initialUrl.tag === 1) {
        return [new Model(defaultModel.Shared, defaultModel.CurrentRoute, Page.NotFound, defaultModel.CurrentPageModel, defaultModel.CurrentLayout, defaultModel.CurrentLayoutName, defaultModel.PageModelByLayout), Cmd_none()];
    }
    else {
        return initHomePage(defaultModel, initialUrl.fields[0], Command_map((Item) => (new Msg(/* SharedMsg */ 0, [Item])), (x_1) => x_1, patternInput[1]));
    }
}

export function update(msg, model) {
    switch (msg.tag) {
        case 1: {
            const nextRoute = msg.fields[0];
            if (equals(model.CurrentRoute, nextRoute)) {
                return [model, Cmd_none()];
            }
            else if (nextRoute.tag === 1) {
                return [new Model(model.Shared, Route.NotFound, Page.NotFound, model.CurrentPageModel, Layout.None, LayoutName.None, model.PageModelByLayout), Cmd_none()];
            }
            else {
                return initHomePage(model, nextRoute.fields[0], Command_none());
            }
        }
        case 2: {
            const pageMsg = msg.fields[0];
            const matchValue = model.CurrentPage;
            const matchValue_1 = model.CurrentPageModel;
            let matchResult, mapPage_1, pageModel, pageMsg$0027, currentPage, currentPageModel, pageMsg_1;
            if (matchValue.tag === 0) {
                if (matchValue_1.tag === 0) {
                    matchResult = 0;
                    mapPage_1 = matchValue.fields[0];
                    pageModel = matchValue_1.fields[0];
                    pageMsg$0027 = pageMsg.fields[0];
                }
                else {
                    matchResult = 1;
                    currentPage = matchValue;
                    currentPageModel = matchValue_1;
                    pageMsg_1 = pageMsg;
                }
            }
            else {
                matchResult = 1;
                currentPage = matchValue;
                currentPageModel = matchValue_1;
                pageMsg_1 = pageMsg;
            }
            switch (matchResult) {
                case 0: {
                    const patternInput_2 = mapPage_1(model.Shared).Update(pageMsg$0027, pageModel);
                    return [new Model(model.Shared, model.CurrentRoute, model.CurrentPage, new PageModel(/* Home */ 0, [patternInput_2[0]]), model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), commandToCmd((Item_1) => (new Msg(/* SharedMsg */ 0, [Item_1])), (x_1) => x_1, patternInput_2[1])];
                }
                default: {
                    toConsole(`Unhandled CurrentPage, PageMsg, CurrentPageModel, CurrentRoute. Got
CurrentPage:
${interpolate("%A%P()", [currentPage])}
PageMsg:
${interpolate("%A%P()", [pageMsg_1])}
CurrentPageModel:
${interpolate("%A%P()", [currentPageModel])}`);
                    return [model, Cmd_none()];
                }
            }
        }
        case 3: {
            const layoutMsg_1 = msg.fields[0];
            const matchValue_5 = model.CurrentLayout;
            let matchResult_1, layoutMsg$0027_1, model$0027_1, props_1, layout_2, layoutMsg$0027_2;
            if (layoutMsg_1.tag === 0) {
                if (matchValue_5.tag === 0) {
                    matchResult_1 = 0;
                    layoutMsg$0027_1 = layoutMsg_1.fields[0];
                    model$0027_1 = matchValue_5.fields[1];
                    props_1 = matchValue_5.fields[0];
                }
                else {
                    matchResult_1 = 1;
                    layout_2 = matchValue_5;
                    layoutMsg$0027_2 = layoutMsg_1;
                }
            }
            else {
                matchResult_1 = 1;
                layout_2 = matchValue_5;
                layoutMsg$0027_2 = layoutMsg_1;
            }
            switch (matchResult_1) {
                case 0: {
                    let patternInput_4;
                    const layoutMsg_2 = new LayoutMsg(/* MainMsg */ 0, [layoutMsg$0027_1]);
                    const _arg = tryFind(model.CurrentLayoutName, model.PageModelByLayout);
                    if (_arg != null) {
                        const p = _arg;
                        const matchValue_3 = model.CurrentPageModel;
                        let matchResult_2, layoutMsg$0027, m, mapPage_2;
                        if (p.tag === 0) {
                            if (matchValue_3.tag === 0) {
                                if (layoutMsg_2.tag === 0) {
                                    matchResult_2 = 0;
                                    layoutMsg$0027 = layoutMsg_2.fields[0];
                                    m = matchValue_3.fields[0];
                                    mapPage_2 = p.fields[0];
                                }
                                else {
                                    matchResult_2 = 1;
                                }
                            }
                            else {
                                matchResult_2 = 1;
                            }
                        }
                        else {
                            matchResult_2 = 1;
                        }
                        switch (matchResult_2) {
                            case 0: {
                                const mappedPage = mapPage_2(model.Shared);
                                const patternInput_3 = mappedPage.Update(mappedPage.LayoutMsgToPageMsg(layoutMsg$0027), m);
                                patternInput_4 = [new Model(model.Shared, model.CurrentRoute, model.CurrentPage, new PageModel(/* Home */ 0, [patternInput_3[0]]), model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), patternInput_3[1]];
                                break;
                            }
                            default:
                                patternInput_4 = [model, Command_none()];
                        }
                    }
                    else {
                        patternInput_4 = [model, Command_none()];
                    }
                    const model_2 = patternInput_4[0];
                    const model_1 = model_2;
                    const msg_1 = (arg) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg])]));
                    const patternInput = layout_3(props_1, model_2.CurrentRoute, model_2.Shared).Update(layoutMsg$0027_1, model$0027_1);
                    return [new Model(model_1.Shared, model_1.CurrentRoute, model_1.CurrentPage, model_1.CurrentPageModel, ((tupledArg) => (new Layout(/* Main */ 0, [undefined, undefined])))([props_1, patternInput[0]]), model_1.CurrentLayoutName, model_1.PageModelByLayout), commandToCmd((Item) => (new Msg(/* SharedMsg */ 0, [Item])), (x) => x, Command_batch(ofArray([Command_map(msg_1, msg_1, patternInput[1]), patternInput_4[1]])))];
                }
                default: {
                    toConsole(`Unhandled LayoutMsg and CurrentLayout. Got
LayoutMsg:
${interpolate("%A%P()", [layoutMsg$0027_2])}
CurrentLayout:
${interpolate("%A%P()", [layout_2])}`);
                    return [model, Cmd_none()];
                }
            }
        }
        default: {
            const patternInput_1 = update_2(msg.fields[0], model.Shared);
            return [new Model(patternInput_1[0], model.CurrentRoute, model.CurrentPage, model.CurrentPageModel, model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), sharedCommandToCmd(patternInput_1[1])];
        }
    }
}

export function view(model, dispatch) {
    let currentPageView;
    const matchValue = model.CurrentPageModel;
    const matchValue_1 = model.CurrentRoute;
    let matchResult, m, route;
    if (matchValue.tag === 0) {
        if (matchValue_1.tag === 0) {
            matchResult = 0;
            m = matchValue.fields[0];
            route = matchValue_1.fields[0];
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            currentPageView = page(model.Shared, route).View(m, (arg_1) => {
                dispatch(new Msg(/* PageMsg */ 2, [new PageMsg(arg_1)]));
            });
            break;
        }
        default:
            currentPageView = view_1();
    }
    const matchValue_3 = model.CurrentLayout;
    if (matchValue_3.tag === 1) {
        return currentPageView;
    }
    else {
        return layout_3(matchValue_3.fields[0], model.CurrentRoute, model.Shared).View(matchValue_3.fields[1], currentPageView, (arg_3) => {
            dispatch(new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_3])]));
        });
    }
}

function urlChangeSubscription(_model) {
    return singleton([ofArray(["ElmishLand", "UrlChanges"]), (dispatch) => RouterModule_subscribeToUrlChanges(1, (arg_1) => {
        dispatch(new Msg(/* RouteChanged */ 1, [RouteModule_parse(arg_1)]));
    })]);
}

export function subscribe(model) {
    return Sub_batch(toList(delay(() => append(singleton_1(Sub_map("Shared", (Item) => (new Msg(/* SharedMsg */ 0, [Item])), subscriptions(model.Shared))), delay(() => append(singleton_1(urlChangeSubscription(model)), delay(() => {
        let matchValue;
        return append((matchValue = model.CurrentLayout, (matchValue.tag === 0) ? singleton_1(Sub_map("LayoutMain", (arg) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg])])), layout_3(matchValue.fields[0], model.CurrentRoute, model.Shared).Subscriptions(matchValue.fields[1]))) : singleton_1(Sub_none())), delay(() => {
            const matchValue_1 = model.CurrentRoute;
            const matchValue_2 = model.CurrentPageModel;
            let matchResult, pageModel, route;
            if (matchValue_1.tag === 0) {
                if (matchValue_2.tag === 0) {
                    matchResult = 0;
                    pageModel = matchValue_2.fields[0];
                    route = matchValue_1.fields[0];
                }
                else {
                    matchResult = 1;
                }
            }
            else {
                matchResult = 1;
            }
            switch (matchResult) {
                case 0:
                    return singleton_1(Sub_map("PageHome", (arg_1) => (new Msg(/* PageMsg */ 2, [new PageMsg(arg_1)])), page(model.Shared, route).Subscriptions()));
                default:
                    return singleton_1(Sub_none());
            }
        }));
    })))))));
}

ProgramModule_run(ProgramModule_withSubscription(subscribe, Program_withReactSynchronous("app", ProgramModule_withErrorHandler((tupledArg) => {
    toConsole(printf("Program error handler:\r\n%s\r\n%O"))(tupledArg[0])(tupledArg[1]);
}, ProgramModule_mkProgram(init, update, view)))));

