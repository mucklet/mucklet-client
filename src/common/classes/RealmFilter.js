import { escapeRegex } from 'utils/regex';

/**
 * RealmFilter parses a filter string and matches it against realms.
 */
class RealmFilter {

	/**
	 * Creates an instance of RealmFilter.
	 * @param {string} filter Filter string.
	 * @param {object} [opt] Optional filters.
	 * @param {bool} [opt.hideNsfw] Flag to filter out those set as nsfw.
	 */
	constructor(filter, opt) {
		this.opt = { hideNsfw: false };
		this.setFilter(filter, opt);
	}

	/**
	 * Sets the filter string.
	 * @param {string} filter Filter string.
	 * @param {object} [opt] Optional filters.
	 * @param {bool} [opt.hideNsfw] Flag to filter out those set as nsfw.
	 * @returns {this}
	 */
	setFilter(filter, opt) {
		filter = filter ? String(filter).toLowerCase().trim() : '';
		opt = Object.assign({}, this.opt, opt);

		if (filter == this.filter && this.opt.hideNsfw == opt.hideNsfw) {
			return false;
		}

		this.opt.hideNsfw = !!opt.hideNsfw;
		if (filter != this.filter) {
			this.filter = filter;

			let steps = [];
			let stepStrs = filter.split(',');
			for (let stepStr of stepStrs) {
				let keys = [];
				let keyStrs = stepStr.split(/[|]/);

				for (let key of keyStrs) {
					key = key.trim();

					let match = true;
					if (key[0] == '!') {
						match = false;
						key = key.slice(1).trim();
					}

					if (key) {
						keys.push({ key, match, regex: new RegExp('\\b' + escapeRegex(key) + '\\b', 'i') });
					}
				}

				if (keys.length) {
					steps.push({ keys });
				}
			}

			this.steps = steps.length ? steps : null;
		}
		return true;
	}

	/**
	 * Matches the filter against a realm.
	 * @param {object} realm Realm model.
	 * @returns {boolean} True on match, otherwise false.
	 */
	match(realm) {
		// Quick check if hideNsfw is set.
		if (this.opt.hideNsfw && realm.nsfw) {
			return false;
		}

		// Quick exit if no filter is set
		if (!this.steps) return true;

		for (let step of this.steps) {
			if (!this._matchKeys(realm, step.keys)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if the filter is empty and matches any realm.
	 * @returns {boolean} True if empty, otherwise false.
	 */
	isEmpty() {
		return !this.steps;
	}

	/**
	 * Checks if the filter contains a specific tag.
	 * @param {string} key Tag key.
	 * @returns {boolean} True if the filter contains the tag, otherwise false.
	 */
	containsTag(key) {
		// Quick exit
		if (!this.steps) return false;

		for (let step of this.steps) {
			for (let k of step.keys) {
				if (k.key == key) return true;
			}
		}

		return false;
	}

	_matchKeys(realm, keys) {
		// Match a single key
		for (let k of keys) {
			if (k.match === this._matchKey(realm, k)) {
				return true;
			}
		}
		return false;
	}

	_matchKey(realm, k) {
		let key = k.key;
		if (
			(realm.name && realm.name.match(k.regex))
		) {
			return true;
		}

		if (realm.tags) {
			let props = realm.tags.props || realm.tags;
			for (let id in props) {
				if (props[id].key == key) {
					return true;
				}
			}
		}
		return false;
	}
}


export default RealmFilter;
