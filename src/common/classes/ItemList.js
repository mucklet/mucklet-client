import isNormalizedPrefix from 'utils/isNormalizedPrefix';
import expandSelection from 'utils/expandSelection';

function keyCompare(a, b) {
	return a.key.localeCompare(b.key);
}

/**
 * ItemList is a list of items that may contain substeps.
 */
class ItemList {

	/**
	 * Creates an instance of ItemList.
	 * @param {object} [opt] Optional params.
	 * @param {Array.<object>} [opt.items] Array of initial items. See addItem method for the definition.
	 * @param {object} [opt.expandRegex] Left and right regexes uses for expanding a selection on complete. Null matches any character. Defaults to { left: null, right: /\w/ }
	 * @param {RegExp} [opt.regex] Regex used for matching. Must contain a single capturing parentheses. Defaults to /^\s*([\w\d]+)
	 * @param {function} [opt.compare] Compare function for sorting item. Defaults to (a, b) => a.key.localeCompare(b.key)
	 */
	constructor(opt) {
		opt = opt || {};
		this.regex = opt.regex || /^[\p{L}\p{N}]+/u;
		this.expandRegex = opt.expandRegex || { left: null, right: /[\p{L}\p{N}]/u };
		this.compare = opt.compare || keyCompare;

		this._keys = {};
		this._symbols = null;
		this._items = [];
		if (Array.isArray(opt.items)) {
			for (let item of opt.items) {
				this.addItem(item);
			}
		}
	}

	get length() {
		return this._items.length;
	}

	/**
	 * Adds an item to the list.
	 * @param {object|string} item Item object to add, or item key as a string.
	 * @param {string} item.key Item key. Eg. 'say'.
	 * @param {string} [item.value] Item value. For commands, it is usually a callback function.
	 * @param {Step|Array.<CmdStep>} item.next Next step or steps to follow after the item.
	 * @param {Array.<string>} [item.alias] A list of alias for the item. Eg. [ 's', '/say' ]
	 * @param {string} [item.symbol] A single ascii symbol character for the item that may not otherwise match the regex. Eg. ':'
	 * @returns {this}
	 */
	addItem(item) {
		item = Object.assign({ value: item.key, next: null }, item);
		let lc_key = item.key.toLowerCase();
		if (this._keys[lc_key]) {
			throw new Error("Duplicate item key: " + item.key);
		}
		this._keys[lc_key] = item;
		this._items.push(item);
		this._items.sort(this.compare);
		if (item.alias) {
			for (let alias of item.alias) {
				if (this._keys[alias.toLowerCase()]) {
					throw new Error("Duplicate alias key: " + alias);
				}
				this._keys[alias] = item;
			}
		}
		if (item.symbol) {
			if (!this._symbols) {
				this._symbols = {};
			} else if (this._symbols[item.symbol]) {
				throw new Error("Duplicate symbol: " + item.symbol);
			}
			this._symbols[item.symbol] = item;
		}

		return this;
	}

	/**
	 * Get array of item objects.
	 * @returns {Array.<object>} Item objects.
	 */
	getItems() {
		return this._items;
	}

	/**
	 * Gets the item with the specific key (or alias or token character).
	 * @param {string} key Item key.
	 * @param {object} ctx Cmd context object.
	 * @returns {{key: string, value: any, error: null | Err } | null} The formatted key and any value, or error. Null if the key was not found.
	 */
	getItem(key, ctx) {
		let item = null;
		let symbol = false;
		if (key.length == 1 && this._symbols) {
			item = this._symbols[key];
		}
		if (item) {
			symbol = true;
		} else {
			item = this._keys[key.toLowerCase()];
		}
		return item ? { key: item.key, value: item.value, next: item.next, symbol } : null;
	}

	consume(stream) {
		// Do we have token characters? Check if next character is one.
		if (this._symbols) {
			let c = stream.peek();
			if (c !== null) {
				if (this._symbols[c]) {
					 // Token found. Consume the character
					stream.next();
					return c;
				}
			}
		}

		// Match using regex
		let m = stream.match(this.regex);
		return (m && m[0]) || null;
	}

	complete(str, pos, ctx, inline) {
		let { from, to } = expandSelection(str, this.expandRegex.left, this.expandRegex.right, 0, pos);

		var prefix = (str && str.slice(from, to).toLowerCase().replace(/\s+/g, ' ')) || '';

		var items = [];
		var aliases = [];
		for (let item of this._items) {
			// Is the item a match?
			if (isNormalizedPrefix(prefix, item.key.toLowerCase())) {
				items.push(item.key);
			// Check for matches against alias
			} else if (item.alias) {
				for (let a of item.alias) {
					if (isNormalizedPrefix(prefix, a.toLowerCase())) {
						aliases.push(a);
						break;
					}
				}
			}
		}

		return { list: items.concat(aliases), from, to };
	}
}

export default ItemList;
