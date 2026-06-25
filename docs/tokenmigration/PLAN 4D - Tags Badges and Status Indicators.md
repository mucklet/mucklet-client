# Plan 4D: Tags, Badges, and Status Indicators

## Summary

Migrate tags, badges, pills, counters, state labels, and status indicators to
semantic `tag.*`, `status.*`, `control.*`, `content.*`, and surface tokens. This
plan covers compact stateful UI elements, not full layout, dialogs, or log text.

## Scope

Edit SCSS for:

- shared badges, counters, pills, tag lists, project/container/task state styles
- client tag selection/editing UI
- room/page character status snippets where they act like compact indicators
- vertical step progress and similar state indicators

Likely paths include:

- `src/common/scss/_badge.scss`
- `src/common/scss/_counter.scss`
- `src/common/components/*Tag*.scss`
- `src/common/components/popupPill.scss`
- `src/common/components/verticalStepProgress.scss`
- `src/common/utils/*States.scss`
- `src/client/modules/main/pages/pageSelectTags/`
- `src/client/modules/main/pages/pageEditChar/editCharTags/`

Do not edit log text, broad layout surfaces, or hub marketing pages in this
plan.

## Key Changes

- Replace tag colors with `tag.*.fg`, `tag.*.border`, and tag hover tokens.
- Replace badge text with `content.*.fg` or domain tokens when the badge conveys
  a domain-specific meaning.
- Replace counters and alert/highlight indicators with `status.*.bg` and
  `status.*.fg`.
- Replace task/project/container state colors with `status.*` tokens.
- Replace compact indicator borders with `status.*.border` or
  `divider.*.border`.
- Remove local badge/status color calculations only when the new semantic token
  preserves the same role.

## Token Rules

- Use `status.danger.*`, `status.info.*`, `status.success.*`, and
  `status.warning.*` only for actual state/status meaning.
- Use `tag.*` for user-facing tag taxonomy and tag interaction states.
- Use component tokens for badge-specific highlight surfaces only when they are
  reusable badge behavior rather than generic status meaning.
- If `$color-success` appears, replace it with `status.success.*`; do not spread
  `$color-success` beyond its current hub-only primitive context.

## Test Plan

- Run `npm.cmd run build`.
- Search edited files for primitive/raw color usage.
- Confirm tag hover states still have distinct tokens.
- Confirm compact indicators still distinguish danger, warning, success, info,
  active, inactive, and neutral states where applicable.

## Assumptions

- Plan 2 or Plan 3 may already have introduced status tokens. If not, this plan
  may add the minimum status tokens required by repeated indicator usage.
