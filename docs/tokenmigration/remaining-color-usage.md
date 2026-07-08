# Remaining Color Usage

## Purpose

This report documents the remaining primitive, raw, and calculated color usage
after the broad theme-token migration passes. It is an enforcement sweep report,
not a redesign pass. The
remaining matches are either allowed fallback definitions, intentionally local
styling, technical color values, or follow-up work that needs a separate design
decision.

The SCSS inventory currently contains 226 files.

## Search Commands

The sweep used these commands:

```text
rg --files src -g "*.scss"
rg -n '\$color-[A-Za-z0-9_-]+|\$theme-color-[A-Za-z0-9_-]+|\$white|\$black|\$shadow|#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|\b(?:mix|lighten|darken|saturate|desaturate|transparentize|opacify)\(' src -g '*.scss'
rg -n -P '(?<![-\w])(?:transparent|black|white|green)(?![-\w])' src -g '*.scss'
rg -n "Theme\.addTokens|\.addTokens\(|Theme\.removeTokens|\.removeTokens\(" src -g "*.js"
```

No enforcement automation was added. The project has JS lint/test scripts, but
no existing custom SCSS check-script pattern that fits this sweep without adding
new project structure.

## Allowed Token Fallbacks

Primitive and calculated usage in `src/common/scss/_variables.scss` is allowed
because the file defines primitive, semantic, and component token fallbacks.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/common/scss/_variables.scss` | 9-10, 13-18, 21, 24-29, 31, 33-34, 36-42, 44-47, 49-51, 54-62, 66, 68, 70-73, 75-76, 78-79, 82-87, 89, 91-92, 94-100, 102-105, 107-109, 113-118, 120, 131-136, 138, 140-141, 143-145, 148-181, 188-189, 191-192, 195-201, 204, 207-212, 214, 216-224, 227-229, 232-234, 239-244, 248-249, 251-253, 257-261, 263-268, 270-273, 277-278, 280-281, 283-285, 287-288, 291-303, 311, 326, 336, 340-342 | allowed token fallback in `_variables.scss` | Global primitive, semantic, component, log, badge, tooltip, and keyboard fallback definitions. Lines 13-18 are primitive family comments matched by the search. |

## Allowed Module-Owned Fallbacks

Primitive and calculated usage in module-owned `*-theme.scss` files is allowed.
These files intentionally keep module-owned runtime token fallbacks decentralized.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/client/scripteditor/modules/main/editScript/editScript-theme.scss` | 4 | allowed module-owned fallback in `*-theme.scss` | Fallback for `editscript.scrollbar.thumb.hover`. |
| `src/client/modules/main/addons/overlayNav/overlayNav-theme.scss` | 4 | allowed module-owned fallback in `*-theme.scss` | Fallback for `overlaynav.badge.background.hover`. |
| `src/client/modules/main/dialogs/dialogTag/dialogTag-theme.scss` | 4-5 | allowed module-owned fallback in `*-theme.scss` | Fallbacks for disabled description and dislike hover tokens. |
| `src/client/modules/main/pages/pageArea/pageArea-theme.scss` | 4-6 | allowed module-owned fallback in `*-theme.scss` | Fallbacks for selected location and image-location marker border tokens. |
| `src/client/modules/main/pages/pageMail/pageMail-theme.scss` | 4-5 | allowed module-owned fallback in `*-theme.scss` | Fallbacks for unread mail row tokens. |
| `src/client/modules/main/layout/charLog/charLog-theme.scss` | 4-6 | allowed module-owned fallback in `*-theme.scss` | Fallbacks for invalid event and event menu tokens. |

## Hub-Local Brand, Artwork, And Product Colors

