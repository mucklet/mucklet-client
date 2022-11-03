# Style guide

The purpose of this style guide not only to keep the code style and file naming
and structure consistent, but also to make it easier to search through the
source for the code you are looking for.

The rules may not be anyone's preference, but is better to have common
formatting than having preferred formatting.

> **Note**
>
> While not all legacy code follows these rules yet, new code should follow the
> rules of this guide.

## Code formatting
An [ESLint](https://eslint.org/) file, [.eslint.rc](../.eslintrc), is included
in the project. All javascript code should follow the rules specified in this
file. To make it easier, install ESLint support for your IDE of choice.

## Code rules

### Const vs let

* Use `const` for constants declared in a file's global scope.
* Use `let` for variables and properties declared inside classes, functions, or
methods, even if the intial value will never be changed.

```javascript
// Const used to declare a static LocaleString outside of the class.
const txtHelloWorld = l10n.l('example.helloWorld', "Hello, world!");
// Variable declared inside a method of function.
let sum = 0;
```

### Quote vs apostrophes vs backticks for string literals

* Use quote (`"Hello"`) for strings that will be rendered.
* Use apostrophe (`'charId'`) for strings that will not be rendered,
  such as fields, properties, or ID keys.
* Use backticks (`` `Joe "Dog" Smith` ``) for strings that contain quotes, or multiple lines.


```javascript
// Quotes used for an error text to be rendered as an error message.
throw new Error("Invalid parameter");
// Apostrophes used for the event key.
model.on('change', callback);
// Backticks used for multi lined text.
const helpText =
`<p>Set an area attribute.</p>
<code class="param">Area</code> is the name of an owned area to set.</p>`;
```

### Long vs short variable or property names

* The bigger the scope, the more explainatory the name of the variable or property.
* For short scoped variables, single letter names are fine.

```javascript
// Long name used for class wide property
this.toolCollection = new Collection();
// Single letter name used for small loop
for (let i = 0; i < tools.length; i++) {
	callback(i, tools[i]);
}
```

### Variable naming

* Variables should use `camelCase`.
* Abbreviations at the beginning of a variable name should be lower case.
* Abbreviations not at the beginning of a variable name should pascal cased.

```javascript
// Use of camelCase for a variable.
let camelCase = "My variable";
// Abbreviation of ID using lower case.
let id = 'example';
// Abbreviation of ID using pascal case.
let charId = getCarId();
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
* Abbreviations within a class should be pascal cased.

Example file | Description
--- | ---
`Api.js` | File for the Api class
`NoUiSlider.js` | The abbreviation for UI is written in pascal case.


### File naming

* Files exporting a single default class should have the same name as the class, with a `.js` extension.
* Files containing SCSS should have a pascalCase name with a  `.scss` extension.


## Module rules

### Module name

* Module name MUST be unique. Two modules cannot have the same name.
* Module name should use `camelCase`.
* Abbreviations at the beginning of a module name should be lower case.
* Abbreviations not at the beginning of a module name should pascal cased.
* Modules should have similar naming style as existing modules:
  * Modules rendering a dialog (modal) should being with `dialog`.
  * Modules rendering a panel page should being with `page`.
  * Modules adding help categories should begin with `help`.
  * Command modules should have the same name as the command, it not in conflict.
  * Command modules should be suffixed with `Cmd` if the module name is in conflict with another module.

Example module name | Description
--- | ---
`dialogCreateChar` | Module opening the _Create Character_.
`pageChar` | Module rendering the _Char Info_ page.
`helpRules` | Module adding the _Rules_ help category.
`stopFollow` | Module that adds the `stop follow` command.
`muteCmd` | Module that adds the `mute` command, but name conflicts with the _mute_ module.

### Module bundles

Modules MUST be put in a subfolder under the folder matching the bundle it belongs to:

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


### Module file structure
* Module folder MUST have the same name as the module.
* Module file MUST be the module name but in `PascalCase`, with the `.js`
  extension.
* All files belonging to the module should be in the same folder as the module file.
* All files belonging to the module should be prefixed with the module name:
  * Module classes (such as components) should be prefixed with PascalCase module name.
* Module classes should only contain one class per file, named accordingly.
* Module folders should be grouped with similar modules (eg. dialogs, commands, pages, etc.)
* Main component of a module (if applicable) should have the same name as the module, but with `Component` added to the name.

Example file | Description
--- | ---
`api/Api.js` | Module file for the `api` modul inside a folder with the module's name.
`main/dialogs/dialogCreateChar/DialogCreateChar.js` | Module is grouped with other dialogs in the `dialogs/` folder.
`moderator/moderatorCommands/suspend/Suspend.js` | Module for the `suspend` command is put under the `modules/moderator` folder.
`init/login/LoginComponent.js` | Main component of the _login_ module has `Component` added to the file name.


## SCSS style rules

* Sass is used for all module styles.
* Classes is used to styling components.
* Class names should be all lower case (includes lowercasing module name)
* Class names should be prefixed with the module name (lower case, as stated above).
* Class names for subcomponents (excluding the main component) should be added to the module name separated with a single dash. It should match the file name.
* Class names for internal elements of a component should be added to the name separated with a double dash.

Example class name | Description
--- | ---
`login` | Class name for the `LoginComponent.js` component. It has no suffix as it is the main component of the `login` module.
`login-register` | Class name for the `LoginRegister.js` component which is a subcomponent to the `login` module.
`login-register--agree` | Class name for an internal element of the `LoginRegister.js` component.
`dialogcreatechar--disclaimer` | Class name for an internal element of the `DialogCreateChar.js` module component.

> **Tip**
>
> Because of the class naming rules, it is easy to inspect the DOM of the web
> application to see, using only class names, which module renders a certain
> element.
