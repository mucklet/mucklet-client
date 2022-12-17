import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import './playerSettingsPolicies.scss';

const privacyUrl = HUB_PATH + 'policy/privacy.html';
const termsUrl = HUB_PATH + 'policy/terms.html';

const txtPrivacyPolicy = l10n.l('playerSettingsPolicies.privacyPolicy', "Privacy Policy");
const txtTermsOfService = l10n.l('playerSettingsPolicies.termsOfService', "Terms of Service");

/**
 * PlayerSettingsPolicies adds a topsection to the PlayerSettings to show
 * player name.
 */
class PlayerSettingsPolicies {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add policies
		this.module.pagePlayerSettings.addTool({
			id: 'policies',
			type: 'topSection',
			sortOrder: 10,
			componentFactory: (user, player, state) => new Elem(n => n.elem('div', { className: 'playersettingspolicies' }, [
				n.component(new Txt(txtPrivacyPolicy, {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: privacyUrl,
						target: '_blank',
					},
				})),
				n.component(new Txt(txtTermsOfService, {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: termsUrl,
						target: '_blank',
					},
				})),
			])),
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('policies');
	}
}

export default PlayerSettingsPolicies;
