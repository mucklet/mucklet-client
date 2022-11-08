import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatDateTime from 'utils/formatDateTime';

/**
 * PlayerEventSuspend registers the suspend playerEvent handler.
 */
class PlayerEventSuspend {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('suspend', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		return this.module.confirm.open(null, {
			title: l10n.l('playerEventSuspend.charSuspended', "Character suspended"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt((ev.char.name + ' ' + ev.char.surname).trim(), { tagName: 'p', className: 'dialog--strong dialog--large' })),
				n.component(new Txt(l10n.l('playerEventSuspend.suspendedUntil', "Suspended until"), { className: 'margin-bottom-m', tagName: 'h3' })),
				n.component(new Txt(formatDateTime(new Date(ev.suspended)), { tagName: 'p' })),
				n.component(new Txt(l10n.l('playerEventSuspend.reason', "Reason"), { className: 'margin-bottom-m', tagName: 'h3' })),
				n.component(new Txt(ev.reason, { tagName: 'p' })),
			])),
			confirm: l10n.l('playerEventSuspend.okay', "Okay"),
			cancel: null,
			onClose,
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('suspend');
	}
}

export default PlayerEventSuspend;
