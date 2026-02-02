import { Collection } from 'modapp-resource';
import compareSortOrderId from 'utils/compareSortOrderId';
import EditRealmTagsComponent from './EditRealmTagsComponent';
import './editRealmTags.scss';

/**
 * EditRealmTags adds the Tags-section to RouteRealmSettings.
 */
class EditRealmTags {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'routeRealmSettings',
			'toaster',
			'api',
			'confirm',
			'hubInfo',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		this.module.routeRealmSettings.addTool({
			id: 'editRealmTags',
			type: 'section',
			sortOrder: 10,
			componentFactory: (realm, state) => new EditRealmTagsComponent(this.module, realm, state),
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
	 * Registers a realm tags tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {(realm: Model, state: Record<string,any>) => Component} tool.componentFactory Tool component factory
	 * @param {string} [tool.type] Target type. May be 'title'. Defaults to 'title';
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
		this.module.routeRealmSettings.removeTool('editRealmTags');
	}
}

export default EditRealmTags;
