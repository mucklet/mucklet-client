# Theme Token Audit

## Purpose

This report inventories current SCSS color usage for migration planning. It is
not a final token design, and it does not imply that each distinct color needs
its own token.

The audit scanned every file returned by:

```text
rg --files src -g "*.scss"
```

Policy HTML files were not involved. The SCSS entry point under `src/hub/policy/`
was included because it is part of the SCSS inventory.

## Summary

| Measure | Count |
| --- | ---: |
| SCSS files scanned | 220 |
| Files using primitive theme variables (`$theme-color-*`) | 116 |
| Files using primitive Sass colors or primitive theme variables | 145 |
| Files using semantic/theme variables (`$theme-*`, excluding `$theme-color-*`) | 37 |
| Files with raw, calculated, or named color usage | 45 |
| Files with component-local color variable definitions | 20 |
| Color-related CSS property declarations | 725 |

The raw/calculated count includes `_variables.scss`, structural `transparent`
usage, and commented color examples. `roomPages.scss` is included only because
of a commented calculation. The component-local count excludes the shared
palette and compatibility definitions in `_variables.scss`,
`_hubvariables.scss`, and `_common.scss`.

Primitive usage remains the dominant pattern. The most frequent primitive theme
references are base surfaces, neutral/contrast foregrounds, accent, danger, and
action colors. Existing semantic variables are concentrated in logs, tags,
links, placeholders, focus, idle levels, and the recently added surface/content
groups.

## Existing Token Landscape

`src/common/scss/_variables.scss` currently contains:

- Palette seeds injected by webpack: `base`, `accent`, `contrast`, `neutral`,
  `danger`, and `action`.
- Primitive fallback levels: base 100-500, accent 300, contrast 200-300,
  neutral 100-700 (including 250), danger 100-400, and action 100-300.
- Primitive theme wrappers named `$theme-color-*`.
- Surface semantics for levels 100-500.
- Content semantics for default, strong, muted, subtle, error, and placeholder
  foregrounds.
- A separate control placeholder foreground.
- Link default, hover, and active foregrounds.
- A focus ring.
- Idle-level foregrounds for asleep, active, idle, away, and bot.
- Log foreground/background semantics, including error, command, attribute,
  list item, text, entity ID, bot, instance, card, strong, default, OOC,
  communication, placeholder, character, source, info, title, and code.
- Tag foreground/border semantics for default, dislike, title, hover states,
  and icon foreground.

`src/common/scss/_common.scss` still exposes the old
`$theme-common-level-*` names as Sass aliases to the `idlelevel` semantics.
These are compatibility names in source, not additional semantic meanings.

`src/common/scss/_hubvariables.scss` defines a hub-specific success color and
Google/PayPal brand colors plus calculated hover and active variants. These are
outside the main primitive and semantic token set.

## Usage Categories

### Surfaces and layout backgrounds

Base primitive levels are used directly for page, panel, navigation, table,
dialog, and layout surfaces. Representative files include
`src/common/scss/_base.scss`, `src/common/components/panel.scss`,
`src/client/modules/main/layout/layout.scss`,
`src/client/modules/main/layout/layoutDesktop/layoutDesktop.scss`,
`src/client/modules/main/layout/layoutMobile/layoutMobile.scss`, and
`src/hub/account/modules/main/hubLayout/hubLayout.scss`.

The existing `$theme-surface-*-bg` variables currently appear only in
`_variables.scss`; most consumers still use `$theme-color-base-*`. This is the
largest unresolved semantic area.

### Content and text foregrounds

Neutral and contrast primitives directly represent default, muted, subtle,
strong, heading, label, and disabled text across shared SCSS and feature
modules. Examples include `src/common/scss/_text.scss`,
`src/common/components/definitionList.scss`,
`src/client/modules/main/pages/pageChar/pageChar.scss`, and
`src/hub/account/modules/main/pages/routeOverview/routeOverview.scss`.

The content semantic group exists but has little adoption outside
`_variables.scss`. Text roles need classification by meaning rather than by the
current neutral level.

### Borders and dividers

Base and neutral primitives are used for panel edges, separators, table rows,
input borders, and selected-state borders. Examples include
`src/common/scss/_tbl.scss`, `src/common/components/panelSection.scss`,
`src/client/modules/main/pages/pageArea/pageArea.scss`, and
`src/hub/account/modules/overseer/pages/routeNodes/routeNodes.scss`.

Reusable border roles are not yet represented by semantic groups. Image marker
borders in `pageArea.scss` are a distinct component-specific case.

### Controls, buttons, and icon buttons

