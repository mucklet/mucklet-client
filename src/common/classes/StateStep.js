/**
 * StateStep only calls a callbackback with the state without consuming anything
 * from the stream.
 */
class StateStep {
	constructor(callback, opt) {
		opt = opt || {};
		this.callback = callback;
		this.next = opt.next || null;
	}

	parse(stream, state) {
		this.callback(state);
		if (this.next) {
			state.addStep(this.next);
		}
		return null;
	}
}

export default StateStep;
