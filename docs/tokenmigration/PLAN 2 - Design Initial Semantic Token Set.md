# Plan 2: Design Initial Semantic Token Set

## Summary
Use `docs/theme-token-audit.md` from Plan 1 to add the first stable semantic token layer. This step changes only token definitions and documentation; it must not migrate component/module SCSS usage yet. If `docs/theme-token-audit.md` does not exist, stop and run Plan 1 first.

## Key Changes
- Update `src/common/scss/_variables.scss` by adding or normalizing reusable semantic tokens only.
- Keep all existing primitive vars and existing semantic vars working.
- Normalize semantic fallbacks to reference `$theme-color-*` primitives where possible, e.g. `var(--mu-surface-200-bg, #{$theme-color-base-200})`.
- Use raw Sass fallback helper variables only when Sass color functions or alpha are required, such as overlay backgrounds.
- Do not add component-specific tokens in this step unless the audit shows an existing component token already belongs in `_variables.scss`.

Initial token groups to define:

```scss
// Surfaces
$theme-surface-100-bg;
$theme-surface-200-bg;
$theme-surface-300-bg;
$theme-surface-400-bg;
$theme-surface-500-bg;
$theme-surface-overlay-bg;

// Content
$theme-content-default-fg;
$theme-content-strong-fg;
$theme-content-muted-fg;
$theme-content-subtle-fg;
$theme-content-disabled-fg;
$theme-content-placeholder-fg;
$theme-content-error-fg;

// Controls
$theme-control-default-bg;
$theme-control-default-bg-hover;
$theme-control-default-bg-active;
$theme-control-default-fg;
$theme-control-default-fg-hover;
$theme-control-primary-bg;
$theme-control-primary-bg-hover;
$theme-control-primary-bg-active;
$theme-control-primary-fg;
$theme-control-secondary-bg;
$theme-control-secondary-bg-hover;
$theme-control-secondary-bg-active;
$theme-control-secondary-fg;
$theme-control-danger-bg;
$theme-control-danger-bg-hover;
$theme-control-danger-bg-active;
$theme-control-danger-fg;
$theme-control-placeholder-fg;

// Inputs
$theme-input-default-bg;
$theme-input-default-fg;
$theme-input-default-placeholder-fg;
$theme-input-default-caret;

// Dividers and focus
$theme-divider-default-border;
$theme-divider-muted-border;
$theme-divider-accent-border;
$theme-focus-ring;

// Status
$theme-status-danger-fg;
$theme-status-danger-bg;
$theme-status-danger-border;
$theme-status-info-fg;
$theme-status-info-bg;
$theme-status-info-border;
```

- Add `success` and `warning` status tokens only if the audit shows enough recurring usage to justify them. If added, use semantic names `status.success.*` and `status.warning.*`; do not introduce new primitive color families in this step.
- Keep existing `idlelevel`, `log`, and `tag` groups, but normalize their fallbacks to `$theme-color-*` where no Sass calculation is needed.
- Preserve existing CSS custom property names for current tokens. New tokens must use the matching `--mu-*` key, e.g. `$theme-control-primary-bg` uses `--mu-control-primary-bg`.

## Documentation
- Update `docs/understanding-themetokens.md` to list the new initial semantic groups and clarify that component SCSS should prefer semantic tokens over `$theme-color-*`.
- Do not update `docs/legacythemetokens.md` unless an existing token is renamed. This plan should avoid renames.

## Test Plan
- Run a search to confirm Plan 2 did not edit component/module SCSS files.
- Run `npm.cmd run build` to verify Sass compilation.
- Run targeted searches to confirm new CSS custom property keys match their Sass variable names.
- Confirm no files under `src/common/policies/` were touched.

## Assumptions
- `docs/theme-token-audit.md` is the required input from Plan 1.
- Plan 2 is additive and compatibility-preserving.
- Actual SCSS usage migration happens in later plans.
- Hub/marketing art-directed colors stay out of the initial semantic core unless the audit identifies reusable UI meanings.
