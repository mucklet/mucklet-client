import { Model } from 'modapp-resource';

const muteStoragePrefix = 'mute.';

const travelEvents = {
	travel: true,
	arrive: true,
	leave: true,
	wakeup: true,
	sleep: true
};

const unmutableEvents = {
	warn: true,
	follow: true,
	stopFollow: true,
	stopLead: true,
	dnd: true,
};

/**
 * Mute handles muting of events.
 */
class Mute {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'login', 'charLog', 'charFocus' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.muteTravel = new Model({ eventBus: this.app.eventBus });
		this.muteChars = new Model({ eventBus: this.app.eventBus });

		this.module.charLog.addEventModifier({
			id: 'mute',
			sortOrder: 0,
			callback: this._applyModifications.bind(this)
		});

		// Load muted
		this._loadMuteTravel();
		this._loadMuteChars();
	}

	toggleMuteTravel(ctrlId, muteTravel) {
		muteTravel = typeof muteTravel == 'undefined' ? !this.muteTravel.props[ctrlId] : !!muteTravel;
		let v = this.muteTravel.props.hasOwnProperty(ctrlId);
		if (muteTravel == v) return Promise.resolve(false);

		return this.muteTravel.set({ [ctrlId]: muteTravel || undefined }).then(() => {
			this._saveMuteTravel();
			return true;
		});
	}

	toggleMuteChar(charId, muteChar) {
		muteChar = typeof muteChar == 'undefined' ? !this.muteChars.props[charId] : !!muteChar;
		let v = this.muteChars.props.hasOwnProperty(charId);
		if (muteChar == v) return Promise.resolve(false);

		return this.muteChars.set({ [charId]: muteChar || undefined }).then(() => {
			this._saveMuteChars();
			return true;
		});
	}

	_loadMuteTravel() {
		if (!localStorage) return;

		this.module.login.getLoginPromise().then(user => {
			let raw = localStorage.getItem(muteStoragePrefix + user.id + '.travel');
			if (raw) {
				this.muteTravel.reset(JSON.parse(raw));
			}
		});
	}

	_saveMuteTravel() {
		if (!localStorage) return;
		this.module.login.getLoginPromise().then(user => {
			localStorage.setItem(muteStoragePrefix + user.id + '.travel', JSON.stringify(this.muteTravel.props));
		});
	}

	_loadMuteChars() {
		if (!localStorage) return;

		this.module.login.getLoginPromise().then(user => {
			let raw = localStorage.getItem(muteStoragePrefix + user.id + '.chars');
			if (raw) {
				this.muteChars.reset(JSON.parse(raw));
			}
		});
	}

	_saveMuteChars() {
		if (!localStorage) return;
		this.module.login.getLoginPromise().then(user => {
			localStorage.setItem(muteStoragePrefix + user.id + '.chars', JSON.stringify(this.muteChars.props));
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
