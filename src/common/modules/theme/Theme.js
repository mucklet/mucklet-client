import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import themeTokens from './themeTokens';
const seedColors = APP_COLORS;

function keyToCssVar(key) {
	return '--mu-' + key.replaceAll('.', '-');
}

function transformValue(type, value) {
	switch (type) {
		case 'rgba':
			if (value.length !== 9 || value[0] !== '#') return value;
			let hex = Number('0x' + value.slice(1));
			if (Number.isNaN(hex)) {
				return value;
			}
			return `rgba(${hex >>> 24}, ${(hex >>> 16) & 0xff}, ${(hex >>> 8) & 0xff}, ${Math.round((hex & 0xff) / 0xff * 1000) / 1000})`;
	}
	return value;
}

// Legacy mappings.
const legacyMapping = {
	'color.neutral': 'color.muted',
};

function shallowCompare(obj1, obj2) {
	return Object.keys(obj1).length === Object.keys(obj2).length &&
		Object.keys(obj1).every(key => obj1[key] === obj2[key]);
}

/**
 * Theme handles the theme tokens and css variables.
 *
 * The order by which a theme value is selected is:
 *
 * 	theme - Custom theme value for the client
 * 	param - Query parameter value
 *  realm - Realm theme value
 * 	preset - Client preset value, possibly calculated from other values
 */
class Theme {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		// Bind callbacks
		this.getTokenValue = this.getTokenValue.bind(this);

