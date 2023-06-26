import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import HubLayoutComponent from './HubLayoutComponent';
import HubLayoutMenuItem from './HubLayoutMenuItem';
import HubLayoutCounterMarker from './HubLayoutCounterMarker';
import './hubLayout.scss';

/**
 * HubLayout displays the main layout screen once we are logged in.
 */
class HubLayout {

	constructor(app, params) {
		this.app = app;
		this.route = params.route || null;
		this.delayCount = 0;

		// Bind callbacks
		this._onAuthChange = this._onAuthChange.bind(this);

		this.app.require([
			'auth',
			'router',
			'screen',
			'playerTools',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.authModel = this.module.auth.getModel();
		this.model = new Model({ data: { menuOpen: false }, eventBus: this.app.eventBus });
		this.component = null;
		this._setListener(true);
		this._onAuthChange();
	}

	/**
	 * Toggles the menu between open and close in mobile view.
	 * @param {boolean} [open] Optional state to toggle to. Defaults to toggle to the opposite state.
	 * @returns {this}
	 */
	toggleMenu(open) {
		open = typeof open == 'undefined' ? !this.model.menuOpen : !!open;
		this.model.set({ menuOpen: open });
		return this;
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a layout tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function() -> Component
	 * @param {number} [tool.filter] Filter function: function() -> bool
	 * @param {string} [tool.type] Target type. May be 'header' or 'footer'. Defaults to 'header';
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.add(tool);

		this._trySetComponent();
		return this;
	}

	addDelay(delta) {
		delta = typeof delta == 'undefined' ? 1 : Number(delta);
		this.delayCount += delta;
		this._trySetComponent();
		return this;
	}

	removeDelay(delta) {
		delta = typeof delta == 'undefined' ? 1 : Number(delta);
		return this.addDelay(-delta);
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

	/**
	 * Creates a new HubLayoutMenuItem component to use as a menuComponent.
	 * @param {object} route Route object
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.itemId] Item id. Defaults to: 'menuitem-' + route.id
	 * @param {function} [opt.onClick] Callback called when menu item is clicked: function(route)
	 * @param {Component} [opt.markerComponent] Component that is added as a marker to the right side of the menu item.
	 * @returns {Component} Menu item component.
	 */
	newMenuItem(route, opt) {
		return new HubLayoutMenuItem(this.module, route, opt);
	}

	/**
	 * Creates a new HubLayoutCounterMarker component to use as markerComponent
	 * for the menu item.
	 * @param {Model} model Context model.
	 * @param {function} countCallback Callback that returns the count: function(model) -> Number
	 * @param {object} [opt] Optional parameters
	 * @param {function} [opt.tagClassNameCallback] Callback that returns a classname (eg. 'warn') to use for the marker tag: function(model) -> string
	 * @returns {Component} Counter marker component.
	 */
	newCounterMarker(model, countCallback, opt) {
		return new HubLayoutCounterMarker(model, countCallback, opt);
	}

	_setListener(on) {
		if (on) {
			this.authModel.on('change', this._onAuthChange);
		} else {
			this.authModel.off('change', this._onAuthChange);
		}
	}

	_onAuthChange() {
		this._trySetComponent();
	}

	_trySetComponent() {
		if (this.authModel.loggedIn && this.delayCount == 0 && !this.component) {
			this.component = new HubLayoutComponent(this.module, this.model, this.authModel.user);
			this.module.screen.setComponent(this.component);
		}
	}

	dispose() {
		this._setListener(false);
		if (this.component) {
			if (this.module.screen.getComponent() === this.component) {
				this.module.screen.setComponent(null);
			}
			this.component = null;
		}
	}
}

export default HubLayout;
