
import { split, trimEnd, isNullOrWhiteSpace, substring, join } from "../App/fable_modules/fable-library-js.5.17.0/String.js";
import { ofArray, singleton, collect, empty, head, tail, isEmpty, reverse, map } from "../App/fable_modules/fable-library-js.5.17.0/List.js";
import { defaultOf } from "../App/fable_modules/fable-library-js.5.17.0/Util.js";
import { item, equalsWith } from "../App/fable_modules/fable-library-js.5.17.0/Array.js";
import { tryParse } from "../App/fable_modules/fable-library-js.5.17.0/Int32.js";
import { FSharpRef } from "../App/fable_modules/fable-library-js.5.17.0/Types.js";
import { tryParse as tryParse_1 } from "../App/fable_modules/fable-library-js.5.17.0/Long.js";
import { tryParse as tryParse_2 } from "../App/fable_modules/fable-library-js.5.17.0/Guid.js";
import { tryParse as tryParse_3 } from "../App/fable_modules/fable-library-js.5.17.0/Double.js";
import { tryParse as tryParse_4 } from "../App/fable_modules/fable-library-js.5.17.0/Decimal.js";
import Decimal from "../App/fable_modules/fable-library-js.5.17.0/Decimal.js";
import { map as map_1, delay, toList } from "../App/fable_modules/fable-library-js.5.17.0/Seq.js";

export function RouterModule_String_$007CPrefix$007C(prefix, str) {
    if (str.startsWith(prefix)) {
        return str;
    }
    else {
        return undefined;
    }
}

export function RouterModule_String_$007CSuffix$007C(suffix, str) {
    if (str.endsWith(suffix)) {
        return str;
    }
    else {
        return undefined;
    }
}

export function RouterModule_encodeQueryString(queryStringPairs) {
    const _arg = join("&", map((tupledArg) => {
        const key = tupledArg[0];
        const value = tupledArg[1];
        return join("=", [encodeURIComponent(key), encodeURIComponent(value)]);
    }, queryStringPairs));
    if (_arg === "") {
        return "";
    }
    else {
        const pairs = _arg;
        return "?" + pairs;
    }
}

export function RouterModule_encodeQueryStringInts(queryStringIntPairs) {
    const _arg = join("&", map((tupledArg) => {
        const key = tupledArg[0];
        const value = tupledArg[1] | 0;
        return join("=", [encodeURIComponent(key), value]);
    }, queryStringIntPairs));
    if (_arg === "") {
        return "";
    }
    else {
        const pairs = _arg;
        return "?" + pairs;
    }
}

function RouterModule_normalizeRoute(routeMode) {
    if (routeMode === 1) {
        return (_arg) => {
            let path_2, path_3;
            const activePatternResult = RouterModule_String_$007CPrefix$007C("/", _arg);
            if (activePatternResult != null) {
                const path = activePatternResult;
                return "#" + path;
            }
            else {
                const activePatternResult_1 = RouterModule_String_$007CPrefix$007C("#/", _arg);
                if (activePatternResult_1 != null) {
                    const path_1 = activePatternResult_1;
                    return path_1;
                }
                else {
                    const activePatternResult_2 = RouterModule_String_$007CPrefix$007C("#", _arg);
                    return (activePatternResult_2 != null) ? ((path_2 = activePatternResult_2, "#/" + substring(path_2, 1, path_2.length - 1))) : ((path_3 = _arg, "#/" + path_3));
                }
            }
        };
    }
    else {
        return (_arg_1) => {
            let path_4, path_5;
            const activePatternResult_3 = RouterModule_String_$007CPrefix$007C("/", _arg_1);
            return (activePatternResult_3 != null) ? ((path_4 = activePatternResult_3, path_4)) : ((path_5 = _arg_1, "/" + path_5));
        };
    }
}

export function RouterModule_encodeParts(xs, routeMode) {
    return RouterModule_normalizeRoute(routeMode)(join("/", map((part) => {
        if (((part.indexOf("?") >= 0) ? true : part.startsWith("#")) ? true : part.startsWith("/")) {
            return part;
        }
        else {
            return encodeURIComponent(part);
        }
    }, xs)));
}

/**
 * Safely returns tuple of list items without last one and last item
 */
export function RouterModule_trySeparateLast(xs) {
    const matchValue = reverse(xs);
    if (!isEmpty(matchValue)) {
        if (isEmpty(tail(matchValue))) {
            const single = head(matchValue);
            return [empty(), single];
        }
        else {
            const list_1 = matchValue;
            return [reverse(tail(list_1)), head(list_1)];
        }
    }
    else {
        return undefined;
    }
}

export function RouterModule_nav(xs, mode, routeMode) {
    if (mode === 1) {
        history.pushState(defaultOf(), "", RouterModule_encodeParts(xs, routeMode));
    }
    else {
        history.replaceState(defaultOf(), "", RouterModule_encodeParts(xs, routeMode));
    }
    const ev = document.createEvent("CustomEvent");
    ev.initEvent("CUSTOM_NAVIGATION_EVENT", true, true);
    window.dispatchEvent(ev);
}

/**
 * Parses the URL into multiple path segments
 */
