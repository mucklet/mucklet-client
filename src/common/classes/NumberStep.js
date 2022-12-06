/**
 * NumberStep consumes a number.
 */
class NumberStep {

	/**
	 * Creates an instance of NumberStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.token] Token name. Defaults to 'number'.
	 * @param {Step} [opt.next] Next step after a matched string.
	 * @param {RegExp} [opt.regex] Regex used for matching. Defaults to /^-?\d*\.?\d* / (without the extra space at the end)
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 * @param {bool} [opt.errFloat] Callback function that returns an error on float values. Null means floats are allowed.: function(this)
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 */
	constructor(id, opt) {
		opt = opt || {};
		this.id = id;
		this.name = opt.name || id;
		this.token = opt.token || 'number';
		this.next = opt.next || null;
		this.regex = opt.regex || /^-?\d*\.?\d*/;
		this.trimSpace = opt.hasOwnProperty('trimSpace') ? !!opt.trimSpace : true;
		this.errFloat = opt.hasOwnProperty('errFloat')
			? opt.errFloat
			: self => ({ code: 'numberStep.isFloat', message: 'Decimals are not allowed for {name}.', data: { name: self.name }});
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => ({ code: 'numberStep.required', message: 'There is no {name}.', data: { name: self.name }});
	}

	blank(state) {
		state.setParam(this.id, (state.getParam(this.id) || "") + "\n");
	}

	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		if (this.trimSpace && stream.eatSpace()) {
			state.addStep(this);
			return null;
		}

		let m = stream.match(this.regex);

		if (!m || !m[0].length || m[0] == ".") {
			state.backUp(stream);
			return this._setRequired(state);
		}

		if (this.errFloat && m[0].match(/\..*[1-9]/)) {
			state.backUp(stream);
			state.setError(this.errFloat(this));
			return false;
		}

		let hasMatched = state.getState(this.id);
		if (!hasMatched && this.next) {
			state.addStep(this.next);
		}

		state.setParam(this.id, Number(m[0]));

		return this.token;
	}

	_setRequired(state) {
		if (!state.getState(this.id) && this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
	}
}

export default NumberStep;
