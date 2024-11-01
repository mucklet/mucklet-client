import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageEditRoomComponent from './PageEditRoomComponent';
import './pageEditRoom.scss';

/**
 * PageEditRoom opens an in-panel edit room page in the room panel.
 */
class PageEditRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'pageRoom',
			'dialogCropImage',
			'confirm',
			'deleteRoom',
			'dialogSetRoomOwner',
			'player',
			'toaster',
			'file',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'editRoom',
			sortOrder: 10,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl, room),
			}}, [
				n.component(new FAIcon('pencil')),
			])),
			filter: (ctrl, room, canEdit, canDelete) => canEdit,
		});
	}

	/**
	 * Opens an in-panel edit room page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model of the room to edit.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, room) {
		return this.module.api.get('core.room.' + room.id + '.settings').then(roomSettings => {
			roomSettings.on();
			return this.module.roomPages.openRoomPage(
				'editRoom',
				ctrl.id,
				getRoomInstanceId(room),
				(ctrl, room, state, close) => ({
					component: new PageEditRoomComponent(this.module, ctrl, room, roomSettings, state, close),
					title: l10n.l('pageEditRoom.editRoom', "Edit Room"),
				}),
				{
					onClose: () => {
						roomSettings.off();
					},
				},
			);
		});
	}

	dispose() {}
}

export default PageEditRoom;
