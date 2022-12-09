import Fader from 'components/Fader';
import './screen.scss';


const viewport = window.visualViewport || null;

/**
 * Screen handles the screen viewport.
 */
class Screen {
	constructor(app, params) {
		this.app = app;
		// Bind callbacks
		this._setHeight = this._setHeight.bind(this, "resize");
		this._setScroll = this._setHeight.bind(this, "scroll");

		this.fader = new Fader(null, { className: 'screen' });
		this.app.setComponent(this.fader);


		(viewport || window).addEventListener('resize', this._setHeight);
		(viewport || window).addEventListener('scroll', this._setScroll);
		this._setHeight();
	}

	getFader() {
		return this.fader;
	}

	/**
	 * Get current component.
	 * @returns {Component} Current component.
	 */
	getComponent() {
		return this.component;
	}

	/**
	 * Set component.
	 * @param {Component?} component Component to set.
	 * @returns {this}
	 */
	setComponent(component) {
		this.component = component || null;
		this.subcomponents = [];
		this.fader.setComponent(component);
		return this;
	}


	/**
	 * Add subcomponent adds a component that will be shown instead of set
	 * component until removed. Multiple added subcomponents stack.
	 * @param {string} id ID of subcomponent
	 * @param {Component} component Subcomponent
	 */
	addSubcomponent(id, component) {
		let o;
		let i = this._getSubIdx(id);
		if (i >= 0) {
			// Move existing subcomponent to back. Keep previous component.
			o = this.subcomponents[i];
			this.subcomponents.splice(i, 1);
		} else {
			// Add a new subcomponent
			o = { id, component };
		}

		this.subcomponents.push(o);
		this.fader.setComponent(o.component);
	}

	/**
	 * Removes previously set subcomponent by ID.
	 * @param {string} id ID of subcomponent.
	 */
	removeSubcomponent(id) {
		let i = this._getSubIdx(id);
		if (i >= 0) {
			this.subcomponents.splice(i, 1);
		}

		let l = this.subcomponents.length;
		this.fader.setComponent(l
			? this.subcomponents[l - 1].component
			: this.component,
		);
	}

	_getSubIdx(id) {
		return this.subcomponents ? this.subcomponents.findIndex(o => o.id === id) : null;
	}

	_setHeight(type, ev) {
		let height = viewport ? viewport.height : window.innerHeight;
		document.documentElement.style.height = height + 'px';
		// document.documentElement.style.setProperty('--doc-height', height + 'px');
		// document.querySelector('meta[name=viewport]').setAttribute('content', 'height=' + height + 'px, width=device-width, initial-scale=1.0');
		// this.fader.setStyle('height', height + 'px');
	}

	dispose() {
		this.app.unsetComponent(this.fader);
		this.component = null;
		this.subcomponents = null;
		if (this.fader) {
			(viewport || window).removeEventListener('resize', this._setHeight);
			(viewport || window).removeEventListener('scroll', this._setScroll);
		}
		this.fader = null;
	}
}

export default Screen;
