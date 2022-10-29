import AvatarComponent from './AvatarComponent';
import './avatar.scss';

/**
 * Avatar is used to create char avatar and image components.
 */
class Avatar {

	constructor(app, params) {
		this.app = app;
		this.avatarPattern = params.avatarPattern || 'http://localhost:6452/core/char/avatar/{0}';
		this.charImgPattern = params.charImgPattern || 'http://localhost:6452/core/char/img/{0}';

		this.app.require([], this._init.bind(this));
	}

	_init(module) {}

	/**
	 * Creates a new avatar component instance
	 * @param {Model|object} char Char model or object. Should contain properties id, name, surname, and optionally avatar.
	 * @param {object} [opt] Optional parameters.
	 * @returns {Component} Avatar component.
	 */
	newAvatar(char, opt) {
		return new AvatarComponent(char, Object.assign({ pattern: this.avatarPattern }, opt));
	}

	newCharImg(char, opt) {
		return new AvatarComponent(char, Object.assign({
			pattern: this.charImgPattern,
			usePlaceholder: true,
			property: 'image'
		}, opt));
	}

	charImgHref(char) {
		return char.image ? this.charImgPattern.replace("{0}", char.image) : null;
	}

	avatarHref(char) {
		return char.avatar ? this.avatarPattern.replace("{0}", char.avatar) : null;
	}

}

export default Avatar;
