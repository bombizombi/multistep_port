#r "bin/Debug/net11.0/kittens_land.dll"
open kittens_land

let s0 = KittensState.init ()
let s1 = [ "agriculture"; "mining" ] |> List.fold (fun st n -> KittensState.research n st) s0
let save = KittensState.buildSaveString s1
let lines = save.Replace("\r", "").Split('\n') |> Array.filter (fun l -> l <> "" && not (l.StartsWith("bld|barn")) && not (l.StartsWith("bld|mine")))
let lines2 = Array.append lines [|
    "bld|barn|1|1|1"
    "bld|mine|1|1|1"
    "res|iron|100|1"
    "res|wood|9000|1"
    "res|catnip|9000|1"
    "res|minerals|3000|1"
    "res|science|5000|1"
    "tabs|village,science,workshop"
|]
let crafted = System.String.Join("\n", lines2) + "\n"
let s2 =
    match KittensState.parseSave crafted with
    | Some s -> s
    | None -> failwith "PARSE NONE"
let s3 = KittensState.applyLoaded s2 s0
let cap1 = (Game.Resources.get s3.Pool "iron" |> Option.get).MaxValue
printfn "IRON CAP (1 barn, no upgrades): %f" cap1

let s4 = KittensState.buyUpgrade "stoneBarns" s3
let cap2 = (Game.Resources.get s4.Pool "iron" |> Option.get).MaxValue
printfn "IRON CAP (after stoneBarns): %f (expected 87.5)" cap2

let cap3 = (Game.Resources.get s4.Pool "catnip" |> Option.get).MaxValue
printfn "CATNIP CAP (after stoneBarns): %f" cap3
