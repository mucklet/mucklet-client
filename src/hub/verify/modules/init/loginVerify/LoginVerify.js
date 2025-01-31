import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { uri } from 'modapp-utils';
import Err from 'classes/Err';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
import responseParseError from 'utils/responseParseError';
import LoginVerifyComponent from './LoginVerifyComponent';
import './loginVerify.scss';

const authenticateUrl = API_IDENTITY_PATH + 'authenticate?noredirect';
const loginUrl = API_IDENTITY_PATH + 'login?noredirect';
const verifyUrl = API_IDENTITY_PATH + 'verify?noredirect';
const redirectUrl = HUB_PATH;

const crossOrigin = API_CROSS_ORIGIN;

/**
 * LoginVerify draws the login screen for email verification
 */
class LoginVerify {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
			'policies',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { loggedIn: false, user: null, authError: null }});
		this.loginPromise = null;
		this.loginResolve = null;
		this.state = {};
		let q = uri.getQuery();
		this.code = q.code || "";

		if (!this.code) {
			this._showError(new Err('loginVerify.missingCode', "Missing verification code."));
		} else {
			this.authenticate();
		}
	}

	getModel() {
		return this.model;
	}

	/**
	 * Authenticates the user or redirects to login if not logged in.
	 *
	 * The returned promise will be rejected if the API returns any other error
	 * than 'user.authenticationFailed'. If user.authenticationFailed is
	 * returned, the auth module will redirect the client to the authentication
	 * endpoint.
	 * @returns {Promise} Promise to the authenticate.
	 */
	authenticate() {
		return fetch(authenticateUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				if (resp.status < 500) {
					this._showLogin();
					return;
				}
				return resp.json().then(err => {
					throw err;
				}, responseParseError(resp));
			}

			return resp.json().then(user => {
				if (user && user.emailVerified) {
					this._showVerified(user.email);
				} else {
					this._verifyCode();
				}
			}, responseParseError(resp));
		}).catch(err => {
			this._showError(err);
		});
	}

	/**
	 * Returns a promise to when the player is logged in.
	 * The promise will never reject.
	 * @returns {Promise.<Model>} Promise to user being logged in.
	 */
	getLoginVerifyPromise() {
		return this.loginPromise = this.loginPromise || (
			this.model.loggedIn
				? Promise.resolve(this.model.user)
				: new Promise(resolve => this.loginResolve = resolve)
		);
	}

	login(name, pass) {
		let formData = new FormData();
		formData.append('name', name);
		formData.append('pass', sha256(pass.trim()));
		formData.append('hash', hmacsha256(pass.trim(), publicPepper));

		return fetch(loginUrl, {
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
			this._verifyCode();
		});
	}

	/**
	 * Calls the logout endpoint and then reloads.
	 */
	logout() {
		fetch(this.params.logoutUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => this._afterFade(reload));
	}

	_showLogin() {
		this.module.screen.setComponent(new LoginVerifyComponent(this.module, this.state, this.params));
	}

	_showVerified(email) {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('loginVerify.title', "Email address verified"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('loginVerify.errorOccured', "Your email has been verified:"), { tagName: 'p' })),
				n.elem('p', { className: 'loginverify--email ' }, [
					n.text(email),
				]),
				n.component(new Txt(l10n.l('loginVerify.verificationInfo', "It can now be safely used to reset lost passwords. Well done!"), { tagName: 'p' })),
			])),
			onConfirm: () => this._redirect(),
		}));
	}

	_showNotVerified() {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('loginVerify.title', "Verification failed"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('loginVerify.errorOccured', "Maybe the code was too old, or meant for a different account."), { tagName: 'p' })),
				n.component(new Txt(l10n.l('loginVerify.verificationInfo', "Try sending a new verification mail from the client."), { tagName: 'p' })),
			])),
			onConfirm: () => this._redirect(),
		}));
	}

	_validateCode() {
		let q = uri.getQuery();
		if (!q.code) {
			return this._showError(new Err('loginVerify.missingCode', "Missing verification code."));
		}

		return q.code;
	}

	_verifyCode() {
		let formData = new FormData();
		formData.append('code', this.code);

		return fetch(verifyUrl, {
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
			return resp.json().then(result => {
				if (result.emailVerified) {
					this._showVerified(result.email);
				} else {
					this._showNotVerified();
				}
			}, responseParseError(resp));
		}).catch(err => this._showError(err));
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

export default LoginVerify;
