import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
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
		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('button', { className: 'badge--faicon iconbtn medium solid', events: {
					click: (c, ev) => {
						this.module.pageCharSettings.open(this.char);
						ev.stopPropagation();
					}
				}}, [
					n.component(new FAIcon('cog'))
				]),
				n.elem('div', { className: 'badge--info small' }, [
					n.component(new ModelTxt(
						this.char,
						m => m.state == 'asleep'
							? l10n.l('pageCharSelect.lastAwake', "Last awake")
							: l10n.l('pageCharSelect.wokeUp', "Woke up"),
						{ tagName: 'div', className: 'badge--text' }
					)),
					n.component(new ModelTxt(
						this.char,
						m => m.lastAwake
							? formatDateTime(new Date(m.lastAwake))
							: l10n.l('pageCharSelect.never', "Never"),
						{ tagName: 'div', className: 'badge--text' }
					)),
				])
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
								n.component(new ModelTxt(this.char, m => l10n.l('pageCharSelect.until', "Until {time}", { time: formatDateTime(new Date(m.suspended)) }), { className: 'badge--info badge--error' }))
							]),
							n.elem('div', { className: 'badge--select' }, [
								n.component(new Txt(l10n.l('pageCharSelect.reason', "Reason"), { className: 'badge--iconcol badge--subtitle' })),
								n.component(new ModelTxt(this.char, m => m.suspendReason, { className: 'badge--info badge--text' }))
							]),
						]));
						o.suspended = action;
					} else if (m.state == 'asleep' || m.puppeteer) {
						action = o.wakeup || new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
							n.elem('button', { className: 'btn medium primary flex-1', events: {
								click: (el, e) => {
									this._wakeupChar();
									e.stopPropagation();
								}
							}}, [
								n.component(new FAIcon('sign-in')),
								n.component(new ModelTxt(this.char, m => m.puppeteer
									? l10n.l('pageCharSelect.control', "Control")
									: l10n.l('pageCharSelect.wakeUp', "Wake up")
								))
							])
						]));
						o.wakeup = action;
					}
					c.setComponent(action);
				}
			)),

		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
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

}

export default PageCharSelectCharContent;
