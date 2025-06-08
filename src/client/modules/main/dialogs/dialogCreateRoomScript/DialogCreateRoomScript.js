import { Elem } from 'modapp-base-component';
import { Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import LabelToggleBox from 'components/LabelToggleBox';
import './dialogCreateRoomScript.scss';

/**
 * Opens a dialog to create a room script for the room the controlled character
 * is currently in.
 */
class DialogCreateRoomScript {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a create room script dialog.
	 * @param {Model} ctrl Controlled character.
	 * @param {object} [opt] Optional parameters.
	 * @param {(script: { id: string, key: string }, room: { id: string, name: string }) => void} [opt.onCreate] Callback called on script create.
	 */
	open(ctrl, opt) {
		if (this.dialog) return;

		let model = new Model({ data: {
			key: "",
			active: true,
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCreateRoomScript.createNewRoomScript', "Create new room script"),
			className: 'dialogcreateroomscript',
			content: new Elem(n => n.elem('div', [
				// Keyword
				n.component('key', new PanelSection(
					l10n.l('dialogCreateRoomScript.keyword', "Keyword"),
					new Input(model.key, {
						events: { input: c => model.set({ key: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateRoomScript.keyInfo', "Keyword is used to identify the room script in console commands and other contexts."),
						popupTipPosition: 'left-bottom',
					},
				)),
				// Active
				n.component(new LabelToggleBox(l10n.l('dialogCreateRoomScript.active', "Is active"), model.active, {
					className: 'common--formmargin',
					onChange: v => model.set({ active: v }),
				})),
				// Disclaimer
				n.elem('div', { className: 'dialogcreateroomscript--disclaimer' }, [
					n.component(new Txt(l10n.l('dialogCreateRoomScript.createScriptInfo', "A script editor will be opened once created."), { tagName: 'div' })),
				]),
				// Message
				n.component('message', new Collapser(null)),
				// Footer
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onCreate(ctrl, model, opt) },
						className: 'btn primary dialog--btn',
					}, [
						n.component(new Txt(l10n.l('dialogCreateRoomScript.create', "Create"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('key').getComponent().getElement().focus();
	}

	_onCreate(ctrl, model, opt) {
		if (this.createPromise) return this.createPromise;

		this.createPromise = ctrl.call('createRoomScript', {
			key: model.key,
			active: model.active,
		}).then((result) => {
			if (this.dialog) {
				this.dialog.close();
			}
			opt?.onCreate?.(result);
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

export default DialogCreateRoomScript;