`src/common/scss/_button.scss` uses action, danger, base, neutral, white, and
black primitives for button variants and interaction states.
`src/common/components/togglebox.scss`,
`src/common/components/navButtons.scss`,
`src/common/components/kebabMenu.scss`, and
`src/client/modules/main/addons/overlayNav/overlayNav.scss` define additional
calculated component-local states.

This area needs reusable control semantics for default/primary/danger
backgrounds, foregrounds, borders, and hover/active/disabled states.

### Inputs, forms, placeholders, and autofill

`src/common/scss/_input.scss` contains the shared input treatment and uses
primitive base, neutral, contrast, danger, and action values. Placeholder roles
already have semantic variables, but borders, input surfaces, text, validation,
focus, and browser autofill treatment remain mostly primitive.

Examples also occur in `src/common/components/passwordInput.scss`,
`src/common/components/locationInput.scss`,
`src/client/scripteditor/modules/main/editScript/editScript.scss`, and hub
account settings modules.

### Dialogs, menus, tooltips, and overlays

Dialog and overlay chrome is split among raw black overlays, primitive base
levels, and local variables:

- `src/common/classes/dialog.scss`
- `src/common/classes/imgModal.scss`
- `src/common/classes/tooltip.scss`
- `src/common/components/popupTip.scss`
- `src/common/components/popupPill.scss`
- `src/common/components/kebabMenu.scss`
- `src/common/components/screendialog.scss`
- `src/common/modules/toaster/toaster.scss`

Tooltip, popup tip, and popup pill use the same calculated fallback, indicating
a reusable overlay surface candidate. Toaster colors carry status meaning but
also have component-specific opacity and hover behavior.

### Status colors

Danger and action primitives are used broadly for errors, destructive controls,
warnings, success-adjacent states, active states, and attention states. Hub
success is separately defined in `_hubvariables.scss`.

`src/common/utils/containerStates.scss`,
`src/common/utils/projectStates.scss`, and
`src/common/utils/taskRunStates.scss` are examples where lifecycle states need
reusable status semantics. Ticket/report unassigned rows, mail unread rows, and
toaster variants are additional status-surface cases.

### Logs, chat, and formatting

This is the most mature semantic area. Log semantics are consumed by
`src/common/components/formatTxt.scss`,
`src/client/modules/main/layout/charLog/charLog.scss`,
`src/client/modules/main/layout/charLog/charLogEvent.scss`,
`src/client/modules/main/layout/charLog/charLogHighlight.scss`, and related
event styles.

Some local calculations remain, notably the invalid-log background and event
menu overlay in `charLog.scss`. General chat/layout chrome around the semantic
log content still uses primitive base and neutral values.

### Tags, badges, and pills

Tag semantics are used by `src/common/components/charTagsList.scss`,
`src/common/components/realmTagsList.scss`, and realm/tag selection modules.
`src/common/scss/_badge.scss` has a separate component-local calculated set,
while `popupPill.scss` is an overlay pointer rather than a semantic tag.

The next design step should determine whether generic badges share tag
semantics or retain component tokens.

### Shadows and focus/selection affordances

`$shadow` is a single primitive `rgba(0, 0, 0, 0.3)` used in ten references.
Additional raw black shadows and alpha overlays appear in hub cards, image
modals, croppie, toaster, kebab menu, sign-in, page area, and character log.

`$theme-focus-ring` exists, but focus, outline, selection, and active indicators
are still often expressed with accent/action primitives or raw values.

### Hub and marketing-specific colors

`src/hub/style.scss` contains intentional art-direction colors for dark hero
gradients, masks, text over artwork, SVG fill, and card shadows.
`src/common/components/placeholderSvg.scss` has a fixed illustration fill.
Google and PayPal colors in `_hubvariables.scss` are brand colors.

These should be reviewed separately from normal application chrome. Hub account
UI files otherwise use the same primitive Sass palette, including
`src/hub/account/modules/main/pages/routePayments/routePayments.scss` and
`src/hub/account/modules/main/pages/routeOverview/playerSettings/overviewSupporterStatus/overviewSupporterStatus.scss`.

## Component-Local Color Definitions

Each fallback below has a matching `$theme-<component>-*` CSS custom property
wrapper in the same file.

