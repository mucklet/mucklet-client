import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import * as roles from 'utils/roles';

const roleInfo = {
	moderator: l10n.l('playerEventRoleAdd.moderatorInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help moderate</code></div>`),
	builder: l10n.l('playerEventRoleAdd.builderInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help builder</code></div>`),
	admin: l10n.l('playerEventRoleAdd.adminInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help admin</code></div>`),
	helper: l10n.l('playerEventRoleAdd.helperInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
			`<div class="charlog--code"><code>help helper</code></div>`),
};

/**
 * PlayerEventRoleAdd registers the roleAdd playerEvent handler.
 */
class PlayerEventRoleAdd {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('roleAdd', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		let info = roleInfo[ev.role];
		return this.module.toaster.open({
			title: l10n.l('playerEventRoleAdd.roleGranted', "Role granted"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerEventRoleAdd.roleGrantedInfo', "You've been granted a new role:"), { tagName: 'p' })),
				n.component(new Txt(roles.toLocaleString(ev.role), { tagName: 'p', className: 'dialog--strong dialog--large' })),
				n.component(info
					? new Html(info, { tagName: 'div', className: 'common--sectionpadding' })
					: null,
				),
			])),
			closeOn: 'click',
			onClose,
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('roleAdd');
	}
}

export default PlayerEventRoleAdd;
