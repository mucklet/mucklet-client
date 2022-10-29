import { Elem } from 'modapp-base-component';

class CharLogMutedEvent extends Elem {
	constructor(module, char, ctx, ev) {
		super(null);

		this.module = module;
		this.char = char;
		this.ctx = ctx;
		this.ev = ev;

		this._tip = null;
		this._timer = null;

		this.close = this.close.bind(this);
		let ec = ev.char;

		super.setRootNode(n => n.elem('div', {
			className: 'charlog-mutedevent',
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
				}
			}
		}, [
			n.elem('div', { className: 'charlog-mutedevent--pill mev-' + (ev.type || 'unknown') + (ec ? ' mf-' + char.id + '-' + ec.id : '') })
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

		this._tip = new Elem(n => n.elem('div', { className: 'charlog-mutedevent--tip' }, [
			n.component(this.module.self.getLogEventComponent(this.char.id, this.ev, { noFocus: true, noMessageHighlight: true }))
		]));
		this._caret = new Elem(n => n.elem('div', { className: 'charlog-mutedevent--caret' }));
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

export default CharLogMutedEvent;
