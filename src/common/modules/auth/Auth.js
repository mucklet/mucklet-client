import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';
import Err from 'classes/Err';

const oauth2Url = AUTH_LOGIN_URL;
const oauth2LogoutUrl = AUTH_LOGOUT_URL;
const authenticateUrl = AUTH_AUTHENTICATE_URL;
const crossOrigin = API_CROSS_ORIGIN;
const wsLoginRid = AUTH_LOGIN_RID;
const wsAuthRid = AUTH_AUTHENTICATE_RID;

function redirectWithUri(url, pushHistory) {
	redirect(url + '?redirect_uri=' + encodeURIComponent(window.location.href), false, pushHistory);
}

/**
 * Auth authenticates and fetches the user, or redirects to login on fail.
 */
class Auth {

	/**
	 * Creates a new Auth instance.
	 * @param {App} app App instance.
	 * @param {object} params Module params
	 * @param {string} [params.player] Login username. Ignored if mode is not 'pass'.
	 * @param {string} [params.pass] Hashed password. Ignored if mode is not 'pass'.
	 * @param {"http"|"ws"|"pass"} [params.mode] Auth mode. http=header authentication on http handshake, ws=authenticate call over WebSocket, pass=password authentication
	 */
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			player: '',
			pass: '',
			mode: 'http',
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
	 * endpoint, or resolve to null if noRedirect is true.
	 * @param {boolean} noRedirect Flag to prevent redirect on not being logged in. Instead, the promise will resolve to null.
	 * @returns {Promise} Promise to the authenticate.
	 */
	authenticate(noRedirect) {
		if (this.params.mode == 'pass') {
			return this._getCurrentUser(true);
		}

		return fetch(authenticateUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).catch(err => {
			throw new Err('auth.failedToFetch', "Failed to send authentication check.");
		}).then(resp => {
			// Legacy behavior and other >= 400 errors
			if (resp.status >= 400) {
				return resp.json().then(err => {
					if (resp.status < 500) {
						if (!noRedirect) {
							redirectWithUri(oauth2Url);
						}
						return null;
					}
					throw err;
				}, err => resp.text().then(
					text => {
						throw new Err('auth.failedToAuthenticateMsg', "Failed to authenticate: {text}", resp.text());
					},
					err => {
						throw new Err('auth.failedToAuthenticate', "Failed to authenticate.");
					},
				));
			}
			// New behavior allows a 200 response but with an {"error": {...}}
			// json object, to indicate failed authentication.
			return resp.text().then(text => {
				try {
					let result = JSON.parse(text);
					if (result?.error) {
						if (!noRedirect) {
							redirectWithUri(oauth2Url);
						}
						return null;
					}
				} catch (ex) {
					// A 200 response with invalid JSON is legacy success.
				}
				return this._getCurrentUser(true);
			});
		});
	}

	/**
	 * Tries to refresh access tokens by calling the authenticate endpoint.
	 *
	 * The returned promise will be rejected if refresh failed.
	 * @param {boolean} redirectOnerror Flag to redirect to login on error. Defaults to false.
	 * @returns {Promise} Promise to tokens being refreshed.
	 */
	refreshTokens(redirectOnerror) {
		return fetch(authenticateUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(authResp => {
			return authResp.text().then(text => {
				if (text) {
					try {
						let result = JSON.parse(text);
						if (result?.error) {
							// A proper error messages means we are not logged in.
							if (redirectOnError) {
								this.redirectToLogin(true);
							}
							return Promise.reject(result.error);
						}
					} catch (ex) {}
				}
			});
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

	/**
	 * Redirects to the oauth2 login page.
	 * @param {boolean} noFade Flag to prevent fading out.
	 */
	redirectToLogin(noFade) {
		if (noFade) {
			redirectWithUri(oauth2Url, true);
		} else {
			this._afterFade(() => {
				redirectWithUri(oauth2Url, true);
			});
		}
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
					return this.module.api.call(wsAuthRid, 'getUser');
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
					if (err.code?.endsWith?.('.termsNotAgreed')) {
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
		return (this.params.mode == 'pass'
			? this.module.api.authenticate(wsLoginRid, 'login', {
				name: this.params.player,
				hash: hmacsha256(this.params.pass.trim(), publicPepper),
			})
			: this.params.mode == 'ws'
				? this.module.api.authenticate(wsAuthRid, 'authenticate')
				: Promise.resolve() // 'http'
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
