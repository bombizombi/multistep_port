
import { defaultOf, int32ToString, comparePrimitives, Lazy } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { FSharpMap__get_Item, ofSeq } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { mapIndexed } from "../../fable_modules/fable-library-js.5.17.0/Seq.js";
import { Operators_IsNull } from "../../fable_modules/fable-library-js.5.17.0/FSharp.Core.js";
import { getItemFromDict } from "../../fable_modules/fable-library-js.5.17.0/MapUtil.js";
import { StringBuilder__Append_Z721C83C5, StringBuilder_$ctor } from "../../fable_modules/fable-library-js.5.17.0/System.Text.js";
import { item } from "../../fable_modules/fable-library-js.5.17.0/Array.js";
import { toString } from "../../fable_modules/fable-library-js.5.17.0/Types.js";

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const baseReverseDic = new Lazy(() => ofSeq(mapIndexed((i, c) => [c, i], keyStrBase64.split("")), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}));

/**
 * LZString._compress(uncompressed, bitsPerChar, produceChar)
 */
export function compressGenericImpl(uncompressed, bitsPerChar, produceChar) {
    if (Operators_IsNull(uncompressed)) {
        return "";
    }
    else {
        const dict = new Map([]);
        const toCreate = new Map([]);
        let w = "";
        let enlargeIn = 2;
        let dictCounter = 3;
        let numBits = 2;
        const data = [];
        let dataVal = 0;
        let dataPosition = 0;
        for (let i = 0; i <= (uncompressed.length - 1); i++) {
            const c = uncompressed[i];
            if (!dict.has(c)) {
                dict.set(c, dictCounter);
                dictCounter = ((dictCounter + 1) | 0);
                toCreate.set(c, true);
            }
            const wc = w + c;
            if (dict.has(wc)) {
                w = wc;
            }
            else {
                const wstr = w;
                if (toCreate.has(wstr)) {
                    if (wstr[0] < String.fromCharCode(256 & 0xFFFF)) {
                        for (let forLoopVar = 1; forLoopVar <= numBits; forLoopVar++) {
                            dataVal = ((dataVal << 1) | 0);
                            if (dataPosition === (bitsPerChar - 1)) {
                                dataPosition = 0;
                                void (data.push(produceChar(dataVal)));
                                dataVal = 0;
                            }
                            else {
                                dataPosition = ((dataPosition + 1) | 0);
                            }
                        }
                        let value = ~~wstr[0].charCodeAt(0);
                        for (let forLoopVar_1 = 1; forLoopVar_1 <= 8; forLoopVar_1++) {
                            const bit = (value & 1) | 0;
                            dataVal = (((dataVal << 1) | (bit & 1)) | 0);
                            if (dataPosition === (bitsPerChar - 1)) {
                                dataPosition = 0;
                                void (data.push(produceChar(dataVal)));
                                dataVal = 0;
                            }
                            else {
                                dataPosition = ((dataPosition + 1) | 0);
                            }
                            value = ((value >> 1) | 0);
                        }
                    }
                    else {
                        let value_1 = 1;
                        for (let forLoopVar_2 = 1; forLoopVar_2 <= numBits; forLoopVar_2++) {
                            const bit_1 = value_1 | 0;
                            dataVal = (((dataVal << 1) | (bit_1 & 1)) | 0);
                            if (dataPosition === (bitsPerChar - 1)) {
                                dataPosition = 0;
                                void (data.push(produceChar(dataVal)));
                                dataVal = 0;
                            }
                            else {
                                dataPosition = ((dataPosition + 1) | 0);
                            }
                            value_1 = 0;
                        }
                        let value2 = ~~wstr[0].charCodeAt(0);
                        for (let forLoopVar_3 = 1; forLoopVar_3 <= 16; forLoopVar_3++) {
                            const bit_2 = (value2 & 1) | 0;
                            dataVal = (((dataVal << 1) | (bit_2 & 1)) | 0);
                            if (dataPosition === (bitsPerChar - 1)) {
                                dataPosition = 0;
                                void (data.push(produceChar(dataVal)));
                                dataVal = 0;
                            }
                            else {
                                dataPosition = ((dataPosition + 1) | 0);
                            }
                            value2 = ((value2 >> 1) | 0);
                        }
                    }
                    enlargeIn = ((enlargeIn - 1) | 0);
                    if (enlargeIn === 0) {
                        enlargeIn = (Math.pow(2, numBits) | 0);
                        numBits = ((numBits + 1) | 0);
                    }
                    toCreate.delete(wstr);
                }
                else {
                    let value_3 = getItemFromDict(dict, wstr);
                    for (let forLoopVar_4 = 1; forLoopVar_4 <= numBits; forLoopVar_4++) {
                        const bit_3 = (value_3 & 1) | 0;
                        dataVal = (((dataVal << 1) | (bit_3 & 1)) | 0);
                        if (dataPosition === (bitsPerChar - 1)) {
                            dataPosition = 0;
                            void (data.push(produceChar(dataVal)));
                            dataVal = 0;
                        }
                        else {
                            dataPosition = ((dataPosition + 1) | 0);
                        }
                        value_3 = ((value_3 >> 1) | 0);
                    }
                }
                enlargeIn = ((enlargeIn - 1) | 0);
                if (enlargeIn === 0) {
                    enlargeIn = (Math.pow(2, numBits) | 0);
                    numBits = ((numBits + 1) | 0);
                }
                dict.set(wc, dictCounter);
                dictCounter = ((dictCounter + 1) | 0);
                w = c;
            }
        }
        if (w !== "") {
            const wstr_1 = w;
            if (toCreate.has(wstr_1)) {
                if (wstr_1[0] < String.fromCharCode(256 & 0xFFFF)) {
                    for (let forLoopVar_5 = 1; forLoopVar_5 <= numBits; forLoopVar_5++) {
                        dataVal = ((dataVal << 1) | 0);
                        if (dataPosition === (bitsPerChar - 1)) {
                            dataPosition = 0;
                            void (data.push(produceChar(dataVal)));
                            dataVal = 0;
                        }
                        else {
                            dataPosition = ((dataPosition + 1) | 0);
                        }
                    }
                    let value_4 = ~~wstr_1[0].charCodeAt(0);
                    for (let forLoopVar_6 = 1; forLoopVar_6 <= 8; forLoopVar_6++) {
                        const bit_4 = (value_4 & 1) | 0;
                        dataVal = (((dataVal << 1) | (bit_4 & 1)) | 0);
                        if (dataPosition === (bitsPerChar - 1)) {
                            dataPosition = 0;
                            void (data.push(produceChar(dataVal)));
                            dataVal = 0;
                        }
                        else {
                            dataPosition = ((dataPosition + 1) | 0);
                        }
                        value_4 = ((value_4 >> 1) | 0);
                    }
                }
                else {
                    let value_5 = 1;
                    for (let forLoopVar_7 = 1; forLoopVar_7 <= numBits; forLoopVar_7++) {
                        const bit_5 = value_5 | 0;
                        dataVal = (((dataVal << 1) | (bit_5 & 1)) | 0);
                        if (dataPosition === (bitsPerChar - 1)) {
                            dataPosition = 0;
                            void (data.push(produceChar(dataVal)));
                            dataVal = 0;
                        }
                        else {
                            dataPosition = ((dataPosition + 1) | 0);
                        }
                        value_5 = 0;
                    }
                    let value2_1 = ~~wstr_1[0].charCodeAt(0);
                    for (let forLoopVar_8 = 1; forLoopVar_8 <= 16; forLoopVar_8++) {
                        const bit_6 = (value2_1 & 1) | 0;
                        dataVal = (((dataVal << 1) | (bit_6 & 1)) | 0);
                        if (dataPosition === (bitsPerChar - 1)) {
                            dataPosition = 0;
                            void (data.push(produceChar(dataVal)));
                            dataVal = 0;
                        }
                        else {
                            dataPosition = ((dataPosition + 1) | 0);
                        }
                        value2_1 = ((value2_1 >> 1) | 0);
                    }
                }
                enlargeIn = ((enlargeIn - 1) | 0);
                if (enlargeIn === 0) {
                    enlargeIn = (Math.pow(2, numBits) | 0);
                    numBits = ((numBits + 1) | 0);
                }
                toCreate.delete(wstr_1);
            }
            else {
                let value_7 = getItemFromDict(dict, wstr_1);
                for (let forLoopVar_9 = 1; forLoopVar_9 <= numBits; forLoopVar_9++) {
                    const bit_7 = (value_7 & 1) | 0;
                    dataVal = (((dataVal << 1) | (bit_7 & 1)) | 0);
                    if (dataPosition === (bitsPerChar - 1)) {
                        dataPosition = 0;
                        void (data.push(produceChar(dataVal)));
                        dataVal = 0;
                    }
                    else {
                        dataPosition = ((dataPosition + 1) | 0);
                    }
                    value_7 = ((value_7 >> 1) | 0);
                }
            }
            enlargeIn = ((enlargeIn - 1) | 0);
            if (enlargeIn === 0) {
                enlargeIn = (Math.pow(2, numBits) | 0);
                numBits = ((numBits + 1) | 0);
            }
        }
        let value_8 = 2;
        for (let forLoopVar_10 = 1; forLoopVar_10 <= numBits; forLoopVar_10++) {
            const bit_8 = (value_8 & 1) | 0;
            dataVal = (((dataVal << 1) | (bit_8 & 1)) | 0);
            if (dataPosition === (bitsPerChar - 1)) {
                dataPosition = 0;
                void (data.push(produceChar(dataVal)));
                dataVal = 0;
            }
            else {
                dataPosition = ((dataPosition + 1) | 0);
            }
            value_8 = ((value_8 >> 1) | 0);
        }
        let padded = false;
        while (!padded) {
            dataVal = ((dataVal << 1) | 0);
            if (dataPosition === (bitsPerChar - 1)) {
                void (data.push(produceChar(dataVal)));
                dataVal = 0;
                padded = true;
            }
            else {
                dataPosition = ((dataPosition + 1) | 0);
            }
        }
        return data.slice().join('');
    }
}

