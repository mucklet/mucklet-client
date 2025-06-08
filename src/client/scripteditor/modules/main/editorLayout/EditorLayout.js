import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import EditorLayoutComponent from './EditorLayoutComponent';
import './editorLayout.scss';

/**
 * EditorLayout displays the main layout screen once we are logged in.
 */
class EditorLayout {

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
			this.component = new EditorLayoutComponent(this.module, this.model, this.authModel.user);
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

export default EditorLayout;
