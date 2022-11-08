# Style guide

The purpose of this style guide is not only to keep the code style, file naming,
and structure consistent, but also to make it easier to search through the
source for the code you are looking for.

The rules may not be anyone's preference, but it is better to have a consistent
style rather than having a preferred style.

> **Note**
>
> While not all legacy code follows these rules yet, new code should follow
> them.

## Code formatting

### ESLint
All javascript code should follow the rules specified in the
[.eslintrc](../.eslintrc) file.  
To make it easier, install [ESLint](https://eslint.org/)  support for your IDE
of choice.

### EditorConfig
All text files (.js, .md, .json, etc.) should follow the rules specified in the
[.editorconfig](../.editorconfig) file.  
To make it easier, install [EditorConfig](https://editorconfig.org/) support for
your IDE of choice.

## Code rules

### Const vs let

* Use `const` for constants declared in a file's global scope.
* Use `let` for variables declared inside functions, or methods, even if the
intial value will never be changed.

```javascript
// Const used to declare a static LocaleString outside of the class.
const txtHelloWorld = l10n.l('example.helloWorld', "Hello, world!");
// Variable declared inside a method or function.
let sum = 0;
```

### Quotes vs apostrophes vs backticks for string literals

* Use quote (`"Hello"`) for strings that will be rendered.
* Use apostrophe (`'charId'`) for strings that will not be rendered,
  such as fields, properties, or ID keys.
* Use backticks (`` `Joe "Dog" Smith` ``) for strings that contain quotes, or multiple lines.


```javascript
// Quotes used for an error text to be rendered as an error message.
throw new Error("Invalid parameter");
// Apostrophes used for the 'change' event key.
model.on('change', callback);
// Backticks used for text spanning multiple lines.
const helpText =
`<p>Set an area attribute.</p>
<code class="param">Area</code> is the name of an owned area to set.</p>`;
```

### Long vs short variable or property names

* For long scoped variables and properties, use more explainatory names.
* For short scoped variables, single letter names are fine.

```javascript
// Long name used for a class wide property
this.toolCollection = new Collection();
// Single letter name used for an index variable in a small loop
for (let i = 0; i < tools.length; i++) {
	callback(i, tools[i]);
}
```

### Variable naming

* Variables should use `camelCase`.
* Abbreviations, acronyms, or initialisms, should be treated as words and use
  camelCase as well.

```javascript
// Use of camelCase for a variable.
let ownedChars = this.module.player.getChars();
// Abbreviation of ID using lower case.
let id = 'example';
// Abbreviation of ID treated as a word.
let charId = getCharId();
```

### Method naming

* Methods should use the same rules at [variable naming](#variable-naming).
* Internal methods only to be used by the class (private/protected) should be
prefixed with an underscore (`_`).

```javascript
// Underscore prefixing a private method.
_listen(on) { /* ... */ }
```

### Property naming

Properties should use the same rules at [variable naming](#variable-naming).

### Class naming

* Class names should use `PascalCase`.
* Abbreviations, acronyms, or initialisms, should be treated as words and
  use PascalCase as well.

```javascript
// Use of PascalCase for a class name.
class Api { /* ... */ }
// The acronym, UI, is treated as a word.
class NoUiSlider { /* ... */ }
```

### File naming

* Files exporting a single default class should have the same name as the class,
  with a `.js` extension.
* Files exporting a single default function should have the same name as the
  function, with a `.js` extension.
* Files containing SCSS should have a camelCase name with a  `.scss` extension.

Example file | Description
--- | ---
`NoUiSlider.js` | File for the NoUiSlider class.
`formatDate.js` | File for the formatDate function.
`areaMap.scss` | File for the `areaMap` module's scss styles


## Module rules

### Module name

* Module name MUST be unique. Two modules cannot have the same name.
* Module name should use `camelCase`.
* Abbreviations, acronyms, or initialisms, should be treated as words and use
  camelCase as well.
* Modules should have similar naming style as existing modules:
  * Modules rendering a dialog (modal) should being with `dialog`.
  * Modules rendering a panel page should being with `page`.
  * Modules adding help categories should begin with `help`.
  * Modules adding a command should have the same name as the command, if it is
    available.
  * Modules adding a command should be suffixed with `Cmd` if the module name is
    in conflict with another module's name.

Example module name | Description
--- | ---
`dialogCreateChar` | Module opening the _Create Character_ dialog.
`pageChar` | Module rendering the _Char Info_ page.
`helpRules` | Module adding the _Rules_ help category.
`stopFollow` | Module adding the `stop follow` command.
`muteCmd` | Module adding the `mute` command, but is in naming conflicts with the _mute_ module.

### Module bundles

Modules MUST be put in a subfolder under the folder matching the bundle it
belongs to:

Module bundle folder | Bundle description
--- | ---
`modules/init/` | Modules loaded initially to allow login.
`modules/main/` | Modules loading for all users.
`modules/assistant/` | Modules loading for _builders_, _moderators_, _admins_, and _overseers_.
`modules/builder/` | Modules loading for _builders_, _admins_, and _overseers_.
`modules/moderator/` | Modules loading for _moderators_, _admins_, and _overseers_.
`modules/helper/` | Modules loading for _helpers_, _admins_, and _overseers_.
`modules/admin/` | Modules loading for _admins_ and _overseers_.
`modules/poioneer/` | Modules loading for _pioneers_ and _overseers_.
`modules/overseer/` | Modules loading for _overseers_.

### Module file structure
* Module folder MUST have the same name as the module.
* Module file MUST be the module name in `PascalCase` with the `.js` extension.
* All files belonging to the module should be in the same folder as the module
  file.
* All files belonging to the module should be prefixed with, or have the same
  name as the module, following the [file naming](#file-naming) rules.
* Module classes should only contain one class per file, named accordingly.
* Module folders should be grouped with similar modules (eg. dialogs, commands,
  pages, etc.)
* Main component of a module (if applicable) should have the same name as the
  module, but with `Component` suffixed to the name.
* Module style file should have the module name with the `.scss` extension.
* Modules should only have one style file, and it should be imported from the
  module file.

Example file | Description
--- | ---
`api/Api.js` | Module file for the `api` modul inside a folder with the module's name.
`main/dialogs/dialogCreateChar/DialogCreateChar.js` | Module is grouped with other dialogs in the `dialogs/` folder.
`moderator/moderatorCommands/suspend/Suspend.js` | Module for the `suspend` command is put under the `modules/moderator` folder.
`init/login/LoginComponent.js` | Main component of the _login_ module has `Component` added to the file name.
`init/login/login.scss` | Style file for all components in the _login_ module.


## SCSS style rules

* Sass is used for all module styles.
* HTML classes are used to style components.
* HTML class names should be all lowercase.
* HTML class names should be prefixed with the module name in lowercase (see
  above).
* HTML class names for subcomponents (excluding the main component) should be
  added to the module name separated with a single dash (`-`). It should match
  the file name.
* HTML class names for internal elements of a component should be added to the
  name separated with a double dash (`--`).
* Module components should NOT use class names belonging to other modules.

Example class name | Description
--- | ---
`login` | HTML class name for the `LoginComponent.js` component. It has no suffix as it is the main component of the `login` module.
`login-register` | HTML class name for the `LoginRegister.js` component which is a subcomponent to the `login` module.
`login-register--agree` | HTML class name for an internal element of the `LoginRegister.js` component.
`dialogcreatechar--disclaimer` | HTML class name for an internal element of the `DialogCreateChar.js` module component.

> **Tip**
>
> Because of the HTML class naming rules, it is easy to inspect the DOM of the
> web application to see which module renders a certain element, using only
> class names as reference

## JS Doc

For code documentation, [JSDoc3](https://jsdoc.app/) syntax is used.

### Modules
* Module classes should have JSDoc comments describing what the module does.
* Module class constructor does NOT require any comment.
* Public module methods (methods not prefixed with `_`) should have JSDoc
  comments unless their use is obvious.

```javascript
/**
 * CharPing periodically sends a ping for all controlled characters
 * to ensure they are not released out of inactivity.
 */
class CharPing { /* ... */ }
```

### Non-module classes
* Classes should have JSDoc comments describing what the class does.
* Class constructur and public methods (methods not prefixed with `_`) should
  have JSDoc comments unless their use is obvious.

### Utils
* Exported helper functions under `src/common/utils` should have JSDoc comments.


## Localization

To prepare for future multi-language support, all texts in the source code meant
to be rendered in the UI should be wrapped using the `l10n` package:

* LocaleString key should be prefixed with the name of the module, followed by a
  dot.
* LocaleString key should be suffixed with a short explainatory name following
  the [variable naming](#variable-naming) rules.

```javascript
// The "Wake up" LocaleString defined in the pageCharSelect module.
l10n.l('pageCharSelect.wakeUp', "Wake up")
```


## Common patterns

When applicable, follow the existing conventions and patterns. The sections
below describes the most common ones.

### Module app reference

* Always store the app reference passed to the module constructor in `this.app`.

```javascript
constructor(app, params) {
	this.app = app;
	/* ... */
}
```

### Module dependencies

* Use `this._init` as callback method when requiring dependencies.
* Put `this._init` method directly below the constructor.
* Put dependencies on separate lines.
* Store module dependencies in `this.module` (no plural s).
* Add `self` as a reference to `this`.

```javascript
constructor(app, params) {
	this.app = app;
	/* ... */
	this.app.require([
		'api', // Dependencies on separate lines
	], this._init.bind(this));
}

_init(module) {
	this.module = Object.assign({ self: this }, module);
	/* ... */
}
```

### Exposed module subclasses

If a module ("host module") has a component or other class that other modules
("client modules") may create instances of, the following rules apply:

* Classes should only be exposed through modules if it has dependencies of other
  modules.
* Classes without dependencies of other modules should instead be put as a
  shared class under `common/components/` or `common/classes`.
* Class instances should be created through a public module method:
  * The method should be prefixed with `new` followed by the name of the class,
    but without the module name.
* Module dependencies should by provided by the host module.
* Modules should NOT directly import class files of other modules.

```javascript
// In the pageArea module, PageArea.js, a method prefixed with
// new is used to create an instance of PageAreaBadge.
newBadge(ctrl, area, opt) {
	return new PageAreaBadge(this.module, ctrl, area, opt);
}
```

### Module hooks

When creating "hooks" which allows other modules to register/unregister
themselves from the module, the following rules apply:

* If multiple modules can hook up, use two methods prefixed `add` and `remove`
  to allow registering/unregistering.
	* The `add` method should take an object with at least the properties:
		* `id` - ID string identifying the item being added.
		* `sortOrder` - Numeric sort order value. Only needed if order matters.
	* The `remove` method should take the ID string value as argument.
	* Other modules adding themselves should call remove in their `dispose`
	method.
	* Optionally, a method prefixed `get` should return a collection of registered
	items.
* If a single module can hook up, use two methods prefixed `set` and `get` to allow
  registering, and checking what is currently registered.

**Example from [PageCharSettings.js](../src/client/modules/main/pages/pageCharSettings/PageCharSettings.js)**
```javascript
/**
 * Gets a collection of tools.
 * @returns {Collection} Collection of tools.
 */
getTools() {
	return this.tools;
}

/**
 * Registers a settings component tool.
 * @param {object} tool Tool object
 * @param {string} tool.id Tool ID.
 * @param {number} tool.sortOrder Sort order.
 * @param {function} tool.componentFactory Tool component factory: function(char, charSettings, state) -> Component
 * @param {string} [tool.type] Target type. May be 'preference' or 'section'. Defaults to 'preference';
 * @param {number} [tool.className] Class to give to the list item container.
 * @returns {this}
 */
addTool(tool) {
	if (this.tools.get(tool.id)) {
		throw new Error("Tool ID already registered: ", tool.id);
	}
	this.tools.add(tool);
	return this;
}

/**
 * Unregisters a previously registered tool.
 * @param {string} toolId Tool ID.
 * @returns {this}
 */
removeTool(toolId) {
	this.tools.remove(toolId);
	return this;
}
```


**Example from [Screen.js](../src/common/modules/screen/Screen.js)**
```javascript
/**
 * Get current component.
 * @returns {Component} Current component.
 */
getComponent() {
	return this.component;
}

/**
 * Set component.
 * @param {Component?} component Component to set.
 * @returns {this}
 */
setComponent(component) {
	this.component = component || null;
	this.fader.setComponent(component);
	return this;
}
```
