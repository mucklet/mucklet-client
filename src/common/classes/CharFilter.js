import { escapeRegex } from 'utils/regex';

const idleCodes = {
	'active': 1,
	'idle': 2,
	'away': 3,
	'inactive': 3,
};

/**
 * CharFilter parses a filter string and matches it against characters.
 */
class CharFilter {

	/**
	 * Creates an instance of CharFilter.
	 * @param {string} filter Filter string.
	 */
	constructor(filter) {
		this.setFilter(filter);
	}

	/**
	 * Sets the filter string.
	 * @param {string} filter Filter string.
	 * @returns {this}
	 */
	setFilter(filter) {
		filter = filter ? String(filter).toLowerCase() : '';
		if (filter == this.filter) {
			return false;
		}
		this.filter = filter;

		let steps = [];
		let stepStrs = filter.split(',');
		for (let stepStr of stepStrs) {
			let keys = [];
			let keyStrs = stepStr.split(/[|]/);

			for (let key of keyStrs) {
				key = key.trim();

				let match = true;
				let dislike = false;
				if (key[0] == '!') {
					match = false;
					key = key.slice(1).trim();
				}
				if (key[0] == '~') {
					dislike = true;
					key = key.slice(1).trim();
				}
				// In case of reverse order ~!
				if (key[0] == '!' && match) {
					match = false;
					key = key.slice(1).trim();
				}

				if (key) {
					keys.push({ key, match, dislike, regex: new RegExp('\\b' + escapeRegex(key) + '\\b', 'i') });
				}
			}

			if (keys.length) {
				steps.push({ keys });
			}
		}

		this.steps = steps.length ? steps : null;
		return true;
	}

	/**
	 * Matches the filter against a character.
	 * @param {object} char Char model.
	 * @returns {boolean} True on match, otherwise false.
	 */
	match(char) {
		// Quick exit
		if (!this.steps) return true;

		for (let step of this.steps) {
			if (!this._matchKeys(char, step.keys)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if the filter is empty and matches any character.
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

	_matchKeys(char, keys) {
		// Match a single key
		for (let k of keys) {
			if (k.match === this._matchKey(char, k)) {
				return true;
			}
		}
		return false;
	}

	_matchKey(char, k) {
		let key = k.key;
		// Dislike modifiers only matches tags
		if (!k.dislike) {
			if (
				(char.species && char.species.match(k.regex)) ||
				(char.gender && char.gender.match(k.regex)) ||
				((char.name + ' ' + char.surname).match(k.regex)) ||
				(idleCodes[k.key] == char.idle)
			) {
				return true;
			}
		}

		if (!char.tags) return false;

		let props = char.tags.props || char.tags;
		for (let pk in props) {
			if ((pk.slice(pk.length - 8) == '_dislike') != k.dislike) {
				continue;
			}
			if (props[pk].key == key) {
				return true;
			}
		}
		return false;
	}
}


export default CharFilter;
