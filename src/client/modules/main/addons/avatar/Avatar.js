import AvatarComponent from './AvatarComponent';
import './avatar.scss';

/**
 * Avatar is used to create char avatar and image components.
 */
class Avatar {

	constructor(app, params) {
		this.app = app;
		let apiFilePath = app.props.apiFilePath;
		this.avatarPattern = (v) => apiFilePath + 'core/char/avatar/' + v;
		this.charImgPattern = (v) => apiFilePath + 'core/char/img/' + v;
		this.roomImgPattern = (v) => apiFilePath + 'core/room/img/' + v;

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
	 * @param {boolean} [opt.initials] Use initials if no image is available. Defaults to true.
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar', 'room', or 'area'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @param {(v: any) => string} [opt.resolve] Resolves the image href from the image property.
	 * @returns {Component} Avatar component.
	 */
	newAvatar(char, opt) {
		return new AvatarComponent(char, Object.assign({
			resolve: this.avatarPattern,
			placeholder: 'avatar',
			initials: true,
		}, opt));
	}

	/**
	 * Creates a new avatar component instance for char images.
	 * @param {Model|object} char Char or profile model or object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.char] Character object used to fetch initials in profile is not a character.
	 * @param {string} [opt.size] Avatar size. May be 'small', 'medium', 'large', or 'xlarge'.
	 * @param {string} [opt.property] Char property to get the image ID. Defaults to 'image'.
	 * @param {boolean} [opt.initials] Use initials if no image is available. Defaults to false.
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar'. Defaults to 'avatar'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @param {(v: any) => string} [opt.resolve] Resolves the image href from the image property.
	 * @returns {Component} Avatar component.
	 */
	newCharImg(char, opt) {
		return new AvatarComponent(char, Object.assign({
			resolve: this.charImgPattern,
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
	 * @param {string} [opt.placeholder] Placeholder image to use instead of initials. May be 'avatar'. Defaults to 'avatar'.
	 * @param {boolean} [opt.modalOnClick] Flag if clicking on the image should show the full image in a modal.
	 * @param {(v: any) => string} [opt.resolve] Resolves the image href from the image property.
	 * @returns {Component} Avatar component.
	 */
	newRoomImg(room, opt) {
		return new AvatarComponent(room, Object.assign({
			resolve: this.roomImgPattern,
			placeholder: 'room',
			property: 'image',
		}, opt));
	}

	charImgHref(char) {
		return char.image ? this.charImgPattern(char.image) : null;
	}

	avatarHref(char) {
		return char.avatar ? this.avatarPattern(char.avatar) : null;
	}

	roomImgHref(room) {
		return room.image ? this.roomImgPattern(room.image) : null;
	}

}

export default Avatar;
