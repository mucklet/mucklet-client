import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageEditRoomProfileComponent from './PageEditRoomProfileComponent';
import './pageEditRoomProfile.scss';

/**
 * PageEditRoomProfile opens an in-panel edit room profile page in the room
 * panel.
 */
class PageEditRoomProfile {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'dialogCropImage',
			'pageRoom',
			'confirm',
			'avatar',
			'deleteRoomProfile',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Opens an in-panel edit room profile page in the room panel.
	 * @param {Model} ctrl Controlled char model.
	 * @param {Model} room Room model.
	 * @param {string} profileId Profile ID of the room.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, room, profileId) {
		return Promise.all([
			this.module.api.get('core.roomprofile.' + profileId + '.details'),
			this.module.api.get('core.room.' + room.id + '.profiles'),
		]).then(result => {
			result[0].on(); // Profile
			result[1].on(); // Room profiles
			return this.module.roomPages.openPage(
				'editRoomProfile',
				ctrl.id,
				getRoomInstanceId(room),
				(ctrl, room, state, close) => ({
					component: new PageEditRoomProfileComponent(this.module, ctrl, room, result[0], result[1], state, close),
					title: l10n.l('pageEditRoomProfile.editRoomProfile', "Edit Room Profile"),
					onClose: () => {
						result[0].off();
						result[1].off();
						close();
					},
				}),
			);
		});
	}
}

export default PageEditRoomProfile;