Hub-specific color usage is not runtime-themeable. These remain local and should
not be added to `_variables.scss`, `themeTokens.js`, `Theme.js`, or module
`addTokens` registrations.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/common/scss/_hubvariables.scss` | 2, 5-6, 9-12 | hub-local brand/artwork/product color | Hub success, Google, and PayPal brand seeds and hover/active calculations. |
| `src/hub/style.scss` | 36, 49, 54, 60, 67, 76, 84, 92-93, 118, 133, 143, 163, 209, 290-291, 327, 344, 461, 502, 528 | hub-local brand/artwork/product color | Hub landing-page artwork, hero gradients, image layers, masks, logo/search/footer presentation, and mobile search shadow. |
| `src/hub/styleguide/style.scss` | 26, 52, 71-72, 74, 77, 80, 84-85, 88-89, 92-93, 95, 98, 101, 105-106, 109-110, 132, 141, 147, 153, 164 | hub-local brand/artwork/product color | Hub styleguide palette samples and local divider/border colors. |
| `src/hub/policy/index.scss` | 26 | hub-local brand/artwork/product color | Hub policy page accent divider. |
| `src/hub/modules/init/searchBar/searchBar.scss` | 20 | hub-local brand/artwork/product color | Hub init search box shadow. |
| `src/hub/modules/init/realmList/realmList.scss` | 65, 212 | hub-local brand/artwork/product color | Hub realm list item shadows. |
| `src/hub/login/modules/init/login/login.scss` | 18 | hub-local brand/artwork/product color | Google brand login button. |
| `src/hub/account/modules/main/pages/routePayments/routePayments.scss` | 69-75 | hub-local brand/artwork/product color | PayPal brand payment badge and hover text. |
| `src/hub/account/modules/main/pages/routeOverview/playerSettings/overviewSupporterStatus/overviewSupporterStatus.scss` | 64 | hub-local brand/artwork/product color | Hub supporter recurrence badge hover color. |

## Vendor And Widget Styling

These files style third-party widgets. Their primitive and raw values are kept
local to preserve widget behavior and vendor-default presentation.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/common/components/croppie.scss` | 28, 34, 55-56, 134, 140, 146, 157, 166, 173, 183, 189, 196, 198, 200, 203, 207, 215, 219, 222, 257 | vendor/widget styling | Croppie viewport, crop mask, slider, focus, and maskable overlay styling. |
| `src/common/components/noUiSlider.scss` | 11, 23, 31, 44, 94, 107, 182, 202, 219, 230, 238, 241, 244, 307, 309-310 | vendor/widget styling | noUiSlider default widget and functional styling. Line 182 is a commented vendor-default color. |

## Technical Colors

