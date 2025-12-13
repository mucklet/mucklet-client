import { Elem, Txt, Textarea } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import './dialogSendMail.scss';

class DialogSendMail {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'player',
			'cmdLists',
			'searchChar',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open() {
		if (this.dialog) return;

		let player = this.module.player.getPlayer();
		if (!player) return;

		let main = player.mainChar || null;

		let model = new Model({ data: {
			from: (main && main.id) || null,
			to: "",
			text: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogSendMail.sendMail', "Send mail"),
			className: 'dialogsendmail',
			content: new Elem(n => n.elem('div', [
				n.component('from', new PanelSection(
					l10n.l('dialogSendMail.from', "From"),
					this.module.searchChar.newSearchChar({
						ownedChars: true,
						placeholder: l10n.l('dialogSendMail.enterFromCharacter', "Enter from character"),
						onSelect: (char) => model.set({ from: char.id }),
						events: {
							input: (c, ev) => model.set({ from: null }),
							blur: c => !model.from && c.setProperty('value', ""),
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						required: true,
					},
				)),
				n.component('to', new PanelSection(
					l10n.l('dialogSendMail.to', "To"),
					this.module.searchChar.newSearchChar({
						placeholder: l10n.l('dialogSendMail.enterToCharacter', "Enter to character"),
						onSelect: (char) => model.set({ to: char.id }),
						events: {
							input: (c, ev) => model.set({ to: null }),
							blur: c => !model.to && c.setProperty('value', ""),
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						required: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('dialogSendMail.message', "Message"),
					new ModelComponent(
						model,
						new Textarea(model.text, {
							events: { input: c => model.set({ text: c.getValue() }) },
							attributes: {
								spellcheck: 'false',
								placeholder: l10n.t('dialogSendMail.textPlaceholder', "Enter the message"),
							},
							className: 'dialog--input common--paneltextarea-small',
						}),
						(m, c) => c.setValue(m.text),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogSendMail.messageInfo', "Message to send to the character. Use : (colon) and > (greater than) modifiers for pose or OOC messages."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer flex-row margin16' }, [
					n.elem('button', {
						events: { click: () => this._onSend(player, model) },
						className: 'btn primary flex-1',
					}, [
						n.component(new Txt(l10n.l('dialogSendMail.sendMail', "Send mail"))),
					]),
					n.elem('button', {
						className: 'btn secondary flex-1',
						events: { click: () => this.close() },
					}, [
						n.component(new Txt(l10n.l('dialogSendMail.cancel', "Cancel"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		if (main) {
			this.dialog.getContent().getNode('to').getComponent().getElement().focus();
		} else {
			this.dialog.getContent().getNode('from').getComponent().getElement().focus();
		}
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_onSend(player, model) {
		if (this.sendPromise) return this.sendPromise;

		let pose = false;
		let ooc = false;
		let text = model.text;
		let m = text.match(/^\s*:/);
		if (m) {
			pose = true;
			text = text.substring(m[0].length);
		}
		m = text.match(/^\s*>/);
		if (m) {
			ooc = true;
			text = text.substring(m[0].length);
		}
		if (!pose) {
			m = text.match(/^\s*:/);
			if (m) {
				pose = true;
				text = text.substring(m[0].length);
			}
		}

		this.sendPromise = this.module.api.call('mail.player.' + player.id + '.inbox', 'send', {
			toCharId: model.to,
			fromCharId: model.from,
			text,
			pose,
			ooc,
		}).then(() => {
			this.close();
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.sendPromise = null;
		});

		return this.sendPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		try {
			let n = this.dialog.getContent().getNode('message');
			n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
		} catch (e) {
			console.error(e);
		}
	}
}

export default DialogSendMail;
