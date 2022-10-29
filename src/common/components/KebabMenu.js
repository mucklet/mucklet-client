import { Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import './kebabMenu.scss';

class KebabMenu {
	constructor(menuItems, opt) {
		this.menuItems = menuItems;
		this.opt = opt || {};
		this.topMargin = this.opt.topMargin || 6;
		this.absolutePositioned = !!this.opt.absolutePositioned;

		// Bind callbacks
		this._close = this._close.bind(this);
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'kebabmenu' + (this.opt.className ? ' ' + this.opt.className : '') }, [
			n.elem('button', {
				className: 'kebabmenu--btn ' + (this.opt.btnClassName ? this.opt.btnClassName : 'iconbtn tiny tinyicon'),
				events: {
					click: (c, ev) => {
						this.toggle();
						ev.currentTarget.blur();
						ev.stopPropagation();
						ev.preventDefault();
					}
				}
			}, [
				n.component(new FAIcon('ellipsis-v'))
			]),
		]));
		this._setListeners(true);
		return this.elem.render(el);
	}

	unrender() {
		this._unrenderMenu();
		if (this.elem) {
			this._setListeners(false);
			this.elem.unrender();
			this.elem = null;
		}
		if (this.onFadeOut) {
			this.onFadeOut();
			this.onFadeOut = null;
		}
	}

	fadeIn() {
		this.onFadeOut = null;
	}

	fadeOut(onFadeOut) {
		this.onFadeOut = onFadeOut;
		if (!this._open) {
			this.unrender();
		}
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
		if (!this.elem) return;

		if (!this._open) {
			if (this.onFadeOut) {
				this.unrender();
			} else {
				this._unrenderMenu();
			}
			return;
		}

		if (this._menu) return;

		let el = this.elem.getElement();
		let rect = el.getBoundingClientRect();
		this._menu = new Elem(n => n.elem('div', {
			className: 'kebabmenu--menu' + (this.absolutePositioned ? ' kebabmenu--menu-absolute' : '') + (this.opt.menuClassName ? ' ' + this.opt.menuClassName : ''),
			attributes: {
				style: this.absolutePositioned
					? 'top: ' + (rect.top + document.documentElement.scrollTop + el.offsetHeight + this.topMargin) + 'px; left: ' + (rect.left + document.documentElement.scrollLeft + el.offsetWidth) + 'px;'
					: 'margin-top:' + this.topMargin + 'px; right: 0px;'
			}
		}, [
			n.component(new CollectionList(
				this.menuItems,
				m => {
					let click = (c, ev) => {
						m.onClick && m.onClick(m);
						this.toggle(false);
						ev.stopPropagation();
					};
					return m.componentFactory
						? m.componentFactory(click)
						: new Elem(n => n.elem('div', {
							className: 'kebabmenu--itembtn flex-row pad8',
							events: { click }
						}, [
							n.elem('div', { className: 'kebabmenu--itemicon flex-auto' }, [ n.component(m.icon ? new FAIcon(m.icon) : null) ]),
							n.component(new Txt(m.name, { className: 'flex-1' }))
						]));
				}
			))
		]));
		this._menu.render(this.absolutePositioned ? document.body : this.elem.getElement());
	}

	_unrenderMenu() {
		if (this._menu) {
			this._menu.unrender();
			this._menu = null;
		}
	}

	_setListeners(on) {
		let cb = on ? 'addEventListener' : 'removeEventListener';
		document[cb]('keydown', this._close, true);
		document[cb]('click', this._close, true);
	}

	_close(e) {
		let n = this._menu && this._menu.getElement();
		if (n && !n.contains(e.target)) {
			setTimeout(() => this.toggle(false), 0);
		}
	}
}

export default KebabMenu;
