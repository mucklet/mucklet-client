import l10n from 'modapp-l10n';

/**
 * SetProfileImage adds command to set profile image to current image.
 */
class SetProfileImage {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setProfile', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setProfile.addAttribute({
			key: 'image',
			desc: l10n.l('setProfileImage.imageDesc', "Value is omitted. Set profile image to character's current image."),
			value: this._setProfileImage.bind(this),
			next: null,
			sortOrder: 100
		});
	}

	_setProfileImage(ctx, params) {
		let char = ctx.char;
		return char.call('copyProfileImage', {
			profileId: params.profileId,
		}).then(result => this.module.charLog.logInfo(char, l10n.l('setProfile.characterProfileSet', "Successfully set image of profile \"{name}\".", result.profile)));
	}
}

export default SetProfileImage;
