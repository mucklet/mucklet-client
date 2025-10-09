import { Elem, Textarea, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import './dialogEditReleaseTemplate.scss';

class DialogEditReleaseTemplate {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'confirm',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to edit an existing release template by key.
	 * @param {string} releaseId Release ID.
	 * @param {string} templateKey Template key.
	 * @param {object} [opt] Optional parameters.
	 * @param {(release: ResModel) => void} [opt.onUpdate] Callback called on release template update.
	 * @returns {Promise} Promise to the opened dialog object.
	 */
	async open(releaseId, templateKey, opt) {
		if (this.dialog) {
			return this.dialog;
		}

		try {
			let release = await this.module.api.get(`control.overseer.release.${releaseId}`);

			if (!release.templates?.[templateKey]) {
				throw new Err('dialogEditReleaseTemplate', "Template file not found");
			}

			let model = new Model({ data: {
				template: release.templates?.[templateKey],
				isModified: false,
			}, eventBus: this.app.eventBus });

			this.dialog = new Dialog({
				title: release.type == 'realm'
					? l10n.l('dialogEditReleaseTemplate.realmReleaseTemplate', "Realm release template")
					: release.type == 'node'
						? l10n.l('dialogEditReleaseTemplate.nodeReleaseTemplate', "Node release template")
						: l10n.l('dialogEditReleaseTemplate.releaseTemplate', "Release template"),
				className: 'dialogeditreleasetemplate fullscreen fixed',
				content: new ModelComponent(
					release,
					new Elem(n => n.elem('div', { className: 'dialogeditreleasetemplate--container' }, [
						// Release name and template key
						n.elem('div', { className: 'flex-auto pad-bottom-l flex-row' }, [
							n.component(new ModelTxt(release, m => m.name, {
								className: 'dialogeditreleasetemplate--release flex-1',
							})),
							n.component(new Txt(templateKey, {
								className: 'dialogeditreleasetemplate--key flex-auto',
							})),
						]),

						// Template input area
						n.component(new Textarea(model.template, {
							events: {
								input: c => {
									let v = c.getValue();
									model.set({
										template: v,
										isModified: v != release.templates?.[templateKey],
									});
								},
							},
							attributes: { spellcheck: 'false', name: 'dialogeditreleasetemplate-template' },
							className: 'dialog--input flex-1 dialogeditreleasetemplate--template',
						})),

						// Footer
						n.elem('div', { className: 'pad-top-xl flex-auto' }, [
							n.elem('create', 'button', {
								events: { click: () => this._onUpdate(release, templateKey, model, opt) },
								className: 'dialogeditreleasetemplate--btn btn primary',
							}, [
								n.component(new ModelTxt(model, m => m.isModified
									? l10n.l('dialogEditReleaseTemplate.update', "Update")
									: l10n.l('dialogEditReleaseTemplate.close', "Close"),
								)),
							]),
						]),
					])),
					(m, c, change) => {
						if (!change?.hasOwnProperty('templates')) {
							return;
						}
						// Update template value on change, unless it is
						// modified.
						let v = m.templates?.[templateKey];
						model.set(m.isModified
							? { isModified: model.template != v }
							: { template: v },
						);
					},
				),
				onClose: () => { this.dialog = null; },
			});

			this.dialog.open();
		} catch (ex) {
			console.error(`Error opening edit release ${releaseId} template file ${templateKey}:`, ex);
			this.module.confirm.openError(ex);
		}

		return this.dialog;
	}

	_onUpdate(release, templateKey, model, opt) {
		if (this.updatePromise) return this.updatePromise;

		if (!model.isModified) {
			this.dialog?.close();
			return;
		}

		this.updatePromise = release.call('set', {
			templates: { ...release.templates, [templateKey]: model.template },
		}).then((result) => {
			this.dialog?.close();
			opt?.onUpdate?.(result);
		}).catch(err => {
			this.module.toaster.openError(err, {
				title: l10n.l('dialogEditReleaseTemplate.errorUpdatingTemplate', "Error updating template"),
			});
		}).finally(() => {
			this.updatePromise = null;
		});

		return this.updatePromise;
	}
}

export default DialogEditReleaseTemplate;