function decompressGenericImpl(length, resetValue, getNextValue) {
    const l = [];
    let enlargeIn = 4;
    let numBits = 3;
    const result = StringBuilder_$ctor();
    let bits = 0;
    let maxpower = 0;
    let power = 0;
    let val_ = getNextValue(0);
    let position = resetValue;
    let index = 1;
    for (let i = 0; i <= 2; i++) {
        void (l.push(int32ToString(i)));
    }
    let first;
    bits = 0;
    maxpower = (Math.pow(2, 2) | 0);
    power = 1;
    while (power !== maxpower) {
        const res = (val_ & position) | 0;
        position = ((position >> 1) | 0);
        if (position === 0) {
            position = (resetValue | 0);
            val_ = (getNextValue(index) | 0);
            index = ((index + 1) | 0);
        }
        if (res > 0) {
            bits = ((bits | power) | 0);
        }
        power = ((power << 1) | 0);
    }
    first = bits;
    let w = "";
    let finished = false;
    switch (first) {
        case 0: {
            const c = String.fromCharCode(((bits = 0, (maxpower = (Math.pow(2, 8) | 0), (power = 1, ((() => {
                while (power !== maxpower) {
                    const res_1 = (val_ & position) | 0;
                    position = ((position >> 1) | 0);
                    if (position === 0) {
                        position = (resetValue | 0);
                        val_ = (getNextValue(index) | 0);
                        index = ((index + 1) | 0);
                    }
                    if (res_1 > 0) {
                        bits = ((bits | power) | 0);
                    }
                    power = ((power << 1) | 0);
                }
            })(), bits))))) & 0xFFFF);
            void (l.push(c));
            w = c;
            StringBuilder__Append_Z721C83C5(result, c);
            break;
        }
        case 1: {
            const c_1 = String.fromCharCode(((bits = 0, (maxpower = (Math.pow(2, 16) | 0), (power = 1, ((() => {
                while (power !== maxpower) {
                    const res_2 = (val_ & position) | 0;
                    position = ((position >> 1) | 0);
                    if (position === 0) {
                        position = (resetValue | 0);
                        val_ = (getNextValue(index) | 0);
                        index = ((index + 1) | 0);
                    }
                    if (res_2 > 0) {
                        bits = ((bits | power) | 0);
                    }
                    power = ((power << 1) | 0);
                }
            })(), bits))))) & 0xFFFF);
            void (l.push(c_1));
            w = c_1;
            StringBuilder__Append_Z721C83C5(result, c_1);
            break;
        }
        case 2: {
            finished = true;
            break;
        }
        default:
            undefined;
    }
    if (!finished) {
        let i_1 = w;
        let h = 4;
        while ((index <= length) && !finished) {
            let copyOfStruct, copyOfStruct_1, copyOfStruct_2, copyOfStruct_3;
            let c_2;
            const count_3 = numBits | 0;
            bits = 0;
            maxpower = (Math.pow(2, count_3) | 0);
            power = 1;
            while (power !== maxpower) {
                const res_3 = (val_ & position) | 0;
                position = ((position >> 1) | 0);
                if (position === 0) {
                    position = (resetValue | 0);
                    val_ = (getNextValue(index) | 0);
                    index = ((index + 1) | 0);
                }
                if (res_3 > 0) {
                    bits = ((bits | power) | 0);
                }
                power = ((power << 1) | 0);
            }
            c_2 = bits;
            let entry = "";
            switch (c_2) {
                case 0: {
                    entry = String.fromCharCode(((bits = 0, (maxpower = (Math.pow(2, 8) | 0), (power = 1, ((() => {
                        while (power !== maxpower) {
                            const res_4 = (val_ & position) | 0;
                            position = ((position >> 1) | 0);
                            if (position === 0) {
                                position = (resetValue | 0);
                                val_ = (getNextValue(index) | 0);
                                index = ((index + 1) | 0);
                            }
                            if (res_4 > 0) {
                                bits = ((bits | power) | 0);
                            }
                            power = ((power << 1) | 0);
                        }
                    })(), bits))))) & 0xFFFF);
                    void (l.push(entry));
                    h = ((h + 1) | 0);
                    enlargeIn = ((enlargeIn - 1) | 0);
                    break;
                }
                case 1: {
                    entry = String.fromCharCode(((bits = 0, (maxpower = (Math.pow(2, 16) | 0), (power = 1, ((() => {
                        while (power !== maxpower) {
                            const res_5 = (val_ & position) | 0;
                            position = ((position >> 1) | 0);
                            if (position === 0) {
                                position = (resetValue | 0);
                                val_ = (getNextValue(index) | 0);
                                index = ((index + 1) | 0);
                            }
                            if (res_5 > 0) {
                                bits = ((bits | power) | 0);
                            }
                            power = ((power << 1) | 0);
                        }
                    })(), bits))))) & 0xFFFF);
                    void (l.push(entry));
                    h = ((h + 1) | 0);
                    enlargeIn = ((enlargeIn - 1) | 0);
                    break;
                }
                case 2: {
                    finished = true;
                    break;
                }
                default:
                    undefined;
            }
            if ((c_2 === 0) ? true : (c_2 === 1)) {
                const cc = (h - 1) | 0;
                if (enlargeIn === 0) {
                    enlargeIn = (Math.pow(2, numBits) | 0);
                    numBits = ((numBits + 1) | 0);
                }
                const d = ((cc < l.length) && (item(cc, l).length > 0)) ? item(cc, l) : ((cc === h) ? (i_1 + ((copyOfStruct = i_1[0], copyOfStruct))) : defaultOf());
                if (d === defaultOf()) {
                    finished = true;
                }
                else {
                    StringBuilder__Append_Z721C83C5(result, d);
                    void (l.push(i_1 + ((copyOfStruct_1 = d[0], copyOfStruct_1))));
                    h = ((h + 1) | 0);
                    enlargeIn = ((enlargeIn - 1) | 0);
                    if (enlargeIn === 0) {
                        enlargeIn = (Math.pow(2, numBits) | 0);
                        numBits = ((numBits + 1) | 0);
                    }
                    i_1 = d;
                }
            }
            else if (!finished) {
                const d_1 = ((c_2 < l.length) && (item(c_2, l).length > 0)) ? item(c_2, l) : ((c_2 === h) ? (i_1 + ((copyOfStruct_2 = i_1[0], copyOfStruct_2))) : defaultOf());
                if (d_1 === defaultOf()) {
                    finished = true;
                }
                else {
                    StringBuilder__Append_Z721C83C5(result, d_1);
                    void (l.push(i_1 + ((copyOfStruct_3 = d_1[0], copyOfStruct_3))));
                    h = ((h + 1) | 0);
                    enlargeIn = ((enlargeIn - 1) | 0);
                    if (enlargeIn === 0) {
                        enlargeIn = (Math.pow(2, numBits) | 0);
                        numBits = ((numBits + 1) | 0);
                    }
                    i_1 = d_1;
                }
            }
        }
    }
    if (finished) {
        return toString(result);
    }
    else {
        return undefined;
    }
}

