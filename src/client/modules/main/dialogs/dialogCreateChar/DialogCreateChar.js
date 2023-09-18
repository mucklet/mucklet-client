import { Elem, Context } from 'modapp-base-component';
import { Txt, Input } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PopupTip from 'components/PopupTip';
import './dialogCreateChar.scss';

const tips = {
	Name: {
		el: 'name',
		title: l10n.l('dialogCreateChar.chooseName', "Choose a name"),
		content: l10n.l('dialogCreateChar.chooseNameDesc', "Select a nice name for your character. Don't worry too much! You can always change it later."),
	},
	NameNoSpace: {
		el: 'name',
		title: l10n.l('dialogCreateChar.noSpaceInName', "No space in name"),
		content: l10n.l('dialogCreateChar.noSpaceInNameDesc', "A name cannot contain space. But the surname may contain multiple words."),
	},
	NameInvalid: {
		el: 'name',
		title: l10n.l('dialogCreateChar.noSymbols', "No symbols"),
		content: l10n.l('dialogCreateChar.noSymbolsInNameDesc', "Names can only contain letters, numbers, dash, or apostrophe."),
	},
	Surname: {
		el: 'surname',
		title: l10n.l('dialogCreateChar.chooseSurname', "Choose a surname"),
		content: l10n.l('dialogCreateChar.chooseSurnameDesc', "Select a surname to distinguish your character from others with the same name. Don't have a surname? Try a title instead; maybe \"the visitor\", or \"the explorer\"?"),
	},
	SurnameInvalid: {
		el: 'surname',
		title: l10n.l('dialogCreateChar.noSymbols', "No symbols"),
		content: l10n.l('dialogCreateChar.noSymbolsInSurnameDesc', "Surnames can only contain letters, numbers, dash, apostrophe, or space."),
	},
	Create: {
		el: 'button',
		position: [ 'right', 'bottom-right' ],
		title: l10n.l('dialogCreateChar.createChar', "Create your character"),
		content: l10n.l('dialogCreateChar.createCharDesc', "Satisfied with the name? Click here to create the character."),
	},
};

class DialogCreateChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'player',
			'onboarding',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to create a new character.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.onboarding] Flag to tell if we are onboarding a new player. Defaults to false.
	 */
	open(opt) {
		if (this.dialog) return;

		let model = new Model({ data: {
			name: "",
			surname: "",
			focus: null,
		}, eventBus: this.app.eventBus });

		let onboarding = !!opt?.onboarding;

		let nameComponent = new Input("", {
			events: {
				input: c => model.set({ name: c.getValue() }),
				focusout: c => {
					if (model.focus == 'name') {
						model.set({ focus: null });
					}
				},
				focus: c => model.set({ focus: 'name' }),
			},
			attributes: { spellcheck: 'false' },
			className: 'dialog--input',
		});

		let surnameComponent = new Input("", {
			events: {
				input: c => model.set({ surname: c.getValue() }),
				focusout: c => {
					if (model.focus == 'surname') {
						model.set({ focus: null });
					}
				},
				focus: c => model.set({ focus: 'surname' }),
			},
			attributes: { name: 'dialogcreatechar-surname', spellcheck: 'false' },
			className: 'dialog--input',
		});

		let messageComponent = new Collapser(null);

		let buttonComponent = new Elem(n => n.elem('create', 'button', {
			events: { click: () => this._onCreate(model, messageComponent) },
			className: 'btn primary dialog--btn',
		}, [
			n.component(new Txt(l10n.l('dialogCreateChar.create', "Create"))),
		]));

		this.dialog = new Dialog({
			title: l10n.l('dialogCreateChar.createNewChar', "Create new character"),
			className: 'dialogcreatechar',
			content: new Context(
				() => ({ tipId: null }),
				ctx => this._closeTip(ctx),
				ctx => new ModelComponent(
					model,
					new Elem(n => n.elem('div', [
						n.elem('div', { className: 'flex-row dialogcreatechar--disclaimer' }, [
							n.component(new Txt(l10n.l('dialogCreateChar.noCanonNames', "No canon characters or established figures."), { className: 'flex-1 dialogcreatechar--disclaimer-info' })),
							n.component(new PopupTip(l10n.l('dialogCreateChar.noCanonNamesInfo', "Roleplaying real people, established figures, or characters created or owned by someone else is not allowed."), {
								className: 'popuptip--width-m flex-auto',
								position: 'left-bottom',
							})),
						]),
						n.component('name', new PanelSection(
							l10n.l('dialogCreateChar.name', "Name"),
							nameComponent,
							{
								className: 'common--sectionpadding',
								noToggle: true,
								popupTip: l10n.l('dialogCreateChar.nameInfo', "Character name may contain numbers, letters, dash (-), and apostrophe (').\nIt can be changed later."),
								popupTipPosition: 'left',
							},
						)),
						n.component(new PanelSection(
							l10n.l('dialogCreateChar.surname', "Surname"),
							surnameComponent,
							{
								className: 'common--sectionpadding',
								noToggle: true,
								popupTip: l10n.l('dialogCreateChar.surnameInfo', "Surname is used for unique identification, and may contain numbers, letters, dash (-), apostrophe ('), and spaces. It may also be titles (eg. \"the Beast\") or other creative name endings.\nIt can be changed later."),
							},
						)),
						n.component(messageComponent),
						n.elem('div', { className: 'pad-top-xl' }, [
							n.component(buttonComponent),
						]),
					])),
					(m, c) => {
						if (onboarding) {
							this._setTip(m, ctx, nameComponent, surnameComponent, buttonComponent);
						}
					},
					{ postrenderUpdate: true },
				),
			),
			onClose: () => {
				this.dialog = null;
			},
		});

		this.dialog.open();
		nameComponent.getElement().focus();
	}

	_onCreate(model, messageComponent) {
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
			this._setMessage(messageComponent, l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.createPromise = null;
		});

		return this.createPromise;
	}

	_setMessage(messageComponent, msg) {
		messageComponent.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}

	_setTip(m, ctx, nameComponent, surnameComponent, buttonComponent) {
		let tipId = null;
		if (m.name.trim().length < 2) {
			tipId = 'Name';
		} else if (m.name.match(/^\s*[\p{L}\p{N}\-']+\s+[\p{L}\p{N}\-']/u)) {
			tipId = 'NameNoSpace';
		} else if (m.name.match(/[^\s\p{L}\p{N}\-']/u)) {
			tipId = 'NameInvalid';
		} else if (m.focus == 'name') {
			tipId = 'Name';
		} else if (m.surname.trim().length < 2) {
			tipId = 'Surname';
		} else if (m.surname.match(/[^\s\p{L}\p{N}\-']/u)) {
			tipId = 'SurnameInvalid';
		} else if (m.focus == 'surname') {
			tipId = 'Surname';
		} else {
			tipId = 'Create';
		}

		let o = tips[tipId];

		tipId = 'dialogCreateChar' + tipId;
		if (ctx.tipId == tipId) return;

		let el = o.el == 'name'
			? nameComponent.getElement()
			: o.el == 'surname'
				? surnameComponent.getElement()
				: buttonComponent.getElement();

		this._closeTip(ctx);
		this.module.onboarding.openTip(tipId, el, {
			priority: 30,
			position: o.position || [ 'right', 'bottom' ],
			title: o.title,
			content: o.content,
		});
		ctx.tipId = tipId;
	}

	_closeTip(ctx) {
		if (ctx.tipId) {
			this.module.onboarding.closeTip(ctx.tipId);
			ctx.tipId = null;
		}
	}
}

export default DialogCreateChar;
