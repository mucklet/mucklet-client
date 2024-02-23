import { Elem, Txt, Input } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import PasswordInput from 'components/PasswordInput';
import ScreenDialog from 'components/ScreenDialog';
import LoginRegister from './LoginRegister';
import LoginRecover from './LoginRecover';

/**
 * Login draws the main login wireframe
 */
class LoginComponent {
	constructor(module, state, opt) {
		opt = opt || {};
		this.module = module;
		this.state = state;
		state.login = Object.assign({
			player: opt.player || '',
			password: opt.pass || '',
		}, state.login);
		this.autoLogin = !!opt.hasOwnProperty('auto');
		this.realm = opt.realm || 'wolfery';
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login' }, [
			n.elem('form', [
				n.elem('label', {
					attributes: { for: 'username' },
				}, [
					n.component(new Txt(l10n.l('login.player', "Account name"), { tagName: 'h3' })),
				]),
				n.component('player', new Input(this.state.login.player, {
					className: 'common--formmargin autocomplete',
					attributes: {
						id: 'username',
						name: 'username',
						spellcheck: 'false',
						autocomplete: 'username',
					},
					events: {
						keydown: (c, e) => {
							if (e.keyCode == 13 && this.elem) {
								this._getNode('password').getInput().getElement().focus();
							}
						},
					},
				})),
				n.elem('label', {
					attributes: { for: 'password' },
				}, [
					n.component(new Txt(l10n.l('login.password', "Password"), { tagName: 'h3' })),
				]),
				n.component('password', new PasswordInput(this.state.login.password, {
					className: 'common--formmargin',
					inputOpt: {
						className: 'autocomplete',
						attributes: {
							id: 'password',
							name: 'password',
							autocomplete: 'current-password',
						},
					},
					events: {
						keydown: (c, e) => {
							if (e.keyCode == 13) {
								e.preventDefault();
								this._onLogin();
							}
						},
					},
				})),
				n.elem('div', { className: 'login--forgotpass' }, [
					n.component(new Txt(l10n.l('login.havingTroublesLoginIn', "Problems logging in?"), {
						tagName: 'a',
						className: 'link',
						attributes: {
							href: 'javascript:;',
						},
						events: {
							click: (c, ev) => {
								this._onRecover();
								ev.preventDefault();
							},
						},
					})),
				]),
				n.component('message', new Collapser(null)),
				n.elem('login', 'button', {
					events: {
						click: (c, ev) => {
							ev.preventDefault();
							this._onLogin();
						},
					},
					attributes: { type: 'submit' },
					className: 'btn large primary login--login pad-top-xl login--btn',
				}, [
					n.elem('loginSpinner', 'div', { className: 'spinner spinner--btn fade hide' }),
					n.component(new Txt(l10n.l('login.login', "Login"))),
				]),
			]),
			n.elem('div', { className: 'login--divider' }, [
				n.component(new Txt(l10n.l('login.or', 'or'), { tagName: 'h3' })),
			]),
			n.elem('button', { events: {
				click: () => this.module.self.googleOAuth2(),
			}, className: 'btn large google icon-left login--btn' }, [
				n.component(new FAIcon('google')),
				n.component(new Txt(l10n.l('login.signin', "Signin with Google"))),
			]),
			n.elem('div', { className: 'login--divider' }, [
				n.component(new Txt(l10n.l('login.or', 'or'), { tagName: 'h3' })),
			]),
			n.elem('button', { events: {
				click: () => this._onRegister(),
			}, className: 'btn login--register icon-left login--btn' }, [
				n.component(new FAIcon('pencil-square-o')),
				n.component(new Txt(l10n.l('login.registerPlayer', "Register Player"))),
			]),
			n.elem('div', { className: 'login--policies' }, [
				n.component(new Txt(l10n.l('login.privacyPolicy', "Privacy Policy"), {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: 'javascript:;',
					},
					events: {
						click: (c, ev) => {
							this.module.policies.openPolicy('privacy');
							ev.preventDefault();
						},
					},
				})),
				n.component(new Txt(l10n.l('login.termsOfService', "Terms of Service"), {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: 'javascript:;',
					},
					events: {
						click: (c, ev) => {
							this.module.policies.openPolicy('terms');
							ev.preventDefault();
						},
					},
				})),
			]),
		])));
		this.elem.render(el);

		if (this.autoLogin) {
			this._onLogin();
		}
	}

	unrender() {
		if (this.elem) {
			this.state.login = this._getState();
			this.elem.unrender();
			this.elem = null;
		}
	}

	_getState() {
		return {
			player: this._getNode('player').getValue(),
			password: this._getNode('password').getValue(),
		};
	}

	_clearState() {
		if (this.elem) {
			let c = this.elem.getComponent();
			c.getNode('player').setValue('');
			c.getNode('password').setValue('');
		}
		this.state.login = { player: '', password: '' };
	}

	_onLogin() {
		if (!this.elem || this.loginPromise) return;

		let { player, password } = this._getState();
		this._getNode('loginSpinner').classList.remove('hide');

		this.loginPromise = this.module.self.login(player, password)
			.then(user => {
				this._clearState();
				return user;
			})
			.catch(err => {
				this.loginPromise = null;
				if (!this.elem) return;
				this._getNode('loginSpinner').classList.add('hide');

				this._setMessage(l10n.l(err.code, err.message, err.data));
			});
	}

	_onRegister() {
		let close = () => this.module.screen.removeSubcomponent('register');
		this.module.screen.addSubcomponent('register', new LoginRegister(this.module, this.state, close));
	}

	_onRecover() {
		let state = this.elem ? this._getState() : this.state.login;
		let close = () => this.module.screen.removeSubcomponent('recover');
		this.module.screen.addSubcomponent('recover', new LoginRecover(this.module, this.state, close, {
			username: state.player.trim() || '',
			realm: this.realm,
		}));
	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this._getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}

	_getNode(node) {
		return this.elem.getComponent().getNode(node);
	}
}

export default LoginComponent;
