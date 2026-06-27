# Plan 5C: Remove Trivial Local Color Aliases

## Summary

Remove local color variables that only alias existing semantic or component
tokens without adding meaning. This is a small cleanup pass after Plan 5A has
classified remaining local colors and Plan 5B has standardized module-owned
theme-token files.

## Preconditions

- Plan 5A is complete.
- Plan 5B is complete for any module-owned tokens that should remain.
- Read `docs/tokenmigration/remaining-local-colors.md`.
- Only handle entries classified as `trivial-alias`.
- The latest SCSS builds successfully before starting.

## Key Changes

- Replace local alias variable usages with the existing semantic/component token
  they alias.
- Remove the now-unused local alias variable declarations.
- Do not remove variables that:
  - encode a fallback calculation
  - document component ownership
  - map to a module runtime token
  - belong to hub artwork/brand/vendor/technical styling
  - are marked `deferred-design`
- Do not add new semantic tokens.
- Do not move tokens into `_variables.scss`.
- Do not remove `Theme.addTokens` registrations.

## Test Plan

- Run `npm.cmd run build`.
- Search touched files to confirm the removed alias variables are no longer
  referenced.
- Confirm no runtime token keys were removed unless they were provably unused
  and not part of a module-owned token contract.
- Confirm no hub-only runtime token or hub module `addTokens` registration was
  added.

## Assumptions

- This plan should be intentionally small. If an alias is not obviously trivial,
  leave it and mark it for later review.
