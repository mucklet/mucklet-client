import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import * as idroles from 'utils/idroles';

/**
 * PlayerEventIdRoleRemove registers the idRoleRemove playerEvent handler.
 */
class PlayerEventIdRoleRemove {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('idRoleRemove', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		return this.module.toaster.open({
			title: l10n.l('playerEventRoleRemove.titleRemoved', "Title removed"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerEventRoleRemove.titleRemovedInfo', "One of your account titles has been removed:"), { tagName: 'p' })),
				n.component(new Txt(idroles.toLocaleString(ev.idRole), { tagName: 'p', className: 'dialog--strong' })),
			])),
			closeOn: 'click',
			onClose
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('idRoleRemove');
	}
}

export default PlayerEventIdRoleRemove;
