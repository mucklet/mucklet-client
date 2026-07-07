# Button Style Include Audit

Audit of `@include btn-style` usage in SCSS. Entries are grouped and sorted by
the first argument, which maps to the normal background color. The no-argument
include is listed under its implicit default background.

The mixin signature is:

```scss
@mixin btn-style (
	$bg:               $theme-control-default-300-bg,
	$bg-hover:         $theme-control-default-300-bg-hover,
	$bg-active:        $theme-control-default-300-bg-active,
	$text-color:       $theme-control-default-300-fg,
	$text-color-hover: $theme-control-default-300-fg-hover
)
```

## Usages By Background

### `$color-google`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/hub/login/modules/init/login/login.scss:18` | `.login--btn.google.btn` | `$color-google`, `$color-google-hover`, `$color-google-active`, `$white`, `$white` |

### `$theme-charlog-eventmenu-background`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/main/layout/charLog/charLog.scss:256` | `.charlog-eventmenu` | `$theme-charlog-eventmenu-background`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |

### `$theme-control-danger-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/common/scss/_button.scss:98` | `.btn.warning, .iconbtn.warning` | `$theme-control-danger-bg`, `$theme-control-danger-bg-hover`, `$theme-control-danger-bg-active`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |

### `$theme-control-default-300-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/common/scss/_button.scss:34` | `.btn` | implicit defaults: `$theme-control-default-300-bg`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |

### `$theme-control-primary-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/common/scss/_button.scss:90` | `.btn.primary, .iconbtn.primary` | `$theme-control-primary-bg`, `$theme-control-primary-bg-hover`, `$theme-control-primary-bg-active`, `$theme-control-primary-fg`, `$theme-control-primary-fg-hover` |

### `$theme-control-recessed-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/common/scss/_button.scss:102` | `.btn.recessed, .iconbtn.recessed` | `$theme-control-recessed-bg`, `$theme-control-recessed-bg-hover`, `$theme-control-recessed-bg-active`, `$theme-control-recessed-fg`, `$theme-control-recessed-fg-hover` |

### `$theme-control-secondary-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/common/scss/_button.scss:94` | `.btn.secondary, .iconbtn.secondary` | `$theme-control-secondary-bg`, `$theme-control-secondary-bg-hover`, `$theme-control-secondary-bg-active`, `$theme-control-secondary-fg`, `$theme-control-secondary-fg-hover` |

### `$theme-status-danger-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/helper/helperPages/pageTickets/pageTickets.scss:33` | `.pagetickets-ticket--icon.rejected, .pagetickets-ticket--icon.failed` | `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |
| `src/client/modules/main/pages/pageRequests/pageRequests.scss:33` | `.pagerequests-request--icon.rejected, .pagerequests-request--icon.failed` | `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |
| `src/client/modules/moderator/moderatorPages/pageReports/pageReports.scss:33` | `.pagereports-report--icon.rejected, .pagereports-report--icon.failed` | `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |

### `$theme-status-info-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/main/pages/pageRequests/pageRequests.scss:29` | `.pagerequests-request--icon.accepted` | `$theme-status-info-bg`, `$theme-status-info-bg`, `$theme-status-info-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |

### `$theme-status-success-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/helper/helperPages/pageTickets/pageTickets.scss:29` | `.pagetickets-ticket--icon.accepted` | `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |
| `src/client/modules/moderator/moderatorPages/pageReports/pageReports.scss:29` | `.pagereports-report--icon.accepted` | `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` |

### `$theme-surface-200-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/hub/modules/main/signIn/signIn.scss:12` | `.signin--headerbtn.btn, .signin--headerbtn.iconbtn` | `$theme-surface-200-bg`, `$theme-surface-300-bg`, `$theme-surface-400-bg`, `$theme-control-default-300-fg-hover`, `$theme-content-strong-fg` |

