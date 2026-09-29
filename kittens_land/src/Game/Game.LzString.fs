module Game.LzString

// lz-string.js (lib/lz-string.js, the bundled minified build) ported verbatim.
// JS context vars in _compress: l=enlargeIn, f=dictCounter, h=numBits,
// d=dataVal, S=dataPosition. The flush idiom
//     d = d<<1|bit; if (S == bitsPerChar-1) {S=0; produce(d); d=0} else S++
// becomes flushBit (the boundary check runs AFTER shifting the bit in).
// _decompress vars: f=enlargeIn, g=numBits, h=next dictionary index.

let private keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

let private baseReverseDic =
    lazy (keyStrBase64 |> Seq.mapi (fun i c -> (c, i)) |> Map.ofSeq)

/// LZString._compress(uncompressed, bitsPerChar, produceChar)
let rec compressGenericImpl (uncompressed: string) (bitsPerChar: int) (produceChar: int -> char) : string =
    if isNull uncompressed then ""
    else
        let dict = System.Collections.Generic.Dictionary<string, int>()
        let toCreate = System.Collections.Generic.Dictionary<string, bool>()
        let mutable w = ""
        let mutable enlargeIn = 2
        let mutable dictCounter = 3
        let mutable numBits = 2
        let data = System.Collections.Generic.List<char>()
        let mutable dataVal = 0
        let mutable dataPosition = 0

        let inline flushBit (bit: int) =
            dataVal <- (dataVal <<< 1) ||| (bit &&& 1)
            if dataPosition = bitsPerChar - 1 then
                dataPosition <- 0
                data.Add(produceChar dataVal)
                dataVal <- 0
            else
                dataPosition <- dataPosition + 1
        let inline flushZero () =
            dataVal <- dataVal <<< 1
            if dataPosition = bitsPerChar - 1 then
                dataPosition <- 0
                data.Add(produceChar dataVal)
                dataVal <- 0
            else
                dataPosition <- dataPosition + 1

        for i in 0 .. uncompressed.Length - 1 do
            let c = string uncompressed.[i]
            if not (dict.ContainsKey c) then
                dict.[c] <- dictCounter
                dictCounter <- dictCounter + 1
                toCreate.[c] <- true
            let wc = w + c
            if dict.ContainsKey wc then
                w <- wc
            else
                let wstr = w
                if toCreate.ContainsKey wstr then
                    if wstr.[0] < char 256 then
                        for _ in 1 .. numBits do flushZero ()
                        let mutable value = int wstr.[0]
                        for _ in 1 .. 8 do
                            flushBit (value &&& 1)
                            value <- value >>> 1
                    else
                        let mutable value = 1
                        for _ in 1 .. numBits do
                            flushBit value
                            value <- 0
                        let mutable value2 = int wstr.[0]
                        for _ in 1 .. 16 do
                            flushBit (value2 &&& 1)
                            value2 <- value2 >>> 1
                    enlargeIn <- enlargeIn - 1
                    if enlargeIn = 0 then
                        enlargeIn <- pown 2 numBits
                        numBits <- numBits + 1
                    toCreate.Remove wstr |> ignore
                else
                    let mutable value = dict.[wstr]
                    for _ in 1 .. numBits do
                        flushBit (value &&& 1)
                        value <- value >>> 1
                enlargeIn <- enlargeIn - 1
                if enlargeIn = 0 then
                    enlargeIn <- pown 2 numBits
                    numBits <- numBits + 1
                dict.[wc] <- dictCounter
                dictCounter <- dictCounter + 1
                w <- c

        if w <> "" then
            let wstr = w
            if toCreate.ContainsKey wstr then
                if wstr.[0] < char 256 then
                    for _ in 1 .. numBits do flushZero ()
                    let mutable value = int wstr.[0]
                    for _ in 1 .. 8 do
                        flushBit (value &&& 1)
                        value <- value >>> 1
                else
                    let mutable value = 1
                    for _ in 1 .. numBits do
                        flushBit value
                        value <- 0
                    let mutable value2 = int wstr.[0]
                    for _ in 1 .. 16 do
                        flushBit (value2 &&& 1)
                        value2 <- value2 >>> 1
                enlargeIn <- enlargeIn - 1
                if enlargeIn = 0 then
                    enlargeIn <- pown 2 numBits
                    numBits <- numBits + 1
                toCreate.Remove wstr |> ignore
            else
                let mutable value = dict.[wstr]
                for _ in 1 .. numBits do
                    flushBit (value &&& 1)
                    value <- value >>> 1
            enlargeIn <- enlargeIn - 1
            if enlargeIn = 0 then
                enlargeIn <- pown 2 numBits
                numBits <- numBits + 1

        // end-of-stream marker (value 2)
        let mutable value = 2
        for _ in 1 .. numBits do
            flushBit (value &&& 1)
            value <- value >>> 1
        // pad to a char boundary
        let mutable padded = false
        while not padded do
            dataVal <- dataVal <<< 1
            if dataPosition = bitsPerChar - 1 then
                data.Add(produceChar dataVal)
                dataVal <- 0
                padded <- true
            else
                dataPosition <- dataPosition + 1
        System.String(data.ToArray())

