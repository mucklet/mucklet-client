import { RootElem } from 'modapp-base-component';
import formatDuration from 'utils/formatDuration';
import parseDuration from 'utils/parseDuration';

/**
 * DurationInput renders an input field which lets you input a duration.
 */
class DurationInput extends RootElem {

	/**
	 * Creates an instance of DurationInput
	 * @param {number} duration Initial duration value in milliseconds.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback. The input event should not be included unless you know what you are doing.
	 * @param {function} [opt.onChange] Callback called whenever the duration value is changed: function(duration, this)
	 * @param {function} [opt.onValid] Callback called whenever the valid status is changed: function(isValid, this)
	 * @param {function} [opt.invalidClassName] Classname to use when the input text is not a valid duration. Defaults to 'invalid',
	 */
	constructor(duration, opt) {
		super();
		opt = Object.assign({ attributes: null, events: null }, opt);
		opt.attributes = Object.assign({ type: 'text' }, opt.attributes, { spellcheck: 'false' });
		opt.events = Object.assign({ input: this._onInput.bind(this) }, opt.events);
		super.setRootNode(n => n.elem('input', opt));
		this._valid = true;
		this._onChange = opt.onChange;
		this._onValid = opt.onValid;
		this._invalidClassName = opt.invalidClassName || 'invalid';
		this.setDuration(duration, false);
	}

	/**
	 * Gets the duration.
	 * @returns {number} Duration value in milliseconds
	 */
	getDuration() {
		return this._duration;
	}

	/**
	 * Sets the duration.
	 * @param {number?} duration Duration value in milliseconds. Null means an unset/invalid duration.
	 * @param {boolean} [triggerChange] Flag to tell if changes should trigger the onChange callback. Defaults to true.
	 * @returns {this}
	 */
	setDuration(duration, triggerChange) {
		duration = typeof duration == 'number' ? duration : null;
		if (this._duration === duration) return;

		this.setProperty('value', formatDuration(duration));
		this._setInvalidClass(false);
		this._setDuration(duration, triggerChange);
		return this;
	}

	/**
	 * Checks if the input text is valid.
	 * @returns {bool} True if the input is valid, otherwise false.
	 */
	isValid() {
		return this._valid;
	}

	_setDuration(d, triggerChange) {
		this._duration = d;
		// Trigger onChange
		if (triggerChange !== false && this._onChange) {
			this._onChange(d, this);
		}
	}

	_onInput(ev) {
		let d = parseDuration(this.getProperty('value'));
		let valid = typeof d == 'number';
		this._setInvalidClass(!valid);
		this._setDuration(d);
	}

	_setInvalidClass(set) {
		if (this._valid == !set) return;
		this._valid = !set;
		if (this._invalidClassName) {
			super[set ? 'addClass' : 'removeClass'](this._invalidClassName);
		}
		if (this._onValid) {
			this._onValid(!set, this);
		}
	}
}

export default DurationInput;
