import { RootElem } from 'modapp-base-component';
import simplebar from 'simplebar';
import 'simplebar/dist/simplebar.css';

/**
 * SimpleBar is a wrapper around simplebar.
 *
 * The options may also contain any option {@link https://github.com/Grsmto/simplebar|simplebar}.
 * @param {object} [opt] Options.
 * @param {boolean} [opt.lockToBottom] Flag that enables locking to bottom. Defaults to false.
 * @param {function} [opt.onAtBottom] Callback function called whenever the atBottom value changes: function(atBottom, causedByScroll)
 */
class SimpleBar extends RootElem {
	constructor(component, opt) {
		opt = Object.assign({ tagName: 'div' }, opt);
		super(opt.tagName, opt);
		this._sb = null;
		this._opt = opt;
		this._component = component;
		this._lock = !!opt.lockToBottom;
		this._onAtBottom = opt.onAtBottom || null;

		if (this._lock) {
			this._atBottom = true;
			this._locked = false;
			this._lastScroll = 0;

			// Bind callbacks;
			this._onAnimFrame = this._onAnimFrame.bind(this);
			this._onScroll = this._onScroll.bind(this);
		}
	}

	get simplebar() {
		return this._sb;
	}

	get atBottom() {
		return this._atBottom;
	}

	getComponent() {
		return this._component;
	}

	render(el) {
		let e = super.render(el);
		this._sb = new simplebar(e, this._opt);
		this._component.render(this._sb.getContentElement());
		if (this._lock) {
			this._setListener(true);
			this._lockToBottom();
		}
		return e;
	}

	unrender() {
		if (this._sb) {
			this._component.unrender();
			this._sb.unMount();
			this._sb = null;
			super.unrender();
		}
	}

	recalculate() {
		if (this._sb) {
			this._sb.recalculate();
		}
	}

	_lockToBottom() {
		if (!this._atBottom || this._locked) return;
		this._locked = true;
		requestAnimationFrame(this._onAnimFrame);
	}

	_onAnimFrame() {
		if (!this._sb || !this._atBottom) {
			this._locked = false;
			return;
		}
		let se = this._sb.getScrollElement();
		se.scrollTop = se.scrollHeight;
		requestAnimationFrame(this._onAnimFrame);
	}

	_setListener(on) {
		this._sb.getScrollElement()[on ? 'addEventListener' : 'removeEventListener']('scroll', this._onScroll);
	}

	_onScroll(ev) {
		if (!this._sb) return;
		let se = this._sb.getScrollElement();
		let stch = se.scrollTop + se.clientHeight;
		let sh = se.scrollHeight;

		if (se.scrollTop < this._lastScroll && Math.round(stch) < Math.round(sh)) {
			this._setAtBottom(false);
		// +4 for a bit of additional buffer, in case of scaling/zooming irregularities
		} else if (Math.round(stch + 4) >= sh) {
			this._setAtBottom(true);
			this._lockToBottom();
		}
		this._lastScroll = se.scrollTop;
	}

	_setAtBottom(v) {
		if (this._atBottom !== v) {
			this._atBottom = v;
			if (this._onAtBottom) {
				this._onAtBottom(v);
			}
		}
	}
}

export default SimpleBar;
