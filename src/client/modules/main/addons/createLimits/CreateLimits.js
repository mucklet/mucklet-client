import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatByteSize from 'utils/formatByteSize';

const txtBecomeSupporter = l10n.l('createLimits.becomeSupporter', "Become supporter");
const txtNevermind = l10n.l('createLimits.nervermind', "Nevermind");
const txtCharLimitReached = l10n.l('createLimits.charLimitReached', "Character limit reached");
const txtCharProfileLimitReachedPrune = (maxCharProfiles) => l10n.l('createLimits.charProfileLimitReachedPrune', "You've reached the limit of {maxCharProfiles} profiles. Maybe it is time to prune some of them?", { maxCharProfiles });
const txtProfileLimitReached = l10n.l('createLimits.profileLimitReached', "Profile limit reached");
const txtRoomProfileLimitReachedPrune = (maxRoomProfiles) => l10n.l('createLimits.roomProfileLimitReachedPrune', "You've reached the limit of {maxRoomProfiles} profiles. Maybe it is time to prune some of them?", { maxRoomProfiles });
const txtImageTooLarge = l10n.l('createLimits.imageTooLarge', "Image too large");
const txtImageTooLargeResize = (size) => l10n.l('createLimits.imageTooLargeResize', "The max size of an image is {maxSize}. Maybe you can make it a bit smaller by resizing it?", { maxSize: formatByteSize(size) });
const accountOverviewUrl = HUB_PATH + 'account#overview';

/**
 * CreateLimits provides methods for validating if the player can create more
 * chars, rooms, or other entities.
 */
class CreateLimits {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._redirectToAccount = this._redirectToAccount.bind(this);

