
import { FSharpRef, Record, Union } from "./fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, list_type, string_type, class_type, lambda_type, tuple_type, unit_type, union_type } from "./fable_modules/fable-library-js.5.17.0/Reflection.js";
import { layout as layout_3, Msg_$reflection as Msg_$reflection_1 } from "../../src/Pages/Layout.fs.js";
import { page, Model_$reflection as Model_$reflection_1, Msg_$reflection as Msg_$reflection_2 } from "../../src/Pages/Page.fs.js";
import { subscriptions, update as update_2, init as init_2, SharedMsg_$reflection } from "../../src/Shared.fs.js";
import { RouteModule_parse, Route, Route_$reflection } from "../Base/Routes.fs.js";
import { Command_none, Command_batch, Command_map, Command$3_$reflection } from "../Base/Command.fs.js";
import { Cmd_map, Cmd_none, Cmd_batch } from "./fable_modules/Fable.Elmish.5.0.2/cmd.fs.js";
import { ofArray, singleton, map } from "./fable_modules/fable-library-js.5.17.0/List.js";
import { equals, compare, uncurry2, curry2, Exception } from "./fable_modules/fable-library-js.5.17.0/Util.js";
import { tryFind, empty, change } from "./fable_modules/fable-library-js.5.17.0/Map.js";
import { RouterModule_urlSegments } from "../Base/./Router.fs.js";
import { printf, interpolate, toConsole } from "./fable_modules/fable-library-js.5.17.0/String.js";
import { view as view_1 } from "../../src/Pages/NotFound.fs.js";
import { RouterModule_subscribeToUrlChanges } from "../Base/Router.fs.js";
import { Sub_none, Sub_map, Sub_batch } from "./fable_modules/Fable.Elmish.5.0.2/sub.fs.js";
import { singleton as singleton_1, append, delay, toList } from "./fable_modules/fable-library-js.5.17.0/Seq.js";
import { ProgramModule_mkProgram, ProgramModule_withErrorHandler, ProgramModule_withSubscription } from "./fable_modules/Fable.Elmish.5.0.2/program.fs.js";
import { lazyView2With } from "./fable_modules/Fable.Elmish.HMR.9.0.0/./common.fs.js";
import { ProgramModule_map, ProgramModule_runWith, ProgramModule_withSetState, ProgramModule_view } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../Fable.Elmish.5.0.2/program.fs.js";
import { Internal_saveState, Internal_tryRestoreState, RootCache_getOrCreateRoot } from "./fable_modules/Fable.Elmish.HMR.9.0.0/./hmr.fs.js";
import { defaultOf } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../.././fable_modules/fable-library-js.5.17.0/Util.js";
import { current as current_2 } from "./fable_modules/Fable.Elmish.HMR.9.0.0/./Bundler.fs.js";
import { Operators_IsNull } from "./fable_modules/fable-library-js.5.17.0/FSharp.Core.js";
import { Cmd_map as Cmd_map_1, Cmd_none as Cmd_none_1 } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../Fable.Elmish.5.0.2/cmd.fs.js";
import { Msg$1 } from "./fable_modules/Fable.Elmish.HMR.9.0.0/hmr.fs.js";
import { Sub_map as Sub_map_1, Sub_batch as Sub_batch_1 } from "./fable_modules/Fable.Elmish.HMR.9.0.0/../Fable.Elmish.5.0.2/sub.fs.js";

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
    return union_type("ElmishLand.kittens_land.App.PageModel", [], PageModel, () => [[["Item", Model_$reflection_1()]], []]);
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
    return union_type("ElmishLand.kittens_land.App.Page", [], Page, () => [[["Item", lambda_type(unit_type, MappedPage$4_$reflection(Msg_$reflection_2(), Model_$reflection_1(), Msg_$reflection_1(), unit_type))]], []]);
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
        case 1: {
            const cmds = command.fields[0];
            return Cmd_batch(map((command_1) => commandToCmd(fromSharedMsg, fromLayoutMsg, command_1), cmds));
        }
        case 2: {
            const cmd = command.fields[0];
            return cmd;
        }
        case 3: {
            const msg = command.fields[0];
            const msg_1 = fromSharedMsg(msg);
            return singleton((dispatch) => {
                dispatch(msg_1);
            });
        }
        case 4: {
            const msg_2 = command.fields[0];
            const msg_3 = fromLayoutMsg(msg_2);
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
        case 1: {
            const cmds = command.fields[0];
            return Cmd_batch(map(sharedCommandToCmd, cmds));
        }
        case 2: {
            const cmd = command.fields[0];
            return Cmd_map((Item) => (new Msg(/* SharedMsg */ 0, [Item])), cmd);
        }
        case 3: {
            const msg = command.fields[0];
            return singleton((dispatch) => {
                dispatch(new Msg(/* SharedMsg */ 0, [msg]));
            });
        }
        case 4:
            throw new Exception("Layout messages should not occur in shared commands");
        default:
            return Cmd_none();
    }
}

