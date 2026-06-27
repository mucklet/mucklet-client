# Plan 6: Enforcement Sweep

## Summary

Perform the final migration sweep after local color definitions have been
removed or classified. The goal is to make remaining primitive/raw color usage
intentional, documented, and easy to enforce in future work.

## Preconditions

- Plans 1-4F are complete.
- Plan 5A has created `docs/tokenmigration/remaining-local-colors.md`.
- Plan 5B has standardized module-owned runtime tokens into `*-theme.scss`
  files.
- Plan 5C has removed trivial local aliases.
- The project builds successfully before starting.
- Remaining raw/primitive usages from Plan 5A are documented.

## Key Changes

- Search all SCSS under `src/` for:
  - `$color-*`
  - `$theme-color-*`
  - `$white`, `$black`, `$shadow`
  - raw hex colors
  - `rgb()`, `rgba()`, `hsl()`, `hsla()`
  - `mix()`, `lighten()`, `darken()`, `saturate()`, `desaturate()`,
    `transparentize()`, `opacify()`
- For each remaining match:
  - migrate it to an existing semantic or component token, or
  - add the minimum missing token if the meaning is reusable, or
  - document why it should remain raw/primitive.
- Create or update a final report at `docs/tokenmigration/remaining-color-usage.md`
  listing every intentional exception.
- Optionally add a lightweight check script only if the project already has a
  suitable pattern for custom checks. Do not add dependencies. If no existing
  pattern fits, document the recommended command instead of adding automation.

## Enforcement Rules

- Component and module SCSS should not use `$color-*` or `$theme-color-*`
  directly after this plan, except documented exceptions.
- Module-owned `<module>-theme.scss` files may use `$color-*`,
  `$theme-color-*`, raw colors, and color calculations when defining local
  fallback values for module-owned runtime tokens.
- Module-owned fallback usages must be documented or traceable through
  `docs/tokenmigration/remaining-local-colors.md`.
- Main module SCSS files should use `$theme-*` wrappers, not local primitive
  calculations.
- Do not centralize module-owned tokens into `_variables.scss`.
- `_variables.scss` may use primitive colors and color calculations to define
  primitive, semantic, and component token fallbacks.
- Art-directed hub styling, image masks, third-party brand colors, and technical
  alpha effects may remain raw when documented.
- Future new UI colors should be added through semantic or component tokens, not
  ad hoc local color variables.
- Hub-specific colors are not runtime-themeable. Do not add hub-only tokens to
  `themeTokens.js`, `Theme.js`, module-level `addTokens`, or `_variables.scss`.

## Test Plan

- Run `npm.cmd run build`.
- Run final color searches and confirm all matches are either in `_variables.scss`
  or documented in `remaining-color-usage.md`.
- Confirm remaining module-owned primitive/raw usages live in `*-theme.scss`
  files or are documented as unresolved.
- Confirm no module-owned tokens were centralized into `_variables.scss`.
- Confirm no hub-only runtime token or hub module `addTokens` registration was
  added.
- Run `git diff --check`.
- Review the final changed file list for unrelated edits.

## Assumptions

- The final state may still contain raw colors where raw colors are clearer than
  semantic tokens, especially for brand/artwork/masks.
- The final state may still contain primitive or calculated fallbacks inside
  module-owned `*-theme.scss` files.
- No lint dependency will be added unless explicitly approved separately.
