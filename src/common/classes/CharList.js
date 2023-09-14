import Err from './Err';
import isNormalizedPrefix from 'utils/isNormalizedPrefix';
import expandSelection from 'utils/expandSelection';

/**
 * CharList is a cmd list of characters.
 */
class CharList {

	/**
	 * Creates an instance of CharList.
	 * @param {function} getChars Callback function that returns an iterable list of chars.
	 * @param {object} [opt] Optional params.
	 * @param {boolean} [opt.useFullname] Flag indicating if full name should be used. Defaults to false.
	 * @param {function} [opt.getCompletionChars] Callback that returns an iterable list for chars to complete from. Defaults to getChars callback.
	 * @param {function} [opt.validation] Char validation callback. function(key, char) -> ?{ code, message }
	 * @param {function} [opt.errNotFound] Callback function that returns an error when items is not found. Null means mismatch is not an error: function(this, match)
	 */
	constructor(getChars, opt) {
		opt = opt || {};
		this.regex = /^([\s\p{L}\p{N}'-]*[\p{L}\p{N}'-])\s*/u;
		this.getChars = getChars;
		this.useFullname = !!opt.useFullname;
		this.getCompletionChars = opt.getCompletionChars || getChars;
		this.validation = opt.validation || null;
		this.errNotFoundMsg = opt.errNotFound || null;
	}

	consume(stream) {
		// Match using regex
		let m = stream.match(this.regex);
		return (m && m[1]) || null;
	}

	get errNotFound() {
		return this.errNotFoundMsg;
	}

	getItem(key, ctx) {
		let chars = this.getChars(ctx);
		if (!chars) {
			return null;
		}

		let k = key.trim().toLowerCase().replace(/\s+/g, ' ');

		var matches = [];

		for (let c of chars) {
			var name = c.name.toLowerCase();
			var fullname = name + (c.surname ? " " + c.surname.toLowerCase() : "");
			if (k === fullname) {
				return this._createResult(key, c, true);
			}
			if (k === name) matches.push(c);
		}

		// Found a single match.
		if (matches.length === 1) {
			return this._createResult(key, matches[0], false);
		}

		return matches.length
			? { key, error: new Err('charList.ambiguousName', "There are more than one character named \"{name}\".", { name: key }) }
			: null;
	}

	_createResult(key, char, useFull) {
		if (this.validation) {
			let error = this.validation(key, char);
			if (error) {
				return { key, error };
			}
		}
		return { key: char.name + (useFull && char.surname ? " " + char.surname : ""), value: char.id };
	}

	complete(str, pos, ctx, inline) {
		let chars = this.getCompletionChars(ctx);
		if (!chars) {
			return null;
		}

		let { from, to } = inline
			? expandSelection(str, /[\p{L}\p{N}'-]/u, /[\p{L}\p{N}'-]/u, pos, pos)
			: expandSelection(str, null, /[\p{L}\p{N}'-]/u, 0, pos);

		let prefix = (str && str.slice(from, to).toLowerCase().replace(/\s+/g, ' ')) || '';

		let matches = [];
		let seen = {};
		for (let c of chars) {
			let name = c.name.toLowerCase();
			let fullname = name + (c.surname ? ' ' + c.surname.toLowerCase() : '');
			if (isNormalizedPrefix(prefix, fullname)) {
				let full = c.name + (c.surname ? ' ' + c.surname : '');
				if (this.useFullname) {
					matches.push(full);
				} else {
					if (seen.hasOwnProperty(name)) {
						let s = seen[name];
						if (s !== true && !inline) {
							matches[s.idx] = s.full;
							seen[name] = true;
						}
						matches.push(full);
					} else {
						seen[name] = { idx: matches.length, full: full };
						// Use fullname if we are completing the entire first name
						if (prefix.length < name.length) {
							matches.push(c.name);
							if (inline) {
								matches.push(full);
							}
						} else {
							matches.push(full);
						}
					}
				}
			}
		}

		return { list: matches, from, to };
	}
}


export default CharList;
