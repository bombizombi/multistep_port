EOF
rm Solver.Probe.fsx
# quick debug mode: add "debug" mode to main
node -e "
const fs=require('fs');
let t=fs.readFileSync('Solver.fs','utf8');
t=t.replace('    | mode when mode = \"debug\" ->','    | \"debug\" ->');
t=t.replace('    | _ ->\n        printfn \"usage: dotnet run -- [l1|l2|l3]\"',
'''    | \"debug\" ->
        // single seed, verbose state dump every 2000 ticks
        let theta = defaultTheta
        let mutable cur = initSeeded 42L
        let mutable lastLog = 0
        while cur.Ticks < 30000 && (Game.Buildings.get cur.Bpool \"temple\" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) < 1 do
            if cur.Ticks % 10 = 0 then
                let _, _ = applyPolicy theta cur |> (fun (a, _) -> cur <- a; ())
                ()
            cur <- tick cur
            if cur.Ticks - lastLog >= 2000 then
                lastLog <- cur.Ticks
                let kittens = cur.Vpool.Kittens.Length
                let sci = getRes cur.Pool \"science\"
                let gold = getRes cur.Pool \"gold\"
                let furs = getRes cur.Pool \"furs\"
                let iron = getRes cur.Pool \"iron\"
                let minerals = getRes cur.Pool \"minerals\"
                let culture = getRes cur.Pool \"culture\"
                let jobs = cur.Vpool.JobValues |> Map.toList |> List.filter (fun (_, v) -> v > 0)
                printfn \"t=%d kittens=%d sci=%.0f gold=%.0f furs=%.0f iron=%.0f min=%.0f cult=%.0f jobs=%A\" cur.Ticks kittens sci gold furs iron minerals culture jobs
        printfn \"done: temple=%d\" (Game.Buildings.get cur.Bpool \"temple\" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0)
        0
    | _ ->
        printfn \"usage: dotnet run -- [l1|l2|l3|debug]\"''');
fs.writeFileSync('Solver.fs',t);
console.log('debug mode added');
" && dotnet build solver.fsproj --configuration Release 2>&1 | grep -cE "error FS" && timeout 90 dotnet bin/Release/net11.0/solver.dll debug 2>&1 | head -20
__zcode_status=$?
if [ "$__zcode_status" -eq 0 ]; then pwd -P > '/c/Users/mestar/AppData/Local/Temp/zcode-897b699f-b5b9-4fe3-9cd8-1858eb1afdaf-cwd'; fi
exit "$__zcode_status"
