#!/usr/bin/env node
"use strict";
// Fix fsproj ordering (Policies before Types), Managers type fixes, and apply
// the runner policy wiring (patch23b minus afterload, minus applied edits).
const fs = require("fs");

// 1. fsproj order
for (const [q, typesLine, polLine] of [
  ["oracle/runner/fs-runner/fs-runner.fsproj",
   `        <Compile Include="../../../kittens_land/src/Game/Game.Types.fs"/>`,
   `        <Compile Include="../../../kittens_land/src/Game/Game.Catalog.Policies.fs"/>`],
  ["kittens_land/kittens_land.fsproj",
   `        <Compile Include="src/Game/Game.Types.fs"/>`,
   `        <Compile Include="src/Game/Game.Catalog.Policies.fs"/>`],
]) {
  let t = fs.readFileSync(q, "utf8");
  if (!t.includes(polLine)) {
    if (t.split(typesLine).length - 1 !== 1) { console.error("FAIL fsproj " + q); process.exit(1); }
    t = t.replace(typesLine, polLine + "\n" + typesLine);
    fs.writeFileSync(q, t);
  }
}
console.log("ok fsproj order");

// 2. Managers fixes
{
  const q = "kittens_land/src/Game/Game.Managers.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["float-int",
`        let e = ctx.NagaEmbassies * 0.0025 |> min 0.1`,
`        let e = min (float ctx.NagaEmbassies * 0.0025) 0.1`],
    ["recalc-mutable",
`let recalcPolicy (ctx: PolicyCalcCtx) (name: string) (sp: SciencePool) : SciencePool =
    match sp.Policies |> Map.tryFind name with
    | Some p when p.Researched ->
        sp <- { sp with Policies = sp.Policies |> Map.add name { p with Effects = policyCalcEffects ctx name p.Effects } }
        sp
    | _ -> sp`,
`let recalcPolicy (ctx: PolicyCalcCtx) (name: string) (sp: SciencePool) : SciencePool =
    match sp.Policies |> Map.tryFind name with
    | Some p when p.Researched ->
        { sp with Policies = sp.Policies |> Map.add name { p with Effects = policyCalcEffects ctx name p.Effects } }
    | _ -> sp`],
  ];
  for (const [name, from, to] of edits) {
    if (t.split(from).length - 1 !== 1) { console.error("FAIL managers " + name); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok managers fixes");
}

// 3. Runner wiring (fresh copy without the afterload edit)
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["science-group",
`    let scienceGroup () = emptyGroup () // techs carry no static effects in this version`,
`    let scienceGroup () = Game.Managers.scienceGroup spool`],
    ["science-ctx",
`    let chronoforgeResearched () =`,
`    // policy calculateEffects inputs (js/science.js)
    let scienceCalcCtx () : Game.Managers.PolicyCalcCtx =
        { IronWill = ironWill
          NagaEmbassies = dp.Races.["nagas"].EmbassyLevel
          SpiderEmbassies = dp.Races.["spiders"].EmbassyLevel
          CycleYear = calendar.CycleYear
          PactsAvailable = Game.Effects.getEffect cache "pactsAvailable"
          FracturedOn = (match rpool.Pacts |> Map.tryFind "fractured" with Some p -> p.On | None -> 0)
          UncappedHousing = 0 } // authocracy population scan: seam (never researched in scenarios)
    // evaluateLocks vetoes for non-relation policies (game.js L6070 skips
    // unlock entries whose evaluateLocks returns false)
    let techResearched (n: string) = (match spool.Techs |> Map.tryFind n with Some x -> x.Researched | None -> false)
    let policyResearched (n: string) = (match spool.Policies |> Map.tryFind n with Some x -> x.Researched | None -> false)
    let bldVal (n: string) = (match Game.Buildings.get bpool n with Some b -> b.Val | None -> 0)
    let policyVeto (name: string) : bool =
        match name with
        | "liberalism" -> not ((policyResearched "monarchy" || policyResearched "republic") && bldVal "factory" > 0)
        | "communism" -> not ((policyResearched "republic" || policyResearched "authocracy") && bldVal "factory" > 0)
        | "fascism" -> not ((policyResearched "monarchy" || policyResearched "authocracy") && bldVal "factory" > 0)
        | "scientificCommunism" -> not (bldVal "workshop" < 2 && bldVal "factory" < 1 && policyResearched "socialism")
        | "knowledgeSharing" | "culturalExchange" -> not (techResearched "diplomacy" && techResearched "astronomy")
        | "bigStickPolicy" -> not (policyResearched "isolationism" && techResearched "astronomy" && not (Game.Challenges.isActive cpool "pacifism"))
        | "cityOnAHill" -> not (policyResearched "isolationism" && techResearched "astronomy")
        | "outerSpaceTreaty" -> not (bldVal "sattelite" > 0)
        | "militarizeSpace" -> not (bldVal "sattelite" > 0 && not (Game.Challenges.isActive cpool "pacifism"))
        | "sustainability" | "fullIndustrialization" -> not ((policyResearched "stripMining" || policyResearched "clearCutting") && techResearched "industrialization")
        | "conservation" | "openWoodlands" -> not (policyResearched "environmentalism" && techResearched "ecology")
        | "siphoning" | "feedingFrenzy" | "upfrontPayment" ->
            not ((match rpool.TUs |> Map.tryFind "mausoleum" with Some m -> m.Val | None -> 0) > 0
                 && (match rpool.ZUs |> Map.tryFind "marker" with Some m -> m.Val | None -> 0) > 0)
        | _ -> false
    let chronoforgeResearched () =`],
    ["policy-arm",
`        | "policy" ->
            let pool', spool', ok = Game.Managers.researchPolicy calendarDay m.Args.[0] pool spool
            pool <- pool'
            spool <- spool'
            if not ok then
                let already = (match spool'.Policies |> Map.tryFind m.Args.[0] with Some p -> p.Researched | None -> false)
                actionLog <- (m.Tick, "policy", m.Args, RText(if already then "already-bought" else "cannot-afford")) :: actionLog`,
`        | "policy" ->
            // orig PolicyBtnController.buyItem: researched/afford/gates/blocks;
            // require-confirmation auto-OKs through ui.confirm
            let priestLeader =
                match vpool.LeaderSeed with
                | Some seed ->
                    vpool.Kittens
                    |> List.tryFind (fun k -> k.Seed = seed)
                    |> Option.map (fun k -> k.Job = Some "priest")
                    |> Option.defaultValue false
                | None -> false
            let aiLevel =
                (match Game.Buildings.get bpool "aiCore" with
                 | Some b -> b.Def.Effects |> Map.tryFind "aiLevel" |> Option.defaultValue 0.0
                 | None -> 0.0)
            let bctx : Game.Managers.PolicyBuyCtx =
                { Calc = scienceCalcCtx ()
                  GetEffect = Game.Effects.getEffect cache
                  PriestLeader = priestLeader
                  AiLevel = aiLevel
                  Necrocorns = (match get pool "necrocorn" with Some r -> r.Value | None -> 0.0)
                  ActivePacts = Game.Religion.countActivePacts rpool }
            let pool', spool', result = Game.Managers.researchPolicy calendarDay m.Args.[0] bctx pool spool
            pool <- pool'
            spool <- spool'
            match result with
            | "OkBought" ->
                // onPurchase: unlock fan-out (evaluateLocks veto) + jobs
                match spool.Policies.[m.Args.[0]].Def.Unlocks with
                | Some u ->
                    vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                    let pols = u.Policies |> List.filter (fun p0 -> not (policyVeto p0))
                    let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech pols u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                    bpool <- bp2; spool <- sp2; wpool <- wp2
                | None -> ()
                // meta.upgrades → game.upgrade (recalc fan-out; cache refreshes)
                let ups = Game.Catalog.Policies.upgrades |> Map.tryFind m.Args.[0] |> Option.defaultValue []
                if ups <> [] then refreshCache ()
                // onResearch: cryochamberExtraction bumps the VSU
                if m.Args.[0] = "cryochamberExtraction" then
                    let v = tpool.VSUs.["usedCryochambers"]
                    tpool <- { tpool with VSUs = tpool.VSUs |> Map.add "usedCryochambers" { v with Val = v.Val + 1; On = v.On + 1; Unlocked = true } }
                refreshCache ()
            | "AlreadyBought" ->
                actionLog <- (m.Tick, "policy", m.Args, RText "already-bought") :: actionLog
            | "CannotAfford" ->
                actionLog <- (m.Tick, "policy", m.Args, RText "cannot-afford") :: actionLog
            | _ ->
                actionLog <- (m.Tick, "policy", m.Args, RText "blocked") :: actionLog`],
    ["research-handlers",
`              | None -> ()
        | "upgrade" ->`,
`              | None -> ()
              // tech handlers (js/science.js L808-831): unlock queue sources
              if m.Args.[0] = "cryptotheology" then queueSourcesUnlocked <- Set.add "transcendenceUpgrades" queueSourcesUnlocked
              if m.Args.[0] = "voidSpace" then queueSourcesUnlocked <- Set.add "voidSpace" queueSourcesUnlocked
        | "upgrade" ->`],
    ["unlock-veto-a",
`Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades`,
`Game.Managers.unlock u.Buildings u.Tabs [] u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades`, 3],
    ["unlock-veto-b",
`Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades`,
`Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech (u.Policies |> List.filter (fun p0 -> not (policyVeto p0))) u.Upgrades`, 4],
  ];
  for (const [name, from, to, count] of edits) {
    const expect = count === undefined ? 1 : count;
    const n = t.split(from).length - 1;
    if (n !== expect) { console.error("FAIL runner " + name + " x" + n + " expected " + expect); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok runner wiring");
}
console.log("patch23d done");
