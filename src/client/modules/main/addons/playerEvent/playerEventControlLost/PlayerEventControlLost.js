import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * PlayerEventControlLost registers the control lost playerEvent handler.
 */
class PlayerEventControlLost {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('controlLost', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		return this.module.toaster.open({
			title: l10n.l('playerEventControlLost.puppetControlLost', "Puppet control lost"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('puppetWakeup.roleGranted', "Someone else took control of puppet."), { tagName: 'p' })),
				n.elem('div', { className: 'common--sectionpadding' }, [
					n.component(new Txt((ev.puppet.name + ' ' + ev.puppet.surname).trim(), { tagName: 'div', className: 'dialog--strong' })),
					n.component(new Txt("(" + (ev.puppeteer.name + ' ' + ev.puppeteer.surname).trim() + ")", { tagName: 'div', className: 'dialog--small' })),
				]),
			])),
			closeOn: 'click',
			onClose,
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('controlLost');
	}
}

export default PlayerEventControlLost;
