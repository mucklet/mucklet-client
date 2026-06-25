# Plan 4B: Dialogs and Forms

## Summary

Migrate feature dialog and form styles to semantic dialog, input, control,
content, divider, and status tokens. Shared dialog and input foundations should
already be migrated by Plan 3, so this plan handles module-specific dialog and
form SCSS.

## Scope

Edit SCSS for dialogs, forms, settings panels, login/reset/verify forms, and
form-like request components under:

- `src/client/modules/**/dialogs/`
- `src/client/modules/**/pages/**`
- `src/client/modules/**/playerSettings/`
- `src/client/modules/**/charSettings/`
- `src/hub/login/`
- `src/hub/reset/`
- `src/hub/verify/`
- `src/common/modules/dialogs/`

Only edit files where the color usage belongs to dialogs or forms. Leave layout,
logs, tags, hub landing pages, and staff/admin operational pages for their own
plans.

## Key Changes

- Replace dialog surface colors with `surface.*.bg` or shared dialog component
  tokens from Plan 3.
- Replace form field backgrounds, foregrounds, placeholders, carets, and focus
  colors with `input.default.*` and `focus.ring`.
- Replace button overrides with `control.*` tokens or existing button classes
  where possible.
- Replace form helper text with `content.muted.fg` or `content.subtle.fg`.
- Replace validation and destructive action colors with `status.danger.*` or
  `content.error.fg`.
- Replace section dividers with `divider.*.border`.
- Remove module-local color calculations only when they are clearly form/dialog
  styling and can be replaced without changing meaning.

## Token Rules

- Prefer shared foundation classes and tokens over adding module-specific
  dialog/form tokens.
- Add a component token only when the same dialog/form part needs a specific
  theme override that cannot be represented by `surface`, `input`, `control`,
  `content`, `divider`, or `status`.
- Do not create new status variants unless the audit shows repeated usage and
  the value cannot be represented by existing status tokens.

## Test Plan

- Run `npm.cmd run build`.
- Search edited files for remaining primitive and raw color usage.
- Confirm no files under `src/common/policies/` were touched.
- Confirm no component lifecycle or JavaScript behavior changed.

## Assumptions

- This plan may touch many small dialog/form SCSS files, but each edit should be
  a direct token substitution based on visual meaning.
- Login/reset/verify forms are included because they are form experiences, not
  hub marketing pages.
