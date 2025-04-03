import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';

/**
 * ConsoleModeSettings adds a settings tool for console mode to PagePlayerSettings.
 */
class ConsoleModeSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'settings',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Settings
		this.settingsPromise = this.module.settings.loadSettings('consoleMode', {
			consoleMode: 'auto',
		});

		this.settingsPromise.then(settings => {
			this.module.pagePlayerSettings.addTool({
				id: 'consoleMode',
				sortOrder: 40,
				componentFactory: (user, player, state) => new PanelSection(
					l10n.l('consoleModeSettings.consoleMode', "Console input mode"),
					new CollectionList(
						[
							{ key: 'auto', name: l10n.l('consoleModeSettings.auto', "Auto") },
							{ key: 'touch', name: l10n.l('consoleModeSettings.touch', "Touch") },
							{ key: 'keyboard', name: l10n.l('consoleModeSettings.keyboard', "Keyboard") },
						],
						v => new ModelComponent(
							settings,
							new Elem(n => n.elem('button', {
								events: {
									click: () => {
										settings.set({ consoleMode: v.key });
									},
								},
								className: 'btn tiny flex-1',
							}, [
								n.component(new Txt(v.name)),
							])),
							(m, c) => {
								c[v.key == m.consoleMode ? 'addClass' : 'removeClass']('primary');
								c[v.key != m.consoleMode ? 'addClass' : 'removeClass']('darken');
							},
						),
						{
							className: 'flex-row gap8',
							subClassName: () => 'flex-1 flex-row',
							horizontal: true,
						},
					),
					{
						className: 'small',
						noToggle: true,
						popupTip: l10n.l('consoleModeSettings.consoleModeInfo', "Touch is for devices with a virtual keyboard. Keyboard is for devices with a physical keyboard. Auto will try to detect which mode is most suitable."),
						popupTipClassName: 'popuptip--width-s',
					},
				),
			});
		});
	}

	/**
	 * @typedef {object} ConsoleModeSettings
	 * @property {"auto" | "touch" | "keyboard"} consoleMode Console input mode.
	 */

	/**
	 * Returns a promise to the consoleMode settings.
	 * @returns {Promise.<ConsoleModeSettings>} Promise of settings.
	 */
	getSettingsPromise() {
		return this.settingsPromise;
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('consoleMode');
	}
}

export default ConsoleModeSettings;
