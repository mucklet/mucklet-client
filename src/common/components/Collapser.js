import { RootElem } from 'modapp-base-component';
import { anim } from 'modapp-utils';

/**
 * Collapser is component wrapper that can collapse the height of a component
 */
class Collapser extends RootElem {

	/**
	 * Creates an instance of Collapser
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.duration] Optional transition duration in milliseconds.
	 * @param {boolean} [opt.horizontal] Optional flag if the collapsing should be horizontally. Defaults to false.
	 */
	constructor(component, opt) {
		super('div', opt);

		opt = opt || {};
		this._slideOpt = {
			callback: this._onTransitionEnd.bind(this),
			duration: opt.duration
		};
		this._current = null;
		this._component = null;
		this._token = null;
		this._horizontal = !!opt.horizontal;

		this.setComponent(component);
	}

	/**
	 * Gets the current set component.
	 * @returns {?Component}
	 */
	getComponent() {
		return this._component;
	}

	/**
	 * Sets the component to show, or null to remove any component.
	 * @param {?Component} component Component to set.
	 * @returns {this}
	 */
	setComponent(component) {
		component = component || null;
		if (this._component === component) return this;

		this._component = component;
		let el = this.getElement();
		if (!el) {
			return this;
		}

		// Is the component the same at currently rendered one?
		if (this._component === this._current) {
			if (this._current) {
				this._show();
			}
			return this;
		}

		if (this._current) {
			this._hide();
		} else {
			this._renderComponent();
			this._show();
		}
		return this;
	}

	render(el) {
		super.render(el);
		this._renderComponent();
		if (!this._component) {
			let el = this.getElement();
			el.style.height = '0px';
			el.style.display = 'none';
		}
		return this.getElement();
	}

	unrender() {
		anim.stop(this._token);
		if (!this.getElement()) return;
		this._unrenderComponent();
		super.unrender();
	}

	_hide() {
		let el = this.getElement();
		if (el) {
			anim.stop(this._token);
			this._token = this._horizontal
				? anim.slideHorizontal(el, false, this._slideOpt)
				: anim.slideVertical(el, false, this._slideOpt);
		}
	}

	_show() {
		let el = this.getElement();
		if (el) {
			anim.stop(this._token);
			this._token = this._horizontal
				? anim.slideHorizontal(el, true, this._slideOpt)
				: anim.slideVertical(el, true, this._slideOpt);
		}
	}

	_renderComponent() {
		let el = this.getElement();
		if (this._component) {
			this._component.render(el);
			this._current = this._component;
		}
	}

	_unrenderComponent() {
		if (this._current) {
			this._current.unrender();
			this._current = null;
		}
	}

	_onTransitionEnd() {
		let el = this.getElement();
		if (!el) return;

		if (this._component && this._current === this._component) return;

		this._unrenderComponent();
		this._renderComponent();

		if (this._component) {
			this._show(true);
		}
	}
}

export default Collapser;
