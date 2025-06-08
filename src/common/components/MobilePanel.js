import { RootElem, Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import SimpleBar from 'components/SimpleBar';
import isComponent from 'utils/isComponent';
import nextFrame from 'utils/nextFrame';

import './mobilePanel.scss';

/**
 * MobilePanel is component wrapper that can slide away to the left or right
 */
class MobilePanel extends RootElem {

	/**
	 * Creates an instance of MobilePanel
	 * @param {string|LocaleString|Component} title MobilePanel title.
	 * @param {?Component} component Component to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.align] MobilePanel alignment; "right", "left". Defaults to "left".
	 * @param {boolean} [opt.closed] Flag to tell if the panel should start as closed.
	 * @param {function} [opt.onClose] Optional callback function called whenever the panel is closed.
	 * @param {function} [opt.onClick] Optional callback function called whenever the top-right button is clicked. Button will be hidden if null.
	 * @param {function} [opt.clickIcon] Optional icon to use for the top-right button. Defaults to 'close'.
	 * @param {function} [opt.subheaderComponent] Optional subheader component.
	 */
	constructor(title, component, opt) {
		opt = Object.assign({ align: "left" }, opt);
		opt.className = 'mobilepanel mobilepanel--align-' + opt.align + (opt.className ? ' ' + opt.className : '');
		super('div', { className: 'mobilepanel--container' });

		// Set options
		this._alignLeft = opt.align != 'right';
		this._onClose = opt.onClose;
		this._onButtonClick = opt.onClick || null;
		this._subheaderComponent = opt.subheaderComponent || null;

		// Additional components
		this.titleFader = new Fader(null, { className: 'mobilepanel--title' });
		this.titleTxt = new Txt("", { tagName: 'h3', className: 'mobilepanel--titletxt' });
		this.simpleBar = new SimpleBar(new Fader(null), { className: 'mobilepanel--content' });
		// Click button is the corner button that can be clicked for an action.
		this.clickBtn = new Elem(n => n.elem('button', {
			className: 'mobilepanel--btn iconbtn medium',
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
		this.rendered = false;

		// Main component
		this.component = new Elem(n => n.elem('div', opt, [
			n.elem('headercont', 'div', { className: 'mobilepanel--headercont' }, [
				n.elem('div', { className: 'mobilepanel--header' }, [
					n.elem('button', {
						className: 'mobilepanel--toggle iconbtn medium',
						events: {
							click: (c, e) => {
								this.toggle();
								e.stopPropagation();
							},
						},
					}, [
						n.component(new FAIcon(this._alignLeft ? 'caret-left' : 'caret-right')),
					]),
					n.component('btn', new Fader(null, { className: 'mobilepanel--btncont' })),
					n.component(this.titleFader),
				]),
			]),
			n.elem('content', 'div', { className: 'mobilepanel--main' }, [
				n.component(this.simpleBar),
			]),
		]));

		// Bind callbacks
		this._onTransitionEnd = this._onTransitionEnd.bind(this);

		this.setTitle(title)
			.setComponent(component)
			.setButton(opt.onClick || null, opt.clickIcon)
			.toggle(!opt.closed, false);
	}

	render(el) {
		let e = super.render(el);
		if (this.open) {
			this._renderComponent();
		} else {
			this._unrenderComponent();
		}

		e.addEventListener('transitionend', this._onTransitionEnd);
		return e;
	}

	unrender() {
		let e = this.getElement();
		if (e) {
			e.removeEventListener('transitionend', this._onTransitionEnd);
			this._unrenderComponent();
			super.unrender();
			this.removeClass('mobilepanel--hide');
		}
	}

	_renderComponent(animated) {
		if (!this.rendered) {
			let el = this.getElement();
			this.component.render(el);
			if (this._subheaderComponent) {
				this._subheaderComponent.render(this.component.getNode('headercont'));
			}
			this.removeClass('mobilepanel--hidden');
			this.rendered = true;
		}
	}

	_unrenderComponent() {
		if (this.rendered) {
			if (this._subheaderComponent) {
				this._subheaderComponent.unrender();
			}
			this.component.unrender();
			this.rendered = false;
		}
		this.addClass('mobilepanel--hidden');
	}

	/**
	 * Sets the title.
	 * @param {string|LocaleString|Component} title MobilePanel title.
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
		this.component.getNode('btn').setComponent(onClick ? this.clickBtn : null);
		return this;
	}

	toggle(open) {
		if (typeof open == 'undefined') {
			open = !this.open;
		}
		open = !!open;
		if (open === this.open) {
			return;
		}
		this.open = open;

		if (this.getElement()) {
			if (open) {
				this.addClass('mobilepanel--hide');
				this._renderComponent();
			}
		}

		nextFrame(() => {
			if (this.getElement()) {
				let cb = open ? 'removeClass' : 'addClass';
				this[cb]('mobilepanel--hide');
			}
		});

		if (!open && this._onClose) {
			this._onClose(this);
		}
		return this;
	}

	_onTransitionEnd(e) {
		let el = this.component.getElement();
		if (el && (!e || e.target == el && e.propertyName == 'transform') && !this.open) {
			this._unrenderComponent();
		}
	}
}

export default MobilePanel;
