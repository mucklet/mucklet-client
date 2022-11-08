import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';

/**
 * PageCharSleep renders character info.
 */
class PageCharSleep {
	constructor(module, ctrl) {
		this.module = module;
		this.ctrl = ctrl;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.ctrl,
			new Fader(null, { className: 'pagechar--statebutton' }),
			(m, c, change) => {
				if (change && (!change.hasOwnProperty('state') || (m.state != 'awake' && change.state != 'awake'))) return;

				c.setComponent(m.state != 'awake'
					? new Elem(n => n.elem('button', { className: 'btn medium primary', events: {
						click: () => this._wakeupChar(),
					}}, [
						n.component(new FAIcon('sign-in')),
						n.component(new Txt(l10n.l('pageChar.wakeUp', "Wake up"))),
					]))
					: new Elem(n => n.elem('button', { className: 'btn small', events: {
						click: () => this._releaseChar(),
					}}, [
						n.component(new FAIcon('sign-out')),
						n.component(new Txt(l10n.l('pageChar.sleep', "Sleep"))),
					])),
				);
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_wakeupChar() {
		return this.ctrl.call('wakeup');
	}

	_releaseChar() {
		return this.ctrl.call('release');
	}
}

export default PageCharSleep;
