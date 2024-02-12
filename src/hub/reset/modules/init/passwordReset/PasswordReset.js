import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import { uri } from 'modapp-utils';
import Err from 'classes/Err';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import { redirect } from 'utils/reload';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
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
						this._showPasswordReset(this.code);
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
	 * @returns {Promise} Promise of the code being verified.
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
				}).catch(err => {
					throw new Err('passwordReset.failedToVerifyCode', "Code verification failed with status {status}.", { status: resp.status });
				});
			}
			return resp.json();
		});
	}

	resetPassword(code, pass) {
		let formData = new FormData();
		formData.append('code', code);
		formData.append('pass', sha256(pass.trim()));
		formData.append('hash', hmacsha256(pass.trim(), publicPepper));

		return fetch(resetUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				}).catch(err => {
					throw new Err('passwordReset.resetFailed', "Reset failed with status {status}.", { status: resp.status });
				});
			}
			this._showResetComplete();
		});
	}

	_showPasswordReset(code) {
		this.module.screen.setComponent(new PasswordResetComponent(this.module, code, this.state, this.params));
	}

	_showResetComplete(email) {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('passwordReset.passwordSuccessfullyReset', "Password reset completed"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('passwordReset.passwordUpdateInfo1', "Your password has been updated."), { tagName: 'p' })),
				n.component(new Txt(l10n.l('passwordReset.passwordUpdateInfo2', "Go to the login and try it out!"), { tagName: 'p' })),
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
