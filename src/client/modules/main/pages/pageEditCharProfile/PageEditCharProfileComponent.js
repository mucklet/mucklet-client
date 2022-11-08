import { Context, Elem, Txt, Input, Textarea } from 'modapp-base-component';
import { ModelComponent, CollectionComponent, ModelTxt } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import PanelSection from 'components/PanelSection';


class PageEditCharProfileComponent {
	constructor(module, ctrl, profile, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.profile = profile;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.profile, {
			props: this.state.changes,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new CollectionComponent(
			this.ctrl.profiles,
			new Elem(n => n.elem('div', { className: 'pageeditcharprofile' }, [
				n.component(new PanelSection(
					l10n.l('pageEditCharProfile.image', "Image"),
					new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
						n.elem('div', { className: 'flex-1' }, [
							n.component(this.module.avatar.newCharImg(this.profile, { modalOnClick: true, size: 'xlarge' })),
						]),
						n.elem('div', { className: 'pageeditcharprofile--imagebtn flex-1' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('pageEditCharProfile.upload', "Upload"))),
								])),
								(file, dataUrl) => {
									this.module.dialogCropImage.open(
										dataUrl,
										(dataUrl, points) => this._setProfileImage(dataUrl, points),
									);
								},
								{ className: 'btn medium icon-left' },
							)),
							n.component(new Context(
								() => ({ dialog: null }),
								null,
								ctx => new ModelComponent(
									this.profile,
									new ModelComponent(
										this.ctrl,
										new Elem(n => n.elem('button', {
											className: 'btn medium icon-left',
											events: {
												click: () => ctx.dialog = this.module.confirm.open(() => this._copyProfileImage(), {
													title: l10n.l('pageEditCharProfile.confirmUpdate', "Confirm image update"),
													body: new Elem(n => n.elem('div', [
														n.component(new Txt(l10n.l('pageEditCharProfile.deleteImageBody', "Do you really wish to update the profile with current character image?"), { tagName: 'p' })),
														n.component(this.module.avatar.newCharImg(this.ctrl, {
															size: 'xlarge',
															resolve: v => v.href,
														})),
													])),
													confirm: l10n.l('pageEditCharProfile.update', "Update"),
													onClose: () => ctx.dialog = null,
												}),
											},
										}, [
											n.component(new FAIcon('refresh')),
											n.component(new Txt(l10n.l('pageEditCharProfile.update', "Update"))),
										])),
										(m, c) => this._setUpdateImageDisabled(c, ctx),
									),
									(m, c) => this._setUpdateImageDisabled(c.getComponent(), ctx),
								)),
							),
							n.component(new ModelComponent(
								this.profile,
								new Elem(n => n.elem('button', {
									className: 'btn medium icon-left',
									events: {
										click: () => this.module.confirm.open(() => this._deleteCharImage(), {
											title: l10n.l('pageEditCharProfile.confirmDelete', "Confirm deletion"),
											body: new Elem(n => n.elem('div', [
												n.component(new Txt(l10n.l('pageEditCharProfile.deleteImageBody', "Do you really wish to delete the image for the profile?"), { tagName: 'p' })),
												n.elem('p', [ n.component(new ModelTxt(this.profile, m => m.name, { className: 'dialog--strong' })) ]),
											])),
											confirm: l10n.l('pageEditCharProfile.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('pageEditCharProfile.delete', "Delete"))),
								])),
								(m, c) => c.setProperty('disabled', m.image ? null : 'disabled'),
							)),
						]),
					])),
					{
						className: 'common--sectionpadding pageeditcharprofile--imagesection',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditCharProfile.avatar', "Avatar"),
					new Elem(n => n.elem('div', { className: 'flex-row pad8' }, [
						n.elem('div', { className: 'flex-auto' }, [
							n.component(this.module.avatar.newAvatar(this.profile, { char: this.ctrl, size: 'large' })),
						]),
						n.elem('div', { className: 'pageeditchar--avatarbtn flex-auto' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('pageEditCharProfile.upload', "Upload"))),
								])),
								(file, dataUrl) => this.module.dialogCropImage.open(
									dataUrl,
									(dataUrl, points) => this._setProfileAvatar(dataUrl, points),
								),
								{ className: 'btn small icon-left' },
							)),
							n.component(new Context(
								() => ({ dialog: null }),
								null,
								ctx => new ModelComponent(
									this.profile,
									new ModelComponent(
										this.ctrl,
										new Elem(n => n.elem('button', {
											className: 'btn small icon-left',
											events: {
												click: () => ctx.dialog = this.module.confirm.open(() => this._copyProfileAvatar(), {
													title: l10n.l('pageEditCharProfile.confirmUpdate', "Confirm avatar update"),
													body: new Elem(n => n.elem('div', [
														n.component(new Txt(l10n.l('pageEditCharProfile.deleteAvatarBody', "Do you really wish to update the profile with current character avatar?"), { tagName: 'p' })),
														n.component(this.module.avatar.newAvatar(this.ctrl, { size: 'large' })),
													])),
													confirm: l10n.l('pageEditCharProfile.update', "Update"),
													onClose: () => ctx.dialog = null,
												}),
											},
										}, [
											n.component(new FAIcon('refresh')),
											n.component(new Txt(l10n.l('pageEditCharProfile.update', "Update"))),
										])),
										(m, c) => this._setUpdateAvatarDisabled(c, ctx),
									),
									(m, c) => this._setUpdateAvatarDisabled(c.getComponent(), ctx),
								)),
							),
						]),
						n.elem('div', { className: 'pageeditchar--avatarbtn flex-auto' }, [
							n.component(new ModelComponent(
								this.profile,
								new Elem(n => n.elem('button', {
									className: 'btn small icon-left',
									events: {
										click: () => this.module.confirm.open(() => this._deleteProfileAvatar(), {
											title: l10n.l('pageEditCharProfile.confirmDelete', "Confirm deletion"),
											body: new Elem(n => n.elem('div', [
												n.component(new Txt(l10n.l('pageEditCharProfile.deleteImageBody', "Do you really wish to delete the avatar for the profile?"), { tagName: 'p' })),
												n.elem('p', [ n.component(new ModelTxt(this.profile, m => m.name, { className: 'dialog--strong' })) ]),
											])),
											confirm: l10n.l('pageEditCharProfile.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('pageEditCharProfile.delete', "Delete"))),
								])),
								(m, c) => c.setProperty('disabled', m.avatar ? null : 'disabled'),
							)),
						]),
					])),
					{
						className: 'common--sectionpadding pageeditchar--imagesection',
						noToggle: true,
						popupTip: l10n.l('pageEditCharProfile.avatarInfo', "Avatar is a small image used to represent the character. Others can see it without having to look at the character. Optimal size is 192x192."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditCharProfile.profileName', "Profile name"),
					new ModelComponent(
						this.model,
						new Input(this.model.name, {
							events: { input: c => this.model.set({ name: c.getValue() }) },
							attributes: { name: 'editcharprofile-name', spellcheck: 'true' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditCharProfile.nameInfo', "A short but descriptive name for the profile."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditCharProfile.keyword', "Keyword"),
					new ModelComponent(
						this.model,
						new Input(this.model.key, {
							events: { input: c => this.model.set({ key: c.getValue() }) },
							attributes: { name: 'editcharprofile-key', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.key),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditCharProfile.keyInfo', "Keyword is used to identify the character profile in console commands."),
					},
				)),
				n.elem('div', { className: 'pageeditcharprofile--details flex-row pad8' }, [
					n.component(new PanelSection(
						l10n.l('pageEditCharProfile.gender', "Gender"),
						new ModelComponent(
							this.model,
							new Input(this.model.gender, {
								events: { input: c => this.model.set({ gender: c.getValue() }) },
								attributes: { name: 'editcharprofile-gender', spellcheck: 'false' },
							}),
							(m, c) => c.setValue(m.gender),
						),
						{
							className: 'flex-1 common--sectionpadding',
							noToggle: true,
						},
					)),
					n.component(new PanelSection(
						l10n.l('pageEditCharProfile.species', "Species"),
						new ModelComponent(
							this.model,
							new Input(this.model.species, {
								events: { input: c => this.model.set({ species: c.getValue() }) },
								attributes: { name: 'editcharprofile-species', spellcheck: 'false' },
							}),
							(m, c) => c.setValue(m.species),
						),
						{
							className: 'flex-1 common--sectionpadding',
							noToggle: true,
						},
					)),
				]),
				n.component(new PanelSection(
					l10n.l('pageEditCharProfile.desc', "Description"),
					new ModelComponent(
						this.model,
						new Textarea(this.model.desc, {
							className: 'common--paneltextarea common--desc-size',
							events: { input: c => this.model.set({ desc: c.getValue() }) },
							attributes: { name: 'editcharprofile-desc', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.desc),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.elem('update', 'button', { events: {
							click: () => this._save(),
						}, className: 'btn primary common--btnwidth' }, [
							n.component(new ModelTxt(this.model, m => m.isModified
								? l10n.l('pageEditCharProfile.update', "Save edits")
								: l10n.l('pageEditCharProfile.close', "Close"))),
						]),
					]),
					n.elem('button', { events: {
						click: () => this.module.confirm.open(() => this._delete(), {
							title: l10n.l('pageEditCharProfile.confirmDelete', "Confirm deletion"),
							body: l10n.l('pageEditCharProfile.deleteProfileBody', "Do you really wish to delete this profile?"),
							confirm: l10n.l('pageEditCharProfile.delete', "Delete"),
						}),
					}, className: 'iconbtn medium' }, [
						n.component(new FAIcon('trash')),
					]),
				]),
			])),
			(col, c, ev) => {
				// Check that the profile still exists
				let id = this.profile.id;
				for (let p of col) {
					if (p.id === id) return;
				}
				this._close();
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
		if (this.model) {
			this.state.changes = this.model.getModifications() || {};
			this.model.dispose();
			this.model = null;
		}
	}

	_save() {
		let p;
		if (!this.model) {
			p = Promise.resolve();
		} else {
			let change = this.model.getModifications();
			p = change
				? this.ctrl.call('setProfile', Object.assign(change, { profileId: this.profile.id }))
				: Promise.resolve();
		}

		return p.then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		});
	}

	_setMessage(msg) {
		if (!this.elem) return;
		this.elem.getNode('message').setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_close() {
		this.close();
		if (this.model) {
			this.model.dispose();
			this.model = null;
		}
		this.state.changes = {};
	}

	_setProfileImage(dataUrl, points) {
		return this.ctrl.call('setProfileImage', {
			profileId: this.profile.id,
			dataUrl,
			x1: parseInt(points[0]),
			y1: parseInt(points[1]),
			x2: parseInt(points[2]),
			y2: parseInt(points[3]),
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditCharProfile.imageUploaded', "Image uploaded"),
			content: new Txt(l10n.l('pageEditCharProfile.imageUploadedBody', "Profile image was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_copyProfileImage() {
		return this.ctrl.call('copyProfileImage', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditCharProfile.imageUpdate', "Image updated"),
				content: new Txt(l10n.l('pageEditCharProfile.imageUpdateBody', "Profile image was updated and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_deleteCharImage() {
		return this.ctrl.call('deleteProfileImage', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditCharProfile.imageDeleted', "Image deleted"),
				content: new Txt(l10n.l('pageEditCharProfile.imageDeletedBody', "Profile image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_setProfileAvatar(dataUrl, points) {
		return this.ctrl.call('setProfileAvatar', {
			profileId: this.profile.id,
			dataUrl,
			x1: parseInt(points[0]),
			y1: parseInt(points[1]),
			x2: parseInt(points[2]),
			y2: parseInt(points[3]),
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditCharProfile.avatarUploaded', "Avatar uploaded"),
			content: new Txt(l10n.l('pageEditCharProfile.avatarUploadedBody', "Profile avatar was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_copyProfileAvatar() {
		return this.ctrl.call('copyProfileAvatar', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditCharProfile.avatarUpdate', "Avatar updated"),
				content: new Txt(l10n.l('pageEditCharProfile.avatarUpdateBody', "Profile avatar was updated and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_deleteProfileAvatar() {
		return this.ctrl.call('deleteProfileAvatar', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditCharProfile.avatarDeleted', "Avatar deleted"),
				content: new Txt(l10n.l('pageEditCharProfile.avatarDeletedBody', "Profile avatar was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_delete() {
		this.module.deleteProfile.deleteProfile(this.ctrl, { profileId: this.profile.id })
			.catch(err => this._setMessage(l10n.l(err.code, err.message, err.data)));
	}

	_setUpdateImageDisabled(component, ctx) {
		this._setUpdateDisabled(component, ctx, !this.ctrl.image || this.module.avatar.charImgHref(this.profile) == this.ctrl.image.href);
	}

	_setUpdateAvatarDisabled(component, ctx) {
		this._setUpdateDisabled(component, ctx, !this.ctrl.avatar || this.profile.avatar == this.ctrl.avatar);
	}

	_setUpdateDisabled(component, ctx, disable) {
		component.setProperty('disabled', disable ? 'disabled' : null);
		if (disable && ctx.dialog) {
			ctx.dialog.close();
			ctx.dialog = null;
		}
	}
}

export default PageEditCharProfileComponent;