export function compressToUTF16(uncompressed) {
    if (Operators_IsNull(uncompressed)) {
        return "";
    }
    else {
        return compressGenericImpl(uncompressed, 15, (i) => String.fromCharCode((i + 32) & 0xFFFF)) + " ";
    }
}

export function decompressFromUTF16(compressed) {
    if (Operators_IsNull(compressed)) {
        return "";
    }
    else if (compressed === "") {
        return undefined;
    }
    else {
        return decompressGenericImpl(compressed.length, 16384, (i) => ((~~compressed[i].charCodeAt(0) - 32) | 0));
    }
}

export function compressToBase64(uncompressed) {
    if (Operators_IsNull(uncompressed)) {
        return "";
    }
    else {
        const e = compressGenericImpl(uncompressed, 6, (i) => keyStrBase64[i]);
        const matchValue = (e.length % 4) | 0;
        switch (matchValue) {
            case 1:
                return e + "===";
            case 2:
                return e + "==";
            case 3:
                return e + "=";
            default:
                return e;
        }
    }
}

export function decompressFromBase64(compressed) {
    if (Operators_IsNull(compressed)) {
        return "";
    }
    else if (compressed === "") {
        return undefined;
    }
    else {
        return decompressGenericImpl(compressed.length, 32, (i) => (FSharpMap__get_Item(baseReverseDic.Value, compressed[i]) | 0));
    }
}

