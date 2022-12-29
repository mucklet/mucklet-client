import { Elem, Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import './dialogUndeleteChar.scss';

function isId(v) {
	return v.trim().match(/^#?[a-vA-V0-9]{20,20}$/);
}

function trimId(v) {
	return v.trim().replace(/^#/, '');
}

class DialogUndeleteChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'player',
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open() {
		if (this.dialog) return;

		let player = this.module.player.getPlayer();
		if (!player) return;


		let model = new Model({ data: {
			charId: "",
			ownerId: "",
			roomId: "",
			name: "",
			surname: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogUndeleteChar.undeleteChar', "Undelete character"),
			className: 'dialogundeletechar',
			content: new Elem(n => n.elem('div', [
				n.component('charId', new PanelSection(
					l10n.l('dialogUndeleteChar.charId', "Character #ID"),
					new Input("", {
						className: 'dialog--input dialog--incomplete',
						attributes: { placeholder: "Enter the #ID of a deleted character", name: 'dialogundeletechar-charid', spellcheck: 'false' },
						events: {
							input: c => {
								let v = c.getProperty('value');
								model.set({ charId: v });
								c[isId(v) ? 'removeClass' : 'addClass']('dialog--incomplete');
							},
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						required: true,
					},
				)),
				n.component('ownerId', new PanelSection(
					l10n.l('dialogUndeleteChar.newOwner', "New owner"),
					new Input("", {
						className: 'dialog--input dialog--incomplete',
						attributes: { placeholder: "Enter a user #ID or leave empty", name: 'dialogundeletechar-userid', spellcheck: 'false' },
						events: {
							input: c => {
								let v = c.getProperty('value');
								model.set({ ownerId: v });
								c[isId(v) ? 'removeClass' : 'addClass']('dialog--incomplete');
							},
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogUndeleteChar.newOwnerInfo', "ID of a new owner of the character once undeleted. The owner must not have reached their max number of character count. If left empty, the old owner will be used."),
					},
				)),
				n.component('roomId', new PanelSection(
					l10n.l('dialogUndeleteChar.newRoom', "New room"),
					new Input("", {
						className: 'dialog--input dialog--incomplete',
						attributes: { placeholder: "Enter a room #ID or leave empty", name: 'dialogundeletechar-userid', spellcheck: 'false' },
						events: {
							input: c => {
								let v = c.getProperty('value');
								model.set({ roomId: v });
								c[isId(v) ? 'removeClass' : 'addClass']('dialog--incomplete');
							},
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogUndeleteChar.newRoomInfo', "ID of a room to move the undeleted character. If left empty, the old room will be used."),
					},
				)),
				n.component('name', new PanelSection(
					l10n.l('dialogUndeleteChar.newName', "New name"),
					new Input("", {
						events: { input: c => model.set({ name: c.getValue() }) },
						attributes: { placeholder: "Leave empty to use old name", name: 'dialogundeletechar-name', spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogUndeleteChar.newNameInfo', "A new name of the character. If left empty, the old name will be used."),
					},
				)),
				n.component('surname', new PanelSection(
					l10n.l('dialogUndeleteChar.newSurname', "New surname"),
					new Input("", {
						events: { input: c => model.set({ surname: c.getValue() }) },
						attributes: { placeholder: "Leave empty to use old surname", name: 'dialogundeletechar-surname', spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogUndeleteChar.newSurnameInfo', "A new surname of the character. If left empty, the old surname will be used."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer flex-row margin16' }, [
					n.elem('button', {
						events: { click: () => this._onSend(player, model) },
						className: 'btn primary flex-1',
					}, [
						n.component(new Txt(l10n.l('dialogUndeleteChar.undelete', "Undelete"))),
					]),
					n.elem('button', {
						className: 'btn secondary flex-1',
						events: { click: () => this.close() },
					}, [
						n.component(new Txt(l10n.l('dialogUndeleteChar.cancel', "Cancel"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('charId').getComponent().getElement().focus();
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_onSend(player, model) {
		if (this.undeletePromise) return this.undeletePromise;

		this.undeletePromise = player.call('undeleteChar', {
			charId: trimId(model.charId),
			ownerId: trimId(model.ownerId) || undefined,
			roomId: trimId(model.roomId) || undefined,
			name: model.name.trim() || undefined,
			surname: model.surname.trim() || undefined,
		}).then(() => {
			this.close();
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.undeletePromise = null;
		});

		return this.undeletePromise;
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

export default DialogUndeleteChar;
