import { RootElem, Txt, Html } from 'modapp-base-component';
import Collapser from './Collapser';
import Fader from './Fader';
import FAIcon from './FAIcon';
import PopupTip from './PopupTip';
import './panelSection.scss';
import isComponent from 'utils/isComponent';

import './panelSection.scss';

/**
 * PanelSection is component with a header and collapsable content.
 */
class PanelSection extends RootElem {

	/**
	 * Creates an instance of PanelSection
	 * @param {string|LocaleString} title Title text.
	 * @param {?Component} component Content component.
	 * @param {object} [opt] Optional parameters.
	 * @param {number} [opt.duration] Optional transition duration in milliseconds.
	 * @param {boolean} [opt.open] Optional flag to set initial open state. Default is true.
	 * @param {function} [opt.onToggle] Optional callback function called whenever the section is toggled.
	 * @param {boolean} [opt.noToggle] Optional flag if toggle caret should be disabled.
	 * @param {string|LocaleString} [opt.popupTip] Optional popup tip info message.
	 * @param {string} [opt.popupTipPosition] Optional popup tip position. Defaults to 'left'.
	 * @param {string|LocaleString} [opt.popupTipClassName] Class name to add to the popup tip. Defaults to 'popuptip--width-m'.
	 * @param {boolean} [opt.required] Optional flag if a 'required-asterisk should be appended to the title.
	 * @param {Component} [opt.infoComponent] Optional info component to show right aligned, but left of tool tip.
	 */
	constructor(title, component, opt) {
		super(null);
		opt = Object.assign({}, opt);
		opt.className = 'panelsection' + (opt.className ? ' ' + opt.className : '') + (opt.noToggle ? ' notoggle' : '');
		this.title = new Txt("", { tagName: 'h3' });
		super.setRootNode(n => n.elem('div', opt, [
			n.elem('div', { className: 'panelsection--head', events: opt.noToggle ? null : { click: () => this.toggle() }}, [
				n.component('title', new Fader(null, { className: 'panelsection--title' })),
				n.component('required', new Html("", { className: 'panelsection--required' })),
				...(opt.infoComponent
					? [ n.component(opt.infoComponent) ]
					: []
				),
				...(opt.popupTip
					? [
						n.component(new PopupTip(opt.popupTip, {
							className: 'panelsection--popuptip ' + (opt.popupTipClassName || 'popuptip--width-m'),
							position: opt.popupTipPosition || 'left',
						})),
					]
					: []
				),
				...(opt.noToggle
					? []
					: [ n.component(new FAIcon('caret-right', { className: 'panelsection--caret' })) ]
				),
			]),
			n.component('content', new Collapser(null, { className: 'panelsection--content', duration: opt.duration })),
		]));

		this._onToggle = opt.onToggle;
		this.setTitle(title)
			.setComponent(component)
			.setRequired(!!opt.required)
			.toggle(opt.open !== false, false);
	}

	/**
	 * Get section open state.
	 * @returns {boolean} True if open, otherwise false.
	 */
	isOpen() {
		return this._open;
	}

	/**
	 * Sets the title text.
	 * @param {string|LocaleString|Component} title Title text or component.
	 * @returns {this}
	 */
	setTitle(title) {
		let n = this._rootElem.getNode('title');
		if (isComponent(title)) {
			n.setComponent(title);
		} else {
			this.title.setText(title);
			n.setComponent(this.title);
		}
		return this;
	}

	/**
	 * Sets the required flag.
	 * @param {*} isRequired Flag if the required asterisk should be appended tp the title.
	 * @returns {this}
	 */
	setRequired(isRequired) {
		let n = this._rootElem.getNode('required');
		n.setHtml(isRequired ? "&nbsp;*" : "");
		return this;
	}

	/**
	 * Gets the current title.
	 * @returns {string|LocaleString|Component} Title text or component.
	 */
	getTitle() {
		let c = this._rootElem.getNode('title');
		return c == this.title ? c.getText() : c;
	}

	/**
	 * Sets the content component.
	 * @param {Component|Promise.<Component>} component Content component or promise of a component.
	 * @returns {this}
	 */
	setComponent(component) {
		// I we get something other than a promise.
		if (!component || isComponent(component)) {
			return this._setComponent(component);
		}

		let promise = Promise.resolve(component).then(c => {
			if (promise !== this._promise) return;
			this._promise = null;
			this._setComponent(c);
		});
		this._promise = promise;
		return this;
	}

	_setComponent(c) {
		this.component = c || null;
		if (this._open) {
			this._rootElem.getNode('content').setComponent(this.component);
		};
		return this;
	}

	/**
	 * Gets the current content.
	 * @returns {?Component} Set content component.
	 */
	getComponent() {
		return this.component;
	}

	/**
	 * Toggles section between open and close.
	 * @param {boolean} [open] Optional open state to set. If undefined, open state will be toggled.
	 * @param {function} [triggerOnToggle] Flag if this toggle should trigger the onToggle callback. Defaults to true.
	 * @returns {this}
	 */
	toggle(open, triggerOnToggle) {
		if (typeof open == 'undefined') {
			open = !this._open;
		}
		open = !!open;
		if (open === this._open) return;
		this._open = open;
		this._rootElem[this._open ? 'addClass' : 'removeClass']('open');
		this._rootElem.getNode('content').setComponent(this._open ? this.component : null);
		if (triggerOnToggle !== false && this._onToggle) {
			this._onToggle(this, this._open);
		}
		return this;
	}
}

export default PanelSection;