export function getMainLayout(currentLayout, currentRoute, sharedModel, layoutProps) {
    const layout = layout_3(layoutProps, currentRoute, sharedModel);
    if (currentLayout.tag === 0) {
        const m = currentLayout.fields[1];
        return layout.RouteChanged();
    }
    else {
        return layout.Init();
    }
}

export function mapPage(f, mapLayout, p) {
    const init_1 = () => {
        const tupledArg = p.Init();
        const m = tupledArg[0];
        const c = tupledArg[1];
        return [m, Command_map(f, mapLayout, c)];
    };
    const update_1 = (arg_2) => {
        const f$0027 = curry2(p.Update)(arg_2);
        return (arg_1) => {
            const tupledArg_1 = f$0027(arg_1);
            const m_1 = tupledArg_1[0];
            const c_1 = tupledArg_1[1];
            return [m_1, Command_map(f, mapLayout, c_1)];
        };
    };
    return new MappedPage$4(init_1, uncurry2(update_1), p.View, p.Subscriptions, p.LayoutProps, p.LayoutMsgToPageMsg);
}

export function initHomePage(model, route, sharedCmd) {
    const mapPage_1 = (sharedModel) => mapPage((arg) => (new Msg(/* PageMsg */ 2, [new PageMsg(arg)])), (arg_1) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_1])])), page(sharedModel, route));
    const mappedPage = mapPage_1(model.Shared);
    const patternInput = mappedPage.Init();
    const pageModel = patternInput[0];
    const pageCmd = patternInput[1];
    const patternInput_1 = getMainLayout(model.CurrentLayout, new Route(/* Home */ 0, [route]), model.Shared, mappedPage.LayoutProps);
    const layoutModel = patternInput_1[0];
    const layoutCmd = patternInput_1[1];
    const layout = new Layout(/* Main */ 0, [mappedPage.LayoutProps, layoutModel]);
    return [new Model(model.Shared, new Route(/* Home */ 0, [route]), new Page(/* Home */ 0, [mapPage_1]), new PageModel(/* Home */ 0, [pageModel]), layout, LayoutName.Main, change(LayoutName.Main, (_arg) => (new Page(/* Home */ 0, [mapPage_1])), model.PageModelByLayout)), commandToCmd((Item_8) => (new Msg(/* SharedMsg */ 0, [Item_8])), (x) => x, Command_batch(ofArray([sharedCmd, pageCmd, Command_map((arg_2) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_2])])), (arg_3) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_3])])), layoutCmd)])))];
}

export function init() {
    const initialUrl = RouteModule_parse(RouterModule_urlSegments(window.location.hash, 1));
    const patternInput = init_2();
    const sharedModel = patternInput[0];
    const sharedCmd = patternInput[1];
    const defaultModel = new Model(sharedModel, initialUrl, Page.NotFound, PageModel.NotFound, Layout.None, LayoutName.None, empty({
        Compare: (x, y) => (compare(x, y) | 0),
    }));
    if (initialUrl.tag === 1) {
        return [new Model(defaultModel.Shared, defaultModel.CurrentRoute, Page.NotFound, defaultModel.CurrentPageModel, defaultModel.CurrentLayout, defaultModel.CurrentLayoutName, defaultModel.PageModelByLayout), Cmd_none()];
    }
    else {
        const route = initialUrl.fields[0];
        return initHomePage(defaultModel, route, Command_map((Item) => (new Msg(/* SharedMsg */ 0, [Item])), (x_1) => x_1, sharedCmd));
    }
}

