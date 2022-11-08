import { Transition } from 'modapp-base-component';
import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import Panel from 'components/Panel';
import PlayerPanelFooter from './PlayerPanelFooter';
import './playerPanel.scss';

/**
 * PlayerPanel draws player panel.
 */
class PlayerPanel {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onPlayerTabsChange = this._onPlayerTabsChange.bind(this);
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([
			'layoutDesktop',
			'playerTabs',
			'playerTools',
			'api',
			'player',
			'confirm',
			'login',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.footerTools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.model = new Model({
			data: Object.assign({ pageInfo: null }, this.module.playerTabs.getModel().props),
			eventBus: this.module.self.app.eventBus,
		});

		this.tabPage = new Transition({ className: 'playerpanel--tabpage' });
		this.component = new Panel("", null, {
			align: 'left',
			instant: true,
			className: 'playerpanel',
			footerComponent: new PlayerPanelFooter(this.module),
			subheaderComponent: this.module.playerTabs.newTabs({ closeOnReselect: true, hideDefaultTab: true }),
			btnClass: 'light',
		});

		this._setListeners(true);
		this._onPlayerTabsChange();
		this._onModelChange();

		this.module.layoutDesktop.setNode('playerPanel', this.component);
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

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.module.playerTabs.getModel()[cb]('change', this._onPlayerTabsChange);
		this.model[cb]('change', this._onModelChange);
	}

	_onPlayerTabsChange(change) {
		let m = this.module.playerTabs.getModel();
		if (!change || change.hasOwnProperty('factory') || (change.hasOwnProperty('defaultTab') && !m.tabId)) {
			let m = this.module.playerTabs.getModel();
			let factory = m.factory || this.module.playerTabs.getDefaultTabFactory();
			this.model.set(Object.assign({
				pageInfo: factory
					? factory('desktop')
					: null,
			}, m.props));
		}
	}

	_onModelChange(change) {
		if (change && !change.hasOwnProperty('pageInfo')) {
			return;
		}

		let m = this.model;
		let pi = m.pageInfo;

		if (pi) {
			let dir = 0;
			if (change && change.hasOwnProperty('tabId')) {
				dir = this.module.playerTabs.getTabDirection(change.tabId, m.tabId);
			}
			this.tabPage[dir == 0
				? 'fade'
				: dir > 0
					? 'slideLeft'
					: 'slideRight'
			](pi.component);

			this.component
				.setTitle(pi.title || "Unknown title")
				.setButton((m.page && m.page.close) || null, pi.closeIcon || (m.pageIdx > 0
					? 'chevron-circle-left'
					: 'times'
				))
				.setComponent(this.tabPage);
		}
	}

	dispose() {
		this._setListeners(false);
		this.module.layoutDesktop.setNode('playerPanel', null);
	}
}

export default PlayerPanel;
