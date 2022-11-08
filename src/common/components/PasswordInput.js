import { RootElem, Input } from 'modapp-base-component';
import FAIcon from './FAIcon';
import './passwordInput.scss';

/**
 * PasswordInput shows a password input field which lets you toggle between
 * showing the password as dots or as text.
 */
class PasswordInput extends RootElem {

	/**
	 * Creates an instance of PasswordInput
	 * @param {string} value Input value
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.onInput] Callback on input events.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.inputOpt] Options for the input element
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback. Default click event is calling toggleNext()
	 */
	constructor(value, opt) {
		super(null);
		opt = Object.assign({}, opt);
		opt.className = 'passwordinput' + (opt.className ? ' ' + opt.className : '');

		let inpOpt = Object.assign({}, opt.inputOpt);
		inpOpt.attributes = Object.assign({ spellcheck: false }, inpOpt.attributes);
		inpOpt.events = Object.assign({}, inpOpt.events, opt.onInput ? { input: opt.onInput } : null);
		this._input = new Input(value, inpOpt);
		this._eye = new FAIcon('');
		this.setRootNode(n => n.elem('div', opt, [
			n.component(this._input),
			n.elem('div', {
				className: 'passwordinput--eye iconbtn medium tinyicon',
				events: { click: () => this.toggle() },
			}, [
				n.component(this._eye),
			]),
		]));
		this.toggle(false);
	}

	/**
	 * Returns the wrapped Input component.
	 * @returns {Component} Input component.
	 */
	getInput() {
		return this._input;
	}

	/**
	 * Toggles between showing and hiding the password.
	 * @param {boolean} [show] Optional show state to set. If undefined, show state will be toggled.
	 * @returns {this}
	 */
	toggle(show) {
		this._showPass = typeof show == 'undefined' ? !this._showPass : !!show;

		this._input.setAttribute('type', this._showPass ? 'text' : 'password');
		this._eye.setIcon(this._showPass ? 'eye-slash' : 'eye');

		return this;
	}

	/**
	 * Gets the value
	 * @returns {string}
	 */
	getValue() {
		return this._input.getValue();
	}

	/**
	 * Sets the value
	 * @param {string} value Value
	 * @returns {this}
	 */
	setValue(value) {
		this._input.setValue(value);
		return this;
	}
}

export default PasswordInput;
