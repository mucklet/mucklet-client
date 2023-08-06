import { Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Collection, Model, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PagePlayerSettingsComponent from './PagePlayerSettingsComponent';
import './pagePlayerSettings.scss';

/**
 * PagePlayerSettings draws player panel.
 */
class PagePlayerSettings {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._updateAlert = this._updateAlert.bind(this);
		this._onClick = this._onClick.bind(this);

		this.app.require([
			'playerTabs',
			'playerTools',
			'auth',
			'player',
			'dialogChangePassword',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { alert: 0 }, eventBus: this.app.eventBus });

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		// Add kebab menu tool
		this.module.playerTools.addTool({
			id: 'playerSettings',
			sortOrder: 10,
			name: l10n.l('pagePlayerSettings.settings', "Settings"),
			icon: 'cog',
			onClick: this._onClick,
		});

		// Add logout tool
		this.module.playerTools.addFooterTool({
			id: 'playerSettings',
			sortOrder: 100,
			componentFactory: () => new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', { className: 'iconbtn medium lighten pageplayersettings--tool-btn', events: {
					click: this._onClick,
				}}, [
					n.component(new FAIcon('cog')),
					n.elem('alert', 'div', { className: 'counter small alert' }),
				])),
				(m, c) => c[m.alert ? 'removeNodeClass' : 'addNodeClass']('alert', 'hide'),
			),
			className: 'pageplayersettings--tool',
		});

		this.closer = null;
	}

	_onClick() {
		if (this.closer) {
			this.closer();
		} else {
			this.open();
		}
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
	 * @param {function} tool.componentFactory Tool component factory: function(user, player, state) -> Component
	 * @param {string} [tool.type] Target type. May be 'preference' 'topSection', or 'section'. Defaults to 'preference';
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @param {Model} [tool.alertModel] Model with an "alert" property. If the alert property resolves to true, an marker will show on settings icon
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.add(tool);
		this._listenTool(tool, true);
		return this;
	}

	/**
	 * Unregisters a previously registered tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeTool(toolId) {
		let tool = this.tools.get(toolId);
		this._listenTool(tool, false);
		this.tools.remove(toolId);
		return this;
	}

	/**
	 * Opens an in-panel player settings page in the player panel.
	 * @returns {function} Close function.
	 */
	open() {
		let player = this.module.player.getPlayer();
		if (!player) return null;

		this.closer = this.module.playerTabs.openPage(
			'playerSettings',
			(state, close, layoutId) => ({
				component: new PagePlayerSettingsComponent(this.module, this.module.auth.getUser(), player, state, close),
				title: l10n.l('pagePlayerSettings.playerSettings', "Player Settings"),
			}),
			{
				onClose: () => this.closer = null,
			},
		);

		return this.closer;
	}

	_listenTool(tool, on) {
		if (!tool.alertModel) return;

		tool.alertModel[on ? 'on' : 'off']('change', this._updateAlert);
		if (on) {
			this._updateAlert();
		}
	}

	_updateAlert() {
		let alert = 0;
		for (let tool of this.tools) {
			let m = tool.alertModel;
			if (m && m.alert) {
				alert++;
			}
		}
		this.model.set({ alert });
	}

	dispose() {
		this.module.playerTools.removeFooterTool('playerSettings');
	}
}

export default PagePlayerSettings;
