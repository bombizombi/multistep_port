module kittens_land.Pages.Page

open Feliz
open ElmishLand
open kittens_land.Shared
open kittens_land.KittensState

type Model =
    { Tab: string
      S: kittens_land.KittensState.State
      Speed: float
      Toast: string }

type Msg =
    | Tick
    | Gather
    | Buy of string
    | Assign of string * int
    | Unassign of string * int
    | Research of string
    | Upgrade of string
    | CraftOne of string
    | CraftAll of string
    | Praise
    | BuyRU of string
    | BuyZU of string
    | Trade of string
    | Embassy of string
    | Mission of string
    | SpaceBuy of string
    | CFUBuy of string
    | VSUBuy of string
    | ChallengeToggle of string
    | SetTab of string
    | SetSpeed of float
    | SaveGame
    | LoadGame
    | ClearConsole
    | QAdd of string * string
    | QRemove of int
    | ToggleOption of string
    | SetNotation of string
    | ResetGame
    | LayoutMsg of Layout.Msg

let tickCmd () =
    Command.ofAsync
        (fun () -> async {
            do! Async.Sleep 100
            return ()
        })
        ()
        (fun _ -> Tick)

let init () =
    { Tab = "Bonfire"
      S = kittens_land.KittensState.init ()
      Speed = 1.0
      Toast = "" },
    Command.batch [ Command.none; tickCmd () ]

