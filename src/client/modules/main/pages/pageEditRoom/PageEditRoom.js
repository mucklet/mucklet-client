import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageEditRoomComponent from './PageEditRoomComponent';
import './pageEditRoom.scss';

/**
 * PageEditRoom opens an in-panel edit room page in the room panel.
 */
class PageEditRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'roomPages',
			'pageRoom',
			'dialogCropImage',
			'confirm',
			'deleteRoom',
			'dialogSetRoomOwner',
			'player',
			'toaster',
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
	 * @returns {function} Close function.
	 */
	open(ctrl, room) {
		return this.module.roomPages.openPage(
			'editRoom',
			ctrl.id,
			room.id,
			(ctrl, room, state, close) => ({
				component: new PageEditRoomComponent(this.module, ctrl, room, state, close),
				title: l10n.l('pageEditRoom.editRoom', "Edit Room"),
			}),
		);
	}

	dispose() {}
}

export default PageEditRoom;
