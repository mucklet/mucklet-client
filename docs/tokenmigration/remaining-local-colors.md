# Remaining Local Color Definitions

## Purpose

Plan 5A classifies the local color definitions that remain after Plans 1-4F.
This is a reporting pass only. It does not move Sass variables, add runtime
tokens, rename custom properties, or clean up local wrappers.

Plan 5B is only for entries classified as `module-theme-token`. Entries
classified as `shared-component-candidate` require a separate shared component
token decision and should not be handled during Plan 5B.

The inventory was produced from:

```text
rg --files src -g "*.scss"
rg -n "^\s*\$[A-Za-z0-9_-]+\s*:" src -g "*.scss" -g "!src/common/scss/_variables.scss"
rg -n "\$theme-[A-Za-z0-9_-]+\s*:\s*var\(--mu-" src -g "*.scss" -g "!src/common/scss/_variables.scss"
rg -n "Theme\.addTokens|\.addTokens\(|Theme\.removeTokens|\.removeTokens\(" src -g "*.js"
rg -n "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|\b(?:green|transparent)\b|\b(?:mix|lighten|darken|saturate|desaturate)\(" src -g "*.scss" -g "!src/common/scss/_variables.scss"
```

The SCSS inventory still contains 220 files. `src/common/scss/_variables.scss`
is intentionally excluded from the local-definition search.

## Runtime-Backed Local Sass Definitions

These entries have local Sass fallback variables and local `$theme-*` custom
property wrappers outside `_variables.scss`.

