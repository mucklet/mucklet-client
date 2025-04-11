import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageEditRoomScriptComponent from './PageEditRoomScriptComponent';
import './pageEditRoomScript.scss';

/**
 * PageEditRoomScript opens an in-panel edit room script page in the room
 * panel.
 */
class PageEditRoomScript {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'confirm',
			'dialogEditScriptSource',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Opens an in-panel edit room script page in the room panel.
	 * @param {Model} ctrl Controlled char model.
	 * @param {Model} room Room model.
	 * @param {string} scriptId Script ID.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, room, scriptId) {
		return Promise.all([
			this.module.api.get('core.roomscript.' + scriptId + '.details'),
			this.module.api.get('core.room.' + room.id + '.scripts'),
		]).then(result => {
			let [ script, scripts ] = result;
			script.on();
			scripts.on();
			return this.module.roomPages.openRoomPage(
				'editRoomScript',
				ctrl.id,
				getRoomInstanceId(room),
				(ctrl, room, state, close) => ({
					component: new PageEditRoomScriptComponent(this.module, ctrl, room, script, scripts, state, close),
					title: l10n.l('pageEditRoomScript.editRoomScript', "Edit Room Script"),
				}),
				{
					onClose: () => {
						script.off();
						scripts.off();
					},
				},
			);
		});
	}
}

export default PageEditRoomScript;
