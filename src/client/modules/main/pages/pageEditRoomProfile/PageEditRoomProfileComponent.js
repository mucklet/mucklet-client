import { Context, Elem, Txt, Input, Textarea } from 'modapp-base-component';
import { ModelComponent, CollectionComponent, ModelTxt } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import PanelSection from 'components/PanelSection';


class PageEditRoomProfileComponent {
	constructor(module, ctrl, room, profile, roomProfiles, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.profile = profile;
		this.roomProfiles = roomProfiles;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.profile, {
			props: this.state.changes,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new CollectionComponent(
			this.roomProfiles,
			new Elem(n => n.elem('div', { className: 'pageeditroomprofile' }, [
				n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),
				n.component(new PanelSection(
					l10n.l('pageEditRoomProfile.image', "Image"),
					new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
						n.elem('div', { className: 'flex-1' }, [
							n.component(this.module.avatar.newRoomImg(this.profile, { modalOnClick: true, size: 'xlarge' })),
						]),
						n.elem('div', { className: 'pageeditroomprofile--imagebtn flex-1' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('pageEditRoomProfile.upload', "Upload"))),
								])),
								(file, dataUrl) => this.module.createLimits.validateImageSize(
									file.size,
									() => this.module.dialogCropImage.open(
										dataUrl,
										(dataUrl, points) => this._setRoomProfileImage(file, points),
									),
								),
								{ className: 'btn medium icon-left' },
							)),
							n.component(new Context(
								() => ({ dialog: null }),
								null,
								ctx => new ModelComponent(
									this.profile,
									new ModelComponent(
										this.room,
										new Elem(n => n.elem('button', {
											className: 'btn medium icon-left',
											events: {
												click: () => ctx.dialog = this.module.confirm.open(() => this._copyRoomProfileImage(), {
													title: l10n.l('pageEditRoomProfile.confirmUpdate', "Confirm image update"),
													body: new Elem(n => n.elem('div', [
														n.component(new Txt(l10n.l('pageEditRoomProfile.deleteImageBody', "Do you really wish to update the profile with current room image?"), { tagName: 'p' })),
														n.component(this.module.avatar.newRoomImg(this.room, {
															size: 'xlarge',
															resolve: v => v.href,
														})),
													])),
													confirm: l10n.l('pageEditRoomProfile.update', "Update"),
													onClose: () => ctx.dialog = null,
												}),
											},
										}, [
											n.component(new FAIcon('refresh')),
											n.component(new Txt(l10n.l('pageEditRoomProfile.update', "Update"))),
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
										click: () => this.module.confirm.open(() => this._deleteRoomProfileImage(), {
											title: l10n.l('pageEditRoomProfile.confirmDelete', "Confirm deletion"),
											body: new Elem(n => n.elem('div', [
												n.component(new Txt(l10n.l('pageEditRoomProfile.deleteImageBody', "Do you really wish to delete the image for the profile?"), { tagName: 'p' })),
												n.elem('p', [ n.component(new ModelTxt(this.profile, m => m.name, { className: 'dialog--strong' })) ]),
											])),
											confirm: l10n.l('pageEditRoomProfile.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('pageEditRoomProfile.delete', "Delete"))),
								])),
								(m, c) => c.setProperty('disabled', m.image ? null : 'disabled'),
							)),
						]),
					])),
					{
						className: 'common--sectionpadding pageeditroomprofile--imagesection',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditRoomProfile.profileName', "Profile name"),
					new ModelComponent(
						this.model,
						new Input(this.model.name, {
							events: { input: c => this.model.set({ name: c.getValue() }) },
							attributes: { name: 'editroomprofile-name', spellcheck: 'true' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditRoomProfile.nameInfo', "A short but descriptive name for the room profile."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditRoomProfile.keyword', "Keyword"),
					new ModelComponent(
						this.model,
						new Input(this.model.key, {
							events: { input: c => this.model.set({ key: c.getValue() }) },
							attributes: { name: 'editroomprofile-key', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.key),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditRoomProfile.keyInfo', "Keyword is used to identify the room profile in console commands."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditRoomProfile.desc', "Description"),
					new ModelComponent(
						this.model,
						new Textarea(this.model.desc, {
							className: 'common--paneltextarea common--desc-size',
							events: { input: c => this.model.set({ desc: c.getValue() }) },
							attributes: { name: 'editroomprofile-desc', spellcheck: 'false' },
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
								? l10n.l('pageEditRoomProfile.update', "Save edits")
								: l10n.l('pageEditRoomProfile.close', "Close"))),
						]),
					]),
					n.elem('button', { events: {
						click: () => this.module.confirm.open(() => this._delete(), {
							title: l10n.l('pageEditRoomProfile.confirmDelete', "Confirm deletion"),
							body: l10n.l('pageEditRoomProfile.deleteProfileBody', "Do you really wish to delete this room profile?"),
							confirm: l10n.l('pageEditRoomProfile.delete', "Delete"),
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
				? this.ctrl.call('setRoomProfile', Object.assign(change, { profileId: this.profile.id }))
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
		this.elem.getComponent().getNode('message').setComponent(msg
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

	_setRoomProfileImage(file, points) {
		return this.module.file.upload(file, 'core.upload.image')
			.then(result => this.ctrl.call('setRoomProfileImage', {
				profileId: this.profile.id,
				uploadId: result.uploadId,
				x1: parseInt(points[0]),
				y1: parseInt(points[1]),
				x2: parseInt(points[2]),
				y2: parseInt(points[3]),
			})).then(() => this.module.toaster.open({
				title: l10n.l('pageEditRoomProfile.imageUploaded', "Image uploaded"),
				content: new Txt(l10n.l('pageEditRoomProfile.imageUploadedBody', "Room profile image was uploaded and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_copyRoomProfileImage() {
		return this.ctrl.call('copyRoomProfileImage', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditRoomProfile.imageUpdate', "Image updated"),
				content: new Txt(l10n.l('pageEditRoomProfile.imageUpdateBody', "Room profile image was updated and saved.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}));
	}

	_deleteRoomProfileImage() {
		return this.ctrl.call('deleteRoomProfileImage', { profileId: this.profile.id })
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditRoomProfile.imageDeleted', "Image deleted"),
				content: new Txt(l10n.l('pageEditRoomProfile.imageDeletedBody', "Room profile image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_delete() {
		this.module.deleteRoomProfile.deleteRoomProfile(this.ctrl, { profileId: this.profile.id })
			.catch(err => this._setMessage(l10n.l(err.code, err.message, err.data)));
	}

	_setUpdateImageDisabled(component, ctx) {
		this._setUpdateDisabled(component, ctx, !this.room.image || this.module.avatar.roomImgHref(this.profile) == this.room.image.href);
	}

	_setUpdateDisabled(component, ctx, disable) {
		component.setProperty('disabled', disable ? 'disabled' : null);
		if (disable && ctx.dialog) {
			ctx.dialog.close();
			ctx.dialog = null;
		}
	}
}

export default PageEditRoomProfileComponent;