| File | Local Sass variable | CSS custom property | Runtime token key | Fallback expression | Current usage summary | Classification | Recommended next plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/common/components/autocomplete.scss` | `$autocomplete-hover-background` | `--mu-autocomplete-hover-background` | `autocomplete.hover.background` | `lighten($color-action-300, 20%)` | Light autocomplete option hover background. | `shared-component-candidate` | later shared component decision |
| `src/common/components/autocomplete.scss` | `$autocomplete-selected-background` | `--mu-autocomplete-selected-background` | `autocomplete.selected.background` | `lighten($color-action-300, 30%)` | Light autocomplete selected option background. | `shared-component-candidate` | later shared component decision |
| `src/common/components/kebabMenu.scss` | `$kebabmenu-btn-background` | `--mu-kebabmenu-btn-background` | `kebabmenu.btn.background` | `rgba($color-base-200, 0.8)` | Shared kebab trigger button background. | `shared-component-candidate` | later shared component decision |
| `src/common/components/navButtons.scss` | `$navbuttons-btn-hover-fill` | `--mu-navbuttons-btn-hover-fill` | `navbuttons.btn.hover.fill` | `lighten($color-base-500, 5%)` | SVG navigation button hover fill. | `shared-component-candidate` | later shared component decision |
| `src/common/components/popupPill.scss` | `$popuppill-tip-background` | `--mu-popuppill-tip-background` | `popuppill.tip.background` | `rgba(darken($color-base-200, 10%), 0.9)` | Popup pill tooltip surface and caret color. | `shared-component-candidate` | later shared component decision |
| `src/common/components/popupTip.scss` | `$popuptip-background` | `--mu-popuptip-background` | `popuptip.background` | `rgba(darken($color-base-200, 10%), 0.9)` | Popup tip surface and caret color. | `shared-component-candidate` | later shared component decision |
| `src/common/components/togglebox.scss` | `$togglebox-action-hover` | `--mu-togglebox-action-hover` | `togglebox.action.hover` | `lighten($color-action-300, 5%)` | Togglebox positive/action hover fill. | `shared-component-candidate` | later shared component decision |
| `src/common/components/togglebox.scss` | `$togglebox-danger-hover` | `--mu-togglebox-danger-hover` | `togglebox.danger.hover` | `lighten($color-danger-300, 5%)` | Togglebox danger/dislike hover fill. | `shared-component-candidate` | later shared component decision |
| `src/client/scripteditor/modules/main/editScript/editScript.scss` | `$editscript-scrollbar-thumb-hover` | `--mu-editscript-scrollbar-thumb-hover` | `editscript.scrollbar.thumb.hover` | `lighten($color-base-200, 18%)` | CodeMirror scrollbar thumb hover in the script editor module. | `module-theme-token` | keep |
| `src/client/modules/main/dialogs/dialogTag/dialogTag.scss` | `$dialogtag-desc-disabled-background` | `--mu-dialogtag-desc-disabled-background` | `dialogtag.desc.disabled.background` | `rgba($color-neutral-500, 0.1)` | Disabled tag description textarea background. | `module-theme-token` | keep |
| `src/client/modules/main/dialogs/dialogTag/dialogTag.scss` | `$dialogtag-pref-dislike-background-hover` | `--mu-dialogtag-pref-dislike-background-hover` | `dialogtag.pref.dislike.background.hover` | `lighten($color-danger-300, 5%)` | Dislike preference toggle hover background. | `module-theme-token` | keep |
| `src/client/modules/main/addons/overlayNav/overlayNav.scss` | `$overlaynav-badge-background-hover` | `--mu-overlaynav-badge-background-hover` | `overlaynav.badge.background.hover` | `lighten($color-base-400, 3%)` | Overlay navigation badge/toggle hover background. | `module-theme-token` | keep |
| `src/client/modules/main/layout/console/console.scss` | `$console-scrollbar-thumb` | `--mu-console-scrollbar-thumb` | `console.scrollbar.thumb` | `lighten($color-base-200, 18%)` | Console simplebar scrollbar thumb. | `module-theme-token` | keep |
| `src/client/modules/main/pages/pageMail/pageMail.scss` | `$pagemail-mail-unread-background` | `--mu-pagemail-mail-unread-background` | `pagemail.mail.unread.background` | `darken($color-base-200, 6%)` | Unread mail badge/list row background. | `module-theme-token` | keep |
| `src/client/modules/main/pages/pageMail/pageMail.scss` | `$pagemail-mail-unread-background-hover` | `--mu-pagemail-mail-unread-background-hover` | `pagemail.mail.unread.background.hover` | `darken($color-base-200, 9%)` | Unread mail badge/list row hover background. | `module-theme-token` | keep |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | `$pagearea-location-selected-background` | `--mu-pagearea-location-selected-background` | `pagearea.location.selected.background` | `darken($color-base-200, 3%)` | Selected page-area location badge background. | `module-theme-token` | keep |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | `$pagearea-image-location-border` | `--mu-pagearea-image-location-border` | `pagearea.image.location.border` | `rgba($color-danger-300, 0.6)` | Area image location marker border. | `module-theme-token` | keep |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | `$pagearea-image-location-border-selected` | `--mu-pagearea-image-location-border-selected` | `pagearea.image.location.border.selected` | `rgba($color-danger-300, 0.8)` | Selected area image location marker border. | `module-theme-token` | keep |
| `src/client/modules/main/layout/charLog/charLog.scss` | `$charlog-invalid-background` | `--mu-charlog-invalid-background` | `charlog.invalid.background` | `rgba($log-error-fg, 0.5)` | Invalid/local error event background in character log. | `module-theme-token` | keep |
| `src/client/modules/main/layout/charLog/charLog.scss` | `$charlog-eventmenu-background` | `--mu-charlog-eventmenu-background` | `charlog.eventmenu.background` | `rgba($color-base-200, 0.8)` | Character log event action menu background. | `module-theme-token` | keep |
| `src/client/modules/main/layout/charLog/charLog.scss` | `$charlog-eventmenu-shadow` | `--mu-charlog-eventmenu-shadow` | `charlog.eventmenu.shadow` | `rgba($black, 0.65)` | Character log event action menu shadow. | `module-theme-token` | keep |

## Local Sass Aliases And Hub Variables

These entries are Sass variables outside `_variables.scss` without a local
`--mu-*` wrapper in the same file.

| File | Local Sass variable | CSS custom property | Runtime token key | Fallback expression | Current usage summary | Classification | Recommended next plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/common/scss/_common.scss` | `$theme-common-level-asleep` | none | `idlelevel.asleep.fg` | `$theme-idlelevel-asleep-fg` | Compatibility alias for old common idle level name. | `trivial-alias` | 5C |
| `src/common/scss/_common.scss` | `$theme-common-level-active` | none | `idlelevel.active.fg` | `$theme-idlelevel-active-fg` | Compatibility alias for old common idle level name. | `trivial-alias` | 5C |
| `src/common/scss/_common.scss` | `$theme-common-level-idle` | none | `idlelevel.idle.fg` | `$theme-idlelevel-idle-fg` | Compatibility alias for old common idle level name. | `trivial-alias` | 5C |
| `src/common/scss/_common.scss` | `$theme-common-level-inactive` | none | `idlelevel.away.fg` | `$theme-idlelevel-away-fg` | Compatibility alias for old common inactive/away level name. | `trivial-alias` | 5C |
| `src/common/scss/_common.scss` | `$theme-common-level-bot` | none | `idlelevel.bot.fg` | `$theme-idlelevel-bot-fg` | Compatibility alias for old common bot level name. | `trivial-alias` | 5C |
| `src/common/scss/_hubvariables.scss` | `$color-success` | none | none | `#458136` | Hub-only success color seed. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-google` | none | none | `#d9534f` | Google brand button color for hub login. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-paypal` | none | none | `#0070ba` | PayPal brand badge/button color for hub account payments. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-google-hover` | none | none | `darken($color-google, 8%)` | Google brand hover variant. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-google-active` | none | none | `darken($color-google, 16%)` | Google brand active variant. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-paypal-hover` | none | none | `darken($color-paypal, 8%)` | PayPal brand hover variant. | `hub-local` | keep |
| `src/common/scss/_hubvariables.scss` | `$color-paypal-active` | none | none | `darken($color-paypal, 16%)` | PayPal brand active variant. | `hub-local` | keep |

