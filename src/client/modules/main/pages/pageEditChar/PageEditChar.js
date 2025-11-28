import { Elem } from 'modapp-base-component';
import { Collection } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import compareSortOrderId from 'utils/compareSortOrderId';
import PageEditCharComponent from './PageEditCharComponent';
import './pageEditChar.scss';

/**
 * PageEditChar opens an in-panel edit char page in the char panel.
 */
class PageEditChar {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'charPages',
			'dialogCropImage',
			'pageChar',
			'confirm',
			'avatar',
			'toaster',
			'api',
			'tags',
			'player',
			'file',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		this.module.pageChar.addTool({
			id: 'editChar',
			sortOrder: 10,
			componentFactory: (ctrl, char) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl),
			}}, [
				n.component(new FAIcon('pencil')),
			])),
			filter: (ctrl, char) => ctrl.id == char.id && !ctrl.puppeteer,
		});
	}

	/**
	 * Opens an in-panel edit char page in the char panel.
	 * @param {*} ctrl Controlled char model.
	 * @returns {function} Close function.
	 */
	open(ctrl) {
		return this.module.charPages.openPage(
			ctrl.id,
			ctrl.id,
			(ctrl, char, state, close) => ({
				component: new PageEditCharComponent(this.module, ctrl, state, close),
				title: l10n.l('pageEditChar.editChar', "Edit Character"),
				onClose: close,
			}),
		);
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a room page tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(ctrl, state) -> Component
	 * @param {number} [tool.filter] Filter function: function(ctrl) -> bool
	 * @param {string} [tool.type] Target type. May be 'section'. Defaults to 'section';
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
		this.module.pageChar.removeTool('editChar');
	}
}

export default PageEditChar;