export function update(msg, model) {
    const updateLayout = (model_1, layout, props, model$0027, mapLayout, layoutMsg, msg_1, pageCmd) => {
        const patternInput = layout.Update(layoutMsg, model$0027);
        const model$0027$0027 = patternInput[0];
        const cmd = patternInput[1];
        return [new Model(model_1.Shared, model_1.CurrentRoute, model_1.CurrentPage, model_1.CurrentPageModel, mapLayout([props, model$0027$0027]), model_1.CurrentLayoutName, model_1.PageModelByLayout), commandToCmd((Item) => (new Msg(/* SharedMsg */ 0, [Item])), (x) => x, Command_batch(ofArray([Command_map(msg_1, msg_1, cmd), pageCmd])))];
    };
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
                const route = nextRoute.fields[0];
                return initHomePage(model, route, Command_none());
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
                    const pageModel_1 = patternInput_2[0];
                    const pageCmd_1 = patternInput_2[1];
                    return [new Model(model.Shared, model.CurrentRoute, model.CurrentPage, new PageModel(/* Home */ 0, [pageModel_1]), model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), commandToCmd((Item_1) => (new Msg(/* SharedMsg */ 0, [Item_1])), (x_1) => x_1, pageCmd_1)];
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
            const updatePage = (layoutMsg_2) => {
                const _arg = tryFind(model.CurrentLayoutName, model.PageModelByLayout);
                if (_arg != null) {
                    const p = _arg;
                    const matchValue_3 = model.CurrentPageModel;
                    let matchResult_1, layoutMsg$0027, m, mapPage_2;
                    if (p.tag === 0) {
                        if (matchValue_3.tag === 0) {
                            if (layoutMsg_2.tag === 0) {
                                matchResult_1 = 0;
                                layoutMsg$0027 = layoutMsg_2.fields[0];
                                m = matchValue_3.fields[0];
                                mapPage_2 = p.fields[0];
                            }
                            else {
                                matchResult_1 = 1;
                            }
                        }
                        else {
                            matchResult_1 = 1;
                        }
                    }
                    else {
                        matchResult_1 = 1;
                    }
                    switch (matchResult_1) {
                        case 0: {
                            const mappedPage = mapPage_2(model.Shared);
                            const pageMsg_2 = mappedPage.LayoutMsgToPageMsg(layoutMsg$0027);
                            const patternInput_3 = mappedPage.Update(pageMsg_2, m);
                            const m_1 = patternInput_3[0];
                            const cmd_2 = patternInput_3[1];
                            return [new Model(model.Shared, model.CurrentRoute, model.CurrentPage, new PageModel(/* Home */ 0, [m_1]), model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), cmd_2];
                        }
                        default:
                            return [model, Command_none()];
                    }
                }
                else {
                    return [model, Command_none()];
                }
            };
            const matchValue_5 = model.CurrentLayout;
            let matchResult_2, layoutMsg$0027_1, model$0027_1, props_1, layout_2, layoutMsg$0027_2;
            if (layoutMsg_1.tag === 0) {
                if (matchValue_5.tag === 0) {
                    matchResult_2 = 0;
                    layoutMsg$0027_1 = layoutMsg_1.fields[0];
                    model$0027_1 = matchValue_5.fields[1];
                    props_1 = matchValue_5.fields[0];
                }
                else {
                    matchResult_2 = 1;
                    layout_2 = matchValue_5;
                    layoutMsg$0027_2 = layoutMsg_1;
                }
            }
            else {
                matchResult_2 = 1;
                layout_2 = matchValue_5;
                layoutMsg$0027_2 = layoutMsg_1;
            }
            switch (matchResult_2) {
                case 0: {
                    const patternInput_4 = updatePage(new LayoutMsg(/* MainMsg */ 0, [layoutMsg$0027_1]));
                    const pageCmd_2 = patternInput_4[1];
                    const model_2 = patternInput_4[0];
                    const layout_1 = layout_3(props_1, model_2.CurrentRoute, model_2.Shared);
                    return updateLayout(model_2, layout_1, props_1, model$0027_1, (tupledArg) => (new Layout(/* Main */ 0, [undefined, undefined])), layoutMsg$0027_1, (arg) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg])])), pageCmd_2);
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
            const msg$0027 = msg.fields[0];
            const patternInput_1 = update_2(msg$0027, model.Shared);
            const model$0027$0027_1 = patternInput_1[0];
            const cmd_1 = patternInput_1[1];
            return [new Model(model$0027$0027_1, model.CurrentRoute, model.CurrentPage, model.CurrentPageModel, model.CurrentLayout, model.CurrentLayoutName, model.PageModelByLayout), sharedCommandToCmd(cmd_1)];
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
    let currentView;
    const matchValue_3 = model.CurrentLayout;
    if (matchValue_3.tag === 1) {
        currentView = currentPageView;
    }
    else {
        const props = matchValue_3.fields[0];
        const m_1 = matchValue_3.fields[1];
        currentView = layout_3(props, model.CurrentRoute, model.Shared).View(m_1, currentPageView, (arg_3) => {
            dispatch(new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg_3])]));
        });
    }
    return currentView;
}

