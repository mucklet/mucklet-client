import Err from 'classes/Err';

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
const messageEventType = 'message';

const alreadyMutedErrs = {
	muteOoc: new Err('mute.oocAlreadyMuted', "OOC messages are already getting muted."),
	muteMessage: new Err('mute.messagesAlreadyMuted', "Messages are already getting muted."),
	muteTravel: new Err('mute.travelAlreadyMuted', "Travel messages are already getting muted."),
};

const notMutedErrs = {
	muteOoc: new Err('mute.oocNotMuted', "OOC messages are not being muted."),
	muteMessage: new Err('mute.messagesNotMuted', "Messages are not being muted."),
	muteTravel: new Err('mute.travelNotMuted', "Travel messages are not being muted."),
};

/**
 * Mute handles muting of events.
 */
class Mute {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'charLog',
			'charFocus',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addEventModifier({
			id: 'mute',
			sortOrder: 0,
			callback: this._applyModifications.bind(this),
		});

		// Migrate localStorage stored settings to server.
		// [TODO] Remove after 2025-01-01
		this._migrateMute('.ooc', 'muteOoc');
		this._migrateMute('.message', 'muteMessage');
		this._migrateMute('.travel', 'muteTravel');
		this._migrateMuteChars();
	}

	/**
	 * Sets the mute ooc character setting.
	 * @param {Model} ctrl Controlled character model.
	 * @param {boolean} [muteOoc] Flag to set mute ooc to. Defaults to toggle.
	 * @param {boolean} [strict] Flag to set reject the promise if the value is already set.
	 * @returns {Promise} Promise to setting being set.
	 */
	toggleMuteOoc(ctrl, muteOoc, strict) {
		return this._toggleMute('muteOoc', ctrl, muteOoc, strict);
	}

	/**
	 * Sets the mute messages character setting.
	 * @param {Model} ctrl Controlled character model.
	 * @param {boolean} muteMessage Flag to set mute messages to. Detaults to toggle.
	 * @param {boolean} [strict] Flag to set reject the promise if the value is already set.
	 * @returns {Promise} Promise to setting being set.
	 */
	toggleMuteMessage(ctrl, muteMessage, strict) {
		return this._toggleMute('muteMessage', ctrl, muteMessage, strict);
	}

	/**
	 * Sets the mute travel character setting.
	 * @param {Model} ctrl Controlled character model.
	 * @param {boolean} muteTravel Flag to set mute travel to. Defaults to toggle.
	 * @param {boolean} [strict] Flag to set reject the promise if the value is already set.
	 * @returns {Promise} Promise to setting being set.
	 */
	toggleMuteTravel(ctrl, muteTravel, strict) {
		return this._toggleMute('muteTravel', ctrl, muteTravel, strict);
	}

	/**
	 * Mutes or unmutes a characters.
	 * @param {Model} charId ID of character to mute.
	 * @param {boolean} [muteChar] Flag to mute or unmute character. Toggle if omitted.
	 * @returns {Promise} Promise to the character being muted/unmuted.
	 */
	toggleMuteChar(charId, muteChar) {
		let player = this.module.player.getPlayer();
		muteChar = typeof muteChar == 'undefined' ? !player.mutedChars.props[charId] : !!muteChar;
		return player.call('muteChars', {
			chars: { [charId]: muteChar },
		});
	}

	_toggleMute(prop, ctrl, mute, strict) {
		let oldMute = ctrl.settings[prop];
		mute = typeof mute == 'undefined' ? !oldMute : !!mute;
		if (strict && mute == oldMute) {
			return Promise.reject((mute ? alreadyMutedErrs : notMutedErrs)[prop]);
		}
		return this.module.player.getPlayer().call('setCharSettings', {
			charId: ctrl.id,
			puppeteerId: ctrl.puppeteer?.id || undefined,
			[prop]: mute,
		});
	}

	/**
	 * Checks if a character is muted.
	 * @param {string} charId Character ID
	 * @returns {bool} True if muted, otherwise false.
	 */
	isMutedChar(charId) {
		return !!(charId && this.module.player.getPlayer()?.mutedChars.props[charId]);
	}

	// Migrates mute settings from local storage over to backend. Remove after 2025-01-01.
	async _migrateMute(type, prop) {
		if (!localStorage) return;

		let player = await this.module.player.getPlayerPromise();
		let key = muteStoragePrefix + player.id + type;
		let raw = localStorage.getItem(key);
		if (raw) {
			try {
				let chars = JSON.parse(raw);
				for (let charId in chars) {
					if (chars[charId]) {
						// Await to avoid spamming too much
						await player.call('setCharSettings', {
							charId: charId,
							[prop]: true,
						}).catch(err => {
							// Char not found is considered a non-error.
							if (err.code != 'core.charNotFound') {
								throw err;
							}
						});
						await new Promise(resolve => setTimeout(resolve, 1000)); // Migrate one every second to avoid flooding.
					}
				}
				// Once successfully migrated, delete key.
				localStorage.removeItem(key);
			} catch (ex) {
				console.log("Error migrating " + prop + ":", ex);
			}
		}
	}

	// Migrates muted chars from local storage over to backend. Remove after 2025-01-01.
	async _migrateMuteChars() {
		if (!localStorage) return;

		let player = await this.module.player.getPlayerPromise();
		let key = muteStoragePrefix + player.id + '.chars';
		let raw = localStorage.getItem(key);
		if (raw) {
			try {
				let chars = JSON.parse(raw);
				if (Object.keys(chars).length) {
					await player.call('muteChars', { chars });
				}
				// Once successfully migrated, delete key.
				localStorage.removeItem(key);
			} catch (ex) {
				console.log("Error migrating muted chars: ", ex);
			}
		}
	}

	_applyModifications(ev, ctrl, mod) {
		let muted = false;
		let settings = ctrl.settings;
		let charId = ev.char && ev.char.id;
		if (settings.muteTravel) {
			if (travelEvents[ev.type] && charId != ctrl.id && !this.module.charFocus.hasFocus(ctrl.id, charId)) {
				muted = true;
			}
		}

		if (charId != ctrl.id && settings.muteOoc && (ev.ooc || ev.type === oocEventType)) {
			muted = true;
		}

		if (charId != ctrl.id && settings.muteMessage && ev.type === messageEventType) {
			muted = true;
		}

		if (!muted && this.isMutedChar(charId) && !unmutableEvents[ev.type]) {
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
