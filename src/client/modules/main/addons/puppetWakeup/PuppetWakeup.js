import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import { isResError } from 'resclient';

function getPuppeteerId(p) {
	return p.char.id + '_' + p.puppet.id;
}

/**
 * PuppetWakeup tries to control and wakeup a puppet as soon as a control
 * request is granted.
 */
class PuppetWakeup {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onPuppetAdd = this._onPuppetAdd.bind(this);
		this._onPuppetRemove = this._onPuppetRemove.bind(this);
		this._onPuppeteerChange = this._onPuppeteerChange.bind(this);

		this.app.require([ 'player', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.puppets = null;
		this.listenedPuppeteers = {};
		this.module.player.getPlayerPromise().then(player => {
			// If listenedPuppeteers is null, we are disposed.
			if (!this.listenedPuppeteers) return;

			this.puppets = player.puppets;
			this._listenPuppets(true);
		});
	}

	_listenPuppets(on) {
		if (!this.puppets) return;

		let cb = on ? 'on' : 'off';
		this.puppets[cb]('add', this._onPuppetAdd);
		this.puppets[cb]('remove', this._onPuppetRemove);

		if (on) {
			for (let puppeteer of this.puppets) {
				this._listenPuppeteer(puppeteer, true);
				this._tryControl(puppeteer);
			}
		} else {
			for (let id in this.listenedPuppeteers) {
				this._listenPuppeteer(this.listenedPuppeteers[id], false);
			}
		}
	}

	_listenPuppeteer(puppeteer, on) {
		if (isResError(puppeteer)) return;

		let id = getPuppeteerId(puppeteer);
		if (on) {
			this.listenedPuppeteers[id] = puppeteer;
		} else {
			delete this.listenedPuppeteers[id];
		}
		puppeteer[on ? 'on' : 'off']('change', this._onPuppeteerChange);
	}

	_onPuppetAdd(ev) {
		if (this.puppets) {
			this._listenPuppeteer(ev.item, true);
		}
	}

	_onPuppetRemove(ev) {
		if (this.puppets) {
			this._listenPuppeteer(ev.item, false);
		}
	}

	_onPuppeteerChange(change, puppeteer) {
		// If we have a change in requestStatus, then we try to take control.
		if (change.hasOwnProperty('requestStatus')) {
			this._tryControl(puppeteer, true);
		}
	}

	_tryControl(puppeteer, onEvent) {
		let puppet = puppeteer.puppet;
		let char = puppeteer.char;

		// Show toaster if request was rejected
		if (puppeteer.requestStatus == 'rejected' && onEvent) {
			return this.module.toaster.open({
				title: l10n.l('puppetWakeup.puppetControlDenied', "Puppet control denied"),
				content: close => new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('puppetWakeup.roleGranted', "Control request was rejected."), { tagName: 'p' })),
					n.elem('div', { className: 'common--sectionpadding' }, [
						n.component(new Txt((puppet.name + ' ' + puppet.surname).trim(), { tagName: 'div', className: 'dialog--strong' })),
						n.component(new Txt("(" + (puppeteer.requestPuppeteer.name + ' ' + puppeteer.requestPuppeteer.surname).trim() + ")", { tagName: 'div', className: 'dialog--small' })),
					]),
					n.component(puppeteer.requestAnswer ? new Txt('"' + puppeteer.requestAnswer + '"', { tagName: 'p', className: 'dialog--emphasis' }) : null),
				])),
				closeOn: 'click',
			});
		}

		if (puppeteer.requestStatus != 'accepted') return;

		this.module.toaster.open({
			title: l10n.l('puppetWakeup.puppetControlGranted', "Puppet control granted"),
			content: close => new ModelComponent(
				puppeteer,
				new ModelComponent(
					puppet,
					new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('puppetWakeup.roleGranted', "Do you want to control puppet?"), { tagName: 'p' })),
						n.elem('div', { className: 'common--sectionpadding' }, [
							n.component(new Txt((puppet.name + ' ' + puppet.surname).trim(), { tagName: 'div', className: 'dialog--strong' })),
							n.component(new Txt("(" + (char.name + ' ' + char.surname).trim() + ")", { tagName: 'div', className: 'dialog--small' })),
						]),
						n.elem('div', { className: 'flex-row margin8' }, [
							n.elem('button', {
								className: 'btn primary',
								events: { click: () => {
									this._control(puppeteer);
									close();
								} },
							}, [
								n.component(new Txt(l10n.l('puppetWakeup.control', "Control"))),

							]),
							n.elem('button', {
								className: 'btn secondary',
								events: { click: close },
							}, [
								n.component(new Txt(l10n.l('puppetWakeup.cancel', "Cancel"))),
							]),
						]),
					])),
					(m, c) => {
						if (m.puppeteer && m.puppeteer.id == char.id) close();
					},
				),
				(m, c) => {
					if (m.requestStatus != 'accepted') close();
				},
			),
			closeOn: 'button',
		});
	}

	_control(puppeteer) {
		let puppet = puppeteer.puppet;
		let controlled = this.module.player.getControlledChar(puppet.id);
		return (controlled && puppet.puppeteer == puppeteer.char.id
			? Promise.resolve(controlled)
			: this.module.player.getPlayer().call('controlPuppet', { charId: puppeteer.char.id, puppetId: puppet.id })
		)
			.then(c => {
				if (isResError(c)) {
					throw c;
				}
				c.call('wakeup');
			})
			.catch(err => this.module.toaster.openError(err));
	}


	dispose() {
		this._listenPuppets(false);
		this.puppets = null;
		this.listenedPuppeteers = null;
	}
}

export default PuppetWakeup;
