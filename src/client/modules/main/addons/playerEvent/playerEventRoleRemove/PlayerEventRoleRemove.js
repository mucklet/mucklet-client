import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import * as roles from 'utils/roles';

/**
 * PlayerEventRoleRemove registers the roleRemove playerEvent handler.
 */
class PlayerEventRoleRemove {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('roleRemove', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		return this.module.toaster.open({
			title: l10n.l('playerEventRoleRemove.roleRemoved', "Role removed"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerEventRoleRemove.roleRemovedInfo', "One of your roles has been removed:"), { tagName: 'p' })),
				n.component(new Txt(roles.toLocaleString(ev.role), { tagName: 'p', className: 'dialog--strong' })),
			])),
			closeOn: 'click',
			onClose
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('roleRemove');
	}
}

export default PlayerEventRoleRemove;
