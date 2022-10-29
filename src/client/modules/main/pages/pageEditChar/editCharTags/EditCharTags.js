import { Collection, sortOrderCompare } from 'modapp-resource';
import EditCharTagsComponent from './EditCharTagsComponent';
import './editCharTags.scss';

/**
 * EditCharTags adds the Tags-section to PageEditChar.
 */
class EditCharTags {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'pageEditChar', 'toaster', 'api', 'tags', 'dialogTag', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus
		});

		this.module.pageEditChar.addTool({
			id: 'editCharTags',
			sortOrder: 10,
			componentFactory: (ctrl, state) => new EditCharTagsComponent(this.module, ctrl, state)
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
	 * Registers a tags tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(ctrl, state) -> Component
	 * @param {number} [tool.filter] Filter function: function(ctrl) -> bool
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
		this.module.pageEditChar.removeTool('editCharTags');
	}
}

export default EditCharTags;
