import { Elem, Txt, Context, Input, Textarea } from 'modapp-base-component';
import { ModifyModel, CollectionWrapper } from 'modapp-resource';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import Img from 'components/Img';
import FileButton from 'components/FileButton';
import ImgModal from 'classes/ImgModal';
import renderingModes from 'utils/renderingModes';

/**
 * RouteRealmSettingsRealm draws the settings form for a realm.
 */
class RouteRealmSettingsRealm {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Context(
			() => new ModifyModel(this.realm, {
				eventBus: this.module.self.app.eventBus,
			}),
			realm => realm.dispose(),
			realm => new Elem(n => n.elem('div', { className: 'routerealmsettings-realm' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [
					n.component(new PageHeader(l10n.l('routeRealmSettings.realmSettings', "Realm settings"), "", { className: 'flex-1' })),
					n.elem('div', { className: 'flex-col' }, [
						n.elem('button', {
							className: 'btn fa small',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.router.setRoute('realms', { realmId: this.realm.id });
								},
							},
						}, [
							n.component(new FAIcon('angle-left')),
							n.component(new Txt(l10n.l('routeRealmSettings.backToRealms', "Back to Realms"))),
						]),
					]),
				]),
				n.elem('div', { className: 'common--hr' }),

				// Section tools
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => t.type == 'topSection',
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => t.componentFactory(realm),
						{
							subClassName: t => t.className || null,
						},
					),
				)),

				// Name
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.realmName', "Realm name"),
					new ModelComponent(
						realm,
						new Input("", {
							events: { input: c => realm.set({ name: c.getValue() }) },
							attributes: { name: 'routerealmsettings-name', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeRealmSettings.nameInfo', "Realm name is the primary name for the realm."),
					},
				)),

				// Description
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.description', "Description"),
					new ModelComponent(
						realm,
						new Textarea(realm.desc, {
							className: 'common--paneltextarea-small common--desc-size',
							events: { input: c => realm.set({ desc: c.getValue() }) },
							attributes: { name: 'routerealmsettings-desc', spellcheck: 'true' },
						}),
						(m, c) => c.setValue(m.desc),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Image
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.image', "Image"),
					new Elem(n => n.elem('div', { className: 'flex-col gap8' }, [
						n.elem('div', { className: 'flex-row' }, [
							n.component(new ModelComponent(
								this.realm,
								new Img('', { className: 'routerealmsettings-realm--image', events: {
									click: c => {
										if (!c.hasClass('placeholder')) {
											new ImgModal(this.realm.image.href).open();
										}
									},
								}}),
								(m, c, changed) => {
									c.setSrc(m.image ? m.image.href + '?thumb=lw' : '/img/realm-placeholder.svg');
									c[m.image ? 'removeClass' : 'addClass']('placeholder');
									for (let mode of renderingModes) {
										if (mode.className) {
											c[m.image?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
										}
									}
								},
							)),
						]),
						n.elem('div', { className: 'flex-row gap8' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('routeRealmSettings.upload', "Upload"))),
								])),
								(file, dataUrl) => this.module.dialogCropImage.open(
									dataUrl,
									(dataUrl, points, mode) => this._setImage(file, points, mode),
									{
										className: 'routerealmsettings-realm--cropimage',
										viewport: { width: 320, height: 180 },
										boundary: { width: 480, height: 270 },
										withRenderingMode: true,
									},
								),
								{ className: 'btn medium icon-left' },
							)),
							n.component(new ModelComponent(
								this.realm,
								new Elem(n => n.elem('button', {
									className: 'btn medium icon-left',
									events: {
										click: () => this.module.confirm.open(() => this._deleteImage(), {
											title: l10n.l('routeRealmSettings.confirmDelete', "Confirm deletion"),
											body: l10n.l('routeRealmSettings.deleteImageBody', "Do you really wish to delete the realm image?"),
											confirm: l10n.l('routeRealmSettings.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('routeRealmSettings.delete', "Delete"))),
								])),
								(m, c) => c.setProperty('disabled', m.image ? null : 'disabled'),
							)),
						]),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Icon
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.icon', "Icon"),
					new Elem(n => n.elem('div', { className: 'flex-col gap8' }, [
						n.elem('div', { className: 'flex-auto' }, [
							n.component(new ModelComponent(
								this.realm,
								new Img('', { className: 'routerealmsettings-realm--icon', events: {
									click: c => {
										if (!c.hasClass('placeholder')) {
											new ImgModal(this.realm.icon.href).open();
										}
									},
								}}),
								(m, c, changed) => {
									c.setSrc(m.icon ? m.icon.href + '?thumb=xl' : '/img/realmicon-placeholder.svg');
									c[m.icon ? 'removeClass' : 'addClass']('placeholder');
									for (let mode of renderingModes) {
										if (mode.className) {
											c[m.icon?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
										}
									}
								},
							)),
						]),
						n.elem('div', { className: 'flex-row gap8' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('routeRealmSettings.upload', "Upload"))),
								])),
								(file, dataUrl) => this.module.dialogCropImage.open(
									dataUrl,
									(dataUrl, points, mode) => this._setIcon(file, points, mode),
									{
										withRenderingMode: true,
									},
								),
								{ className: 'btn medium icon-left' },
							)),
							n.component(new ModelComponent(
								this.realm,
								new Elem(n => n.elem('button', {
									className: 'btn medium icon-left',
									events: {
										click: () => this.module.confirm.open(() => this._deleteIcon(), {
											title: l10n.l('routeRealmSettings.confirmDelete', "Confirm deletion"),
											body: l10n.l('routeRealmSettings.deleteIconBody', "Do you really wish to delete the realm icon?"),
											confirm: l10n.l('routeRealmSettings.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('routeRealmSettings.delete', "Delete"))),
								])),
								(m, c) => c.setProperty('disabled', m.icon ? null : 'disabled'),
							)),
						]),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Section tools
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => !t.type || t.type == 'section',
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => t.componentFactory(realm),
						{
							subClassName: t => t.className || null,
						},
					),
				)),

				// Message
				n.component(this.messageComponent),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary common--btnwidth',
								events: {
									click: () => this._save(realm),
								},
							}, [
								n.component(new Txt(l10n.l('routeRealmSettings.saveChanges', "Save changes"))),
							])),
							(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
						)),
					]),
					n.elem('div', { className: 'flex-auto' }, [

						// Footer tools
						n.component(new Context(
							() => new CollectionWrapper(this.module.self.getTools(), {
								filter: t => t.type == 'footer',
							}),
							tools => tools.dispose(),
							tools => new CollectionList(
								tools,
								t => t.componentFactory(realm),
								{
									horizontal: true,
									className: 'routerealmsettings-realm--footertools',
									subClassName: t => t.className || null,
								},
							),
						)),

					]),

				]),

			])),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}

	_save(model) {
		let params = model.getModifications();
		if (!params) {
			return;
		}

		// Prepare params from tools
		for (let tool of this.module.self.getTools()) {
			params = tool.onSave?.(params) || params;
		}

		this._setMessage();
		return this.realm.call('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_setImage(file, points, mode) {
		return this.module.file.upload(file, 'control.upload.realmImage')
			.then(result => this.realm.call('setImage', {
				uploadId: result.uploadId,
				x1: parseInt(points[0]),
				y1: parseInt(points[1]),
				x2: parseInt(points[2]),
				y2: parseInt(points[3]),
				rendering: mode,
			})).then(() => this.module.toaster.open({
				title: l10n.l('routeRealmSettings.imageUploaded', "Image uploaded"),
				content: new Txt(l10n.l('routeRealmSettings.imageUploadedBody', "Image was uploaded and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_deleteImage() {
		return this.realm.call('deleteImage')
			.then(() => this.module.toaster.open({
				title: l10n.l('routeRealmSettings.imageDeleted', "Image deleted"),
				content: new Txt(l10n.l('routeRealmSettings.imageDeletedBody', "Image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_setIcon(file, points, mode) {
		return this.module.file.upload(file, 'control.upload.realmIcon')
			.then(result => this.realm.call('setIcon', {
				uploadId: result.uploadId,
				x1: parseInt(points[0]),
				y1: parseInt(points[1]),
				x2: parseInt(points[2]),
				y2: parseInt(points[3]),
				rendering: mode,
			})).then(() => this.module.toaster.open({
				title: l10n.l('routeRealmSettings.iconUploaded', "Icon uploaded"),
				content: new Txt(l10n.l('routeRealmSettings.iconUploadedBody', "Icon was uploaded and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_deleteIcon() {
		return this.realm.call('deleteIcon')
			.then(() => this.module.toaster.open({
				title: l10n.l('routeRealmSettings.iconDeleted', "Icon deleted"),
				content: new Txt(l10n.l('routeRealmSettings.iconDeletedBody', "Icon was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}
}

export default RouteRealmSettingsRealm;
