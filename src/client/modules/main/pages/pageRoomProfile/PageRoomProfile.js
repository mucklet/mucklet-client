import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageRoomProfileComponent from './PageRoomProfileComponent';
import './pageRoomProfile.scss';

/**
 * PageRoomProfile opens an page in the room panel listing the room's profiles.
 */
class PageRoomProfile {
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
			return this.module.roomPages.openPage(
				'roomProfile',
				ctrl.id,
				room.id,
				(ctrl, room, state, close) => ({
					component: new PageRoomProfileComponent(this.module, profiles, ctrl, room, state, close),
					title: l10n.l('pageRoomProfile.roomProfile', "Room profiles"),
					onClose: () => {
						profile.off();
						close();
					},
				}),
			);
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('roomProfile');
	}
}

export default PageRoomProfile;