		this.app.require([
			'info',
			'confirm',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.coreInfo = this.module.info.getCore();
	}

	/**
	 * Validates that owned chars is not at its limit, and that a new character
	 * can be created. If limit is reached, a confirm dialog will be opened to
	 * inform the player. Must not be called prior to being logged in.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateOwnedChars(cb) {
		this._limitSelector(
			this.module.player.getChars().length,
			this.coreInfo.maxOwnedChars,
			this.coreInfo.adminMaxOwnedChars,
			this.coreInfo.supporterMaxOwnedChars,
			// On limit reached
			(maxOwnedChars) => this.module.confirm.open(null, {
				title: txtCharLimitReached,
				body: l10n.l('createLimits.charLimitReachedBody2', "You've reached the limit of {maxOwnedChars} characters. Maybe it is time to prune some of them?", { maxOwnedChars }),
				cancel: null,
			}),
			// On promote supporter
			(maxOwnedChars, supporterMaxOwnedChars) => this.module.confirm.open(() => this._redirectToAccount(), {
				title: txtCharLimitReached,
				confirm: txtBecomeSupporter,
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('createLimits.charLimitReachedBody', "You can only own {maxOwnedChars} characters.", { maxOwnedChars }), { tagName: 'p' })),
					n.component(new Txt(l10n.l('createLimits.charLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxOwnedChars} characters.", { supporterMaxOwnedChars }), { tagName: 'p' })),
				])),
				cancel: txtNevermind,
				size: 'wide',
			}),
			// On limit not reached
			cb,
		);
	}

	/**
	 * Validates that char profiles is not at its limit, and that a new profile
	 * can be created. If limit is reached, a confirm dialog will be opened to
	 * inform the player.
	 * @param {Model} ctrl Controlled character model.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateCharProfiles(ctrl, cb) {
		this._limitSelector(
			ctrl.profiles.length,
			this.coreInfo.maxCharProfiles,
			this.coreInfo.adminMaxCharProfiles,
			this.coreInfo.supporterMaxCharProfiles,
			// On limit reached
			(maxCharProfiles) => this.module.confirm.open(null, {
				title: txtProfileLimitReached,
				body: txtCharProfileLimitReachedPrune(maxCharProfiles),
				cancel: null,
			}),
			// On promote supporter
			(maxCharProfiles, supporterMaxCharProfiles) => this.module.confirm.open(() => this._redirectToAccount(), {
				title: txtProfileLimitReached,
				confirm: txtBecomeSupporter,
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('createLimits.profileLimitReachedBody', "You can only have {maxCharProfiles} profiles per character.", { maxCharProfiles }), { tagName: 'p' })),
					n.component(new Txt(l10n.l('createLimits.profileLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxCharProfiles} profiles.", { supporterMaxCharProfiles }), { tagName: 'p' })),
				])),
				cancel: txtNevermind,
				size: 'wide',
			}),
			// On limit not reached
			cb,
		);
	}

	/**
	 * Get a promise to a room profiles error component.
	 * @param {Model} ctrl Controlled character model.
	 * @param {*} opt Optional parameters for the component.
	 * @returns {Promise.<Component>} Promise of a error message component, or null if no error.
	 */
	getCharProfilesError(ctrl, opt) {
		return this._limitSelector(
			ctrl.profiles.length,
			this.coreInfo.maxCharProfiles,
			this.coreInfo.adminMaxCharProfiles,
			this.coreInfo.supporterMaxCharProfiles,
			// On limit reached
			(maxCharProfiles) => new Html(txtCharProfileLimitReachedPrune(maxCharProfiles), opt),
			// On promote supporter
			(maxCharProfiles, supporterMaxCharProfiles) => new Html(l10n.l('createLimit.maxCharProfilesPromote', `You can only have {maxCharProfiles} profiles. By <a href="{url}" class="link" target="_blank">becoming a supporter</a>, you can raise the cap to {supporterMaxCharProfiles} profiles.`, { maxCharProfiles, supporterMaxCharProfiles, url: escapeHtml(accountOverviewUrl) }), opt),
		);
	}

	/**
	 * Validates that room profiles is not at its limit, and that a new profile
	 * can be created. If limit is reached, a confirm dialog will be opened to
	 * inform the player.
	 * @param {Collection} profiles Room profiles collection.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateRoomProfiles(profiles, cb) {
		this._limitSelector(
			profiles.length,
			this.coreInfo.maxRoomProfiles,
			this.coreInfo.adminMaxRoomProfiles,
			this.coreInfo.supporterMaxRoomProfiles,
			// On limit reached
			(maxRoomProfiles) => this.module.confirm.open(null, {
				title: txtProfileLimitReached,
				body: txtRoomProfileLimitReachedPrune(maxRoomProfiles),
				cancel: null,
			}),
			// On promote supporter
			(maxRoomProfiles, supporterMaxRoomProfiles) => this.module.confirm.open(() => this._redirectToAccount(), {
				title: txtProfileLimitReached,
				confirm: txtBecomeSupporter,
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedBody', "You can only have {maxRoomProfiles} profiles per room.", { maxRoomProfiles }), { tagName: 'p' })),
					n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxRoomProfiles} profiles.", { supporterMaxRoomProfiles }), { tagName: 'p' })),
				])),
				cancel: txtNevermind,
				size: 'wide',
			}),
			// On limit not reached
			cb,
		);
	}

	/**
	 * Get a promise to a room profiles error component.
	 * @param {Collection} profiles Room profiles collection.
	 * @param {*} opt Optional parameters for the component.
	 * @returns {Promise.<Component>} Promise of a error message component, or null if no error.
	 */
	getRoomProfilesError(profiles, opt) {
		return this._limitSelector(
			profiles.length,
			this.coreInfo.maxRoomProfiles,
			this.coreInfo.adminMaxRoomProfiles,
			this.coreInfo.supporterMaxRoomProfiles,
			// On limit reached
			(maxRoomProfiles) => new Html(txtRoomProfileLimitReachedPrune(maxRoomProfiles), opt),
			// On promote supporter
			(maxRoomProfiles, supporterMaxRoomProfiles) => new Html(l10n.l('createLimit.maxRoomProfilesPromote', `You can only have {maxRoomProfiles} profiles. By <a href="{url}" class="link" target="_blank">becoming a supporter</a>, you can raise the cap to {supporterMaxRoomProfiles} profiles.`, { maxRoomProfiles, supporterMaxRoomProfiles, url: escapeHtml(accountOverviewUrl) }), opt),
		);
	}

	/**
	 * Validates that the image file size is not exceeding the upload limits. If
	 * limit is reached, a confirm dialog will be opened to inform the player.
	 * @param {number} size File size in bytes.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateImageSize(size, cb) {
		this._limitSelector(
			size,
			this.coreInfo.maxImageSize,
			this.coreInfo.maxImageSize,
			this.coreInfo.supporterMaxImageSize,
			// On limit reached
			(maxImageSize) => this.module.confirm.open(null, {
				title: txtImageTooLarge,
				body: txtImageTooLargeResize(maxImageSize),
				cancel: null,
			}),
			// On promote supporter
			(maxImageSize, supporterMaxImageSize) => this.module.confirm.open(() => this._redirectToAccount(), {
				title: txtImageTooLarge,
				confirm: txtBecomeSupporter,
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedBody', "The max size of an image is {maxSize}.", { maxSize: formatByteSize(maxImageSize) }), { tagName: 'p' })),
					n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedSupporterLink', "By becoming a supporter, you can increase the image max size to {supporterMaxSize}.", { supporterMaxSize: formatByteSize(supporterMaxImageSize) }), { tagName: 'p' })),
				])),
				cancel: txtNevermind,
				size: 'wide',
			}),
			// On limit not reached
			cb,
			true,
		);
	}

	_limitSelector(count, all, admin, supporter, onMax, onPromote, onProceed, inclusive = false) {
		let playerMod = this.module.player;
		let max = Math.max(
			all,
			playerMod.hasAnyRole('admin') || playerMod.hasAnyIdRole('overseer') ? admin : 0,
			playerMod.hasAnyIdRole('overseer', 'pioneer', 'supporter') ? supporter : 0,
		);
		if (inclusive ? max < count : max <= count) {
			if (inclusive ? supporter >= max && supporter >= count : supporter > max && supporter > count) {
				return onPromote(max, supporter);
			}
			return onMax(max);
		}
		return onProceed && onProceed() || null;
	}

	_redirectToAccount() {
		window.open(accountOverviewUrl, '_blank');
	}

	dispose() {}
}

export default CreateLimits;
