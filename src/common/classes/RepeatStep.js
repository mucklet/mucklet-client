import DelimStep from 'classes/DelimStep';

/**
 * RepeatStep repeats a step until it no longer matches any token, or optionally
 * until a delimiter doesn't match.
 */
class RepeatStep {

	/**
	 * Creates an instance of RepeatStep.
	 * @param {string} id Step id.
	 * @param {function} stepFactory Factory function returning step to repeat, which should add the provided nextStep on match: function(nextStep, idx) -> Step
	 * @param {object} [opt] Optional params.
	 * @param {function} [opt.each] Callback function called each time the step has matched: function(state, step, idx)
	 * @param {string} [opt.delimiter] Delimiter string. Defaults to null which means no delimiter.
	 */
	constructor(id, stepFactory, opt) {
		opt = opt || {};
		this.id = id;
		this.stepFactory = stepFactory;
		this.each = opt.each || null;
		this.delim = opt.delimiter || null;
	}

	parse(stream, state) {
		let st = state.getState(this.id);
		// No state? Then we bootstrap it.
		if (!st) {
			state.addStep(this._setStep(state, 0));
			return false;
		}

		if (this.each) {
			this.each(state, st.step, st.idx);
		}

		let step = this._setStep(state, st.idx + 1);
		state.addStep(this.delim
			? new DelimStep(this.delim, { errRequired: null, next: step })
			: step,
		);
		return false;
	}

	_setStep(state, idx) {
		let step = this.stepFactory(this, idx, state);
		state.setState(this.id, { idx, step });
		return step;
	}
}

export default RepeatStep;
