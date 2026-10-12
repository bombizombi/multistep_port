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
let barnInPool = Game.Buildings.get s3.Bpool "barn" |> Option.map (fun b -> b.Val, b.On, b.Unlocked)
let ironMaxEffect = Game.Effects.getEffect s3.Cache "ironMax"
printfn "AFTER LOAD: barn=%A ironMaxEffect=%f" barnInPool ironMaxEffect

let s4 = KittensState.buyUpgrade "stoneBarns" s3
let researched = s4.Wpool.Upgrades.["stoneBarns"].Researched
let ironMaxEffect2 = Game.Effects.getEffect s4.Cache "ironMax"
let cap = (Game.Resources.get s4.Pool "iron" |> Option.get).MaxValue
printfn "AFTER STONEBARNS: researched=%b ironMaxEffect=%f cap=%f" researched ironMaxEffect2 cap

// tick once (like the browser does every 100ms)
let s5 = List.fold (fun st _ -> KittensState.tick st) s4 [1..1]
let cap5 = (Game.Resources.get s5.Pool "iron" |> Option.get).MaxValue
printfn "AFTER 1 TICK: cap=%f" cap5
let s6 = List.fold (fun st _ -> KittensState.tick st) s5 [1..5]
let cap6 = (Game.Resources.get s6.Pool "iron" |> Option.get).MaxValue
printfn "AFTER 6 TICKS: cap=%f" cap6
