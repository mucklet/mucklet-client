# Plan 4: Domain Migration Rules

## Summary

Use this plan as the shared rule set for Plans 4A-4F. It does not migrate any
files by itself. Each domain plan should be executed separately so the diffs stay
small, reviewable, and tied to one visual area.

## Preconditions

- Plan 1 has produced the color usage audit.
- Plan 2 has added the initial semantic token set.
- Plan 3 has migrated shared foundation styles.
- Read these files before starting any Plan 4 sub-plan:
  - `docs/understanding-themetokens.md`
  - `docs/tokenmigration/PLAN 1 - Audit current SCSS Color usage.md`
  - `docs/tokenmigration/PLAN 2 - Design Initial Semantic Token Set.md`
  - `docs/tokenmigration/PLAN 3 - Refactor Shared Foundations.md`
  - `src/common/scss/_variables.scss`

## Shared Migration Rules

- Stay inside the file scope listed by the active sub-plan.
- Preserve visual output. This is a token migration, not a redesign.
- Prefer existing semantic tokens over primitive tokens.
- Do not replace colors mechanically. Classify each usage by UI meaning.
- Add semantic tokens only when the meaning is reusable inside or beyond the
  current domain.
- Add component tokens only when a component genuinely needs a specific override.
- Component tokens must default to semantic tokens where possible.
- Do not add third party dependencies.
- Do not edit files under `src/common/policies/`.
- Do not edit unrelated JavaScript unless a style class reference must be changed;
  avoid class changes unless absolutely necessary.

## Execution Order

Execute the domain plans in this order:

1. Plan 4A: Layout and surfaces
2. Plan 4B: Dialogs and forms
3. Plan 4D: Tags, badges, and status indicators
4. Plan 4C: Logs and chat
5. Plan 4F: Admin, moderator, and helper pages
6. Plan 4E: Hub and account pages

Hub and account pages come last because they contain more brand and
art-directed styling that should not shape the core semantic token model.

## Validation For Each Sub-Plan

- Run `npm.cmd run build`.
- Search the edited files for remaining `$color-*`, `$theme-color-*`, raw hex,
  `rgba`, `mix`, `lighten`, `darken`, and `desaturate`.
- Document any remaining primitive, raw, or calculated color usage with a reason.
- Confirm the final changed file list matches the active sub-plan scope.
