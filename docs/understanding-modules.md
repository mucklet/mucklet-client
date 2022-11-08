# Understanding modules

Mucklet Client is structured into what we call _modules_, using
[modapp](https://github.com/jirenius/modapp).

* A module has a name, such as `api`, `login`, `pageChar`, `dialogCreateChar`.
* A module is a single class instance.
* A module can depend on other modules.
* A module can be activated (or loaded) and deactivated in runtime.
* A module should have a distinct function, such as adding a command, rendering a menu, or showing a dialog.

## Quick example

To create a very simple module that only logs the API version to the browser, create the file:

`mucklet-client/src/client/modules/main/addon/apiVersion/ApiVersion.js`

```javascript
// Module class for our apiVerion module
class ApiVersion {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.api.get('core.info').then(info => console.log("API Version: ", info.version))
	}
}

export default ApiVersion;
```

Once created, Webpack will automatically find the module and include it as part
of the _main_  module bundle (loaded for all users).  
Reload the client (unless webpack dev server already has done so) and notice how
the API version is now logged to the browsers Developer console.

## Reversed dependency structure

Modules should, as far as possible, use a reversed dependency structure.

Let's say we have a module that holds options for a tab menu: `playerTabs`
And we have one module for each tab option: `pageCharSelect`, `pageWatch`, `pageMail`, etc.

    playerTabs                     # Holds all player tab options
    ├─> pageCharSelect             # Renders the Character Select page
    ├─> pageWatch                  # Renders the Watch page
    ├─> ...
    └─> pageMail                   # Renders the Mail Inbox page

The "higher" module, `playerTabs`, should NOT depend on the "lower" modules
(`page*`). Instead, the "higher" module should provide a way for the other
modules to _add_ and _remove_ themselves from the menu.

> **Tip**
>
> The common way of implementing these sort of "hooks" is by using a Collection,
> and to have an _add_ and _remove_ method.
>
> See
> [PlayerTabs.js](../src/client/modules/main/layout/playerTabs/PlayerTabs.js)
> for the `this.tabs` collection storing the tabs, and `addTab` / `removeTab`
> methods used by other modules.

## Parameters

From file or URL.

## Exposing subclasses

If a module has a component or other class that other modules may create
instances of, other modules should NOT import these classes directly.

Instead, the "host" module should expose these subclasses through methods.

> **Tip**
>
> See the `pageArea` module
> ([PageArea.js](../src/client/modules/main/pages/pageArea/PageArea.js)) for
> reference. It exposes the  [PageAreaBadge.js](../src/client/modules/main/pages/pageArea/PageAreaBadge.js) component through its _newBadge_ method:
> ```javascript
> newBadge(ctrl, area, opt) {
>		return new PageAreaBadge(this.module, ctrl, area, opt);
> }
> ```


