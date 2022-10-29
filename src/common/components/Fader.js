import { RootElem } from 'modapp-base-component';

import './fader.scss';

/**
 * Fader is component wrapper that can fade in and out components
 */
class Fader extends RootElem {

	/**
	 * Creates an instance of Fader
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.hidden] Flag to tell if the fader should start as hidden.
	 */
	constructor(component, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'comp-fader' + (opt.className ? ' ' + opt.className : '');
		super('div', opt);

		// Bind callbacks
		this._onTransitionEnd = this._onTransitionEnd.bind(this);

		this.current = null;
		this.component = null;

		this.setComponent(component);
	}

	/**
	 * Sets the component to fade in
	 * @param {Component} component Component
	 * @param {object} [opt] Optional parameters
	 * @param {function} [opt.onRender] Callback function to call after rendering the component.
	 * @param {function} [opt.onUnrender] Callback function to call before unrendering the component.
	 * @returns {this}
	 */
	setComponent(component, opt) {
		component = component || null;
		this.component = component;
		this.componentOpt = opt;
		let el = this.getElement();
		if (!el) {
			return this;
		}

		// Is the component the same at currently rendered one?
		if (this.component === this.current) {
			if (this.current) {
				super.removeClass('fade-out');
			}
			return this;
		}

		if (this.current) {
			this._hide();
		} else {
			this._renderComponent();
		}
		return this;
	}

	getComponent() {
		return this.component;
	}

	render(el) {
		super.removeClass('fade-out');
		super.render(el);
		this._renderComponent();
		let e = this.getElement();
		e.addEventListener('transitionend', this._onTransitionEnd);
		return e;
	}

	unrender() {
		let el = this.getElement();
		if (!el) return;
		el.removeEventListener('transitionend', this._onTransitionEnd);
		this._unrenderComponent();
		super.unrender();
	}

	_hide() {
		let el = this.getElement();
		if (el) {
			let o = getComputedStyle(el).getPropertyValue("opacity");
			super.addClass('fade-out');
			if (o == 0) {
				this._onTransitionEnd();
			}
		}
	}

	_renderComponent() {
		let el = this.getElement();
		if (this.component) {
			if (el) {
				this.component.render(el);
			}
			this.current = this.component;
			this.currentOpt = this.componentOpt;
			super.removeClass('fade-out');
		} else {
			super.addClass('fade-out');
		}

		// Call onRender callback if available
		let onRender = this.componentOpt && this.componentOpt.onRender;
		if (onRender) {
			onRender(this, this.component);
		}
	}

	_unrenderComponent() {
		// Call onUnrender callback if available
		let onUnrender = this.currentOpt && this.currentOpt.onUnrender;
		if (onUnrender) {
			onUnrender(this, this.current);
		}

		if (this.current) {
			this.current.unrender();
			this.current = null;
		}
	}

	_onTransitionEnd(e) {
		let el = this.getElement();
		if (!el) return;

		if (e && (e.currentTarget != e.target || !el.classList.contains('fade-out'))) return;

		if (this.component) {
			if (this.current === this.component) return;
			this._unrenderComponent();
			this._renderComponent();
		} else {
			this._unrenderComponent();
		}
	}
}

export default Fader;
