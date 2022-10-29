import l10n from 'modapp-l10n';
import { addBeforeUnload, removeBeforeUnload } from 'utils/reload';

/**
 * ConfirmClose shows a confirmation popup when trying to close the browser tab
 * while characters are awake.
 */
class ConfirmClose {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onBeforeUnload = this._onBeforeUnload.bind(this);

		this.app.require([ 'player', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		addBeforeUnload(this._onBeforeUnload);
	}

	_onBeforeUnload(e) {
		if ((this.module.player.getControlled() || []).length) {
			e = e || window.event;
			let msg = l10n.t('confirmClose.charactersAwake', "Some characters are still awake.");
			if (e) {
				e.returnValue = msg;
			}
			if (e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}
			return msg;
		}
	}

	dispose() {
		removeBeforeUnload(this._onBeforeUnload);
	}
}

export default ConfirmClose;
