# Understanding theme tokens

Theme tokens are named by how specific they are:

* Primitive colors define the available palette.
* Semantic colors define common UI usage.
* Component colors define overrides for a specific component or module.

Prefer short but clear names. Use `bg` for background and `fg` for foreground.

## Primitive colors

Primitive colors use:

```text
color.<family>
color.<family>.<level>
```

Examples:

```text
color.base
color.base.100
color.base.200
color.base.300
color.neutral
color.action
color.danger
```

Primitive colors should describe the palette only. They should not include UI
usage, component names, or states such as `hover` or `active`.

The token without a level is the seed color. Numbered levels are calculated from
that seed color by default. Seed colors are palette inputs only and should not be
used as defaults for semantic colors. Use a numbered primitive level for those
defaults instead. Color levels describe the role within the color family, not
absolute luminosity.

## Semantic colors

Semantic colors use:

```text
<role>[.<variant-or-level>].<slot>[.<state>]
```

Examples:

```text
surface.100.bg
surface.100.fg
surface.100.border

content.default.fg
content.muted.fg
content.disabled.fg
content.danger.fg

control.primary.bg
control.primary.fg
control.primary.bg.hover
control.primary.bg.active

status.danger.fg
status.danger.bg

idlelevel.active.fg
idlelevel.away.fg

log.cmd.fg
log.card.bg

tag.default.fg
tag.default.border

focus.ring
selection.bg
selection.fg
```

Semantic colors should describe reusable UI meaning. They may default to
numbered primitive colors or other semantic colors, but may also be overridden
directly.

Component and module SCSS should prefer semantic tokens over primitive
`$theme-color-*` variables. Primitive variables remain available for defining
semantic fallbacks and for color meanings that have not been classified yet.

Example defaults:

```text
surface.100.bg      -> color.base.100
surface.100.fg      -> color.neutral.300
control.primary.bg  -> color.action.300
control.primary.fg  -> color.base.300
content.danger.fg   -> color.danger.300
status.danger.fg    -> color.base.200
idlelevel.idle.fg   -> color.accent.300
log.cmd.fg          -> color.accent.300
tag.dislike.fg      -> color.danger.300
```

## Initial semantic groups

Surface tokens describe reusable layers from the darkest base surface through
raised surfaces, plus the shared shadow color for raised surfaces. The overlay
surface is shared by tooltips, popup tips, popup pills, and menu-like overlays
unless a component needs a more specific opacity, hover, pointer, or contrast
override:

```text
surface.100.bg
surface.200.bg
surface.300.bg
surface.400.bg
surface.500.bg
surface.overlay.bg
surface.shadow
```

Content colors describe text and icon emphasis:

```text
content.default.fg
content.strong.fg
content.muted.fg
content.subtle.fg
content.disabled.fg
content.placeholder.fg
content.error.fg
content.danger.fg
content.info.fg
content.success.fg
content.warning.fg
content.active.fg
content.inactive.fg
```

Control colors describe reusable default, primary, secondary, and destructive
control states:

```text
control.default.bg
control.default.bg.hover
control.default.bg.active
control.default.fg
control.default.fg.hover
control.primary.bg
control.primary.bg.hover
control.primary.bg.active
control.primary.fg
control.secondary.bg
control.secondary.bg.hover
control.secondary.bg.active
control.secondary.fg
control.danger.bg
control.danger.bg.hover
control.danger.bg.active
control.danger.fg
control.placeholder.fg
```

Input colors describe the shared default input appearance:

```text
input.default.bg
input.default.fg
input.default.placeholder.fg
input.default.caret
```

Divider and focus colors describe separators and the common focus indicator:

```text
divider.default.border
divider.muted.border
divider.accent.border
focus.ring
```

Status colors describe filled status surfaces. The `fg` slot is the foreground
color used on that status background. Use `content.*.fg` instead for colored
status text or icons on a normal surface:

