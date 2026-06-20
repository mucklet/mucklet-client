# Understanding theme tokens

Theme tokens are named by how specific they are:

* Primitive colors define the available palette.
* Semantic colors define common UI usage.
* Component colors define overrides for a specific component or module.

Prefer short but clear names. Use `bg` for background and `fg` for foreground.

## Primitive colors

Primitive colors use:

```text
color.<family>.<level>
```

Examples:

```text
color.base.100
color.base.200
color.base.300
color.neutral.300
color.action.300
color.danger.300
```

Primitive colors should describe the palette only. They should not include UI
usage, component names, or states such as `hover` or `active`.

Color levels describe the role within the color family, not absolute luminosity.

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

control.primary.bg
control.primary.fg
control.primary.bg.hover
control.primary.bg.active

status.danger.fg
status.danger.bg

focus.ring
selection.bg
selection.fg
```

Semantic colors should describe reusable UI meaning. They may default to
primitive colors, but may also be overridden directly.

Example defaults:

```text
surface.100.bg      -> color.base.100
surface.100.fg      -> color.neutral.300
control.primary.bg  -> color.action.300
control.primary.fg  -> color.base.100
status.danger.fg    -> color.danger.300
```

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
log.error.fg
log.card.bg
```

Component colors should normally default to semantic colors. They exist when a
component or module needs a more specific override.

Example defaults:

```text
button.primary.bg -> control.primary.bg
button.primary.fg -> control.primary.fg
tooltip.bg        -> surface.overlay.bg
realmtag.genre.fg -> status.active.fg
```

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
