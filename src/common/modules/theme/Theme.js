import l10n from 'modapp-l10n';
import themeTokens from './themeTokens';
const seedColors = APP_COLORS;

function keyToCssVar(key) {
	return '--mu-' + key.replaceAll('.', '-');
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
 */
class Theme {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		// Bind callbacks
		this.getTokenValue = this.getTokenValue.bind(this);

		this.appTheme = this.app.props.theme || {};
		this.theme = {};
		this.tokens = {};
		this.values = {};
		this.colors = {};
		this.groups = { 'color': { keyPrefix: 'color', name: l10n.l('theme.seedColors', "Seed colors"), sortOrder: 0 }};
		// Add standard color tokens
		this._addColorTokens();

	}

	/**
	 * Sets custom theme values.
	 * @param {Record<string, string>} theme Theme object where key is the token key, and value the token value.
	 */
	setTheme(theme) {
		theme = theme || {};
		if (shallowCompare(this.theme, theme)) {
			return;
		}
		this.theme = theme;
		this._update();
	}

	/**
	 * Returns the token value by key.
	 * @param {string} key Token key.
	 * @returns {string | null} Token string or null if not set.
	 */
	getTokenValue(key) {
		return this.values[key] || null;
	}

	/**
	 * Returns token values with their resolved values.
	 * @returns {Record<string, string>} Object with key being the token key, and value being the token value.
	 */
	getTokenValues() {
		return Object.assign({}, this.values);
	}

	/**
	 * Returns token groups.
	 * @returns {Record<string, {keyPrefix: string, name: LocaleString|string>, sortOrder?: number}>} Object with key being the keyPrefix, and value being the token object.
	 */
	getGroups() {
		return Object.assign({}, this.groups);
	}

	/**
	 * Adds a theme token.
	 * If a value resolves to an empty value, the css variable is not set.
	 * @param {object} token Token object.
	 * @param {string} token.key Token key. Modules should prefix it with its own name, lower-cased.
	 * @param {string | (colors: Record<string, string>, getToken: (key: string) => string) => (string)} token.value Token default value, or callback function that returns the default value.
	 * @returns {string} Resolved token value
	 */
	addToken(token) {
		let key = token.key;
		if (this.tokens[key]) {
			console.error("[Theme] Duplicate token key: " + key);
			return null;
		}
		this.tokens[key] = token.value;
		return this._setValue(key);
	}

	/**
	 * Adds a set of theme tokens or groups.
	 * @param {Array<{ key: string, value: string | (colors: Record<string, string>, getToken: (key: string) => string) => (string) } | { keyPrefix: string, name: LocaleString | string, sortOrder?: number }>} tokens Array of token or group objects.	 * @returns {this}
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
		delete this.values[key];
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
		if (this.groups[keyPrefix]) {
			console.error("[Theme] Duplicate group keyPrefix: " + keyPrefix);
			return null;
		}
		this.groups[keyPrefix] = group;
	}

	/**
	 * Removes a group by keyPrefix.
	 * @param {string} keyPrefix Token key prefix.
	 */
	removeGroup(keyPrefix) {
		delete this.groups[keyPrefix];
	}

	_setValue(key) {
		let t = this.tokens[key];
		if (!t) return;

		let v = this._getParam(key) ||
			this._getParam(legacyMapping[key]) ||
			this.theme[key] ||
			this.appTheme[key] ||
			this.appTheme[legacyMapping[key]] ||
			(
				typeof t == 'function'
					? t(this.getTokenValue)
					: String(t ?? '')
			);
		if (v) {
			document.documentElement.style.setProperty(keyToCssVar(key), v);
		}
		this.values[key] = v;
		return v;
	}

	_update() {
		for (let key in this.tokens) {
			this._setValue(key);
		}
	}

	_addColorTokens(params) {
		// Set theme seed colors
		for (let k in seedColors) {
			let v = this.addToken({ key: 'color.' + k, value: seedColors[k] });
			Object.defineProperty(this.colors, k, { value: v });
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
		return Object.keys(this.tokens).map(k => ({ key: k, value: this.tokens[k] }));
	}

	dispose() {
		for (let k in this.tokens) {
			this.removeToken(k);
		}
	}
}

export default Theme;
