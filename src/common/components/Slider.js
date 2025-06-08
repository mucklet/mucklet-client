import { RootElem } from 'modapp-base-component';

import './slider.scss';

/**
 * Slider is component wrapper that can slide away to the left or right
 */
class Slider extends RootElem {

	/**
	 * Creates an instance of Slider
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.hidden] Flag to tell if the slider should start as hidden.
	 */
	constructor(component, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'comp-slider' + (opt.className ? ' ' + opt.className : '');
		super('div', opt);

		// Bind callbacks
		this._onTransitionEnd = this._onTransitionEnd.bind(this);

		this.hidden = !!opt.hidden;
		this.open = !this.hidden;

		this.setComponent(component);
	}

	setComponent(component) {
		component = component || null;
		let el = this.getElement();
		if (!el) {
			this.component = component;
			return;
		}

		// Unrender previous component
		if (this.component && !this.hidden) {
			this.component.unrender();
		}

		this.component = component;

		// Render current component
		if (component && !this.hidden) {
			component.render(el);
		}
	}

	getComponent() {
		return this.component;
	}

	render(el) {
		super.render(el);
		let e = this.getElement();
		if (this.open) {
			if (this.component) {
				this.component.render(e);
			}
		} else {
			e.style.display = 'none';
		}
		e.addEventListener('transitionend', this._onTransitionEnd);
		return e;
	}

	unrender() {
		let el = this.getElement();
		if (!el) return;
		if (!this.hidden && this.component) {
			this.component.unrender();
		}
		el.removeEventListener('transitionend', this._onTransitionEnd);
		this.hidden = !this.open;
		super.unrender();
	}

	slideInLeft() {
		this._slideIn('left', 'right');
		return this;
	}

	slideOutLeft() {
		this._slideOut('left', 'right');
		return this;
	}

	slideInRight() {
		this._slideIn('right', 'left');
		return this;
	}

	slideOutRight() {
		this._slideOut('right', 'left');
		return this;
	}

	slideInBottom() {
		this._slideIn('bottom', 'top');
		return this;
	}

	slideOutBottom() {
		this._slideOut('bottom', 'top');
		return this;
	}

	_slideOut(to, from) {
		if (!this.open) {
			return;
		}
		let el = this.getElement();
		if (el) {
			el.classList.add('slide-out-' + to);
			el.classList.remove('slide-out-' + from);
		}
		this.open = false;
	}

	_slideIn(from, to) {
		this.open = true;

		let el = this.getElement();
		if (!el) {
			this.hidden = false;
			return;
		}

		let cl = 'slide-out-' + from;

		if (this.hidden) {
			if (this.component) {
				this.component.render(el);
			}
			el.classList.add(cl);
			el.classList.add(cl);
			el.style.display = null;
			this.hidden = false;
			window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
				let el = this.getElement();
				if (el && el.classList.contains(cl) && this.open) {
					el.classList.remove(cl);
				}
			}));
			return;
		}

		el.classList.remove(cl);
		el.classList.remove('slide-out-' + to);
	}

	_onTransitionEnd() {
		let el = this.getElement();
		if (!el || this.open || this.hidden) return;

		el.style.display = 'none';
		if (this.component) {
			this.component.unrender();
		}
		this.hidden = true;
	}
}

export default Slider;
