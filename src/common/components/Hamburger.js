import { RootElem } from 'modapp-base-component';
import './hamburger.scss';

/**
 * Hamburger shows a hamburger menu toggle icon.
 */
class Hamburger extends RootElem {

	/**
	 * Creates an instance of LayoutHamburger
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.open] Flag to tell if the hamburger is open.
	 * @param {function} [opt.onChange] On change callback: func(isOpen, component)
	 */
	constructor(opt) {
		super(null);
		opt = Object.assign({}, opt);
		opt.attributes = Object.assign({ 'aria-expanded': 'false' }, opt.attributes);
		opt.events = Object.assign({
			click: (c, e) => {
				c.toggle();
				e.stopPropagation();
			},
		}, opt.events);
		opt.className = 'hamburger' + (opt.className ? ' ' + opt.className : '');
		super.setRootNode(n => n.elem('button', opt, [
			n.html('<svg class="hamburger--icon" aria-hidden="true" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100">' +
				'<g class="hamburger--svg-open">' +
				'<path d="M5 13h90v14H5z"></path>' +
				'<path d="M5 43h90v14H5z"></path>' +
				'<path d="M5 73h90v14H5z"></path>' +
				'</g>' +
				'<g class="hamburger--svg-close" transform="rotate(45,50,50)">' +
				'<path d="M43 5h14v90H43z"></path>' +
				'<path d="M5 43h90v14H5z"></path>' +
				'</g>' +
				'</svg>',
			),
		]));
		this._onToggle = opt.onToggle || null;

		this.toggle(!!opt.open, false);
	}

	/**
	 * Check if the hamburger menu is open.
	 * @returns {boolean} True if other, otherwise false.
	 */
	isOpen() {
		return this._open;
	}

	/**
	 * Toggles between open and close.
	 * @param {boolean} [open] State to toggle to. Defaults to toggle between open/close.
	 * @param {boolean} [triggerOnToggle] Flag to tell if the onToggle callback should be triggered. Defaults to true.
	 * @returns {this}
	 */
	toggle(open, triggerOnToggle) {
		if (typeof open == 'undefined') {
			open = !this._open;
		}
		open = !!open;
		if (open === this._open) return;
		this._open = open;
		this._rootElem[open ? 'addClass' : 'removeClass']('open');
		if (triggerOnToggle !== false && this._onToggle) {
			this._onToggle(this, open);
		}
		return this;
	}
}

export default Hamburger;