These values are structural CSS values such as transparent border reserves,
caret sides, invisible tracks, and scrollbar tracks.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/common/scss/_spinner.scss` | 15 | technical color | Spinner invisible border edge. |
| `src/common/classes/tooltip.scss` | 82, 86 | technical color | Tooltip caret transparent side borders. |
| `src/common/components/popupTip.scss` | 43, 62, 81, 100, 120, 139 | technical color | Popup tip caret transparent side borders. |
| `src/common/components/popupPill.scss` | 34 | technical color | Popup pill caret transparent side borders. |
| `src/common/components/togglebox.scss` | 13 | technical color | Empty togglebox transparent fill. |
| `src/common/components/spinnerModal.scss` | 35 | technical color | Spinner modal invisible border edge. |
| `src/client/scripteditor/modules/main/editScript/editScript.scss` | 122, 126, 129 | technical color | CodeMirror scrollbar track and corner transparency. |
| `src/client/modules/main/layout/playerTabs/playerTabs.scss` | 11 | technical color | Inactive player-tab border reserve. |
| `src/client/modules/main/layout/console/console.scss` | 106 | technical color | Active-character border reserve. |
| `src/client/modules/main/layout/charLog/charLog.scss` | 25 | technical color | Character log focus marker border reserve. |
| `src/client/modules/main/pages/pageRoom/pageRoom.scss` | 104 | technical color | Room looking marker border reserve. |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | 50 | technical color | Page-area location marker border reserve. |
| `src/hub/account/modules/main/hubLayout/hubLayout.scss` | 168 | technical color | Hub selected side-panel pointer border reserve. |

## Deferred Design Decisions

These matches are known local color decisions that should not be migrated
without a focused design decision.

| File | Lines | Category | Reason |
| --- | --- | --- | --- |
| `src/common/components/autocomplete.scss` | 4-5, 11-12, 19, 33, 37, 51-53, 57, 61, 65, 69, 71 | deferred design decision | Shared autocomplete has existing shared-component-candidate rows and direct primitive styling that needs a component-token decision. |
| `src/common/components/kebabMenu.scss` | 5, 14, 19, 22, 45 | deferred design decision | Shared kebab trigger/menu styling has shared-component-candidate rows and direct primitive styling. |
| `src/common/components/mobilePanel.scss` | 33 | deferred design decision | Shared mobile panel header divider border needs a component-token decision. |
| `src/common/components/navButtons.scss` | 4, 11, 24, 30, 39, 47, 52, 54, 57, 59, 68 | deferred design decision | Shared SVG nav button fill/shadow styling needs a component-token decision. |
| `src/common/components/popupPill.scss` | 5 | deferred design decision | Shared popup pill tip background has a shared-component-candidate row. |
| `src/common/components/popupTip.scss` | 4 | deferred design decision | Shared popup tip background has a shared-component-candidate row. |
| `src/common/components/spinnerModal.scss` | 16, 34 | deferred design decision | Shared modal scrim and spinner danger color need a component-token decision. |
| `src/common/components/togglebox.scss` | 4-5, 12, 40, 47 | deferred design decision | Shared togglebox action/danger colors have shared-component-candidate rows. |
| `src/common/components/placeholderSvg.scss` | 5 | deferred design decision | Fixed placeholder illustration mark color is neither clearly hub-only nor a reusable semantic token. |
| `src/common/modules/realmInfo/realmInfo.scss` | 104 | deferred design decision | Shared realm info icon shadow matches hub-local shadows but needs a shared component decision before migration. |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | 108, 153 | deferred design decision | Page-area image overlay and marker shadow need a later module design decision beyond existing registered marker border tokens. |
| `src/hub/account/modules/main/pages/routeRealmSettings/realmSettingsTheme/realmSettingsTheme.scss` | 27, 32, 39, 41, 58 | deferred design decision | Realm theme editor UI intentionally left unchanged during the migration pause. |

## Unresolved Follow-Ups

These are active primitive-token usages in component or module SCSS that do not
fit the allowed fallback, hub-local, vendor, or technical buckets. They remain
as documented exceptions for this enforcement sweep and should be handled by
future tokenization work with focused UI review.

| File | Lines | Category | Follow-up |
| --- | --- | --- | --- |
| `src/common/components/definitionList.scss` | 17, 21 | unresolved issue requiring follow-up | Replace direct primitive wrappers with semantic/component tokens. |
| `src/common/components/envEditor.scss` | 20, 25-26 | unresolved issue requiring follow-up | Replace direct primitive wrappers with semantic/component tokens. |
| `src/common/components/keywordList.scss` | 53 | unresolved issue requiring follow-up | Replace direct primitive wrappers in button styling. |
| `src/common/components/labelToggleBox.scss` | 14 | unresolved issue requiring follow-up | Replace direct primitive accent color with a semantic/component token. |
| `src/common/components/nameSection.scss` | 25, 33 | unresolved issue requiring follow-up | Replace direct primitive text colors with semantic/component tokens. |
| `src/common/components/panelSection.scss` | 24, 35 | unresolved issue requiring follow-up | Replace direct primitive required/caret colors with semantic/component tokens. |
| `src/common/components/passwordInput.scss` | 12, 21 | unresolved issue requiring follow-up | Replace direct primitive wrappers in icon button styling. |
| `src/common/components/projectState.scss` | 7 | unresolved issue requiring follow-up | Replace direct primitive text color with a semantic/component token. |
| `src/common/components/screendialog.scss` | 31, 40 | unresolved issue requiring follow-up | Replace direct primitive divider/background wrappers. |
| `src/common/modules/policies/policies.scss` | 7, 16 | unresolved issue requiring follow-up | Replace direct primitive wrappers in shared policy module SCSS. |
| `src/common/modules/realmInfo/realmInfo.scss` | 36-37, 66, 86, 96, 108-109, 159, 199 | unresolved issue requiring follow-up | Replace direct primitive wrappers apart from the deferred shared shadow on line 104. |
| `src/client/scripteditor/modules/main/editScript/editScript.scss` | 17, 52, 55, 92, 118, 122, 132, 135-136, 144-145, 149, 157, 160, 163, 166, 169, 172, 175, 178, 181, 184, 187, 190, 199, 205, 219 | unresolved issue requiring follow-up | Replace direct primitive wrappers used by the script editor module; transparent portions of line 122 are technical. |
| `src/client/modules/main/addons/avatar/avatar.scss` | 14 | unresolved issue requiring follow-up | Replace direct primitive background wrapper. |
| `src/client/modules/main/addons/mobileCharToggle/mobileCharToggle.scss` | 7, 9-10 | unresolved issue requiring follow-up | Replace direct primitive shadow/background/text wrappers. |
| `src/client/modules/main/addons/overlayNav/overlayNav.scss` | 18, 20, 61 | unresolved issue requiring follow-up | Replace direct primitive shadow/background wrappers; keep module-owned hover token in `overlayNav-theme.scss`. |
| `src/client/modules/main/help/helpFormat/helpFormat.scss` | 10, 19 | unresolved issue requiring follow-up | Replace direct primitive danger color wrappers. |
| `src/client/modules/main/layout/console/console.scss` | 109 | unresolved issue requiring follow-up | Replace direct primitive danger border wrapper. |
| `src/client/modules/main/layout/playerTabs/playerTabs.scss` | 14 | unresolved issue requiring follow-up | Replace direct primitive danger border wrapper. |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | 36, 55 | unresolved issue requiring follow-up | Replace direct primitive wrappers apart from deferred image overlay and marker shadow lines. |
| `src/client/modules/main/pages/pageAwake/pageAwake.scss` | 46, 49, 58, 62, 69, 72, 85 | unresolved issue requiring follow-up | Replace direct primitive wrappers; lines 69 and 72 are commented-out references. |
| `src/client/modules/main/pages/pageChar/pageChar.scss` | 24, 47, 54 | unresolved issue requiring follow-up | Replace direct primitive divider/text wrappers. |
| `src/client/modules/main/pages/pageCharSelect/pageCharSelect.scss` | 14, 17-18, 36, 44 | unresolved issue requiring follow-up | Replace direct primitive empty/error state wrappers. |
| `src/client/modules/main/pages/pageEditExit/pageEditExit.scss` | 20 | unresolved issue requiring follow-up | Replace direct primitive disabled/muted button color wrapper. |
| `src/client/modules/main/pages/pageEditRoomScript/pageEditRoomScript.scss` | 18, 40, 51-53 | unresolved issue requiring follow-up | Replace direct primitive log preview wrappers. |
| `src/client/modules/main/pages/pageMail/pageMail.scss` | 42 | unresolved issue requiring follow-up | Replace direct primitive muted text wrapper; keep module-owned unread tokens in `pageMail-theme.scss`. |
| `src/client/modules/main/pages/pageRoom/pageRoom.scss` | 11, 42, 82, 93-94, 109, 114 | unresolved issue requiring follow-up | Replace direct primitive room text/background/marker wrappers. |
| `src/client/modules/main/pages/pageTeleportChar/pageTeleportChar.scss` | 11, 17 | unresolved issue requiring follow-up | Replace direct primitive text wrappers. |

## Runtime Token Registration Check

The remaining `addTokens` and `removeTokens` calls are module-owned runtime
token registrations:

| File | Category |
| --- | --- |
| `src/client/scripteditor/modules/main/editScript/EditScript.js` | module-owned runtime token registration |
| `src/client/modules/main/addons/overlayNav/OverlayNav.js` | module-owned runtime token registration |
| `src/client/modules/main/dialogs/dialogTag/DialogTag.js` | module-owned runtime token registration |
| `src/client/modules/main/pages/pageArea/PageArea.js` | module-owned runtime token registration |
| `src/client/modules/main/pages/pageMail/PageMail.js` | module-owned runtime token registration |
| `src/client/modules/main/layout/charLog/CharLog.js` | module-owned runtime token registration |

No hub module registers hub-only runtime tokens.

## Enforcement Notes

- New UI colors should use existing semantic or component tokens, or add a
  focused semantic/component token in the owning area.
- Module-owned runtime tokens should stay in module-owned `*-theme.scss` files.
- Hub-local brand, artwork, and product colors should stay local and should not
  be made runtime-themeable.
- The unresolved follow-up table is the active backlog for future enforcement.
