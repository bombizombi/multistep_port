#!/usr/bin/env node
"use strict";
// Batch-21 (game-13 load half + game-15 export/import): JSON save-blob parser,
// full state loader (invert the byte-exact builder), load/loadfile/saveexport/
// importfile resops on both drivers.
const fs = require("fs");

// ---------------------------------------------------------------- Managers.fs
{
  const q = "kittens_land/src/Game/Game.Managers.fs";
  let t = fs.readFileSync(q, "utf8");
  const anchor = `let addKitten (rand: unit -> float) (pool: VillagePool) : VillagePool =`;
  const insert = `/// orig Kitten.loadSeeded: _normalizeSeed (floor, NaN→0, clamp 0..SEED_MAX
/// 999999) + _generateAttributes — identity is deterministically regenerated
/// from the seed; the caller applies skills/exp/job/rank/isLeader on top.
let kittenFromSeed (seed: float) : Kitten =
    let s = System.Math.Floor seed
    let s = if System.Double.IsNaN s then 0.0 else s
    makeKitten (int (max 0.0 (min 999999.0 s)))

` + anchor;
  if (t.split(anchor).length - 1 !== 1) { console.error("FAIL managers anchor"); process.exit(1); }
  fs.writeFileSync(q, t.replace(anchor, insert));
  console.log("ok kittenFromSeed");
}

// ------------------------------------------------------------ Program.fs part 1
// Top-level: JsValue + parser (before `let execute`).
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const anchor = `// ---------------------------------------------------------------------------
// Scenario execution against the F# core — the full live pipeline.
`;
  const insert = `// --- game-13 load half: save-blob parsing ------------------------------------
// orig _parseLSSaveData: raw JSON when the blob starts with '{', else
// decompressLZData (base64 first, UTF-16 fallback), then JSON.parse.

type JsValue =
    | JNull
    | JBool of bool
    | JNum of float
    | JStr of string
    | JArr of JsValue list
    | JObj of (string * JsValue) list

let private jsOfElement (e: System.Text.Json.JsonElement) : JsValue =
    match e.ValueKind with
    | System.Text.Json.JsonValueKind.Null -> JNull
    | System.Text.Json.JsonValueKind.True -> JBool true
    | System.Text.Json.JsonValueKind.False -> JBool false
    | System.Text.Json.JsonValueKind.Number -> JNum e.GetDouble()
    | System.Text.Json.JsonValueKind.String -> JStr (e.GetString())
    | System.Text.Json.JsonValueKind.Array -> JArr [ for x in e.EnumerateArray() -> jsOfElement x ]
    | _ -> JObj [ for p in e.EnumerateObject() -> (p.Name, jsOfElement p.Value) ]

let parseSaveBlob (blob: string) : JsValue =
    let raw =
        if blob.Length > 0 && blob.[0] = '{' then Some blob
        else
            let b64 = Game.LzString.decompressFromBase64 blob
            let utf16 = Game.LzString.decompressFromUTF16 blob
            if b64.IsSome && b64.Value.Length > 0 && b64.Value.[0] = '{' then b64
            else utf16
    match raw with
    | Some s -> jsOfElement ((System.Text.Json.JsonDocument.Parse s).RootElement.Clone())
    | None -> failwith "unable to parse save blob"

let private jget (kvs: (string * JsValue) list) (name: string) : JsValue option =
    kvs |> List.tryFind (fun (k, _) -> k = name) |> Option.map snd
let private jstrF (v: JsValue option) : string option = match v with Some (JStr s) -> Some s | _ -> None
let private jnumF (v: JsValue option) : float option = match v with Some (JNum f) -> Some f | _ -> None
let private jboolF (v: JsValue option) : bool option = match v with Some (JBool b) -> Some b | _ -> None

` + anchor;
  if (t.split(anchor).length - 1 !== 1) { console.error("FAIL program anchor 1"); process.exit(1); }
  t = t.replace(anchor, insert);
  fs.writeFileSync(q, t);
  console.log("ok parser block");
}

