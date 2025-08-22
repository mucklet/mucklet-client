import { Elem } from 'modapp-base-component';
import { Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import './dialogCreateRelease.scss';

class DialogCreateRelease {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to create a new release of a given type
	 * @param {"realm" | "node"} type Type of release.
	 * @param {object} [opt] Optional parameters.
	 * @param {(release: ResModel) => void} [opt.onCreate] Callback called on release create.
	 * @returns {Promise} Promise to the opened dialog object.
	 */
	open(type, opt) {
		if (!this.dialog) {
			let model = new Model({ data: {
				name: "",
				version: "",
			}, eventBus: this.app.eventBus });

			let messageComponent = new Collapser();
			this.dialog = new Dialog({
				title: type == 'realm'
					? l10n.l('dialogCreateRelease.createRealmRelease', "Create realm release")
					: type == 'node'
						? l10n.l('dialogCreateRelease.createNodeRelease', "Create node release")
						: l10n.l('dialogCreateRelease.createNewRelease', "Create new release"),
				className: 'dialogcreaterelease',
				content: new Elem(n => n.elem('div', [
					// Name
					n.component('name', new PanelSection(
						l10n.l('dialogCreateRelease.name', "Name"),
						new Input(model.name, {
							events: { input: c => model.set({ name: c.getValue() }) },
							attributes: { spellcheck: 'false' },
							className: 'dialog--input',
						}),
						{
							className: 'common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('dialogCreateRelease.nameInfo', "Human readable version name of the release, such as \"1.23.4\" or \"1.24.0-rc1\"."),
							popupTipPosition: 'left-bottom',
						},
					)),
					// Version
					n.component(new PanelSection(
						l10n.l('dialogCreateRelease.version', "Version"),
						new Input(model.version, {
							events: { input: c => model.set({ version: c.getValue() }) },
							attributes: { spellcheck: 'false' },
							className: 'dialog--input',
						}),
						{
							className: 'common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('dialogCreateRelease.versionInfo', "Release version in the format \"MAJOR.MINOR.PATCH\"."),
						},
					)),
					// Message
					n.component(messageComponent),
					// Footer
					n.elem('div', { className: 'pad-top-xl' }, [
						n.elem('create', 'button', {
							events: { click: () => this._onCreate(type, model, messageComponent, opt) },
							className: 'btn primary dialog--btn',
						}, [
							n.component(new Txt(l10n.l('dialogCreateRelease.create', "Create"))),
						]),
					]),
				])),
				onClose: () => { this.dialog = null; },
			});

			this.dialog.open();
			this.dialog.getContent().getNode('name').getComponent().getElement().focus();
		}

		return this.dialog;
	}

	_onCreate(type, model, messageComponent, opt) {
		if (this.createPromise) return this.createPromise;

		this._setMessage(messageComponent);

		this.createPromise = this.module.api.call(`control.overseer.releases.${type}`, 'create', {
			name: model.name,
			version: model.version,
		}).then((result) => {
			if (this.dialog) {
				this.dialog.close();
			}
			opt?.onCreate?.(result);
		}).catch(err => {
			this._setMessage(messageComponent, l10n.l(err.code, err.message, err.data));
		}).finally(() => {
			this.createPromise = null;
		});

		return this.createPromise;
	}

	_setMessage(c, msg) {
		c.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogCreateRelease;
