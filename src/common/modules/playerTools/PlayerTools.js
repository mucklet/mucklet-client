import { Collection } from 'modapp-resource';
import compareSortOrderId from 'utils/compareSortOrderId';


/**
 * PlayerTools registered the tools for the player panels.
 */
class PlayerTools {
	constructor(app, params) {
		this.app = app;

		this._init();
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		this.footerTools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
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
	 * Registers a tool shown in kebab menu.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {LocaleString|string} tool.name Tool name.
	 * @param {string} tool.icon Tool icon.
	 * @param {function} tool.componentFactory Component factory function: function(click) => Component
	 * @param {function} tool.onClick Callback called on click.
	 * @param {number} tool.sortOrder Sort order.
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Footer tool ID already registered: ", tool.id);
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

	/**
	 * Gets a collection of footer tools.
	 * @returns {Collection} Collection of tools.
	 */
	getFooterTools() {
		return this.footerTools;
	}

	/**
	 * Registers a footer tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function() -> Component
	 * @param {number} [tool.filter] Filter function: function() -> bool
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addFooterTool(tool) {
		if (this.footerTools.get(tool.id)) {
			throw new Error("Footer tool ID already registered: ", tool.id);
		}
		this.footerTools.add(tool);
		return this;
	}

	/**
	 * Unregisters a previously registered footer tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeFooterTool(toolId) {
		this.footerTools.remove(toolId);
		return this;
	}
}

export default PlayerTools;
