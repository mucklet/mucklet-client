import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtBecomeSupporter = l10n.l('createLimits.becomeSupporter', "Become supporter");
const txtNevermind = l10n.l('createLimits.nervermind', "Nevermind");
const txtCharLimitReached = l10n.l('createLimits.charLimitReached', "Character limit reached");
const txtProfileLimitReached = l10n.l('createLimits.profileLimitReached', "Profile limit reached");

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
		let playerMod = this.module.player;
		let supporterMaxOwnedChars = this.coreInfo.supporterMaxOwnedChars;
		let maxOwnedChars = Math.max(
			this.coreInfo.maxOwnedChars,
			playerMod.hasAnyRole('admin') || playerMod.hasAnyIdRole('overseer') ? this.coreInfo.adminMaxOwnedChars : 0,
			playerMod.hasAnyIdRole('overseer', 'pioneer', 'supporter') ? supporterMaxOwnedChars : 0,
		);
		let ownedChars = playerMod.getChars().length;
		if (maxOwnedChars <= ownedChars) {
			// Check if we should show supporter message
			if (supporterMaxOwnedChars > maxOwnedChars && supporterMaxOwnedChars > ownedChars) {
				this.module.confirm.open(() => this._redirectToAccount(), {
					title: txtCharLimitReached,
					confirm: txtBecomeSupporter,
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('createLimits.charLimitReachedBody', "You can only own {maxOwnedChars} characters.", { maxOwnedChars }), { tagName: 'p' })),
						n.component(new Txt(l10n.l('createLimits.charLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxOwnedChars} characters.", { supporterMaxOwnedChars }), { tagName: 'p' })),
					])),
					cancel: txtNevermind,
					size: 'wide',
				});
			} else {
				this.module.confirm.open(null, {
					title: txtCharLimitReached,
					body: l10n.l('createLimits.charLimitReachedBody2', "You've reached the limit of {maxOwnedChars} characters. Maybe it is time to prune some of them?", { maxOwnedChars }),
					cancel: null,
				});
			}
			return;
		}

		cb();
	}

	/**
	 * Validates that char profiles is not at its limit, and that a new profile
	 * can be created. If limit is reached, a confirm dialog will be opened to
	 * inform the player.
	 * @param {Model} ctrl Controlled character model.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateCharProfiles(ctrl, cb) {
		let playerMod = this.module.player;
		let supporterMaxCharProfiles = this.coreInfo.supporterMaxCharProfiles;
		let maxCharProfiles = Math.max(
			this.coreInfo.maxCharProfiles,
			playerMod.hasAnyRole('admin') || playerMod.hasAnyIdRole('overseer') ? this.coreInfo.adminMaxCharProfiles : 0,
			playerMod.hasAnyIdRole('overseer', 'pioneer', 'supporter') ? supporterMaxCharProfiles : 0,
		);
		let charProfiles = ctrl.profiles.length;
		if (maxCharProfiles <= charProfiles) {
			// Check if we should show supporter message
			if (supporterMaxCharProfiles > maxCharProfiles && supporterMaxCharProfiles > charProfiles) {
				this.module.confirm.open(() => this._redirectToAccount(), {
					title: txtProfileLimitReached,
					confirm: txtBecomeSupporter,
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('createLimits.profileLimitReachedBody', "You can only have {maxCharProfiles} profiles per character.", { maxCharProfiles }), { tagName: 'p' })),
						n.component(new Txt(l10n.l('createLimits.profileLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxCharProfiles} profiles.", { supporterMaxCharProfiles }), { tagName: 'p' })),
					])),
					cancel: txtNevermind,
					size: 'wide',
				});
			} else {
				this.module.confirm.open(null, {
					title: txtProfileLimitReached,
					body: l10n.l('createLimits.profileLimitReachedBody2', "You've reached the limit of {maxCharProfiles} profiles. Maybe it is time to prune some of them?", { maxCharProfiles }),
					cancel: null,
				});
			}
			return;
		}

		cb();
	}

	/**
	 * Validates that char profiles is not at its limit, and that a new profile
	 * can be created. If limit is reached, a confirm dialog will be opened to
	 * inform the player.
	 * @param {Collection} profiles Room profiles collection.
	 * @param {function} cb Callback called if limit is not reached.
	 */
	validateRoomProfiles(profiles, cb) {
		let playerMod = this.module.player;
		let supporterMaxRoomProfiles = this.coreInfo.supporterMaxRoomProfiles;
		let maxRoomProfiles = Math.max(
			this.coreInfo.maxRoomProfiles,
			playerMod.hasAnyRole('admin') || playerMod.hasAnyIdRole('overseer') ? this.coreInfo.adminMaxRoomProfiles : 0,
			playerMod.hasAnyIdRole('overseer', 'pioneer', 'supporter') ? supporterMaxRoomProfiles : 0,
		);
		let roomProfiles = profiles.length;
		if (maxRoomProfiles <= roomProfiles) {
			// Check if we should show supporter message
			if (supporterMaxRoomProfiles > maxRoomProfiles && supporterMaxRoomProfiles > roomProfiles) {
				this.module.confirm.open(() => this._redirectToAccount(), {
					title: txtProfileLimitReached,
					confirm: txtBecomeSupporter,
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedBody', "You can only have {maxRoomProfiles} profiles per room.", { maxRoomProfiles }), { tagName: 'p' })),
						n.component(new Txt(l10n.l('createLimits.roomProfileLimitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxRoomProfiles} profiles.", { supporterMaxRoomProfiles }), { tagName: 'p' })),
					])),
					cancel: txtNevermind,
					size: 'wide',
				});
			} else {
				this.module.confirm.open(null, {
					title: txtProfileLimitReached,
					body: l10n.l('createLimits.roomProfileLimitReachedBody2', "You've reached the limit of {maxRoomProfiles} profiles. Maybe it is time to prune some of them?", { maxRoomProfiles }),
					cancel: null,
				});
			}
			return;
		}

		cb();
	}

	_redirectToAccount() {
		window.open(accountOverviewUrl, '_blank');
	}

	dispose() {}
}

export default CreateLimits;
