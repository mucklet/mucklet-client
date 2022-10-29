import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import './dialogUnregisterPuppet.scss';

class DialogUnregisterPuppet {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(puppeteer) {
		if (this.dialog) return;

		this.dialog = new Dialog({
			title: l10n.l('dialogUnregisterPuppet.unregisterPuppet', "Unregister puppet"),
			className: 'dialogunregisterpuppet',
			content: new Elem(n => n.elem('div', [
				n.elem('div', [
					n.component(new Txt(l10n.l('dialogUnregisterPuppet.unregisterPuppetBody', "Do you really wish to unregister the puppet?"), { tagName: 'p' })),
					n.component(new ModelTxt(puppeteer.puppet, m => (m.name + " " + m.surname).trim(), { className: 'dialogunregisterpuppet--fullname' }))
				]),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer flex-row margin16' }, [
					n.elem('button', {
						events: { click: () => this._onUnregister(puppeteer) },
						className: 'btn primary flex-1'
					}, [
						n.component(new Txt(l10n.l('dialogUnregisterPuppet.unregister', "Unregister puppet")))
					]),
					n.elem('button', {
						className: 'btn secondary flex-1',
						events: { click: () => this.close() }
					}, [
						n.component(new Txt(l10n.l('dialogUnregisterPuppet.cancel', "Cancel")))
					])
				])
			])),
			onClose: () => { this.dialog = null; }
		});

		this.dialog.open();
		try {
			this.dialog.getContent().getComponent().getComponent().getNode('heir').getComponent().getElement().focus();
		} catch (e) {}
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_onUnregister(puppeteer) {
		if (this.unregisterPromise) return this.unregisterPromise;

		this.unregisterPromise = this.module.player.getPlayer().call('unregisterPuppet', {
			charId: puppeteer.char.id,
			puppetId: puppeteer.puppet.id
		}).then(() => {
			this.close();
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.unregisterPromise = null;
		});

		return this.unregisterPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogUnregisterPuppet;
