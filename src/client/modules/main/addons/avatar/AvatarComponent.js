import { isResError } from 'resclient';
import { ModelListener, ModelTxt } from 'modapp-resource-component';
import Fader from 'components/Fader';
import Img from 'components/Img';
import ImgModal from 'classes/ImgModal';
import { relistenResource } from 'utils/listenResource';

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

const placeholderMap = {
	avatar: { img: '/img/avatar-l.png', err: '/img/avatar-error-l.png' },
	room: { img: '/img/room-l.png', err: '/img/room-error-l.png' },
	area: { img: '/img/area-l.png', err: '/img/area-error-l.png' },
};

function getHref(v) {
	return v.href;
}

/**
 * AvatarComponent is a character avatar component.
 */
class AvatarComponent extends Fader {

	/**
	 * Creates an instance of AvatarComponent
	 * @param {object} profile Character or profile object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials if profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', or 'large.
	 * @param {string} [opt.property] Char property to get the image object or ID. Defaults to 'avatar'.
	 * @param {boolean} [opt.initials] Use initials if no image is available. Defaults to false.
	 * @param {(v: object) => string} [opt.resolve] Resolves the image href from the image property. Defaults to: (v) => v?.href
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar', 'room', or 'area'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 */
	constructor(profile, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'avatar' + (opt.size ? ' avatar--' + opt.size : '') + (opt.className ? ' ' + opt.className : '');
		super(null, opt);
		this.char = opt.char || profile;
		this.saturation = opt.saturation || 0.5;
		this.lightness = opt.lightness || 0.33;
		this.property = opt.property || 'avatar';
		this.initials = !!opt.initials;
		this.placeholder = (opt.placeholder && placeholderMap[opt.placeholder]) || null;
		this.modalOnClick = !!opt.modalOnClick;
		this.query = sizeMap[opt.size] || sizeMap['medium'];
		this.resolve = opt.resolve || getHref;
		this.isError = isResError(profile);
		this.model = null;

		this._update = this._update.bind(this);
		this.ml = new ModelListener(profile, this, this._changeHandler.bind(this));
	}

	render(el) {
		let rel = super.render(el);
		this.ml.onRender();
		return rel;
	}

	unrender() {
		this.model = relistenResource(this.model, null, this._update);
		this.ml.onUnrender();
		super.unrender();
	}

	setChar(char) {
		this.char = char;
		this.ml.setModel(char);
		return this;
	}

	_changeHandler(m, c, change) {
		if (!change || change.hasOwnProperty(this.property)) {
			this._update();
		}
	}

	_update() {
		let src = null;
		let isError = this.isError;
		let m = this.ml.getModel();
		if (!isError) {
			let v = m?.[this.property] || null;
			if (v) {
				this.model = relistenResource(this.model, v, this._update);
				src = this.resolve(v);
				isError = !src || v?.deleted;
			}
		}

		this.setComponent(isError || !(src || this.initials)
			? this.placeholder
				? new Img(isError ? this.placeholder.err : this.placeholder.img)
				: null
			: src
				? new Img(src + this.query, this.modalOnClick ? {
					className: 'clickable',
					errorPlaceholder: this.placeholder.err,
					errorClassName: 'avatar--error',
					events: {
						click: c => {
							if (!c.hasClass('avatar--error')) {
								new ImgModal(src).open();
							}
						},
					},
				} : {
					errorPlaceholder: this.placeholder.err,
				})
				: new ModelTxt(this.char || m, m => getInitials(m), { tagName: 'span' }),
		);
		if (isError || src || !this.initials) {
			this._clearHue();
		} else {
			this._setHue(this.char);
		}
	}

	_clearHue() {
		if (this.initials) return;
		this.setStyle('backgroundColor', null);
		this.setStyle('color', null);
	}

	_setHue(char) {
		if (!this.initials) return;

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
