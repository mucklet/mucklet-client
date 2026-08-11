import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import PageEditRoomScriptComponent from './PageEditRoomScriptComponent';
import './pageEditRoomScript.scss';

const themeTokens = [
	{ keyPrefix: 'pageeditroomscript', name: l10n.l('pageEditRoomScript.pageEditRoomScriptTokens', "Edit room script log color"), sortOrder: 1010 },
	{ key: 'pageeditroomscript.time.fg', value: (getToken) => getToken('color.neutral.700') },
	{ key: 'pageeditroomscript.log.fg', value: (getToken) => getToken('color.neutral.300') },
	{ key: 'pageeditroomscript.debug.fg', value: (getToken) => getToken('color.neutral.200') },
	{ key: 'pageeditroomscript.info.fg', value: (getToken) => getToken('color.contrast.300') },
	{ key: 'pageeditroomscript.warn.fg', value: (getToken) => getToken('color.accent.300') },
	{ key: 'pageeditroomscript.error.fg', value: (getToken) => getToken('log.error.fg') },
];

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
			'theme',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.theme.addTokens(themeTokens);
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

	dispose() {
		this.module.theme.removeTokens(themeTokens);
	}
}

export default PageEditRoomScript;
