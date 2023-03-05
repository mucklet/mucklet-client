import { Elem, Txt, Input, Textarea, Context } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import { ModifyModel, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import PanelSection from 'components/PanelSection';
import LabelToggleBox from 'components/LabelToggleBox';
import Img from 'components/Img';
import ImgModal from 'classes/ImgModal';

class PageEditCharComponent {
	constructor(module, ctrl, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.ctrl, {
			props: this.state.changes,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditchar' }, [
			n.component(new PanelSection(
				l10n.l('pageEditChar.image', "Image"),
				new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							this.ctrl,
							new Img('', { className: 'pageeditchar--image', events: {
								click: c => {
									if (!c.hasClass('placeholder')) {
										new ImgModal(this.ctrl.image.href).open();
									}
								},
							}}),
							(m, c, changed) => {
								c.setSrc(m.image ? m.image.href + '?thumb=xl' : '/img/avatar-l.png');
								c[m.image ? 'removeClass' : 'addClass']('placeholder');
							},
						)),
					]),
					n.elem('div', { className: 'pageeditchar--imagebtn flex-1' }, [
						n.component(new FileButton(
							new Elem(n => n.elem('div', [
								n.component(new FAIcon('camera')),
								n.component(new Txt(l10n.l('pageEditChar.upload', "Upload"))),
							])),
							(file, dataUrl) => {
								let footer = new LabelToggleBox(l10n.l('pageEditChar.useThumbAsAvatar', "Use thumbnail as avatar"), !this.ctrl.avatar);
								this.module.dialogCropImage.open(
									dataUrl,
									(dataUrl, points) => this._setCharImage(dataUrl, points, footer.getValue()),
									{ footer },
								);
							},
							{ className: 'btn medium icon-left' },
						)),
						n.component(new ModelComponent(
							this.ctrl,
							new Elem(n => n.elem('button', {
								className: 'btn medium icon-left',
								events: {
									click: () => this.module.confirm.open(() => this._deleteCharImage(), {
										title: l10n.l('pageEditChar.confirmDelete', "Confirm deletion"),
										body: l10n.l('pageEditChar.deleteImageBody', "Do you really wish to delete the image?"),
										confirm: l10n.l('pageEditChar.delete', "Delete"),
									}),
								},
							}, [
								n.component(new FAIcon('trash')),
								n.component(new Txt(l10n.l('pageEditChar.delete', "Delete"))),
							])),
							(m, c) => c.setProperty('disabled', m.image ? null : 'disabled'),
						)),
					]),
				])),
				{
					className: 'common--sectionpadding pageeditchar--imagesection',
					noToggle: true,
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditChar.avatar', "Avatar"),
				new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
					n.elem('div', { className: 'flex-auto' }, [
						n.component(this.module.avatar.newAvatar(this.ctrl, { size: 'large' })),
					]),
					n.elem('div', { className: 'pageeditchar--avatarbtn flex-1' }, [
						n.component(new FileButton(
							new Elem(n => n.elem('div', [
								n.component(new FAIcon('camera')),
								n.component(new Txt(l10n.l('pageEditChar.upload', "Upload"))),
							])),
							(file, dataUrl) => this.module.dialogCropImage.open(
								dataUrl,
								(dataUrl, points) => this._setCharAvatar(dataUrl, points),
							),
							{ className: 'btn small icon-left' },
						)),
						n.component(new ModelComponent(
							this.ctrl,
							new Elem(n => n.elem('button', {
								className: 'btn small icon-left',
								events: {
									click: () => this.module.confirm.open(() => this._deleteCharAvatar(), {
										title: l10n.l('pageEditChar.confirmDelete', "Confirm deletion"),
										body: l10n.l('pageEditChar.deleteImageBody', "Do you really wish to delete the avatar?"),
										confirm: l10n.l('pageEditChar.delete', "Delete"),
									}),
								},
							}, [
								n.component(new FAIcon('trash')),
								n.component(new Txt(l10n.l('pageEditChar.delete', "Delete"))),
							])),
							(m, c) => c.setProperty('disabled', m.avatar ? null : 'disabled'),
						)),
					]),
				])),
				{
					className: 'common--sectionpadding pageeditchar--imagesection',
					noToggle: true,
					popupTip: l10n.l('pageEditChar.avatarInfo', "Avatar is a small image used to represent the character. Others can see it without having to look at the character. Optimal size is 192x192."),
				},
			)),
			n.elem('div', { className: 'pageeditchar--editname flex-row pad8' }, [
				n.component(new PanelSection(
					l10n.l('pageEditChar.name', "Name"),
					new ModelComponent(
						this.model,
						new Input(this.model.name, {
							events: { input: c => this.model.set({ name: c.getValue() }) },
							attributes: { name: 'editchar-name', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditChar.nameInfo', "Character name may contain numbers, letters, dash (-), and apostrophe (')."),
						popupTipPosition: 'top',
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditChar.surname', "Surname"),
					new ModelComponent(
						this.model,
						new Input(this.model.surname, {
							events: { input: c => this.model.set({ surname: c.getValue() }) },
							attributes: { name: 'editchar-surname', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.surname),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditChar.surnameInfo', "Surname is used for unique identification, and may contain numbers, letters, dash (-), apostrophe ('), and spaces. It may also be titles (eg. \"the Beast\") or other creative name endings."),
					},
				)),
			]),
			n.elem('div', { className: 'pageeditchar--details flex-row pad8' }, [
				n.component(new PanelSection(
					l10n.l('pageEditChar.gender', "Gender"),
					new ModelComponent(
						this.model,
						new Input(this.model.gender, {
							events: { input: c => this.model.set({ gender: c.getValue() }) },
							attributes: { name: 'editchar-gender', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.gender),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditChar.species', "Species"),
					new ModelComponent(
						this.model,
						new Input(this.model.species, {
							events: { input: c => this.model.set({ species: c.getValue() }) },
							attributes: { name: 'editchar-species', spellcheck: 'false' },
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
				l10n.l('pageEditChar.desc', "Description"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.desc, {
						className: 'common--paneltextarea common--desc-size',
						events: { input: c => this.model.set({ desc: c.getValue() }) },
						attributes: { name: 'editchar-desc', spellcheck: 'true' },
					}),
					(m, c) => c.setValue(m.desc),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditChar.descInfo', "Description of the character's appearance as percieved by other characters."),
				},
			)),
			n.component(new ModelComponent(
				this.ctrl,
				new Collapser(),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('puppetInfo')) return;
					let puppetInfo = m.puppetInfo;
					if (this.puppetInfoModel) {
						this.puppetInfoModel.dispose();
					}
					this.puppetInfoModel = puppetInfo
						? new ModifyModel(puppetInfo, {
							props: this.state.puppetInfoChanges,
							eventBus: this.module.self.app.eventBus,
						})
						: null;
					c.setComponent(puppetInfo
						? new ModelComponent(
							this.puppetInfoModel,
							new PanelSection(
								l10n.l('pageEditChar.howToPlay', "How to play"),
								new Textarea(this.puppetInfoModel.howToPlay, {
									className: 'common--paneltextarea common--desc-size',
									events: { input: c => this.puppetInfoModel.set({ howToPlay: c.getValue() }) },
									attributes: { name: 'editchar-desc', spellcheck: 'true' },
								}),
								{
									className: 'common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditChar.howToPlayInfo', "Suggestions and guidelines on how to play and act with this puppet."),
								},
							),
							(m, c, change) => {
								this._setSaveButton();
								if (change && change.hasOwnProperty('howToPlay')) {
									c.getComponent().setValue(m.howToPlay);
								}
							},
						)
						: null,
					);
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditChar.about', "About"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.about, {
						className: 'common--paneltextarea common--desc-size',
						events: { input: c => this.model.set({ about: c.getValue() }) },
						attributes: { name: 'editchar-about', spellcheck: 'true' },
					}),
					(m, c) => c.setValue(m.about),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditChar.aboutInfo', "Information about the character, such as background story or player preferences."),
				},
			)),
			n.component(new ModelComponent(
				this.model,
				new LabelToggleBox(l10n.l('pageEditChar.customTeleportMessages', "Custom teleport messages"), false, {
					className: 'common--formmargin',
					onChange: v => this.model.set({ customTeleportMsgs: v }),
					popupTip: l10n.l('pageEditChar.customTeleportMessagesInfo', "Customize teleport messages shown when teleporting. May be overridden by custom teleport messages set for the rooms."),
				}),
				(m, c) => c.setValue(m.customTeleportMsgs, false),
			)),
			n.component(new ModelComponent(
				this.model,
				new Collapser(null),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('customTeleportMsgs')) return;

					// Reset custom messages if we hide them.
					if (!m.customTeleportMsgs) {
						m.set({
							teleportLeaveMsg: this.ctrl.teleportLeaveMsg,
							teleportArriveMsg: this.ctrl.teleportArriveMsg,
							teleportTravelMsg: this.ctrl.teleportTravelMsg,
						});
					}

					c.setComponent(m.customTeleportMsgs
						? new Elem(n => n.elem('div', { className: 'common--formsubsection' }, [
							n.component(new PanelSection(
								l10n.l('pageEditChar.teleportLeaveMessage', "Teleport leave message"),
								new ModelComponent(
									this.model,
									new Textarea(this.model.teleportLeaveMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.model.set({ teleportLeaveMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportLeaveMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditChar.teleportLeaveMessageInfo', "Message seen by the departure room when teleporting away. The character's name will be prepended."),
								},
							)),
							n.component(new PanelSection(
								l10n.l('pageEditChar.teleportArriveMessage', "Teleport arrival message"),
								new ModelComponent(
									this.model,
									new Textarea(this.model.teleportArriveMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.model.set({ teleportArriveMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportArriveMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditChar.teleportArriveMessageInfo', "Message seen by the arrival room when teleporting there. The character's name will be prepended."),
								},
							)),
							n.component(new PanelSection(
								l10n.l('pageEditChar.teleportTravelMessage', "Teleport travel message"),
								new ModelComponent(
									this.model,
									new Textarea(this.model.teleportTravelMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.model.set({ teleportTravelMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportTravelMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditChar.teleportTravelMessageInfo', "Message seen by you when teleporting. The character's name will be prepended."),
								},
							)),
						])) : null,
					);
				},
			)),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (!t.type || t.type == 'section') && (t.filter ? t.filter(this.ctrl) : true),
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(this.ctrl, this.state),
					{
						className: 'pageeditchar--sections',
						subClassName: t => t.className || null,
					},
				),
			)),
			n.component('message', new Collapser(null)),
			n.elem('div', { className: 'pad-top-xl' }, [
				n.elem('button', { events: {
					click: () => this._save(),
				}, className: 'btn primary common--btnwidth' }, [
					n.component('save', new ModelComponent(
						this.model,
						new Txt(),
						(m, c) => this._setSaveButton(),
					)),
				]),
			]),
		]));
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
		if (this.puppetInfoModel) {
			this.state.puppetInfoChanges = this.puppetInfoModel.getModifications() || {};
			this.puppetInfoModel.dispose();
			this.puppetInfoModel = null;
		}
	}

	_save() {
		let p;
		if (!this.model) {
			p = Promise.resolve();
		} else {
			let change = this._getChanges();
			p = Object.keys(change).length
				? this.ctrl.call('set', change)
				: Promise.resolve();
		}

		if (this.puppetInfoModel) {
			let puppetInfoChange = this.puppetInfoModel.getModifications();
			if (puppetInfoChange) {
				p = p.then(() => this.ctrl.call('setPuppet', puppetInfoChange));
			}
		}

		return p.then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		});
	}

	_getChanges() {
		if (!this.model) return {};

		let change = Object.assign({}, this.model.getModifications());
		// If custom teleport messages is disabled, we don't save the hidden text values.
		if (!this.model.customTeleportMsgs) {
			delete change.teleportLeaveMsg;
			delete change.teleportArriveMsg;
			delete change.teleportTravelMsg;
		}
		return change;
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
		if (this.puppetInfoModel) {
			this.puppetInfoModel.dispose();
			this.puppetInfoModel = null;
		}
		this.state.changes = {};
	}

	_setSaveButton() {
		if (!this.elem) return;

		let save = this.elem.getNode('save').getComponent();
		let hasChange = Object.keys(this._getChanges()).length;
		save.setText(hasChange || (this.puppetInfoModel && this.puppetInfoModel.isModified)
			? l10n.l('pageEditChar.update', "Save edits")
			: l10n.l('pageEditChar.close', "Close"),
		);
	}

	_setCharImage(dataUrl, points, thumbAsAvatar) {
		return this.ctrl.call('setImage', {
			dataUrl,
			x1: parseInt(points[0]),
			y1: parseInt(points[1]),
			x2: parseInt(points[2]),
			y2: parseInt(points[3]),
			thumbAsAvatar,
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditChar.imageUploaded', "Image uploaded"),
			content: new Txt(l10n.l('pageEditChar.imageUploadedBody', "Image was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_deleteCharImage() {
		return this.ctrl.call('deleteImage')
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditChar.imageDeleted', "Image deleted"),
				content: new Txt(l10n.l('pageEditChar.imageDeletedBody', "Image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_setCharAvatar(dataUrl, points) {
		return this.ctrl.call('setAvatar', {
			dataUrl,
			x1: parseInt(points[0]),
			y1: parseInt(points[1]),
			x2: parseInt(points[2]),
			y2: parseInt(points[3]),
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditChar.avatarUploaded', "Avatar uploaded"),
			content: new Txt(l10n.l('pageEditChar.avatarUploadedBody', "The avatar was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_deleteCharAvatar() {
		return this.ctrl.call('deleteAvatar')
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditChar.avatarDeleted', "Avatar deleted"),
				content: new Txt(l10n.l('pageEditChar.avatarDeletedBody', "The avatar was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}
}

export default PageEditCharComponent;
