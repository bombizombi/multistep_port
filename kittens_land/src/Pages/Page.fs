module kittens_land.Pages.Page

open Feliz
open ElmishLand
open kittens_land.Shared
open kittens_land.KittensState

type TipData =
    { Desc: string
      Flavor: string option
      Prices: kittens_land.KittensState.TipPriceLine list }

type Model =
    { Tab: string
      S: kittens_land.KittensState.State
      Speed: float
      LoopGen: int
      Toast: string
      Tooltip: (float * float * TipData) option
      OptionsOpen: bool
      ResEditMode: bool
      JobsPanelCollapsed: bool
      RightTab: string }

type Msg =
    | Tick of int
    | Gather
    | Refine
    | Buy of string
    | Assign of string * int
    | Unassign of string * int
    | Research of string
    | Upgrade of string
    | Craft of string * float
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
    | SetRightTab of string
    | SetSpeed of float
    | SetTip of (float * float * TipData) option
    | ToggleOptions
    | ToggleResEditMode
    | ToggleJobsPanel
    | ToggleResHidden of string
    | SetShowHiddenRes of bool
    | SaveGame
    | LoadGame
    | ClearConsole
    | ClearAllJobs
    | QAdd of string * string
    | QRemove of int
    | ToggleOption of string
    | SetNotation of string
    | ResetGame
    | LayoutMsg of Layout.Msg

let tickCmd (speed: float) (gen: int) =
    Command.ofAsync
        (fun g -> async {
            do! Async.Sleep (int (100.0 / speed))
            return g
        })
        gen
        (fun g -> Tick g)

let init () =
    { Tab = "Bonfire"
      S = kittens_land.KittensState.init ()
      Speed = 1.0
      LoopGen = 1
      Toast = ""
      Tooltip = None
      OptionsOpen = false
      ResEditMode = false
      JobsPanelCollapsed = false
      RightTab = "Log" },
    Command.batch [ Command.none; tickCmd 1.0 1 ]

let update (msg: Msg) (model: Model) =
    match msg with
    | Tick gen ->
        if gen = model.LoopGen then
            { model with S = kittens_land.KittensState.tick model.S }, tickCmd model.Speed gen
        else model, Command.none
    | Gather -> { model with S = kittens_land.KittensState.gatherCatnip model.S }, Command.none
    | Refine -> { model with S = kittens_land.KittensState.refineCatnip model.S }, Command.none
    | Buy name -> { model with S = kittens_land.KittensState.buyBuilding name model.S }, Command.none
    | Assign (job, n) -> { model with S = kittens_land.KittensState.assignJob job n model.S }, Command.none
    | Unassign (job, n) -> { model with S = kittens_land.KittensState.unassignJob job n model.S }, Command.none
    | Research name -> { model with S = kittens_land.KittensState.research name model.S }, Command.none
    | Upgrade name -> { model with S = kittens_land.KittensState.buyUpgrade name model.S }, Command.none
    | Craft (name, amt) -> { model with S = kittens_land.KittensState.craft name amt model.S }, Command.none
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
    | SetRightTab tab -> { model with RightTab = tab }, Command.none
    | SetSpeed mult -> { model with Speed = mult }, Command.none
    | SetTip tip -> { model with Tooltip = tip }, Command.none
    | ToggleOptions -> { model with OptionsOpen = not model.OptionsOpen }, Command.none
    | ToggleJobsPanel -> { model with JobsPanelCollapsed = not model.JobsPanelCollapsed }, Command.none
    | ToggleResEditMode -> { model with ResEditMode = not model.ResEditMode }, Command.none
    | ToggleResHidden name -> { model with S = kittens_land.KittensState.toggleResHidden name model.S }, Command.none
    | SetShowHiddenRes v -> { model with S = kittens_land.KittensState.setShowHiddenRes v model.S }, Command.none
    | SaveGame ->
        Browser.Dom.window.localStorage.setItem(kittens_land.KittensState.saveKey, kittens_land.KittensState.buildSaveString model.S)
        { model with Toast = "Game saved" }, Command.none
    | LoadGame ->
        let stored = Browser.Dom.window.localStorage.getItem(kittens_land.KittensState.saveKey)
        if stored = null then { model with Toast = "No saved game found" }, Command.none
        else
            match kittens_land.KittensState.parseSave stored with
            | Some loaded ->
                { model with S = kittens_land.KittensState.applyLoaded loaded model.S; LoopGen = model.LoopGen + 1; Toast = "Game loaded" },
                Command.batch [ Command.none; tickCmd model.Speed (model.LoopGen + 1) ]
            | None -> { model with Toast = "Load failed: unrecognizable save" }, Command.none
    | ClearConsole -> { model with S = kittens_land.KittensState.consoleClear model.S }, Command.none
    | ClearAllJobs -> { model with S = kittens_land.KittensState.clearAllJobs model.S }, Command.none
    | QAdd (name, qtype) -> { model with S = kittens_land.KittensState.addToQueue name qtype model.S }, Command.none
    | QRemove idx -> { model with S = kittens_land.KittensState.removeFromQueue idx model.S }, Command.none
    | ToggleOption name -> { model with S = kittens_land.KittensState.setBoolOption name (not model.S.Opts.Bools.[name]) model.S }, Command.none
    | SetNotation n -> { model with S = kittens_land.KittensState.setNotation n model.S }, Command.none
    | ResetGame ->
        let s' = kittens_land.KittensState.resetGame model.S
        { model with
            S = s'
            LoopGen = model.LoopGen + 1
            Tab = "Bonfire"
            Toast = "Game reset" },
        Command.batch [ Command.none; tickCmd model.Speed (model.LoopGen + 1) ]
    | LayoutMsg _ -> model, Command.none

