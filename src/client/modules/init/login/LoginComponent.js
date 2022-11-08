import { Elem, Txt, Input, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import PasswordInput from 'components/PasswordInput';
import ScreenDialog from 'components/ScreenDialog';
import LoginRegister from './LoginRegister';

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
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login' }, [
			n.elem('label', [
				n.component(new Txt(l10n.l('login.player', "Account name"), { tagName: 'h3' })),
			]),
			n.component('player', new Input(this.state.login.player, {
				className: 'common--formmargin',
				attributes: { spellcheck: 'false', name: 'username', id: 'username' },
				events: {
					keydown: (c, e) => {
						if (e.keyCode == 13 && this.elem) {
							this.elem.getComponent().getNode('password').getElement().focus();
						}
					},
				},
			})),
			n.elem('label', [ n.component(new Txt(l10n.l('login.password', "Password"), { tagName: 'h3' })) ]),
			n.component('password', new PasswordInput(this.state.login.password, {
				className: 'common--formmargin',
				inputOpt: { attributes: { name: 'password', id: 'password' }},
				events: {
					keydown: (c, e) => {
						if (e.keyCode == 13) {
							this._onLogin();
						}
					},
				},
			})),
			n.component('message', new Collapser(null)),
			n.elem('login', 'button', { events: {
				click: () => this._onLogin(),
			}, className: 'btn large primary login--login pad-top-xl login--btn' }, [
				n.elem('loginSpinner', 'div', { className: 'spinner fade hide' }),
				n.component(new Txt(l10n.l('login.login', "Login"))),
			]),
			n.elem('div', { className: 'login--divider' }, [
				n.component(new Txt(l10n.l('login.or', 'or'), { tagName: 'h3' })),
			]),
			n.elem('a', { attributes: { href: this.module.self.params.googleUrl }, className: 'btn large google icon-left login--btn' }, [
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
		let c = this.elem.getComponent();
		return {
			player: c.getNode('player').getValue(),
			password: c.getNode('password').getValue(),
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
		this.elem.getComponent().getNode('loginSpinner').classList.remove('hide');

		this.loginPromise = this.module.self.login(player, password)
			.then(user => {
				this._clearState();
				return user;
			})
			.catch(err => {
				this.loginPromise = null;
				if (!this.elem) return;
				this.elem.getComponent().getNode('loginSpinner').classList.add('hide');
				// [TODO] Remove this once the bug is fixed
				if (err.code == 'auth.missingToken') {
					let n = this.elem.getComponent().getNode('message');
					n.setComponent(new Html(`We have issues with Safari and Incognito. See <a href="https://forum.wolfery.com/t/bug-missing-token/267" class="link" target="_blank">this forum post</a> for solutions.`, { className: 'login--message' }));
					return;
				}

				this._setMessage(l10n.l(err.code, err.message, err.data));
			});
	}

	_onRegister() {
		let close = () => this.module.screen.removeSubcomponent('register');
		this.module.screen.addSubcomponent('register', new LoginRegister(this.module, this.state, close));
	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this.elem.getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}
}

export default LoginComponent;
