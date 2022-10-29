import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';

class PageCharSelectPuppetContent {
	constructor(module, puppeteer, toggle, close) {
		this.puppeteer = puppeteer;
		this.char = puppeteer.char;
		this.puppet = puppeteer.puppet;
		this.module = module;
		this.toggle = toggle;
		this.close = close;
	}

	render(el) {
		let o = {};
		this.elem = new ModelComponent(
			this.puppeteer,
			new ModelComponent(
				this.puppet,
				new ModelComponent(
					this.char,
					new Elem(n => n.elem('div', [
						n.elem('div', { className: 'badge--select badge--margin' }, [
							n.elem('button', { className: 'badge--faicon iconbtn medium darken', events: {
								click: (c, ev) => {
									this.module.pagePuppeteerSettings.open(this.puppeteer);
									ev.stopPropagation();
								}
							}}, [
								n.component(new FAIcon('cog'))
							]),
							n.elem('div', { className: 'badge--info small' }, [
								n.component(new ModelTxt(
									this.puppet,
									m => m.puppeteer && m.puppeteer.id == this.char.id
										? l10n.l('pageCharSelect.controlledSince', "Controlled since")
										: l10n.l('pageCharSelect.lastControlled', "Last controlled"),
									{ tagName: 'div', className: 'badge--text' }
								)),
								n.component(new ModelTxt(
									this.puppeteer,
									m => m.lastUsed
										? formatDateTime(new Date(m.lastUsed))
										: l10n.l('pageCharSelect.never', "Never"),
									{ tagName: 'div', className: 'badge--text' }
								)),
								n.component('controlledBy', new ModelTxt(
									null,
									m => m ? '(' + (m.name + ' ' + m.surname).trim() + ')' : '',
									{ tagName: 'div', className: 'badge--text' }
								)),
							])
						]),
						n.component('action', new Collapser())
					])),
					(m, c) => this._setAction(c, o)
				),
				(m, c) => {
					this._setAction(c.getComponent(), o);
					c.getComponent().getNode('controlledBy').setModel(m.puppeteer && m.puppeteer.id != this.char.id ? m.puppeteer : null);
				}
			),
			(m, c) => this._setAction(c.getComponent().getComponent(), o)
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setAction(c, o) {
		let action = null;
		if (this.char.suspended) {
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
		} else {
			let isControlling = this.puppet.puppeteer && this.puppet.puppeteer.id == this.char.id;
			let reqStatus = this.puppeteer.requestStatus;
			if (!isControlling) {
				if (this.puppet.state != 'awake' || reqStatus == 'accepted') {
					action = o.wakeup || new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
						n.elem('button', { className: 'btn medium primary flex-1', events: {
							click: (el, e) => {
								this._wakeupPuppet();
								e.stopPropagation();
							}
						}}, [
							n.component(new FAIcon('sign-in')),
							n.component(new ModelTxt(this.puppet, m => this.puppet.state == 'awake'
								? l10n.l('pageCharSelect.control', "Control")
								: l10n.l('pageCharSelect.wakeUp', "Wake up")
							))
						])
					]));
					o.wakeup = action;
				} else if (!reqStatus) {
					action = o.requestControl || new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
						n.elem('button', { className: 'btn medium primary flex-1', events: {
							click: (el, e) => {
								this._requestControl();
								e.stopPropagation();
							}
						}}, [
							n.component(new FAIcon('refresh')),
							n.component(new Txt(l10n.l('pageCharSelect.requestControl', "Request control")))
						])
					]));
					o.requestControl = action;
				} else if (reqStatus == 'pending') {
					action = o.pending || new Elem(n => n.elem('div', { className: 'badge--margin' }, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(new Txt(l10n.l('pageCharSelect.status', "Status"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(this.char, m => l10n.l('pageCharSelect.pendingControlRequest', "Pending control request"), { className: 'badge--info badge--strong' }))
						])
					]));
					o.pending = action;
				} else if (reqStatus == 'rejected') {
					action = o.rejected || new Elem(n => n.elem('div', { className: 'badge--margin' }, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(new Txt(l10n.l('pageCharSelect.status', "Status"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(this.char, m => l10n.l('pageCharSelect.rejected', "Control request denied"), { className: 'badge--info badge--error' }))
						]),
						n.component(this.puppeteer.requestAnswer
							? new Elem(n => n.elem('div', { className: 'badge--select' }, [
								n.component(new Txt(l10n.l('pageCharSelect.reason', "Reason"), { className: 'badge--iconcol badge--subtitle' })),
								n.component(new Txt(this.puppeteer.requestAnswer, { className: 'badge--info badge--text' }))
							]))
							: null
						)
					]));
				}
			}
		}

		c.getNode('action').setComponent(action);
	}

	_wakeupPuppet() {
		let controlled = this.module.player.getControlledChar(this.puppet.id);
		return (controlled && this.puppet.puppeteer == this.char.id
			? Promise.resolve(controlled)
			: this.module.player.getPlayer().call('controlPuppet', { charId: this.char.id, puppetId: this.puppet.id })
		)
			.then(c => c.call('wakeup'))
			.then(() => {
				if (this.close) {
					this.close();
				}
				this.toggle(false);
				this.module.player.setActiveChar(this.puppet.id);
			})
			.catch(err => this.module.confirm.openError(err));
	}

	_requestControl() {
		return this.module.dialogRequestControl.open(this.puppeteer);
	}

}

export default PageCharSelectPuppetContent;
