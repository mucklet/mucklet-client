import isNormalizedPrefix from 'utils/isNormalizedPrefix';
import expandSelection from 'utils/expandSelection';

/**
 * TokenList is a generic list of tokens from an external source, such as a collection.
 */
class TokenList {

	/**
	 * Creates an instance of ItemList.
	 * @param {function} getTokens Callback function that returns an iterable list of token items.
	 * @param {object} [opt] Optional params.
	 * @param {RegExp} [opt.regex] Regex used for matching. Must contain a single capturing parentheses. Defaults to /^\s*(\w+)/
	 * @param {object} [opt.expandRegex] Left and right regexes uses for expanding a selection on complete. Null matches any character. Defaults to { left: null, right: /\w/ }
	 * @param {function} [opt.isMatch] Callback function that returns an item object if the key matches the token, otherwise false: function(tokenItem, key) -> { value }
	 * @param {function} [opt.isPrefix] Callback function that returns a key string if the key is a prefix of the token, otherwise null: function(tokenItem, prefix) -> ?string
	 */
	constructor(getTokens, opt) {
		opt = opt || {};
		this.regex = opt.regex || /^([\w]+)/;
		this.expandRegex = opt.expandRegex || { left: null, right: /\w/ };
		this.getTokens = getTokens;
		this.isMatch = opt.isMatch || ((t, k) => t.key === k ? t : false);
		this.isPrefix = opt.isPrefix || ((t, prefix) => isNormalizedPrefix(prefix, t.id));
	}

	consume(stream) {
		// Match using regex
		let m = stream.match(this.regex);
		return (m && m[1]) || null;
	}


	/**
	 * Gets a list item by key.
	 * @param {string} key Item key.
	 * @param {object} ctx Cmd context object.
	 * @returns {{key: string, value: any, error: null | Err } | null} The formatted key and any value, or error. Null if the key was not found.
	 */
	getItem(key, ctx) {
		key = key.toLowerCase().replace(/\s+/g, ' ');
		let tokens = this.getTokens(ctx);
		if (!tokens) {
			return null;
		}

		for (let t of tokens) {
			let item = this.isMatch(t, key);
			if (item) {
				return item;
			}
		}
		return null;
	}

	complete(str, pos, ctx, inline) {
		let { from, to } = expandSelection(str, this.expandRegex.left, this.expandRegex.right, 0, pos);

		var key = (str && str.slice(from, to).toLowerCase().replace(/\s+/g, ' ')) || '';
		let tokens = this.getTokens(ctx, key);

		let list = [];
		let found = {};
		for (let t of tokens) {
			let m = this.isPrefix(t, key);
			if (m && !found[m]) {
				list.push(m);
				found[m] = true;
			}
		}

		return list.length ? { list, from, to } : null;
	}
}


export default TokenList;
