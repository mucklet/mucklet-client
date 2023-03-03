import { Elem, Txt, Input, Textarea } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import Img from 'components/Img';
import PanelSection from 'components/PanelSection';
import LabelToggleBox from 'components/LabelToggleBox';
import ImgModal from 'classes/ImgModal';

const txtUpdate = l10n.l('pageEditArea.update', "Save edits");
const txtClose = l10n.l('pageEditArea.close', "Close");

/**
 * PageEditAreaComponent renders a area edit page.
 */
class PageEditAreaComponent {
	constructor(module, ctrl, area, areaSettings, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.area = area;
		this.areaSettings = areaSettings;
		this.state = state;
		this.close = close;
	}

	render(el) {
		let eventBus = this.module.self.app.eventBus;
		this.model = new ModifyModel(this.area, {
			props: this.state.changes,
			eventBus,
		});
		this.settingsModel = new ModifyModel(this.areaSettings, {
			props: this.state.settingsChanges,
			eventBus,
		});
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditarea' }, [
			n.component(new PanelSection(
				l10n.l('pageEditArea.mapImage', "Map Image"),
				new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							this.area,
							new Img('', { className: 'pageeditarea--image', events: {
								click: c => {
									if (!c.hasClass('placeholder')) {
										new ImgModal(this.area.image.href).open();
									}
								},
							}}),
							(m, c, changed) => {
								c.setSrc(m.image ? m.image.href + '?thumb=xl' : '/img/area-l.png');
								c[m.image ? 'removeClass' : 'addClass']('placeholder');
							},
						)),
					]),
					n.elem('div', { className: 'pageeditarea--imagebtn flex-1' }, [
						n.component(new FileButton(
							new Elem(n => n.elem('div', [
								n.component(new FAIcon('camera')),
								n.component(new Txt(l10n.l('pageEditArea.upload', "Upload"))),
							])),
							(file, dataUrl) => this._setAreaImage(dataUrl),
							{ className: 'btn medium icon-left' },
						)),
						n.component(new ModelComponent(
							this.area,
							new Elem(n => n.elem('button', {
								className: 'btn medium icon-left',
								events: {
									click: () => this.module.confirm.open(() => this._deleteAreaImage(), {
										title: l10n.l('pageEditArea.confirmDelete', "Confirm deletion"),
										body: l10n.l('pageEditArea.deleteImageBody', "Do you really wish to delete the area map image?"),
										confirm: l10n.l('pageEditArea.delete', "Delete"),
									}),
								},
							}, [
								n.component(new FAIcon('trash')),
								n.component(new Txt(l10n.l('pageEditArea.delete', "Delete"))),
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
			n.component(new PanelSection(
				l10n.l('pageEditArea.area', "Area name"),
				new ModelComponent(
					this.model,
					new Input(this.model.name, {
						events: { input: c => this.model.set({ name: c.getValue() }) },
						attributes: { spellcheck: 'false' },
					}),
					(m, c) => c.setValue(m.name),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditArea.shortDesc', "Short description"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.shortDesc, {
						className: 'common--paneltextarea-small common--desc-size',
						events: { input: c => this.model.set({ shortDesc: c.getValue() }) },
					}),
					(m, c) => c.setValue(m.shortDesc),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditArea.shortDescInfo', "Short description of the area, shown in area listings."),
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditArea.about', "About"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.about, {
						className: 'common--paneltextarea common--desc-size',
						events: { input: c => this.model.set({ about: c.getValue() }) },
					}),
					(m, c) => c.setValue(m.about),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditArea.aboutInfo', "Information about the area, such as setting and purpose. It may be formatted and span multiple paragraphs."),
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditArea.rules', "Rules"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.rules, {
						className: 'common--paneltextarea common--desc-size',
						events: { input: c => this.model.set({ rules: c.getValue() }) },
					}),
					(m, c) => c.setValue(m.rules),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditArea.rulesInfo', "Area specific rules that adds to the realm rules. It may be formatted and span multiple paragraphs."),
				},
			)),
			n.component(new ModelComponent(
				this.settingsModel,
				new LabelToggleBox(l10n.l('pageEditArea.customTeleportMessages', "Custom teleport messages"), false, {
					className: 'common--formmargin',
					onChange: v => this.settingsModel.set({ customTeleportMsgs: v }),
					popupTip: l10n.l('pageEditArea.customTeleportMessagesInfo', "Customize teleport messages shown when characters teleport to and from the area, unless the room or character has a custom teleport message set."),
				}),
				(m, c) => c.setValue(m.customTeleportMsgs, false),
			)),
			n.component(new ModelComponent(
				this.settingsModel,
				new Collapser(null),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('customTeleportMsgs')) return;

					// Reset custom messages if we hide them.
					if (!m.customTeleportMsgs) {
						m.set({
							teleportLeaveMsg: this.areaSettings.teleportLeaveMsg,
							teleportArriveMsg: this.areaSettings.teleportArriveMsg,
							teleportTravelMsg: this.areaSettings.teleportTravelMsg,
						});
					}

					c.setComponent(m.customTeleportMsgs
						? new Elem(n => n.elem('div', { className: 'common--formsubsection' }, [
							n.component(new PanelSection(
								l10n.l('pageEditArea.teleportLeaveMessage', "Teleport leave message"),
								new ModelComponent(
									this.settingsModel,
									new Textarea(this.settingsModel.teleportLeaveMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.settingsModel.set({ teleportLeaveMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportLeaveMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditArea.teleportLeaveMessageInfo', "Message seen by the room when a character teleports away from there. The character's name will be prepended."),
								},
							)),
							n.component(new PanelSection(
								l10n.l('pageEditArea.teleportArriveMessage', "Teleport arrival message"),
								new ModelComponent(
									this.settingsModel,
									new Textarea(this.settingsModel.teleportArriveMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.settingsModel.set({ teleportArriveMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportArriveMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditArea.teleportArriveMessageInfo', "Message seen by the room when a character teleports there. The character's name will be prepended."),
								},
							)),
							n.component(new PanelSection(
								l10n.l('pageEditArea.teleportTravelMessage', "Teleport travel message"),
								new ModelComponent(
									this.settingsModel,
									new Textarea(this.settingsModel.teleportTravelMsg, {
										className: 'common--paneltextarea-small common--paneltextarea-smallfont',
										events: { input: c => this.settingsModel.set({ teleportTravelMsg: c.getValue() }) },
									}),
									(m, c) => c.setValue(m.teleportTravelMsg),
								),
								{
									className: 'small common--sectionpadding',
									noToggle: true,
									popupTip: l10n.l('pageEditArea.teleportTravelMessageInfo', "Message seen by the teleporting character when they teleport into the area. The character's name will be prepended."),
								},
							)),
						])) : null,
					);
				},
			)),
			n.component('message', new Collapser(null)),
			n.component(new ModelComponent(
				this.area,
				new Elem(n => n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.elem('update', 'button', { events: {
							click: () => this._save(),
						}, className: 'btn primary common--btnwidth' }, [
							n.component(new ModelComponent(
								this.model,
								new ModelComponent(
									this.settingsModel,
									new Txt(),
									(m, c) => this._setSaveButton(c),
								),
								(m, c) => this._setSaveButton(c.getComponent()),
							)),
						]),
					]),
					n.elem('setOwner', 'button', { events: {
						click: () => this.module.dialogSetAreaOwner.open(this.ctrl, this.area),
					}, className: 'iconbtn medium' }, [
						n.component(new FAIcon('key')),
					]),
					n.elem('delete', 'button', { events: {
						click: () => this._deleteArea(),
					}, className: 'iconbtn medium' }, [
						n.component(new FAIcon('trash')),
					]),
				])),
				(m, c) => {
					let prop = this._canDeleteArea() ? null : 'disabled';
					c.setNodeProperty('delete', 'disabled', prop);
					c.setNodeProperty('setOwner', 'disabled', prop);
				},
			)),
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
		if (this.settingsModel) {
			this.state.settingsChanges = this.settingsModel.getModifications() || {};
			this.settingsModel.dispose();
			this.settingsModel = null;
		}
	}

	_save() {
		let p;
		if (!this.model) {
			p = Promise.resolve();
		} else {
			let change = this._getChanges();
			p = Object.keys(change).length
				? this.ctrl.call('setArea', Object.assign({ areaId: this.area.id }, change))
				: Promise.resolve();
		}

		return p.then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		});
	}

	_getChanges() {
		if (!this.model || !this.settingsModel) return {};

		let change = Object.assign({}, this.model.getModifications(), this.settingsModel.getModifications());
		// If custom teleport messages is disabled, we don't save the hidden text values.
		if (!this.settingsModel.customTeleportMsgs) {
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
		this.state.changes = {};
	}

	_setAreaImage(dataUrl) {
		return this.ctrl.call('setAreaImage', {
			areaId: this.area.id,
			dataUrl,
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditArea.mapImageUploaded', "Map image uploaded"),
			content: new Txt(l10n.l('pageEditArea.mapImageUploadedBody', "Map image was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_deleteAreaImage() {
		return this.ctrl.call('deleteAreaImage', {
			areaId: this.area.id,
		})
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditArea.mapImageDeleted', "Map image deleted"),
				content: new Txt(l10n.l('pageEditArea.mapImageDeletedBody', "Map image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_deleteArea() {
		this.dialog = this.module.confirm.open(
			() => this.ctrl.call('deleteArea', { areaId: this.area.id })
				.then(() => this.module.toaster.open({
					title: l10n.l('pageEditArea.areaDeleted', "Area deleted"),
					content: new Txt(l10n.l('pageEditArea.mapImageDeletedBody', "Area was successfully deleted.")),
					closeOn: 'click',
					type: 'success',
					autoclose: true,
				}))
				.catch(err => this.module.confirm.openError(err)),
			{
				title: l10n.l('pageEditArea.confirmDelete', "Confirm deletion"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('pageEditArea.deleteAreaBody', "Do you really wish to delete the area?"), { tagName: 'p' })),
					n.elem('p', [ n.component(new ModelTxt(this.area, m => m.name, { className: 'dialog--strong' })) ]),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new Txt(l10n.l('pageEditArea.deletionWarning', "Deletion cannot be undone."))),
					]),
				])),
				confirm: l10n.l('pageEditArea.delete', "Delete"),
			},
		);
	}

	_canDeleteArea() {
		return this.module.player.isAdmin() || (this.area.owner && this.area.owner.id == this.ctrl.id);
	}

	_setSaveButton(c) {
		c.setText(Object.keys(this._getChanges()).length ? txtUpdate : txtClose);
	}
}

export default PageEditAreaComponent;