### `none`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/main/layout/charLog/charLog.scss:282` | `.charlog-eventmenu--btn` | `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` |
| `src/client/modules/main/pages/pageAwake/pageAwake.scss:85` | `.pageawake--filter-clear.iconbtn` | `none`, `$theme-color-base-400`, `$theme-color-base-500`, `$theme-color-neutral-400`, `$theme-color-neutral-500` |
| `src/common/components/charTagsList.scss:99` | `.chartagslist--remove` | `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |
| `src/common/components/kebabMenu.scss:36` | `.kebabmenu--btn` | `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-400`, `$theme-content-strong-fg` |
| `src/common/components/keywordList.scss:53` | `.keywordlist--remove` | `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-300`, `$theme-color-neutral-400` |
| `src/common/components/passwordInput.scss:12` | `.passwordinput--eye.iconbtn` | `none`, `$theme-color-base-400`, `$theme-color-base-500`, `$theme-color-neutral-400`, `$theme-color-neutral-500` |
| `src/common/components/passwordInput.scss:21` | `.passwordinput.darkeye .passwordinput--eye.iconbtn` | `none`, `$theme-color-neutral-300`, `$theme-color-neutral-300`, `$theme-color-base-400`, `$theme-color-base-300` |
| `src/common/components/realmTagsList.scss:76` | `.realmtagslist--remove` | `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |
| `src/common/modules/toaster/toaster.scss:64` | `.toaster--close` | `none`, `$theme-toaster-close-bg-hover`, `$theme-toaster-close-bg-hover`, `$theme-control-default-300-fg-hover`, `$theme-control-default-400-fg-hover` |
| `src/common/scss/_button.scss:116` | `.btn.default-400, .iconbtn.default-400` | `none`, `$theme-control-default-400-bg-hover`, `$theme-control-default-400-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` |
| `src/common/scss/_button.scss:129` | `.btn.default-500, .iconbtn.default-500` | `none`, `$theme-control-default-500-bg-hover`, `$theme-control-default-500-bg-active`, `$theme-control-default-500-fg`, `$theme-control-default-500-fg-hover` |
| `src/common/scss/_button.scss:210` | `.iconbtn` | `none`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |
| `src/hub/account/modules/main/pages/routeRealmSettings/realmSettingsTheme/realmSettingsTheme.scss:58` | `.realmsettingstheme--tokenreset` | `none`, `$color-base-400`, `$color-base-500`, `$color-neutral-400`, `$color-neutral-500` |

### `rgba($white, 0.5)`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/main/pages/pageArea/pageArea.scss:108` | `.pagearea--btn.iconbtn` | `rgba($white, 0.5)`, `rgba($white, 0.6)`, `rgba($white, 0.7)`, `$black`, `$black` |

## Similar Styles To Merge

### Default shared button classes

The base styles in `_button.scss` already cover these reusable variants:

| Current shared style | Current usage |
| --- | --- |
| `.btn` | default 300 control background and foreground |
| `.btn.primary, .iconbtn.primary` | primary action |
| `.btn.secondary, .iconbtn.secondary` | secondary action |
| `.btn.warning, .iconbtn.warning` | danger/destructive action |
| `.btn.recessed, .iconbtn.recessed` | recessed control |
| `.btn.default-400, .iconbtn.default-400` | transparent normal state with default 400 hover, active, and foreground |
| `.btn.default-500, .iconbtn.default-500` | transparent normal state with default 500 hover, active, and foreground |
| `.btn.filled, .iconbtn.filled` | filled default 300 normal background, combined with default variants for stronger filled backgrounds |
| `.iconbtn` | default transparent 300 icon button |

### Default level icon buttons

The default transparent icon style uses the 300 control level:

| File | Arguments |
| --- | --- |
| `src/common/scss/_button.scss:210` | `none`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |

The shared `.btn.default-400, .iconbtn.default-400` and
`.btn.default-500, .iconbtn.default-500` variants provide stronger control
levels without local `@include btn-style` calls in module SCSS.

