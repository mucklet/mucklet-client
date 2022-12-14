import { Elem } from 'modapp-base-component';
import { Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import './dialogCreateRoomProfile.scss';

/**
 * Opens a dialog to create a room profile for the room the controlled character
 * is currently in.
 */
class DialogCreateRoomProfile {
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
	 * Opens a create room profile dialog.
	 * @param {Model} ctrl Controlled character.
	 */
	open(ctrl) {
		if (this.dialog) return;

		let model = new Model({ data: {
			name: "",
			key: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCreateRoomProfile.createNewRoomProfile', "Create new room profile"),
			className: 'dialogcreateroomprofile',
			content: new Elem(n => n.elem('div', [
				n.component('name', new PanelSection(
					l10n.l('dialogCreateRoomProfile.profileName', "Profile name"),
					new Input("", {
						events: { input: c => model.set({ name: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateRoomProfile.nameInfo', "A short but descriptive name for the profile."),
						popupTipPosition: 'left-bottom',
					},
				)),
				n.component(new PanelSection(
					l10n.l('dialogCreateRoomProfile.keyword', "Keyword"),
					new Input(model.key, {
						events: { input: c => model.set({ key: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateRoomProfile.keyInfo', "Keyword is used to identify the room profile in console commands."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onCreate(ctrl, model) },
						className: 'btn primary dialog--btn',
					}, [
						n.component(new Txt(l10n.l('dialogCreateRoomProfile.create', "Create"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('name').getComponent().getElement().focus();
	}

	_onCreate(ctrl, model) {
		if (this.createPromise) return this.createPromise;

		this.createPromise = ctrl.call('createRoomProfile', {
			name: model.name,
			key: model.key,
		}).then(() => {
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

export default DialogCreateRoomProfile;
