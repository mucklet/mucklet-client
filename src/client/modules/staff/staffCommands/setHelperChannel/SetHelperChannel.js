import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import ListStep from 'classes/ListStep';

/**
 * SetHelperChannel adds helperchannel flag to the set char command.
 */
class SetHelperChannel {
	constructor(app) {
		this.app = app;

		this.app.require([
			'set',
			'setCharSettings',
			'cmdLists',
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.set.addAttribute({
			key: 'helperchannel',
			stepFactory: () => new ListStep('value', this.module.cmdLists.getBool(), {
				errRequired: () => new Err('setHelperChannel.flagRequired', "Do you want to start or stop listening to the helper channel?"),
			}),
			desc: l10n.l('setHelperChannel.helperChannelDesc', "Listen to the helper channel flag. Value is <code>yes</code> or <code>no</code>."),
			sortOrder: 500,
			value: (ctx, p) => this.module.setCharSettings.setCharSettings(ctx, Object.assign({ attr: 'ishelping' }, p)),
		});
	}
}

export default SetHelperChannel;
