import l10n from 'modapp-l10n';
import CharList from 'classes/CharList';
import flattenObject from 'utils/flattenObject';
import * as charEvent from 'utils/charEvent';
import { firstTriggerWord } from 'utils/formatText';

const focusStoragePrefix = 'charFocus.';

const focusTitle = l10n.l('charLog.newPost', "New post from {char.name}");
const mentionTitle = l10n.l('charLog.mentioned', "{char.name} mentioned {mention}");

const focusColors = {
	red: '#a00808',
	green: '#08a008',
	blue: '#4444de',
	yellow: '#c0c000',
	cyan: '#0fb7b7',
	purple: '#7c00a2',
	pink: '#ef6e9e',
	orange: '#ef8226',
	white: '#f3f3f3',
	none: null,
};

function isValidColor(color) {
	return !!(color && (focusColors.hasOwnProperty(color) || color.match(/^#(?:[0-9a-fA-F]{3,3}){1,2}$/)));
}

function isPredefined(color) {
	for (let k in focusColors) {
		if (color === focusColors[k]) {
			return k;
		}
	}
	return null;
}

/**
 * CharFocus handles focus on certain characters and sending of notifications on
 * charLog events.
 */
class CharFocus {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlAdd = this._onCtrlAdd.bind(this);
		this._onCtrlRemove = this._onCtrlRemove.bind(this);
		this._onFocusChange = this._onFocusChange.bind(this);

		this.app.require([
			'auth',
			'player',
			'notify',
			'api',
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		/**
		 * Stores current focus of characters and their stored color for each controlled character.
		 * @type {{ [ctrlId: string]: CharFocusChars | PuppetFocusChars }}}
		 */
		this.focusChars = {};

		/**
		 * Holds focus models for all currently controlled characters.
		 * @type {{ [ctrlId: string]: CharSettings | PuppetSettings }}
		 */
		this.settings = {};
		/**
		 * Last colors used when focusing on characters. Shared between all controlled characters.
		 * The value is the color used.
		 * @type { [charId: string]: string }
		 */
		this.lastColors = {};

		this.focusCharList = new CharList(() => {
			let c = this.module.player.getActiveChar();
			if (!c) return null;
			let f = this.focusChars[c.id]?.props;
			if (!f) return null;

			let list = Object.keys(f).map(k => f[k]);
			list.sort((a, b) => a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname));
			return list;
		});
		this.style = document.createElement('style');
		document.head.appendChild(this.style);

		const notificationHandlers = {
			say: (charId, ev) => this.notifyOnMention(charId, ev, mentionTitle) || this.notifyOnFocus(charId, ev, focusTitle),
			pose: (charId, ev) => this.notifyOnMention(charId, ev, mentionTitle) || this.notifyOnFocus(charId, ev, focusTitle),
			sleep: (charId, ev) => this.notifyOnFocus(charId, ev, l10n.l('charLog.charFellAsleep', "{char.name} fell asleep")),
			leave: (charId, ev) => this.notifyOnFocus(charId, ev, l10n.l('charLog.charLeft', "{char.name} left")),
			arrive: (charId, ev) => this.notifyOnFocus(charId, ev, l10n.l('charLog.charArrived', "{char.name} arrived")),
			whisper: (charId, ev) => this.notifyOnTargetEvent(charId, ev, l10n.l('charLog.charWhisperTo', "{char.name} whispered to {target.name}")),
			message: (charId, ev) => this.notifyOnTargetEvent(charId, ev, l10n.l('charLog.charMessagedTo', "{char.name} messaged to {target.name}")),
			describe: (charId, ev) => this.notifyOnMention(charId, ev, mentionTitle) || this.notifyOnFocus(charId, ev, l10n.l('charLog.newDescBy', "New description by {char.name}")),
			summon: (charId, ev) => this.notifyOnTargetEvent(charId, ev, l10n.l('charLog.charSummoned', "{char.name} summons {target.name}")),
			ooc: (charId, ev) => this.notifyOnMention(charId, ev, mentionTitle) || this.notifyOnFocus(charId, ev, l10n.l('charLog.newOocPost', "New Out of Character post from {char.name}")),
			warn: (charId, ev) => this.notifyOnTargetEvent(charId, ev, l10n.l('charLog.charWarningTo', "{char.name} warned {target.name}")),
			action: (charId, ev) => this.notifyOnFocus(charId, ev, l10n.l('charLog.newAction', "{char.name} {msg}")),
			address: (charId, ev) => this.notifyOnTargetEvent(charId, ev, l10n.l('charLog.charAddressed', "{char.name} addressed {target.name}")),
			roll: (charId, ev) => this.notifyOnFocus(charId, ev, l10n.l('charLog.charRolled', "{char.name} rolled")),
		};
		for (let k in notificationHandlers) {
			this.module.charLog.addEventHandler(k, notificationHandlers[k]);
		}

		// Load last used colors
		this._loadLastColors();

		// Migrate localStorage stored settings to server.
		// [TODO] Remove after 2025-01-01
		this._migrateFocus() // Currently focused
			.then(() => this._migrateFocusAll());

		this._setListeners(true);
	}

	/**
	 * Adds focus on a character by calling focusChar on the player.
	 * @param {Model} ctrl Controlled character doing the focusing.
	 * @param {string} charId ID of character to focus on.
	 * @param {string} color Focus color (e.g. 'red', 'blue', 'none') or hex color code starting with '#'
	 * @returns {Promise}
	 */
	addFocus(ctrl, charId, color) {
		// Convert color to lowercase if we have a string
		color = typeof color == 'string' ? color.toLowerCase() : '';

		if (!isValidColor(color)) {
			// Get last used color or next suggested color code.
			color = this.lastColors[charId] || this._getSuggestedColor(ctrl);
		}

		this.lastColors[charId] = color;
		this._saveLastColors();

		// Turn color name into hex code.
		color = focusColors.hasOwnProperty(color) ? focusColors[color] : color;

		return this.module.player.getPlayer().call('focusChar', {
			charId: ctrl.id,
			puppeteerId: ctrl.puppeteer?.id || undefined,
			targetId: charId,
			color,
		});
	}

	/**
	 * Removes focus from a character by calling unfocusChar on the player.
	 * @param {string} ctrl Controlled character doing the focusing.
	 * @param {string} charId Character to remove focus from.
	 * @returns {Promise} Promise of the character being unfocused.
	 */
	removeFocus(ctrl, charId) {
		return this.module.player.getPlayer().call('unfocusChar', {
			charId: ctrl.id,
			puppeteerId: ctrl.puppeteer?.id || undefined,
			targetId: charId,
		});
	}

	/**
	 * Returns a CharList with the currently focused characters
	 * @returns	{CharList} Focused characters of the currently controlled character.
	 */
	getFocusCharList() {
		return this.focusCharList;
	}

	/**
	 * Returns an object with focused character ids as keys and an object of the
	 * focus colors and translated color hex code as values.
	 * @param {string} ctrlId Controlled character ID to list focused characters for.
	 * @returns {[]{ char: object, color: string, hex: string }} Array of objects containing focused characters.
	 */
	getFocusCharColors(ctrlId) {
		let chars = this.focusChars[ctrlId]?.props;
		let focus = this.settings[ctrlId]?.focus.props;
		// Assert we have focusChars and controlled characters focus list.
		if (!chars || !focus) return [];

		let list = Object.keys(focus).map(k => {
			let color = focus[k].color;
			let char = chars[k];
			return { char, hex: color, color: isPredefined(color) || color };
		}).filter(o => o.char);
		list.sort((a, b) => a.char.name.localeCompare(b.char.name) || a.char.surname.localeCompare(b.char.surname));
		return list;
	}

	/**
	 * Gets an object with supported focus highlight colors.
	 * @returns {object} Focus colors where key is the color name and value is
	 * the color code.
	 */
	getFocusColors() {
		return focusColors;
	}

	/**
	 * Checks if a controlled character is focusing on a specific character.
	 * It does not take focus all into account.
	 * @param {*} ctrlId Controlled character ID.
	 * @param {*} charId Focused character ID.
	 * @returns {boolean} True if character is focused on, otherwise false.
	 */
	hasFocus(ctrlId, charId) {
		let f = this.focusChars[ctrlId]?.props;
		return !!(f && charId && f[charId]);
	}

	/**
	 * Send a notification on other characters if the character is in focus.
	 * @param {string} ctrlId Controlled character receiving the event.
	 * @param {object} [ev] Event object.
	 * @param {string|LocaleString} title Event title. Will get the char passed in as data.
	 * @returns {boolean} Returns true if a notification was sent.
	 */
	notifyOnFocus(ctrlId, ev, title) {
		if (ctrlId === ev.char?.id) {
			return false;
		}

		if (!this.hasFocus(ctrlId, ev.char?.id)) {
			// Check if muted event
			if (ev.mod?.muted || !this.isNotifyOnAll(ctrlId)) {
				return false;
			}
		}
		this._notify(ctrlId, ev, typeof title == 'string'
			? title
			: l10n.t(title, flattenObject(ev)),
		);
		return true;
	}

	/**
	 * Send a notification for other characters unless the character is muted.
	 * @param {string} ctrlId Controlled character receiving the event.
	 * @param {object} [ev] Event object.
	 * @param {string|LocaleString} title Event title. Will get the char passed in as data.
	 * @returns {boolean} Returns true if a notification was sent.
	 */
	notifyOnEvent(ctrlId, ev, title) {
		if (ctrlId === ev.char?.id || ev.mod?.muted) {
			return false;
		}
		this._notify(ctrlId, ev, typeof title == 'string'
			? title
			: l10n.t(title, flattenObject(ev)),
		);
	}

	/**
	 * Send a notification if your controlled character is mentioned in the
	 * ev.msg string.
	 * @param {string} ctrlId Controlled character receiving the event.
	 * @param {object} [ev] Event object.
	 * @param {string|LocaleString} title Event title. Will get the char passed
	 * in as data.
	 * @returns {boolean} Returns true if a notification was sent.
	 */
	notifyOnMention(ctrlId, ev, title) {
		// Unfocused muted events does not trigger
		if (ctrlId === ev.char?.id || (!this.hasFocus(ctrlId, ev.char?.id) && ev.mod?.muted)) {
			return false;
		}

		let p = this.module.player.getPlayer();
		if (!p || !p.notifyOnMention || !ev.mod?.triggers) {
			return false;
		}

		this._notify(ctrlId, ev, typeof title == 'string'
			? title
			: l10n.t(title, flattenObject({ char: ev.char, mention: firstTriggerWord(ev.msg, ev.mod.triggers) })),
		);
		return true;
	}

	/**
	 * Send a notification for other characters if the character is targeted
	 * @param {string} ctrlId Controlled character receiving the event.
	 * @param {object} [ev] Event object. Should contain a target property which is the targeted character.
	 * @param {string|LocaleString} title Event title. Will get the char passed in as data.
	 * @returns {boolean} Returns true if a notification was sent.
	 */
	notifyOnTargetEvent(ctrlId, ev, title) {
		if (ctrlId === ev.char?.id) {
			return false;
		}

		if (!this.hasFocus(ctrlId, ev.char?.id)) {
			// Check if muted event
			if (ev.mod?.muted) {
				return false;
			}
			// Check if we should not send event
			if (!this.isNotifyOnAll(ctrlId)) { // Notify on all
				let p = this.module.player.getPlayer();
				if (!p?.notifyOnEvent || !ev.mod?.targeted) { // Targeted event
					return false;
				}
			}
		}
		this._notify(ctrlId, ev, typeof title == 'string'
			? title
			: l10n.t(title, flattenObject({ char: ev.char, target: charEvent.extractTarget(ctrlId, ev) })),
		);
		return true;
	}

	/**
	 * Toggles or sets the notifyOnAll value in character settings.
	 * @param {CharCtrlModel} ctrl Controlled character.
	 * @param {boolean} [notifyOnAll] Notify on all flag to set. Defaults to toggle.
	 * @returns {Promise<boolean>} Promise of a flag telling of notifyOnAll was changed.
	 */
	toggleNotifyOnAll(ctrl, notifyOnAll) {
		let oldNotifyOnAll = ctrl.settings.notifyOnAll;
		notifyOnAll = typeof notifyOnAll == 'undefined' ? !oldNotifyOnAll : !!notifyOnAll;

		// No attempt to set the value if it is already set.
		if (oldNotifyOnAll == notifyOnAll) {
			return Promise.resolve(false);
		}

		return this.module.player.getPlayer().call('setCharSettings', {
			charId: ctrl.id,
			puppeteerId: ctrl.puppeteer?.id || undefined,
			notifyOnAll,
		}).then(() => true);
	}

	/**
	 * Checks if a controlled character has notifyOnAll set to true.
	 * @param {string} ctrlId ID of a controlled character.
	 * @returns {boolean}
	 */
	isNotifyOnAll(ctrlId) {
		return !!(this.settings[ctrlId]?.notifyOnAll);
	}

	_notify(ctrlId, ev, title) {
		this.module.notify.send(title, {
			tag: ev.id,
			closeOnClick: true,
			onClick: () => {
				this.module.player.setActiveChar(ctrlId).catch(() => {});
				window.focus();
			},
		});
	}

	_setListeners(on) {
		let p = this.module.player;
		let cb = on ? 'on' : 'off';
		p[cb]('ctrlAdd', this._onCtrlAdd);
		p[cb]('ctrlRemove', this._onCtrlRemove);
	}

	_onCtrlAdd(ev) {
		let settings = ev.char.settings;
		if (this.focusChars && settings) {
			let charId = ev.char.id;
			let puppeteerId = ev.char.puppeteer?.id;
			// Start listening to focus change
			this.settings[charId] = settings;
			settings.focus.on('change', this._onFocusChange);

			let promise = (puppeteerId
				? this.module.api.get(`core.char.${puppeteerId}.puppet.${charId}.focus.chars`)
				: this.module.api.get(`core.char.${charId}.focus.chars`)
			).then(chars => {
				// Assert the promise matches and no other event has replaced it.
				if (this.focusChars[charId] == promise) {
					// Replace the promise with the chars model

					chars.on();
					this.focusChars[charId] = chars;
				}
			});
			this.focusChars[charId] = promise;

			this._updateStyle();
		}
	}

	_onCtrlRemove(ev) {
		if (this.focusChars) {
			let charId = ev.char.id;
			// Assert we have an off function. If not, it might be a promise of
			// the focused characters being loaded.
			this.focusChars[charId]?.off?.();
			delete this.focusChars[charId];

			// Stop listening to focus change
			this.settings[charId]?.focus.off('change', this._onFocusChange);
			delete this.settings[charId];

			this._updateStyle();
		}
	}

	_onFocusChange(ev) {
		this._updateStyle();
	}

	_saveLastColors() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			localStorage.setItem(focusStoragePrefix + user.id + '.colors', JSON.stringify(this.lastColors));
		});
	}

	_loadLastColors() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			let raw = localStorage.getItem(focusStoragePrefix + user.id + '.colors');
			if (raw) {
				this.lastColors = JSON.parse(raw);
			}
		});
	}

	// Migrates focus settings from local storage over to backend. Remove after 2025-01-01.
	async _migrateFocus() {
		if (!localStorage) return;

		let player = await this.module.player.getPlayerPromise();
		let key = focusStoragePrefix + player.id + '.focus';
		let raw = localStorage.getItem(key);
		if (raw) {
			try {
				let dta = JSON.parse(raw);
				for (let o of dta) {
					// Translate focus color to hex
					let color = focusColors.hasOwnProperty(o.color) ? focusColors[o.color] : o.color;
					if (!color || isValidColor(color)) {
						await player.call('focusChar', {
							charId: o.ctrlId,
							targetId: o.charId,
							color,
						}).catch(err => {
							// Char or target not found is considered non-errors.
							// It may happen because of character deletion, or that controlled character was a puppet.
							if (err.code != 'core.charNotFound' && err.code != 'core.targetCharNotFound') {
								throw err;
							}
						});
						await new Promise(resolve => setTimeout(resolve, 1000)); // Migrate one every second to avoid flooding.
					}
				}
				// Once successfully migrated, delete key.
				localStorage.removeItem(key);
				localStorage.removeItem('focus'); // Legacy key
			} catch (ex) {
				console.log("Error migrating focus:", ex);
			}
		}
	}

	async _migrateFocusAll() {
		if (!localStorage) return;

		let player = await this.module.player.getPlayerPromise();
		let key = focusStoragePrefix + player.id + '.all';
		let raw = localStorage.getItem(key);
		if (raw) {
			try {
				let dta = JSON.parse(raw);
				for (let charId in dta) {
					await player.call('setCharSettings', {
						charId,
						notifyOnAll: true,
					}).catch(err => {
						// Char not found is considered a non-error.
						if (err.code != 'core.charNotFound') {
							throw err;
						}
					});
				}
				// Once successfully migrated, delete key.
				localStorage.removeItem(key);
			} catch (ex) {
				console.log("Error migrating focusAll:", ex);
			}
		}
	}

	_updateStyle() {
		let s = '';
		for (let ctrlId in this.settings) {
			let focus = this.settings[ctrlId].focus.props;
			for (let charId in focus) {
				let c = focus[charId].color;
				if (c) {
					s += '.f-' + ctrlId + '-' + charId + ' {border-left-color:' + c + '} .mf-' + ctrlId + '-' + charId + ' {border-color:' + c + '}\n';
				}
			}
		}

		this.style.innerHTML = s;
	}

	/* Get the next suggested color. */
	_getSuggestedColor(ctrl) {
		let f = ctrl?.settings?.focus.props;

		// Assert we have focus list. Else just return first color.
		if (!f) return Object.keys(focusColors)[0];

		// Count how many times each predefined focusColor is used.
		let count = {};
		for (let charId in f) {
			let k = isPredefined(f[charId].color);
			if (k) {
				count[k] = (count[k] || 0) + 1;
			}
		}

		// Pick the least used predefined focusColor
		let i = 0;
		while (true) {
			for (let k in focusColors) {
				if (k !== 'none' && (count[k] || 0) === i) {
					return k;
				}
			}
			i++;
		}
	}

	dispose() {
		document.head.removeChild(this.style);
		// Unlisten to focused chars.
		this._setListeners(false);
		for (let ctrlId in this.focusChars) {
			// Assert we have an off function, or else it might just be a
			// promise of the characters loading.
			this.focusChars[ctrlId]?.off?.();
			// Stop listening to focus models.
			this.settings[ctrlId]?.focus.off();
		}
		this.focusChars = null;
		this.settings = null;
	}
}

export default CharFocus;
