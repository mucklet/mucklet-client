# Understanding modules

Mucklet Client is structured into what we call _modules_, using
[modapp](https://github.com/jirenius/modapp).

* A module has a name, such as `api`, `login`, `pageChar`, `dialogCreateChar`.
* A module is a single class instance.
* A module can depend on other modules.
* A module can be activated (or loaded) and deactivated in runtime.
* A module should have a distinct function, such as adding a command, rendering a menu, or showing a dialog.

## Quick example

To create a very simple module that only logs the server's API version to the
browser console, create the file:

`mucklet-client/src/client/modules/main/addon/apiVersion/ApiVersion.js`

```javascript
// Module class for our apiVersion module
class ApiVersion {
	constructor(app, params) {
		app.require([ 'api' ], this._init.bind(this));
	}
	_init(module) {
		module.api.get('core.info').then(info => console.log("API Version: ", info.version))
	}
}
export default ApiVersion;
```

Once created, Webpack will automatically find the module and include it as part
of the _main_  module bundle (loaded for all users).  
Reload the client (unless webpack dev server already has done so) and notice how
the API version is now logged to the browsers Developer console.

> **Tip**
>
> See [Style Guide - Module bundles](./style-guide.md#module-bundles) for an
> explanation on the available module bundles.

## App instance

All modules instances are created and managed by a single modapp App instance.

The `app` instance is passed on to each module constructor as the first parameter. This `app` instance is then used to tell what other modules are required by the module. Once the required modules have loaded, they will be passed back to the module in a callback usually named `_init`:

```javascript
class Example {
	constructor(app) {
		this.app = app;  // The app instance should be stored in this.app
		this.app.require([
			'api', // This example module requires the 'api' module.
		], this._init.bind(this));
	}

	_init(module) {
		// The callback gets an object: { api: <Api module instance> }
		this.module = module; // The modules should be stored in this.module
	}
}
```

### App global scope

The app instance is also stored in the global/window scope, and can be accessed
from the browser console:

```javascript
// Get a module instance
app.getModule('api').get('core.info').then(info => console.log(info.version));
// Deactivate/disable a module
app.deactivate('pageMail');
// Activate/enable a module
app.deactivate('pageMail');
```

## Parameters

A module may take external parameters as configuration.
These are passed on to the module constructor as the second parameter:
```javascript
class Example {
	constructor(app, params) {
		this.params = Object.assign({
			greeting: 'Hello',
		}, params);
		/* ... */
	}
	/* ... */
}
```

The configuration either comes from:
* The module configuration file (Found at `cfg/client/module.config.*` for the client)
* URL parameters: `http://localhost:6450/?example.greeting=Hejsan`

## Requiring

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


## Disposing

When a module is deactivated, its `dispose` method will be called, if it exists.
This allows a module to remove any event listener, callback or item it has
previously registered.

```javascript
class ResizeLogger {
	constructor(app, params) {
		this._onResize = e => console.log(e.target.outerWidth, e.target.outerHeight);
		window.addEventListener('resize', this._onResize);
	}

	dispose() {
		window.removeEventListener('resize', this._onResize);
	}
}
export default ResizeLogger;
```

## Reversed dependency structure

Modules should, as far as possible, use a reversed dependency structure.

As an example, lets look at the module that holds options for the player's tab menu: `playerTabs`  
And we have one module for each tab option: `pageCharSelect`, `pageWatch`, `pageMail`, etc.

    playerTabs                     # Holds all player tab options
    ├─> pageCharSelect             # Renders the Character Select page
    ├─> pageWatch                  # Renders the Watch page
    ├─> ...
    └─> pageMail                   # Renders the Mail Inbox page

The "higher" module, `playerTabs`, is unaware of the "lower" modules (`page*`).
PlayerTabs only provides ways for the other modules to _add_ and _remove_
themselves from the menu. The "lower" modules (`page*`) all require
`playerTabs`.

> **Tip**
>
> See [Style Guide - Module hooks](./style-guide.md#module-hooks) as a reference
> on how to implement such "hooks", allowing other modules to add/remove
> themselves.
