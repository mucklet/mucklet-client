import DelimStep from 'classes/DelimStep';

/**
 * MultiDelimStep consumes delimiters and adds steps based on it.
 */
class MultiDelimStep {

	/**
	 * Creates an instance of MultiDelimStep.
	 * @param {object | Array<{delim: regexp|string, step: Step}>} delims Delimiters. Value is the option object for DelimStep.
	 * @param {object} [opt] Optional params.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 */
	constructor(delims, opt) {
		this.opt = opt || {};
		if (!Array.isArray(delims)) {
			delims = delims || {};
			delims = Object.keys(delims).map(k => ({ delim: k, step: delims[k] }));
		}
		this.delims = delims;
		this.trimSpace = this.opt.hasOwnProperty('trimSpace') ? !!this.opt.trimSpace : true;
	}

	parse(stream, state) {
		if (!stream) {
			return false;
		}

		if (this.trimSpace) {
			stream.eatSpace();
		}

		for (let i = 0; i < this.delims.length; i++) {
			let d = this.delims[i];
			let isMatch = stream.match(d.delim, true, true);
			if (isMatch) {
				state.backUp(stream);

				let delims = this.delims.toSpliced(i, 0);
				// Add a new MultiDelimStep, but without the matched delim.
				if (delims.length) {
					state.addStep(new MultiDelimStep(delims, this.opt));
				}
				state.addStep(new DelimStep(d.delim, Object.assign({ token: this.opt.token }, d.step)));
				return false;
			}
		}

		state.backUp(stream);
		return false;
	}
}

export default MultiDelimStep;