function urlChangeSubscription(_model) {
    const routeMode = 1;
    return singleton([ofArray(["ElmishLand", "UrlChanges"]), (dispatch) => RouterModule_subscribeToUrlChanges(routeMode, (arg_1) => {
        dispatch(new Msg(/* RouteChanged */ 1, [RouteModule_parse(arg_1)]));
    })]);
}

export function subscribe(model) {
    return Sub_batch(toList(delay(() => append(singleton_1(Sub_map("Shared", (Item) => (new Msg(/* SharedMsg */ 0, [Item])), subscriptions(model.Shared))), delay(() => append(singleton_1(urlChangeSubscription(model)), delay(() => {
        let matchValue, props, m;
        return append((matchValue = model.CurrentLayout, (matchValue.tag === 0) ? ((props = matchValue.fields[0], (m = matchValue.fields[1], singleton_1(Sub_map("LayoutMain", (arg) => (new Msg(/* LayoutMsg */ 3, [new LayoutMsg(/* MainMsg */ 0, [arg])])), layout_3(props, model.CurrentRoute, model.Shared).Subscriptions()))))) : singleton_1(Sub_none())), delay(() => {
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
                    return singleton_1(Sub_map("PageHome", (arg_1) => (new Msg(/* PageMsg */ 2, [new PageMsg(arg_1)])), page(model.Shared, route).Subscriptions(pageModel)));
                default:
                    return singleton_1(Sub_none());
            }
        }));
    })))))));
}

