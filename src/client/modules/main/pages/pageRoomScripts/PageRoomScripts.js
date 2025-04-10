import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageRoomScriptsComponent from './PageRoomScriptsComponent';
import './pageRoomScripts.scss';

/**
 * PageRoomScripts opens an page in the room panel listing the room's scripts.
 */
class PageRoomScripts {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'pageRoom',
			// 'dialogCreateRoomScript',
			'confirm',
			'toaster',
			// 'updateRoomScripts',
			// 'pageEditRoomScripts',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'roomScripts',
			sortOrder: 30,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl, room),
			}}, [
				n.component(new FAIcon('code')),
			])),
			filter: (ctrl, room, canEdit, canDelete) => canEdit,
		});
	}

	/**
	 * Opens an in-panel room scripts page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, room) {
		return this.module.api.get('core.room.' + room.id + '.scripts').then(scripts => {
			return this.module.roomPages.openRoomPage(
				'roomScripts',
				ctrl.id,
				getRoomInstanceId(room),
				(ctrl, room, state, close) => ({
					component: new PageRoomScriptsComponent(this.module, scripts, ctrl, room, state, close),
					title: l10n.l('pageRoomScripts.roomScripts', "Room scripts"),
				}),
				{
					onClose: () => scripts.off(),
				},
			);
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('roomScripts');
	}
}

export default PageRoomScripts;
