#r "C:/cs/web/kittens_port/multistep_port/kittens_land/bin/Debug/net11.0/kittens_land.dll"
open kittens_land
let s0 = KittensState.init ()
let s1 = [ "agriculture"; "mining" ] |> List.fold (fun st n -> KittensState.research n st) s0
let save = KittensState.buildSaveString s1
let lines = save.Replace("\r", "").Split('\n') |> Array.filter (fun l -> l <> "" && not (l.StartsWith("bld|barn")) && not (l.StartsWith("bld|mine")))
printfn "lines[0..2]: %A" lines.[0..2]