| File | Local fallback expression(s) | Likely classification |
| --- | --- | --- |
| `src/client/scripteditor/modules/main/editScript/editScript.scss` | `lighten($color-base-200, 18%)` scrollbar hover | Candidate for reusable scrollbar/control state |
| `src/common/components/autocomplete.scss` | `lighten($color-action-300, 20%)`, `lighten(..., 30%)` | Candidate for control option hover/selected semantics |
| `src/common/components/kebabMenu.scss` | `rgba($color-base-200, 0.8)` | Candidate for overlay/menu surface semantic |
| `src/common/classes/tooltip.scss` | `rgba(darken($color-base-200, 10%), 0.9)` | Candidate for overlay surface semantic or tooltip component token |
| `src/common/components/popupTip.scss` | Same overlay calculation as tooltip | Replace with shared overlay semantic if meanings match |
| `src/common/components/popupPill.scss` | Same overlay calculation as tooltip | Replace with shared overlay semantic if meanings match |
| `src/common/components/navButtons.scss` | `lighten($color-base-500, 5%)` icon hover fill | Candidate for icon-button foreground hover semantic |
| `src/common/components/togglebox.scss` | Action and danger lightened by 5% | Candidate for control action/danger hover semantics |
| `src/common/modules/toaster/toaster.scss` | Three fixed alpha status backgrounds, two fixed hover colors, white alpha close hover | Component tokens defaulting to reusable status/overlay semantics |
| `src/common/scss/_badge.scss` | Two highlighted alpha calculations and two darkened hover calculations | Candidate for badge component tokens; relationship to tag semantics unresolved |
| `src/client/modules/helper/helperPages/pageTickets/pageTickets.scss` | Base darkened by 6% and 9% | Candidate for reusable attention/list-row surface semantics |
| `src/client/modules/main/dialogs/dialogTag/dialogTag.scss` | Neutral alpha disabled background; danger lightened by 5% | Existing disabled/control and danger-hover semantics are likely reusable |
| `src/client/modules/moderator/moderatorPages/pageReports/pageReports.scss` | Same 6%/9% base darkening as tickets | Share a reusable attention/list-row surface group |
| `src/client/modules/main/layout/console/console.scss` | `lighten($color-base-200, 18%)` scrollbar thumb | Candidate for reusable scrollbar semantic |
| `src/client/modules/main/layout/charLog/charLog.scss` | Error alpha invalid background; base alpha event-menu background | Error/status surface plus overlay/menu surface candidates |
| `src/client/modules/main/pages/pageAwake/pageAwake.scss` | Neutral/accent 20% mix for character status | Candidate for reusable character/idle status semantic |
| `src/client/modules/main/pages/pageMail/pageMail.scss` | Same 6%/9% base darkening as tickets/reports | Share a reusable attention/list-row surface group |
| `src/client/modules/main/pages/pageArea/pageArea.scss` | Selected base darkening; two danger-alpha image borders | Surface selected semantic plus component-specific image marker borders |
| `src/client/modules/main/pages/pageRoom/pageRoom.scss` | Same neutral/accent mix as page awake | Share the character/idle status semantic |
| `src/client/modules/main/addons/overlayNav/overlayNav.scss` | `lighten($color-base-400, 3%)` badge hover | Candidate for badge/control hover semantic |

Shared definitions not counted as component-local:

- `_variables.scss`: palette, semantic fallbacks, and token wrappers.
- `_common.scss`: legacy idle-level aliases.
- `_hubvariables.scss`: hub success and third-party brand palette.

## Raw And Calculated Colors

### Normal UI and component chrome

- `_variables.scss`: primitive level calculations, placeholder calculations,
  idle/log mixes, `$white`, `$black`, and `$shadow`.
- `_badge.scss`, `_button.scss`, `_common.scss`, `_kbd.scss`, and
  `_spinner.scss`: calculated badge states, black/white alpha buttons, legacy
  idle mix, raw keyboard shadow/highlight, and transparent spinner edge.
- `autocomplete.scss`: calculated option states plus `white`, `#eee`, and
  `rgba(50, 50, 50, 0.6)`.
- `dialog.scss`, `imgModal.scss`, and `spinnerModal.scss`: raw black modal
  surfaces and alpha overlays.
- `tooltip.scss`, `popupTip.scss`, `popupPill.scss`, and `kebabMenu.scss`:
  calculated/alpha overlay surfaces, transparent pointer borders, and a raw
  black menu shadow.
- `hamburger.scss`: raw `#000` icon fills.
- `toaster.scss`: fixed status backgrounds and raw black shadow.
- `editScript.scss` and `console.scss`: calculated scrollbar colors and
  transparent tracks.
- `togglebox.scss`, `navButtons.scss`, and `overlayNav.scss`: calculated hover
  states.
- `pageTickets.scss`, `pageReports.scss`, and `pageMail.scss`: repeated
  calculated row attention surfaces.
- `dialogTag.scss`: calculated disabled/dislike states.
- `pageAwake.scss` and `pageRoom.scss`: repeated mixed character status color.
- `pageArea.scss`: calculated selected/image marker states, white-alpha button
  treatment, transparent pointer border, and raw black image shadow.
- `charLog.scss`: calculated invalid/menu surfaces, transparent pointer border,
  and raw black alpha menu shadow.
- `routePayments.scss` and `overviewSupporterStatus.scss`: calculated hub
  payment/supporter action states.

