import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';
import LoginComponent from './LoginComponent';
import LoginAgreeTerms from './LoginAgreeTerms';
import './login.scss';

const oauth2Url = API_AUTH_PATH + 'oauth2/login';
const oauth2LogoutUrl = API_AUTH_PATH + 'oauth2/logout';
const authenticateUrl = API_IDENTITY_PATH + 'authenticate?noredirect';
const loginUrl = API_IDENTITY_PATH + 'login?noredirect';
const logoutUrl = API_IDENTITY_PATH + 'logout?noredirect';
const registerUrl = API_IDENTITY_PATH + 'register?noredirect';
const agreeUrl = API_IDENTITY_PATH + 'agree?noredirect';

const crossOrigin = API_CROSS_ORIGIN;
const oauth2 = API_OAUTH2;

/**
 * Login draws the main login wireframe
 */
class Login {
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			player: '',
			pass: '',
			wsLogin: false,
		}, params);

		// Bind callbacks
		this._onConnect = this._onConnect.bind(this);
		this._onUnsubscribe = this._onUnsubscribe.bind(this);
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([ 'api', 'screen', 'policies' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.loginPromise = null;
		this.loginResolve = null;
		this.userPromise = null;
		this.model = new Model({ data: { loggedIn: false, user: null, authError: null }});
		this.model.on('change', this._onModelChange);
		this.state = {};

		this.module.api.setOnConnect(this._onConnect);
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
		if (this.params.wsLogin) {
			return this._getCurrentUser(true);
		}

		return fetch(authenticateUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					if (resp.status < 500) {
						if (oauth2) {
							redirect(oauth2Url, true);
						} else {
							this._showLogin();
						}
						return;
					}
					throw err;
				});
			}
			return this._getCurrentUser(true);
		});
	}

	getModel() {
		return this.model;
	}

	/**
	 * Returns a promise to when the player is logged in.
	 * The promise will never reject.
	 * @returns {Promise.<Model>} Promise to user being logged in.
	 */
	getLoginPromise() {
		return this.loginPromise = this.loginPromise || (
			this.model.loggedIn
				? Promise.resolve(this.model.user)
				: new Promise(resolve => this.loginResolve = resolve)
		);
	}

	login(name, pass) {
		if (this.model.loggedIn) {
			return Promise.reject({ code: 'login.alreadyLoggedIn', message: "Already logged in." });
		}

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
				});
			}
			return this._getCurrentUser(true);
		});
	}

	/**
	 * Calls the logout endpoint and then reloads.
	 */
	logout() {
		if (oauth2) {
			this._afterFade(() => {
				redirect(oauth2LogoutUrl, true);
			});
		} else {
			this._afterFade(() => fetch(logoutUrl, {
				method: 'POST',
				mode: 'cors',
				credentials: crossOrigin ? 'include' : 'same-origin',
			}).then(reload));
		}
	}

	/**
	 * Register a new player.
	 * @param {*} name Player name
	 * @param {*} pass Password
	 * @param {*} [email] Optional e-mail
	 * @returns {Promise} Promise to registered player.
	 */
	register(name, pass, email) {
		let formData = new FormData();
		formData.append('name', name);
		formData.append('pass', sha256(pass.trim()));
		formData.append('hash', hmacsha256(pass.trim(), publicPepper));
		if (email) {
			formData.append('email', email);
		}

		return fetch(registerUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					throw err;
				});
			}
			return this._getCurrentUser(true);
		});
	}

	changePassword(oldPass, newPass) {
		let u = this.model.user;
		if (!u) {
			return Promise.reject({ code: 'login.notLoggedIn', message: "You are not logged in." });
		}

		return u.call('changePassword', {
			oldPass: sha256(oldPass.trim()),
			oldHash: hmacsha256(oldPass.trim(), publicPepper),
			newPass: sha256(newPass.trim()),
			newHash: hmacsha256(newPass.trim(), publicPepper),
		});
	}

	/**
	 * Agrees to the terms and policies.
	 * @returns {Promise.<Model>} Promise of the logged in user model.
	 */
	agreeToTerms() {
		return fetch(agreeUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json().then(err => {
					if (resp.status < 500) {
						if (oauth2) {
							redirect(oauth2Url, true);
						} else {
							this._showLogin();
						}
						return;
					}
					throw err;
				});
			}
			return this._getCurrentUser(true);
		});
	}

	_getCurrentUser(reconnect) {
		if (reconnect) {
			// Disconnect to force a reconnect with new header cookies
			this.module.api.disconnect();
			this.model.set({ authError: null });
			this._onUnsubscribe();
		}
		if (!this.userPromise) {
			this.userPromise = this.module.api.connect()
				.then(() => {
					if (this.model.authError) {
						throw this.model.authError;
					}
					return this.module.api.call('auth', 'getUser');
				})
				.then(user => {
					if (this.module.api.isError(user)) {
						throw new Error("Error getting user: " + l10n.t(user.code, user.message, user.data));
					}
					this.model.set({
						loggedIn: true,
						user,
					});
					if (this.loginResolve) {
						this.loginResolve(user);
						this.loginResolve = null;
					}
					user.on('unsubscribe', this._onUnsubscribe);
					return user;
				})
				.catch(err => {
					if (err.code == 'auth.termsNotAgreed') {
						if (oauth2) {
							redirect(oauth2Url, true);
						} else {
							this._showAgreeTerms();
						}
						return;
					}

					// Or else we throw the error to be handled by the caller to
					// show an error message.
					this.userPromise = null;
					throw err;
				});
		}
		return this.userPromise;
	}

	_onConnect() {
		return (this.params.wsLogin
			? this.module.api.authenticate('auth', 'login', {
				name: this.params.player,
				hash: hmacsha256(this.params.pass.trim(), publicPepper),
			})
			: this.module.api.authenticate('auth', 'authenticate')
		).catch(err => {
			return this.model.set({ authError: err });
		});
	}

	_onUnsubscribe() {
		// Remove user model
		if (this.model.user) {
			this.model.user.off('unsubscribe', this._onUnsubscribe);
			this.loginPromise = null;
		}
		this.model.set({
			loggedIn: false,
			user: null,
		});
		this.userPromise = null;
	}

	_onModelChange(changed) {
		// Show login screen when logged out
		if (changed.hasOwnProperty('loggedIn') && !this.model.loggedIn) {
			this._afterFade(reload);
		}
	}

	_showLogin() {
		this.module.screen.setComponent(new LoginComponent(this.module, this.state, this.params));
	}

	_showAgreeTerms() {
		this.module.screen.setComponent(new LoginAgreeTerms(this.module, this.state, this.params));
	}

	_afterFade(cb) {
		this.module.screen.setComponent({
			render: () => cb(),
			unrender: () => {},
		});
	}

	dispose() {
		this.model.off('change', this._onModelChange);
		this._onUnsubscribe();
	}
}

export default Login;
