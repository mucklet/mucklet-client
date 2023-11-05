import { RootElem } from 'modapp-base-component';

const customIcons = {
	upstairs: true,
	downstairs: true,
};

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
		opt.attributes = Object.assign({ 'aria-hidden': 'true' }, opt.attributes);
		super('i', opt);
		this.icon = "";
		this.custom = false;
		this.setIcon(icon);
	}

	/**
	 * Sets icon
	 * @param {string} icon Font-awesome icon name (eg. 'envelope').
	 * @returns {this}
	 */
	setIcon(icon) {
		icon = String(icon || "");
		if (icon == this.icon) {
			return;
		}

		let custom = !!customIcons[icon];

		if (this.icon) {
			if (this.custom) {
				this.removeClass('muicon-' + this.icon);
				if (!custom) {
					this.removeClass('faicon-custom');
				}
			} else {
				this.removeClass('fa-' + this.icon);
				if (custom) {
					this.removeClass('fa');
				}
			}
		}
		if (icon) {
			if (custom) {
				this.addClass('faicon-custom');
				this.addClass('muicon-' + icon);
			} else {
				this.addClass('fa');
				this.addClass('fa-' + icon);
			}
		}
		this.icon = icon;
		this.custom = custom;
		return this;
	}
}

export default FAIcon;
