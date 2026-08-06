import eventBus from 'modapp-eventbus';
import patchDiff from 'utils/patchDiff';

/**
 * NestedCollection wraps a nested model or collection to produce a new collection based on the nested content.
 */
class NestedCollection {

	/**
	 * Creates a NestedCollection instance.
	 * @param {Model|Collection|null} resource Resource to wrap.
	 * @param {(resource: Model|Collection|null, self: NestedCollection) => Array} mapper Callback function that returns an array for the NestedCollection. Self will be null on intial call to mapper.
	 * @param {object} [opt] Optional parameters.
	 * @param {number} [opt.maxDepth] Max depth to traverse the nested resource to listen to updates. 1 means only top resource will be listened to.
	 * @param {string} [opt.namespace] Event bus namespace. Defaults to 'nestedCollection'.
	 * @param {EventBus} [opt.eventBus] Event bus.
	 */
	constructor(resource, mapper, opt) {
		this._namespace = opt?.namespace || 'nestedCollection';
		this._eventBus = opt?.eventBus || eventBus;
		this._maxDepth = opt?.maxDepth || null;
		this._mapper = mapper;
		this._list = [];
		this._listens = new Map();
		this._resource = null;

		// Bind callbacks
		this._onEvent = this._onEvent.bind(this);

		this.setResource(resource, true);
	}

	/**
	 * Collection length
	 * @returns Length of collection.
	 */
	get length() {
		return this._list.length;
	}

	/**
	 * Returns an array of the collection items.
	 * @returns An array of items.
	 */
	toArray() {
		return this._list.slice();
	}

	/**
	 * Returns the item at a given index, or undefined if the index is out of
	 * bounds.
	 * @param {number} index Zero-based index.
	 * @returns Item located at the given index.
	 */
	atIndex(index) {
		return this._list[index];
	}

	/**
	 * Attach an event handler function for one or more events.
	 * @param {?string} event One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(event, handler) {
		this._eventBus.on(this, event || null, handler, this._namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this._eventBus.off(this, events || null, handler, this._namespace);
	}

	/**
	 * Gets the wrapped resource.
	 * @returns {Model | Collection | null} Resoruce.
	 */
	getResource() {
		return this._resource;
	}

	/**
	 * Updates the nested collection.
	 */
	refresh() {
		this._listenAndSet();
	}

	/**
	 * Sets the resource.
	 * @param {Model | Collection | null} resource Resource.
	 * @param {boolean} noEvents Flag telling if no change events should be triggered during set.
	 * @returns {this}
	 */
	setResource(resource, noEvents = false) {
		resource = resource || null;
		if (resource === this._resource) return this;

		this._resource = resource;
		this._listenAndSet(noEvents);
		return this;
	}

	_listenAndSet(noEvents = false) {
		this._listen();
		let l = this._mapper(this._resource, this);
		this._update(l, noEvents);
	}

	_listen() {
		let map = new Map();
		if (this._maxDepth === null || this._maxDepth > 0) {
			this._traverse(this._resource, this._listens, map, 1);
		}
		this._listens.forEach((_v, k) => {
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
	 * Updates the list.
	 * @param {Array<any> | null} list List to update
	 * @param {boolean} noEvents Flag if no events should be emitted on the eventBus.
	 */
	 _update(list, noEvents = false) {
		list = list?.slice() || [];
		let oldList = this._list;
		this._list = list;

		let onAdd = noEvents
			? () => {}
			: (item, _n, idx) => this._eventBus.emit(this, this._namespace + '.add', { item, idx });

		let onRemove = noEvents
			? () => {}
			: (item, _m, idx) => this._eventBus.emit(this, this._namespace + '.remove', { item, idx });

		patchDiff(oldList, list, onAdd, onRemove);
	}

	toJSON() {
		return this._list.map((m) => m?.toJSON ? m.toJSON() : m);
	}

	/**
	 * Disposes by stopping to listen to and clearing the underlaying resource.
	 */
	dispose() {
		this._resource = null;
		this._listen();
	}

	[Symbol.iterator]() {
		let i = 0;
		let arr = this._list;
		const done = { value: undefined, done: true };
		let e = arr.length;

		return {
			next: function () {
				return i < e
					? { value: arr[i++], done: false }
					: done;
			},
		};
	}

}

export default NestedCollection;
