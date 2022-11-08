import { Txt, RootElem, Elem } from 'modapp-base-component';
import FAIcon from './FAIcon';
import Fader from './Fader';
import isComponent from 'utils/isComponent';
import './popupTip.scss';

/**
 * PopupTip shows an info icon and pops up a tip text when clicked.
 */
class PopupTip extends RootElem {

	/**
	 * Creates an instance of PopupTip
	 * @param {string|LocaleString|Component} tip Tip to show on click.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.position] Position of the tooltip. May be 'left', 'right', 'top', 'bottom'. Defaults to 'right'. }
	 * @param {string} [opt.icon] Font-awesome icon name. Defaults to 'info-circle'.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {boolean} [opt.noIcon] Flag to prevent rendering an icon. It render as open.
	 * @param {boolean} [opt.noToggle] Flag to prevent closing of the tool tip. It render as open.
	 */
	constructor(tip, opt) {
		super(null);
		opt = Object.assign({ attributes: null }, opt);
		opt.className = 'popuptip popuptip--position-' + (opt.position || 'left') + ' ' + (opt.className ? ' ' + opt.className : '');
		opt.events = Object.assign({}, opt.events, {
			click: opt.noToggle ? null : (c, ev) => {
				this.toggle();
				ev.stopPropagation();
				ev.preventDefault();
			},
		});

		// Bind callbacks
		this._close = opt.noToggle ? () => {} : (e) => {
			let n = this.getElement();
			if (n && !n.contains(e.target)) {
				this.toggle(false);
			}
		};

		this._open = !!opt.noIcon;
		super.setRootNode(n => n.elem('div', opt, opt.noIcon
			? [
				n.component('tip', new Fader()),
			]
			: [
				n.elem('div', { className: 'popuptip--btn' }, [
					n.component(new FAIcon(opt.icon || 'info-circle', { className: 'popuptip--icon' })),
				]),
				n.component('tip', new Fader()),
			],
		));
		this.setTip(tip || null);
	}

	render(el) {
		this._setListeners(true);
		return super.render(el);
	}

	unrender() {
		this._setListeners(false);
		super.unrender();
	}

	/**
	 * Sets the tip.
	 * @param {string|LocaleString|Component} tip Tip to show on click.
	 * @returns {this}
	 */
	setTip(tip) {
		if (tip !== this._tip) {
			this._tip = new Elem(n => n.elem('div', { className: 'popuptip--tip' }, [
				n.component(isComponent(tip) ? tip : new Txt(tip, { className: 'popuptip--text' })),
			]));
			this._setComponent();
		}
		return this;
	}

	/**
	 * Toggles the tooltip between open and closed.
	 * @param {boolean} [open] Optional state to set the popup tip to. Defaults to toggle between open/close.
	 * @returns {this}
	 */
	toggle(open) {
		this._open = typeof open == 'undefined' ? !this._open : !!open;
		this._setComponent();
		return this;
	}

	_setComponent() {
		this._rootElem.getNode('tip').setComponent(this._open ? this._tip : null);
	}

	_setListeners(on) {
		let cb = on ? 'addEventListener' : 'removeEventListener';
		document[cb]('keydown', this._close, true);
		document[cb]('click', this._close, true);
	}
}

export default PopupTip;