```text
status.danger.bg
status.danger.fg
status.danger.border
status.info.bg
status.info.fg
status.info.border
status.success.bg
status.success.fg
status.success.border
status.warning.bg
status.warning.fg
status.warning.border
status.active.bg
status.active.fg
status.active.border
status.inactive.bg
status.inactive.fg
status.inactive.border
```

Toaster status surfaces remain component tokens because their opacity and hover
behavior are component-specific.

Unread mail and unassigned ticket or report rows do not define an attention
surface token. Their background treatment is being replaced by a danger-colored
attention dot in a later migration step.

Generic badges use badge component tokens rather than automatically sharing tag
semantics. Widget styling for Croppie and noUiSlider, and hub landing-page
brand or art-directed colors, remain outside the generic semantic token set.

## Component colors

Component colors use:

```text
<component-or-module>[.<part>][.<variant>].<slot>[.<state>]
```

Examples:

```text
button.primary.bg
button.primary.fg
button.primary.bg.hover
button.primary.bg.active

tooltip.bg
tooltip.fg

toaster.success.bg
toaster.success.bg.hover
toaster.close.bg.hover

realmtag.genre.fg
```

Component colors should normally default to semantic colors. They exist when a
component or module needs a more specific override.

Example defaults:

```text
button.primary.bg -> control.primary.bg
button.primary.fg -> control.primary.fg
tooltip.bg        -> surface.overlay.bg
```

### Module-owned theme files

Shared component tokens for common classes and components may live in
`src/common/scss/_variables.scss` when they are part of the shared component
contract.

Module-specific tokens should stay with the owning module instead. Put their
Sass fallback variables and `$theme-*` custom property wrappers in a
`<module>-theme.scss` file next to the module SCSS file, and import it from the
main module SCSS file before using the variables:

```scss
@import '~scss/variables';
@import './overlayNav-theme';
```

The owning module should keep the matching runtime token keys in its module
file and register them while the module is active:

```javascript
const themeTokens = {
	'overlaynav.badge.background.hover': (getToken) => adjust(getToken('color.base.400'), 3),
};

this.module.theme.addTokens(themeTokens);
```

The module should unregister those same keys in `dispose` using
`this.module.theme.removeTokens(themeTokens)`.

Use the `-theme.scss` suffix only for module-owned theme-token definitions. Do
not move module-specific tokens to `_variables.scss` unless they have become
shared semantic or shared component tokens.

## Slots

Use a small shared vocabulary for the visual property being colored:

```text
bg      Background
fg      Foreground, usually text or icon color
border  Border color
ring    Focus or selection ring
fill    SVG or icon fill
stroke  SVG or icon stroke
shadow  Shadow color
```

Avoid unclear abbreviations such as `txt`, `bdr`, or `hl`.

## Variants

Variants describe a type, importance, or level. They are placed before the slot:

```text
control.primary.bg
control.danger.bg
surface.100.bg
content.muted.fg
```

Common variants:

```text
default
primary
secondary
success
warning
danger
info
muted
subtle
disabled
overlay
asleep
active
idle
away
bot
```

## States

State names are added last:

```text
button.primary.bg.hover
button.primary.bg.active
button.primary.fg.disabled
toaster.close.bg.hover
```

Common state names:

```text
hover
active
selected
disabled
focus
```

Use `focus.ring` for the visible keyboard focus indicator, such as an outline or
box shadow around a focused control.

## Current semantic groups

Idle level colors use `idlelevel` as one lowercase segment:

```text
idlelevel.asleep.fg
idlelevel.active.fg
idlelevel.idle.fg
idlelevel.away.fg
idlelevel.bot.fg
```

Log text colors use `log`:

```text
log.default.fg
log.strong.fg
log.cmd.fg
log.ooc.fg
log.comm.fg
log.card.bg
```

Tag colors use `tag`:

```text
tag.default.fg
tag.default.border
tag.dislike.fg
tag.dislike.border
tag.title.fg
tag.title.border
tag.icon.fg
```

Legacy token keys are documented in [Legacy theme tokens](./legacythemetokens.md).
They are not runtime aliases.
