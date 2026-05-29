import { adjust, alpha, mix } from "utils/color";

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

		// Bind callbacks
		this.getToken = this.getToken.bind(this);

		this.appTheme = this.app.props.theme || {};
		this.tokens = {};
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
	 * @param {string | (getToken: (key: string) => string) => (string)} value Token default value, or callback function that returns the default value.
	 * @returns {this}
	 */
	addToken(key, value) {
		if (this.tokens[key]) {
			console.error("[Theme] Duplicate token key: " + key);
			return this;
		}

		let v = this.appTheme[key] || (
			typeof value == 'function'
				? value(this.getToken)
				: String(value ?? '')
		);

		if (v) {
			document.documentElement.style.setProperty(keyToCssVar(key), v);
		}
		this.tokens[key] = v;

		return this;
	}

	removeToken(key) {
		let v = this.tokens[key];
		if (v) {
			document.documentElement.style.removeProperty(keyToCssVar(key));
		}
		delete this.tokens[key];
	}

	_addColorTokens() {
		for (let k in defaultColors) {
			this.addToken('color.' + k, defaultColors[k]);
		}

		let standard = {
			// Color base variants
			'base.light': (t) => adjust(t('color.base'), 4),
			'base.lighter': (t) => adjust(t('color.base'), 8),
			'base.lightest': (t) => adjust(t('color.base'), 14),
			'base.dark': (t) => adjust(t('color.base'), -4),
			'base.placeholder.light': (t) => adjust(t('color.base'), 34, -15),
			// Color muted variants
			'muted.light': (t) => adjust(t('color.muted'), 4),
			'muted.lighter': (t) => adjust(t('color.muted'), 8),
			'muted.lightest': (t) => adjust(t('color.muted'), 16),
			'muted.dark': (t) => adjust(t('color.muted'), -16),
			'muted.darker': (t) => adjust(t('color.muted'), -24),

			// Color contrast variants
			'contrast.dark': (t) => adjust(t('color.contrast'), -16),

			// Color danger variants
			'danger.light': (t) => adjust(t('color.danger'), 6),
			'danger.hover': (t) => adjust(t('color.danger'), -8),
			'danger.active': (t) => adjust(t('color.danger'), -16),

			// Color action variants
			'action.hover': (t) => adjust(t('color.action'), -8),
			'action.active': (t) => adjust(t('color.action'), -16),

			// Base specific
			'badge.highlight': (t) => alpha(adjust(t('color.base'), 22, 8), 0.5),
			'badge.highlight.hover': (t) => alpha(adjust(t('color.base'), 19, 8), 0.5),

			// Log colors
			'log.error': (t) => mix(t('color.danger'), t('color.muted'), 70),
			'log.cmd': (t) => t('color.accent'),
			'log.attr': (t) => t('color.accent'),
			'log.listitem': (t) => mix(t('color.action'), t('color.muted'), 50),
			'log.delim': (t) => t('color.muted'),
			'log.text': (t) => adjust(t('color.muted'), 16),
			'log.entityid': (t) => adjust(t('color.muted'), 16),
			'log.bot': (t) => mix(t('color.action'), t('color.contrast'), 80),
			'log.instance': (t) => mix(t('color.action'), t('color.muted'), 60),
			'log.card': (t) => mix(t('color.accent'), t('color.base'), 10),
		};

		for (let k in standard) {
			this.addToken(k, standard[k]);
		}
	}

	dispose() {
		for (let k in this.tokens) {
			this.removeToken(k);
		}
	}
}

export default Theme;