export function RouterModule_urlSegments(path, mode) {
    return collect((segment) => {
        if (isNullOrWhiteSpace(segment)) {
            return empty();
        }
        else {
            const segment_1 = trimEnd(segment, "#");
            if (segment_1 === "?") {
                return empty();
            }
            else if (RouterModule_String_$007CPrefix$007C("?", segment_1) != null) {
                return singleton(segment_1);
            }
            else {
                const matchValue = segment_1.split("?");
                if (!equalsWith((x, y) => (x === y), matchValue, defaultOf()) && (matchValue.length === 1)) {
                    const value = item(0, matchValue);
                    return singleton(decodeURIComponent(value));
                }
                else if (!equalsWith((x_1, y_1) => (x_1 === y_1), matchValue, defaultOf()) && (matchValue.length === 2)) {
                    if (item(1, matchValue) === "") {
                        const value_1 = item(0, matchValue);
                        return singleton(decodeURIComponent(value_1));
                    }
                    else {
                        const value_2 = item(0, matchValue);
                        const query = item(1, matchValue);
                        return ofArray([decodeURIComponent(value_2), "?" + query]);
                    }
                }
                else {
                    return empty();
                }
            }
        }
    }, ofArray(split((RouterModule_String_$007CPrefix$007C("#", path) != null) ? substring(path, 1, path.length - 1) : ((mode === 1) ? ((RouterModule_String_$007CSuffix$007C("#", path) != null) ? "" : ((RouterModule_String_$007CSuffix$007C("#/", path) != null) ? "" : path)) : path), ["/"], undefined, 0)));
}

export function RouterModule_onUrlChange(routeMode, urlChanged, _ev) {
    return urlChanged(RouterModule_urlSegments((routeMode === 2) ? (window.location.pathname + window.location.search) : window.location.hash, routeMode));
}

/**
 * Subscribe to URL changes via the browser's native events plus the
 * customNavigationEvent dispatched by Router.nav. Returns an IDisposable
 * that removes the listeners. This is plain F# / browser interop, so it
 * works with any Feliz version (1.x, 2.x or 3.x).
 */
export function RouterModule_subscribeToUrlChanges(routeMode, urlChanged) {
    const onChange = (ev) => {
        RouterModule_onUrlChange(routeMode, urlChanged, ev);
    };
    if (((window.navigator.userAgent).indexOf("Trident") >= 0) ? true : ((window.navigator.userAgent).indexOf("MSIE") >= 0)) {
        window.addEventListener("hashchange", onChange);
    }
    else {
        window.addEventListener("popstate", onChange);
    }
    window.addEventListener("CUSTOM_NAVIGATION_EVENT", onChange);
    const ev_1 = document.createEvent("CustomEvent");
    ev_1.initEvent("CUSTOM_NAVIGATION_EVENT", true, true);
    window.dispatchEvent(ev_1);
    return {
        Dispose() {
            if (((window.navigator.userAgent).indexOf("Trident") >= 0) ? true : ((window.navigator.userAgent).indexOf("MSIE") >= 0)) {
                window.removeEventListener("hashchange", onChange);
            }
            else {
                window.removeEventListener("popstate", onChange);
            }
            window.removeEventListener("CUSTOM_NAVIGATION_EVENT", onChange);
        },
    };
}

export function Route_$007CInt$007C_$007C(input) {
    let matchValue;
    let outArg = 0;
    matchValue = [tryParse(input, 511, false, 32, new FSharpRef(() => (outArg | 0), (v) => {
        outArg = (v | 0);
    })), outArg];
    if (matchValue[0]) {
        const value = matchValue[1] | 0;
        return value;
    }
    else {
        return undefined;
    }
}

export function Route_$007CInt64$007C_$007C(input) {
    let matchValue;
    let outArg = 0n;
    matchValue = [tryParse_1(input, 511, false, 64, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const value = matchValue[1];
        return value;
    }
    else {
        return undefined;
    }
}

export function Route_$007CGuid$007C_$007C(input) {
    let matchValue;
    let outArg = "00000000-0000-0000-0000-000000000000";
    matchValue = [tryParse_2(input, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const value = matchValue[1];
        return value;
    }
    else {
        return undefined;
    }
}

export function Route_$007CNumber$007C_$007C(input) {
    let matchValue;
    let outArg = 0;
    matchValue = [tryParse_3(input, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const value = matchValue[1];
        return value;
    }
    else {
        return undefined;
    }
}

export function Route_$007CDecimal$007C_$007C(input) {
    let matchValue;
    let outArg = new Decimal("0");
    matchValue = [tryParse_4(input, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const value = matchValue[1];
        return value;
    }
    else {
        return undefined;
    }
}

export function Route_$007CBool$007C_$007C(input) {
    const matchValue = input.toLocaleLowerCase();
    switch (matchValue) {
        case "1":
        case "true":
            return true;
        case "0":
        case "false":
            return false;
        case "":
            return true;
        default:
            return undefined;
    }
}

/**
 * Used to parse the query string parameter of the route.
 * 
 * For example to match against
 * 
 * `/users?id={value}`
 * 
 * You can pattern match:
 * 
 * `[ "users"; Route.Query [ "id", value ] ] -> value`
 * 
 * When `{value}` is an integer then you can pattern match:
 * 
 * `[ "users"; Route.Query [ "id", Route.Int userId ] ] -> userId`
 */
export function Route_$007CQuery$007C_$007C(input) {
    try {
        const urlParams = new URLSearchParams(input);
        return toList(delay(() => map_1((entry) => [item(0, entry), item(1, entry)], urlParams.entries())));
    }
    catch (matchValue) {
        return undefined;
    }
}

