module kittens_land.Pages.Page

open Feliz
open ElmishLand
open kittens_land.Shared
open kittens_land.KittensState

type Model = { Tab: string; S: kittens_land.KittensState.State }

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
    | SetTab of string
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
    { Tab = "Bonfire"; S = kittens_land.KittensState.init () }, Command.batch [ Command.none; tickCmd () ]

let update (msg: Msg) (model: Model) =
    match msg with
    | Tick -> { model with S = kittens_land.KittensState.tick model.S }, Command.batch [ Command.none; tickCmd () ]
    | Gather -> { model with S = kittens_land.KittensState.gatherCatnip model.S }, Command.none
    | Buy name -> { model with S = kittens_land.KittensState.buyBuilding name model.S }, Command.none
    | Assign (job, n) -> { model with S = kittens_land.KittensState.assignJob job n model.S }, Command.none
    | Unassign (job, n) -> { model with S = kittens_land.KittensState.unassignJob job n model.S }, Command.none
    | Research name -> { model with S = kittens_land.KittensState.research name model.S }, Command.none
    | Upgrade name -> { model with S = kittens_land.KittensState.buyUpgrade name model.S }, Command.none
    | CraftOne name -> { model with S = kittens_land.KittensState.craft name 1.0 model.S }, Command.none
    | CraftAll name -> { model with S = kittens_land.KittensState.craftAll name model.S }, Command.none
    | SetTab tab -> { model with Tab = tab }, Command.none
    | LayoutMsg _ -> model, Command.none

let fmt (v: float) =
    if v >= 1000.0 then string (int v)
    elif v = float (int v) then string (int v)
    else sprintf "%.1f" v

let priceText (prices: kittens_land.KittensState.PriceRow list) =
    prices |> List.map (fun p -> p.Resource + " " + fmt p.Val) |> String.concat "; "

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

let view (model: Model) (dispatch: Msg -> unit) =
    let s = model.S
    let rows = kittens_land.KittensState.resRows s |> List.filter (fun r -> r.Show)
    let cal = s.Calendar

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
        | _ ->
            [
                yield Html.button [
                    prop.style (btnStyle true @ [ style.display.block; style.marginBottom 10 ])
                    prop.onClick (fun _ -> dispatch Gather)
                    prop.text "Gather catnip"
                ]
                yield! List.map buildingRow (kittens_land.KittensState.buildingRows s)
            ]

    let tabs = [ "Bonfire"; "Village"; "Science"; "Workshop" ]

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
        ]
    ]

let page (_shared: SharedModel) (_route: HomeRoute) =
    Page.from init update view () (fun lm -> LayoutMsg lm)
