import { Collection, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PageCharSettingsComponent from './PageCharSettingsComponent';
import './pageCharSettings.scss';

/**
 * PageCharSettings draws player panel.
 */
class PageCharSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'playerTabs',
			'confirm',
			'dialogDeleteChar',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.charPages = {};

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
	 * @param {function} tool.componentFactory Tool component factory: function(char, charSettings, state) -> Component
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
	 * Opens an in-panel char settings page in the player panel.
	 * @param {Model} char Char to edit settings for.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(char) {
		if (this.charPages[char.id]) {
			throw new Error("Char settings page already open");
		}

		let d = {};
		this.charPages[char.id] = d;

		let close = this.module.playerTabs.openTabPage(
			'charSelect',
			'charSettings_' + char.id,
			(state, close) => ({
				component: new PageCharSettingsComponent(this.module, char, char.settings, state, close),
				title: l10n.l('pageCharSettings.characterSettings', "Character Settings"),
			}),
			{
				onClose: () => this._onClose(char),
			},
		);

		d.close = close;

		return close;
	}

	/**
	 * Closes an in-panel char settings page.
	 * @param {string} charId Char ID.
	 */
	close(charId) {
		let d = this.charPages[charId];
		if (d) {
			d.close();
		}
	}

	_onClose(char) {
		let d = this.charPages[char.id];
		if (d) {
			delete this.charPages[char.id];
		}
	}
}

export default PageCharSettings;
