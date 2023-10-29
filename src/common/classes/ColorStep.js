import Err from './Err';

/**
 * ColorStep consumes a hex color code Eg. #c1a657
 */
class ColorStep {

	/**
	 * Creates an instance of ColorStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.token] Token name. Defaults to 'entityid'.
	 * @param {Step} [opt.next] Next step after a matched color code.
	 * @param {Step} [opt.else] Step after if the color code is missing. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 * @param {function} [opt.errInvalid] Callback function that returns an invalid error if the # is not followed by a valid color code.
	 */
	constructor(id, opt) {
		opt = opt || {};
		this.id = id;
		this.name = opt.name || id;
		this.token = opt.token || 'entityid';
		this.next = opt.next || null;
		this.else = opt.else || null;
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('idStep.required', 'There is no {name}. Expected a #-sign followed by 3 or 6 hexadecimal digits.', { name: self.name });
		this.errInvalid = opt.errInvalid || ((self, m) => (
			new Err('idStep.invalid', 'The {name} value "#{value}" is invalid. Expected the #-sign to be followed by 3 or 6 hexadecimal digits.', { name: self.name, value: m })
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
		if (!m || !m[0].match(/^(?:[0-9a-fA-F]{3,3}){1,2}$/)) {
			state.setError(this.errInvalid(this, m));
			return 'error';
		}

		// Add colorcode with lowercase
		state.setParam(this.id, '#' + m[0].toLowerCase());

		// Add followup steps
		if (this.next) {
			state.addStep(this.next);
		}

		return this.token;
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

export default ColorStep;
