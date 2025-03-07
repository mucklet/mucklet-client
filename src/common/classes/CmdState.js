
function getNested(p, keys) {
	for (let k of keys) {
		let o = p[k];
		if (!o || typeof o != 'object') {
			o = {};
			p[k] = o;
		}
		p = o;
	}
	return p;
}

/**
 * Command state object used when parsing commands.
 */
class CmdState {
	constructor(step, stack, ctx, params = {}, state = {}, error = null, onExec = []) {
		this.step = step;
		this.stack = stack;
		this.ctx = ctx;
		this.params = params;
		this.state = state;
		this.error = error;
		this.onExec = onExec;
	}

	addStep() {
		for (let j = arguments.length - 1; j >= 0; j--) {
			let steps = arguments[j];
			if (!steps) continue;
			if (!Array.isArray(steps)) {
				steps = [ steps ];
			}
			for (let i = steps.length - 1; i >= 0; i--) {
				this.stack.push(steps[i]);
			}
		}
		return this;
	}

	setStack(stack) {
		this.stack = stack;
		return this;
	}

	setError(err, force) {
		if (!this.error || force) {
			this.error = err;
		}
		return this;
	}

	/**
	 * Sets a parameter.
	 * @param {string | Array<string|number>} key Parameter key or array of keys for a nested object.
	 * @param {*} value Value to set
	 * @returns {this}
	 */
	setParam(key, value) {
		let p = this.params;
		if (Array.isArray(key)) {
			p = getNested(p, key.slice(0, -1));
			key = key[key.length - 1];
		}
		p[key] = value;
		return this;
	}

	/**
	 * Gets a parameter.
	 * @param {string | Array<string|number>} key Parameter key or array of keys for a nested object.
	 * @returns {*} Value.
	 */
	getParam(key) {
		let p = this.params;
		if (Array.isArray(key)) {
			p = getNested(p, key.slice(0, -1));
			key = key[key.length - 1];
		}
		return p[key];
	}

	setState(key, value) {
		let s = this.state;
		if (Array.isArray(key)) {
			s = getNested(s, key.slice(0, -1));
			key = key[key.length - 1];
		}
		s[key] = value;
		return this;
	}

	getState(key) {
		let s = this.state;
		if (Array.isArray(key)) {
			s = getNested(s, key.slice(0, -1));
			key = key[key.length - 1];
		}
		return s[key];
	}

	backUp(stream) {
		stream.backUp(stream.current().length);
		return this;
	}

	addOnExec(callback) {
		if (callback) {
			this.onExec.push(callback);
		}
	}

	callOnExec() {
		for (let cb of this.onExec) {
			cb(this);
		}
	}

	getCtx() {
		return this.ctx;
	}

	clone() {
		return new CmdState(
			this.step,
			this.stack.slice(0),
			this.ctx,
			Object.assign({}, this.params),
			Object.assign({}, this.state),
			this.error,
			this.onExec.slice(0),
		);
	}

	/**
	 * Returns the final state after calling any remaining steps with a null
	 * stream.
	 * @returns {CmdState} Final state
	 */
	getFinalState() {
		if (!this.stack.length) return this;

		let clone = this.clone();
		let i = 0;
		while (clone.stack.length) {
			if (i++ > 100) {
				throw new Error("Exceeded max recursions");
			}
			clone.stack.pop().parse(null, clone);
		}
		return clone;
	}
}

export default CmdState;