## Direct Local Color Declarations

These are raw, calculated, or structural color declarations without a local
Sass fallback variable. They are included so Plan 5A has an explicit ownership
decision for the remaining local colors found by the raw/calculated search.

| File | Local Sass variable | CSS custom property | Runtime token key | Fallback expression | Current usage summary | Classification | Recommended next plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/common/components/autocomplete.scss` | none | none | none | `white`, `rgba(50, 50, 50, 0.6)`, `$black`, `#eee`, `$white` | Shared autocomplete base surfaces, text emphasis, border, group rows, and dark variant foregrounds/backgrounds. | `shared-component-candidate` | later shared component decision |
| `src/common/components/hamburger.scss` | none | none | none | `#000` | Shared hamburger open/close SVG fills. | `shared-component-candidate` | later shared component decision |
| `src/common/components/kebabMenu.scss` | none | none | none | `rgba(0,0,0,0.65)` | Shared kebab menu shadow. | `shared-component-candidate` | later shared component decision |
| `src/common/components/mobilePanel.scss` | none | none | none | `$black` | Shared mobile panel header divider border. | `shared-component-candidate` | later shared component decision |
| `src/common/components/spinnerModal.scss` | none | none | none | `rgba(0, 0, 0, 40%)` | Shared spinner modal scrim. | `shared-component-candidate` | later shared component decision |
| `src/common/modules/realmInfo/realmInfo.scss` | none | none | none | `#00000029` | Shared realm info icon shadow. Similar shadows also appear in hub lists/search. | `shared-component-candidate` | later shared component decision |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | none | none | none | `rgba($white, 0.5)`, `rgba($white, 0.6)`, `rgba($white, 0.7)`, `$black`, `#000` | Page-area image overlay buttons and location marker shadows. | `module-theme-token` | later design decision |
| `src/common/scss/_spinner.scss` | none | none | none | `transparent` | Spinner invisible border edge. | `technical-color` | keep |
| `src/common/components/spinnerModal.scss` | none | none | none | `transparent` | Spinner modal invisible border edge. | `technical-color` | keep |
| `src/common/components/togglebox.scss` | none | none | none | `transparent` | Empty togglebox background. | `technical-color` | keep |
| `src/common/classes/tooltip.scss` | none | none | none | `transparent` | Tooltip caret side borders. | `technical-color` | keep |
| `src/common/components/popupTip.scss` | none | none | none | `transparent` | Popup tip caret side borders. | `technical-color` | keep |
| `src/common/components/popupPill.scss` | none | none | none | `transparent` | Popup pill caret side borders. | `technical-color` | keep |
| `src/client/scripteditor/modules/main/editScript/editScript.scss` | none | none | none | `transparent` | CodeMirror scrollbar track/corner transparency. | `technical-color` | keep |
| `src/client/modules/main/layout/console/console.scss` | none | none | none | `transparent` | Console active-character border reserve. | `technical-color` | keep |
| `src/client/modules/main/layout/playerTabs/playerTabs.scss` | none | none | none | `transparent` | Player tab inactive border reserve. | `technical-color` | keep |
| `src/client/modules/main/layout/charLog/charLog.scss` | none | none | none | `transparent` | Character log focus marker border reserve. | `technical-color` | keep |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | none | none | none | `transparent` | Page-area location marker border reserve. | `technical-color` | keep |
| `src/client/modules/main/pages/pageRoom/pageRoom.scss` | none | none | none | `transparent` | Room character looking marker border reserve. | `technical-color` | keep |
| `src/hub/account/modules/main/hubLayout/hubLayout.scss` | none | none | none | `transparent` | Hub layout selected side-panel pointer border reserve. | `technical-color` | keep |
| `src/common/components/croppie.scss` | none | none | none | `#fff`, `black`, `white`, `rgba(0, 0, 0, 0.3)`, `rgba(0, 0, 0, 0.5)`, `#ddd`, `#ccc`, `transparent`, `#ffffff40` | Croppie viewport, crop mask, slider track/thumb, focus, and maskable overlay styling. | `vendor-widget` | keep |
| `src/common/components/noUiSlider.scss` | none | none | none | `rgba(0, 0, 0, 0)`, `$black`, `#B8B8B8`, `#999`, `#ccc`, `#AAA`, `#D9D9D9`, `#fff`, `#000` | noUiSlider functional and default widget styling. | `vendor-widget` | keep |
| `src/common/components/placeholderSvg.scss` | none | none | none | `#c96036` | Fixed placeholder illustration mark fill. | `deferred-design` | later design decision |
| `src/hub/style.scss` | none | none | none | `#000000`, `#16192600`, `#161926`, `#1F2334`, `#fffcf2`, `rgba(0,0,0,1)`, `rgba(0,0,0,0)`, `green`, `#00000029`, `transparent` | Hub landing-page art direction, hero gradients, masks, hills imagery, footer icon fill, and mobile search shadow. | `hub-local` | keep |
| `src/hub/styleguide/style.scss` | none | none | none | `#c1a657`, `$black` | Hub styleguide divider and palette sample text/borders. | `hub-local` | keep |
| `src/hub/modules/init/searchBar/searchBar.scss` | none | none | none | `#00000029` | Hub init search bar shadow. | `hub-local` | keep |
| `src/hub/modules/init/realmList/realmList.scss` | none | none | none | `#00000029` | Hub init realm list item shadows. | `hub-local` | keep |
| `src/hub/account/modules/main/pages/routePayments/routePayments.scss` | none | none | none | `$color-paypal`, `$white`, `darken($color-paypal, 8%)`, `darken($white, 8%)` | Hub account PayPal brand badge colors. | `hub-local` | keep |
| `src/hub/account/modules/main/pages/routeOverview/playerSettings/overviewSupporterStatus/overviewSupporterStatus.scss` | none | none | none | `darken($color-accent-300, 8%)` | Hub supporter status quarterly recurrence badge hover color. | `hub-local` | keep |

