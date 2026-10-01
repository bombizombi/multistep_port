module kittens_land.Pages.Page

open Feliz
open ElmishLand
open kittens_land.Shared
open kittens_land.KittensState

type Model = kittens_land.KittensState.State

type Msg =
    | Tick
    | Gather
    | Buy of string
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
    kittens_land.KittensState.init (),
    Command.batch [ Command.none; tickCmd () ]

let update (msg: Msg) (model: Model) =
    match msg with
    | Tick -> kittens_land.KittensState.tick model, Command.none
    | Gather -> kittens_land.KittensState.gatherCatnip model, Command.none
    | Buy name -> kittens_land.KittensState.buyBuilding name model, Command.none
    | LayoutMsg _ -> model, Command.none

let view (model: Model) (dispatch: Msg -> unit) =
    let rows = kittens_land.KittensState.resRows model |> List.filter (fun r -> r.Show)
    let buildings = kittens_land.KittensState.buildingRows model
    let cal = model.Calendar

    let resRow (r: kittens_land.KittensState.ResRow) =
        Html.div [
            prop.style [ style.fontSize 14 ]
            prop.text (
                r.Name
                + ": "
                + (if r.Value >= 1000.0 then string (int r.Value) else sprintf "%.1f" r.Value)
                + (if r.Max > 0.0 && r.Max < 1e6 then "/" + string (int r.Max) else "")
            )
        ]

    let buildingRow (b: kittens_land.KittensState.BuildingRow) =
        Html.div [
            prop.style [
                style.display.flex
                style.alignItems.center
                style.gap 10
                style.marginBottom 6
                style.opacity (if b.Enabled then 1.0 else 0.45)
            ]
            prop.children [
                Html.button [
                    prop.style [
                        style.paddingTop 4
                        style.paddingBottom 4
                        style.paddingLeft 12
                        style.paddingRight 12
                        style.fontFamily "monospace"
                        style.fontSize 13
                        style.backgroundColor "#3a2f18"
                        style.color "#e8e0c8"
                        style.border(1, borderStyle.solid, "#6a5830")
                        style.cursor (if b.Enabled then "pointer" else "default")
                    ]
                    prop.disabled (not b.Enabled)
                    prop.onClick (fun _ -> dispatch (Buy b.Name))
                    prop.text (b.Label + if b.Val > 0 then " (" + string b.Val + ")" else "")
                ]
                Html.span [
                    prop.style [ style.fontSize 12; style.color "#b0a480" ]
                    prop.text (b.Prices |> List.map (fun p -> p.Resource + " " + string (int p.Val)) |> String.concat "; ")
                ]
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
                prop.style [ style.fontSize 18; style.marginBottom 12; style.color "#d4c290" ]
                prop.text (
                    "Year "
                    + string (int cal.Year + 1)
                    + ", Day "
                    + string (int cal.Day + 1)
                    + " — "
                    + cal.Season.ToString().ToUpper()
                )
            ]
            Html.div [
                prop.style [
                    style.display.flex
                    style.flexWrap.wrap
                    style.gap 18
                    style.marginBottom 16
                ]
                prop.children (rows |> List.map resRow)
            ]
            Html.div [
                prop.style [
                    style.borderTop(1, borderStyle.solid, "#4a3c20");
                    style.paddingTop 12
                ]
                prop.children [
                    Html.div [
                        prop.style [ style.fontSize 16; style.marginBottom 8; style.color "#d4c290" ]
                        prop.text "Bonfire"
                    ]
                    Html.button [
                        prop.style [
                            style.display.block
                            style.marginBottom 10
                            style.paddingTop 6
                            style.paddingBottom 6
                            style.paddingLeft 14
                            style.paddingRight 14
                            style.fontFamily "monospace"
                            style.fontSize 14
                            style.backgroundColor "#3a2f18"
                            style.color "#e8e0c8"
                            style.border(1, borderStyle.solid, "#6a5830")
                            style.cursor "pointer"
                        ]
                        prop.onClick (fun _ -> dispatch Gather)
                        prop.text "Gather catnip"
                    ]
                    yield! (buildings |> List.map buildingRow)
                ]
            ]
        ]
    ]

type Msg with
    static member WrapLayout (m: Layout.Msg): Msg = LayoutMsg m

let page (_shared: SharedModel) (_route: HomeRoute) =
    Page.from init update view () (fun lm -> LayoutMsg lm)
