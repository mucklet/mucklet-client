import Err from './Err';
import expandSelection from 'utils/expandSelection';

const expandRegex = /[a-vA-V0-9]/;
/**
 * IDStep consumes a string representing an ID. Eg. #abcdefghij0123456789
 */
class IDStep {

	/**
	 * Creates an instance of IDStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.token] Token name. Defaults to 'entityid'.
	 * @param {Array.<string>|function} [opt.list] Array or callback function returning array of available ID strings to use for tab completion.
	 * @param {Step} [opt.next] Next step after a matched ID.
	 * @param {Step} [opt.else] Step after if the ID is missing. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 * @param {function} [opt.errInvalid] Callback function that returns an invalid error if the #
	 */
	constructor(id, opt) {
		opt = opt || {};
		this.id = id;
		this.name = opt.name || id;
		this.token = opt.token || 'entityid';
		this.next = opt.next || null;
		this.else = opt.else || null;
		this.list = opt.list || null;
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('idStep.required', 'There is no {name}. Expected a #-sign followed by 20 characters.', { name: self.name });
		this.errInvalid = opt.errInvalid || ((self, m) => (
			new Err('idStep.invalid', 'The {name} value "#{value}" is invalid. Expected the #-sign to be followed by 20 characters a-v or 0-9.', { name: self.name, value: m })
		));
	}

	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		stream.eatSpace();

		let c = stream.next();
		if (c !== '#') {
			state.backUp(stream);
			return this._setRequired(state);
		}

		// Match until next word break
		let m = stream.match(/^\w*\b/);
		// Validate the match
		if (!m || !m[0].match(/^[a-vA-V0-9]{20,20}$/)) {
			state.setError(this.errInvalid(this, m));
			return 'error';
		}

		// Add ID with lowercase
		state.setParam(this.id, m[0].toLowerCase());

		// Add followup steps
		if (this.next) {
			state.addStep(this.next);
		}

		return this.token;
	}

	/**
	 * Complete returns a completion list for the tab completion.
	 * @param {string} str The matched text string
	 * @param {number} pos The cursor position within the string
	 * @returns {?object} Completion list in the format: { list, from, to }
	 */
	complete(str, pos) {
		if (!this.list) return null;

		let start = str.indexOf('#');
		if (start < 0 || pos <= start) return null;

		// complete(str, pos, ctx, inline)
		let { from, to } = expandSelection(str, expandRegex, expandRegex, pos, pos);
		var key = (str && str.slice(from, to).toLowerCase()) || '';

		let ids = typeof this.list == 'function' ? this.list() : this.list;
		let list = ids;
		let found = {};
		if (key) {
			list = [];
			for (let id of ids) {
				if (id.substring(0, key.length) == key && !found[id]) {
					list.push(id);
					found[id] = true;
				}
			}
		}

		return list.length
			? { list, from, to }
			: null;
	}

	_setRequired(state) {
		if (this.else) {
			state.addStep(this.else);
		} else if (this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
	}
}

export default IDStep;
