import expandSelection from 'utils/expandSelection';

export function isNormalizedPrefix(prefix, token, rawToken) {
	if (prefix && token.substring(0, prefix.length) !== prefix) {
		if (
			typeof token.normalize != 'function' ||
			token.normalize('NFKD')
				.replace(/\p{M}/gu, '')
				.normalize('NFKC')
				.substring(0, prefix.length) !== prefix
		) {
			return null;
		}
	}
	return rawToken || token;
}

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
