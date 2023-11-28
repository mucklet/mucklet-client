function domRectToObject(r) {
	return { x: r.x, y: r.y, height: r.height, width: r.width };
}

function equalRect(a, b) {
	return a.x == b.x && a.y == b.y && a.width == b.width && a.height == b.height;
}

/** @typedef {x: number, y: number, width: number, height: number } Rect */

/**
 * ResizeObserverComponent wraps a component and observes its element for any changes in size.
 */
class ResizeObserverComponent {

	/**
	 * Creates a new ResizeObserverComponent instance.
	 * @param {Component} component Component to observe
	 * @param {(rect: Rect, oldRect: Rect) => void} callback Callback function called on resize and render. On initial render, oldRect is always null.
	 */
	constructor(component, callback) {
		this.component = component;
		this.callback = callback;
		this.rel = null;
		this.rect = null;

		// Bind callbacks
		this._onResize = this._onResize.bind(this);
	}

	render(el) {
		this.rel = this.component?.render(el) || this.component?.getElement?.() || null;
		if (this.rel) {
			this.rect = domRectToObject(this.rel.getBoundingClientRect());
			this.callback(this.rect, null);
		}

		this._observe();
	}

	unrender() {
		this._stopObserve();
		this.component?.unrender();
		this.rel = null;
		this.rect = null;
	}

	getRect() {
		return this.rect;
	}

	getComponent() {
		return this.component;
	}

	_onResize() {
		if (!this.rel) return;

		let rect = domRectToObject(this.rel.getBoundingClientRect());
		if (equalRect(rect, this.rect)) {
			return;
		}

		let oldRect = this.rect;
		this.rect = rect;
		this.callback(rect, oldRect);
	}

	_observe(el) {
		if (!this.rel) return;

		window.addEventListener('resize', this._onResize);
		this._observer = new ResizeObserver(this._onResize);
		this._observer.observe(this.rel);
	}

	_stopObserve() {
		if (!this._observer) return;

		this._observer.disconnect();
		this._observer = null;
		window.removeEventListener('resize', this._onResize);
	}
}

export default ResizeObserverComponent;