let update (msg: Msg) (model: Model) =
    match msg with
    | Tick -> { model with S = kittens_land.KittensState.tick model.S }, Command.none
    | Gather -> { model with S = kittens_land.KittensState.gatherCatnip model.S }, Command.none
    | Buy name -> { model with S = kittens_land.KittensState.buyBuilding name model.S }, Command.none
    | Assign (job, n) -> { model with S = kittens_land.KittensState.assignJob job n model.S }, Command.none
    | Unassign (job, n) -> { model with S = kittens_land.KittensState.unassignJob job n model.S }, Command.none
    | Research name -> { model with S = kittens_land.KittensState.research name model.S }, Command.none
    | Upgrade name -> { model with S = kittens_land.KittensState.buyUpgrade name model.S }, Command.none
    | CraftOne name -> { model with S = kittens_land.KittensState.craft name 1.0 model.S }, Command.none
    | CraftAll name -> { model with S = kittens_land.KittensState.craftAll name model.S }, Command.none
    | Praise -> { model with S = kittens_land.KittensState.praise model.S }, Command.none
    | BuyRU name -> { model with S = kittens_land.KittensState.buyRU name model.S }, Command.none
    | BuyZU name -> { model with S = kittens_land.KittensState.buyZU name model.S }, Command.none
    | Trade race -> { model with S = kittens_land.KittensState.trade race model.S }, Command.none
    | Embassy race -> { model with S = kittens_land.KittensState.buyEmbassy race model.S }, Command.none
    | Mission name -> { model with S = kittens_land.KittensState.buyProgram name model.S }, Command.none
    | SpaceBuy name -> { model with S = kittens_land.KittensState.buySpaceBuilding name model.S }, Command.none
    | CFUBuy name -> { model with S = kittens_land.KittensState.buyCFU name model.S }, Command.none
    | VSUBuy name -> { model with S = kittens_land.KittensState.buyVSU name model.S }, Command.none
    | ChallengeToggle name -> { model with S = kittens_land.KittensState.toggleChallengePending name model.S }, Command.none
    | SetTab tab -> { model with Tab = tab }, Command.none
    | SetSpeed mult ->
        { model with Speed = mult },
        Command.ofAsync
            (fun () -> async {
                do! Async.Sleep (int (100.0 / mult))
                return ()
            })
            ()
            (fun _ -> Tick)
    | SaveGame ->
        Browser.Dom.window.localStorage.setItem(kittens_land.KittensState.saveKey, kittens_land.KittensState.buildSaveString model.S)
        { model with Toast = "Game saved" }, Command.none
    | LoadGame ->
        let stored = Browser.Dom.window.localStorage.getItem(kittens_land.KittensState.saveKey)
        if stored = null then { model with Toast = "No saved game found" }, Command.none
        else
            match kittens_land.KittensState.parseSave stored with
            | Some loaded ->
                { model with S = kittens_land.KittensState.applyLoaded loaded model.S; Toast = "Game loaded" },
                Command.batch [ Command.none; tickCmd () ]
            | None -> { model with Toast = "Load failed: unrecognizable save" }, Command.none
    | ClearConsole -> { model with S = kittens_land.KittensState.consoleClear model.S }, Command.none
    | QAdd (name, qtype) -> { model with S = kittens_land.KittensState.addToQueue name qtype model.S }, Command.none
    | QRemove idx -> { model with S = kittens_land.KittensState.removeFromQueue idx model.S }, Command.none
    | ToggleOption name -> { model with S = kittens_land.KittensState.setBoolOption name (not model.S.Opts.Bools.[name]) model.S }, Command.none
    | SetNotation n -> { model with S = kittens_land.KittensState.setNotation n model.S }, Command.none
    | ResetGame ->
        let s' = kittens_land.KittensState.resetGame model.S
        { model with S = s'; Toast = "Game reset" }, Command.batch [ Command.none; tickCmd () ]
    | LayoutMsg _ -> model, Command.none

let fmt (v: float) =
    if v >= 1000.0 then string (int v)
    elif v = float (int v) then string (int v)
    else sprintf "%.1f" v

let view (model: Model) (dispatch: Msg -> unit) =
    let s = model.S
    let rows = kittens_land.KittensState.resRows s |> List.filter (fun r -> r.Show)
    let cal = s.Calendar

    let tabStyle (active: bool) =
        [
            style.paddingTop 4
            style.paddingBottom 4
            style.paddingLeft 14
            style.paddingRight 14
            style.marginRight 6
            style.fontFamily "monospace"
            style.fontSize 14
            style.cursor "pointer"
            style.border(1, borderStyle.solid, "#6a5830")
            style.backgroundColor (if active then "#6a5830" else "#3a2f18")
            style.color "#e8e0c8"
        ]

    let btnStyle (enabled: bool) =
        [
            style.paddingTop 4
            style.paddingBottom 4
            style.paddingLeft 12
            style.paddingRight 12
            style.fontFamily "monospace"
            style.fontSize 13
            style.backgroundColor "#3a2f18"
            style.color "#e8e0c8"
            style.border(1, borderStyle.solid, "#6a5830")
            style.cursor (if enabled then "pointer" else "default")
        ]

    let priceText (prices: kittens_land.KittensState.PriceRow list) =
        prices |> List.map (fun p0 -> p0.Resource + " " + fmt p0.Val) |> String.concat "; "

    let buyRow (label: string) (btnText: string) (enabled: bool) (valText: string) (priceText: string) (key: string) (act: Msg) =
        Html.div [
            prop.key key
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
                style.opacity (if enabled then 1.0 else 0.45)
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle enabled)
                    prop.disabled (not enabled)
                    prop.onClick (fun _ -> dispatch act)
                    prop.text btnText
                ]
                Html.span [
                    prop.style [ style.fontSize 13; style.width 220 ]
                    prop.text (label + valText)
                ]
                if priceText <> "" then
                    Html.span [
                        prop.style [ style.fontSize 12; style.color "#b0a480" ]
                        prop.text priceText
                    ]
            ]
        ]

    let resRow (r: kittens_land.KittensState.ResRow) =
        Html.div [
            prop.key r.Name
            prop.style [ style.fontSize 14 ]
            prop.text (r.Name + ": " + fmt r.Value + (if r.Max > 0.0 && r.Max < 1e6 then "/" + fmt r.Max else ""))
        ]

    let buildingRow (b: kittens_land.KittensState.BuildingRow) =
        Html.div [
            prop.key b.Name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
                style.opacity (if b.Enabled then 1.0 else 0.45)
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle b.Enabled)
                    prop.disabled (not b.Enabled)
                    prop.onClick (fun _ -> dispatch (Buy b.Name))
                    prop.text (b.Label + if b.Val > 0 then " (" + string b.Val + ")" else "")
                ]
                Html.span [
                    prop.style [ style.fontSize 12; style.color "#b0a480" ]
                    prop.text (priceText b.Prices)
                ]
            ]
        ]

    let jobRow (j: kittens_land.KittensState.JobRow) =
        Html.div [
            prop.key j.Name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 8
                style.marginBottom 6
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle (j.Assigned > 0))
                    prop.disabled (j.Assigned = 0)
                    prop.onClick (fun _ -> dispatch (Unassign (j.Name, 1)))
                    prop.text "-"
                ]
                Html.button [
                    prop.style (btnStyle true)
                    prop.onClick (fun _ -> dispatch (Assign (j.Name, 1)))
                    prop.text "+"
                ]
                Html.span [
                    prop.style [ style.fontSize 13; style.width 110 ]
                    prop.text (j.Label + " (" + string j.Assigned + ")")
                ]
            ]
        ]

    let techRow (t: kittens_land.KittensState.TechRow) =
        Html.div [
            prop.key t.Name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
                style.opacity (if t.Researched then 0.6 elif t.Enabled then 1.0 else 0.45)
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle (t.Enabled || t.Researched))
                    prop.disabled (not t.Enabled)
                    prop.onClick (fun _ -> dispatch (Research t.Name))
                    prop.text (if t.Researched then "done" else "Research")
                ]
                Html.span [
                    prop.style [ style.fontSize 13; style.width 170 ]
                    prop.text t.Label
                ]
                Html.span [
                    prop.style [ style.fontSize 12; style.color "#b0a480" ]
                    prop.text (priceText t.Prices)
                ]
            ]
        ]

    let upgradeRow (u: kittens_land.KittensState.UpgradeRow) =
        Html.div [
            prop.key u.Name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
                style.opacity (if u.Researched then 0.6 elif u.Enabled then 1.0 else 0.45)
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle (u.Enabled || u.Researched))
                    prop.disabled (not u.Enabled)
                    prop.onClick (fun _ -> dispatch (Upgrade u.Name))
                    prop.text (if u.Researched then "done" else "Buy")
                ]
                Html.span [
                    prop.style [ style.fontSize 13; style.width 200 ]
                    prop.text u.Label
                ]
                Html.span [
                    prop.style [ style.fontSize 12; style.color "#b0a480" ]
                    prop.text (priceText u.Prices)
                ]
            ]
        ]

    let craftRow (c: kittens_land.KittensState.CraftRow) =
        Html.div [
            prop.key c.Name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle true)
                    prop.onClick (fun _ -> dispatch (CraftOne c.Name))
                    prop.text "Craft"
                ]
                Html.button [
                    prop.style (btnStyle true)
                    prop.onClick (fun _ -> dispatch (CraftAll c.Name))
                    prop.text "All"
                ]
                Html.span [
                    prop.style [ style.fontSize 13; style.width 130 ]
                    prop.text (c.Label + " (" + fmt c.Value + ")")
                ]
                Html.span [
                    prop.style [ style.fontSize 12; style.color "#b0a480" ]
                    prop.text (priceText c.Prices)
                ]
            ]
        ]

    let kittens, maxKittens, happiness = kittens_land.KittensState.kittenSummary s
    let queueCap = kittens_land.KittensState.queueCap s
    let queueLen = kittens_land.KittensState.queueLength s

    let queueRows =
        s.QueueItems
        |> List.mapi (fun i q ->
            Html.div [
                prop.key (string i + q.QName)
                prop.style [
                    style.display.flex
                    style.alignItems.center
                    style.gap 10
                    style.marginBottom 6
                ]
                prop.children [
                    Html.button [
                        prop.style (btnStyle true)
                        prop.onClick (fun _ -> dispatch (QRemove i))
                        prop.text "x"
                    ]
                    Html.span [
                        prop.style [ style.fontSize 13 ]
                        prop.text (q.QName + " (" + q.QType + ") x" + string q.QValue)
                    ]
                ]
            ])

    let consoleRows =
        s.ConsoleMsgs
        |> List.map (fun m ->
            Html.div [
                prop.key (string m.CmId)
                prop.style [ style.fontSize 12; style.marginBottom 4; style.color "#c8b890" ]
                prop.children [
                    if m.CmHasCal then
                        Html.span [
                            prop.style [ style.color "#8a7850"; style.marginRight 8 ]
                            prop.text ("Y" + string m.CmYear + " D" + string m.CmDay + " " + m.CmSeason + " - ")
                        ]
                    Html.span [ prop.text m.CmText ]
                ]
            ])

    let optRow (name: string) =
        let v = s.Opts.Bools.[name]
        Html.div [
            prop.key name
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
            ]
            prop.children [
                Html.button [
                    prop.style (btnStyle true)
                    prop.onClick (fun _ -> dispatch (ToggleOption name))
                    prop.text (if v then "on" else "off")
                ]
                Html.span [
                    prop.style [ style.fontSize 13 ]
                    prop.text name
                ]
            ]
        ]

    let tabContent =
        match model.Tab with
        | "Village" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 14; style.marginBottom 10; style.color "#d4c290" ]
                    prop.text (
                        "Kittens: "
                        + string kittens
                        + "/"
                        + string maxKittens
                        + " - happiness: "
                        + sprintf "%.0f%%" (happiness * 100.0)
                    )
                ]
                yield! (kittens_land.KittensState.jobRows s |> List.filter (fun j -> j.Unlocked) |> List.map jobRow)
            ]
        | "Science" -> List.map techRow (kittens_land.KittensState.techRows s)
        | "Workshop" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text "Upgrades"
                ]
                yield! List.map upgradeRow (kittens_land.KittensState.upgradeRows s)
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.marginTop 12; style.color "#b0a480" ]
                    prop.text "Crafts"
                ]
                yield! List.map craftRow (kittens_land.KittensState.craftRows s)
            ]
        | "Diplomacy" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text "Races (unlock rolls happen at year gates; trade needs manpower + gold)"
                ]
                yield! (kittens_land.KittensState.raceRows s |> List.map (fun r ->
                    buyRow r.Label "Trade" r.Tradeable
                        (" - standing " + sprintf "%.2f" r.Standing + ", embassies " + string r.EmbassyLevel)
                        "" ("race." + r.Name) (Trade r.Name)))
                yield! (kittens_land.KittensState.raceRows s |> List.map (fun r ->
                    buyRow r.Label "Embassy" r.Tradeable (" - level " + string r.EmbassyLevel) "" ("emb." + r.Name) (Embassy r.Name)))
            ]
        | "Religion" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 14; style.marginBottom 10; style.color "#d4c290" ]
                    prop.text ("Faith: " + fmt (kittens_land.KittensState.getRes s.Pool "faith") + " - worship: " + sprintf "%.1f" s.Rpool.Faith)
                ]
                yield Html.button [
                    prop.style (btnStyle true @ [ style.marginBottom 10 ])
                    prop.onClick (fun _ -> dispatch Praise)
                    prop.text "Praise the sun!"
                ]
                yield! (kittens_land.KittensState.religionRows s |> List.map (fun r ->
                    buyRow r.Label (if r.Kind = "zu" then "Build" else "Adore") r.Enabled
                        (" (" + string r.Val + ")") "" ("rel." + r.Name)
                        (if r.Kind = "zu" then BuyZU r.Name else BuyRU r.Name)))
            ]
        | "Space" ->
            kittens_land.KittensState.spaceRows s
            |> List.map (fun r ->
                buyRow r.Label (if r.Kind = "mission" then "Launch" else "Build") r.Enabled
                    (" (" + string r.Val + ")") "" ("sp." + r.Name)
                    (if r.Kind = "mission" then Mission r.Name else SpaceBuy r.Name))
        | "Time" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text ("Temporal flux: " + fmt s.Tpool.Flux + " - heat: " + fmt s.Tpool.Heat)
                ]
                yield! (kittens_land.KittensState.timeRows s |> List.map (fun r ->
                    buyRow r.Label (if r.Kind = "cfu" then "Build" else "Buy") r.Enabled
                        (" (" + string r.Val + ")") "" ("t." + r.Name)
                        (if r.Kind = "cfu" then CFUBuy r.Name else VSUBuy r.Name)))
            ]
        | "Challenges" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text "Marked challenges activate on the next reset (Settings tab)"
                ]
                yield! (kittens_land.KittensState.challengeRows s |> List.map (fun c ->
                    buyRow c.Label
                        (if c.Pending then "Unmark" elif c.Active then "Active!" elif c.Researched then "Completed" else "Mark")
                        (not c.Researched)
                        (if c.On > 0 then " (x" + string c.On + ")" else "")
                        ""
                        ("ch." + c.Name)
                        (ChallengeToggle c.Name)))
            ]
        | "Queue" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text ("Queue " + string queueLen + "/" + string queueCap + " - the head item is attempted every 10 ticks")
                ]
                yield! queueRows
                yield Html.button [
                    prop.style (btnStyle true)
                    prop.onClick (fun _ -> dispatch (QAdd ("hut", "buildings")))
                    prop.text "Queue a Hut"
                ]
            ]
        | "Settings" ->
            [
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text ("Notation: " + s.Opts.Notation)
                ]
                yield Html.div [
                    prop.style [ style.display.flex; style.gap 8; style.marginBottom 12 ]
                    prop.children [
                        for n in [ "si"; "e"; "sie" ] ->
                            Html.button [
                                prop.key n
                                prop.style (btnStyle (s.Opts.Notation = n))
                                prop.onClick (fun _ -> dispatch (SetNotation n))
                                prop.text n
                            ]
                    ]
                ]
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text ("Game speed: " + string model.Speed + "x")
                ]
                yield Html.div [
                    prop.style [ style.display.flex; style.gap 8; style.marginBottom 12 ]
                    prop.children [
                        for mult in [ 1.0; 3.0; 10.0 ] ->
                            Html.button [
                                prop.key (string mult)
                                prop.style (btnStyle (model.Speed = mult))
                                prop.onClick (fun _ -> dispatch (SetSpeed mult))
                                prop.text (string mult + "x")
                            ]
                    ]
                ]
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.color "#b0a480" ]
                    prop.text "Options"
                ]
                yield! (Game.Settings.settingsArr |> List.map (fun o -> optRow o.Name))
                yield Html.div [
                    prop.style [ style.fontSize 13; style.marginBottom 8; style.marginTop 12; style.color "#b0a480" ]
                    prop.text "Save / load"
                ]
                yield Html.div [
                    prop.style [ style.display.flex; style.gap 8 ]
                    prop.children [
                        Html.button [
                            prop.style (btnStyle true)
                            prop.onClick (fun _ -> dispatch SaveGame)
                            prop.text "Save"
                        ]
                        Html.button [
                            prop.style (btnStyle true)
                            prop.onClick (fun _ -> dispatch LoadGame)
                            prop.text "Load"
                        ]
                        Html.button [
                            prop.style (btnStyle true)
                            prop.onClick (fun _ -> dispatch ResetGame)
                            prop.text "Reset"
                        ]
                    ]
                ]
                yield Html.div [
                    prop.style [ style.fontSize 11; style.marginTop 6; style.color "#8a7850" ]
                    prop.text "Save stores to this browser's localStorage under its own key - the original game's saves are untouched."
                ]
            ]
        | _ ->
            [
                yield Html.button [
                    prop.style (btnStyle true @ [ style.display.block; style.marginBottom 10 ])
                    prop.onClick (fun _ -> dispatch Gather)
                    prop.text "Gather catnip"
                ]
                yield! List.map buildingRow (kittens_land.KittensState.buildingRows s)
            ]

    let tabs = [ "Bonfire"; "Village"; "Science"; "Workshop"; "Diplomacy"; "Religion"; "Space"; "Time"; "Challenges"; "Queue"; "Settings" ]

    let consolePanel =
        Html.div [
            prop.style [
                style.borderTop(1, borderStyle.solid, "#4a3c20")
                style.marginTop 16
                style.paddingTop 10
            ]
            prop.children [
                Html.div [
                    prop.style [ style.display.flex; style.justifyContent.spaceBetween; style.marginBottom 6 ]
                    prop.children [
                        Html.span [
                            prop.style [ style.fontSize 13; style.color "#d4c290" ]
                            prop.text "Log"
                        ]
                        Html.button [
                            prop.style (btnStyle true)
                            prop.onClick (fun _ -> dispatch ClearConsole)
                            prop.text "Clear log"
                        ]
                    ]
                ]
                yield! consoleRows
            ]
        ]

    Html.div [
        prop.style [
            style.fontFamily "monospace"
            style.padding 20
            style.backgroundColor "#1a1408"
            style.color "#e8e0c8"
            style.minHeight (length.vh 100)
        ]
        prop.children [
            Html.div [
                prop.style [ style.fontSize 18; style.marginBottom 10; style.color "#d4c290" ]
                prop.text (
                    "Year "
                    + string (int cal.Year + 1)
                    + ", Day "
                    + string (int cal.Day + 1)
                    + " - "
                    + Game.Calendar.seasons.[cal.Season].Name.ToUpper()
                )
            ]
            Html.div [
                prop.style [
                    style.display.flex
                    style.flexWrap.wrap
                    style.gap 18
                    style.marginBottom 14
                ]
                prop.children (rows |> List.map resRow)
            ]
            Html.div [
                prop.style [ style.marginBottom 14 ]
                prop.children [
                    for t in tabs ->
                        Html.button [
                            prop.key t
                            prop.style (tabStyle (model.Tab = t))
                            prop.onClick (fun _ -> dispatch (SetTab t))
                            prop.text t
                        ]
                ]
            ]
            Html.div [
                prop.style [
                    style.borderTop(1, borderStyle.solid, "#4a3c20")
                    style.paddingTop 12
                ]
                prop.children tabContent
            ]
            consolePanel
            if model.Toast <> "" then
                Html.div [
                    prop.style [
                        style.position.fixedRelativeToWindow
                        style.bottom 14
                        style.right 14
                        style.paddingTop 8
                        style.paddingBottom 8
                        style.paddingLeft 14
                        style.paddingRight 14
                        style.backgroundColor "#6a5830"
                        style.color "#f0e8d0"
                        style.fontSize 13
                    ]
                    prop.text model.Toast
                ]
        ]
    ]

let page (_shared: SharedModel) (_route: HomeRoute) =
    Page.from init update view () (fun lm -> LayoutMsg lm)
