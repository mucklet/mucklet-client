import DelimStep from 'classes/DelimStep';

/**
 * MultiDelimStep consumes delimiters and adds steps based on it.
 */
class MultiDelimStep {

	/**
	 * Creates an instance of MultiDelimStep.
	 * @param {object} delims Delimiters. Value is the option object for DelimStep.
	 * @param {object} [opt] Optional params.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 */
	constructor(delims, opt) {
		this.opt = opt || {};
		this.delims = Object.assign({}, delims);
		this.trimSpace = this.opt.hasOwnProperty('trimSpace') ? !!this.opt.trimSpace : true;
	}

	parse(stream, state) {
		if (!stream) {
			return false;
		}

		if (this.trimSpace) {
			stream.eatSpace();
		}

		for (let delim in this.delims) {
			let isMatch = stream.match(delim, true, true);
			if (isMatch) {
				state.backUp(stream);

				let delims = Object.assign({}, this.delims);
				delete delims[delim];
				// Add a new MultiDelimStep, but without the matched delim.
				if (Object.keys(delims).length) {
					state.addStep(new MultiDelimStep(delims, this.opt));
				}
				state.addStep(new DelimStep(delim, this.delims[delim]));
				return false;
			}
		}

		state.backUp(stream);
		return false;
	}
}

export default MultiDelimStep;
