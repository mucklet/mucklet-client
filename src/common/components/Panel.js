import { RootElem, Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import SimpleBar from 'components/SimpleBar';
import isComponent from 'utils/isComponent';

import './panel.scss';

/**
 * Panel is component wrapper that can slide away to the left or right
 */
class Panel extends RootElem {

	/**
	 * Creates an instance of Panel
	 * @param {string|LocaleString|Component} title Panel title.
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.align] Panel alignment; "right", "left". Defaults to "left".
	 * @param {boolean} [opt.closed] Flag to tell if the panel should start as closed.
	 * @param {boolean} [opt.noToggle] Flag to tell if the panel should not show a toggle button.
	 * @param {function} [opt.onToggle] Optional callback function called whenever the panel is toggled.
	 * @param {function} [opt.onClick] Optional callback function called whenever the top-right button is clicked. Button will be hidden if null.
	 * @param {function} [opt.clickIcon] Optional icon to use for the top-right button. Defaults to 'close'.
	 * @param {function} [opt.footerComponent] Optional footer component.
	 * @param {function} [opt.subheaderComponent] Optional subheader component.
	 * @param {function} [opt.btnClass] Optional class name for buttons.
	 */
	constructor(title, component, opt) {
		opt = Object.assign({ align: "left" }, opt);
		opt.className = 'panel panel--align-' + opt.align + (opt.className ? ' ' + opt.className : '');
		super(null);

		// Set options
		this._alignLeft = opt.align != 'right';
		this._instant = !!opt.instant;
		this._onToggle = opt.onToggle;
		this._onButtonClick = opt.onClick || null;

		// Toggle button toggles the sliding panel to open or close.
		this.toggleBtn = new Elem(n => n.elem('button', {
			className: 'panel--toggle iconbtn medium' + (opt.noToggle ? ' panel--notoggle' : '') + (opt.btnClass ? ' ' + opt.btnClass : ''),
			events: {
				click: (c, e) => {
					this.toggle();
					e.stopPropagation();
				},
			},
		}, [
			n.component(new FAIcon('caret-left')),
		]));

		// Click button is the corner button that can be clicked for an action.
		this.clickBtn = new Elem(n => n.elem('button', {
			className: 'panel--btn iconbtn medium' + (opt.btnClass ? ' ' + opt.btnClass : ''),
			events: {
				click: (c, e) => {
					if (this._onButtonClick) {
						this._onButtonClick(this);
					}
					e.stopPropagation();
				},
			},
		}, [
			n.component('icon', new FAIcon()),
		]));

		this.subheaderComponent = opt.subheaderComponent || null;
		this.footerComponent = opt.footerComponent || null;
		this.footer = this.footerComponent
			? new Elem(n => n.elem('div', { className: 'panel--footer' }))
			: null;

		this.setRootNode(n => n.elem('div', { className: 'panel--container' + (opt.instant ? ' panel--instant' : '') }, [
			n.component(this._alignLeft ? this.toggleBtn : null),
			n.elem('panel', 'div', opt, [
				n.component(!this._alignLeft ? this.toggleBtn : null),
				n.elem('headercont', 'div', { className: 'panel--headercont' }, [
					n.component('btn', new Fader(null, { className: 'panel--btncont' })),
					n.elem('header', 'div', { className: 'panel--header' }),
				]),
				n.elem('content', 'div', { className: 'panel--main' }),
				n.component(this.footer),
			]),
		]));

		// Additional components
		this.titleFader = new Fader(null, { className: 'panel--title' });
		this.titleTxt = new Txt("", { tagName: 'h3', className: 'panel--titletxt' });
		this.simpleBar = new SimpleBar(new Fader(null), { className: 'panel--content' });
		this.rendered = false;

		// Bind callbacks
		this._onTransitionEnd = this._onTransitionEnd.bind(this);
		this._onClick = this._onClick.bind(this);

		this.setTitle(title)
			.setComponent(component)
			.setButton(opt.onClick || null, opt.clickIcon)
			.toggle(!opt.closed, false);
	}

	render(el) {
		super.render(el);
		if (this.open) {
			this._renderComponent();
		} else {
			this._unrenderComponent();
		}
		let e = this._rootElem.getNode('panel');
		e.addEventListener('transitionend', this._onTransitionEnd);
		e.addEventListener('click', this._onClick);
		return e;
	}

	unrender() {
		let e = this._rootElem.getNode('panel');
		if (e) {
			e.removeEventListener('transitionend', this._onTransitionEnd);
			e.removeEventListener('click', this._onClick);
			this._unrenderComponent();
			super.unrender();
		}
	}

	_renderComponent() {
		if (!this.rendered) {
			this.simpleBar.render(this._rootElem.getNode('content'));
			this.titleFader.render(this._rootElem.getNode('header'));
			if (this.footer) {
				this.footerComponent.render(this.footer.getElement());
			}
			if (this.subheaderComponent) {
				this.subheaderComponent.render(this._rootElem.getNode('headercont'));
			}
			this.removeClass('panel--hidden');
			this.rendered = true;
		}
	}

	_unrenderComponent() {
		if (this.rendered) {
			this.titleFader.unrender();
			this.simpleBar.unrender();
			if (this.footer) {
				this.footerComponent.unrender();
			}
			if (this.subheaderComponent) {
				this.subheaderComponent.unrender();
			}
			this.rendered = false;
		}
		this.addClass('panel--hidden');
	}

	/**
	 * Sets the title.
	 * @param {string|LocaleString|Component} title Panel title.
	 * @returns {this}
	 */
	setTitle(title) {
		if (!isComponent(title)) {
			this.titleTxt.setText(title);
			title = this.titleTxt;
		}
		this.titleFader.setComponent(title);
		return this;
	}

	getTitle() {
		let c = this.titleFader.getComponent();
		return c == this.titleTxt ? this.titleTxt.getText() : c;
	}

	/**
	 * Sets the component to wrap.
	 * @param {Component} component Component
	 * @param {object} [opt] Optional parameters
	 * @param {function} [opt.onRender] Callback function to call after rendering the component.
	 * @param {function} [opt.onUnrender] Callback function to call before unrendering the component.
	 * @returns {this}
	 */
	setComponent(component, opt) {
		this.simpleBar.getComponent().setComponent(component, opt);
		this.simpleBar.recalculate();
		return this;
	}

	getComponent() {
		this.simpleBar.getComponent().getComponent();
	}

	getSimpleBar() {
		return this.simpleBar && this.simpleBar.simplebar || null;
	}

	/**
	 * Sets the right corner button and click callback.
	 * @param {?function} onClick Callback function when clicked. If null, the button will be removed.
	 * @param {string} [icon] Icon to use for button. Defaults to 'close'
	 * @returns {this}
	 */
	setButton(onClick, icon) {
		this._onButtonClick = onClick || null;
		this.clickBtn.getNode('icon').setIcon(icon || 'chevron-circle-left');
		this._rootElem.getNode('btn').setComponent(onClick ? this.clickBtn : null);
		return this;
	}

	toggle(open, triggerOnToggle) {
		if (typeof open == 'undefined') {
			open = !this.open;
		}
		open = !!open;
		if (open === this.open) {
			return;
		}
		this.open = open;
		let cb = open ? 'removeClass' : 'addClass';
		this[cb]('panel--hide');

		if (this.getElement()) {
			if (open) {
				this._renderComponent();
			} else {
				if (this._instant) {
					this._onTransitionEnd();
				}
			}
		}

		if (triggerOnToggle !== false && this._onToggle) {
			this._onToggle(this, this.open);
		}
		return this;
	}

	_onTransitionEnd(e) {
		let el = this._rootElem.getNode('panel');
		if (el && (!e || e.target == el && e.propertyName == 'transform') && !this.open) {
			this._unrenderComponent();
		}
	}

	_onClick() {
		if (!this.open) {
			this.toggle(true);
		}
	}
}

export default Panel;
