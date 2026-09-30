module Game.Settings

// settings-01/02/03 (js/settings.js): the boolean options table in exact
// settingsArr order, the get/set onChange rule (fires only when the old value
// was defined AND changed), resetState, and the useWorkers load migration.
// Non-boolean opts (notation "si", batchSize 10) live beside the table.



type SettingDef =
    { Name: string
      Default: bool
      IsExtra: bool
      DevModeOnly: bool }

/// settingsArr (js/settings.js L46-188) — web-visible order, exact defaults.
let settingsArr : SettingDef list =
    [
      { Name = "useWorkers"; Default = true; IsExtra = false; DevModeOnly = false }
      { Name = "forceHighPrecision"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "usePerSecondValues"; Default = true; IsExtra = false; DevModeOnly = false }
      { Name = "usePercentageResourceValues"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "showNonApplicableButtons"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "usePercentageConsumptionValues"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "highlightUnavailable"; Default = true; IsExtra = false; DevModeOnly = false }
      { Name = "hideSell"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "hideDowngrade"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "hideBGImage"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "tooltipsInRightColumn"; Default = false; IsExtra = false; DevModeOnly = false }
      { Name = "noConfirm"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "IWSmelter"; Default = true; IsExtra = true; DevModeOnly = false }
      { Name = "disableTelemetry"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "enableRedshift"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "disablePollution"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "enableRedshiftGflops"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "useLegacyTwoInRowLayout"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "useSwipeNavigation"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "ksEnabled"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "forceLZ"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "compressSaveFile"; Default = false; IsExtra = true; DevModeOnly = false }
      { Name = "hodl"; Default = true; IsExtra = true; DevModeOnly = false }
      { Name = "disableCMBR"; Default = false; IsExtra = false; DevModeOnly = true }
    ]

/// KGConfig statics (config.js): locales, schemes, defaultSchemes, notations.
[<Literal>]
let disableWebWorkers = false

let locales : string list =
    [ "ru"; "be"; "br"; "cz"; "de"; "es"; "esl"; "fr"; "he"; "it"; "ja"; "ko"; "nl"; "no"; "pl"; "uk"; "zh"; "zht" ]

let schemes : string list =
    [ "dark"; "grassy"; "sleek"; "black"; "wood"; "bluish"; "grayish"; "greenish"; "tombstone"; "spooky"
      "gold"; "space"; "school"; "fluid"; "vessel"; "minimalist"; "oil"; "unicorn"; "anthracite"; "chocolate"
      "vintage"; "computer"; "arctic"; "cyber"; "factory"; "catnip"; "dune" ]

let defaultSchemes : string list =
    [ "dark"; "grassy"; "sleek"; "black"; "wood"; "bluish"; "grayish"; "greenish"; "tombstone"; "spooky" ]

let notations : string list = [ "si"; "e"; "sie" ]

/// game.opts shape: booleans + notation + batchSize.
type OptsState =
    { Bools: Map<string, bool>
      Notation: string
      BatchSize: float }

let freshOpts () : OptsState =
    { Bools = settingsArr |> List.map (fun s -> (s.Name, s.Default)) |> Map.ofList
      Notation = "si"
      BatchSize = 10.0 }

/// orig SettingsManager.set (L279-289): writes opts, fires onChange only when
/// oldValue !== undefined && oldValue !== newValue. hodl onChange → sellBcoin
/// (js/settings.js L181-183; diplomacy.js L1208-1213: blackcoin × cryptoPrice
/// → relic, stash zeroed). Returns the new opts + whether sellBcoin fired
/// (and at which hodl value — the crypto price depends on it).
let setBool (name: string) (value: bool) (opts: OptsState) : OptsState * bool option =
    let old = opts.Bools |> Map.tryFind name
    let opts' = { opts with Bools = opts.Bools |> Map.add name value }
    let fireHodl =
        if name = "hodl" && old <> None && old <> Some value then Some old.Value else None
    opts', fireHodl

/// settings.js load hook (L243-251): the useWorkers migration runs on the
/// RAW JSON in the runner (string surgery avoided; the runner inlines it).
let migrateUseWorkersNote = "see runner loader"
