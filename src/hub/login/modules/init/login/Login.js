import Err from 'classes/Err';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import reload, { redirect } from 'utils/reload';
import { uri } from 'modapp-utils';
import LoginComponent from './LoginComponent';
import LoginAgreeTerms from './LoginAgreeTerms';
import './login.scss';

const authenticateUrl = API_IDENTITY_PATH + 'authenticate?noredirect';
const loginUrl = API_IDENTITY_PATH + 'login?noredirect';
const logoutUrl = API_IDENTITY_PATH + 'logout?noredirect';
const registerUrl = API_IDENTITY_PATH + 'register?noredirect';
const agreeUrl = API_IDENTITY_PATH + 'agree?noredirect';
const googleUrl = API_IDENTITY_PATH + 'google';
const redirectUrl = API_IDENTITY_PATH + 'oauth2/authenticate';
const recoverUrl = API_IDENTITY_PATH + 'recover?noredirect';

const crossOrigin = API_CROSS_ORIGIN;

/**
 * Login draws the main login wireframe
 */
class Login {
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			player: '',
			pass: '',
			clientId: null,
		}, params);

		this.query = uri.getQuery();
		this.params.clientId = this.params.clientId || this.query.client_id || null;

		this.app.require([
			'api',
			'screen',
			'policies',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.loginPromise = null;
		this.loginResolve = null;
		this.state = {};

		this.authenticate();
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
				return resp.json().then(err => {
					if (resp.status < 500) {
						this._showLogin();
						return;
					}
					throw err;
				});
			}

			return resp.json().then(user => {
				if (user && !user.termsAgreed) {
					this._showAgreeTerms();
				} else {
					this._redirect(true);
				}
			});
		});
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
				});
			}
			this._redirect();
		});
	}

	/**
	 * Calls the logout endpoint and then reloads.
	 */
	logout() {
		fetch(logoutUrl, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => this._afterFade(reload));
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
		// Include promo code if available
		let p = URLSearchParams ? new URLSearchParams(window.location.search).get('p') : '';
		if (p) {
			formData.append('p', p);
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
			this._redirect();
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
						this._showLogin();
						return;
					}
					throw err;
				});
			}
			return this._redirect();
		});
	}

	/**
	 * Send a recover mail for an account.
	 * @param {string} username Account username.
	 * @param {string} [realm] Realm key.
	 * @param {string} [charName] Full name of a realm character.
	 * @returns {Promise} Promise to reponse of recover request.
	 */
	recover(username, realm, charName) {
		let formData = new FormData();
		formData.append('username', username);
		if (realm && charName) {
			formData.append('realm', realm);
			formData.append('charName', charName.trim());
		}

		return fetch(recoverUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status >= 400) {
				return resp.json()
					.catch(() => new Err('login.errorResponse', "Request returned with status {status}.", { status: resp.status }))
					.then(err => {
						throw err;
					});
			}
		});
	}

	googleOAuth2() {
		this._afterFade(() => {
			redirect(googleUrl, true);
		});
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

	_redirect(instant) {
		let url = redirectUrl;
		let includeQuery = true;

		// If we are missing a client_id in the query params, we are not to
		// redirect back to the oauth2, but instead to a local URL. If we have a
		// required_uri query parameter, validate that it is a local path or
		// belongs to the same origin.
		if (!this.query.hasOwnProperty('client_id')) {
			includeQuery = false;
			url = this.query.redirect_uri || '/';
			if (!url.startsWith('/')) {
				let origin = window.location.origin;
				if (url != origin && !url.startsWith(origin + '/')) {
					// Fallback to redirect to root
					url = '/';
				}
			}
		}

		if (instant) {
			redirect(url, includeQuery);
		} else {
			this._afterFade(() => {
				redirect(url, includeQuery);
			});
		}
	}

	dispose() {
	}
}

export default Login;
