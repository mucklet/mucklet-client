import Err from './Err';
/**
 * RegexStep consumes a string represented by a regex.
 */
class RegexStep {

	/**
	 * Creates an instance of RegexStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {RegExp} regex Regular expression to match against.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.token] Token name. Defaults to 'entityid'.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to false.
	 * @param {(value: string, self: RegexStep) => Err | null} [opt.validate] Validation callback function that returns an error if the value is invalid.
	 * @param {Array.<string>|(ctx: object) => string[]} [opt.list] Array or callback function returning array of available strings to use for tab completion.
	 * @param {Step} [opt.next] Next step after a matched string.
	 * @param {Step} [opt.else] Step after if the string is missing. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 * @param {function} [opt.errInvalid] Callback function that returns an invalid error if the validate callback fails.
	 * @param {?function} [opt.prepareValue] Callback function that prepares the value before setting it in params.
	 */
	constructor(id, regex, opt) {
		opt = opt || {};
		this.id = id;
		this.regex = regex;
		this.name = opt.name || id;
		this.token = opt.token || 'entityid';
		this.trimSpace = opt.hasOwnProperty('trimSpace') ? !!opt.trimSpace : false;
		this.next = opt.next || null;
		this.else = opt.else || null;
		this.list = opt.list || null;
		this.validate = opt.validate || null;
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('idStep.required', 'Missing {name}.', { name: self.name });
		this.prepareValue = opt.prepareValue || (v => v);
	}

	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		if (this.trimSpace) {
			stream.eatSpace();
		}

		// Match until next word break
		let m = stream.match(this.regex);
		// Validate the match
		if (!m) {
			state.backUp(stream);
			return this._setRequired(state);
		}

		let err = this.validate?.(self, m[0]);
		if (err) {
			state.setError(err);
			return 'error';
		}

		// Add ID with lowercase
		state.setParam(this.id, this.prepareValue(m[0]));

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

export default RegexStep;
