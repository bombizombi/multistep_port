
import { FSharpRef, toString, Union } from "../App/fable_modules/fable-library-js.5.17.0/Types.js";
import { union_type, unit_type } from "../App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { int64ToString, int32ToString } from "../App/fable_modules/fable-library-js.5.17.0/Util.js";
import { tryParse as tryParse_5, toString as toString_1 } from "../App/fable_modules/fable-library-js.5.17.0/Decimal.js";
import Decimal from "../App/fable_modules/fable-library-js.5.17.0/Decimal.js";
import { tryParse } from "../App/fable_modules/fable-library-js.5.17.0/Guid.js";
import { tryParse as tryParse_1 } from "../App/fable_modules/fable-library-js.5.17.0/Int32.js";
import { tryParse as tryParse_2 } from "../App/fable_modules/fable-library-js.5.17.0/Long.js";
import { tryParse as tryParse_3 } from "../App/fable_modules/fable-library-js.5.17.0/Boolean.js";
import { tryParse as tryParse_4 } from "../App/fable_modules/fable-library-js.5.17.0/Double.js";
import { RouterModule_urlSegments, RouterModule_encodeParts } from "./Router.fs.js";
import { tail, head, append, last, isEmpty, tryPick, exists, empty, singleton } from "../App/fable_modules/fable-library-js.5.17.0/List.js";
import { map, delay, toList } from "../App/fable_modules/fable-library-js.5.17.0/Seq.js";
import { item } from "../App/fable_modules/fable-library-js.5.17.0/Array.js";
import { toConsole, printf, toFail, compare } from "../App/fable_modules/fable-library-js.5.17.0/String.js";
import { value as value_1, some } from "../App/fable_modules/fable-library-js.5.17.0/Option.js";

export class Route extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Home", "NotFound"];
    }
    static NotFound = new Route(1, []);
}

export function Route_$reflection() {
    return union_type("ElmishLand.Routes.Route", [], Route, () => [[["Item", unit_type]], []]);
}

export function RouteModule_formatGuid(x) {
    return x;
}

export function RouteModule_formatInt(x) {
    return int32ToString(x);
}

export function RouteModule_formatInt64(x) {
    return int64ToString(x);
}

export function RouteModule_formatBool(x) {
    return toString(x);
}

export function RouteModule_formatFloat(x) {
    return x.toString();
}

export function RouteModule_formatDecimal(x) {
    return toString_1(x);
}

function RouteModule_parseGuid(x) {
    let matchValue;
    let outArg = "00000000-0000-0000-0000-000000000000";
    matchValue = [tryParse(x, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1];
        return x$0027;
    }
    else {
        return undefined;
    }
}

function RouteModule_parseInt(x) {
    let matchValue;
    let outArg = 0;
    matchValue = [tryParse_1(x, 511, false, 32, new FSharpRef(() => (outArg | 0), (v) => {
        outArg = (v | 0);
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1] | 0;
        return x$0027;
    }
    else {
        return undefined;
    }
}

function RouteModule_parseInt64(x) {
    let matchValue;
    let outArg = 0n;
    matchValue = [tryParse_2(x, 511, false, 64, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1];
        return x$0027;
    }
    else {
        return undefined;
    }
}

function RouteModule_parseBool(x) {
    let matchValue;
    let outArg = false;
    matchValue = [tryParse_3(x, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1];
        return x$0027;
    }
    else {
        return undefined;
    }
}

function RouteModule_parseFloat(x) {
    let matchValue;
    let outArg = 0;
    matchValue = [tryParse_4(x, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1];
        return x$0027;
    }
    else {
        return undefined;
    }
}

function RouteModule_parseDecimal(x) {
    let matchValue;
    let outArg = new Decimal("0");
    matchValue = [tryParse_5(x, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const x$0027 = matchValue[1];
        return x$0027;
    }
    else {
        return undefined;
    }
}

export function RouteModule_format(_arg) {
    if (_arg.tag === 1) {
        return "notFound";
    }
    else {
        return RouterModule_encodeParts(singleton(""), 1);
    }
}

function RouteModule_$007CQuery$007C_$007C(input) {
    try {
        if (input.startsWith("?")) {
            const urlParams = new URLSearchParams(input);
            return toList(delay(() => map((entry) => [item(0, entry), item(1, entry)], urlParams.entries())));
        }
        else {
            return empty();
        }
    }
    catch (matchValue) {
        return empty();
    }
}

function RouteModule_eq(x, y) {
    return compare(x, y, 3) === 0;
}

function RouteModule_containsQuery(name, parser, query) {
    return exists((tupledArg) => {
        const name$0027 = tupledArg[0];
        const value = tupledArg[1];
        if (RouteModule_eq(name$0027, name)) {
            return parser(value) != null;
        }
        else {
            return false;
        }
    }, query);
}

function RouteModule_tryGetQuery(name, parser, query) {
    return tryPick((tupledArg) => {
        let value$0027;
        const name$0027 = tupledArg[0];
        const value = tupledArg[1];
        const matchValue = parser(value);
        let matchResult, value$0027_1;
        if (matchValue != null) {
            if ((value$0027 = value_1(matchValue), RouteModule_eq(name$0027, name))) {
                matchResult = 0;
                value$0027_1 = value_1(matchValue);
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
                return some(value$0027_1);
            default:
                return undefined;
        }
    }, query);
}

function RouteModule_getQuery(name, parser, query) {
    const option_1 = RouteModule_tryGetQuery(name, parser, query);
    if (option_1 != null) {
        return value_1(option_1);
    }
    else {
        return toFail(printf("Query parameter \'%s\' not found"))(name);
    }
}

export function RouteModule_parse(xs) {
    let xs_1;
    let xs_4;
    if (isEmpty(xs)) {
        xs_4 = singleton("?");
    }
    else if ((xs_1 = xs, !last(xs_1).startsWith("?"))) {
        const xs_2 = xs;
        xs_4 = append(xs_2, singleton("?"));
    }
    else {
        const xs_3 = xs;
        xs_4 = xs_3;
    }
    let matchResult;
    if (!isEmpty(xs_4)) {
        if (RouteModule_$007CQuery$007C_$007C(head(xs_4)) != null) {
            if (isEmpty(tail(xs_4))) {
                matchResult = 0;
            }
            else {
                matchResult = 1;
            }
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
            return new Route(/* Home */ 0, [undefined]);
        default: {
            const other = xs_4;
            toConsole(printf("Route not found: \'%A\'"))(other);
            return Route.NotFound;
        }
    }
}

export function RouteModule_isEqualWithoutPathAndQuery(route1, route2) {
    let matchResult;
    if (route1.tag === 0) {
        if (route2.tag === 0) {
            matchResult = 0;
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
            return true;
        default:
            return false;
    }
}

export function RouteModule_current() {
    return RouterModule_urlSegments(window.location.hash, 1);
}