let fmt (v: float) =
    if v >= 1000.0 then string (int v)
    elif v = float (int v) then string (int v)
    else sprintf "%.1f" v

// ----------------------------------------------------------------------------
// orig-styled view (cage CSS classes: #topBar / .column / .tabsContainer /
// .btn.nosel.modern / .res-table / #tooltip.button_tooltip)
// ----------------------------------------------------------------------------

let view (model: Model) (dispatch: Msg -> unit) =
    let s = model.S
    let cal = s.Calendar

    let fmtSigned (v: float) = (if v > 0.0 then "+" else "") + fmt v

    let gameLeft () =
        let rect = Browser.Dom.document.getElementById("game").getBoundingClientRect()
        (rect.left, rect.top)

    // --- tooltip plumbing ----------------------------------------------------

    let tipHandlers (tip: TipData) =
        [ prop.onMouseEnter (fun ev ->
            let gl, gt = gameLeft ()
            dispatch (SetTip(Some(ev.clientX - gl + 12.0, ev.clientY - gt + 12.0, tip))))
          prop.onMouseLeave (fun _ -> dispatch (SetTip None)) ]

    let pricesTip (desc: string) (flavorKey: string option) (prices: kittens_land.KittensState.PriceRow list) : TipData =
        { Desc = desc
          Flavor = flavorKey |> Option.map Game.Labels.get |> Option.filter (fun f -> f <> "" && f <> flavorKey.Value)
          Prices = kittens_land.KittensState.priceLines s false prices }

    let bldTip (name: string) (prices: kittens_land.KittensState.PriceRow list) =
        pricesTip
            (Game.Labels.get ("bld." + name + ".desc"))
            (Some("bld." + name + ".flavor"))
            prices

    // --- orig modern button --------------------------------------------------

    let modernBtn (key: string) (label: string) (amtText: string) (enabled: bool) (tip: TipData option) (onClick: unit -> unit) =
        Html.div [
            prop.key key
            prop.className (if enabled then "btn nosel modern" else "btn nosel modern disabled")
            // orig Button.render: display block, fixed 264px — tabs are single
            // column unless the tab's renderer splits into left/right rows
            // (Bonfire's "all" group does; see bldTopContainer below)
            prop.style [ style.position.relative; style.display.block; style.marginBottom 8; style.width 264 ]
            prop.tabIndex 0
            if tip.IsSome then yield! tipHandlers tip.Value
            prop.onClick (fun _ -> if enabled then onClick ())
            prop.children [
                Html.div [
                    prop.className "btnContent"
                    prop.children [
                        Html.span [
                            prop.className "btnTitle"
                            prop.children [
                                Html.div [
                                    prop.className "label"
                                    prop.children [ Html.span [ prop.className "label-content"; prop.text label ] ]
                                ]
                                if amtText <> "" then
                                    Html.div [ prop.className "amt"; prop.text amtText ]
                            ]
                        ]
                    ]
                ]
            ]
        ]

    let plainBtn (key: string) (label: string) (onClick: unit -> unit) =
        Html.div [
            prop.key key
            prop.className "btn nosel"
            prop.style [ style.display.inlineBlock; style.marginBottom 8; style.cursor "pointer" ]
            prop.onClick (fun _ -> onClick ())
            prop.children [
                Html.div [
                    prop.className "btnContent"
                    prop.children [ Html.span [ prop.className "btnTitle"; prop.text label ] ]
                ]
            ]
        ]

    // --- left column: resource + craft tables --------------------------------

    // per-second rates: the port ticks at 100ms, and with the (default-on)
    // usePerSecondValues opt the panel shows perTick x 10 with a "/s" suffix
    let usePerSecond = s.Opts.Bools.["usePerSecondValues"]
    let rateDisplay (perTick: float) =
        let v = if usePerSecond then perTick * 10.0 else perTick
        if v <> 0.0 then kittens_land.KittensState.fmtRes v + (if usePerSecond then "/s" else "")
        else ""

    let resTip (r: kittens_land.KittensState.ResRow) : TipData =
        // orig getDetailedResMap: production breakdown + to-zero/to-cap timers;
        // kittens get next-kitten progress instead
        let baseProd, village, net = kittens_land.KittensState.productionBreakdown s r.Name
        let line label (v: float) =
            "<div>" + label + ": " + (if v >= 0.0 then "+" else "") + kittens_land.KittensState.fmtRes v + "</div>"
        let body =
            if r.Name = "kittens" then
                let progress = s.Vpool.NextKittenProgress
                let perTickKittens = 0.01 * (1.0 + getEffect s "kittenGrowthRatio")
                "<div>[" + sprintf "%.0f" (progress * 100.0) + "%]</div>"
                + "<div>" + Game.Labels.get "res.toNextKitten" + ": "
                + kittens_land.KittensState.toDisplaySeconds ((1.0 - progress) / (perTickKittens * 10.0)) + "</div>"
            else
                (if baseProd <> 0.0 then line (Game.Labels.get "res.stack.production") baseProd else "")
                + (if village <> 0.0 then line (Game.Labels.get "res.stack.village") village else "")
                + (if net < 0.0 then
                        "<div>" + Game.Labels.get "res.toZero" + ": "
                        + kittens_land.KittensState.toDisplaySeconds (r.Value / (-net * 10.0)) + "</div>"
                   elif net > 0.0 && r.Max > 0.0 && r.Value < r.Max then
                        "<div>" + Game.Labels.get "res.toCap" + ": "
                        + kittens_land.KittensState.toDisplaySeconds ((r.Max - r.Value) / (net * 10.0)) + "</div>"
                   else "")
        { Desc = body; Flavor = None; Prices = [] }

    let resRow (r: kittens_land.KittensState.ResRow) =
        // hidden resources show only in edit mode or when "show hidden" is on
        if not r.Show then Html.none
        elif r.Hidden && not model.ResEditMode && not s.ShowHiddenRes then Html.none
        else
            let perTick = rateDisplay r.PerTick
            let tip = resTip r
            Html.div [
                prop.key r.Name
                prop.role "row"
                prop.className ("res-row resource_" + r.Name + (if r.Hidden then " hidden" else ""))
                prop.children [
                    if model.ResEditMode then
                        Html.div [
                            prop.className "res-cell"
                            prop.children [
                                Html.input [
                                    prop.type'.checkbox
                                    prop.isChecked (not r.Hidden)
                                    prop.title ("Toggle " + r.Title)
                                    prop.style [ style.display.inlineBlock ]
                                    prop.onChange (fun (_: bool) -> dispatch (ToggleResHidden r.Name))
                                ]
                            ]
                        ]
                    Html.div [
                        prop.className "res-cell resource-name"
                        if tip.Desc <> "" then yield! tipHandlers tip
                        prop.text r.Title
                    ]
                    Html.div [ prop.className "res-cell resAmount"; prop.text (kittens_land.KittensState.fmtRes r.Value) ]
                    Html.div [ prop.className "res-cell maxRes"; prop.text (if r.Max > 0.0 then "/" + kittens_land.KittensState.fmtRes r.Max else "") ]
                    Html.div [ prop.className "res-cell resPerTick"; prop.text perTick ]
                    Html.div [ prop.className "res-cell" ]
                ]
            ]

    let workshopBuilt =
        (Game.Buildings.get s.Bpool "workshop" |> Option.map (fun b -> b.On) |> Option.defaultValue 0) > 0

    let craftRow (c: kittens_land.KittensState.CraftRow) =
        let shortcut (amount: float) (labelText: string) (cssClass: string) =
            let canCraft = Game.Resources.hasRes s.Pool (c.Prices |> List.map (fun p -> (p.Resource, p.Val * amount))) 0.0
            if not canCraft then Html.none
            else
                Html.div [
                    prop.key (c.Name + cssClass)
                    prop.className ("res-cell craft-link " + cssClass)
                    prop.title ("+" + labelText)
                    prop.onClick (fun _ -> dispatch (Craft (c.Name, amount)))
                    prop.text ("+" + labelText)
                ]
        Html.div [
            prop.key c.Name
            prop.className ("res-row craft resource_" + c.Name)
            prop.children [
                Html.div [ prop.className "res-cell resource-name"; prop.text c.Label ]
                Html.div [ prop.className "res-cell resource-value"; prop.text (fmt c.Value) ]
                shortcut 1.0 (fmt 1.0) "craft-1pc"
                shortcut (max 25.0 (float (c.AllCount * 5 / 100))) (string (max 25 (c.AllCount * 5 / 100))) "craft-5pc"
                shortcut (max 100.0 (float (c.AllCount * 10 / 100))) (string (max 100 (c.AllCount * 10 / 100))) "craft-10pc"
                Html.div [
                    prop.key (c.Name + "all")
                    prop.className "res-cell craft-link all"
                    prop.title ("+" + string c.AllCount)
                    prop.onClick (fun _ -> dispatch (CraftAll c.Name))
                    prop.text "all"
                ]
            ]
        ]

    let leftColumn =
        Html.div [
            prop.id "leftColumn"
            prop.className "column"
            prop.children [
                Html.div [
                    prop.style [ style.marginTop 15 ]
                    prop.children [
                        Html.div [
                            prop.className "res-toolbar right"
                            prop.style [ style.textAlign.right; style.marginBottom 4 ]
                            prop.children [
                                Html.a [
                                    prop.className (if model.ResEditMode then "link toggled" else "link")
                                    prop.title "Resource settings"
                                    prop.href "#"
                                    prop.onClick (fun _ -> dispatch ToggleResEditMode)
                                    prop.children [ Html.div [ prop.className "svg-icon gear" ] ]
                                ]
                            ]
                        ]
                        Html.div [
                            prop.className "res-table"
                            prop.role "grid"
                            prop.children (kittens_land.KittensState.resRows s |> List.map resRow)
                        ]
                        if model.ResEditMode then
                            Html.div [
                                prop.className "res-toggle-hidden"
                                prop.children [
                                    Html.input [
                                        prop.type'.checkbox
                                        prop.isChecked s.ShowHiddenRes
                                        prop.onChange (fun (v: bool) -> dispatch (SetShowHiddenRes v))
                                    ]
                                    Html.label [ prop.style [ style.marginLeft 6 ]; prop.text "show hidden resources" ]
                                ]
                            ]
                    ]
                ]
                if workshopBuilt then
                    Html.div [
                        prop.className "sidebar-section"
                        prop.style [ style.marginTop 15 ]
                        prop.children [
                            Html.div [
                                prop.className "res-table craftTable"
                                prop.children (kittens_land.KittensState.craftRows s |> List.map craftRow)
                            ]
                        ]
                    ]
            ]
        ]

    // --- tab content ---------------------------------------------------------

    let kittens, maxKittens, happiness = kittens_land.KittensState.kittenSummary s
    let queueCap = kittens_land.KittensState.queueCap s
    let queueLen = kittens_land.KittensState.queueLength s

    let buildingRow (b: kittens_land.KittensState.BuildingRow) =
        modernBtn
            ("bld." + b.Name)
            b.Label
            (if b.Val > 0 then "(" + string b.Val + ")" else "")
            b.Enabled
            (Some(bldTip b.Name b.Prices))
            (fun () -> dispatch (Buy b.Name))

    let techRow (t: kittens_land.KittensState.TechRow) =
        modernBtn
            ("tech." + t.Name)
            t.Label
            ""
            t.Enabled
            (Some(pricesTip (Game.Labels.get ("tech." + t.Name + ".desc")) (Some("tech." + t.Name + ".flavor")) t.Prices))
            (fun () -> dispatch (Research t.Name))

    let upgradeRow (u: kittens_land.KittensState.UpgradeRow) =
        modernBtn
            ("up." + u.Name)
            u.Label
            ""
            u.Enabled
            (Some(pricesTip (Game.Labels.get ("up." + u.Name + ".desc")) (Some("up." + u.Name + ".flavor")) u.Prices))
            (fun () -> dispatch (Upgrade u.Name))

    // orig village tab job button (com.nuclearunicorn.game.ui.JobButton): a
    // btn.nosel.modern titled "Woodcutter (3)" with [-]/[+] link strips on the
    // right edge; the button body assigns 1 (ctrl = 10, like orig), links
    // unassign/assign and stop propagation so the body handler doesn't fire
    let jobRow (j: kittens_land.KittensState.JobRow) =
        if not j.Unlocked then Html.none
        else
            let free = Game.Managers.getFreeKittens s.Vpool
            let limit = kittens_land.KittensState.jobLimit s j.Name
            let canAssign = free > 0 && j.Assigned < limit
            let descKey = "job." + j.Name + ".desc"
            let flavorKey = "job." + j.Name + ".flavor"
            let desc = Game.Labels.get descKey
            let flavor = Game.Labels.get flavorKey
            let tip =
                if desc <> "" && desc <> descKey then
                    Some { Desc = desc
                           Flavor = (if flavor <> "" && flavor <> flavorKey then Some flavor else None)
                           Prices = [] }
                else None
            let jobLink (title: string) (msg: Msg) =
                Html.a [
                    prop.key (j.Name + title)
                    prop.href "#"
                    prop.className (if title.Length > 4 then "small" else "")
                    prop.style [ style.paddingLeft 2; style.float'.right; style.cursor "pointer" ]
                    prop.onClick (fun ev ->
                        ev.stopPropagation ()
                        dispatch msg)
                    prop.text title
                ]
            Html.div [
                prop.key j.Name
                prop.className (if canAssign then "btn nosel modern" else "btn nosel modern disabled")
                // orig Button.render: display block -> single column of buttons
                prop.style [ style.position.relative; style.display.block; style.marginBottom 8; style.width 264 ]
                prop.tabIndex 0
                if tip.IsSome then yield! tipHandlers tip.Value
                prop.onClick (fun ev ->
                    if canAssign then
                        dispatch (if ev.ctrlKey then Assign (j.Name, 10) else Assign (j.Name, 1)))
                prop.children [
                    Html.div [
                        prop.className "btnContent"
                        prop.children [
                            Html.span [
                                prop.className "btnTitle"
                                prop.text (j.Label + " (" + string j.Assigned + ")")
                            ]
                            Html.div [
                                prop.style [ style.float'.right ]
                                prop.children [
                                    if j.Assigned > 0 then jobLink "[-]" (Unassign (j.Name, 1))
                                    if j.Assigned > 0 then jobLink "[-all]" (Unassign (j.Name, j.Assigned))
                                    jobLink "[+]" (Assign (j.Name, 1))
                                    if free > 1 then jobLink "[+all]" (Assign (j.Name, free))
                                ]
                            ]
                        ]
                    ]
                ]
            ]

    let tabContent =
        match model.Tab with
        | "Village" ->
            [
                Html.div [
                    prop.style [ style.marginBottom 10 ]
                    prop.text ("Kittens: " + string kittens + "/" + string maxKittens + " - happiness: " + sprintf "%.0f%%" (happiness * 100.0))
                ]
                // orig com.nuclearunicorn.game.ui.Panel: bordered panel with a
                // title and a +/- collapse toggle, content padded 10px
                Html.div [
                    prop.className "panelContainer"
                    prop.children [
                        Html.div [
                            prop.className "toggle"
                            prop.style [ style.float'.right ]
                            prop.onClick (fun _ -> dispatch ToggleJobsPanel)
                            prop.text (if model.JobsPanelCollapsed then "+" else "-")
                        ]
                        Html.div [ prop.className "title"; prop.text "Jobs" ]
                        if not model.JobsPanelCollapsed then
                            Html.div [
                                prop.className "container"
                                prop.children [
                                    yield! (kittens_land.KittensState.jobRows s |> List.map jobRow)
                                    // orig: Clear button after the job buttons
                                    plainBtn "clearJobs" "Clear" (fun () -> dispatch ClearAllJobs)
                                ]
                            ]
                    ]
                ]
            ]
        | "Science" -> List.map techRow (kittens_land.KittensState.techRows s)
        | "Workshop" -> List.map upgradeRow (kittens_land.KittensState.upgradeRows s)
        | "Trade" ->
            kittens_land.KittensState.raceRows s
            |> List.collect (fun r ->
                [ modernBtn ("race." + r.Name) ("Trade with " + r.Label) "" r.Tradeable None (fun () -> dispatch (Trade r.Name))
                  modernBtn ("emb." + r.Name) ("Embassy of " + r.Label) ("(" + string r.EmbassyLevel + ")") r.Tradeable None (fun () -> dispatch (Embassy r.Name)) ])
        | "Religion" ->
            [
                Html.div [
                    prop.style [ style.marginBottom 10 ]
                    prop.text ("Faith: " + fmt (getRes s.Pool "faith") + " - worship: " + sprintf "%.1f" s.Rpool.Faith)
                ]
                plainBtn "praise" "Praise the sun!" (fun () -> dispatch Praise)
                yield! (kittens_land.KittensState.religionRows s |> List.map (fun r ->
                    modernBtn ("rel." + r.Name) r.Label
                        (if r.Val > 0 then "(" + string r.Val + ")" else "")
                        r.Enabled None
                        (fun () -> if r.Kind = "zu" then dispatch (BuyZU r.Name) else dispatch (BuyRU r.Name))))
            ]
        | "Space" ->
            kittens_land.KittensState.spaceRows s
            |> List.map (fun r ->
                modernBtn ("sp." + r.Name) r.Label
                    (if r.Val > 0 then "(" + string r.Val + ")" else "")
                    r.Enabled None
                    (fun () -> if r.Kind = "mission" then dispatch (Mission r.Name) else dispatch (SpaceBuy r.Name)))
        | "Time" ->
            [
                Html.div [
                    prop.style [ style.marginBottom 10 ]
                    prop.text ("Temporal flux: " + fmt s.Tpool.Flux + " - heat: " + fmt s.Tpool.Heat)
                ]
                yield! (kittens_land.KittensState.timeRows s |> List.map (fun r ->
                    modernBtn ("t." + r.Name) r.Label
                        (if r.Val > 0 then "(" + string r.Val + ")" else "")
                        r.Enabled None
                        (fun () -> if r.Kind = "cfu" then dispatch (CFUBuy r.Name) else dispatch (VSUBuy r.Name))))
            ]
        | "Challenges" ->
            kittens_land.KittensState.challengeRows s
            |> List.map (fun c ->
                let action =
                    if c.Pending then "Unmark"
                    elif c.Active then "Active!"
                    elif c.Researched then "Completed"
                    else "Mark"
                modernBtn ("ch." + c.Name) c.Label action (not c.Researched) None
                    (fun () -> dispatch (ChallengeToggle c.Name)))
        | _ ->
            [
                // orig BonfireTab: the "all" group renders with twoRows = true —
                // a table with left/right cells, buttons alternating even/odd
                // (initRenderer + getElementContainer, buildings.js L3690)
                let btns =
                    [
                        yield modernBtn "gather" (Game.Labels.get "bld.gatherCatnip") "" true
                                (Some { Desc = Game.Labels.get "bld.gatherCatnip.desc"; Flavor = None; Prices = [] })
                                (fun () -> dispatch Gather)
                        let refinePrice = 100.0
                        yield modernBtn "refine" (Game.Labels.get "bld.refineCatnip") "" (getRes s.Pool "catnip" >= refinePrice)
                                (Some { Desc = Game.Labels.get "bld.refineCatnip.desc"; Flavor = None;
                                        Prices = kittens_land.KittensState.priceLines s false [ { Resource = "catnip"; Val = refinePrice } ] })
                                (fun () -> dispatch Refine)
                        yield! List.map buildingRow (kittens_land.KittensState.buildingRows s)
                    ]
                let left = btns |> List.indexed |> List.filter (fun (i, _) -> i % 2 = 0) |> List.map snd
                let right = btns |> List.indexed |> List.filter (fun (i, _) -> i % 2 = 1) |> List.map snd
                Html.div [
                    prop.className "bldTopContainer"
                    prop.children [
                        Html.table [
                            prop.style [ style.width (length.percent 100); style.borderCollapse.collapse; style.custom ("cellSpacing", "0") ]
                            prop.children [
                                Html.tr [
                                    Html.td [
                                        prop.style [ style.verticalAlign.top ]
                                        prop.children left
                                    ]
                                    Html.td [
                                        prop.style [ style.verticalAlign.top ]
                                        prop.children right
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]

    // --- mid column ----------------------------------------------------------

    let midTabIds = [ "Bonfire"; "Village"; "Science"; "Workshop"; "Trade"; "Religion"; "Space"; "Time"; "Challenges" ]
    let visibleTabs = midTabIds |> List.filter (kittens_land.KittensState.tabVisible s)
    let activeTab = if visibleTabs |> List.contains model.Tab then model.Tab else "Bonfire"

    let midColumn =
        Html.div [
            prop.id "midColumn"
            prop.className "column"
            prop.children [
                Html.div [
                    prop.className "tabsContainer"
                    prop.children [
                        for i, t in List.indexed visibleTabs do
                            // orig villageTab.updateTab: dynamic title ladder +
                            // red " (N)" free-kittens warning span
                            let label =
                                if t = "Village" then
                                    let title, free = kittens_land.KittensState.villageTabLabel s
                                    if free > 0 then
                                        Html.span [
                                            prop.children [
                                                Html.span [ prop.text title ]
                                                Html.span [ prop.className "genericWarning"; prop.text ("(" + string free + ")") ]
                                            ]
                                        ]
                                    else Html.span [ prop.text title ]
                                else Html.span [ prop.text (Game.Labels.get ("tab." + t)) ]
                            Html.a [
                                prop.key t
                                prop.className (if t = activeTab then "tab " + t + " activeTab" else "tab " + t)
                                prop.href "#"
                                prop.style [ style.whitespace.nowrap ]
                                prop.onClick (fun _ -> dispatch (SetTab t))
                                prop.children [ label ]
                            ]
                            if i < List.length visibleTabs - 1 then
                                Html.span [ prop.key ("sep" + t); prop.text " | " ]
                    ]
                ]
                Html.div [
                    prop.className ("tabInner " + activeTab)
                    prop.children tabContent
                ]
            ]
        ]

    // --- right column --------------------------------------------------------

    let consoleRows =
        s.ConsoleMsgs
        |> List.map (fun m ->
            Html.div [
                prop.key (string m.CmId)
                prop.className "msg"
                prop.children [
                    if m.CmHasCal then
                        Html.span [
                            prop.style [ style.color "#ff7f50"; style.marginRight 8 ]
                            prop.text ("Y" + string m.CmYear + " D" + string m.CmDay + " " + m.CmSeason + " - ")
                        ]
                    Html.span [ prop.text m.CmText ]
                ]
            ])

    let queueRows =
        s.QueueItems
        |> List.mapi (fun i q ->
            Html.div [
                prop.key (string i + q.QName)
                prop.style [ style.marginBottom 4 ]
                prop.children [
                    Html.a [
                        prop.className "link"
                        prop.style [ style.paddingRight 8; style.cursor "pointer" ]
                        prop.onClick (fun _ -> dispatch (QRemove i))
                        prop.text "[x]"
                    ]
                    Html.span [ prop.text (q.QName + " (" + q.QType + ") x" + string q.QValue) ]
                ]
            ])

    let rightColumn =
        Html.div [
            prop.id "rightColumn"
            prop.className "column"
            prop.style [ style.paddingLeft 15; style.paddingRight 15; style.width 300 ]
            prop.children [
                Html.div [
                    prop.children [
                        Html.span [ prop.id "calendarSign" ]
                        Html.span [ prop.id "calendarDiv"; prop.text (kittens_land.KittensState.calendarText s) ]
                    ]
                ]
                Html.div [
                    prop.className "right-tab-header"
                    prop.children [
                        Html.a [
                            prop.id "logLink"
                            prop.className (if model.RightTab = "Log" then "active" else "")
                            prop.href "#"
                            prop.onClick (fun _ -> dispatch (SetRightTab "Log"))
                            prop.text "Log"
                        ]
                        if kittens_land.KittensState.tabVisible s "Queue" then
                            Html.a [
                                prop.id "queueLink"
                                prop.className ("queueLink" + (if model.RightTab = "Queue" then " active" else ""))
                                prop.href "#"
                                prop.onClick (fun _ -> dispatch (SetRightTab "Queue"))
                                prop.text "Queue"
                            ]
                    ]
                ]
                if model.RightTab = "Queue" then
                    Html.div [
                        prop.className "right-tab"
                        prop.id "rightTabQueue"
                        prop.children [
                            Html.div [
                                prop.style [ style.marginBottom 6 ]
                                prop.text ("Queue " + string queueLen + "/" + string queueCap)
                            ]
                            yield! queueRows
                            plainBtn "qhut" "Queue a Hut" (fun () -> dispatch (QAdd ("hut", "buildings")))
                        ]
                    ]
                else
                    Html.div [
                        prop.className "right-tab"
                        prop.id "rightTabLog"
                        prop.children [
                            Html.div [
                                prop.children [
                                    Html.div [
                                        prop.className "console-intro"
                                        prop.style [ style.paddingTop 10; style.borderTop(1, borderStyle.solid, "gray") ]
                                        prop.text (Game.Labels.get "console.intro")
                                    ]
                                    Html.span [
                                        prop.id "clearLog"
                                        prop.style [ style.paddingTop 5 ]
                                        prop.children [
                                            Html.a [
                                                prop.id "clearLogHref"
                                                prop.href "#"
                                                prop.onClick (fun _ -> dispatch ClearConsole)
                                                prop.text "Clear log"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                            Html.div [
                                prop.id "gameLog"
                                prop.style [ style.overflowY.auto; style.paddingTop 10; style.height (length.percent 100) ]
                                prop.children consoleRows
                            ]
                        ]
                    ]
            ]
        ]

    // --- tooltip -------------------------------------------------------------

    let tooltip =
        match model.Tooltip with
        | None -> Html.none
        | Some (x, y, tip) ->
            Html.div [
                prop.id "tooltip"
                prop.className "button_tooltip"
                prop.style [ style.top (length.px y); style.left (length.px x) ]
                prop.children [
                    if tip.Desc <> "" && tip.Desc <> "-" then
                        Html.div [
                            prop.className "desc"
                            if tip.Prices.Length > 0 then
                                prop.style [ style.borderBottom(1, borderStyle.solid, "gray"); style.paddingBottom 8 ]
                            prop.dangerouslySetInnerHTML tip.Desc
                        ]
                    // orig ButtonModernHelper._renderPriceLine: children are
                    // indented with nbsp triples and marked rawRes; missing
                    // resources get the noRes class; displayValue carries the
                    // " (eta)" suffix computed in priceLines
                    let rec renderLine (l: kittens_land.KittensState.TipPriceLine) =
                        Html.div [
                            prop.key ("price" + string l.Indent + l.Title)
                            prop.className "price-block"
                            prop.style [ style.overflow.hidden; style.custom ("clear", "both") ]
                            prop.children [
                                Html.span [
                                    prop.className (if l.Indent > 0 then "rawRes" else "")
                                    prop.style [ style.float'.left; style.paddingRight 10 ]
                                    prop.text (String.replicate (l.Indent * 3) "\u00A0" + l.Title)
                                ]
                                Html.span [
                                    prop.className (if l.HasRes then "" else "noRes")
                                    prop.style [ style.float'.right ]
                                    prop.text l.DisplayValue
                                ]
                                yield! (l.Children |> List.map renderLine)
                            ]
                        ]
                    for p in tip.Prices do
                        renderLine p
                    match tip.Flavor with
                    | Some flavor ->
                        Html.div [
                            prop.className "flavor"
                            prop.style [ style.paddingTop 20; style.fontSize 12; style.fontStyle.italic ]
                            prop.text flavor
                        ]
                    | None -> ()
                ]
            ]

    // --- options dialog ------------------------------------------------------

    let optionsDialog =
        if not model.OptionsOpen then Html.none
        else
            Html.div [
                prop.id "optionsDiv"
                prop.className "dialog help"
                prop.style [ style.display.block ]
                prop.children [
                    Html.a [
                        prop.id "dialogClose"
                        prop.className "close"
                        prop.href "#"
                        prop.style [ style.position.absolute; style.top 10; style.right 15 ]
                        prop.onClick (fun _ -> dispatch ToggleOptions)
                        prop.text "close"
                    ]
                    Html.div [
                        prop.style [ style.marginBottom 10 ]
                        prop.children [
                            Html.label [ prop.htmlFor "notationSelector"; prop.text "Notation:" ]
                            Html.br []
                            Html.select [
                                prop.id "notationSelector"
                                prop.value s.Opts.Notation
                                prop.onChange (fun (v: string) -> dispatch (SetNotation v))
                                prop.children [
                                    for n in [ "si"; "e"; "sie" ] ->
                                        Html.option [ prop.key n; prop.value n; prop.text n ]
                                ]
                            ]
                        ]
                    ]
                    Html.div [
                        prop.style [ style.marginBottom 10 ]
                        prop.children [
                            Html.label [ prop.text ("Game speed: " + string model.Speed + "x") ]
                            Html.br []
                            for mult in [ 1.0; 3.0; 10.0 ] ->
                                Html.button [
                                    prop.key (string mult)
                                    prop.style [ style.marginRight 6; style.cursor "pointer" ]
                                    prop.onClick (fun _ -> dispatch (SetSpeed mult))
                                    prop.text (string mult + "x")
                                ]
                        ]
                    ]
                    Html.div [
                        prop.style [ style.marginBottom 10 ]
                        prop.children [
                            for o in Game.Settings.settingsArr ->
                                Html.div [
                                    prop.key o.Name
                                    prop.style [ style.marginBottom 2 ]
                                    prop.children [
                                        Html.input [
                                            prop.type'.checkbox
                                            prop.isChecked s.Opts.Bools.[o.Name]
                                            prop.onChange (fun (_: bool) -> dispatch (ToggleOption o.Name))
                                        ]
                                        Html.label [ prop.style [ style.marginLeft 6 ]; prop.text o.Name ]
                                    ]
                                ]
                        ]
                    ]
                    Html.div [
                        prop.children [
                            Html.input [
                                prop.type'.button
                                prop.value "Save"
                                prop.onClick (fun _ -> dispatch SaveGame)
                            ]
                            Html.input [
                                prop.type'.button
                                prop.value "Load"
                                prop.style [ style.marginLeft 8 ]
                                prop.onClick (fun _ -> dispatch LoadGame)
                            ]
                        ]
                    ]
                    Html.div [
                        prop.style [ style.fontSize 12; style.marginTop 8; style.color "#666" ]
                        prop.text "Save stores to this browser's localStorage under its own key - the original game's saves are untouched."
                    ]
                ]
            ]

    // --- top bar -------------------------------------------------------------

    let topBar =
        Html.div [
            prop.id "topBar"
            prop.children [
                Html.div [
                    prop.style [
                        style.paddingLeft 10
                        style.minWidth 0
                        style.maxWidth 400
                        style.overflow.hidden
                        style.textOverflow.ellipsis
                    ]
                    prop.children [ Html.span [ prop.className "gameTitle"; prop.text "Kittens Game" ] ]
                ]
                Html.div [
                    prop.className "links-block"
                    prop.style [ style.paddingTop 3; style.display.inlineFlex; style.paddingRight 10 ]
                    prop.children [
                        Html.a [
                            prop.id "save-link"
                            prop.href "#"
                            prop.onClick (fun _ -> dispatch SaveGame)
                            prop.text "Save"
                        ]
                        Html.span [ prop.text " | " ]
                        Html.a [
                            prop.id "options-link"
                            prop.href "#"
                            prop.onClick (fun _ -> dispatch ToggleOptions)
                            prop.text "Options"
                        ]
                        Html.span [ prop.text " | " ]
                        Html.a [
                            prop.id "reset-link"
                            prop.href "#"
                            prop.onClick (fun _ ->
                                if Browser.Dom.window.confirm "Are you sure you want to reset the game? All your progress will be lost."
                                then dispatch ResetGame)
                            prop.text "Reset"
                        ]
                    ]
                ]
            ]
        ]

    // --- shell ---------------------------------------------------------------

    Html.div [
        prop.id "gamePageContainer"
        prop.children [
            topBar
            Html.div [
                prop.id "game"
                prop.children [
                    leftColumn
                    midColumn
                    rightColumn
                    tooltip
                ]
            ]
            optionsDialog
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
                        style.backgroundColor "#eee"
                        style.border(1, borderStyle.solid, "#888")
                        style.color "black"
                        style.fontSize 13
                    ]
                    prop.text model.Toast
                ]
        ]
    ]

let page (_shared: SharedModel) (_route: HomeRoute) =
    Page.from init update view () (fun lm -> LayoutMsg lm)
