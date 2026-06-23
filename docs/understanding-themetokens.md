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

Example defaults:

```text
surface.100.bg      -> color.base.100
surface.100.fg      -> color.neutral.300
control.primary.bg  -> color.action.300
control.primary.fg  -> color.base.100
status.danger.fg    -> color.danger.300
idlelevel.idle.fg   -> color.accent.300
log.cmd.fg          -> color.accent.300
tag.dislike.fg      -> color.danger.300
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
