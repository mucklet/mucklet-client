import l10n from 'modapp-l10n';

/**
 * SetProfileAvatar adds command to set profile avatar to current avatar.
 */
class SetProfileAvatar {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setProfile', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setProfile.addAttribute({
			key: 'avatar',
			desc: l10n.l('setProfileAvatar.avatarDesc', "Value is omitted. Set profile avatar to character's current avatar."),
			value: this._setProfileAvatar.bind(this),
			next: null,
			sortOrder: 100,
		});
	}

	_setProfileAvatar(ctx, params) {
		let char = ctx.char;
		return char.call('copyProfileAvatar', {
			profileId: params.profileId,
		}).then(result => this.module.charLog.logInfo(char, l10n.l('setProfile.characterProfileSet', "Successfully set avatar of profile \"{name}\".", result.profile)));
	}
}

export default SetProfileAvatar;
