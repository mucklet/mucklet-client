import { Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageEditLfrpComponent from './PageEditLfrpComponent';
import './pageEditLfrp.scss';

/**
 * PageEditLfrp opens an in-panel edit char page in the char panel.
 */
class PageEditLfrp {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'charPages',
			'pageChar',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.module.pageChar.addTool({
			id: 'editLfrp',
			sortOrder: 30,
			componentFactory: (ctrl, char) => new ModelComponent(
				ctrl,
				new Elem(n => n.elem('button', { className: 'pageeditlfrp-btn iconbtn small', events: {
					click: () => this.open(ctrl),
				}}, [
					n.component(new FAIcon('icosahedron')),
					n.elem('lfrp', 'div', { className: 'counter small highlight' }),
				])),
				(m, c) => c[m.rp == 'lfrp' ? 'removeNodeClass' : 'addNodeClass']('lfrp', 'hide'),
			),
			filter: (ctrl, char) => ctrl.id == char.id,
		});
	}

	/**
	 * Opens an in-panel edit char page in the char panel.
	 * @param {*} ctrl Controlled char model.
	 * @returns {function} Close function.
	 */
	open(ctrl) {
		let settings = (ctrl.puppeteer
			? this.module.player.getPuppet(ctrl.id, ctrl.puppeteer.id)
			: this.module.player.getOwnedChar(ctrl.id)
		)?.settings;

		if (!settings) {
			console.error("Failed to get settings for controled char: ", ctrl);
			return;
		}

		return this.module.charPages.openPage(
			ctrl.id,
			ctrl.id,
			(ctrl, char, state, close) => ({
				component: new PageEditLfrpComponent(this.module, ctrl, settings, state, close),
				title: l10n.l('pageEditLfrp.editLfrp', "Looking for roleplay"),
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
		this.module.pageChar.removeTool('editLfrp');
	}
}

export default PageEditLfrp;
