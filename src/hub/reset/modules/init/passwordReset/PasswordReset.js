import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import { uri } from 'modapp-utils';
import Err from 'classes/Err';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import { redirect } from 'utils/reload';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
import responseParseError from 'utils/responseParseError';
import PasswordResetComponent from './PasswordResetComponent';
import './passwordReset.scss';

const resetUrl = API_IDENTITY_PATH + 'resetpass?noredirect';
const resetValidateUrl = API_IDENTITY_PATH + 'resetpass/validate?noredirect';;
const redirectUrl = HUB_PATH;

const crossOrigin = API_CROSS_ORIGIN;

/**
 * PasswordReset draws the login screen for email verification
 */
class PasswordReset {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
			'policies',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.loginPromise = null;
		this.loginResolve = null;
		this.state = {};
		let q = uri.getQuery();
		this.code = q.code || "";

		if (!this.code) {
			this._showError(new Err('passwordReset.missingResetCode', "Missing reset code."));
		} else {
			this.validateCode(this.code)
				.then(result => {
					if (result.isValid) {
						this._showPasswordReset(this.code, result.requireProof);
					} else {
						this._showInvalidCode();
					}
				})
				.catch(err => this._showError(err));
		}
	}

	/**
	 * Validates the reset code.
	 * @param {string} code Code to verify.
	 * @returns {Promise<{isValid: boolean, requireProof: boolean}} Promise of the code being verified.
	 */
	validateCode(code) {
		let formData = new FormData();
		formData.append('code', code);

		return fetch(resetValidateUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				}, responseParseError(resp));
			}
			return resp.json().catch(responseParseError(resp));
		});
	}

	/**
	 * Sends a resetPassword request to the server.
	 * @param {string} code Reset ticket code.
	 * @param {string} pass New password
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.username] Username as proof.
	 * @param {string} [opt.realm] Realm name as proof.
	 * @param {string} [opt.charName] Char name as proof.
	 * @returns Promise
	 */
	resetPassword(code, pass, opt) {
		let formData = new FormData();
		formData.append('code', code);
		formData.append('pass', sha256(pass.trim()));
		formData.append('hash', hmacsha256(pass.trim(), publicPepper));
		if (opt?.username) {
			formData.append('username', opt?.username.trim());
		} else {
			if (opt?.realm) {
				formData.append('realm', opt?.realm.trim());
			}
			if (opt?.charName) {
				formData.append('charName', opt?.charName.trim());
			}
		}

		return fetch(resetUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				}, responseParseError(resp));
			}
			return resp.json()
				.then(result => this._showResetComplete(result.username, result.emailVerified))
				.catch(() => this._showResetComplete());
		});
	}

	_showPasswordReset(code, requireProof) {
		this.module.screen.setComponent(new PasswordResetComponent(this.module, code, requireProof, this.state, this.params));
	}

	_showResetComplete(username, emailVerified) {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('passwordReset.passwordSuccessfullyReset', "Password reset completed"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(
					emailVerified
						? l10n.l('passwordReset.passwordUpdatedAndVerified', "Your password has been updated, and your email has been verified.")
						: l10n.l('passwordReset.passwordUpdated', "Your password has been updated."),
					{ tagName: 'p' },
				)),
				n.component(username
					? new Txt(l10n.l('passwordReset.goToLoginWithAccount', "Go to the login and use it together with your account name:"), { tagName: 'p' })
					: new Txt(l10n.l('passwordReset.goToLoginAndTry', "Go to the login and try it out!"), { tagName: 'p' }),
				),
				n.component(username
					? new Txt(username, { tagName: 'p', className: 'passwordreset--username' })
					: null,
				),
			])),
			onConfirm: () => this._redirect(),
		}));
	}

	_showInvalidCode() {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('passwordReset.invalidResetCode', "Invalid reset code"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('passwordReset.invalidCodeInfo1', "Maybe the reset link was too old, or it has already been used."), { tagName: 'p' })),
				n.component(new Txt(l10n.l('passwordReset.invalidCodeInfo2', "Try requesting a new reset link from the login screen."), { tagName: 'p' })),
			])),
			onConfirm: () => this._redirect(),
		}));
	}

	_redirect() {
		this.module.screen.setComponent({
			render: () => {
				redirect(redirectUrl);
			},
			unrender: () => {},
		});
	}

	_showError(err) {
		this.module.screen.setComponent(new ErrorScreenDialog(err, {
			redirectUrl,
		}));
	}
}

export default PasswordReset;
