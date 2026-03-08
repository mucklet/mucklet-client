## Scope
- Document markdown files lives under `docs/`.
- Source code and static files lives under `src/`.

## Workflow
- Keep changes small and localized.
- Always ask before adding a third party dependency.
- Avoid new third party dependencies if possible.

## Terminology
- component - an object that renders a graphical component onto the DOM. For more info, see `docs/understanding-components.md`
- collection - an array like object that may be listened to for add or remove. For more info, see `docs/understanding-events.md#collections`
- model - an key/value object that may be listened to for change. For more info, see `docs/understanding-events.md#models`
- resource - either a collection or a model fetched over the API. For more info on the API, see: `docs/understanding-api.md`
- module - a distinct feature or functionality residing in a single folder.

## Structure
- `src/common/classes/` contains helper classes
- `src/common/components/` contains standalone components
- `src/common/modules/` contains modules used by multiple endpoints
- `src/common/policies/` contains policy HTML files. Never edit these.
- `src/common/scss/` contains global css styles
- `src/common/static/` contains static files copied to the root folder for both the client and hub app.
- `src/common/types/` contains Typescript types
- `src/common/utils/` contains helper functions
- `src/common/workers/` contains service worker javascript
- For more info, see `docs/understanding-folders.md`

## Coding guidelines
- Follow the existing framework and component patterns.
- Keep styling consistent with current UI conventions.
- Respect the project package manager and lockfiles.
- When working with _modules_, always follow the guidelines in `docs/understanding-modules.md`
- Follow the guidelines in `docs/style-guide.md`
