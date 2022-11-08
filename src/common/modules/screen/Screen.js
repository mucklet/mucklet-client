import Fader from 'components/Fader';
import './screen.scss';

/**
 * Screen handles the screen viewport.
 */
class Screen {
	constructor(app, params) {
		this.app = app;
		this.fader = new Fader(null, { className: 'screen' });
		this.app.setComponent(this.fader);
	}

	getFader() {
		return this.fader;
	}

	setComponent(component) {
		this.component = component;
		this.subcomponents = [];
		this.fader.setComponent(component);
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

	dispose() {
		this.app.unsetComponent(this.fader);
		this.component = null;
		this.subcomponents = null;
		this.fader = null;
	}
}

export default Screen;
