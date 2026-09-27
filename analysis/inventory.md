# Orig inventory — semantic descriptions (Phase 1 recon target)

Machine facts (lines, sha256, symbols, nondeterminism) live in `analysis/files.json`
(generated). This file is the **semantic half**: what each file/symbol does, written by
recon work units (`recon-01`…`recon-20` in the ledger).

Orig snapshot: `781e379f79f1e7512d168849cba21ed111502644` — 82 files,
51623 lines total; 33 port-relevant files below.

Status legend per file: (pending) → (described) → (split into work units).
Recon rule: 2–3 files per session; for each file write the Description + Functionality
list, then define its work units in `ledger/migration.yaml` + `analysis/work-units.json`.

## `config.js`  (10 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 1 of 1):
    - L1 declare classes.KGConfig

## `core.js`  (2857 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - STORAGE: L6 localStorage, L10 localStorage, L11 localStorage, L10 LCstorage, L12 LCstorage, L13 LCstorage

Symbols (top 40 of 141):
    - L22 declare com.nuclearunicorn.core.Control
    - L39 declare com.nuclearunicorn.core.TabManager
    - L82 method registerPanel
    - L140 method updateEffectCached
    - L174 method updateMetaEffectCached
    - L217 method _hasLimitedDiminishingReturn
    - L276 method getMeta
    - L392 method resetStateResearch
    - L404 declare com.nuclearunicorn.game.log.Console
    - L523 method constructor
    - L572 method clear
    - L588 method resetState
    - L598 method save
    - L610 method load
    - L626 declare com.nuclearunicorn.game.ui.ButtonController
    - L630 method constructor
    - L638 method fetchModel
    - L654 method fetchExtendedModel
    - L668 method initModel
    - L675 method defaults
    - L695 method createPriceLineModel
    - L707 method hasResources
    - L715 method updateEnabled
    - L731 method updateVisible
    - L738 method getPrices
    - L742 method getName
    - L749 method getDescription
    - L753 method getType
    - L789 method payPrice
    - L795 method payPriceForUndoRefund
    - L813 method clickHandler
    - L884 method refund
    - L908 declare com.nuclearunicorn.game.ui.Button
    - L924 method constructor
    - L931 method setOpts
    - L948 method updateVisible
    - L965 method updateEnabled
    - L991 method update
    - L1049 method animate
    - L1061 method onClick

## `emulator.html`  (68 lines, role: html) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 0 of 0):
    - (none detected)

