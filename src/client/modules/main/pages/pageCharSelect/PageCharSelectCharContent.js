import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import formatDateTime from 'utils/formatDateTime';

class PageCharSelectCharContent {
	constructor(module, char, toggle, close) {
		this.char = char;
		this.module = module;
		this.toggle = toggle;
		this.close = close;
	}

	render(el) {
		let o = {};
		let actionFader = new Fader();
		let wakeupComponent = new ModelComponent(
			this.module.onboarding.getModel(),
			new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('button', { className: 'btn medium primary flex-1', events: {
					click: (el, e) => {
						this._wakeupChar();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('sign-in')),
					n.component(new ModelTxt(this.char, m => m.puppeteer
						? l10n.l('pageCharSelect.control', "Control")
						: l10n.l('pageCharSelect.wakeUp', "Wake up"),
					)),
				]),
			])),
			(m, c) => this._setTip(c, m),
			{ postrenderUpdate: true },
		);

		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('button', { className: 'badge--faicon iconbtn medium solid', events: {
					click: (c, ev) => {
						this.module.pageCharSettings.open(this.char);
						ev.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('cog')),
				]),
				n.elem('div', { className: 'badge--info small' }, [
					n.component(new ModelTxt(
						this.char,
						m => m.state == 'asleep'
							? l10n.l('pageCharSelect.lastAwake', "Last awake")
							: l10n.l('pageCharSelect.wokeUp', "Woke up"),
						{ tagName: 'div', className: 'badge--text' },
					)),
					n.component(new ModelTxt(
						this.char,
						m => m.lastAwake
							? formatDateTime(new Date(m.lastAwake))
							: l10n.l('pageCharSelect.never', "Never"),
						{ tagName: 'div', className: 'badge--text' },
					)),
				]),
			]),
			n.component(new ModelComponent(
				this.char,
				new Collapser(),
				(m, c, change) => {
					let action = null;
					if (m.suspended) {
						action = o.suspended || new Elem(n => n.elem('div', { className: 'badge--margin' }, [
							n.elem('div', { className: 'badge--select' }, [
								n.component(new Txt(l10n.l('pageCharSelect.suspended', "Suspend"), { className: 'badge--iconcol badge--subtitle' })),
								n.component(new ModelTxt(this.char, m => l10n.l('pageCharSelect.until', "Until {time}", { time: formatDateTime(new Date(m.suspended)) }), { className: 'badge--info badge--error' })),
							]),
							n.elem('div', { className: 'badge--select' }, [
								n.component(new Txt(l10n.l('pageCharSelect.reason', "Reason"), { className: 'badge--iconcol badge--subtitle' })),
								n.component(new ModelTxt(this.char, m => m.suspendReason, { className: 'badge--info badge--text' })),
							]),
						]));
						o.suspended = action;
					} else if (m.controller == 'bot') {
						action = o.release || new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
							n.elem('button', { className: 'btn medium primary flex-1', events: {
								click: (el, e) => {
									this._releaseChar();
									e.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('sign-out')),
								n.component(new ModelTxt(this.char, m => m.state != 'awake'
									? l10n.l('pageCharSelect.release', "Release")
									: l10n.l('pageCharSelect.sleep', "Sleep"),
								)),
							]),
						]));
						o.release = action;

					} else if (m.state == 'asleep' || m.puppeteer) {
						action = wakeupComponent;
						o.wakeup = action;
					}
					actionFader.setComponent(action);
					c.setComponent(action ? actionFader : null);
				},
			)),

		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this._closeTip();
			this.elem.unrender();
			this.elem = null;
		}
	}

	_wakeupChar() {
		let controlled = this.module.player.getControlledChar(this.char.id);
		let promise = controlled
			? Promise.resolve(controlled)
			: this.module.player.getPlayer().call('controlChar', { charId: this.char.id });

		return promise
			.then(c => c.call('wakeup'))
			.then(() => {
				if (this.close) {
					this.close();
				}
				this.toggle(false);
				this.module.player.setActiveChar(this.char.id);
			})
			.catch(err => this.module.confirm.openError(err));
	}

	_releaseChar() {
		return this.module.player.getPlayer().call('releaseChar', { charId: this.char.id })
			.catch(err => this.module.confirm.openError(err));
	}

	_setTip(component, onboarding) {
		let el = component.getElement();

		// To show the onboarding tip, check the conditions
		if (el && onboarding.wakeupChar) {
			this._openTip(el);
		} else {
			this._closeTip();
		}
	}

	_openTip(el) {
		this.module.onboarding.openTip('pageCharSelectWakeup', el, {
			priority: 20,
			position: [ 'right', 'bottom' ],
			title: l10n.l('pageCharSelect.getStarted', "Get started"),
			content: l10n.l('pageCharSelect.clickWakeup', "Click \"Wake up\" to start exploring a world of roleplay!"),
		});
	}

	_closeTip() {
		this.module.onboarding.closeTip('pageCharSelectWakeup');
	}

}

export default PageCharSelectCharContent;
