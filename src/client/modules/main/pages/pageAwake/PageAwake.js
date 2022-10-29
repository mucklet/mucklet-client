import { Elem } from 'modapp-base-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PageAwakeComponent from './PageAwakeComponent';
import './pageAwake.scss';

/**
 * PageAwake draws player panel.
 */
class PageAwake {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'playerTabs',
			'charsAwake',
			'avatar',
			'dialogEditNote',
			'dialogAboutChar'
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus
		});

		// Add awake tab;
		this.module.playerTabs.addTab({
			id: 'awake',
			sortOrder: 10,
			tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
				click: (c, e) => {
					click();
					e.stopPropagation();
				}
			}}, [
				n.component(new FAIcon('users')),
			])),
			factory: (state, close, layoutId) => ({
				component: new PageAwakeComponent(this.module, state),
				title: l10n.l('pageAwake.awake', "Awake")
			})
		}, true);
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a realm tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function() -> Component
	 * @param {number} [tool.filter] Filter function: function() -> bool
	 * @param {string} [tool.type] Target type. May be 'realm' or 'awake'. Defaults to 'realm';
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
		this.module.playerTabs.removeTab('awake');
	}
}

export default PageAwake;
