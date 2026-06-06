import themeTokens from './themeTokens';
const defaultColors = APP_COLORS;

function keyToCssVar(key) {
	return '--mu-' + key.replaceAll('.', '-');
}

/**
 * Theme handles the theme tokens and css variables.
 */
class Theme {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		// Bind callbacks
		this.getToken = this.getToken.bind(this);

		this.appTheme = this.app.props.theme || {};
		this.tokens = {};
		this.colors = {};
		// Add standard color tokens
		this._addColorTokens();

	}

	/**
	 * Returns the token value by key.
	 * @param {string} key Token key.
	 * @returns {string | null} Token string or null if not set.
	 */
	getToken(key) {
		return this.tokens[key] || null;
	}

	/**
	 * Adds a theme token.
	 * If a value resolves to an empty value, the css variable is not set.
	 * @param {string} key Token key. Modules should prefix it with its own name, lower-cased.
	 * @param {string | (colors: Record<string, string>, getToken: (key: string) => string) => (string)} value Token default value, or callback function that returns the default value.
	 * @returns {string} Token value
	 */
	addToken(key, value) {
		if (this.tokens[key]) {
			console.error("[Theme] Duplicate token key: " + key);
			return null;
		}

		let v = this._getParam(key) || this.appTheme[key] || (
			typeof value == 'function'
				? value(this.colors, this.getToken)
				: String(value ?? '')
		);

		if (v) {
			document.documentElement.style.setProperty(keyToCssVar(key), v);
		}
		this.tokens[key] = v;

		return v;
	}

	/**
	 * Adds a set of theme tokens.
	 * @param {Record<string, string | (colors: Record<string, string>, getToken: (key: string) => string) => (string)>} tokens Token key/value object.
	 * @returns {this}
	 */
	addTokens(tokens) {
		for (let k in tokens) {
			this.addToken(k, tokens[k]);
		}
		return this;
	}

	removeToken(key) {
		let v = this.tokens[key];
		if (v) {
			document.documentElement.style.removeProperty(keyToCssVar(key));
		}
		delete this.tokens[key];
	}

	/**
	 * Removes a set of theme tokens.
	 * @param {Record<string, any>} tokens Token key/value object.
	 * @returns {this}
	 */
	removeTokens(tokens) {
		for (let k in tokens) {
			this.removeToken(k);
		}
		return this;
	}

	_addColorTokens(params) {
		// Set theme colors
		for (let k in defaultColors) {
			let v = this.addToken('color.' + k, defaultColors[k]);
			Object.defineProperty(this.colors, k, { value: v });
		}

		// Set additional theme tokens
		for (let k in themeTokens) {
			this.addToken(k, themeTokens[k]);
		}
	}

	_getParam(key) {
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

	dispose() {
		for (let k in this.tokens) {
			this.removeToken(k);
		}
	}
}

export default Theme;
