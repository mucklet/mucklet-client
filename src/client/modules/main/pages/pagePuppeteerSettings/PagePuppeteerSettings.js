import { Collection, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PagePuppeteerSettingsComponent from './PagePuppeteerSettingsComponent';
import './pagePuppeteerSettings.scss';

function getPuppeteerId(puppeteer) {
	return puppeteer.char.id + '_' + puppeteer.puppet.id;
}

/**
 * PagePuppeteerSettings draws player panel.
 */
class PagePuppeteerSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'playerTabs',
			'dialogUnregisterPuppet',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.puppeteerPages = {};

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
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
	 * Registers a settings component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(puppeteer, charSettings, state) -> Component
	 * @param {string} [tool.type] Target type. May be 'preference' or 'section'. Defaults to 'preference';
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

	/**
	 * Opens an in-panel puppeteer settings page in the player panel.
	 * @param {Model} puppeteer Puppeteer model to edit settings for.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(puppeteer) {
		let puppeteerId = getPuppeteerId(puppeteer);
		if (this.puppeteerPages[puppeteerId]) {
			throw new Error("Char settings page already open");
		}

		let d = {};
		this.puppeteerPages[puppeteerId] = d;

		let close = this.module.playerTabs.openTabPage(
			'charSelect',
			'puppeteerSettings_' + puppeteerId,
			(state, close) => ({
				component: new PagePuppeteerSettingsComponent(this.module, puppeteer, puppeteer.settings, state, close),
				title: l10n.l('pagePuppeteerSettings.puppetSettings', "Puppet Settings"),
			}),
			{
				onClose: () => this._onClose(puppeteer),
			},
		);

		d.close = close;

		return close;
	}

	_onClose(puppeteer) {
		let puppeteerId = getPuppeteerId(puppeteer);
		let d = this.puppeteerPages[puppeteerId];
		if (d) {
			delete this.puppeteerPages[puppeteerId];
		}
	}
}

export default PagePuppeteerSettings;
