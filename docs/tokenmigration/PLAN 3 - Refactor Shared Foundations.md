# Plan 3: Refactor Shared Foundations

## Summary
Refactor shared SCSS foundations to use the semantic token layer from Plan 2. This step should migrate global/shared styling patterns first, without touching feature modules or changing visual design intentionally. The output should establish examples for later module migrations.

## Key Changes
- Read `docs/understanding-themetokens.md`, `docs/theme-token-audit.md`, `src/common/scss/_variables.scss`, and the shared SCSS files before editing.
- Scope edits to shared foundation styles only:
  - `src/common/scss/_base.scss`
  - `src/common/scss/_mixins.scss`
  - `src/common/scss/_button.scss`
  - `src/common/scss/_input.scss`
  - `src/common/scss/_badge.scss`
  - `src/common/scss/_common.scss`
  - `src/common/scss/_counter.scss`
  - `src/common/scss/_tbl.scss`
  - `src/common/scss/_text.scss`
  - `src/common/scss/_kbd.scss`
  - `src/common/scss/_spinner.scss`
  - `src/common/classes/dialog.scss`
  - `src/common/classes/tooltip.scss`
  - `src/common/classes/imgModal.scss`
  - `src/common/modules/toaster/toaster.scss`
  - `src/common/components/panel.scss`
- Replace primitive UI usage with semantic tokens:
  - surfaces/backgrounds use `surface.*.bg`
  - text/icon colors use `content.*.fg`, `link.*.fg`, `status.*.fg`, or existing domain tokens
  - borders/dividers use `divider.*.border` or `status.*.border`
  - controls/buttons use `control.*`
  - inputs use `input.*`
  - focus uses `focus.ring`
  - overlays/tooltips/dialog backdrops use `surface.overlay.bg` or component tokens defaulting to it
- Keep existing component-specific tokens only when the visual meaning is genuinely component-specific, such as `tooltip.bg`, `toaster.success.bg`, or `badge.highlight.bg`.
- Move shared component token definitions to `_variables.scss` if they are currently local variables in shared foundation files, and make them default to semantic tokens where possible.
- Do not migrate feature/module SCSS in `src/client/**` or `src/hub/**` during this step, except `src/common/modules/toaster/toaster.scss`.
- Do not edit JS, component lifecycle behavior, policy files, package files, or lockfiles.

## Token Decisions
- `_mixins.scss` button defaults should use `control.default.*`.
- `_button.scss` variants should map to:
  - `.primary` -> `control.primary.*`
  - `.secondary` -> `control.secondary.*`
  - `.warning` -> `control.danger.*`
  - `.light`, `.solid`, `.iconbtn` -> `control.default.*` or surface/content tokens depending on existing visual meaning
- `_input.scss` should use `input.default.*` and `focus.ring`.
- Dialog surfaces should use `surface.overlay.bg`, `surface.500.bg`, `divider.accent.border`, `input.default.*`, and `content.*`.
- Tooltip and toaster should use component tokens only for their specific surfaces and hover states, with semantic fallbacks.
- Existing idle level, log, and tag tokens should remain in use where they represent domain meaning.

## Test Plan
- Run `npm.cmd run build` to verify Sass compiles.
- Search the scoped files for remaining `$color-*`, `$theme-color-*`, raw hex, `rgba`, `mix`, `lighten`, and `darken`.
- Any remaining primitive/raw usage in scoped files must be documented in the final response with a reason.
- Confirm no files outside the scoped shared foundation set and `_variables.scss` were changed.
- Confirm no visual redesign was introduced beyond token indirection.

## Assumptions
- Plan 2 has already added the initial semantic token set.
- This step may add narrowly scoped shared component tokens, but must not invent new broad semantic groups unless the existing Plan 2 tokens are insufficient for a shared foundation pattern.
- Later plans will migrate feature modules, logs, tags, hub pages, and admin/moderator/helper pages.
