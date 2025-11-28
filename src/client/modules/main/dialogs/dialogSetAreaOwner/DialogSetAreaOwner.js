import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import './dialogSetAreaOwner.scss';

class DialogSetAreaOwner {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'player',
			'charsAwake',
			'confirm',
			'setAreaOwner',
			'requestAreaOwner',
			'searchChar',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(ctrl, area) {
		if (this.dialog) return;

		let model = new Model({ data: {
			owner: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogSetAreaOwner.setAreaOwner', "Set area owner"),
			className: 'dialogsetareaowner',
			content: new Elem(n => n.elem('div', [
				n.elem('div', [
					n.component(new Txt(l10n.l('dialogSetAreaOwner.confirmBody', "Do you want to change area ownership?"), { tagName: 'p' })),
					n.component(new ModelTxt(area, m => m.name, { tagName: 'p', className: 'dialog--strong' })),
				]),
				n.component('owner', new PanelSection(
					l10n.l('dialogSetAreaOwner.newOwner', "New owner"),
					this.module.searchChar.newSearchChar({
						placeholder: l10n.l('dialogSetAreaOwner.searchNewOwner', "Search for a new owner"),
						onSelect: (char) => model.set({ owner: char.id }),
						events: {
							input: (c, ev) => model.set({ owner: null }),
							blur: c => !model.owner && c.setProperty('value', ""),
						},
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						required: true,
						popupTip: l10n.l('dialogSetAreaOwner.playerConsent', "If the character is owned by another player, a request will be sent to that player."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer flex-row margin16' }, [
					n.component(new ModelComponent(
						model,
						new Elem(n => n.elem('button', {
							events: { click: () => this._setAreaOwner(ctrl, area, model) },
							className: 'btn primary flex-1',
						}, [
							n.component(new Txt(l10n.l('dialogSetAreaOwner.setOwner', "Set owner"))),
						])),
						(m, c) => c.setProperty('disabled', (m.owner || '').trim() ? null : 'disabled'),
					)),
					n.elem('button', {
						className: 'btn secondary flex-1',
						events: { click: () => this.close() },
					}, [
						n.component(new Txt(l10n.l('dialogSetAreaOwner.cancel', "Cancel"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		try {
			this.dialog.getContent().getComponent().getComponent().getNode('owner').getComponent().getElement().focus();
		} catch (e) {}
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_setAreaOwner(ctrl, area, model) {
		if (this.setOwnerPromise) return this.setOwnerPromise;

		let params = {
			areaId: area.id,
			charId: model.owner,
		};
		this.setOwnerPromise = this.module.setAreaOwner.setAreaOwner(ctrl, params).then(() => {
			this.close();
		}).catch(err => {
			if (err.code == 'core.newOwnerNotAllowed') {
				this.dialog.close();
				this._requestSetOwner(ctrl, params);
				return;
			}
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.setOwnerPromise = null;
		});

		return this.setOwnerPromise;
	}

	_requestSetOwner(ctrl, params) {
		this.module.confirm.open(() => this.module.requestAreaOwner.requestAreaOwner(ctrl, params)
			.catch(err => this.module.confirm.openError(err)),
		{
			title: l10n.l('dialogSetAreaOwner.requestSetOwner', "Request new owner"),
			body: l10n.l('dialogSetAreaOwner.requestExitBody', "The new owner belongs to a different player. Do you wish to make a request to that character's player?"),
			confirm: l10n.l('dialogSetAreaOwner.makeRequest', "Make request"),
			cancel: l10n.l('dialogSetAreaOwner.nevermind', "Nevermind"),
		});
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		try {
			let n = this.dialog.getContent().getComponent().getComponent().getNode('message');
			n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
		} catch (e) {}
	}
}

export default DialogSetAreaOwner;
