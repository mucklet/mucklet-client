import { Collection, sortOrderCompare } from 'modapp-resource';
import PageCharComponent from './PageCharComponent';
import PageCharSleep from './PageCharSleep';
import './pageChar.scss';

/**
 * PageChar sets the default page in the char panel.
 */
class PageChar {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'charPages', 'player', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.module.charPages.setDefaultPageFactory((ctrl, char, state) => ({
			component: new PageCharComponent(this.module, ctrl, char, state),
			close: char && char.id != ctrl.id
				? () => ctrl.call('look', { charId: ctrl.id })
				: null,
			closeIcon: 'eye-slash',
		}));

		// Add sleep tool
		this.addTool({
			id: 'sleep',
			sortOrder: 1000,
			componentFactory: (ctrl, char) => new PageCharSleep(this.module, ctrl),
			filter: (ctrl, char) => ctrl.id == char.id,
			className: 'pagechar--sleep',
		});
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a char page tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(ctrl, char) -> Component
	 * @param {number} [tool.filter] Filter function: function(ctrl, char) -> bool
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

	dispose() {
		this.module.charPages.setDefaultPageFactory(null);
	}
}

export default PageChar;
