/**
 * ValueStep only sets a param value without consuming anything from the stream.
 */
class ValueStep {
	constructor(id, value, opt) {
		opt = opt || {};
		this.id = id;
		this.value = value;
		this.next = opt.next || null;
	}

	parse(stream, state) {
		state.setParam(this.id, this.value);
		if (this.next) {
			state.addStep(this.next);
		}
		return null;
	}
}

export default ValueStep;
