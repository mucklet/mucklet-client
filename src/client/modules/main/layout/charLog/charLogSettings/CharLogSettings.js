import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';

/**
 * CharLogSettings adds a settings tool for CharLog to PagePlayerSettings.
 */
class CharLogSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'settings', 'pagePlayerSettings', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Settings
		this.settingsPromise = this.module.settings.loadSettings('charLog', {
			useLocalStorage: true,
		});

		this.settingsPromise.then(settings => {
			this.module.pagePlayerSettings.addTool({
				id: 'charLog',
				sortOrder: 20,
				componentFactory: (user, player, state) => new ModelComponent(
					settings,
					new LabelToggleBox(l10n.l('charLogSettings.storeLog', "Store log between sessions"), false, {
						className: 'common--formmargin',
						onChange: (v, c) => {
							if (v === settings.useLocalStorage) return;

							this.module.confirm.open(() => settings.set({ useLocalStorage: v }), {
								title: v
									? l10n.l('charLogSettings.confirmStoreLogs', "Confirm store logs")
									: l10n.l('charLogSettings.confirmDiscardLogs', "Confirm discard logs"),
								body: new Elem(n => n.elem('div', [
									n.component(new Txt(v
										? l10n.l('charLogSettings.storeLogsBody', "Do you wish to store chat logs in your browser between sessions?")
										: l10n.l('charLogSettings.discardLogsBody', "Do you wish to discard chat logs between sessions?"), { tagName: 'p' })),
									n.elem('p', { className: 'dialog--error' }, [
										n.component(new FAIcon('exclamation-triangle')),
										n.html("&nbsp;&nbsp;"),
										n.component(new Txt(v
											? l10n.l('charLogSettings.storeLogsWarning', "Others using the same computer may be able to access your logs.")
											: l10n.l('charLogSettings.discardLogsWarning', "Any logs stored on this browser will be irretrievably lost."),
										)),
									]),
								])),
								confirm: v
									? l10n.l('charLogSettings.storeLogs', "Store logs")
									: l10n.l('charLogSettings.discardLogs', "Discard logs"),
								onClose: () => c.setValue(settings.useLocalStorage, false),
							});
						},
						popupTip: l10n.l('charLogSettings.storeLogInfo', "Keep the chat logs between sessions, even if you close the tab or browser.\nBeware that others using the same computer may be able to access them."),
						popupTipClassName: 'popuptip--width-s',
					}),
					(m, c) => c.setValue(settings.useLocalStorage, false),
				),
			});
		});
	}

	/**
	 * @typedef {object} CharLogSettings
	 * @property {bool} useLocalStorage Flag telling if localStorage should be used, instead of sessionStorage, to store logs.
	 */

	/**
	 * Returns a promise to the charLog settings.
	 * @returns {Promise.<CharLogSettings>} Promise of settings.
	 */
	getSettingsPromise() {
		return this.settingsPromise;
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('charLog');
	}
}

export default CharLogSettings;