## `game.js`  (6433 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L180 Math.random, L6392 Math.random, L6398 Math.random, L6416 Math.random
    - TIME: L2797 Date.now, L3005 Date.now, L5332 Date.now, L5338 Date.now, L5812 Date.now, L128 new Date, L134 new Date, L476 new Date, L491 new Date, L3148 new Date, L5249 new Date, L6380 new Date, L5249 performance.now, L128 getTime(, L134 getTime(, L476 getTime(, L491 getTime(, L3148 getTime(, L5249 getTime(
    - STORAGE: L2873 localStorage, L2927 localStorage, L2952 localStorage, L3044 localStorage, L3049 localStorage, L3053 localStorage, L3054 localStorage, L3056 localStorage, L3065 localStorage, L3067 localStorage, L5559 localStorage, L563 LCstorage, L2886 LCstorage, L2924 LCstorage, L2967 LCstorage, L2968 LCstorage, L3051 LCstorage, L3070 LCstorage, L3273 LCstorage, L5849 LCstorage
    - TIMERS: L5263 setInterval, L5274 setInterval, L5286 setInterval, L5278 setTimeout, L5309 requestAnimationFrame, L5285 clearInterval
    - ENV: L360 location., L361 location., L546 location., L2645 location., L2646 location., L2652 location., L2855 location., L2969 location., L5433 location.
    - CONCURRENCY: L5266 new Worker, L5263 postMessage, L5270 postMessage

Symbols (top 40 of 63):
    - L71 declare classes.game.Timer
    - L98 method update
    - L118 method updateScheduledEvents
    - L125 method beforeUpdate
    - L129 method afterUpdate
    - L145 declare mixin.IDataStorageAware
    - L157 declare classes.game.Telemetry
    - L281 declare classes.game.Server
    - L356 method getServerUrl
    - L367 method refresh
    - L376 method success
    - L459 method syncSaveData
    - L466 method pushSave
    - L627 method setChiral
    - L637 declare classes.game.UndoChange
    - L643 method constructor
    - L699 declare com.nuclearunicorn.game.EffectsManager
    - L2183 declare com.nuclearunicorn.game.ui.GamePage
    - L2650 const isBeta
    - L2661 method heartbeat
    - L2698 method updateCaches
    - L2740 const diminishedEffect
    - L2758 method clearLog
    - L2764 method saveUI
    - L2780 method resetState
    - L2848 method reload
    - L2962 method _wipe
    - L2971 method wipe
    - L2983 method closeOptions
    - L2994 method togglePause
    - L3010 method updateOptionsUI
    - L3048 const localStorageData
    - L3216 method saveImport
    - L3235 method saveToFile
    - L3256 method saveImportText
    - L3302 method migrateSave
    - L3592 method setUI
    - L3596 method render
    - L3628 method getStackPerTick
    - L4422 const refineRatio

## `i18n.js`  (191 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - STORAGE: L80 LCstorage, L98 LCstorage, L158 LCstorage
    - ENV: L54 navigator., L57 navigator., L86 navigator.

Symbols (top 9 of 9):
    - L6 declare com.nuclearunicorn.i18n.Lang
    - L50 method init
    - L73 method _init
    - L142 method getAvailableLocales
    - L146 method getAvailableLocaleLabels
    - L150 method getLanguage
    - L154 method updateLanguage
    - L159 method isAvailable
    - L168 method msg

## `index.html`  (639 lines, role: html) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L96 Math.random
    - TIME: L47 Date.now, L100 Date.now, L41 new Date
    - STORAGE: L56 localStorage, L60 localStorage, L61 localStorage, L60 LCstorage, L62 LCstorage, L63 LCstorage, L173 LCstorage
    - ENV: L74 location., L75 location., L128 location., L130 location., L257 location.

Symbols (top 10 of 10):
    - L39 function gtag
    - L88 function loadModule
    - L92 const progress
    - L94 const i
    - L103 function _import
    - L116 function loadTheme
    - L236 function initGame
    - L292 function dev
    - L304 function dev_boostCalendar
    - L308 function wipe

## `js/achievements.js`  (884 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L11 new Date
    - ENV: L307 location., L308 location.

Symbols (top 28 of 28):
    - L1 declare classes.managers.Achievements
    - L262 method condition
    - L266 method starCondition
    - L437 method constructor
    - L441 method get
    - L445 method getBadge
    - L447 method _unlockBadge
    - L467 method unlockBadge
    - L477 method hasUnlocked
    - L486 method update
    - L512 method resetState
    - L528 method save
    - L536 method load
    - L546 method unlockAll
    - L554 declare classes.ui.AchievementsPanel
    - L557 method constructor
    - L565 method render
    - L612 method update
    - L756 declare classes.ui.BadgesPanel
    - L758 method constructor
    - L765 method render
    - L789 method update
    - L838 const colorStr
    - L839 const varietyStr
    - L853 declare com.nuclearunicorn.game.ui.tab.AchTab
    - L855 method constructor
    - L856 method render
    - L879 method update

## `js/buildings.js`  (3799 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIMERS: L3221 setTimeout, L3220 clearTimeout

Symbols (top 40 of 87):
    - L4 declare classes.Metadata
    - L7 method constructor
    - L14 method getMeta
    - L16 method get
    - L20 method set
    - L31 declare classes.BuildingMeta
    - L36 method getMeta
    - L80 method get
    - L104 method set
    - L127 declare classes.managers.BuildingsManager
    - L138 method constructor
    - L143 method getEffect
    - L189 method setEffectsCachedExisting
    - L393 method calculateEffects
    - L398 method calculateEnergyProduction
    - L1090 const smelterRatio
    - L1349 const newCrafter
    - L1760 const mpratio
    - L1888 const energyRatio
    - L2430 method getBuildingExt
    - L2536 method getAutoProductionRatio
    - L2566 method getPriceRatioWithAccessor
    - L2588 method getPricesWithAccessor
    - L2680 method applyUnicornTearsPrices
    - L2722 method calculatePollutionEffects
    - L2818 method getEffect
    - L2828 method isUnlocked
    - L2854 method isUnlockable
    - L2858 method save
    - L2879 method load
    - L2887 method resetState
    - L2918 const cleanEnergyProduced
    - L2937 method getPollutionLevelBase
    - L2941 method getPollutionLevel
    - L2947 method getDetailedPollutionInfo
    - L2980 const toNextLevel
    - L2990 method devAddStorage
    - L2997 method gatherCatnip
    - L3001 method refineCatnip
    - L3015 method getUndissipatedPollutionPerTick

## `js/calendar.js`  (1269 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L451 Math.random, L886 Math.random, L1152 Math.random, L1160 Math.random

Symbols (top 35 of 35):
    - L4 declare com.nuclearunicorn.game.Calendar
    - L261 const chanceRatio
    - L262 const eventChance
    - L288 method observeTimeout
    - L299 method constructor
    - L308 method render
    - L312 method update
    - L316 method cycleYearColor
    - L320 method cycleEffectsBasics
    - L339 method cycleEffectsFestival
    - L406 method trueYear
    - L410 method darkFutureYears
    - L415 method tick
    - L498 const chanceRatio
    - L499 const unicornChanceRatio
    - L520 const eventChance
    - L633 const chanceModifier
    - L689 const ivory
    - L731 method fastForward
    - L734 const chanceRatio
    - L735 const unicornChanceRatio
    - L740 const eventChance
    - L852 const ivory
    - L922 method onNewSeason
    - L962 method getMilleniaChanged
    - L1147 method adjustCryptoPrice
    - L1157 method correctCryptoPrice
    - L1165 method getWeatherMod
    - L1191 method getCurSeason
    - L1198 method getCurSeasonTitle
    - L1203 method getCurSeasonTitleShorten
    - L1208 method getWinterIsComingNumeral
    - L1223 method resetState
    - L1235 method save
    - L1268 declare com.nuclearunicorn.game.calendar.Event

## `js/challenges.js`  (1329 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 40 of 44):
    - L1 declare classes.managers.ChallengesManager
    - L1 method constructor
    - L12 const stackOptions
    - L327 const tradepostLimit
    - L497 method resetState
    - L520 method save
    - L538 method load
    - L577 method update
    - L603 method getChallenge
    - L652 method researchChallenge
    - L685 const winterAndPA
    - L714 declare classes.reserveMan
    - L816 method getSaveData
    - L835 declare classes.ui.ChallengeBtnController
    - L835 method initModel
    - L841 method getMetadata
    - L848 method getDescription
    - L851 const msgChronosphere
    - L856 method getName
    - L877 method getPrices
    - L881 method buyItem
    - L889 method togglePending
    - L897 method updateVisible
    - L901 method updateEnabled
    - L908 declare classes.ui.ChallengePanel
    - L910 method constructor
    - L914 method render
    - L927 method update
    - L932 method updateResetMessage
    - L959 declare classes.ui.ReservesPanel
    - L963 method constructor
    - L968 method render
    - L984 method updateVisible
    - L1148 method update
    - L1170 declare classes.ui.ChallengeEffectsPanel
    - L1172 method constructor
    - L1182 method render
    - L1228 method update
    - L1240 declare classes.tab.ChallengesTab
    - L1263 method updateVisible

## `js/diplomacy.js`  (2233 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L521 Math.random

Symbols (top 40 of 90):
    - L4 declare classes.managers.DiplomacyManager
    - L358 method constructor
    - L363 method get
    - L397 method getTradeRatio
    - L401 method resetState
    - L416 method save
    - L427 method load
    - L437 method hasUnlockedRaces
    - L466 const positiveChance
    - L469 method getAmbassadorEffect
    - L473 method unlockRandomRace
    - L519 const raceId
    - L583 method update
    - L586 const unlockYear
    - L679 method onLeavingIW
    - L705 method unlockElders
    - L718 method onNewDay
    - L744 method undo
    - L848 method tradeImpl
    - L992 method _fuzzGainedAmount
    - L996 method getManpowerCost
    - L1004 method getGoldCost
    - L1020 method trade
    - L1024 method tradeMultiple
    - L1041 method hasMultipleResources
    - L1047 method tradeAll
    - L1080 method getMaxTradeAmt
    - L1197 method buyBcoin
    - L1213 method unlockAll
    - L1232 method calculateStandingFromPolicies
    - L1253 declare classes.diplomacy.ui.RacePanel
    - L1255 method constructor
    - L1260 method onToggle
    - L1264 method render
    - L1279 method update
    - L1294 declare classes.diplomacy.ui.EldersPanel
    - L1295 method render
    - L1305 method handler
    - L1318 method handler
    - L1328 method handler

## `js/jsx/chiral.jsx.js`  (207 lines, role: ui-jsx) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 24 of 24):
    - L10 declare classes.Bash
    - L12 method constructor
    - L26 method execute
    - L33 method autocomplete
    - L36 const filter
    - L37 const result
    - L48 method getPrevCommand
    - L52 method getNextCommand
    - L56 method hasPrevCommand
    - L60 method hasNextCommand
    - L72 method componentWillMount
    - L85 method getInitialState
    - L91 method setCommand
    - L98 method attemptAutocomplete
    - L103 method handleKeyDown
    - L115 method handleKeyUp
    - L119 method render
    - L143 method doSubmit
    - L150 method getInitialState
    - L156 method componentDidMount
    - L163 method componentWillUnmount
    - L167 method setCommand
    - L174 method sendCommand
    - L179 method render

## `js/jsx/left.jsx.js`  (1027 lines, role: ui-jsx) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 40 of 65):
    - L17 method getInitialState
    - L21 method render
    - L45 method toggleCollapsed
    - L52 method getDefaultProperties
    - L59 method shouldComponentUpdate
    - L72 method render
    - L240 method onClickName
    - L246 method toggleView
    - L252 method getIsVisible
    - L259 method getIsResInMainTable
    - L265 const hasVisibility
    - L278 method componentDidMount
    - L286 method componentDidUpdate
    - L299 method getDefaultProperties
    - L303 method render
    - L338 method componentDidMount
    - L382 method hasMinAmt
    - L397 method doCraft
    - L409 method doCraftAll
    - L414 method componentWillUnmount
    - L427 method getDefaultProperties
    - L434 method shouldComponentUpdate
    - L447 method render
    - L508 method onClickName
    - L514 method toggleView
    - L525 method getIsVisible
    - L536 method getIsResInCraftTable
    - L540 const hasVisibility
    - L548 method componentDidMount
    - L556 method componentDidUpdate
    - L573 method getDefaultProperties
    - L576 method getInitialState
    - L582 method render
    - L586 const isRequired
    - L662 method onKeyDown
    - L668 method toggleEdit
    - L672 method toggleCollapsed
    - L676 method toggleHiddenResources
    - L687 method getDefaultProperties
    - L690 method getInitialState

## `js/jsx/mid.jsx.js`  (20 lines, role: ui-jsx) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 1 of 1):
    - L9 method render

## `js/jsx/queue.jsx.js`  (267 lines, role: ui-jsx) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 16 of 16):
    - L11 method componentDidMount
    - L14 method componentDidUpdate
    - L20 method render
    - L62 method pushBack
    - L67 method pushFront
    - L72 method removeOne
    - L77 method removeAll
    - L82 method attachTooltip
    - L102 method isStorageLimited
    - L114 method getInitialState
    - L122 method componentDidMount
    - L132 method getQueueTypeSelect
    - L158 method getQueueItemSelect
    - L182 method getQueueItems
    - L210 method toggleAlphabetical
    - L214 method render

## `js/jsx/toolbar.jsx.js`  (831 lines, role: ui-jsx) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L572 new Date, L729 new Date, L729 getTime(
    - ENV: L475 navigator., L476 navigator.

Symbols (top 40 of 44):
    - L15 method componentDidMount
    - L21 method render
    - L28 method attachToolbarTooltip
    - L38 method render
    - L55 method getTooltip
    - L111 method render
    - L138 method getTooltip
    - L153 method render
    - L173 method getTooltip
    - L187 method render
    - L206 method getTooltip
    - L255 method getPollutionMod
    - L262 method render
    - L279 method getTooltip
    - L292 method render
    - L300 const isMax
    - L314 method getTooltip
    - L320 method getInitialState
    - L329 method render
    - L389 method setLogin
    - L397 method setPassword
    - L404 method logout
    - L417 method login
    - L451 method getInitialState
    - L464 method copyPreviewLink
    - L467 const copy
    - L469 const done
    - L498 method findSave
    - L507 method bytesToSize
    - L514 method render
    - L516 const isActiveSave
    - L642 method getInitialState
    - L648 method render
    - L720 method getInitialState
    - L726 method render
    - L727 const lastBackup
    - L775 method toggleExpanded
    - L781 method closeMenu
    - L787 method onKeyDown
    - L795 method getInitialState

## `js/math.js`  (105 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L11 Math.random, L17 Math.random, L18 Math.random, L25 Math.random, L34 Math.random, L101 Math.random

Symbols (top 9 of 9):
    - L4 declare com.nuclearunicorn.game.Math
    - L5 method constructor
    - L8 method uniformRandomInteger
    - L14 method standardGaussianRandom
    - L24 method irwinHallRandom
    - L28 method binominalRandomInteger
    - L39 method loopOrGaussianApproximation
    - L69 method log1p
    - L91 method geometricRandom

## `js/prestige.js`  (716 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 23 of 23):
    - L1 declare classes.managers.PrestigeManager
    - L490 method constructor
    - L496 method resetState
    - L505 method save
    - L512 method load
    - L528 method update
    - L532 method getPerk
    - L536 method getSpentParagon
    - L549 method getParagonRatio
    - L551 method getBurnedParagonRatio
    - L555 method getParagonProductionRatio
    - L558 const productionRatioParagon
    - L568 method getParagonStorageRatio
    - L571 const storageRatio
    - L597 method unlockAll
    - L608 declare classes.ui.PrestigeBtnController
    - L616 method buyItem
    - L625 method updateVisible
    - L637 declare classes.ui.BurnParagonBtnController
    - L643 declare classes.ui.turnHGOffButtonController
    - L649 declare classes.ui.PrestigePanel
    - L651 method constructor
    - L656 method render

## `js/preview.js`  (230 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - STORAGE: L29 localStorage, L195 localStorage, L222 localStorage, L64 LCstorage, L183 LCstorage, L204 LCstorage, L221 LCstorage
    - ENV: L170 location.

Symbols (top 3 of 3):
    - L9 declare classes.game.Preview
    - L168 function previewGetSaveId
    - L184 function previewDetachStorage

## `js/religion.js`  (3274 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 40 of 99):
    - L4 declare classes.managers.ReligionManager
    - L33 method constructor
    - L37 method getEffect
    - L46 method getEffect
    - L64 method gainMultiplier
    - L68 method applyAtGain
    - L76 method resetState
    - L102 method save
    - L121 method load
    - L218 const existNecrocorn
    - L341 method fastforward
    - L1491 method necrocornDeficitPunishment
    - L1518 method getZU
    - L1522 method getRU
    - L1526 method getTU
    - L1552 method getApocryphaBonus
    - L1556 method getHGScalingBonus
    - L1590 method turnHGOff
    - L1598 method praise
    - L1614 method getApocryphaResetBonus
    - L1623 method resetFaith
    - L1646 method _resetFaithInternal
    - L1648 const ttPlus1
    - L1653 method transcend
    - L1684 method _getTranscendTotalPrice
    - L1688 method _getTranscendNextPrice
    - L1692 method unlockAll
    - L1716 method undo
    - L1855 declare com.nuclearunicorn.game.ui.ZigguratBtnController
    - L1860 method getType
    - L1866 method getMetadata
    - L1873 method getName
    - L1903 method build
    - L1923 declare com.nuclearunicorn.game.ui.ReligionBtnController
    - L1928 method getType
    - L1934 method getMetadata
    - L1941 method hasSellLink
    - L1943 method getPrices
    - L1953 method updateVisible
    - L1957 method build

## `js/resources.js`  (1179 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L740 new Date

Symbols (top 21 of 21):
    - L2 declare classes.managers.ResourceManager
    - L548 method constructor
    - L570 method get
    - L623 method createResource
    - L640 method addRes
    - L679 method addResPerTick
    - L683 method addResEvent
    - L860 method enforceLimits
    - L973 method setVillage
    - L977 method reset
    - L981 method resetState
    - L999 method save
    - L1022 method load
    - L1078 method payPrices
    - L1087 method maxAll
    - L1098 method getEnergyDelta
    - L1113 method getVoidQuantity
    - L1120 method getVoidQuantityStatistically
    - L1122 method setDisplayAll
    - L1167 method toggleLock
    - L1171 method isNormalCraftableResource

## `js/science.js`  (2821 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 30 of 30):
    - L4 declare classes.managers.ScienceManager
    - L2194 method getEffect
    - L2204 method get
    - L2220 method getPolicy
    - L2224 method checkRelation
    - L2229 method unlockRelations
    - L2239 method getPrices
    - L2304 method save
    - L2314 method load
    - L2354 method unlockAll
    - L2407 declare classes.ui.PolicyBtnController
    - L2413 method getMetadata
    - L2420 method getName
    - L2460 method updateEnabled
    - L2556 method _buyItem_step2
    - L2566 method onPurchase
    - L2583 declare classes.ui.PolicyPanel
    - L2586 method render
    - L2645 method update
    - L2665 declare com.nuclearunicorn.game.ui.TechButtonController
    - L2665 method defaults
    - L2672 method getType
    - L2676 method getMetadata
    - L2683 method getPrices
    - L2688 method updateVisible
    - L2700 declare com.nuclearunicorn.game.ui.tab.Library
    - L2702 method render
    - L2791 method update
    - L2810 method constructor
    - L2813 method createTechBtn

## `js/settings.js`  (393 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 3 of 3):
    - L17 declare classes.managers.SettingsManager
    - L190 method constructor
    - L324 declare com.nuclearunicorn.game.ui.tab.SettingsTab

## `js/space.js`  (1604 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 40 of 62):
    - L8 declare classes.managers.SpaceManager
    - L230 method calculateEffects
    - L259 method calculateEffects
    - L311 method calculateEffects
    - L325 method calculateEffects
    - L353 method calculateEffects
    - L363 method action
    - L400 method calculateEffects
    - L446 method calculateEffects
    - L467 method calculateEffects
    - L491 method calculateEffects
    - L521 method calculateEffects
    - L594 method calculateEffects
    - L616 method calculateEffects
    - L636 method calculateEffects
    - L712 method action
    - L722 const entBoost
    - L754 method updateEffects
    - L757 method action
    - L786 method updateEffects
    - L794 method action
    - L817 method calculateEffects
    - L878 method action
    - L932 method calculateEffects
    - L967 method constructor
    - L987 const spaceRatio
    - L1008 method resetState
    - L1037 method save
    - L1055 method load
    - L1085 method update
    - L1145 method fastforward
    - L1173 method getProgram
    - L1187 method getBuilding
    - L1206 method getPlanet
    - L1215 const ratio
    - L1226 method unlockAll
    - L1245 method undo
    - L1282 declare com.nuclearunicorn.game.ui.SpaceProgramBtnController
    - L1283 method getMetadata
    - L1288 method getType

## `js/stats.js`  (247 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 13 of 13):
    - L1 declare classes.managers.StatsManager
    - L120 method constructor
    - L133 method resetState
    - L147 method save
    - L154 method load
    - L159 method getStat
    - L163 method getStatCurrent
    - L169 method resetStatsCurrent
    - L175 method unlockAll
    - L186 declare classes.tab.StatsTab
    - L190 method constructor
    - L194 method render
    - L200 method update

## `js/time.js`  (2792 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L36 Date.now, L82 Date.now, L111 Date.now, L136 Date.now, L236 Date.now, L990 new Date, L994 new Date, L999 new Date, L1003 new Date, L1008 new Date, L1012 new Date, L996 getTime(, L1004 getTime(, L1013 getTime(, L1017 getTime(, L1022 getTime(

Symbols (top 40 of 121):
    - L1 declare classes.managers.TimeManager
    - L17 method constructor
    - L34 method save
    - L49 method _forceChronoFurnaceStop
    - L59 method load
    - L104 method gainTemporalFlux
    - L133 method resetState
    - L152 method update
    - L180 method updateQueue
    - L191 method applyRedshift
    - L233 method calculateRedshift
    - L655 method getCFU
    - L659 method getVSU
    - L663 method shatter
    - L750 method shatterInCycles
    - L777 const remainingDaysInCurrentCycle
    - L839 method shatterInGroupCycles
    - L899 const daysInCurrentCycle
    - L988 method compareShatterTime
    - L1025 method unlockAll
    - L1030 method undo
    - L1074 declare classes.ui.time.AccelerateTimeBtnController
    - L1075 method fetchModel
    - L1089 method buyItem
    - L1104 declare classes.ui.time.AccelerateTimeBtn
    - L1105 method renderLinks
    - L1109 method update
    - L1115 declare classes.ui.TimeControlWgt
    - L1116 method constructor
    - L1125 method render
    - L1146 method update
    - L1173 declare classes.ui.time.ShatterTCBtnController
    - L1175 method defaults
    - L1181 method fetchModel
    - L1193 method _newLink
    - L1210 method getName
    - L1221 method getPrices
    - L1263 const shattersBeforeHeat
    - L1343 method buyItem
    - L1369 method doShatterAmt

## `js/toolbar.js`  (242 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 20 of 20):
    - L14 declare classes.ui.Toolbar
    - L17 method constructor
    - L27 method addIcon
    - L31 method render
    - L56 method update
    - L71 const isMax
    - L80 method updateTooltip
    - L87 declare classes.ui.ToolbarIcon
    - L89 method constructor
    - L93 method render
    - L101 method update
    - L104 method getTooltip
    - L108 method onClick
    - L112 method getOpts
    - L122 declare classes.ui.toolbar.ToolbarHappiness
    - L131 method getTooltip
    - L160 const festivalHappinessEffect
    - L186 declare classes.ui.toolbar.ToolbarEnergy
    - L220 declare classes.ui.toolbar.ToolbarMOTD
    - L232 method getTooltip

## `js/ui.js`  (1198 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L1186 Date.now, L598 new Date
    - STORAGE: L1140 LCstorage, L1154 LCstorage
    - ENV: L784 location.

Symbols (top 40 of 76):
    - L17 method componentDidMount
    - L30 declare mixin.IReactAware
    - L34 method constructor
    - L39 method render
    - L50 method update
    - L55 method destroy
    - L67 declare classes.ui.UISystem
    - L70 method setGame
    - L74 method render
    - L77 method update
    - L80 method updateOptions
    - L81 method unlockScheme
    - L84 method relockSchemes
    - L89 method notifyLogEvent
    - L92 method confirm
    - L95 method openPopupPage
    - L98 method pulse
    - L101 method displayAutosave
    - L104 method resetConsole
    - L107 method renderFilters
    - L110 method renderConsoleLog
    - L113 method saveExport
    - L116 method observeCallback
    - L119 method observeClear
    - L122 method updateCalendar
    - L125 method updateLanguage
    - L128 method updateNotation
    - L131 method load
    - L135 method save
    - L139 method isEffectMultiplierEnabled
    - L148 method formatStackRow
    - L152 method checkForUpdates
    - L160 declare classes.ui.DesktopUI
    - L185 method constructor
    - L309 const isTabNumber
    - L358 method setGame
    - L380 method render
    - L625 method update
    - L660 method updateTabs
    - L699 method updateFastHunt

## `js/village.js`  (6075 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L1518 Math.random, L2251 Math.random, L2252 Math.random, L2581 Math.random, L3445 Math.random, L6072 Math.random

Symbols (top 40 of 235):
    - L1 declare classes.managers.VillageManager
    - L135 const perSecond
    - L222 method getRankExp
    - L287 method updateEffectCached
    - L291 method constructor
    - L306 method getJob
    - L316 method getBiome
    - L326 method getJobLimit
    - L358 method assignJob
    - L378 method unassignJob
    - L527 method fastforward
    - L536 method getDiligentKittens
    - L544 method getFreeKittens
    - L553 method hasFreeKittens
    - L561 method getWorkerKittens
    - L570 method getFreeEngineers
    - L579 method clearJobs
    - L592 method getKittens
    - L788 method getCombatLevel
    - L792 method getCombatExpProgress
    - L809 method getResConsumption
    - L812 const philosophyLuxuryModifier
    - L821 method resetState
    - L835 method save
    - L862 method load
    - L929 method getUnhappiness
    - L939 method getEnvironmentEffect
    - L943 method getOverpopulation
    - L1017 method sendHunters
    - L1021 method huntFifth
    - L1129 method holdFestival
    - L1146 method rand
    - L1320 method getSkillExpRange
    - L1339 method getStyledName
    - L1373 declare com.nuclearunicorn.game.village.Kitten
    - L1469 method constructor
    - L1481 method _generateAttributes
    - L1515 method rand
    - L1519 method _createSeededRand
    - L1521 const state

## `js/void.js`  (77 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 12 of 12):
    - L1 declare classes.managers.VoidManager
    - L6 method constructor
    - L11 method save
    - L18 method load
    - L26 method update
    - L29 method resetState
    - L41 method getVU
    - L47 declare classes.ui.space.VoidBuildingController
    - L58 declare classes.ui.RorshachWgt
    - L59 method constructor
    - L62 method render
    - L69 method update

## `js/workshop.js`  (3539 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - (none found)

Symbols (top 40 of 65):
    - L1 declare classes.managers.WorkshopManager
    - L2479 method evaluateLocks
    - L2492 method constructor
    - L2500 method get
    - L2516 method getCraft
    - L2525 method getZebraUpgrade
    - L2540 method resetState
    - L2588 method save
    - L2597 method load
    - L2632 method getCraftPrice
    - L2654 method craft
    - L2706 const kittenResProductionModifier
    - L2710 const kittenResProduction
    - L2715 const tierCraftRatio
    - L2738 const kittenResProduction
    - L2741 const tierCraftRatio
    - L2791 method _getCraftAllCountInternal
    - L2816 method clearEngineers
    - L2823 method update
    - L2827 method fastforward
    - L2888 method craftByEngineers
    - L2917 method unlock
    - L2934 method unlockAll
    - L2951 declare com.nuclearunicorn.game.ui.UpgradeButtonController
    - L2951 method defaults
    - L2958 method getType
    - L2962 method getMetadata
    - L2969 method getPrices
    - L3024 method updateVisible
    - L3033 method onPurchase
    - L3046 declare com.nuclearunicorn.game.ui.CraftButtonController
    - L3046 method defaults
    - L3053 method initModel
    - L3059 method getCraft
    - L3063 method updateVisible
    - L3067 method getName
    - L3085 method getDescription
    - L3101 const tierBonus
    - L3113 const craftsPerSecond
    - L3117 const countdown

## `simulate-combat.js`  (270 lines, role: game) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - RANDOM: L75 Math.random, L86 Math.random

Symbols (top 20 of 20):
    - L39 function loadMap
    - L60 declare com.nuclearunicorn.core.TabManager
    - L61 declare com.nuclearunicorn.game.ui.BuildingStackableBtnController
    - L62 declare com.nuclearunicorn.game.ui.ButtonModernController
    - L63 declare com.nuclearunicorn.game.ui.ButtonModern
    - L64 declare com.nuclearunicorn.game.ui.Panel
    - L65 declare com.nuclearunicorn.game.ui.tab
    - L66 declare mixin.IChildrenAware
    - L67 declare mixin.IGameAware
    - L83 function randSeed
    - L89 function averagePlayerStats
    - L101 function averageFaunaStats
    - L122 function duel
    - L142 function requiredPlayerLevel
    - L163 function fmt
    - L171 function isCombatBiome
    - L177 function buildPlayerSection
    - L196 function buildBiomeSection
    - L226 function buildHeader
    - L251 function main

## `tests.html`  (147 lines, role: html) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
    - TIME: L38 Date.now, L21 new Date
    - TIMERS: L93 setInterval, L92 setTimeout, L95 clearInterval, L94 clearTimeout

Symbols (top 2 of 2):
    - L38 function _import
    - L95 function extend

