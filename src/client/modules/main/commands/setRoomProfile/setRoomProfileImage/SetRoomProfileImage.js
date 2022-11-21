import l10n from 'modapp-l10n';

/**
 * SetRoomProfileImage adds command to set room profile image to current room
 * image.
 */
class SetRoomProfileImage {
	constructor(app) {
		this.app = app;

		this.app.require([
			'setRoomProfile',
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setRoomProfile.addAttribute({
			key: 'image',
			desc: l10n.l('setRoomProfileImage.imageDesc', "Value is omitted. Set room profile image to room's current image."),
			value: this._setRoomProfileImage.bind(this),
			next: null,
			sortOrder: 100,
		});
	}

	_setRoomProfileImage(ctx, params) {
		let char = ctx.char;
		return char.call('copyRoomProfileImage', {
			profileId: params.profileId,
		}).then(result => this.module.charLog.logInfo(char, l10n.l('setRoomProfile.roomProfileSet', "Successfully set image of room profile \"{name}\".", result.profile)));
	}
}

export default SetRoomProfileImage;
