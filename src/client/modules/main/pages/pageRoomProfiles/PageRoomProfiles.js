import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageRoomProfilesComponent from './PageRoomProfilesComponent';
import './pageRoomProfiles.scss';

/**
 * PageRoomProfiles opens an page in the room panel listing the room's profiles.
 */
class PageRoomProfiles {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'pageRoom',
			'dialogCreateRoomProfile',
			'avatar',
			'confirm',
			'toaster',
			'roomProfile',
			'updateRoomProfile',
			'pageEditRoomProfile',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'roomProfile',
			sortOrder: 20,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl, room),
			}}, [
				n.component(new FAIcon('id-card-o')),
			])),
			filter: (ctrl, room, canEdit, canDelete) => canEdit,
		});
	}

	/**
	 * Opens an in-panel room profiles page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, room) {
		return this.module.api.get('core.room.' + room.id + '.profiles').then(profiles => {
			profiles.on();
			return this.module.roomPages.openRoomPage(
				'roomProfile',
				ctrl.id,
				getRoomInstanceId(room),
				(ctrl, room, state, close) => ({
					component: new PageRoomProfilesComponent(this.module, profiles, ctrl, room, state, close),
					title: l10n.l('pageRoomProfiles.roomProfile', "Room profiles"),
				}),
				{
					onClose: () => profiles.off(),
				},
			);
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('roomProfile');
	}
}

export default PageRoomProfiles;