		this.appTheme = this.app.props.theme || {};
		this.tokens = {};
		this.theme = new Model({ data: {}, eventBus: this.app.eventBus });
		this.values = new Model({ data: {}, eventBus: this.app.eventBus });
		this.groups = new Model({ data: {
			'color': { keyPrefix: 'color', name: l10n.l('theme.seedColors', "Seed colors"), sortOrder: 0 },
		}, eventBus: this.app.eventBus });
		// Add standard color tokens
		this._addColorTokens();

	}

	/**
	 * Sets custom theme values.
	 * @param {Record<string, string>} theme Theme object where key is the token key, and value the token value.
	 */
	setTheme(theme) {
		theme = Object.assign({}, theme);
		if (shallowCompare(this.theme, theme)) {
			return;
		}
		this.theme = theme;
		this._update();
	}

	/**
	 * Calculates all token values based on a custom theme without making any
	 * changes to the applied theme.
	 * @param {Record<string, string>} theme Theme object where key is the token key, and value the token value.
	 * @returns
	 */
	calculateTheme(theme) {
		let o = Object.assign({}, theme);
		let getTokenValue = (key) => o[key] || null;
		for (let key in this.tokens) {
			o[key] = this._calculateValue(key, this.tokens[key], o, getTokenValue, true);
		}
		return o;
	}

	/**
	 * Returns the effective token value by key.
	 * @param {string} key Token key.
	 * @returns {string} Currently set value that is in effect.
	 */
	getTokenValue(key) {
		return this.values.props[key]?.value || null;
	}

	/**
	 * Returns token values with their resolved values.
	 * @returns {Model<Record<string, Model<{
	 *  key: string,
	 * 	type: "rgb"|"rgba",
	 * 	value: string|null,
	 * 	theme: string|null,
	 * 	realm: string|null,
	 * 	custom: string|null,
	 * 	param: string|null,
	 * }>>} Model with key being the token key, and value being the token value model.
	 */
	getTokenValues() {
		return this.values;
	}

	/**
	 * Returns token groups.
	 * @returns {Model<Record<string, {
	 * 	keyPrefix: string,
	 * 	name: LocaleString|string>,
	 * 	sortOrder?: number,
	 * }>>} Object with key being the keyPrefix, and value being the token object.
	 */
	getGroups() {
		return this.groups;
	}

	/**
	 * Adds a theme token.
	 * If a value resolves to an empty value, the css variable is not set.
	 * @param {object} token Token object.
	 * @param {string} token.key Token key. Modules should prefix it with its own name, lower-cased.
	 * @param {string | (colors: Record<string, string>, getToken: (key: string) => string) => (string)} token.value Token default value, or callback function that returns the default value.
	 * @param {"rgb" | "rgba"} [token.type] Token type. Defaults to "rgb" if omitted.
	 * @returns {string} Resolved token value
	 */
	addToken(token) {
		let key = token.key;
		if (this.tokens[key]) {
			console.error("[Theme] Duplicate token key: " + key);
			return null;
		}
		let t = { value: token.value, type: token.type || 'rgb' };
		this.tokens[key] = t;
		this.values.set({ [key]: this._setValue(key, t) });
	}

	/**
	 * Adds a set of theme tokens or groups.
	 * @param {Array<{ key: string, value: string | (colors: Record<string, string>, getToken: (key: string) => string) => (string) } | { keyPrefix: string, name: LocaleString | string, sortOrder?: number }, type?: "rgb"|"rgba">} tokens Array of token or group objects.
	 * @returns {this}
	 */
	addTokens(tokens) {
		for (let o of tokens) {
			if (o.key) {
				this.addToken(o);
			} else if (o.keyPrefix) {
				this.addGroup(o);
			}
		}
	}

	/**
	 * Removes a token by key.
	 * @param {string} key Token key.
	 */
	removeToken(key) {
		let v = this.tokens[key];
		if (v) {
			document.documentElement.style.removeProperty(keyToCssVar(key));
		}
		delete this.tokens[key];
		this.values.set({ [key]: undefined });
	}

	/**
	 * Removes a set of theme tokens or groups.
	 * @param {Array<{ key: string, value: string | (colors: Record<string, string>, getToken: (key: string) => string) => (string) } | { keyPrefix: string, name: LocaleString | string, sortOrder?: number }>} tokens Array of token or group objects to remove.
	 */
	removeTokens(tokens) {
		for (let o of tokens) {
			if (o.key) {
				this.removeToken(o.key);
			} else if (o.keyPrefix) {
				this.removeGroup(o.keyPrefix);
			}
		}
	}

	/**
	 * Adds a token group.
	 * @param {object} group Token object.
	 * @param {string} group.keyPrefix Token key prefix. Will only match complete parts, but never the full key.
	 * @param {LocaleString | string} group.name Group name.
	 * @param {number} [group.sortOrder] Group sort order.
	 */
	addGroup(group) {
		let keyPrefix = group.keyPrefix;
		if (this.groups.props[keyPrefix]) {
			console.error("[Theme] Duplicate group keyPrefix: " + keyPrefix);
			return null;
		}
		this.groups.set({ [keyPrefix]: group });
	}

	/**
	 * Removes a group by keyPrefix.
	 * @param {string} keyPrefix Token key prefix.
	 */
	removeGroup(keyPrefix) {
		this.groups.set({ [keyPrefix]: undefined });
	}

	_calculateValue(key, token, themeColors, getTokenValue, valueOnly) {
		if (!token) return null;

		let theme = themeColors[key] || null;
		let param = this._getParam(key) || this._getParam(legacyMapping[key]) || null;
		let realm = this.appTheme[key] || this.appTheme[legacyMapping[key]] || null;
		let preset = (
			typeof token.value == 'function'
				? token.value(getTokenValue)
				: String(token.value ?? '')
		);
		// Select value based on prio order
		let value = theme || param || realm || preset || null;

		return valueOnly ? value : { key, type: token.type, value, theme, param, realm, preset };
	}

	_setValue(key, token) {
		let data = this._calculateValue(key, token, this.theme, this.getTokenValue, false);

		if (!data) return null;

		if (data.value) {
			document.documentElement.style.setProperty(keyToCssVar(key), transformValue(token.type, data.value));
		} else {
			document.documentElement.style.removeProperty(keyToCssVar(key));
		}
		let model = this.values.props[key];
		if (model) {
			model.set(data);
		} else {
			model = new Model({ data, eventBus: this.app.eventBus });
		}
		return model;
	}

	_update() {
		let o = {};
		for (let key in this.tokens) {
			o[key] = this._setValue(key, this.tokens[key]);
		}
		this.values.reset(o);
	}

	_addColorTokens(params) {
		// Set theme seed colors
		for (let k in seedColors) {
			this.addToken({ key: 'color.' + k, value: seedColors[k], type: 'rgb' });
		}

		// Set additional theme tokens
		this.addTokens(themeTokens);
	}

	_getParam(key) {
		if (!key) {
			return null;
		}
		let parts = key.split('.');
		let v = this.params;
		for (let p of parts) {
			if (!(v && typeof v == 'object' && v.hasOwnProperty(p))) {
				return null;
			}
			v = v[p];
		}
		return typeof v == 'string' ? v : null;
	}

	export() {
		return Object.keys(this.tokens).reduce((o, k) => ({ ...o, [k]: { type: this.tokens[k].type }}), {});
	}

	dispose() {
		for (let k in this.tokens) {
			this.removeToken(k);
		}
	}
}

export default Theme;