/// LZString._decompress(length, resetValue, getNextValue)
let private decompressGenericImpl (length: int) (resetValue: int) (getNextValue: int -> int) : string option =
    let l = System.Collections.Generic.List<string>()
    let mutable enlargeIn = 4 // JS f
    let mutable numBits = 3 // JS g
    let result = System.Text.StringBuilder()
    let mutable bits = 0
    let mutable maxpower = 0
    let mutable power = 0

    let mutable val_ = getNextValue 0
    let mutable position = resetValue
    let mutable index = 1

    let inline readBits (count: int) : int =
        bits <- 0
        maxpower <- pown 2 count
        power <- 1
        while power <> maxpower do
            let res = val_ &&& position
            position <- position >>> 1
            if position = 0 then
                position <- resetValue
                val_ <- getNextValue index
                index <- index + 1
            if res > 0 then bits <- bits ||| power
            power <- power <<< 1
        bits

    for i in 0 .. 2 do
        l.Add(string i)

    let first = readBits 2
    let mutable w = ""
    let mutable finished = false
    match first with
    | 0 ->
        let c = string (char (readBits 8))
        l.Add(c) // l[3] = c
        w <- c
        result.Append c |> ignore
    | 1 ->
        let c = string (char (readBits 16))
        l.Add(c) // l[3] = c
        w <- c
        result.Append c |> ignore
    | 2 -> finished <- true
    | _ -> ()

    if not finished then
        let mutable i = w
        let mutable h = 4 // JS h: next dictionary index
        while index <= length && not finished do
            let c = readBits numBits
            let mutable entry = ""
            if c = 0 then
                entry <- string (char (readBits 8))
                l.Add(entry)
                h <- h + 1
                enlargeIn <- enlargeIn - 1
            elif c = 1 then
                entry <- string (char (readBits 16))
                l.Add(entry)
                h <- h + 1
                enlargeIn <- enlargeIn - 1
            elif c = 2 then
                finished <- true
            if c = 0 || c = 1 then
                // JS: c = h - 1 (the index of the just-added entry)
                let cc = h - 1
                if enlargeIn = 0 then
                    enlargeIn <- pown 2 numBits
                    numBits <- numBits + 1
                // fall through to the shared d-resolution with c = cc
                let d =
                    if cc < l.Count && l.[cc].Length > 0 then l.[cc]
                    elif cc = h then i + i.[0].ToString()
                    else null
                if d = null then
                    finished <- true
                else
                    result.Append d |> ignore
                    l.Add(i + d.[0].ToString())
                    h <- h + 1
                    enlargeIn <- enlargeIn - 1
                    if enlargeIn = 0 then
                        enlargeIn <- pown 2 numBits
                        numBits <- numBits + 1
                    i <- d
            elif not finished then
                let d =
                    if c < l.Count && l.[c].Length > 0 then l.[c]
                    elif c = h then i + i.[0].ToString()
                    else null
                if d = null then
                    finished <- true
                else
                    result.Append d |> ignore
                    l.Add(i + d.[0].ToString())
                    h <- h + 1
                    enlargeIn <- enlargeIn - 1
                    if enlargeIn = 0 then
                        enlargeIn <- pown 2 numBits
                        numBits <- numBits + 1
                    i <- d
    if finished then Some (result.ToString()) else None

let compressToUTF16 (uncompressed: string) : string =
    if isNull uncompressed then ""
    else compressGenericImpl uncompressed 15 (fun i -> char (i + 32)) + " "

let decompressFromUTF16 (compressed: string) : string option =
    if isNull compressed then Some ""
    elif compressed = "" then None
    else decompressGenericImpl compressed.Length 16384 (fun i -> int compressed.[i] - 32)

let compressToBase64 (uncompressed: string) : string =
    if isNull uncompressed then ""
    else
        let e = compressGenericImpl uncompressed 6 (fun i -> keyStrBase64.[i])
        match e.Length % 4 with
        | 1 -> e + "==="
        | 2 -> e + "=="
        | 3 -> e + "="
        | _ -> e

let decompressFromBase64 (compressed: string) : string option =
    if isNull compressed then Some ""
    elif compressed = "" then None
    else decompressGenericImpl compressed.Length 32 (fun i -> baseReverseDic.Value.[compressed.[i]])
