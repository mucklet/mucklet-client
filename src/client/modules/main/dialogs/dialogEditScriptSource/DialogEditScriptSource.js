import fetchRoomScriptSource from 'utils/fetchRoomScriptSource';

class DialogEditScriptSource {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'auth',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a separate window to edit a script's source code.
	 * @param {string} scriptId Script ID.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.boilerplateOnEmpty] Flag to tell if boilerplate code should be inserted on an empty script.
	 * @returns {Promise<Dialog>} Promise of an opened window.
	 */
	open(scriptId, opt) {
		if (this.dialog) return;

		// Get script details
		return this.module.api.get(`core.roomscript.${scriptId}.details`).then(script => {

			// Get script source code
			return fetchRoomScriptSource(script, () => this.module.auth.refreshTokens()).then(source => {
				window.open(`scripteditor/#editscript/${encodeURIComponent(scriptId)}${opt?.boilerplateOnEmpty ? '/boilerplate' : ''}`, 'script#' + scriptId);
			});
		}).catch(err => this.module.confirm.openError(err));
	}
}

export default DialogEditScriptSource;
