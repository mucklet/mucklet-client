import { Txt, RootElem, Elem } from 'modapp-base-component';
import FAIcon from './FAIcon';
import Fader from './Fader';
import isComponent from 'utils/isComponent';
import './popupTip.scss';

const posHandlers = {
	top: {
		fits: (rect, rootRect, tipRect) => rect.top - rootRect.top > tipRect.height,
		top: rect => rect.top,
		left: rect => rect.left + rect.width / 2,
	},
	right: {
		fits: (rect, rootRect, tipRect) => rootRect.right - rect.right > tipRect.width,
		top: rect => rect.top + rect.height / 2,
		left: rect => rect.right,
	},
	bottom: {
		fits: (rect, rootRect, tipRect) => rootRect.bottom - rect.bottom > tipRect.height,
		top: rect => rect.bottom,
		left: rect => rect.left + rect.width / 2,
	},
	left: {
		fits: (rect, rootRect, tipRect) => rect.left - rootRect.left > rootRect.width,
		top: rect => rect.top + rect.height / 2,
		left: rect => rect.left,
	},
	'bottom-right': {
		fits: (rect, rootRect, tipRect) => rootRect.bottom - rect.bottom > tipRect.height,
		top: rect => rect.bottom,
		left: rect => rect.left + rect.width / 2,
	},
};

/**
 * PopupTip shows an info icon and pops up a tip text when clicked.
 */
class PopupTip extends RootElem {

	/**
	 * Creates an instance of PopupTip
	 * @param {string|LocaleString|Component} tip Tip to show on click.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.position] Position of the tooltip. May be 'left', 'right', 'top', 'bottom'. Defaults to 'left'. }
	 * @param {string} [opt.icon] Font-awesome icon name. Defaults to 'info-circle'.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {boolean} [opt.noIcon] Flag to prevent rendering an icon. It render as open.
	 * @param {boolean} [opt.noToggle] Flag to prevent closing of the tool tip. It render as open.
	 * @param {Node} [opt.track] Element node to track the position of.
	 */
	constructor(tip, opt) {
		super(null);
		let pos = opt.position || 'left';
		opt = Object.assign({ attributes: null }, opt);
		opt.className = 'popuptip' + (typeof pos == 'string' ? ' popuptip--position-' + pos : '') + (opt.track ? ' popuptip--track' : '') + (opt.className ? ' ' + opt.className : '');
		opt.events = Object.assign({}, opt.events, {
			click: opt.noToggle ? null : (c, ev) => {
				this.toggle();
				ev.stopPropagation();
				ev.preventDefault();
			},
		});

		// Bind callbacks
		this._close = opt.noToggle ? null : (e) => {
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

		this._track = opt.track;
		this._position = pos;
		// Bind callbacks
		this._setPosition = this._setPosition.bind(this);
	}

	render(el) {
		this._setListeners(true);
		let rel = super.render(el);
		this._observe(el);
		this._setPosition();
		return rel;
	}

	unrender() {
		this._setListeners(false);
		this._stopObserve();
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
		this._setPosition();
	}

	_setListeners(on) {
		if (this._close) {
			let cb = on ? 'addEventListener' : 'removeEventListener';
			document[cb]('keydown', this._close, true);
			document[cb]('click', this._close, true);
		}
	}

	_observe(el) {
		if (!this._track) return;

		window.addEventListener('resize', this._setPosition);
		this._observer = new IntersectionObserver(this._setPosition, {
			root: el,
			rootMargin: '1024px',
		});
		this._observer.observe(this._track);
	}

	_stopObserve() {
		if (!this._observer) return;

		this._observer.disconnect();
		this._observer = null;
		window.removeEventListener('resize', this._setPosition);
	}

	_setPosition() {
		if (!this._observer || !this._track || !this._open) return;

		let rootRect = this._observer.root.getBoundingClientRect();
		let rect = this._track.getBoundingClientRect();

		// Handle cycling through positions to find the first fit.
		let handler = null;
		if (Array.isArray(this._position)) {
			let tipRect = this._tip.getElement().getBoundingClientRect();

			for (let pos of this._position) {
				let h = posHandlers[pos];
				if (!handler && h.fits(rect, rootRect, tipRect)) {
					handler = h;
					this.addClass('popuptip--position-' + pos);
				} else {
					this.removeClass('popuptip--position-' + pos);
				}
			}

			// Fallback to intial in case none of them fits.
			if (!handler) {
				let pos = this._position[0];
				handler = posHandlers[pos];
				this.addClass('popuptip--position-' + pos);
			}
		} else {
			handler = posHandlers[this._position] || posHandlers['right'];
		}

		this.setStyle('top', handler.top(rect, rootRect) + 'px');
		this.setStyle('left', handler.left(rect, rootRect) + 'px');
	}
}

export default PopupTip;
