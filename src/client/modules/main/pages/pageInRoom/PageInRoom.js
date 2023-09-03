import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageInRoomComponent from './PageInRoomComponent';
import './pageInRoom.scss';

/**
 * PageInRoom opens an in-panel page to show in room characters in the room panel.
 */
class PageInRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'roomPages',
			'pageRoom',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'inRoom',
			type: 'inRoom',
			sortOrder: 10,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: (c, ev) => {
					this.open(ctrl, room);
					ev.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('expand')),
			])),
		});
	}

	/**
	 * Opens an in-panel page to show in room characters in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model of the room to edit.
	 * @returns {function} Close function.
	 */
	open(ctrl, room) {
		return this.module.roomPages.openPage(
			'inRoom',
			ctrl.id,
			getRoomInstanceId(room),
			(ctrl, room, state, close) => ({
				component: new PageInRoomComponent(this.module, ctrl, room, state, close),
				title: l10n.l('pageInRoom.inRoom', "In Room"),
			}),
		);
	}

	dispose() {}
}

export default PageInRoom;