### Vendor-style widgets and image tools

- `src/common/components/croppie.scss` contains raw white, black, gray, alpha
  overlays, transparent controls, and a large crop-mask shadow. These styles are
  tightly coupled to the image-cropping widget.
- `src/common/components/noUiSlider.scss` contains fixed grayscale track,
  tooltip, and handle colors plus transparent tap highlighting. One additional
  raw color is commented out.

These should be assessed for maintainability and theming separately from normal
application components.

### Artwork, masks, gradients, and brand colors

- `src/hub/style.scss`: `#161926`, `#1f2334`, transparent gradient stops,
  `#fffcf2`, black mask alpha, `green`, and black shadows. These are primarily
  landing-page art direction and image masks.
- `src/common/components/placeholderSvg.scss`: fixed `#c96036` illustration
  fill.
- `src/common/scss/_hubvariables.scss`: fixed success, Google, and PayPal
  colors with calculated brand interaction states.
- `src/hub/styleguide/style.scss`: fixed `#c1a657` sample divider.

### Raw shadows and overlays outside the groups above

- `src/common/modules/realmInfo/realmInfo.scss`
- `src/hub/modules/init/realmList/realmList.scss`
- `src/hub/modules/init/searchBar/searchBar.scss`
- `src/hub/modules/main/signIn/signIn.scss`

These use fixed black shadows or alpha overlays. The commented gradient in
`signIn.scss` is not runtime styling.

### Structural transparency only

The following files are included in the raw/named-color count because
`transparent` is used for pointer triangles, inactive borders, scrollbar
tracks, or image backgrounds rather than as a standalone palette choice:

- `src/client/modules/main/layout/playerTabs/playerTabs.scss`
- `src/client/scripteditor/modules/main/editorLayout/editorLayout.scss`
- `src/hub/account/modules/main/hubLayout/hubLayout.scss`

`src/client/modules/main/layout/roomPages/roomPages.scss` contains only a
commented `darken()` example and has no active raw/calculated color from this
search.

## Migration Candidates

Priority is based on reuse and the amount of unresolved primitive usage, not on
the number of unique values.

1. Surface backgrounds and borders for page, panel, raised, inset, selected,
   hover, and overlay/menu roles.
2. Content foreground roles for default, strong, muted, subtle, disabled,
   heading/label, and inverse-on-dark usage, followed by migration to the
   existing content group where meanings already match.
3. Control roles for primary/default/danger buttons and icon buttons, including
   background, foreground, border, hover, active, selected, focus, and disabled
   states.
4. Input roles for background, foreground, border, validation, disabled,
   autofill, and focus, retaining the existing placeholder semantics.
5. Reusable status foreground/background/border groups for success, info,
   warning, danger, and attention states.
6. Shared overlay/menu/tooltip surface, foreground, border, pointer, and shadow
   roles.
7. List-row attention states that can cover unread mail and unassigned
   tickets/reports without naming a token after one feature.
8. Scrollbar track/thumb/hover roles shared by console and script editor.
9. Shadow and selection/focus affordance groups, including modal scrims and
   raised-card/menu shadows.
10. A decision on badge versus tag semantics before migrating `_badge.scss`.
11. Component tokens only for genuinely specific cases such as page-area image
    markers, toaster opacity/close behavior, and art-directed hub visuals.

## Open Questions

- Are unread mail, unassigned tickets, and unassigned reports intended to share
  one reusable attention surface in every state?
- Should tooltip, popup tip, popup pill, and menu overlays share one overlay
  surface, or are their opacity/contrast requirements intentionally distinct?
- Does the character status mix in page awake/page room represent an existing
  idle level, or a separate room-presence status?
- Should toast success/info/warning colors be globally reusable status
  backgrounds, or remain toaster-specific because of their opacity?
- Are generic badges intended to share tag semantics, or do badges have a
  separate visual contract?
- Should Croppie and noUiSlider fixed colors become themeable, or remain
  isolated vendor/widget styling?
- Which hub landing-page colors are protected brand/art colors, and which
  should respond to application themes?

## Coverage

All 220 SCSS files were included. Coverage by source area:

| Area | Files |
| --- | ---: |
| `src/client/` | 118 |
| `src/common/classes/` | 3 |
| `src/common/components/` | 34 |
| `src/common/modules/` | 9 |
| `src/common/scss/` | 18 |
| `src/common/utils/` | 4 |
| `src/hub/account/` | 25 |
| Other `src/hub/` | 9 |

The inventory includes shared SCSS, common classes/components/modules, client
modules, script editor styles, hub account modules, hub authentication/reset
modules, hub landing styles, and the hub style guide. The complete source list
is reproducible with the command in the Purpose section; validation compares
that list against these area totals and confirms the total is 220.
