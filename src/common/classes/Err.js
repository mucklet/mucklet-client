import l10n from 'modapp-l10n';

/**
 * Err represents a local error.
 */
class Err {

	constructor(code, message, data) {
		this._code = code || 'unknown';
		this._message = message || `Unknown error`;
		this._data = data;
	}

	/**
	 * Error code
	 * @type {string}
	 */
	get code() {
		return this._code;
	}

	/**
	 * Error message
	 * @type {string}
	 */
	get message() {
		return this._message;
	}

	/**
	 * Error data object
	 * @type {*}
	 */
	get data() {
		return this._data;
	}

	/**
	 * Returns the error as a LocaleString.
	 * @returns {LocaleString}
	 */
	localeString() {
		return l10n.l(this._code, this._message, this._data);
	}
}

export default Err;
