import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtCharLimitReached = l10n.l('createLimits.charLimitReached', "Character limit reached");
const txtCharLimitReachedBody = (maxOwnedChars) => l10n.l('createLimits.limitReachedBody', "You can only own {maxOwnedChars} characters.", { maxOwnedChars });
const txtBecomeSupporter = l10n.l('createLimits.becomeSupporter', "Become supporter");
const txtNevermind = l10n.l('createLimits.nervermind', "Nevermind");

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
						n.component(new Txt(txtCharLimitReachedBody(maxOwnedChars), { tagName: 'p' })),
						n.component(new Txt(l10n.l('createLimits.limitReachedSupporterLink', "By becoming a supporter, you can raise the cap to {supporterMaxOwnedChars} characters.", { supporterMaxOwnedChars }), { tagName: 'p' })),
					])),
					cancel: txtNevermind,
					size: 'wide',
				});
			} else {
				this.module.confirm.open(null, {
					title: txtCharLimitReached,
					body: l10n.l('createLimits.limitReachedBody2', "You've reached the limit of {maxOwnedChars} characters. Maybe it is time to prune some of them?", { maxOwnedChars }),
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
