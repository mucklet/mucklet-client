import { RootElem } from 'modapp-base-component';
import { anim } from 'modapp-utils';

/**
 * Fader is component wrapper that can fade in and out components.
 */
class Fader extends RootElem {

	/**
	 * Creates an instance of Fader
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.duration] Optional transition duration in milliseconds.
	 * @param {boolean} [opt.hidden] Flag to tell if the fader should start as hidden.
	 */
	constructor(component, opt) {
		super('div', opt);

		opt = opt || {};
		this._fadeOpt = {
			callback: this._onTransitionEnd.bind(this),
			duration: typeof opt?.duration == 'number' ? opt.duration : 150,
		};
		this._current = null;
		this._component = null;
		this._token = null;

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
	 * Sets the component to fade in, or null to fade out.
	 * @param {?Component} component Component to set.
	 * @param {object} [opt] Optional parameters
	 * @param {function} [opt.onRender] Callback function to call after rendering the component.
	 * @param {function} [opt.onUnrender] Callback function to call before unrendering the component.
	 * @returns {this}
	 */
	setComponent(component, opt) {
		component = component || null;
		if (this._component === component) return this;

		this._component = component;
		this._componentOpt = opt;
		let el = this.getElement();
		if (!el) {
			return this;
		}

		// Is the component the same at currently rendered one?
		if (this._component === this._current) {
			if (this._current) {
				this._fade(1);
			}
			return this;
		}

		if (this._current) {
			this._fade(0);
		} else {
			this._renderComponent();
			this._fade(1);
		}
		return this;
	}

	render(el) {
		super.render(el);
		this._renderComponent();
		super.setStyle('opacity', this._component ? null : 0);
		return this.getElement();
	}

	unrender() {
		anim.stop(this._token);
		if (this.getElement()) {
			this._unrenderComponent();
			super.unrender();
		}
	}

	_fade(opacity) {
		let el = this.getElement();
		if (el) {
			anim.stop(this._token);
			this._token = anim.fade(el, opacity, this._fadeOpt);
		}
	}

	_renderComponent() {
		let el = this.getElement();
		if (this._component) {
			this._component.render(el);
			this._current = this._component;
			this._currentOpt = this._componentOpt;
			// Call onRender callback if available
			let onRender = this._currentOpt?.onRender;
			if (onRender) {
				onRender(this, this._component);
			}
		}
	}

	_unrenderComponent() {
		if (this._current) {
			// Call onUnrender callback if available
			let onUnrender = this._currentOpt?.onUnrender;
			if (onUnrender) {
				onUnrender(this, this._current);
			}
			this._current.unrender();
			this._current = null;
			this._currentOpt = null;
		}
	}

	_onTransitionEnd() {
		let el = this.getElement();
		if (!el) return;

		if (this._component && this._current === this._component) return;

		this._unrenderComponent();
		this._renderComponent();

		if (this._component) {
			this._fade(1);
		}
	}
}

export default Fader;
