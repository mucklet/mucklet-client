# Plan 5B: Standardize Module Theme Token Files

## Summary

Standardize module/component-specific theme tokens without centralizing them in
`_variables.scss`. Module-owned tokens should stay in their module folder, use
scanable `-theme.scss` files, and continue to be registered with
`Theme.addTokens` while the owning module is active.

## Preconditions

- Plan 5A is complete.
- Read `docs/tokenmigration/remaining-local-colors.md`.
- Only handle entries classified as `module-theme-token`.
- The latest SCSS builds successfully before starting.

## Module Theme Token Pattern

For module/component-specific theme tokens, keep ownership in the module folder:

- `<module>.scss` contains normal styles.
- `<module>-theme.scss` contains module-local Sass fallback variables and
  `$theme-<module>-*` CSS custom property wrappers.
- `<Module>.js` owns the matching `const themeTokens = { ... }`.
- The module registers tokens with `this.module.theme.addTokens(themeTokens)`.
- The module unregisters tokens with
  `this.module.theme.removeTokens(themeTokens)`.
- `<module>.scss` imports `<module>-theme.scss` before using those variables.

Example:

```scss
// overlayNav.scss
@import '~scss/variables';
@import './overlayNav-theme';

.overlaynav {
	// normal styles
}
```

```scss
// overlayNav-theme.scss
@import '~scss/variables';

$overlaynav-badge-background-hover: lighten($color-base-400, 3%);
$theme-overlaynav-badge-background-hover: var(
	--mu-overlaynav-badge-background-hover,
	#{$overlaynav-badge-background-hover}
);
```

```javascript
// OverlayNav.js
const themeTokens = {
	'overlaynav.badge.background.hover': (getToken) => adjust(getToken('color.base.400'), 3),
};
```

## Key Changes

- For each `module-theme-token` entry from Plan 5A:
  - create or update the module's `<module>-theme.scss`
  - move only the local color fallback variables and `$theme-*` wrappers into
    that file
  - import the theme file from the module's main SCSS file
  - verify the owning module has matching `Theme.addTokens` and
    `Theme.removeTokens` calls
  - verify runtime token keys map to CSS variables through `Theme.js`
- Do not move module-specific tokens to `_variables.scss` unless the token has
  become shared application semantics or a shared component token.
- Do not remove `Theme.addTokens` for module-specific tokens that are still
  valid. Ensure the SCSS custom property name and runtime token key match.

## Naming Rules

- Use `<module>-theme.scss` even though most project SCSS filenames are
  camelCase. This is an intentional token-migration convention to make
  module-owned theme files easy to scan.
- Keep the module prefix lowercase in token keys and Sass variables, matching
  existing token naming.
- Do not introduce hub-only `--mu-*` variables or hub-only runtime token keys.

## Scope Limits

- Do not process `shared-semantic-candidate`, `shared-component-candidate`,
  `trivial-alias`, `hub-local`, `vendor-widget`, `technical-color`, or
  `deferred-design` entries in this plan.
- Do not update the realm theme editor UI.
- Do not edit policy files.
- If the plan becomes too large, stop after one coherent module group and report
  the remaining modules.

## Test Plan

- Run `npm.cmd run build`.
- Search for remaining module-owned color fallback variables still sitting in
  the module's main SCSS file for the modules touched.
- Confirm each touched module imports its `-theme.scss` file from the main SCSS
  file.
- Confirm each touched module has matching runtime token registration and
  removal when runtime token keys exist.
- Confirm no shared tokens were added to `_variables.scss` unless explicitly
  justified as shared semantics.

## Assumptions

- Module-owned theme tokens are valid and should remain decentralized.
- `Theme.addTokens` is the desired mechanism for module-specific runtime tokens.
