# Understanding folder structure

A general overview of the folders:

    .
    ├── build                   # Compiled files (not in repository)
	├── cfg                     # Configuration files
    │   ├── client              # Client configuration
    │   └── hub                 # Hub configuration
    ├── docs                    # Documentation files
    └── src                     # Source files
        ├── client              # Client application
        │   ├── error           # Error landing page
        │   ├── modules         # See: Module bundles
        │   ├── static          # Static files copied to root
        │   └── welcome         # Welcome landing page
        ├── common              # Common files shared between client and hub
        │   ├── classes         # See: Common classes
        │   ├── components      # See: Common classes
        │   ├── modules         # Shared modules
        │   ├── policies        # Privacy and Term of Service policies
        │   ├── scss            # See Shared styles
        │   ├── static          # Shared static files copied to root
        │   └── utils           # See Helper utils
        └── hub                 # Mucklet.com hub application

## Module bundles
Folder: `src/client/modules`

Modules put in a subfolder under any of the following modules folders will be
automatically found by Webpack and included in that particular bundle:

Module bundle folder | Bundle description
--- | ---
`modules/init/` | Modules loaded initially to allow login.
`modules/main/` | Modules loading for all users.
`modules/assistant/` | Modules loading for _admins_, _builders_, and _moderators_.
`modules/builder/` | Modules loading for _builders_, _admins_, and _overseers_.
`modules/moderator/` | Modules loading for _moderators_, _admins_, and _overseers_.
`modules/helper/` | Modules loading for _helpers_, _admins_, and _overseers_.
`modules/admin/` | Modules loading for _admins_ and _overseers_.
`modules/poioneer/` | Modules loading for _pioneers_ and _overseers_.
`modules/overseer/` | Modules loading for _overseers_.

Shared modules put under `src/common/modules` need to be manually included into
a bundle by editing the appropriate bundle file:

    src/client/modules/XXX-modules.js
	src/hub/modules/XXX-modules.js

> **Tip**
>
> See [init-modules.js](../src/client/modules/init-modules.js) as reference.


## Common classes
Folder: `src/common/classes`

Common classes are non-component classes that does not have any module
dependencies, and might be used by multiple modules.

The class may in itself render a component (like the
[Dialog.js](../src/common/classes/Dialog.js) class does), but is still
considered a non-component class if it doesn't implement the component interface
in itself.

## Component classes
Folder: `src/common/components`

Component classes that does not have any module dependencies should be placed
in this folder. If the component has a style .scss file, it should be have the
same name as the component class, but in pascalCase.

## Shared styles
Folder: `src/common/scss`

Styles that are general for the entire application may be put here. These styles
are globally imported, and should NOT be imported again by any modules or
components, as it will create duplicate css.

The only file that may be imported from scss in modules or components are the
_variables_:
```scss
@import '~scss/variables';
```

## Helper utils
Folder: `src/common/utils`

Helper functions that does not have any module dependencies should be placed in
this folder.

