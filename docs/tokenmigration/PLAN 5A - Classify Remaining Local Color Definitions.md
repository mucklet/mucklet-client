# Plan 5A: Classify Remaining Local Color Definitions

## Summary

Create a classification report for all remaining local color definitions after
Plans 1-4F. This plan should not migrate SCSS. Its purpose is to decide which
remaining local colors should become shared semantics, which should remain
module-owned theme tokens, and which should stay local because they are art,
brand, vendor, or technical styling.

## Preconditions

- Plans 1-4F are complete.
- `docs/theme-token-audit.md` exists.
- Read `docs/tokenmigration/PLAN 4 - Domain Migration Rules.md` for runtime
  token sync rules.
- Read `docs/tokenmigration/PLAN 4E - Hub and Account Pages.md` for hub
  non-themeability rules.
- The latest SCSS builds successfully before starting.

## Key Changes

- Search all SCSS for local color definitions outside `_variables.scss`:
  - local fallback variables using `$color-*`, `$theme-color-*`, raw colors,
    `rgba`, `mix`, `lighten`, `darken`, `saturate`, or `desaturate`
  - local `$theme-*` CSS custom property wrappers declared in component/module
    SCSS files
  - module-owned runtime token registrations using `Theme.addTokens`
- Create `docs/tokenmigration/remaining-local-colors.md`.
- For each remaining local color definition, record:
  - file path
  - local Sass variable name, if any
  - CSS custom property name, if any
  - runtime token key, if any
  - current fallback expression
  - current usage summary
  - classification
  - recommended next plan: 5B, 5C, later design decision, or keep

## Classifications

Use these exact classifications:

- `shared-semantic-candidate`: should become or use a shared semantic token.
- `shared-component-candidate`: belongs to a reusable shared component, class, or
  global SCSS helper used by multiple modules or apps, such as common buttons,
  dialogs, tooltip, badge, panel, input, popup components, or shared SCSS
  utilities. These tokens may belong in `_variables.scss` because the component
  itself is shared. Examples: `tooltip.bg`, `badge.highlight.bg`,
  `button.light.bg.hover`.
- `module-theme-token`: belongs to one feature module or module folder and
  should remain owned by that module, even if it is runtime-themeable. These
  tokens should stay near the module and later move to `<module>-theme.scss`,
  with matching runtime keys registered by that module through
  `Theme.addTokens`. Examples: `overlaynav.badge.background.hover`,
  `charlog.eventmenu.background`, `pagearea.image.location.border.selected`.
- `trivial-alias`: local variable only aliases an existing semantic/component
  token without adding meaning; remove in Plan 5C.
- `hub-local`: hub-only brand, landing-page, artwork, product, or
  third-party color; keep local and do not runtime-theme.
- `vendor-widget`: Croppie, noUiSlider, or similar vendor/widget styling; keep
  local unless later explicitly themed.
- `technical-color`: transparency, masks, carets, spinner edges, scrollbar
  tracks, or similar technical styling; keep local unless clearly reusable.
- `deferred-design`: meaningful color decision that should not be solved during
  cleanup.

## Classification Rules

- If a token is used by shared code under `src/common/classes`,
  `src/common/components`, or `src/common/scss`, classify it as
  `shared-component-candidate` unless it is better described as a semantic role.
- If a token is used by a module folder under `src/common/modules`,
  `src/client/modules`, `src/client/scripteditor/modules`, or `src/hub/account/modules`,
  classify it as `module-theme-token` unless another classification is more
  specific.
- If a token is hub-only, classify it as `hub-local`, not `module-theme-token`,
  because hub-specific colors are not runtime-themeable.
- If the same visual role appears in multiple unrelated modules, classify it as
  `shared-semantic-candidate` rather than `module-theme-token`.
- If a local variable only names an existing semantic/component token without a
  distinct fallback, runtime key, or ownership meaning, classify it as
  `trivial-alias`.

## Rules

- Do not edit SCSS in this plan.
- Do not move tokens into `_variables.scss` in this plan.
- Do not add, remove, or rename runtime tokens in this plan.
- Do not add hub-only tokens to `themeTokens.js`, `Theme.js`, module-level
  `addTokens`, or `_variables.scss`.
- Treat module-specific runtime tokens as valid if they are scoped, registered
  with `Theme.addTokens`, and useful to theme while the module is active.

## Test Plan

- Confirm `docs/tokenmigration/remaining-local-colors.md` exists.
- Confirm no SCSS or JS files changed.
- Confirm the report lists every local color variable and local `$theme-*`
  wrapper found by the searches.

## Assumptions

- This is a planning/reporting pass. Actual cleanup happens in Plans 5B and 5C.
- The goal is not zero local color definitions. The goal is that every remaining
  local color has an explicit ownership decision.
