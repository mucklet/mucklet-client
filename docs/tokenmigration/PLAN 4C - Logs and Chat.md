# Plan 4C: Logs and Chat

## Summary

Migrate log, chat, formatted text, command output, and event styling to the
existing `log.*` semantic token group. This domain has its own meanings and
should not be forced into generic `content.*` tokens when the color represents
log semantics.

## Scope

Edit log/chat-related SCSS under:

- `src/client/modules/main/layout/charLog/`
- command output styles that render into the character log
- common formatted-text styles only if they are clearly used as log/chat output

Do not edit generic layout, dialogs/forms, tags, hub/account pages, or
admin/moderator/helper pages in this plan.

## Key Changes

- Replace primitive colors used for log text roles with existing `log.*.fg`
  tokens.
- Replace log card/code/background colors with existing `log.*.bg` tokens.
- Replace log error, info, command, OOC, comm, source, title, bot, instance, and
  entity colors with the closest `log.*` token.
- Replace log fieldset borders and labels with `log.*`, `divider.*`, or
  `status.*` tokens depending on the meaning.
- Preserve existing component tokens for char log invalid/event menu styling only
  if they represent true char log overrides. Otherwise move them to semantic log
  tokens or shared surface tokens.
- Keep command syntax highlighting domain-specific. Use `log.*` or a new
  `syntax.*` semantic group only if repeated outside a single component.

## Token Rules

- Prefer `log.*` over generic `content.*` for text inside the character log.
- Use `content.*` only for surrounding UI chrome that is not log content.
- Add new `log.*` tokens only when the role is reusable across log event types.
- Do not collapse distinct log meanings just because they currently share a
  primitive fallback.

## Test Plan

- Run `npm.cmd run build`.
- Search edited log/chat files for remaining primitive and raw color usage.
- Confirm remaining local char log tokens are listed with reasons.
- Confirm non-log modules were not migrated in this plan.

## Assumptions

- The log token group may need more domain-specific tokens than generic UI.
- Visual preservation is more important than reducing the number of log tokens.
