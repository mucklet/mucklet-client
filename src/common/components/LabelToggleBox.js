import { RootElem, Txt } from 'modapp-base-component';
import ToggleBox from './ToggleBox';
import PopupTip from './PopupTip';
import isComponent from 'utils/isComponent';
import './labelToggleBox.scss';

/**
 * LabelToggleBox is a ToggleBox with a label.
 */
class LabelToggleBox extends RootElem {

	/**
	 * Creates an instance of LabelToggleBox
	 * @param {string|LocaleString|Component} label Label text or component.§
	 * @param {*} value Initial value.
	 * @param {object} [opt] Optional parameters.
	 * @param {Array.<*>} [opt.values] Values to cycle through. Defaults to [null, true, false].
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback. Default click event is calling toggleNext()
	 * @param {boolean} [opt.disabled] Flag telling if the component should be disabled. Defaults to false.
	 * @param {string|LocaleString} [opt.popupTip] Popup tip to show right of the label.
	 * @param {string|LocaleString} [opt.popupTipClassName] Class name to add to the popup tip. Defaults to 'popuptip--width-m'.
	 * @param {string|LocaleString} [opt.toggleBoxClassName] Class name to add to the toggleBox. Defaults to none.
	 * @param {function} [opt.onChange] On change callback: func(value, component)
	 */
	constructor(label, value, opt) {
		super(null);
		opt = Object.assign({ popupTipClassName: 'popuptip--width-m' }, opt);
		opt.className = 'labeltogglebox' + (opt.className ? ' ' + opt.className : '');

		this._tb = new ToggleBox(value, {
			values: opt.values,
			onChange: opt.onChange,
			events: opt.toggleBoxEvents || null,
			disableClick: opt.disableClick,
			className: opt.toggleBoxClassName || null
		});
		this._popupTip = opt.popupTip
			? new PopupTip(opt.popupTip, { position: 'left', className: 'labeltogglebox--popuptip' + (opt.popupTipClassName ? ' ' + opt.popupTipClassName : '') })
			: null;
		this._rendered = null;
		this._label = null;
		this._labelTxt = new Txt("");
		this.setRootNode(n => n.elem('label', opt, [
			n.component(this._tb),
			n.component(this._popupTip),
		]));
		this.setLabel(label);
		if (opt.disabled) {
			this.setDisabled(true);
		}
	}

	render(el) {
		let e = super.render(el);
		this._renderLabel();
		return e;
	}

	unrender() {
		this._unrenderLabel();
		super.unrender();
	}

	/**
	 * Sets label.
	 * @param {string|LocaleString|Component} txt Label text or component.
	 * @returns {this}
	 */
	setLabel(txt) {
		if (isComponent(txt)) {
			this._label = txt;
		} else {
			this._labelTxt.setText(txt);
			this._label = null;
		}

		if (this._rendered === this._label) {
			return;
		}

		this._unrenderLabel();
		this._renderLabel();
		return this;
	}

	setDisabled(isDisabled) {
		this[isDisabled ? 'addClass' : 'removeClass']('inactive');
		this._tb.setProperty('disabled', isDisabled ? 'disabled' : null);
	}

	_renderLabel() {
		let e = this.getElement();
		if (!e) return;

		let c = this._label || this._labelTxt;
		c.render(e);
		this._rendered = c;
	}

	_unrenderLabel() {
		if (this._rendered) {
			this._rendered.unrender();
			this._rendered = null;
		}
	}

	getToggleBox() {
		return this._tb;
	}

	/**
	 * Gets the value
	 * @returns {*} Current set value.
	 */
	getValue() {
		return this._tb.getValue();
	}

	/**
	 * Sets the value.
	 * @param {?boolean} value Value to set.
	 * @param {boolean} [triggerChange] Flag to tell if changes should trigger the onChange callback.
	 * @returns {this}
	 */
	setValue(value, triggerChange) {
		this._tb.setValue(value, triggerChange);
		return this;
	}

	/**
	 * Toggles to the next value.
	 * @returns {this}
	 */
	toggleNext() {
		this._tb.toggleNext();
		return this;
	}
}

export default LabelToggleBox;