(function () {
    const program_4 = ProgramModule_withSubscription(subscribe, (() => {
        const program_2 = ProgramModule_withErrorHandler((tupledArg) => {
            const msg_1 = tupledArg[0];
            const ex = tupledArg[1];
            toConsole(printf("Program error handler:\r\n%s\r\n%O"))(msg_1)(ex);
        }, ProgramModule_mkProgram(init, update, view));
        const render = lazyView2With((x, y) => (x === y), uncurry2(ProgramModule_view(program_2)));
        const root = RootCache_getOrCreateRoot("app");
        const setState = (model_2, dispatch_1) => {
            root.render(render(model_2)(dispatch_1));
        };
        return ProgramModule_withSetState(setState, program_2);
    })());
    const hmrState = new FSharpRef(defaultOf());
    if (current_2 == null) {
    }
    else {
        const current = current_2;
        window.Elmish_HMR_Count = (Operators_IsNull(window.Elmish_HMR_Count) ? 0 : (window.Elmish_HMR_Count + 1));
        let hmrDataObject;
        switch (current.tag) {
            case 1: {
                ((import.meta.webpackHot /* If error see https://github.com/elmish/hmr/issues/35 */)).accept();
                hmrDataObject = ((import.meta.webpackHot /* If error see https://github.com/elmish/hmr/issues/35 */)).data;
                break;
            }
            case 2: {
                (module.hot).accept();
                hmrDataObject = (module.hot).data;
                break;
            }
            default: {
                import.meta.hot.accept();
                hmrDataObject = (import.meta.hot.data);
            }
        }
        Internal_tryRestoreState(hmrState, hmrDataObject);
    }
    const mapUpdate = (userUpdate, msg_2, model_4) => {
        let patternInput;
        if (msg_2.tag === 1) {
            patternInput = [model_4, Cmd_none_1()];
        }
        else {
            const userMsg = msg_2.fields[0];
            patternInput = userUpdate(userMsg)(model_4);
        }
        const newModel = patternInput[0];
        const cmd = patternInput[1];
        hmrState.contents = newModel;
        return [newModel, Cmd_map_1((Item) => (new Msg$1(/* UserMsg */ 0, [Item])), cmd)];
    };
    const createModel = (tupledArg_1) => {
        const model_1_1 = tupledArg_1[0];
        const cmd_1 = tupledArg_1[1];
        return [model_1_1, cmd_1];
    };
    const mapInit = (userInit, args) => {
        if (Operators_IsNull(hmrState.contents)) {
            const patternInput_1 = userInit(args);
            const userModel = patternInput_1[0];
            const userCmd = patternInput_1[1];
            return [userModel, Cmd_map_1((Item_1) => (new Msg$1(/* UserMsg */ 0, [Item_1])), userCmd)];
        }
        else {
            return [hmrState.contents, Cmd_none_1()];
        }
    };
    const mapSetState = (userSetState, userModel_1, dispatch_2) => userSetState(userModel_1)((arg_3) => dispatch_2(new Msg$1(/* UserMsg */ 0, [arg_3])));
    let hmrSubscription;
    const handler = (dispatch_1_1) => {
        if (current_2 == null) {
        }
        else {
            const current_1 = current_2;
            switch (current_1.tag) {
                case 1: {
                    ((import.meta.webpackHot /* If error see https://github.com/elmish/hmr/issues/35 */)).dispose((data_1) => {
                        Internal_saveState(data_1, hmrState.contents);
                        dispatch_1_1(Msg$1.Stop);
                    });
                    break;
                }
                case 2: {
                    (module.hot).dispose((data_2) => {
                        Internal_saveState(data_2, hmrState.contents);
                        dispatch_1_1(Msg$1.Stop);
                    });
                    break;
                }
                default:
                    import.meta.hot.dispose((data) => {
                        Internal_saveState(data, hmrState.contents);
                        dispatch_1_1(Msg$1.Stop);
                    });
            }
        }
        return {
            Dispose() {
            },
        };
    };
    hmrSubscription = singleton([singleton("Hmr"), handler]);
    const mapSubscribe = (subscribe_1, model_2_1) => Sub_batch_1(ofArray([Sub_map_1("HmrUser", (Item_3) => (new Msg$1(/* UserMsg */ 0, [Item_3])), subscribe_1(model_2_1)), hmrSubscription]));
    const mapView = (userView, model_3_1, dispatch_2_1) => userView(model_3_1)((arg_4) => dispatch_2_1(new Msg$1(/* UserMsg */ 0, [arg_4])));
    const mapTermination = (tupledArg_1_1) => {
        const predicate = tupledArg_1_1[0];
        const terminate = tupledArg_1_1[1];
        const mapPredicate = (_arg) => {
            if (_arg.tag === 1) {
                return true;
            }
            else {
                const msg_1_1 = _arg.fields[0];
                return predicate(msg_1_1);
            }
        };
        return [mapPredicate, terminate];
    };
    ProgramModule_runWith(undefined, ProgramModule_map(mapInit, mapUpdate, mapView, mapSetState, mapSubscribe, mapTermination, program_4));
})();