## Runtime Token Registration Summary

Module-owned runtime registrations currently exist only in these files:

| File | Registered keys | Classification |
| --- | --- | --- |
| `src/client/scripteditor/modules/main/editScript/EditScript.js` | `editscript.scrollbar.thumb.hover` | `module-theme-token` |
| `src/client/modules/main/dialogs/dialogTag/DialogTag.js` | `dialogtag.desc.disabled.background`, `dialogtag.pref.dislike.background.hover` | `module-theme-token` |
| `src/client/modules/main/addons/overlayNav/OverlayNav.js` | `overlaynav.badge.background.hover` | `module-theme-token` |
| `src/client/modules/main/layout/console/Console.js` | `console.scrollbar.thumb` | `module-theme-token` |
| `src/client/modules/main/pages/pageMail/PageMail.js` | `pagemail.mail.unread.background`, `pagemail.mail.unread.background.hover` | `module-theme-token` |
| `src/client/modules/main/pages/pageArea/PageArea.js` | `pagearea.location.selected.background`, `pagearea.image.location.border`, `pagearea.image.location.border.selected` | `module-theme-token` |
| `src/client/modules/main/layout/charLog/CharLog.js` | `charlog.invalid.background`, `charlog.eventmenu.background`, `charlog.eventmenu.shadow` | `module-theme-token` |

Each module calls `this.module.theme.addTokens(themeTokens)` during
initialization and `this.module.theme.removeTokens(themeTokens)` during
disposal. No hub module registers hub-only runtime tokens.

## Counts

Counts are report rows. Direct declarations are grouped by file and role when a
single local styling decision appears on multiple adjacent declarations.

| Classification | Count |
| --- | ---: |
| `shared-component-candidate` | 14 |
| `module-theme-token` | 14 |
| `trivial-alias` | 5 |
| `hub-local` | 13 |
| `technical-color` | 13 |
| `vendor-widget` | 2 |
| `deferred-design` | 1 |
| `shared-semantic-candidate` | 0 |

## Unclear Cases

- `src/common/components/placeholderSvg.scss` uses a fixed illustration color in
  shared code. It is classified as `deferred-design` because it is neither a hub
  color nor clearly a reusable UI semantic.
- `src/client/modules/main/pages/pageArea/pageArea.scss` has both registered
  module-owned marker border tokens and direct image overlay colors. The direct
  overlay colors are classified as `module-theme-token` but should wait for a
  later design decision before adding more runtime keys.
- `src/common/modules/realmInfo/realmInfo.scss` uses the same light black shadow
  value seen in hub list/search styling. Because `realmInfo` is shared code, the
  row is classified as `shared-component-candidate`; hub-only occurrences stay
  `hub-local`.

## Validation

- Confirmed `docs/tokenmigration/remaining-local-colors.md` did not exist before
  this report.
- Confirmed the SCSS inventory still returns 220 files.
- Confirmed local `$theme-*` wrappers found outside `_variables.scss` are listed
  in this report.
- Confirmed all `Theme.addTokens` / `removeTokens` call sites found by the JS
  search are listed in the runtime registration summary.
- No SCSS or JS changes are part of Plan 5A.
