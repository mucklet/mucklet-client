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
const hubUrl = HUB_PATH;
// Refresh early enough that an access token cannot expire in transit.
const refreshSafetyMargin = 1000 * 60 * 15;
// Refresh periodically when the server did not provide an access-token expiry.
const fallbackRefreshDuration = 1000 * 60 * 60 * 24 * 6;
// Retry transient authentication-service failures without busy-looping.
const retryRefreshDuration = 1000 * 60;

function redirectWithUri(url, pushHistory) {
	redirect(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'redirect_uri=' + encodeURIComponent(window.location.href), false, pushHistory);
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
		this._onVisibilityChange = this._onVisibilityChange.bind(this);
		this._beforeConnect = this._beforeConnect.bind(this);
		this._onApiConnect = this._onApiConnect.bind(this);

		this.app.require([
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.loginPromise = null;
		this.loginResolve = null;
		this.userPromise = null;
		this.authPromise = null;
		this.refreshPromise = null;
		this.refreshTimer = null;
		this.accessTokenExpiresAt = 0;
		this.reauthenticationRequired = false;
		this.model = new Model({ data: { loggedIn: false, user: null, authError: null }});
		this.model.on('change', this._onModelChange);
		this.state = {};

		this.module.api.setOnConnect(this._onConnect);
		this.module.api.setBeforeConnect(this._beforeConnect);
		this.module.api.on('connect', this._onApiConnect);
		if (typeof document != 'undefined') {
			document.addEventListener('visibilitychange', this._onVisibilityChange);
		}
	}

	/**
	 * Tries to authenticate without redirect on failure, if authenticate hasn't
	 * been called yet. It returns a promise of the logged in user, or null if
	 * not logged in.
	 * @returns {Promise<UserModel|null>} Promise of the logged in user or null if no user is logged in.
	 */
	getAuthenticatePromise() {
		if (!this.authPromise) {
			this.authenticate(true);
		}
		return this.authPromise;
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

		this.authPromise = this._authenticateRequest(false)
			.then(() => this._getCurrentUser(true))
			.catch(err => {
				if (err.status == 401) {
					if (!noRedirect) {
						redirectWithUri(oauth2Url);
					}
					return null;
				}
				throw err;
			});

		return this.authPromise;
	}

	/**
	 * Tries to refresh access tokens by calling the authenticate endpoint.
	 *
	 * The returned promise will be rejected if refresh failed.
	 * @param {boolean} redirectOnError Flag to redirect to login on error. Defaults to false.
	 * @param {boolean} forceRefresh Flag to refresh even when the access token is still valid.
	 * @returns {Promise} Promise to tokens being refreshed.
	 */
	refreshTokens(redirectOnError, forceRefresh) {
		if (!this.refreshPromise) {
			this.refreshPromise = this._authenticateRequest(!!forceRefresh)
				.catch(err => {
					// A 401 means the browser no longer has usable credentials. Do
					// not keep retrying it as though the identity provider is down.
					if (err.status == 401) {
						this.reauthenticationRequired = true;
						if (redirectOnError) {
							this.redirectToLogin(true);
						}
					}
					throw err;
				})
				.finally(() => this.refreshPromise = null);
		}
		return this.refreshPromise;
	}

	_authenticateRequest(forceRefresh) {
		let url = authenticateUrl + (forceRefresh ? (authenticateUrl.indexOf('?') >= 0 ? '&' : '?') + 'refresh=true' : '');
		return fetch(url, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).catch(() => {
			throw new Err('auth.failedToFetch', "Failed to send authentication check.");
		}).then(resp => resp.text().then(text => {
			let result = null;
			if (text) {
				try {
					result = JSON.parse(text);
				} catch (ex) {}
			}
			if (!resp.ok) {
				let err = new Err(result?.code || 'auth.failedToAuthenticate', result?.message || "Failed to authenticate.", result?.data);
				err.status = resp.status;
				throw err;
			}
			this._setAccessTokenExpiry(result?.accessTokenExpiresAt);
			return result;
		}));
	}

	_setAccessTokenExpiry(expiresAt) {
		this.accessTokenExpiresAt = Number(expiresAt) || 0;
		this._scheduleRefresh();
	}

	_scheduleRefresh(delay) {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}
		let refreshAt = this.accessTokenExpiresAt
			? this.accessTokenExpiresAt - Date.now() - refreshSafetyMargin
			: fallbackRefreshDuration;
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = null;
			this.refreshTokens(true, true).catch(err => {
				if (err.code != 'auth.reauthenticationRequired') {
					this._scheduleRefresh(delay || retryRefreshDuration);
				}
			});
		}, Math.max(0, delay || refreshAt));
	}

	_beforeConnect() {
		if (!this.model.loggedIn || !this._isRefreshDue()) {
			return Promise.resolve();
		}
		return this.refreshTokens(true, true);
	}

	_isRefreshDue() {
		return !this.accessTokenExpiresAt || Date.now() >= this.accessTokenExpiresAt - refreshSafetyMargin;
	}

	_onVisibilityChange() {
		if (document.visibilityState == 'visible' && this.model.loggedIn && this._isRefreshDue()) {
			this.refreshTokens(true, true).catch(() => {});
		}
	}

	_onApiConnect() {
		if (this.model.loggedIn && !this.userPromise) {
			this._getCurrentUser(false).catch(err => {
				this.model.set({ authError: err });
			});
		}
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
	 * @param {boolean} redirectToPage Flag to redirect back to current page after logout.
	 */
	logout(redirectToPage) {
		this._afterFade(() => {
			redirectToPage
				? redirectWithUri(oauth2LogoutUrl, false)
				: redirect(oauth2LogoutUrl, true);
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

	/**
	 * Redirects to the oauth2 register page.
	 * @param {boolean} noFade Flag to prevent fading out.
	 */
	redirectToRegister(noFade) {
		let url = oauth2Url + '?login.register';
		if (noFade) {
			redirectWithUri(url, true);
		} else {
			this._afterFade(() => {
				redirectWithUri(url, true);
			});
		}
	}


	/**
	 * Redirects to the hub page after fading out, optionally to a subpage path.
	 * @param {string} [path] Sub page path. Leading slash is not required.
	 */
	redirectToHub(path) {
		this._afterFade(() => {
			redirect(hubUrl + (path || '').replace(/^\/+/, ''), true, true);
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
		if (this.model.user && this.module.api.tryConnect && !this.reauthenticationRequired) {
			this.userPromise = null;
			return;
		}
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
		let screen = this.app.getModule('screen');
		if (screen) {
			screen.setComponent({
				render: () => cb(),
				unrender: () => {},
			});
		} else {
			cb();
		}
	}

	dispose() {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}
		if (typeof document != 'undefined') {
			document.removeEventListener('visibilitychange', this._onVisibilityChange);
		}
		this.module.api.setBeforeConnect(null);
		this.module.api.off('connect', this._onApiConnect);
		this.model.off('change', this._onModelChange);
		this._onUnsubscribe();
	}
}

export default Auth;
