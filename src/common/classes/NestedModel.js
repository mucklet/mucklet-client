import eventBus from 'modapp-eventbus';

/**
 * NestedModel wraps a nested model or collection to produce a new model based on the nested content.
 */
class NestedModel {

	/**
	 * Creates a NestedModel instance.
	 * @param {Model|Collection|null} resource Nested model or collection resource.
	 * @param {(resource: Model|Collection|null, self: NestedModel) => object} mapper Callback function that returns an object of properties for the NestedModel. Self will be null on intial call to mapper.
	 * @param {object} [opt] Optional parameters.
	 * @param {number} [opt.maxDepth] Max depth to traverse the nested resource to listen to updates. 1 means only top resource will be listened to.
	 * @param {string} [opt.namespace] Event bus namespace. Defaults to 'resourceMapper'.
	 * @param {module:modapp~EventBus} [opt.eventBus] Event bus.
	 */
	constructor(resource, mapper, opt) {
		this._namespace = opt?.namespace || 'resourceMapper';
		this._eventBus = opt?.eventBus || eventBus;
		this._maxDepth = opt?.maxDepth || null;
		this._mapper = mapper;
		this._props = {};
		this._listens = new Map();

		// Bind callbacks
		this._onEvent = this._onEvent.bind(this);

		this.setResource(resource, true);
	}

	/**
	 * Model properties.
	 * @returns {object} Anonymous object with all model properties.
	 */
	get props() {
		return this._props;
	}

	/**
	 * Attach an event handler function for one or more session events.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this._eventBus.on(this, events, handler, this._namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this._eventBus.off(this, events, handler, this._namespace);
	}

	/**
	 * Gets the wrapped model.
	 * @returns {Model} Model
	 */
	getModel() {
		return this._resource;
	}

	/**
	 * Updates the nested model.
	 */
	refresh() {
		this._listenAndSet();
	}

	/**
	 * Sets the model.
	 * @param {?Model} resource Model.
	 * @param {boolean} noEvents Flag telling if no change events should be triggered during set.
	 * @returns {this}
	 */
	setResource(resource, noEvents) {
		resource = resource || null;
		if (resource === this._resource) return this;

		this._resource = resource;
		this._listenAndSet(noEvents);
		return this;
	}

	_listenAndSet(noEvents) {
		this._listen();
		let o = this._mapper(this._resource, this);
		this._update(o, noEvents);
	}

	_listen() {
		let map = new Map();
		if (this._maxDepth === null || this._maxDepth > 0) {
			this._traverse(this._resource, this._listens, map, 1);
		}
		this._listens.forEach((v, k) => {
			if (!map.get(k)) {
				k.off(null, this._onEvent);
			}
		});
		this._listens = map;
	}

	_traverse(resource, oldMap, map, depth) {
		// Check if already listened to, or is not a resource function.
		if (!resource || map.get(resource) || typeof resource?.on != 'function' || typeof resource?.off != 'function') return;

		map.set(resource, true);

		if (!oldMap.get(resource)) {
			resource.on(null, this._onEvent);
		}

		depth++;
		if (this._maxDepth !== null && depth > this._maxDepth) return;

		if (typeof resource[Symbol.iterator] === 'function') {
			for (let sub of resource) {
				this._traverse(sub, oldMap, map, depth);
			}
		} else {
			let props = resource.props;
			if (props && typeof props == 'object') {
				for (let k in props) {
					this._traverse(props[k], oldMap, map, depth);
				}
			}
		}
	}

	_onEvent() {
		this._listenAndSet();
	}

	/**
	 * Updates the properties.
	 * @param {object} props Properties to update.
	 * @param {boolean} noEvents Flag if no events should be emitted on the eventBus.
	 */
	 _update(props, noEvents) {
		props = Object.assign({}, props);

		let changed = null;
		let v, promote;
		let p = this._props;

		// Add deleted properties
		for (var k in p) {
			if (!props.hasOwnProperty(k)) {
				props[k] = undefined;
			}
		}

		for (let key in props) {
			v = props[key];
			promote = (this.hasOwnProperty(key) || !this[key]) && key[0] !== '_';
			if (p[key] !== v) {
				changed = changed || {};
				changed[key] = p[key];
				if (v === undefined) {
					delete p[key];
					if (promote) delete this[key];
				} else {
					p[key] = v;
					if (promote) this[key] = v;
				}
			}
		}

		if (changed && !noEvents) {
			this._eventBus.emit(this, this._namespace + '.change', changed);
		}
	}

	toJSON() {
		let props = {};
		let p = this._props;
		for (let k in p) {
			let v = p[k];
			if (v && typeof v == 'object' && typeof v.toJSON == 'function') {
				v = v.toJSON();
			}
			props[k] = v;
		}
		return props;
	}


	/**
	 * Disposes by stopping to listen to and clearing the underlaying resource.
	 */
	dispose() {
		this._resource = null;
		this._listen();
	}

}

export default NestedModel;
