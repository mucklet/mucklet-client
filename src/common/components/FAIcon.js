import { RootElem } from 'modapp-base-component';

/**
 * FAIcon is a font-awesome icon.
 */
class FAIcon extends RootElem {

	/**
	 * Creates an instance of FAIcon
	 * @param {string} icon Font-awesome icon name (eg. 'envelope').
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 */
	constructor(icon, opt) {
		opt = Object.assign({ attributes: null }, opt);
		icon = String(icon || "");
		opt.className = 'fa fa-' + icon + (opt.className ? ' ' + opt.className : '');
		opt.attributes = Object.assign({ 'aria-hidden': 'true' }, opt.attributes);
		super('i', opt);
		this.icon = icon;
	}

	/**
	 * Sets icon
	 * @param {string} icon Font-awesome icon name (eg. 'envelope').
	 * @returns {this}
	 */
	setIcon(icon) {
		icon = String(icon || "");
		if (icon != this.icon) {
			this.removeClass('fa-' + this.icon);
			this.addClass('fa-' + icon);
			this.icon = icon;
		}
		return this;
	}
}

export default FAIcon;
