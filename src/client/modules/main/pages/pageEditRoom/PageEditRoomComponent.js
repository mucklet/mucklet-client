import { Elem, Txt, Input, Textarea } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import Img from 'components/Img';
import PanelSection from 'components/PanelSection';
import ImgModal from 'classes/ImgModal';
import LabelToggleBox from 'components/LabelToggleBox';
import DurationInput from 'components/DurationInput';

const txtUpdate = l10n.l('pageEditRoom.update', "Save edits");
const txtClose = l10n.l('pageEditRoom.close', "Close");

/**
 * PageEditRoomComponent renders a room edit page.
 */
class PageEditRoomComponent {
	constructor(module, ctrl, room, roomSettings, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.roomSettings = roomSettings;
		this.state = state;
		this.close = close;
	}

	render(el) {
		let eventBus = this.module.self.app.eventBus;
		this.model = new ModifyModel(this.room, {
			props: this.state.changes,
			eventBus,
		});
		this.settingsModel = new ModifyModel(this.roomSettings, {
			props: this.state.settingsChanges,
			eventBus,
		});
		this.elem = new ModelComponent(
			this.room,
			new Elem(n => n.elem('div', { className: 'pageeditroom' }, [
				n.component(new PanelSection(
					l10n.l('pageEditRoom.image', "Image"),
					new Elem(n => n.elem('div', { className: 'flex-row flex-stretch pad8' }, [
						n.elem('div', { className: 'flex-1' }, [
							n.component(new ModelComponent(
								this.room,
								new Img('', { className: 'pageeditroom--image', events: {
									click: c => {
										if (!c.hasClass('placeholder')) {
											new ImgModal(this.room.image.href).open();
										}
									},
								}}),
								(m, c, changed) => {
									c.setSrc(m.image ? m.image.href + '?thumb=xl' : '/img/room-l.png');
									c[m.image ? 'removeClass' : 'addClass']('placeholder');
								},
							)),
						]),
						n.elem('div', { className: 'pageeditroom--imagebtn flex-1' }, [
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('camera')),
									n.component(new Txt(l10n.l('pageEditRoom.upload', "Upload"))),
								])),
								(file, dataUrl) => this.module.dialogCropImage.open(
									dataUrl,
									(dataUrl, points) => this._setRoomImage(dataUrl, points),
								),
								{ className: 'btn medium icon-left' },
							)),
							n.component(new ModelComponent(
								this.room,
								new Elem(n => n.elem('button', {
									className: 'btn medium icon-left',
									events: {
										click: () => this.module.confirm.open(() => this._deleteRoomImage(), {
											title: l10n.l('pageEditRoom.confirmDelete', "Confirm deletion"),
											body: l10n.l('pageEditRoom.deleteImageBody', "Do you really wish to delete the room image?"),
											confirm: l10n.l('pageEditRoom.delete', "Delete"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('pageEditRoom.delete', "Delete"))),
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
					l10n.l('pageEditRoom.roomName', "Room name"),
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
					l10n.l('pageEditRoom.desc', "Description"),
					new ModelComponent(
						this.model,
						new Textarea(this.model.desc, {
							className: 'common--paneltextarea common--desc-size',
							events: { input: c => this.model.set({ desc: c.getValue() }) },
							attributes: { name: 'editroom-desc', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.desc),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.elem('div', { className: 'pageeditroom--flags' }, [
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.isHome', "Allow set home"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ isHome: v }),
							popupTip: l10n.l('pageEditRoom.isHomeInfo', "Allow any character to set the room as their home."),
						}),
						(m, c) => c.setValue(m.isHome, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.isTeleport', "Allow teleport to room"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ isTeleport: v }),
							popupTip: l10n.l('pageEditRoom.isTeleportInfo', "Allow any character to add the room as a teleport node."),
						}),
						(m, c) => c.setValue(m.isTeleport, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.isDark', "Is dark"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ isDark: v }),
							popupTip: l10n.l('pageEditRoom.isDarkInfo', "Prevents characters from seeing what other characters are inside the room."),
						}),
						(m, c) => c.setValue(m.isDark, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.isQuiet', "Is quiet"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ isQuiet: v }),
							popupTip: l10n.l('pageEditRoom.isQuietInfo', "Prevents characters from communicating publicly inside the room."),
						}),
						(m, c) => c.setValue(m.isQuiet, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.isInstance', "Is instance"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ isInstance: v }),
							popupTip: l10n.l('pageEditRoom.isInstanceInfo', "Characters entering the room will reside in their own private instance."),
						}),
						(m, c) => c.setValue(m.isInstance, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new LabelToggleBox(l10n.l('pageEditRoom.autoSweepSleepers', "Auto sweep sleepers"), false, {
							className: 'common--formmargin',
							onChange: v => this.model.set({ autosweep: v }),
							popupTip: l10n.l('pageEditRoom.autosweepInfo', "Automatically send home characters sleeping in the room"),
						}),
						(m, c) => c.setValue(m.autosweep, false),
					)),
					n.component(new ModelComponent(
						this.model,
						new Collapser(null),
						(m, c, change) => {
							if (change && !change.hasOwnProperty('autosweep')) return;

							// Reset autosweep delay if we hide it.
							if (!m.autosweep) {
								m.set({ autosweepDelay: this.room.autosweepDelay });
							}

							c.setComponent(m.autosweep
								? new Elem(n => n.elem('div', { className: 'common--formsubsection' }, [
									n.component(new PanelSection(
										l10n.l('pageEditRoom.autosweepDelay', "Auto sweep delay"),
										new ModelComponent(
											m,
											new DurationInput(m.autosweepDelay, {
												className: 'common--formmargin common--durationinput',
												onChange: v => m.set({ autosweepDelay: v }),
											}),
											(m, c) => c.setDuration(m.autosweepDelay, false),
										),
										{
											className: 'small',
											noToggle: true,
											popupTip: l10n.l('pageEditRoom.autoDelaysweepInfo', 'Delay before a sleeping character is auto-swept from the room.\nThe format is "2h 3m 4s" for (h)ours, (m)inutes, and (s)econds.'),
										},
									)),
								])) : null,
							);
						},
					)),
					n.component(new ModelComponent(
						this.settingsModel,
						new LabelToggleBox(l10n.l('pageEditRoom.customTeleportMessages', "Custom teleport messages"), false, {
							className: 'common--formmargin',
							onChange: v => this.settingsModel.set({ customTeleportMsgs: v }),
							popupTip: l10n.l('pageEditRoom.customTeleportMessagesInfo', "Customize teleport messages shown when characters teleport to and from the room."),
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
									teleportLeaveMsg: this.roomSettings.teleportLeaveMsg,
									teleportArriveMsg: this.roomSettings.teleportArriveMsg,
									teleportTravelMsg: this.roomSettings.teleportTravelMsg,
									overrideCharTeleportMsgs: this.roomSettings.overrideCharTeleportMsgs,
								});
							}

							c.setComponent(m.customTeleportMsgs
								? new Elem(n => n.elem('div', { className: 'common--formsubsection' }, [
									n.component(new PanelSection(
										l10n.l('pageEditRoom.teleportLeaveMessage', "Teleport leave message"),
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
											popupTip: l10n.l('pageEditRoom.teleportLeaveMessageInfo', "Message seen by this room when a character teleports away from here. The character's name will be prepended."),
										},
									)),
									n.component(new PanelSection(
										l10n.l('pageEditRoom.teleportArriveMessage', "Teleport arrival message"),
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
											popupTip: l10n.l('pageEditRoom.teleportArriveMessageInfo', "Message seen by this room when a character teleports here. The character's name will be prepended."),
										},
									)),
									n.component(new PanelSection(
										l10n.l('pageEditRoom.teleportTravelMessage', "Teleport travel message"),
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
											popupTip: l10n.l('pageEditRoom.teleportTravelMessageInfo', "Message seen by the teleporting character when they teleport here. The character's name will be prepended."),
										},
									)),
									n.component(new ModelComponent(
										this.settingsModel,
										new LabelToggleBox(l10n.l('pageEditRoom.overrideCharacterMessages', "Override character messages"), false, {
											className: 'small common--sectionpadding',
											onChange: v => this.settingsModel.set({ overrideCharTeleportMsgs: v }),
											popupTip: l10n.l('pageEditRoom.overrideCharacterMessagesInfo', "Override any customized character teleport messages with those defined for the room."),
										}),
										(m, c) => c.setValue(m.overrideCharTeleportMsgs, false),
									)),
								])) : null,
							);
						},
					)),
				]),
				n.component('message', new Collapser(null)),
				n.component(new ModelComponent(
					this.room,
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
							click: () => this.module.dialogSetRoomOwner.open(this.ctrl, this.room),
						}, className: 'iconbtn medium' }, [
							n.component(new FAIcon('key')),
						]),
						n.elem('delete', 'button', { events: {
							click: () => this.module.deleteRoom.deleteRoom(this.ctrl),
						}, className: 'iconbtn medium' }, [
							n.component(new FAIcon('trash')),
						]),
					])),
					(m, c) => {
						let prop = this._canDeleteRoom() ? null : 'disabled';
						c.setNodeProperty('delete', 'disabled', prop);
						c.setNodeProperty('setOwner', 'disabled', prop);
					},
				)),
			])),
			(m, c) => {
				// Close if character stops being able to edit the room
				if (!this.module.pageRoom.canEdit(this.ctrl, this.room)) {
					setTimeout(() => this._close(), 0);
				}
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
		} else if (this.model.autosweep && this.model.autosweepDelay === null) {
			p = Promise.reject({ code: 'pageEditRoom.invalidAutosweepDelay', message: "Auto sweep delay is invalid." });
		} else {
			let change = this._getChanges();
			p = Object.keys(change).length
				? this.ctrl.call('setRoom', change)
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
		// If autosweep is disabled, we don't save the hidden delay value.
		if (!this.model.autosweep) {
			delete change.autosweepDelay;
		}
		// If custom teleport messages is disabled, we don't save the hidden text values.
		if (!this.settingsModel.customTeleportMsgs) {
			delete change.teleportLeaveMsg;
			delete change.teleportArriveMsg;
			delete change.teleportTravelMsg;
			delete change.overrideCharTeleportMsgs;
		}
		return change;
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

	_setRoomImage(dataUrl, points) {
		return this.ctrl.call('setRoomImage', {
			dataUrl,
			x1: parseInt(points[0]),
			y1: parseInt(points[1]),
			x2: parseInt(points[2]),
			y2: parseInt(points[3]),
		}).then(() => this.module.toaster.open({
			title: l10n.l('pageEditRoom.imageUploaded', "Image uploaded"),
			content: new Txt(l10n.l('pageEditRoom.imageUploadedBody', "Image was uploaded and saved.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		}));
	}

	_deleteRoomImage() {
		return this.ctrl.call('deleteRoomImage')
			.then(() => this.module.toaster.open({
				title: l10n.l('pageEditRoom.imageDeleted', "Image deleted"),
				content: new Txt(l10n.l('pageEditRoom.imageDeletedBody', "Image was successfully deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	_canDeleteRoom() {
		return this.module.player.isAdmin() || (this.room.owner && this.room.owner.id == this.ctrl.id);
	}

	_setSaveButton(c) {
		c.setText(Object.keys(this._getChanges()).length ? txtUpdate : txtClose);
	}
}

export default PageEditRoomComponent;
