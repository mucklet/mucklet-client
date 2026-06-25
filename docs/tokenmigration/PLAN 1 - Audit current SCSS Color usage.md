# Plan 1: Audit Current SCSS Color Usage

## Summary
Create a read-only audit of current color usage across all SCSS under `src/`, then write the findings to `docs/theme-token-audit.md`. The audit must not refactor SCSS, add tokens, rename variables, or change runtime behavior. Its purpose is to give the next planning step a reliable map of existing primitive, semantic, component-local, calculated, and raw color usage.

## Audit Steps
- Read `docs/understanding-themetokens.md`, `docs/legacythemetokens.md`, `docs/style-guide.md`, and `src/common/scss/_variables.scss`.
- Scan every `*.scss` file under `src/`, including client, hub, common classes/components/modules, utilities, and global SCSS.
- Collect these usage types:
  - primitive Sass variables: `$color-*`, `$white`, `$black`, `$shadow`
  - primitive theme variables: `$theme-color-*`
  - semantic/theme variables: `$theme-*` excluding `$theme-color-*`
  - component-local color variables, especially variables declared near the top of component SCSS files
  - raw colors: hex, `rgb()`, `rgba()`, named colors where used as colors
  - color calculations: `mix()`, `lighten()`, `darken()`, `desaturate()`, `transparentize()`, `rgba($...)`
  - color-related CSS properties: `color`, `background`, `background-color`, `border-color`, `border`, `box-shadow`, `text-shadow`, `fill`, `stroke`, `caret-color`, `outline`, `scrollbar-color`
- Use searches such as:
  - `rg -n "\$color-|\$theme-color-|\$white|\$black|\$shadow" src --glob "*.scss"`
  - `rg -n "\$theme-[a-z0-9-]+" src --glob "*.scss"`
  - `rg -n "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|mix\(|lighten\(|darken\(|desaturate\(|transparentize\(" src --glob "*.scss"`
  - `rg -n "^\$[a-z0-9-]+:.*(color-|#[0-9a-fA-F]|rgba?\(|mix\(|lighten\(|darken\()" src --glob "*.scss"`

## Report Structure
Write `docs/theme-token-audit.md` with these sections:

- `# Theme Token Audit`
- `## Purpose`
  - State that this is an inventory for migration planning, not a final token design.
- `## Summary`
  - Count total SCSS files scanned.
  - Count files with primitive theme usage.
  - Count files with raw color/calculated color usage.
  - Count files with component-local color variables.
- `## Existing Token Landscape`
  - Summarize primitives and semantic groups already present in `_variables.scss`.
  - Note current semantic groups such as `surface`, `content`, `control placeholder`, `link`, `focus`, `idlelevel`, `log`, and `tag`.
- `## Usage Categories`
  - Group findings by visual meaning:
    - surfaces and layout backgrounds
    - content/text foregrounds
    - borders and dividers
    - controls/buttons/icon buttons
    - inputs/forms/placeholders/autofill
    - dialogs/menus/tooltips/overlays
    - status colors
    - logs/chat/formatting
    - tags/badges/pills
    - shadows and focus/selection affordances
    - hub/marketing-specific colors
- `## Component-Local Color Definitions`
  - List each local color variable, file, current expression, and likely classification:
    - replace with existing semantic token
    - candidate for new semantic token
    - candidate for component token
    - intentional special-case/brand/art color
- `## Raw And Calculated Colors`
  - List raw hex/rgb/rgba/calculated colors by file.
  - Separate UI colors from image masks, gradients, artwork overlays, and shadows.
- `## Migration Candidates`
  - Provide a prioritized list of reusable semantic token groups likely needed next.
  - Do not define final names unless the meaning is already obvious from existing docs.
- `## Open Questions`
  - Record only unresolved product/design questions that cannot be answered from code.

## Classification Rules
- Classify by UI meaning, not by current primitive value.
- Treat `$theme-color-base-*` usage as unresolved semantic meaning, not as acceptable final usage.
- Treat raw colors in hub art direction, gradients, masks, and image overlays separately from normal UI chrome.
- Do not recommend one token per unique color. Recommend reusable semantic groups only.
- Component tokens should be suggested only when the usage is genuinely component-specific and cannot be expressed by a reusable semantic token.
- Do not include files under `src/common/policies/` if encountered; policy files must not be edited.

## Validation
- Confirm the report references all SCSS files found by `rg --files src -g "*.scss"`.
- Confirm the report includes examples from shared SCSS, common components/classes, client modules, hub/account modules, and hub landing/style files.
- Confirm no SCSS, JS, package, lockfile, or generated asset was changed.
- Final implementation response should list only `docs/theme-token-audit.md` as changed, plus any limitations in the audit.

## Assumptions
- The audit output file is `docs/theme-token-audit.md`.
- The audit covers all SCSS under `src/`, not only `src/common/scss/`.
- This first step produces documentation only; it does not add or migrate theme tokens.
- Counts may be approximate if grouped manually, but file paths and examples must be concrete and searchable.
