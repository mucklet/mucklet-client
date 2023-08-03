import { Elem, Txt, Textarea, Context } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PopupTip from 'components/PopupTip';
import Dialog from 'classes/Dialog';
import './dialogEditDndMsg.scss';

class DialogEditDndMsg {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'auth', 'player', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(char, puppeteer, charSettings) {
		if (this.dialog) return;

		this.dialog = new Dialog({
			title: l10n.l('dialogEditDndMsg.doNotDisturbMessage', "Do not disturb message"),
			className: 'dialogeditdndmsg',
			content: new Context(
				() => new ModifyModel(charSettings, { eventBus: this.app.eventBus }),
				model => model.dispose(),
				model => new Elem(n => n.elem('div', [
					n.elem('div', { className: 'common--sectionpadding' }, [
						n.elem('div', { className: 'flex-row' }, [
							n.component(new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialogeditdndmsg--fullname flex-1' })),
							n.component(new PopupTip(l10n.l('dialogEditDndMsg.dndMsgInfo', "The do not disturb message is sent to any character trying to message you while set as do not disturb.\nA default message will be sent if empty."), { className: 'popuptip--width-m flex-auto' })),
						]),
						n.component('dndMsg', new ModelComponent(
							model,
							new Textarea(model.dndMsg, {
								events: { input: c => model.set({ dndMsg: c.getValue() }) },
								attributes: {
									spellcheck: 'true',
									placeholder: l10n.t('dialogEditDndMsg.textPlaceholder', "Use default message."),
								},
								className: 'dialog--input common--paneltextarea-small',
							}),
							(m, c) => c.setValue(m.dndMsg),
						)),
					]),
					n.component('message', new Collapser(null)),
					n.elem('div', { className: 'pad-top-xl pad-bottom-m' }, [
						n.elem('submit', 'button', {
							events: { click: () => this._onSave(char, puppeteer, model) },
							className: 'btn primary dialogeditdndmsg--submit',
						}, [
							n.component(new ModelTxt(model, m => m.isModified
								? model.dndMsg.trim()
									? l10n.l('dialogEditDndMsg.saveMessage', "Save message")
									: l10n.l('dialogEditDndMsg.clearMessage', "Clear message")
								: l10n.l('dialogEditDndMsg.close', "Close"),
							)),
						]),
					]),
				])),
			),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getComponent().getNode('dndMsg').getComponent().getElement().focus();
	}

	_onSave(char, puppeteer, model) {
		if (this.savePromise) return this.savePromise;

		// Quick close if there are no modifications
		if (!model.isModified) {
			if (this.dialog) {
				this.dialog.close();
			}
			return;
		}

		this.module.player.getPlayer().call('setCharSettings', Object.assign({
			charId: char.id,
			puppeteerId: (puppeteer && puppeteer.id) || undefined,
		}, model.getModifications())).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.savePromise = null;
		});

		return this.savePromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogEditDndMsg;
