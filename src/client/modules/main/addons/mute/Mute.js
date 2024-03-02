import { Model } from 'modapp-resource';

const muteStoragePrefix = 'mute.';

const travelEvents = {
	travel: true,
	arrive: true,
	leave: true,
	wakeup: true,
	sleep: true,
};

const unmutableEvents = {
	warn: true,
	follow: true,
	stopFollow: true,
	stopLead: true,
	dnd: true,
};

const oocEventType = 'ooc';

/**
 * Mute handles muting of events.
 */
class Mute {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'auth', 'charLog', 'charFocus' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.muteTravel = new Model({ eventBus: this.app.eventBus });
		this.muteChars = new Model({ eventBus: this.app.eventBus });
		this.muteOoc = new Model({ eventBus: this.app.eventBus });

		this.module.charLog.addEventModifier({
			id: 'mute',
			sortOrder: 0,
			callback: this._applyModifications.bind(this),
		});

		// Load muted
		this._loadMute('.travel', this.muteTravel);
		this._loadMute('.chars', this.muteChars);
		this._loadMute('.ooc', this.muteOoc);
	}

	toggleMuteTravel(ctrlId, muteTravel) {
		muteTravel = typeof muteTravel == 'undefined' ? !this.muteTravel.props[ctrlId] : !!muteTravel;
		let v = this.muteTravel.props.hasOwnProperty(ctrlId);
		if (muteTravel == v) return Promise.resolve(false);

		return this.muteTravel.set({ [ctrlId]: muteTravel || undefined }).then(() => {
			this._saveMute('.travel', this.muteTravel);
			return true;
		});
	}

	toggleMuteChar(charId, muteChar) {
		muteChar = typeof muteChar == 'undefined' ? !this.muteChars.props[charId] : !!muteChar;
		let v = this.muteChars.props.hasOwnProperty(charId);
		if (muteChar == v) return Promise.resolve(false);

		return this.muteChars.set({ [charId]: muteChar || undefined }).then(() => {
			this._saveMuteChars('.chars', this.muteChars);
			return true;
		});
	}

	toggleMuteOoc(ctrlId, muteOoc) {
		muteOoc = typeof muteOoc == 'undefined' ? !this.muteOoc.props[ctrlId] : !!muteOoc;
		let v = this.muteOoc.props.hasOwnProperty(ctrlId);
		if (muteOoc == v) return Promise.resolve(false);

		return this.muteOoc.set({ [ctrlId]: muteOoc || undefined }).then(() => {
			this._saveMute('.ooc', this.muteOoc);
			return true;
		});
	}

	/**
	 * Checks if a character is muted.
	 * @param {string} charId Character ID
	 * @returns {bool} True if muted, otherwise false.
	 */
	isMutedChar(charId) {
		return !!(charId && this.muteChars.props[charId]);
	}

	_loadMute(type, model) {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			let raw = localStorage.getItem(muteStoragePrefix + user.id + type);
			if (raw) {
				model.reset(JSON.parse(raw));
			}
		});
	}

	_saveMute(type, model) {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			localStorage.setItem(muteStoragePrefix + user.id + type, JSON.stringify(model.props));
		});
	}

	_applyModifications(ev, ctrl, mod) {
		let muted = false;
		let charId = ev.char && ev.char.id;
		if (this.muteTravel.props[ctrl.id]) {
			if (travelEvents[ev.type] && charId != ctrl.id && !this.module.charFocus.hasFocus(ctrl.id, charId)) {
				muted = true;
			}
		}

		if (charId != ctrl.id && this.muteOoc.props[ctrl.id] && (ev.ooc || ev.type === oocEventType)) {
			muted = true;
		}

		if (!muted && charId && this.muteChars.props[charId] && !unmutableEvents[ev.type]) {
			muted = true;
		}

		if (muted) {
			mod.muted = true;
		}
	}

	dispose() {
		this.module.charLog.removeEventModifier('mute');
	}
}

export default Mute;
