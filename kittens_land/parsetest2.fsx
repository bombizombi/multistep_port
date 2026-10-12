#r "C:/cs/web/kittens_port/multistep_port/kittens_land/bin/Debug/net11.0/kittens_land.dll"
open kittens_land
let crafted = System.IO.File.ReadAllText "crafted-storage.txt"
let firstLine = crafted.Split('\n')[0]
printfn "first line: [%s]" firstLine
try
    match KittensState.parseSave crafted with
    | Some s -> printfn "PARSE OK"
    | None -> printfn "PARSE NONE"
with e -> printfn "PARSE THREW: %s" e.Message
