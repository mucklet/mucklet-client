import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import * as idroles from 'utils/idroles';

const idRoleInfo = {
	overseer: l10n.l('playerEventIdRoleAdd.overseerInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help overseer</code></div>`),
	pioneer: l10n.l('playerEventIdRoleAdd.pioneerInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help pioneer</code></div>`),
	supporter: l10n.l('playerEventIdRoleAdd.supporterInfo', `<div class="pad-bottom-m">To learn more, type:</div>` +
		`<div class="charlog--code"><code>help supporter</code></div>`),
};

/**
 * PlayerEventIdRoleAdd registers the idRoleAdd playerEvent handler.
 */
class PlayerEventIdRoleAdd {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('idRoleAdd', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		let info = idRoleInfo[ev.idRole];
		return this.module.toaster.open({
			title: l10n.l('playerEventIdRoleAdd.titleGranted', "Title granted"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerEventIdRoleAdd.titleGrantedInfo', "You've been granted a new account title:"), { tagName: 'p' })),
				n.component(new Txt(idroles.toLocaleString(ev.idRole), { tagName: 'p', className: 'dialog--strong dialog--large' })),
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
		this.module.playerEvent.removeHandler('idRoleAdd');
	}
}

export default PlayerEventIdRoleAdd;
