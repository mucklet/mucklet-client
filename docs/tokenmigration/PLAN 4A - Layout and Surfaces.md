# Plan 4A: Layout and Surfaces

## Summary

Migrate layout shell, panel, and page surface colors from primitive tokens to
semantic surface, divider, content, and shadow tokens. This plan should focus on
structural UI chrome only, not form controls, dialogs, logs, tags, or
domain-specific status colors.

## Scope

Edit layout and structural surface SCSS under:

- `src/client/modules/main/layout/`
- `src/client/scripteditor/modules/main/editorLayout/`
- structural page containers where the primary usage is surface/background layout

Do not edit:

- `src/client/modules/main/layout/charLog/`
- form/dialog modules
- hub/account pages
- admin/moderator/helper pages

## Key Changes

- Replace page and app-shell backgrounds with `surface.*.bg`.
- Replace panel/sidebar/header/footer backgrounds with the closest existing
  `surface.*.bg` token.
- Replace layout dividers with `divider.default.border`,
  `divider.muted.border`, or `divider.accent.border`.
- Replace text/icon foregrounds in layout chrome with `content.*.fg`.
- Replace layout shadows with semantic or shared shadow tokens if available.
  If no suitable shadow token exists, add one only if it is reusable across
  multiple layout surfaces.
- Leave scrollbar colors alone unless a clear semantic token exists from Plan 2
  or Plan 3. If several scrollbars share the same meaning, add a reusable
  scrollbar semantic token or record it for Plan 5.

## Token Rules

- Use `surface.200.bg` for base application backgrounds when it already matches
  the current visual role.
- Use higher surface levels for raised sidebars, panels, headers, or toolbars.
- Use `content.default.fg`, `content.muted.fg`, and `content.strong.fg` for
  layout text.
- Do not introduce component tokens for every layout area. Prefer semantic
  surface tokens unless a layout component needs a true override.

## Test Plan

- Run `npm.cmd run build`.
- Search edited layout files for `$color-*`, `$theme-color-*`, raw hex, and color
  calculations.
- Manually inspect the diff to confirm no log/chat, form, dialog, or hub styling
  was migrated in this plan.

## Assumptions

- Shared foundation tokens from Plan 3 are available.
- Minor visual differences caused by replacing equivalent primitive references
  with semantic aliases are acceptable only when the fallback values are
  intentionally identical.
