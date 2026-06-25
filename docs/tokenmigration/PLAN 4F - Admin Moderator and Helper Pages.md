# Plan 4F: Admin, Moderator, and Helper Pages

## Summary

Migrate operational staff-facing pages after the shared foundations and core
client domains are stable. These pages should use the regular semantic UI token
set and avoid creating staff-specific colors unless the audit shows a repeated
operational meaning.

## Scope

Edit SCSS under:

- `src/client/modules/admin/`
- `src/client/modules/moderator/`
- `src/client/modules/helper/`
- `src/client/modules/overseer/`
- `src/client/modules/builder/`
- `src/client/modules/pioneer/`
- `src/client/modules/supporter/`
- related operational command/help pages that are not part of the main app
  layout, forms, logs, or tags plans

Do not edit hub/account overseer pages in this plan; those belong to Plan 4E.

## Key Changes

- Replace operational page surfaces with `surface.*.bg`.
- Replace text colors with `content.*.fg`.
- Replace dividers and attachment/report borders with `divider.*.border` or
  `status.*.border`.
- Replace warning, report, suspension, delete, and destructive-action colors with
  `status.danger.*` or `control.danger.*`.
- Replace informational states with `status.info.*`.
- Reuse dialog/form token decisions from Plan 4B for staff dialogs.
- Reuse tag/status token decisions from Plan 4D for report/ticket/status badges.

## Token Rules

- Do not add admin/moderator/helper-specific semantic groups unless there is a
  recurring staff-only meaning that cannot be represented by `status`, `content`,
  `surface`, `divider`, `control`, `input`, `tag`, or `log`.
- Component tokens are allowed only for repeated operational components with
  real theme override needs.
- Keep help text and command docs visually consistent with common formatted text
  tokens.

## Test Plan

- Run `npm.cmd run build`.
- Search edited operational files for primitive/raw color usage.
- Confirm staff modules still distinguish destructive, warning, informational,
  success, and neutral states.
- Confirm no hub/account overseer pages were edited.

## Assumptions

- Operational UI should look consistent with the rest of the app rather than
  having a separate color language.
