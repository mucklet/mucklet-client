import Err from './Err';

/**
 * DelimStep consumes a delimiter string.
 */
class DelimStep {

	/**
	 * Creates an instance of DelimStep.
	 * @param {string} delim Delimiter
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.token] Token name. Defaults to 'delim'.
	 * @param {Step} [opt.next] Next step after a matched delimiter.
	 * @param {Step} [opt.else] Step after if the delimiter is missing. Will disabled any errRequired set.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 */
	constructor(delim, opt) {
		opt = opt || {};
		this.delim = delim;
		this.token = opt.token || 'delim';
		this.next = opt.next || null;
		this.else = opt.else || null;
		this.trimSpace = opt.hasOwnProperty('trimSpace') ? !!opt.trimSpace : true;
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('delimStep.required', 'Expected to find "{delim}"', { delim: self.delimiter });
	}

	get delimiter() {
		return this.delim;
	}

	/**
	 * Sets the next step.
	 * @param {Step | null} step Step.
	 * @returns {this}
	 */
	setNext(step) {
		this.next = step || null;
	}

	/**
	 * Sets the else step.
	 * @param {Step | null} step Step.
	 * @returns {this}
	 */
	setElse(step) {
		this.else = step || null;
	}

	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		if (this.trimSpace && stream.eatSpace()) {
			state.addStep(this);
			return null;
		}

		let isMatch = stream.match(this.delim, true, true);

		if (!isMatch) {
			state.backUp(stream);
			return this._setRequired(state);
		}

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

export default DelimStep;
