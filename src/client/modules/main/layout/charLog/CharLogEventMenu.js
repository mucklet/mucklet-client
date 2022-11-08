import { Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

class CharLogEventMenu {
	constructor(module, charId, ev, menuItems) {
		this.module = module;
		this.charId = charId;
		this.ev = ev;
		this.menuItems = menuItems;

		// Bind callbacks
		this._close = (e) => {
			let n = this._menu && this._menu.getElement();
			if (n && !n.contains(e.target)) {
				setTimeout(() => this.toggle(false), 0);
			}
		};
	}

	render(el) {
		this.elem = new Elem(n => n.elem('button', {
			className: 'charlog-eventmenu iconbtn tiny tinyicon',
			events: {
				click: (c, ev) => {
					this.toggle();
					ev.currentTarget.blur();
					ev.stopPropagation();
					ev.preventDefault();
				},
			},
		}, [
			n.component(new FAIcon('ellipsis-v')),
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
			className: 'charlog-eventmenu--menu', attributes: {
				style: 'position: absolute; top: ' + (rect.top + document.documentElement.scrollTop + el.offsetHeight + 6) + 'px; left: ' + (rect.left + document.documentElement.scrollLeft + el.offsetWidth) + 'px;',
			},
		}, [
			n.component(new CollectionList(
				this.menuItems,
				m => new Elem(n => n.elem('div', {
					className: 'charlog-eventmenu--btn flex-row pad8',
					events: {
						click: (c, ev) => {
							m.onClick(this.charId, this.ev);
							this.toggle(false);
							ev.stopPropagation();
						},
					},
				}, [
					n.elem('div', { className: 'charlog-eventmenu--btnicon flex-auto' }, [ n.component(m.icon ? new FAIcon(m.icon) : null) ]),
					n.component(new Txt(m.name, { className: 'charlog-eventmenu--btnname flex-1' })),
				])),
			)),
		]));
		this._menu.render(document.body);
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
}

export default CharLogEventMenu;
