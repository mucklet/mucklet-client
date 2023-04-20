import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';

const oauth2Url = '/login';
const oauth2LogoutUrl = API_IDENTITY_PATH + 'logout';
const authenticateUrl = API_IDENTITY_PATH + 'authenticate?noredirect';
const crossOrigin = API_CROSS_ORIGIN;

function redirectWithUri(url) {
	redirect(url + '?redirect_uri=' + encodeURIComponent(window.location.href), false);
}

/**
 * Auth authenticates and fetches the user, or redirects to login on fail.
 */
class Auth {
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			player: '',
			pass: '',
			wsAuth: false,
		}, params);

		// Bind callbacks
		this._onConnect = this._onConnect.bind(this);
		this._onUnsubscribe = this._onUnsubscribe.bind(this);
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([
			'api',
			'screen',
		], this._init.bind(this));
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
		if (this.params.wsAuth) {
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
						redirectWithUri(oauth2Url);
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
	 * Returns a promise to when the user is logged in.
	 * The promise will never reject.
	 * @returns {Promise.<Model>} Promise to user being logged in.
	 */
	getUserPromise() {
		return this.loginPromise = this.loginPromise || (
			this.model.loggedIn
				? Promise.resolve(this.model.user)
				: new Promise(resolve => this.loginResolve = resolve)
		);
	}

	/**
	 * Returns the user or null if the user isn't logged in.
	 * @returns {?Model} User model or null.
	 */
	getUser() {
		return this.model.user;
	}

	/**
	 * Calls the logout endpoint and then reloads.
	 */
	logout() {
		this._afterFade(() => {
			redirect(oauth2LogoutUrl, true);
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
					return this.module.api.call('identity', 'getUser');
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
					if (err.code == 'identity.termsNotAgreed') {
						redirectWithUri(oauth2Url);
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
		return (this.params.wsAuth
			? this.module.api.authenticate('identity', 'login', {
				name: this.params.player,
				hash: hmacsha256(this.params.pass.trim(), publicPepper),
			})
			: this.module.api.authenticate('identity', 'authenticate')
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

export default Auth;
