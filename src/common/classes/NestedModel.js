
function objHasProp(o, p) {
	return typeof o == 'object' && o !== null && o.hasOwnProperty(p);
}

function isModel(m) {
	return typeof m == 'object' && m !== null && typeof m.on === 'function' && typeof m.off === 'function';
}

/**
 * NestedModel exposes a model nested inside other models.
 */
class NestedModel {

	constructor(rootModel, path) {
		this._root = rootModel;
		this._path = path.split('.');
		this._value = undefined;
		this._isModel = false;
		this._pathcbs = null;
		this._cbs = [];
		this._count = 0;
	}

	/**
	 * Model or value at the end of the path, or undefined if the path does not exist.
	 */
	get model() {
		// If we have listeners, we already have the value stored.
		if (this._count) return this._value;

		let m = this._root;
		for (let i = 0; i < this._path.length; i++) {
			let p = this._path[i];
			if (!objHasProp(m, p)) {
				return undefined;
			}
			m = m[p];
		}
		return m;
	}

	on(event, cb) {
		this._listenPath();
		this._cbs.push({ event, cb });
		if (this._isModel) {
			this._value.on(event, cb);
		}
		return this;
	}

	off(event, cb) {
		if (!this._removeCb(event, cb)) {
			throw new Error("Callback not registered with on");
		}
		if (this._isModel) {
			this._value.off(event, cb);
		}
		this._unlistenPath();
	}

	_removeCb(event, cb) {
		for (let i = this._cbs.length - 1; i >= 0; i--) {
			let c = this._cbs[i];
			if (c.event === event && c.cb === cb) {
				this._cbs.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	_listenPath() {
		this._count++;
		if (this._count > 1) {
			return;
		}

		this._pathcbs = new Array(this._path.length);
		this._setValue(this._traverseListen(this._root, 0));
	}

	_unlistenPath() {
		this._count--;
		if (this._count) {
			return;
		}

		for (let cb of this._pathcbs) {
			if (cb) {
				cb[0].off('change', cb[1]);
			}
		}

		this._setValue(undefined);
	}

	_traverseListen(m, i) {
		if (i === this._path.length) {
			return m;
		}

		if (isModel(m)) {
			let cb = this._onChange.bind(this, i);
			m.on('change', cb);
			this._pathcbs[i] = [ m, cb ];
		} else {
			this._pathcbs[i] = null;
		}

		return this._traverseNextProp(m, i);
	}

	_traverseNextProp(m, i) {
		let p = this._path[i];
		if (!objHasProp(m, p)) {
			return undefined;
		}
		return this._traverseListen(m[p], i + 1);
	}

	_clearProps() {
		for (let k in this) {
			if (this.hasOwnProperty(k) && k.substr(0, 1) !== '_') {
				delete this[k];
			}
		}
	}

	_setValue(v) {
		if (v === this._value) return;

		// Remove listeners for old value
		if (this._isModel) {
			for (let c of this._cbs) {
				this._value.off(c.event, c.cb);
			}
		}
		// Set value
		this._value = v;
		this._isModel = isModel(v);
		// Add listeners for new value
		if (this._isModel) {
			for (let c of this._cbs) {
				v.on(c.event, c.cb);
			}
		}
	}

	_onChange(idx, changed) {
		if (!this._count) return;

		// Make sure our path property has changed
		if (!changed.hasOwnProperty(this._path[idx])) return;

		// Unlisten all path items
		for (var i = this._path.length - 1; i > idx; i--) {
			let c = this._pathcbs[i];
			this._pathcbs[i] = null;
			if (c) {
				c[0].off('change', c[1]);
			}
		}
		this._setValue(this._traverseNextProp(this._pathcbs[idx][0], idx));
	}
}

export default NestedModel;
