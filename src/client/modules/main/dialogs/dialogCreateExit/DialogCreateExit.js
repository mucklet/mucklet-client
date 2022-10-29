import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import AutoComplete from 'components/AutoComplete';
import LabelToggleBox from 'components/LabelToggleBox';
import PanelSection from 'components/PanelSection';
import labelCompare from 'utils/labelCompare';
import patternMatch, { patternMatchRender } from 'utils/patternMatch';
import prepareKeys from 'utils/prepareKeys';
import './dialogCreateExit.scss';

function isId(v) {
	return v.trim().match(/^#?[a-vA-V0-9]{20,20}$/);
}

class DialogCreateExit {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onClose = this._onClose.bind(this);
		this._onCreate = this._onCreate.bind(this);

		this.app.require([ 'api', 'player', 'createExit', 'requestExit', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to createa new exit for the room.
	 * @param {Model} ctrl Controlled character.
	 * @param {Model} room Room to create the exit from.
	 * @param {object} [opt] Optional parameters
	 * @param {boolean} [opt.hidden] Flag telling if exit should be hidden. Defaults to false.
	 */
	open(ctrl, room, opt) {
		if (this.dialog) return;
		opt = opt || {};

		let model = new Model({ data: {
			name: "",
			newRoom: true,
			targetRoom: "",
			targetRoomValue: "",
			keys: ""
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: opt.hidden
				? l10n.l('dialogCreateHiddenExit.createHiddenExit', "Create hidden exit")
				: l10n.l('dialogCreateExit.createNewExit', "Create new exit"),
			className: 'dialogcreateexit',
			content: new Elem(n => n.elem('div', [
				n.component('name', new PanelSection(
					l10n.l('pageEditExit.exitName', "Exit name"),
					new Input(model.name, {
						events: { input: c => model.set({ name: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input'
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true
					}
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.exitName', "Keywords"),
					new Input(model.keys, {
						events: { input: c => model.set({ keys: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input'
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditExit.keysInfo', "Comma-separated list of case-insensitive keywords used for identifying the exit.")
					}
				)),
				n.component(new PanelSection(
					l10n.l('dialogCreateExit.destination', "Destination"),
					new Elem(n => n.elem('div', [
						n.component(new ModelComponent(
							model,
							new LabelToggleBox(l10n.l('dialogCreateExit.createNewRoom', "Create new room"), false, {
								className: 'common--formmargin',
								onChange: v => model.set({ newRoom: v })
							}),
							(m, c) => c.setValue(m.newRoom, false)
						)),
						n.component(new ModelComponent(
							model,
							new Collapser(),
							(m, c, change) => {
								if (change && !change.hasOwnProperty('newRoom')) return;
								c.setComponent(m.newRoom ? null : new AutoComplete({
									className: 'dialog--input dialog--incomplete',
									attributes: { placeholder: "Search owned room or enter a room #ID", name: 'dialogcreateexit-targetroom', spellcheck: 'false' },
									fetch: (text, update, c) => {
										model.set({ targetRoom: null });
										if (!isId(text)) {
											c.addClass('dialog--incomplete');
										}
										let list = (ctrl.ownedRooms ? ctrl.ownedRooms.toArray() : [])
											.filter(m => patternMatch(m.name, text))
											.map(m => ({ value: m.id, label: m.name }))
											.sort(labelCompare);
										update(list);
									},
									events: {
										input: c => {
											let v = c.getProperty('value');
											model.set({ targetRoomValue: v });
											if (isId(v)) {
												c.removeClass('dialog--incomplete');
											}
										}
									},
									render: patternMatchRender,
									minLength: 1,
									onSelect: (c, item) => {
										c.removeClass('dialog--incomplete');
										model.set({ targetRoom: item.value });
										c.setProperty('value', item.label);
									}
								}));
							}
						))
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCreateExit.destinationInfo', "Create a new room, search for an owned room, or enter a room #ID as exit destination.")
					}
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onCreate(ctrl, room, opt, model) },
						className: 'btn primary dialog--btn'
					}, [
						n.component(new Txt(l10n.l('dialogcreateexit.createExit', "Create exit")))
					])
				])
			])),
			onClose: this._onClose
		});

		this.dialog.open();
		this.dialog.getContent().getNode('name').getComponent().getElement().focus();
	}

	_onClose() {
		this.dialog = null;
	}

	_onCreate(ctrl, room, opt, model) {
		if (this.createPromise) return this.createPromise;

		if (ctrl.inRoom.id != room.id) {
			this._setMessage(l10n.l('dialogCreateExit.notInRoom', "You are no longer in the same room."));
			return;
		}

		let params = {
			name: model.name,
			keys: prepareKeys(model.keys),
			targetRoom: model.targetRoom || model.targetRoomValue.replace(/^#/, '') || null,
			hidden: opt.hidden || undefined
		};

		this.createPromise = this.module.createExit.createExit(ctrl, params).then(char => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (err.code == 'core.targetRoomNotOwned') {
				this.dialog.close();
				this._requestExit(ctrl, params);
				return;
			}
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.createPromise = null;
		});

		return this.createPromise;
	}

	_requestExit(ctrl, params) {
		this.module.confirm.open(() => this.module.requestExit.requestExit(ctrl, params)
			.catch(err => this.module.confirm.openError(err)),
		{
			title: l10n.l('dialogCreateExit.requestExit', "Request to create exit"),
			body: l10n.l('dialogCreateExit.requestExitBody', "Your character doesn't own the destination room. Do you wish to make a request to the room owner?"),
			confirm: l10n.l('dialogCreateExit.makeRequest', "Make request"),
			cancel: l10n.l('dialogCreateExit.nevermind', "Nevermind"),
		});
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogCreateExit;