// ------------------------------------------------------------ Program.fs part 2
// Inside execute: applySaveBlob after the save builder.
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const anchor = `    saveDataBuilder <- Some buildSaveString
`;
  const body = anchor + `
    /// orig game.load() — resetState, then one loader per saved section, then
    /// calculateAllEffects + updateMaxValueAll + updateCaches. The unlock
    /// fan-outs that re-fire for researched metas are replicated with the
    /// typed catalog UnlockLists.
    let applySaveBlob (blob: string) : unit =
        match parseSaveBlob blob with
        | JObj root ->
            // resetState
            pool <- init Game.Catalog.Resources.resourceDefs
            calendar <- Game.Calendar.init
            bpool <- Game.Buildings.init Game.Catalog.Defs.buildingDefs
            spool <- Game.Managers.initScience Game.Catalog.Defs.techDefs Game.Catalog.Defs.policyDefs
            wpool <- Game.Managers.initWorkshop Game.Catalog.Defs.upgradeDefs Game.Catalog.Defs.craftDefs
            vpool <- Game.Managers.initVillage Game.Catalog.Village.jobDefs
            rpool <- Game.Religion.init ()
            dp <- Game.Diplomacy.init ()
            ppool <- Game.Prestige.init ()
            stpool <- Game.Stats.init ()
            apool <- Game.Achievements.init ()
            cpool <- Game.Challenges.init ()
            tpool <- Game.Time.init ()
            spacep <- Game.Space.init ()
            voidp <- Game.Time.initVoid ()
            ironWill <- true
            steamworksJammed <- false
            mapFauna <- Game.Catalog.World.biomeDefs |> List.map (fun _ -> false)
            winterCatnipPerTick <- 0.0
            queueSourcesUnlocked <- set [ "buildings" ]
            craftFilterUnlocked <- false
            prodOverrides <- Map.empty
            lastLimits <- Map.empty
            reserveResources <- Map.empty
            reserveKittens <- []
            reserveCryochambers <- 0

            let jobNames = Game.Catalog.Village.jobDefs |> List.map (fun j -> j.Name)

            // resPool.load: value/unlocked/isHidden per resource
            (match jget root "resources" with
             | Some (JArr rs) ->
                 for r in rs do
                     match r with
                     | JObj kv ->
                         (match jstrF (jget kv "name") with
                          | Some n ->
                              let v = jnumF (jget kv "value") |> Option.defaultValue 0.0
                              let u = jboolF (jget kv "unlocked") |> Option.defaultValue false
                              match Game.Resources.get pool n with
                              | Some r0 -> pool <- { pool with ByName = pool.ByName |> Map.add n { r0 with Value = v; Unlocked = u } }
                              | None -> ()
                          | None -> ())
                     | _ -> ()
             | _ -> ())

            // village.load: kittens (seed → loadSeeded, else ssn → loadCompressed)
            (match jget root "village" with
             | Some (JObj vk) ->
                 let loadKitten (kv0: JsValue) : Kitten =
                     match kv0 with
                     | JObj kv ->
                         let baseK =
                             match jnumF (jget kv "seed") with
                             | Some sd -> Game.Managers.kittenFromSeed sd
                             | None ->
                                 // loadCompressed: _splitSSN(ssn, 7) base-100
                                 let merged = jnumF (jget kv "ssn") |> Option.defaultValue 0.0
                                 let mutable m = merged
                                 let vals = [ for _ in 1..7 do
                                                  let v = m % 100.0
                                                  m <- (m - v) / 100.0
                                                  yield v ]
                                 let idx i = int vals.[i]
                                 let name =
                                     match jstrF (jget kv "name") with
                                     | Some s -> s
                                     | None -> Game.Catalog.Village.names.[idx 0]
                                 let surname =
                                     match jstrF (jget kv "surname") with
                                     | Some s -> s
                                     | None -> Game.Catalog.Village.surnames.[idx 1]
                                 { Game.Managers.kittenFromSeed 0 with
                                     Seed = 0
                                     Name = name
                                     Surname = surname
                                     Trait = Game.Catalog.Village.traitDefs.[idx 3].Name
                                     Age = vals.[2]
                                     Color = idx 4
                                     Variety = idx 5
                                     Rarity = idx 6 }
                         let cap (v: float) = if v > 20001.0 then 20001.0 else v
                         let skills =
                             match jget kv "skills" with
                             | Some (JNum f) -> jobNames |> List.map (fun j -> (j, cap f)) |> Map.ofList
                             | Some (JArr xs) ->
                                 jobNames
                                 |> List.mapi (fun i j ->
                                     (j, cap (match xs |> List.tryItem i with Some (JNum f) -> f | _ -> 0.0)))
                                 |> Map.ofList
                             | _ -> jobNames |> List.map (fun j -> (j, 0.0)) |> Map.ofList
                         let job =
                             match jget kv "job" with
                             | Some (JNum i) -> (match jobNames |> List.tryItem (int i) with Some j -> Some j | None -> None)
                             | Some (JStr s) -> Some s
                             | _ -> None
                         { baseK with
                             Skills = skills
                             Exp = jnumF (jget kv "exp") |> Option.defaultValue 0.0
                             Job = job
                             EngineerSpeciality = jstrF (jget kv "engineerSpeciality")
                             Rank = (jnumF (jget kv "rank") |> Option.defaultValue 0.0) |> int
                             IsLeader = jboolF (jget kv "isLeader") |> Option.defaultValue false }
                     | _ -> Game.Managers.kittenFromSeed 0
                 let kittens =
                     match jget vk "kittens" with
                     | Some (JArr ks) -> ks |> List.map loadKitten
                     | _ -> []
                 // orig rebuilds traits with reversed iteration + unshift
                 let mutable traits = []
                 for k in List.rev kittens do
                     if not (traits |> List.contains k.Trait) then traits <- k.Trait :: traits
                 vpool <-
                     { vpool with
                         Kittens = kittens
                         Traits = traits
                         MaxKittens = (jnumF (jget vk "maxKittens") |> Option.defaultValue 0.0) |> int
                         NextKittenProgress = jnumF (jget vk "nextKittenProgress") |> Option.defaultValue 0.0
                         LeaderSeed = (kittens |> List.tryFind (fun k -> k.IsLeader) |> Option.map (fun k -> k.Seed)) }
                 (match jget vk "jobs" with
                  | Some (JArr js) ->
                      for j in js do
                          match j with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   let unl = jboolF (jget jv "unlocked") |> Option.defaultValue false
                                   let value = (jnumF (jget jv "value") |> Option.defaultValue 0.0) |> int
                                   vpool <-
                                       { vpool with
                                           JobUnlocked = (if unl then vpool.JobUnlocked |> Set.add n else vpool.JobUnlocked)
                                           JobValues = vpool.JobValues |> Map.add n value }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // calendar.load
            (match jget root "calendar" with
             | Some (JObj cv) ->
                 calendar <-
                     { calendar with
                         Year = jnumF (jget cv "year") |> Option.defaultValue 0.0
                         Day = jnumF (jget cv "day") |> Option.defaultValue 0.0
                         Season = (jnumF (jget cv "season") |> Option.defaultValue 0.0) |> int
                         Weather = jstrF (jget cv "weather")
                         FestivalDays = (jnumF (jget cv "festivalDays") |> Option.defaultValue 0.0) |> int
                         Cycle = (jnumF (jget cv "cycle") |> Option.defaultValue 0.0) |> int
                         CycleYear = (jnumF (jget cv "cycleYear") |> Option.defaultValue 0.0) |> int
                         CryptoPrice = jnumF (jget cv "cryptoPrice") |> Option.defaultValue 1000.0 }
             | _ -> ())

            // console.load: the craft filter is the only FS-tracked filter
            (match jget root "console" with
             | Some (JObj cv) ->
                 (match jget cv "filters" with
                  | Some (JObj fs0) ->
                      (match jget fs0 "craft" with
                       | Some (JObj fv) -> craftFilterUnlocked <- jboolF (jget fv "unlocked") |> Option.defaultValue false
                       | _ -> ())
                  | _ -> ())
             | _ -> ())

            // telemetry.load
            (match jget root "telemetry" with
             | Some (JObj tv) ->
                 (match jstrF (jget tv "guid") with
                  | Some g -> telemetryGuid <- g
                  | None -> ())
             | _ -> ())

            // challenges.load (+ reserveMan)
            (match jget root "challenges" with
             | Some (JObj cv) ->
                 (match jget cv "challenges" with
                  | Some (JArr cs) ->
                      for c in cs do
                          match c with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match cpool.Challenges |> Map.tryFind n with
                                   | Some st ->
                                       let st1 =
                                           { st with
                                               Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched
                                               On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                               Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                               Active = jboolF (jget jv "active") |> Option.defaultValue st.Active }
                                       // legacy compat: researched && !on → on = 1
                                       let st2 = if st1.Researched && st1.On = 0 then { st1 with On = 1 } else st1
                                       cpool <- { cpool with Challenges = cpool.Challenges |> Map.add n st2 }
                                       // unlocks && on && !active → game.unlock
                                       if st2.On > 0 && not st2.Active then
                                           if n = "1000Years" then
                                               let pm = tpool.CFUs.["temporalPress"]
                                               tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pm with Unlocked = true } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget cv "reserves" with
                  | Some (JObj rv) ->
                      (match jget rv "reserveResources" with
                       | Some (JObj rr) ->
                           for (k, v) in rr do
                               (match v with
                                | JNum f -> reserveResources <- reserveResources |> Map.add k f
                                | _ -> ())
                       | _ -> ())
                      reserveCryochambers <- (jnumF (jget rv "reserveCryochambers") |> Option.defaultValue 0.0) |> int
                  | _ -> ())
             | _ -> ())

            // workshop.load (no unlock re-fire: UpgradeDef carries no unlock
            // data — purchase paths skip it too)
            (match jget root "workshop" with
             | Some (JObj wv) ->
                 (match jget wv "upgrades" with
                  | Some (JArr us) ->
                      for u in us do
                          match u with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.Upgrades |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               Upgrades =
                                                   wpool.Upgrades
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget wv "crafts" with
                  | Some (JArr cs) ->
                      for c0 in cs do
                          match c0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.Crafts |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               Crafts =
                                                   wpool.Crafts
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Value = jnumF (jget jv "value") |> Option.defaultValue st.Value
                                                           Progress = jnumF (jget jv "progress") |> Option.defaultValue st.Progress } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget wv "zebraUpgrades" with
                  | Some (JArr zs) ->
                      for z in zs do
                          match z with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match wpool.ZebraUpgrades |> Map.tryFind n with
                                   | Some st ->
                                       wpool <-
                                           { wpool with
                                               ZebraUpgrades =
                                                   wpool.ZebraUpgrades
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // diplomacy.load: races
            (match jget root "diplomacy" with
             | Some (JObj dv) ->
                 (match jget dv "races" with
                  | Some (JArr rs) ->
                      for r in rs do
                          match r with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match dp.Races |> Map.tryFind n with
                                   | Some st ->
                                       dp <-
                                           { dp with
                                               Races =
                                                   dp.Races
                                                   |> Map.add n
                                                       { st with
                                                           EmbassyLevel = (jnumF (jget jv "embassyLevel") |> Option.defaultValue 0.0) |> int
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Energy = jnumF (jget jv "energy") |> Option.defaultValue st.Energy
                                                           Duration = jnumF (jget jv "duration") |> Option.defaultValue st.Duration } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // buildings.load: val/on/unlocked + stage (drop-empty semantics:
            // absent keys keep the reset defaults)
            (match jget root "buildings" with
             | Some (JArr bs) ->
                 for b0 in bs do
                     match b0 with
                     | JObj jv ->
                         (match jstrF (jget jv "name") with
                          | Some n ->
                              match bpool.ByName |> Map.tryFind n with
                              | Some st ->
                                  bpool <-
                                      { bpool with
                                          ByName =
                                              bpool.ByName
                                              |> Map.add n
                                                  { st with
                                                      Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                      Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                      On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                      Stage = (jnumF (jget jv "stage") |> Option.defaultValue (float st.Stage)) |> int } }
                          | None -> ())
                     | _ -> ()
             | _ -> ())

            // science.load
            (match jget root "science" with
             | Some (JObj sv) ->
                 (match jget sv "techs" with
                  | Some (JArr ts) ->
                      for t0 in ts do
                          match t0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match spool.Techs |> Map.tryFind n with
                                   | Some st ->
                                       spool <-
                                           { spool with
                                               Techs =
                                                   spool.Techs
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget sv "policies" with
                  | Some (JArr ps) ->
                      for p0 in ps do
                          match p0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match spool.Policies |> Map.tryFind n with
                                   | Some st ->
                                       spool <-
                                           { spool with
                                               Policies =
                                                   spool.Policies
                                                   |> Map.add n
                                                       { st with
                                                           Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                           Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // achievements.load
            (match jget root "achievements" with
             | Some (JArr a0s) ->
                 for a0 in a0s do
                     match a0 with
                     | JObj jv ->
                         (match jstrF (jget jv "name") with
                          | Some n ->
                              match apool.Achievements |> Map.tryFind n with
                              | Some st ->
                                  apool <-
                                      { apool with
                                          Achievements =
                                              apool.Achievements
                                              |> Map.add n
                                                  { st with
                                                      Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                      StarUnlocked = jboolF (jget jv "starUnlocked") |> Option.defaultValue st.StarUnlocked } }
                          | None -> ())
                     | _ -> ()
             | _ -> ())
            (match jget root "ach" with
             | Some (JObj av) ->
                 (match jget av "badges" with
                  | Some (JArr bs) ->
                      for b0 in bs do
                          match b0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   match apool.Badges |> Map.tryFind n with
                                   | Some st ->
                                       apool <-
                                           { apool with
                                               Badges =
                                                   apool.Badges
                                                   |> Map.add n { st with Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
             | _ -> ())

            // religion.load (+ legacy tcratio tier derivation)
            (match jget root "religion" with
             | Some (JObj rv) ->
                 rpool <-
                     { rpool with
                         Faith = jnumF (jget rv "faith") |> Option.defaultValue 0.0
                         Corruption = jnumF (jget rv "corruption") |> Option.defaultValue 0.0
                         FaithRatio = jnumF (jget rv "faithRatio") |> Option.defaultValue 0.0
                         TranscendenceTier = (jnumF (jget rv "transcendenceTier") |> Option.defaultValue 0.0) |> int
                         ActiveHolyGenocide = (jnumF (jget rv "activeHolyGenocide") |> Option.defaultValue 0.0) |> int
                         NecrocornDeficit = jnumF (jget rv "necrocornDeficit") |> Option.defaultValue 0.0 }
                 if rpool.TranscendenceTier = 0 then
                     match jnumF (jget rv "tcratio") with
                     | Some tc when tc > 0.0 ->
                         let tier = Game.Math.jsRound (System.Math.Log (10.0 * Game.Math.getUnlimitedDR tc 0.1))
                         rpool <- { rpool with TranscendenceTier = max 0 tier |> int }
                     | _ -> ()
                 let applyRelMeta (getTab: unit -> Map<string, ReligionMeta>) (setTab: Map<string, ReligionMeta> -> unit) (jv0: JsValue) =
                     match jv0 with
                     | JObj jv ->
                         (match jstrF (jget jv "name") with
                          | Some n ->
                              let tab = getTab ()
                              match tab |> Map.tryFind n with
                              | Some st ->
                                  setTab
                                      (tab
                                       |> Map.add n
                                           { st with
                                               Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                               On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                               Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked })
                              | None -> ()
                          | None -> ())
                     | _ -> ()
                 (match jget rv "zu" with
                  | Some (JArr xs) -> for x in xs do applyRelMeta (fun _ -> rpool.ZUs) (fun t -> rpool <- { rpool with ZUs = t }) x
                  | _ -> ())
                 (match jget rv "ru" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.RUs |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                RUs =
                                                    rpool.RUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int } })
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget rv "tu" with
                  | Some (JArr xs) -> for x in xs do applyRelMeta (fun _ -> rpool.TUs) (fun t -> rpool <- { rpool with TUs = t }) x
                  | _ -> ())
                 (match jget rv "pact" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match rpool.Pacts |> Map.tryFind n with
                                    | Some st ->
                                        rpool <-
                                            { rpool with
                                                Pacts =
                                                    rpool.Pacts
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } })
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // religion.afterLoad TU tier unlocks: TUDef carries no tier
                 // data and the tier is 0 in every reachable state — the save's
                 // own unlocked flags carry the state (no-op seam)
             | _ -> ())

            // space.load: metas + reversed unlock loops
            (match jget root "space" with
             | Some (JObj sv) ->
                 (match jget sv "programs" with
                  | Some (JArr ps) ->
                      for p0 in ps do
                          match p0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match spacep.Programs |> Map.tryFind n with
                                    | Some st ->
                                        spacep <-
                                            { spacep with
                                                Programs =
                                                    spacep.Programs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget sv "planets" with
                  | Some (JArr pls) ->
                      for pl in pls do
                          match pl with
                          | JObj pv ->
                              (match jstrF (jget pv "name") with
                               | Some pn ->
                                   (match spacep.Planets |> Map.tryFind pn with
                                    | Some st ->
                                        spacep <-
                                            { spacep with
                                                Planets =
                                                    spacep.Planets
                                                    |> Map.add pn
                                                        { st with
                                                            Reached = jboolF (jget pv "reached") |> Option.defaultValue st.Reached
                                                            Unlocked = jboolF (jget pv "unlocked") |> Option.defaultValue st.Unlocked
                                                            RouteDays = jnumF (jget pv "routeDays") |> Option.defaultValue st.RouteDays } }
                                    | None -> ())
                                   (match jget pv "buildings" with
                                    | Some (JArr bs) ->
                                        for b0 in bs do
                                            match b0 with
                                            | JObj jv ->
                                                (match jstrF (jget jv "name") with
                                                 | Some n ->
                                                     (match spacep.Buildings |> Map.tryFind n with
                                                      | Some st ->
                                                          spacep <-
                                                              { spacep with
                                                                  Buildings =
                                                                      spacep.Buildings
                                                                      |> Map.add n
                                                                          { st with
                                                                              Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                                              On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                                              Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked } }
                                                      | None -> ())
                                                 | None -> ())
                                            | _ -> ()
                                    | _ -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // load fan-outs: val>0 metas re-unlock their chains (reversed)
                 for pd in List.rev Game.Catalog.Space.programDefs do
                     let m = spacep.Programs.[pd.Name]
                     if m.Val > 0 then
                         for pn in pd.UnlocksPlanets do
                             let pl = spacep.Planets.[pn]
                             spacep <- { spacep with Planets = spacep.Planets |> Map.add pn { pl with Unlocked = true } }
                         for mn in pd.UnlocksMissions do
                             let m0 = spacep.Programs.[mn]
                             spacep <- { spacep with Programs = spacep.Programs |> Map.add mn { m0 with Unlocked = true } }
                         for pol in pd.UnlocksPolicies do
                             match spool.Policies |> Map.tryFind pol with
                             | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                             | None -> ()
                 for bd in List.rev Game.Catalog.Space.buildingDefs do
                     let m = spacep.Buildings.[bd.Name]
                     if m.Val > 0 then
                         for pol in bd.UnlocksPolicies do
                             match spool.Policies |> Map.tryFind pol with
                             | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                             | None -> ()
             | _ -> ())

            // time.load
            (match jget root "time" with
             | Some (JObj tv) ->
                 tpool <-
                     { tpool with
                         Flux = jnumF (jget tv "flux") |> Option.defaultValue tpool.Flux
                         Heat = jnumF (jget tv "heat") |> Option.defaultValue tpool.Heat
                         TestShatter = (jnumF (jget tv "testShatter") |> Option.defaultValue (float tpool.TestShatter)) |> int
                         IsAccelerated = jboolF (jget tv "isAccelerated") |> Option.defaultValue tpool.IsAccelerated }
                 (match jget tv "cfu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match tpool.CFUs |> Map.tryFind n with
                                    | Some st ->
                                        let st1 =
                                            { st with
                                                Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked }
                                        let st2 =
                                            match jnumF (jget jv "heat") with
                                            | Some h -> { st1 with Heat = h }
                                            | None -> st1
                                        let st3 =
                                            match jnumF (jget jv "delayTicks") with
                                            | Some d -> { st2 with DelayTicks = int d }
                                            | None -> st2
                                        let st4 =
                                            match jget jv "isAutomationEnabled" with
                                            | Some (JBool b) -> { st3 with IsAutomationEnabled = Some b }
                                            | _ -> st3
                                        tpool <- { tpool with CFUs = tpool.CFUs |> Map.add n st4 }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 (match jget tv "vsu" with
                  | Some (JArr xs) ->
                      for x in xs do
                          match x with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match tpool.VSUs |> Map.tryFind n with
                                    | Some st ->
                                        tpool <-
                                            { tpool with
                                                VSUs =
                                                    tpool.VSUs
                                                    |> Map.add n
                                                        { st with
                                                            Val = (jnumF (jget jv "val") |> Option.defaultValue (float st.Val)) |> int
                                                            On = (jnumF (jget jv "on") |> Option.defaultValue (float st.On)) |> int
                                                            Unlocked =
                                                                (match jboolF (jget jv "unlocked") with
                                                                 | Some u -> u
                                                                 | None -> st.Unlocked) } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 // timeBoiler unlocks with the blast furnace
                 let bfVal = tpool.CFUs.["blastFurnace"].Val
                 let tb = tpool.CFUs.["timeBoiler"]
                 tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "timeBoiler" { tb with Unlocked = bfVal > 0 } }
                 // queueSources
                 (match jget tv "queueSources" with
                  | Some (JObj qs) ->
                      let mutable s = Set.empty
                      for (k, v) in qs do
                          match v with
                          | JBool true -> s <- s |> Set.add k
                          | _ -> ()
                      queueSourcesUnlocked <- s
                  | _ -> ())
                 // gainTemporalFlux(ts) — calendar gate, fake clock delta
                 (match jnumF (jget tv "timestamp") with
                  | Some ts ->
                      let calResearched = (match spool.Techs |> Map.tryFind "calendar" with Some t -> t.Researched | None -> false)
                      if calResearched then
                          let delta = (1759000000000.0 + float curLogTick * 1000.0) - ts
                          if delta > 0.0 then
                              refreshCache ()
                              let ta = tpool.CFUs.["temporalAccelerator"]
                              let energyRatio = 1.0 + float ta.Val * (ta.Eff |> Map.tryFind "timeRatio" |> Option.defaultValue 0.0)
                              let gained = Game.Math.jsRound (delta / 60000.0 * (5.0 * energyRatio))
                              let pool1, _ = Game.Resources.addResEvent calendarDay "temporalFlux" gained pool
                              pool <- pool1
                  | None -> ())
             | _ -> ())

            // prestige.load: perks + researched unlock re-fire
            (match jget root "prestige" with
             | Some (JObj pv) ->
                 (match jget pv "perks" with
                  | Some (JArr ps) ->
                      for p0 in ps do
                          match p0 with
                          | JObj jv ->
                              (match jstrF (jget jv "name") with
                               | Some n ->
                                   (match ppool.Perks |> Map.tryFind n with
                                    | Some st ->
                                        ppool <-
                                            { ppool with
                                                Perks =
                                                    ppool.Perks
                                                    |> Map.add n
                                                        { st with
                                                            Unlocked = jboolF (jget jv "unlocked") |> Option.defaultValue st.Unlocked
                                                            Researched = jboolF (jget jv "researched") |> Option.defaultValue st.Researched } }
                                    | None -> ())
                               | None -> ())
                          | _ -> ()
                  | _ -> ())
                 for n in ppool.PerkOrder do
                     let pk = ppool.Perks.[n]
                     if pk.Researched then
                         match (Game.Catalog.World.perkDefs |> List.find (fun d -> d.Name = n)).Unlocks with
                         | Some u ->
                             let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs u.Jobs u.Tech u.Policies u.Upgrades u.ZebraUpgrades u.Crafts bpool spool wpool
                             bpool <- bp2; spool <- sp2; wpool <- wp2
                         | None -> ()
             | _ -> ())

            // stats.load
            (match jget root "stats" with
             | Some (JArr xs) ->
                 for x in xs do
                     match x with
                     | JObj jv ->
                         (match jstrF (jget jv "name"), jnumF (jget jv "val") with
                          | Some n, Some v -> stpool <- { stpool with Values = stpool.Values |> Map.add n v }
                          | _ -> ())
                     | _ -> ()
             | _ -> ())
            (match jget root "statsCurrent" with
             | Some (JArr xs) ->
                 for x in xs do
                     match x with
                     | JObj jv ->
                         (match jstrF (jget jv "name"), jnumF (jget jv "val") with
                          | Some n, Some v -> stpool <- { stpool with Current = stpool.Current |> Map.add n v }
                          | _ -> ())
                     | _ -> ()
             | _ -> ())

            // void.load
            (match jget root "void" with
             | Some (JObj vv) -> voidp <- { voidp with Faction = jstrF (jget vv "faction") }
             | _ -> ())

            // game.save tail: karmaKittens / ironWill / deadKittens
            (match jget root "game" with
             | Some (JObj gv) ->
                 let karma = (jnumF (jget gv "karmaKittens") |> Option.defaultValue 0.0) |> int
                 pool <- { pool with KarmaKittens = karma }
                 ironWill <- jboolF (jget gv "ironWill") |> Option.defaultValue true
                 (match jnumF (jget gv "deadKittens") with
                  | Some d -> stpool <- { stpool with Values = stpool.Values |> Map.add "kittensDead" d }
                  | None -> ())
             | _ -> ())

            // science.afterLoad: re-unlock researched techs (reversed)
            for n in List.rev spool.TechOrder do
                let t = spool.Techs.[n]
                if t.Researched then
                    match t.Def.Unlocks with
                    | Some u ->
                        vpool <- { vpool with JobUnlocked = vpool.JobUnlocked |> Set.union (Set.ofList u.Jobs) }
                        let bp2, sp2, wp2 = Game.Managers.unlock u.Buildings u.Tabs [] u.Tech u.Policies u.Upgrades [] u.Crafts bpool spool wpool
                        bpool <- bp2; spool <- sp2; wpool <- wp2
                    | None -> ()

            // calculateAllEffects + updateMaxValueAll + updateCaches
            calculateAllTime ()
            pool <- Game.Resources.updateMaxValueAll (capCtx ()) pool
            refreshCache ()
        | _ -> failwith "save blob is not a JSON object"
` ;
  if (t.split(anchor).length - 1 !== 1) { console.error("FAIL program anchor 2"); process.exit(1); }
  t = t.replace(anchor, body);
  fs.writeFileSync(q, t);
  console.log("ok applySaveBlob");
}
console.log("patch21 part A done");
