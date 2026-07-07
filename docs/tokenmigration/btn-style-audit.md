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

### `$theme-surface-200-bg`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/hub/modules/main/signIn/signIn.scss:12` | `.signin--headerbtn.btn, .signin--headerbtn.iconbtn` | `$theme-surface-200-bg`, `$theme-surface-300-bg`, `$theme-surface-400-bg`, `$theme-control-default-300-fg-hover`, `$theme-content-strong-fg` |

### `none`

| File | Selector/context | Arguments |
| --- | --- | --- |
| `src/client/modules/main/layout/charLog/charLog.scss:282` | `.charlog-eventmenu--btn` | `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` |
| `src/common/components/kebabMenu.scss:36` | `.kebabmenu--btn` | `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-400`, `$theme-content-strong-fg` |
| `src/common/scss/_button.scss:116` | `.btn.default-400, .iconbtn.default-400` | `none`, `$theme-control-default-400-bg-hover`, `$theme-control-default-400-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` |
| `src/common/scss/_button.scss:129` | `.btn.default-500, .iconbtn.default-500` | `none`, `$theme-control-default-500-bg-hover`, `$theme-control-default-500-bg-active`, `$theme-control-default-500-fg`, `$theme-control-default-500-fg-hover` |
| `src/common/scss/_button.scss:210` | `.iconbtn` | `none`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` |

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
| `$color-google`, `$color-google-hover`, `$color-google-active`, `$white`, `$white` | `login.scss:18` | `.login--btn.google.btn` | (Hub color. Leave) |
| `$theme-control-danger-bg`, `$theme-control-danger-bg-hover`, `$theme-control-danger-bg-active`, `$theme-control-danger-fg`, `$theme-control-danger-fg` | `_button.scss:98` | `.btn.warning, .iconbtn.warning` | `warning` |
| implicit defaults: `$theme-control-default-300-bg`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `_button.scss:34` | `.btn` | `default` |
| `$theme-control-primary-bg`, `$theme-control-primary-bg-hover`, `$theme-control-primary-bg-active`, `$theme-control-primary-fg`, `$theme-control-primary-fg-hover` | `_button.scss:90` | `.btn.primary, .iconbtn.primary` | `primary` |
| `$theme-control-recessed-bg`, `$theme-control-recessed-bg-hover`, `$theme-control-recessed-bg-active`, `$theme-control-recessed-fg`, `$theme-control-recessed-fg-hover` | `_button.scss:102` | `.btn.recessed, .iconbtn.recessed` | `recessed` |
| `$theme-control-secondary-bg`, `$theme-control-secondary-bg-hover`, `$theme-control-secondary-bg-active`, `$theme-control-secondary-fg`, `$theme-control-secondary-fg-hover` | `_button.scss:94` | `.btn.secondary, .iconbtn.secondary` | `secondary` |
| `$theme-surface-200-bg`, `$theme-surface-300-bg`, `$theme-surface-400-bg`, `$theme-control-default-300-fg-hover`, `$theme-content-strong-fg` | `signIn.scss:12` | `.signin--headerbtn.btn, .signin--headerbtn.iconbtn` | (Hub color. Leave) |
| `none`, `$theme-color-base-500`, `$theme-color-base-600`, `$theme-color-neutral-400`, `$theme-content-strong-fg` | `kebabMenu.scss:36` | `.kebabmenu--btn` | none |
| `none`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` | `charLog.scss:282` | `.charlog-eventmenu--btn` | none |
| `none`, `$theme-control-default-300-bg-hover`, `$theme-control-default-300-bg-active`, `$theme-control-default-300-fg`, `$theme-control-default-300-fg-hover` | `_button.scss:210` | `.iconbtn` | `default icon` |
| `none`, `$theme-control-default-400-bg-hover`, `$theme-control-default-400-bg-active`, `$theme-control-default-400-fg`, `$theme-control-default-400-fg-hover` | `_button.scss:116` | `.btn.default-400, .iconbtn.default-400` | `default-400` |
| `none`, `$theme-control-default-500-bg-hover`, `$theme-control-default-500-bg-active`, `$theme-control-default-500-fg`, `$theme-control-default-500-fg-hover` | `_button.scss:129` | `.btn.default-500, .iconbtn.default-500` | `default-500` |
| `rgba($white, 0.5)`, `rgba($white, 0.6)`, `rgba($white, 0.7)`, `$black`, `$black` | `pageArea.scss:108` | `.pagearea--btn.iconbtn` | none |
