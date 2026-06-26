# Plan 5: Remove Local Color Definitions

## Summary

Remove or centralize component-local color variables after the domain migrations
have proven the semantic token set. This plan should not start until Plans 4A-4F
are complete, because local color definitions often reveal missing semantic or
component token needs.

## Preconditions

- Plans 1-4F are complete.
- `docs/theme-token-audit.md` exists and has a section for component-local color
  definitions.
- Read `docs/tokenmigration/PLAN 4 - Domain Migration Rules.md` for runtime
  token sync rules.
- Read `docs/tokenmigration/PLAN 4E - Hub and Account Pages.md` for hub
  non-themeability rules.
- The latest SCSS builds successfully before starting.

## Key Changes

- Search all SCSS for local color variable declarations:
  - variables declared outside `_variables.scss` whose values include `$color-*`,
    `$theme-color-*`, raw colors, `rgba`, `mix`, `lighten`, `darken`,
    `desaturate`, or similar color calculations
  - local `$theme-*` component variables declared in component/module SCSS files
- Classify each local color variable as one of:
  - replace with existing semantic token
  - move to new semantic token in `_variables.scss`
  - move to component token in `_variables.scss`, defaulting to semantic tokens
  - keep local because it is layout math, image/art masking, or third-party brand
    styling
- Remove local variables that only alias semantic tokens without adding meaning.
- Move reusable component tokens to `_variables.scss` and update usages to the
  centralized token name.
- Keep local non-color sizing/spacing variables untouched.
- If the sweep becomes too large, stop after one coherent category and report
  the recommended split instead of continuing broadly.

## Token Rules

- Do not create component tokens for one-off values unless they need external
  theme override.
- Do not turn art-directed hub gradients, image masks, or third-party brand
  colors into generic semantic tokens.
- If `_variables.scss` is changed, update
  `src/common/modules/theme/themeTokens.js` in the same change for every new or
  changed shared runtime token.
- Do not add hub-only tokens to `themeTokens.js`, `Theme.js`, module-level
  `addTokens`, or `_variables.scss` as `--mu-*` custom properties.
- Hub-only colors should remain in hub SCSS or `_hubvariables.scss` unless the
  meaning is genuinely shared application UI.
- If a local calculated color appears in multiple domains, prefer a semantic
  token.
- If a local calculated color appears in one reusable shared component, prefer a
  component token defaulting to a semantic token.
- Known likely-retained categories include:
  - hub landing artwork, masks, gradients, shadows, and third-party brand colors
  - Croppie and noUiSlider vendor/widget styling
  - technical transparency for carets, spinner edges, scrollbars, or masks
  - component-specific charlog invalid/event-menu overlay/shadow fallbacks
  - unresolved low-alpha shadow decisions

## Test Plan

- Run `npm.cmd run build`.
- Search all SCSS for remaining local color variable declarations outside
  `_variables.scss`.
- Search all SCSS for remaining `$color-*`, `$theme-color-*`, raw hex, `rgba`,
  `mix`, `lighten`, `darken`, and `desaturate`.
- Document every remaining local color variable with a reason.
- If `_variables.scss` changed, compare new or changed `--mu-*` variables
  against `themeTokens.js` and document intentional omissions.
- Confirm no hub-only runtime token or hub module `addTokens` registration was
  added.
- Confirm no realm theme editor UI changes were made unless explicitly required.

## Assumptions

- This plan may update `_variables.scss` and many SCSS files, but each change
  should be a cleanup of an existing local color definition.
- The goal is not zero raw color usage; the goal is zero unexplained local UI
  color definitions.
