# Theme Token Migration

The theme color migration is currently paused after the broad audit, semantic
token setup, shared foundation migration, domain migrations, local-token
classification, module theme-file split, and final enforcement sweep.

The app builds at this checkpoint. The remaining work is documented as a
backlog rather than an active migration plan.

## Current State

- Semantic and component token guidance lives in
  `docs/understanding-themetokens.md`.
- The original audit is `docs/theme-token-audit.md`.
- Remaining module/local color ownership decisions are documented in
  `docs/tokenmigration/remaining-local-colors.md`.
- Remaining primitive, raw, and calculated color usage is documented in
  `docs/tokenmigration/remaining-color-usage.md`.
- Module-specific runtime tokens are intentionally decentralized in
  `*-theme.scss` files next to the owning module SCSS file.
- Module-specific runtime tokens should continue to use `Theme.addTokens` and
  `Theme.removeTokens` while the owning module is active.
- Hub-specific colors are not runtime-themeable and should not be added to
  `_variables.scss`, `themeTokens.js`, `Theme.js`, or hub module `addTokens`
  registrations.

## Files To Keep

Keep these files as the durable restart context:

- `docs/theme-token-audit.md`
- `docs/tokenmigration/remaining-local-colors.md`
- `docs/tokenmigration/remaining-color-usage.md`
- `docs/understanding-themetokens.md`
- `docs/legacythemetokens.md`

The old `PLAN *` files are historical execution notes. Do not rerun them
blindly; use the remaining reports as the current source of truth.

## Picking This Up Later

Start from `remaining-color-usage.md`, especially the unresolved follow-up and
deferred design sections. Work in small focused passes, for example:

- shared common component cleanup
- shared component token decisions
- client page residual primitive usage
- script editor, log preview, and scrollbar decisions
- deferred design decisions such as placeholder SVG, page-area image overlays,
  realm theme editor palette UI, and shadows

For new work, avoid direct primitive color usage in normal component SCSS. Use
existing semantic/component tokens, or add a focused token in the correct
ownership layer.
