import { Txt, Elem } from 'modapp-base-component';
import isComponent from 'utils/isComponent';
import './tooltip.scss';

/**
 * Tooltip render a tooltip in the containing div.
 */
class Tooltip {

	/**
	 * Creates an instance of Tooltip
	 * @param {string|LocaleString|Component} text Tip to show on click.
	 * @param {Element} ref Reference element.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.margin] Margin to use. May be 'm'.
	 * @param {function} [opt.onClose] Callback called on close.
	 */
	constructor(text, ref, opt) {
		opt = opt || {};
		opt.className = 'tooltip' + (opt.className ? ' ' + opt.className : '') + (opt.margin ? ' tooltip--margin-' + opt.margin : '');

		this._close = this._close.bind(this);
		this.opt = opt;
		this.ref = ref || window.document.body;
		this.txt = isComponent(text) ? text : new Txt(text, { className: 'tooltip--text' });
		this.elem = null;
		this.caret = null;
	}

	/**
	 * Opens the tooltip due a click.
	 * @param {boolean} open Flag that tells the tooltip is opened and not just hovered.
	 * @returns {this}
	 */
	open(open) {
		this.elem = new Elem(n => n.elem('div', this.opt, [
			n.component(this.txt)
		]));
		this.caret = new Elem(n => n.elem('div', { className: 'tooltip--caret' }));
		this.elem.render(this.ref);
		this.caret.render(this.ref);
		// this._setListeners(true);
		this._setPosition();
		this.open = open;
		return this;
	}

	setText(txt) {
		txt = this.txt.setText(txt);
		return this;
	}

	_setPosition() {
		if (!this.elem || !this.elem.getElement()) return;

		this.elem.removeClass('tooltip--full');
		this.elem.removeClass('tooltip--right');
		this.elem.removeClass('tooltip--left');
		this.elem.setStyle('margin-top', null);
		this.elem.setStyle('margin-left', null);
		let el = this.elem.getElement();
		let width = el.offsetWidth;
		let elemRect = el.getBoundingClientRect();
		this.elem.addClass('tooltip--full');
		let contRect = el.getBoundingClientRect();

		let contWidth = contRect.right - contRect.left;

		if (width < contWidth) {
			let contOffsetLeft = elemRect.left - contRect.left + (this.ref.offsetWidth) / 2;
			this.elem.removeClass('tooltip--full');
			if (contOffsetLeft < 0) {
				this.elem.addClass('tooltip--left');
			} else if (contOffsetLeft + width > contWidth) {
				this.elem.addClass('tooltip--right');
			} else {
				this.elem.setStyle('margin-left', (this.ref.offsetWidth / 2) + 'px');
			}
		}
		this.elem.setStyle('margin-top', (-this.ref.offsetHeight) + 'px');
		this.caret.setStyle('margin-top', (-this.ref.offsetHeight) + 'px');
		this.caret.setStyle('margin-left', (this.ref.offsetWidth / 2) + 'px');
	}

	close() {
		this._close();
	}

	_close(e) {
		if (!this.elem) return;

		let n = this.ref;
		if (e && e.target && n && n.contains(e.target)) {

			return;
		}

		// this._setListeners(false);
		this.elem.unrender();
		this.caret.unrender();
		if (this.opt.onClose) {
			this.opt.onClose(e);
		}
	}

	// _setListeners(on) {
	// 	let cb = on ? 'addEventListener' : 'removeEventListener';
	// 	document[cb]('keydown', this._close, true);
	// 	document[cb]('click', this._close, true);
	// }
}

export default Tooltip;
