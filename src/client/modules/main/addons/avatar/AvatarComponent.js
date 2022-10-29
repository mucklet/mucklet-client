import { isResError } from 'resclient';
import { ModelListener, ModelTxt } from 'modapp-resource-component';
import Fader from 'components/Fader';
import Img from 'components/Img';
import FAIcon from 'components/FAIcon';
import ImgModal from 'classes/ImgModal';

let defaultPattern = '/file/core/char/avatar/{0}';

// Get character initials.
function getInitials(c) {
	return c.name.charAt(0).toUpperCase() + c.surname.charAt(0).toUpperCase();
}

const sizeMap = {
	xlarge: '?thumb=xl',
	large: '?thumb=l',
	medium: '?thumb=m',
	small: '?thumb=s',
	tiny: '?thumb=m',
};

/**
 * AvatarComponent is a character avatar component.
 */
class AvatarComponent extends Fader {

	/**
	 * Creates an instance of AvatarComponent
	 * @param {object} profile Character or profile object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials in profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', or 'large.
	 * @param {string} [opt.pattern] URL pattern for the avatar. Should contain "{0}" to replace with the avatar ID.
	 * @param {string} [opt.property] Char property to get the image ID. Defaults to 'avatar'.
	 * @param {string} [opt.resolve] Resolves the image ID from the property. Defaults to v => v.
	 * @param {boolean} [opt.usePlaceholder] Flag if a placeholder image is to be used instead of initials. Defaults to false.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 */
	constructor(profile, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'avatar' + (opt.size ? ' avatar--' + opt.size : '') + (opt.className ? ' ' + opt.className : '');
		super(null, opt);
		this.char = opt.char || profile;
		this.saturation = opt.saturation || 0.5;
		this.lightness = opt.lightness || 0.33;
		this.pattern = opt.pattern || defaultPattern;
		this.property = opt.property || 'avatar';
		this.usePlaceholder = !!opt.usePlaceholder;
		this.modalOnClick = !!opt.modalOnClick;
		this.query = sizeMap[opt.size] || sizeMap['medium'];
		this.resolve = opt.resolve || (v => this.pattern.replace("{0}", v));
		this.isError = isResError(profile);

		this.ml = new ModelListener(profile, this, this._changeHandler.bind(this));
		this._setHue(this.char);
	}

	render(el) {
		let rel = super.render(el);
		this.ml.onRender();
		return rel;
	}

	unrender() {
		this.ml.onUnrender();
		super.unrender();
	}

	setChar(char) {
		this.char = char;
		this.ml.setModel(char);
		this._setHue(char);
		return this;
	}

	_changeHandler(m, c, change) {
		if (change && !change.hasOwnProperty(this.property)) return;

		let imageId = m ? m[this.property] : null;
		let src = imageId
			? this.resolve(imageId) + this.query
			: this.usePlaceholder
				? '/img/avatar-l.png'
				: null;

		c.setComponent(m
			? this.isError
				? new FAIcon('times')
				: src
					? new Img(src, this.modalOnClick && imageId ? {
						className: 'clickable',
						events: {
							click: c => {
								if (!c.hasClass('placeholder')) {
									new ImgModal(this.resolve(imageId)).open();
								}
							}
						}
					} : null)
					: new ModelTxt(this.char || m, m => getInitials(m), { tagName: 'span' })
			: null
		);
	}

	_setHue(char) {
		if (this.usePlaceholder) return;

		let h = 0;
		if (!this.isError) {
			let id = char ? char.id : '';
			for (let i = 0; i < id.length; i++) {
				h += id.charCodeAt(i);
			}
			h = h % 360;
		}

		this.setStyle('backgroundColor', 'hsl(' + h + ',' + Math.floor(this.saturation * 100) + '%,' + Math.floor(this.lightness * 100) + '%)');
		this.setStyle('color', 'hsl(' + h + ',' + Math.floor(this.saturation * 100) + '%, 10%)');
	}
}

export default AvatarComponent;
export function setPattern(pattern) {
	defaultPattern = pattern;
}
