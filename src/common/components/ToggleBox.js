import { RootElem } from 'modapp-base-component';
import './togglebox.scss';

/**
 * ToggleBox is a checkbox-like box that can be toggled between states.
 */
class ToggleBox extends RootElem {

	/**
	 * Creates an instance of ToggleBox
	 * @param {*} value Initial value.
	 * @param {object} [opt] Optional parameters.
	 * @param {Array.<*>} [opt.values] Values to cycle through. Defaults to [null, true, false].
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback. Default click event is calling toggleNext()
	 * @param {function} [opt.onChange] On change callback: func(value, component)
	 * @param {boolean} [opt.disableClick] Flag to disable toggle to next on click.
	 */
	constructor(value, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'togglebox' + (opt.className ? ' ' + opt.className : '');
		super('button', opt, [{ tagName: 'div' }]);
		this._idx = -1;
		this._values = opt.values || [ false, true ];
		if (!opt.disableClick) {
			this.setEvent('click', (c, e) => {
				this.toggleNext();
				e.stopPropagation();
			});
		}
		this.setValue(value, false);
		this._onChange = opt.onChange;
	}

	/**
	 * Gets the value
	 * @returns {*} Current set value.
	 */
	getValue() {
		return this._values[this._idx];
	}

	/**
	 * Sets the value.
	 * @param {?boolean} value Value to set.
	 * @param {boolean} [triggerChange] Flag to tell if changes should trigger the onChange callback.
	 * @returns {this}
	 */
	setValue(value, triggerChange) {
		let idx = 0;
		for (let i = 0; i < this._values.length; i++) {
			if (value === this._values[i]) {
				idx = i;
				break;
			}
		}
		if (idx === this._idx) return;

		if (this._idx >= 0) {
			this.removeClass('value-' + this._idx);
		}
		this.addClass('value-' + idx);
		this._idx = idx;
		if (triggerChange !== false && this._onChange) {
			this._onChange(this.getValue(), this);
		}
		return this;
	}

	/**
	 * Toggles to the next value.
	 * @returns {this}
	 */
	toggleNext() {
		this.setValue(this._values[(this._idx + 1) % this._values.length]);
		return this;
	}
}

export default ToggleBox;