### Small remove/close icon buttons

The tag remove buttons are identical:

| Files | Arguments |
| --- | --- |
| `charTagsList.scss:99`, `realmTagsList.scss:76` | `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |

`keywordList.scss:53` is visually similar but uses primitive base hover colors
and weaker foreground colors. It should be checked against the tag remove
buttons; if no distinct contrast is needed, all three can move to one shared
small remove icon style.

`toaster.scss:64` is also a small close button, but its hover background is
component-specific and should stay separate unless toaster close styling becomes
a shared component variant.

### Input clear/visibility buttons

These two uses are identical:

| Files | Arguments |
| --- | --- |
| `passwordInput.scss:12`, `pageAwake.scss:85` | `none`, `$theme-color-base-400`, `$theme-color-base-500`, `$theme-color-neutral-400`, `$theme-color-neutral-500` |

`realmSettingsTheme.scss:58` is the non-themed equivalent using `$color-*`
fallback variables instead of `$theme-color-*`. It should be normalized to theme
variables if kept, then all three can use one shared icon-button style.

`passwordInput.scss:21` is a darker inverse variant and may need a separate
shared style only if it is expected outside password fields.

### Status icon buttons

The ticket, report, and request page status icons use constant background and
foreground colors for all states:

| Candidate style | Files |
| --- | --- |
| success status icon | `pageTickets.scss:29`, `pageReports.scss:29` |
| danger status icon | `pageTickets.scss:33`, `pageReports.scss:33`, `pageRequests.scss:33` |
| info status icon | `pageRequests.scss:29` |

These are good candidates for shared `.iconbtn.status-success`,
`.iconbtn.status-danger`, and `.iconbtn.status-info` styles in `_button.scss`.
They probably do not need separate hover or active colors unless the UI should
show interactivity beyond the icon state.

### Menu item buttons

`kebabMenu.scss:36` and `charLog.scss:282` both style full-width menu row
buttons with transparent normal backgrounds. They differ in hover/active and
foreground strength. A shared menu-item button style could live in `_button.scss`
if both menus can accept the same semantic surface/control tokens.

`charLog.scss:256` is the event-menu trigger and has a component-specific
normal background. Keep this separate unless `$theme-charlog-eventmenu-background`
is replaced by a shared overlay/darken button token.

### Surface and overlay specials

`signIn.scss:12` maps cleanly to a raised surface button:
`$theme-surface-200-bg`, `$theme-surface-300-bg`, `$theme-surface-400-bg`.
This could become a shared surface/raised button style if other header buttons
need it.

`pageArea.scss:108` is a white translucent overlay button on a map/image area.
It can become a shared overlay-light icon style if this pattern appears
elsewhere; otherwise keeping it local is reasonable.

`login.scss:18` is a Google brand button. It should likely remain a local brand
style unless third-party sign-in buttons are standardized.

## All Usages Summary

Sorted by arguments, using the first argument when it is not `none` and the
hover background when the first argument is `none`.

| Arguments | File | Selector/context | Matching .btn selector |
| --- | --- | --- | --- |
| `$color-google`, `$color-google-hover`, `$color-google-active`, `$white`, `$white` | `login.scss:18` | `.login--btn.google.btn` | none |
| `$theme-charlog-eventmenu-background`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `charLog.scss:256` | `.charlog-eventmenu` | none |
| `$theme-control-danger-bg`, `$theme-control-danger-bg-hover`, `$theme-control-danger-bg-active`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `_button.scss:98` | `.btn.warning, .iconbtn.warning` | `warning` |
| implicit defaults: `$theme-control-default-300-bg`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `_button.scss:34` | `.btn` | `default` |
| `$theme-control-primary-bg`, `$theme-control-primary-bg-hover`, `$theme-control-primary-bg-active`, `$theme-control-primary-fg`, `$theme-control-primary-fg-hover` | `_button.scss:90` | `.btn.primary, .iconbtn.primary` | `primary` |
| `$theme-control-recessed-bg`, `$theme-control-recessed-bg-hover`, `$theme-control-recessed-bg-active`, `$theme-control-recessed-fg`, `$theme-control-recessed-fg-hover` | `_button.scss:102` | `.btn.recessed, .iconbtn.recessed` | `recessed` |
| `$theme-control-secondary-bg`, `$theme-control-secondary-bg-hover`, `$theme-control-secondary-bg-active`, `$theme-control-secondary-fg`, `$theme-control-secondary-fg-hover` | `_button.scss:94` | `.btn.secondary, .iconbtn.secondary` | `secondary` |
| `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `pageRequests.scss:33` | `.pagerequests-request--icon.rejected, .pagerequests-request--icon.failed` | none |
| `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-status-danger-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `pageReports.scss:33` | `.pagereports-report--icon.rejected, .pagereports-report--icon.failed` | none |
| `$theme-status-info-bg`, `$theme-status-info-bg`, `$theme-status-info-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `pageRequests.scss:29` | `.pagerequests-request--icon.accepted` | none |
| `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-status-success-bg`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `pageReports.scss:29` | `.pagereports-report--icon.accepted` | none |
| `$theme-surface-200-bg`, `$theme-surface-300-bg`, `$theme-surface-400-bg`, `$theme-control-default-300-fg-hover`, `$theme-content-strong-fg` | `signIn.scss:12` | `.signin--headerbtn.btn, .signin--headerbtn.iconbtn` | none |
| `none`, `$color-base-400`, `$color-base-500`, `$color-neutral-400`, `$color-neutral-500` | `realmSettingsTheme.scss:58` | `.realmsettingstheme--tokenreset` | none |
| `none`, `$theme-color-base-400`, `$theme-color-base-500`, `$theme-color-neutral-400`, `$theme-color-neutral-500` | `pageAwake.scss:85` | `.pageawake--filter-clear.iconbtn` | none |
| `none`, `$theme-color-base-400`, `$theme-color-base-500`, `$theme-color-neutral-400`, `$theme-color-neutral-500` | `passwordInput.scss:12` | `.passwordinput--eye.iconbtn` | none |
| `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-300`, `$theme-color-neutral-400` | `keywordList.scss:53` | `.keywordlist--remove` | none |
| `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-400`, `$theme-content-strong-fg` | `kebabMenu.scss:36` | `.kebabmenu--btn` | none |
| `none`, `$theme-color-neutral-300`, `$theme-color-neutral-300`, `$theme-color-base-400`, `$theme-color-base-300` | `passwordInput.scss:21` | `.passwordinput.darkeye .passwordinput--eye.iconbtn` | none |
| `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `charTagsList.scss:99` | `.chartagslist--remove` | none |
| `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `realmTagsList.scss:76` | `.realmtagslist--remove` | none |
| `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` | `charLog.scss:282` | `.charlog-eventmenu--btn` | none |
| `none`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `_button.scss:210` | `.iconbtn` | `default icon` |
| `none`, `$theme-control-default-400-bg-hover`, `$theme-control-default-400-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` | `_button.scss:116` | `.btn.default-400, .iconbtn.default-400` | `default-400` |
| `none`, `$theme-control-default-500-bg-hover`, `$theme-control-default-500-bg-active`, `$theme-control-default-500-fg`, `$theme-control-default-500-fg-hover` | `_button.scss:129` | `.btn.default-500, .iconbtn.default-500` | `default-500` |
| `none`, `$theme-toaster-close-bg-hover`, `$theme-toaster-close-bg-hover`, `$theme-control-default-300-fg-hover`, `$theme-control-default-400-fg-hover` | `toaster.scss:64` | `.toaster--close` | none |
| `rgba($white, 0.5)`, `rgba($white, 0.6)`, `rgba($white, 0.7)`, `$black`, `$black` | `pageArea.scss:108` | `.pagearea--btn.iconbtn` | none |
