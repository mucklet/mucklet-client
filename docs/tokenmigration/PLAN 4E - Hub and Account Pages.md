# Plan 4E: Hub and Account Pages

## Summary

Migrate hub and account page UI colors after the core app domains are complete.
Hub files include both normal product UI and art-directed landing/brand styling,
so this plan must separate reusable UI chrome from intentional visual artwork.

## Scope

Edit SCSS under:

- `src/hub/account/`
- `src/hub/modules/`
- `src/hub/login/`
- `src/hub/reset/`
- `src/hub/verify/`
- `src/hub/styleguide/`
- `src/hub/style.scss`

Do not edit static policy files or shared common foundations in this plan unless
a missing token must be added to `_variables.scss`.

## Key Changes

- Migrate account app UI surfaces, controls, forms, tags, tables, status labels,
  and dividers to semantic tokens.
- Keep intentional brand colors and third-party brand colors explicit or
  documented, such as Google and PayPal colors.
- Treat landing page gradients, masks, image overlays, parallax art, and
  promotional composition as art-directed styling. Migrate only when the color
  is clearly reusable UI chrome.
- Replace account operational status colors with `status.*` tokens.
- Replace hub form and dialog styles with the same form/dialog token rules from
  Plan 4B.
- Replace hub layout surfaces with `surface.*.bg` only when they are app chrome,
  not artwork.

## Token Rules

- Do not let hub landing-page artwork create generic semantic tokens.
- Use component or hub-specific tokens only for repeated hub UI patterns that
  need theme overrides.
- Leave raw colors in art-directed sections when replacing them would obscure
  intent or create false semantic meaning.
- Document every remaining raw color in edited hub files as either brand,
  artwork, third-party brand, or unresolved.

## Test Plan

- Run `npm.cmd run build`.
- Search edited hub files for primitive/raw color usage and document remaining
  cases.
- Confirm no policy files were touched.
- Confirm account/product UI has moved toward semantic tokens while landing art
  remains intentionally classified.

## Assumptions

- This plan is intentionally last because hub styling has the highest chance of
  valid raw or brand-specific color usage.
