import AvatarComponent from './AvatarComponent';
import './avatar.scss';

/**
 * Avatar is used to create char avatar and image components.
 */
class Avatar {

	constructor(app, params) {
		this.app = app;
		let apiFilePath = app.props.apiFilePath;
		this.avatarPattern = apiFilePath + 'core/char/avatar/{0}';
		this.charImgPattern = apiFilePath + 'core/char/img/{0}';
		this.roomImgPattern = apiFilePath + 'core/room/img/{0}';

		this.app.require([], this._init.bind(this));
	}

	_init(module) {}

	/**
	 * Creates a new avatar component instance
	 * @param {Model|object} char Char or profile model or object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials in profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', 'large', or 'xlarge'.
	 * @param {string} [opt.property] Char property to get the image ID. Defaults to 'avatar'.
	 * @param {string} [opt.resolve] Resolves the image ID from the property. Defaults to v => v.
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar', 'room', or 'area'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @returns {Component} Avatar component.
	 */
	newAvatar(char, opt) {
		return new AvatarComponent(char, Object.assign({ pattern: this.avatarPattern }, opt));
	}

	/**
	 * Creates a new avatar component instance for char images.
	 * @param {Model|object} char Char or profile model or object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials in profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', 'large', or 'xlarge'.
	 * @param {string} [opt.property] Char property to get the image ID. Defaults to 'image'.
	 * @param {string} [opt.resolve] Resolves the image ID from the property. Defaults to v => v.
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar'. Defaults to 'avatar'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @returns {Component} Avatar component.
	 */
	newCharImg(char, opt) {
		return new AvatarComponent(char, Object.assign({
			pattern: this.charImgPattern,
			placeholder: 'avatar',
			property: 'image',
		}, opt));
	}

	/**
	 * Creates a new avatar component instance for room images.
	 * @param {Model|object} room Room or profile model or object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials in profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', 'large', or 'xlarge'.
	 * @param {string} [opt.property] Char property to get the image ID. Defaults to 'room'.
	 * @param {string} [opt.resolve] Resolves the image ID from the property. Defaults to v => v.
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar'. Defaults to 'avatar'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @returns {Component} Avatar component.
	 */
	newRoomImg(room, opt) {
		return new AvatarComponent(room, Object.assign({
			pattern: this.roomImgPattern,
			placeholder: 'room',
			property: 'image',
		}, opt));
	}

	charImgHref(char) {
		return char.image ? this.charImgPattern.replace("{0}", char.image) : null;
	}

	avatarHref(char) {
		return char.avatar ? this.avatarPattern.replace("{0}", char.avatar) : null;
	}

	roomImgHref(room) {
		return room.image ? this.roomImgPattern.replace("{0}", room.image) : null;
	}

}

export default Avatar;
