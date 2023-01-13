import { Elem } from 'modapp-base-component';
import { Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PopupTip from 'components/PopupTip';
import './dialogCreateChar.scss';

class DialogCreateChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open() {
		if (this.dialog) return;

		let model = new Model({ data: {
			name: "",
			surname: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCreateChar.createNewChar', "Create new character"),
			className: 'dialogcreatechar',
			content: new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row dialogcreatechar--disclaimer' }, [
					n.component(new Txt(l10n.l('dialogCreateChar.noCanonNames', "No canon characters or established figures."), { className: 'flex-1 dialogcreatechar--disclaimer-info' })),
					n.component(new PopupTip(l10n.l('dialogCreateChar.noCanonNamesInfo', "Roleplaying real people, established figures, or characters created or owned by someone else is not allowed."), {
						className: 'popuptip--width-m flex-auto',
						position: 'left-bottom',
					})),
				]),
				n.component('name', new PanelSection(
					l10n.l('dialogCreateChar.name', "Name"),
					new Input("", {
						events: { input: c => model.set({ name: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateChar.nameInfo', "Character name may contain numbers, letters, dash (-), and apostrophe (').\nIt can be changed later."),
						popupTipPosition: 'left',
					},
				)),
				n.component(new PanelSection(
					l10n.l('dialogCreateChar.surname', "Surname"),
					new Input("", {
						events: { input: c => model.set({ surname: c.getValue() }) },
						attributes: { name: 'dialogcreatechar-surname', spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateChar.surnameInfo', "Surname is used for unique identification, and may contain numbers, letters, dash (-), apostrophe ('), and spaces. It may also be titles (eg. \"the Beast\") or other creative name endings.\nIt can be changed later."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onCreate(model) },
						className: 'btn primary dialog--btn',
					}, [
						n.component(new Txt(l10n.l('dialogcreatechar.create', "Create"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('name').getComponent().getElement().focus();
	}

	_onCreate(model) {
		if (this.createPromise) return this.createPromise;

		this.createPromise = this.module.player.getPlayer().call('createChar', {
			name: model.name,
			surname: model.surname,
		}).then(char => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.createPromise = null;
		});

		return this.createPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogCreateChar;
