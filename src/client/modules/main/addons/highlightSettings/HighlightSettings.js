import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import LabelToggleBox from 'components/LabelToggleBox';

/**
 * HighlightSettings adds a settings tool for CharLog to PagePlayerSettings.
 */
class HighlightSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'settings', 'pagePlayerSettings', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Settings
		this.settingsPromise = this.module.settings.loadSettings('highlight', {
			highlightTriggers: true,
			highlightMentionMessages: true,
			highlightOwnMessages: true,
		});

		this.settingsPromise.then(settings => {
			this.module.pagePlayerSettings.addTool({
				id: 'highlightTriggers',
				sortOrder: 30,
				componentFactory: (user, player, state) => new ModelComponent(
					settings,
					new LabelToggleBox(l10n.l('highlightSettings.highlightTriggers', "Highlight triggers"), false, {
						className: 'common--formmargin',
						onChange: (v, c) => settings.set({ highlightTriggers: v }),
						popupTip: l10n.l('highlightSettings.highlightTriggersInfo', "Highlight your character's name and other mention triggers in the chat log."),
						popupTipClassName: 'popuptip--width-s',
					}),
					(m, c) => c.setValue(settings.highlightTriggers, false),
				),
			});
			this.module.pagePlayerSettings.addTool({
				id: 'highlightMentionMessages',
				sortOrder: 31,
				componentFactory: (user, player, state) => new ModelComponent(
					settings,
					new LabelToggleBox(l10n.l('highlightSettings.highlightMentionMessages', "Highlight messages"), false, {
						className: 'common--formmargin',
						onChange: (v, c) => settings.set({ highlightMentionMessages: v }),
						popupTip: l10n.l('highlightSettings.highlightMentionMessagesInfo', "Highlight communication either directly targeting your character, or in which your character is mentioned."),
						popupTipClassName: 'popuptip--width-s',
					}),
					(m, c) => c.setValue(settings.highlightMentionMessages, false),
				),
			});
			this.module.pagePlayerSettings.addTool({
				id: 'highlightOwnMessages',
				sortOrder: 32,
				componentFactory: (user, player, state) => new ModelComponent(
					settings,
					new LabelToggleBox(l10n.l('highlightSettings.highlightOwnMessages', "Highlight own messages"), false, {
						className: 'common--formmargin',
						onChange: (v, c) => settings.set({ highlightOwnMessages: v }),
						popupTip: l10n.l('highlightSettings.highlightOwnMessagesInfo', "Highlight communication sent by your own character."),
						popupTipClassName: 'popuptip--width-s',
					}),
					(m, c) => c.setValue(settings.highlightOwnMessages, false),
				),
			});
		});
	}

	/**
	 * @typedef {object} HighlightSettings
	 * @property {bool} highlightTriggers Flag telling if mention triggers should be highlighted in chat log text.
	 * @property {bool} highlightMentionMessages Flag telling if communication messages mentioning the character should be highlighted as a whole.
	 * @property {bool} highlightOwnMessages Flag telling if communication from your character should be highlighted as a whole.
	 */

	/**
	 * Returns a promise to the highlightTriggers settings.
	 * @returns {Promise.<HighlightSettings>} Promise of settings.
	 */
	getSettingsPromise() {
		return this.settingsPromise;
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('highlightTriggers');
		this.module.pagePlayerSettings.removeTool('highlightMentionMessages');
		this.module.pagePlayerSettings.removeTool('highlightOwnMessages');
	}
}

export default HighlightSettings;
