import { Model } from 'modapp-resource';
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
	return color && (focusColors.hasOwnProperty(color) || color.match(/^#(?:[0-9a-fA-F]{3,3}){1,2}$/));
}

/**
 * CharFocus lets players focus on certain characters and get notifications on
 * charLog events.
 */
class CharFocus {
	constructor(app, params) {
		this.app = app;

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
		 * @type {{ [ctrlId: string]: { [charId: string]: { char: Model, color: string }}}}
		 */
		this.focus = {};
		/**
		 * Model with all controlled characters having focus all active. Value is always true.
		 * @type Model<{ [ctrlId]: true }>
		 */
		this.focusAll = new Model({ eventBus: this.app.eventBus });
		/**
		 * Last color used when focusing on a character. Shared between all controlled characters.
		 * The value is the color used.
		 * @type { [charId: string]: string }
		 */
		this.focusColors = {};
		this.focusCharList = new CharList(() => {
			let c = this.module.player.getActiveChar();
			if (!c) return null;
			let f = this.focus[c.id];
			if (!f) return null;

			let list = Object.keys(f).map(k => f[k].char);
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

		// Load focused characters
		this._loadFocusColors();
		this._loadFocus();
		this._loadFocusAll();
	}

	/**
	 * Adds focus on a character.
	 * @param {string} ctrlId Controlled character doing the focusing.
	 * @param {string} char Character to focus on.
	 * @param {string} color Focus color or hex color code starting with '#'
	 * @param {boolean} noUpdate Flag to surpress updating the focus css style and the localStorage.
	 * @returns {this}
	 */
	addFocus(ctrlId, char, color, noUpdate) {
		let f = this.focus[ctrlId];
		if (!f) {
			f = {};
			this.focus[ctrlId] = f;
		}

		// Unlisten to previous char
		let o = f[char.id];
		if (o && o.char) {
			o.char.off();
			delete f[char.id];
		}

		if (!isValidColor(color)) {
			color = this.focusColors[char.id] || this._getColor(ctrlId);
		}
		
		if (!noUpdate) {
			this.focusColors[char.id] = color;
			this._saveFocusColors();
		}

		char.on();
		f[char.id] = { char, color };
		if (!noUpdate) {
			this._updateStyle();
			this._saveFocus();
		}
		return this;
	}

	getFocusCharList() {
		return this.focusCharList;
	}

	getFocusCharColors() {
		return this.focusColors;
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
	 * Removes focus from a character.
	 * @param {string} ctrlId Controlled character doing the focusing.
	 * @param {string} charId Character to remove focus from.
	 * @returns {?object} Removed character or null if character was not focused on.
	 */
	removeFocus(ctrlId, charId) {
		let f = this.focus[ctrlId];
		let o = f && f[charId];
		if (!o) {
			return null;
		}

		o.char.off();
		delete f[charId];
		this._updateStyle();
		this._saveFocus();
		return o.char;
	}

	/**
	 * Checks if a controlled character is focusing on a specific character.
	 * It does not take focus all into account.
	 * @param {*} ctrlId Controlled character ID.
	 * @param {*} charId Focused character ID.
	 * @returns {boolean} True if character is focused on, otherwise false.
	 */
	hasFocus(ctrlId, charId) {
		if (!this.focus || !charId) return false;

		let f = this.focus[ctrlId];
		return !!(f && f[charId]);
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
			if (ev.mod?.muted || !this.focusAll.props[ctrlId]) {
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
			if (!this.focusAll.props[ctrlId]) { // Focus
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

	toggleFocusAll(ctrlId, focusAll) {
		focusAll = typeof focusAll == 'undefined' ? !this.focusAll.props[ctrlId] : !!focusAll;
		let v = this.focusAll.props.hasOwnProperty(ctrlId);
		if (focusAll == v) return Promise.resolve(false);

		return this.focusAll.set({ [ctrlId]: focusAll || undefined }).then(() => {
			this._saveFocusAll();
			return true;
		});
	}

	_notify(ctrlId, ev, title) {
		this.module.notify.send(title, {
			tag: ev.id,
			onClick: (ev) => {
				this.module.player.setActiveChar(ctrlId).catch(() => {});
				window.focus();
				ev.target.close();
			},
		});
	}

	_saveFocus() {
		if (!localStorage) return;

		let dta = [];
		for (let ctrlId in this.focus) {
			let f = this.focus[ctrlId];
			for (let charId in f) {
				dta.push({ ctrlId, charId, color: f[charId].color });
			}
		}
		this.module.auth.getUserPromise().then(user => {
			localStorage.setItem(focusStoragePrefix + user.id + '.focus', JSON.stringify(dta));
		});
	}

	_loadFocus() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			let raw = localStorage.getItem(focusStoragePrefix + user.id + '.focus');
			// [TODO] Legacy behavior. Remove after v 1.40.0
			let legacy = false; if (!raw) { legacy = true; raw = localStorage.getItem('focus'); }

			if (raw) {
				let dta = JSON.parse(raw);
				for (let o of dta) {
					this._addFocus(o.ctrlId, o.charId, o.color);
				}
				if (Object.keys(dta).length) {
					this._updateStyle();
				}

				// [TODO] Legacy behavior. Remove after v 1.40.0
				if (legacy) this._saveFocus();
			}
		});
	}

	_saveFocusColors() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			localStorage.setItem(focusStoragePrefix + user.id + '.colors', JSON.stringify(this.focusColors));
		});
	}

	_loadFocusColors() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			let raw = localStorage.getItem(focusStoragePrefix + user.id + '.colors');
			if (raw) {
				this.focusColors = JSON.parse(raw);
			}
		});
	}

	_loadFocusAll() {
		if (!localStorage) return;

		this.module.auth.getUserPromise().then(user => {
			let raw = localStorage.getItem(focusStoragePrefix + user.id + '.all');
			if (raw) {
				this.focusAll.reset(JSON.parse(raw));
			}
		});
	}

	_saveFocusAll() {
		if (!localStorage) return;
		this.module.auth.getUserPromise().then(user => {
			localStorage.setItem(focusStoragePrefix + user.id + '.all', JSON.stringify(this.focusAll.props));
		});
	}

	_addFocus(ctrlId, charId, color) {
		this.module.api.get('core.char.' + charId).then(char => {
			this.addFocus(ctrlId, char, color, false);
		}).catch(err => console.error("Failed to load focused char " + charId + ": ", err));
	}

	_updateStyle() {
		let s = '';
		for (let ctrlId in this.focus) {
			let f = this.focus[ctrlId];
			for (let charId in f) {
				let o = f[charId];
				let c = o.color;
				c = c[0] == '#' ? c : focusColors[c];
				if (c) {
					s += '.f-' + ctrlId + '-' + charId + ' {border-left-color:' + c + '} .mf-' + ctrlId + '-' + charId + ' {border-color:' + c + '}\n';
				}
			}
		}

		this.style.innerHTML = s;
	}

	/* Get the next suggested color. */
	_getColor(ctrlId) {
		let f = this.focus[ctrlId];
		if (!f) return Object.keys(focusColors)[0];

		// Count how many times each color is used.
		let count = {};
		for (let charId in f) {
			let c = f[charId].color;
			if (c && c != 'none' && c[0] != '#') {
				count[c] = (count[c] || 0) + 1;
			}
		}

		// Pick the least used focusColor
		let i = 0;
		while (true) {
			for (let c in focusColors) {
				if (c !== 'none' && (count[c] || 0) === i) {
					return c;
				}
			}
			i++;
		}
	}

	dispose() {
		document.head.removeChild(this.style);
		// Unlisten to focused chars.
		for (let ctrlId in this.focus) {
			let f = this.focus[ctrlId];
			for (let charId in f) {
				f[charId].char.off();
			}
		}
		this.focus = null;
	}
}

export default CharFocus;
