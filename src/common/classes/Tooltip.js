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
	 * @param {string} [opt.className] Class name for tooltip element.
	 * @param {string} [opt.margin] Margin to use. May be 'm' (16px) or 'xs' (4px)
	 * @param {string} [opt.padding] Inner padding to use. May be 's' or 'm'.
	 * @param {string} [opt.size] Size. May be 'auto' or 'full'. Default to 'auto'.
	 * @param {number} [opt.offset] Position of caret in pixels relative to viewport. Centered if omitted.
	 * @param {string} [opt.position] Position of the tooltip. May be 'top', 'bottom'. Defaults to 'top'. }
	 * @param {Element} [opt.boundary] Boundary box element. Will be used to try to set max-height.
	 * @param {function} [opt.onClose] Callback called on close.
	 */
	constructor(text, ref, opt) {
		opt = opt || {};
		this.posClass = ' tooltip--pos-' + (opt.position || 'top');
		opt.className = 'tooltip' +
			(opt.className ? ' ' + opt.className : '') +
			(opt.margin ? ' tooltip--margin-' + opt.margin : '') +
			(opt.padding ? ' tooltip--padding-' + opt.padding : '') +
			this.posClass;
		opt.events = Object.assign({ click: (c, ev) => ev.stopPropagation() }, opt.events);

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
			n.component(this.txt),
		]));
		this.caret = new Elem(n => n.elem('div', { className: 'tooltip--caret' + this.posClass }));
		this.elem.render(this.ref);
		this.caret.render(this.ref);
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
		this.elem.addClass('tooltip--full');
		let contRect = el.getBoundingClientRect();
		let contWidth = el.offsetWidth;
		let refRect = this.ref.getBoundingClientRect();
		let refWidth = this.ref.offsetWidth;

		// Calculate the x offset where the caret should be placed using the ref
		// element as reference.
		let offset = refWidth / 2;
		if (typeof this.opt.offset == 'number') {
			offset = Math.min(Math.max(this.opt.offset - refRect.left, 0), refWidth - 1);
		}
		// Ensure the offset is well inside the container to prevent the caret
		// from being disconnected.
		offset = Math.min(Math.max(offset, contRect.left - refRect.left + 9), contRect.right - refRect.left - 10);

		if (width < contWidth && this.opt.size != 'full') {
			let contOffset = refRect.left - contRect.left + offset - (width / 2);
			this.elem.removeClass('tooltip--full');
			if (contOffset < 0) {
				this.elem.addClass('tooltip--left');
			} else if (contOffset + width >= contWidth) {
				this.elem.addClass('tooltip--right');
			} else {
				this.elem.setStyle('margin-left', (offset - (width / 2)) + 'px');
			}
		}
		if (this.opt.position != 'bottom') {
			this.elem.setStyle('margin-top', (-this.ref.offsetHeight) + 'px');
			this.caret.setStyle('margin-top', (-this.ref.offsetHeight) + 'px');
		}

		if (this.opt.boundary) {
			let boundaryRect = this.opt.boundary.getBoundingClientRect();
			let maxHeight = this.opt.position == 'bottom'
				? boundaryRect.height - contRect.top + boundaryRect.top
				: boundaryRect.top - contRect.bottom;
			this.elem.setStyle('max-height', maxHeight + 'px');
		}

		// Caret positioning
		this.caret.setStyle('margin-left', offset + 'px');
	}

	close() {
		this._close();
	}

	getComponent() {
		return this.elem;
	}

	_close(e) {
		if (!this.elem) return;

		let n = this.ref;
		if (e && e.target && n && n.contains(e.target)) {

			return;
		}

		this.elem.unrender();
		this.caret.unrender();
		if (this.opt.onClose) {
			this.opt.onClose(e);
		}
	}
}

export default Tooltip;
