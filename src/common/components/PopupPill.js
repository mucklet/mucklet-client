import { Elem } from 'modapp-base-component';
import './popupPill.scss';

const defaultCtx = {};

const typeClassNames = {
	dark: ' popuppill--style-dark',
	border: ' popuppill--style-border',
};

/**
 * PopupPill renders a placeholder that, when moused over or clicked, will show
 * a popup. Only one popup will be open at the same time for any popup pill
 * using the same ctx (context) object.
 */
class PopupPill extends Elem {

	/**
	 * Creates an instance of PopupPill.
	 * @param {function} componentFactory Popup content component factory
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.ctx] Context object. Defaults to a shared context.
	 * @param {string} [opt.type] Type of pill. May be 'default', 'dark', or 'border'.
	 * @param {string} [opt.pillClassName] Additional class name set on the pill element.
	 */
	constructor(componentFactory, opt) {
		super(null);

		opt = opt || {};
		this.opt = opt;
		this.componentFactory = componentFactory;
		this.ctx = opt.ctx || defaultCtx;
		this.module = module;

		this._tip = null;
		this._timer = null;

		this.close = this.close.bind(this);

		super.setRootNode(n => n.elem('div', {
			className: 'popuppill' + (opt.className ? ' ' + opt.className : ''),
			events: {
				mouseover: (c, ev) => {
					this._clearTimeout();
					if (!this.ctx.clicked) {
						this._renderTip();
					}
				},
				mouseleave: (c, ev) => {
					if (!this.ctx.clicked) {
						this._clearTimeout();
						this._timer = setTimeout(this.close, 300);
					}
				},
				click: (e, ev) => {
					this.toggle();
					ev.stopPropagation();
					ev.preventDefault();
				},
			},
		}, [
			n.elem('div', { className: 'popuppill--pill' + (typeClassNames[opt.type] || '') + (opt.pillClassName ? ' ' + opt.pillClassName : '') }),
		]));
	}

	unrender() {
		this._unrenderTip();
		super.unrender();
	}

	toggle() {
		if (this._tip) {
			if (!this.ctx.clicked) {
				this.ctx.clicked = true;
				return;
			}
			this._unrenderTip();
		} else {
			this._renderTip();
			this.ctx.clicked = true;
		}
	}

	close() {
		this._unrenderTip();
	}

	_clearTimeout() {
		clearTimeout(this._timer);
		this._timer = null;
	}

	_renderTip() {
		if (this._tip) return;

		if (this.ctx.tip) {
			this.ctx.tip.close();
		}

		let el = this.getElement();
		if (!el) return;

		this._tip = new Elem(n => n.elem('div', { className: 'popuppill--tip' }, [
			n.component(this.componentFactory()),
		]));
		this._caret = new Elem(n => n.elem('div', { className: 'popuppill--caret' }));
		this._tip.render(el);
		this._caret.render(el);

		this.ctx.tip = this;
	}

	_unrenderTip() {
		if (!this._tip) return;

		this._tip.unrender();
		this._caret.unrender();

		this._tip = null;
		this._caret = null;

		if (this.ctx.tip === this) {
			this.ctx.tip = null;
			this.ctx.clicked = false;
		}
		this._clearTimeout();
	}
}

export default PopupPill;
