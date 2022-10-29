import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { uri } from 'modapp-utils';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
import LoginVerifyComponent from './LoginVerifyComponent';
import './loginVerify.scss';

/**
 * LoginVerify draws the login screen for email verification
 */
class LoginVerify {
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			authenticateUrl: '/identity/authenticate?noredirect',
			loginUrl: '/identity/login?noredirect',
			verifyUrl: '/identity/verify?noredirect',
			redirectUrl: '/',
			crossOrigin: true
		}, params);

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
			this._showError({ code: 'loginVerify.missingCode', message: "Missing verification code." });
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
		return fetch(this.params.authenticateUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: this.params.crossOrigin ? 'include' : 'same-origin'
		}).then(resp => {
			if (resp.status >= 400) {
				if (resp.status < 500) {
					this._showLogin();
					return;
				}
				return resp.json().then(err => {
					throw err;
				});
			}

			return resp.json().then(user => {
				if (user && user.emailVerified) {
					this._showVerified(user.email);
				} else {
					this._verifyCode();
				}
			});
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

		return fetch(this.params.loginUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: this.params.crossOrigin ? 'include' : 'same-origin'
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				});
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
			credentials: this.params.crossOrigin ? 'include' : 'same-origin'
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
					n.text(email)
				]),
				n.component(new Txt(l10n.l('loginVerify.verificationInfo', "It can now be safely used to reset lost passwords. Well done!"), { tagName: 'p' })),
			])),
			onConfirm: () => this._redirect()
		}));
	}

	_showNotVerified() {
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('loginVerify.title', "Verification failed"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('loginVerify.errorOccured', "Maybe the code was too old, or meant for a different account."), { tagName: 'p' })),
				n.component(new Txt(l10n.l('loginVerify.verificationInfo', "Try sending a new verification mail from the client."), { tagName: 'p' })),
			])),
			onConfirm: () => this._redirect()
		}));
	}

	_validateCode() {
		let q = uri.getQuery();
		if (!q.code) {
			return this._showError({ code: 'loginVerify.missingCode', message: "Missing verification code." });
		}

		return q.code;
	}

	_verifyCode() {
		let formData = new FormData();
		formData.append('code', this.code);

		return fetch(this.params.verifyUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: this.params.crossOrigin ? 'include' : 'same-origin'
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				}).catch(err => {
					throw { code: 'loginVerify.verificationFailedWithStatus', message: "Verification failed with status {status}.", data: { status: resp.status }};
				});
			}
			return resp.json().then(result => {
				if (result.emailVerified) {
					this._showVerified(result.email);
				} else {
					this._showNotVerified();
				}
			});
		}).catch(err => this._showError(err));
	}

	_redirect() {
		this.module.screen.setComponent({
			render: () => {
				redirect(this.params.redirectUrl);
			},
			unrender: () => {}
		});
	}

	_showError(err) {
		this.module.screen.setComponent(new ErrorScreenDialog(err, {
			redirectUrl: this.params.redirectUrl
		}));
	}
}

export default LoginVerify;
