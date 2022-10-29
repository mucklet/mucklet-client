import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PopupTip from 'components/PopupTip';
import PasswordInput from 'components/PasswordInput';
import LabelToggleBox from 'components/LabelToggleBox';
import ScreenDialog from 'components/ScreenDialog';

/**
 * LoginRegister draws the register window
 */
class LoginRegister {
	constructor(module, state, close) {
		this.module = module;
		this.state = state;
		this.close = close;
		state.register = state.register || this._defaultState();
	}

	render(el) {
		this.model = new Model({ data: this.state.register, eventBus: this.module.self.app.eventBus });

		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-register' }, [
			n.component(new Txt(l10n.l('login.registerAgeDisclaimer', "You must be at least 18 years old to register."), { tagName: 'div', className: 'login-register--disclaimer' })),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'username' }}, [
					n.elem('h3', [
						n.component(new Txt(l10n.l('login.accountName', "Account name"))),
						n.component(new Txt(" *", { className: 'common--error' }))
					]),
				]),
				n.component(new PopupTip(l10n.l('login.accountNameInfo', "Account name is your login name. No other player will ever see it."), { className: 'popuptip--width-m flex-auto' }))
			]),
			n.component('player', new Input(this.model.name, {
				className: 'common--formmargin',
				attributes: { spellcheck: 'false', name: 'username', id: 'username' },
				events: {
					input: c => this.model.set({ name: c.getValue() }),
					keydown: (c, e) => {
						if (e.keyCode == 13 && this.elem) {
							this._getNode('email').getElement().focus();
						}
					}
				}
			})),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'email' }}, [
					n.component(new Txt(l10n.l('login.email', "E-mail"), { tagName: 'h3' })),
				]),
				n.component(new PopupTip(l10n.l('login.emailInfo', "E-mail is used to recover from forgotten passwords. It is not required, but recommended."), { className: 'popuptip--width-m flex-auto' }))
			]),
			n.component('email', new Input(this.model.email, {
				className: 'common--formmargin',
				attributes: { type: 'email', spellcheck: 'false', name: 'email', id: 'email' },
				events: {
					input: c => this.model.set({ email: c.getValue() }),
					keydown: (c, e) => {
						if (e.keyCode == 13 && this.elem) {
							this._getNode('password').getInput().getElement().focus();
						}
					}
				}
			})),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'password' }}, [
					n.elem('h3', [
						n.component(new Txt(l10n.l('login.password', "Password"))),
						n.component(new Txt(" *", { className: 'common--error' }))
					])
				]),
				n.component(new PopupTip(l10n.l('login.passwordInfo', "Passwords are properly encrypted and secured.\nRemember, never reuse the password of your e-mail account!"), { className: 'popuptip--width-m flex-auto' }))
			]),
			n.component('password', new PasswordInput(this.model.pass, {
				className: 'common--formmargin',
				inputOpt: { attributes: { name: 'password', id: 'password' }},
				onInput: c => this.model.set({ pass: c.getValue() }),
				events: {
					keydown: (c, e) => {
						if (e.keyCode == 13 && this.elem) {
							this._getNode('agree').getToggleBox().getElement().focus();
							e.preventDefault();
						}
					}
				}
			})),
			n.component('agree', new LabelToggleBox(
				new Elem(n => n.elem('div', { className: 'login-register--agree' }, [
					n.component(new Txt(l10n.l('login.agreePrefix', "I agree to the "))),
					n.component(new Txt(l10n.l('login.privacyPolicy', "privacy policy"), {
						tagName: 'a',
						className: 'link',
						attributes: {
							href: 'javascript:;'
						},
						events: {
							click: (c, ev) => {
								this.module.policies.openPolicy('privacy');
								ev.preventDefault();
							}
						}
					})),
					n.component(new Txt(l10n.l('login.agreeMid', " and "))),
					n.component(new Txt(l10n.l('login.terms', "terms"), {
						tagName: 'a',
						className: 'link',
						attributes: {
							href: 'javascript:;'
						},
						events: {
							click: (c, ev) => {
								this.module.policies.openPolicy('terms');
								ev.preventDefault();
							}
						}
					})),
					n.component(new Txt(l10n.l('login.agreeSuffix', "."))),
				])),
				this.model.agree,
				{
					className: 'common--formmargin ',
					onChange: v => this.model.set({ agree: v }),
				}
			)),
			n.component('message', new Collapser(null)),
			n.component('submit', new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', {
					events: { click: () => this._onRegister(this.model) },
					className: 'btn large primary login--login pad-top-xl login--btn'
				}, [
					n.elem('spinner', 'div', { className: 'spinner fade hide' }),
					n.component(new Txt(l10n.l('login.register', "Register player")))
				])),
				(m, c) => c.setProperty('disabled', m.name.trim() && m.pass.trim().length >= 4 && m.agree ? null : 'disabled')
			))
		])), {
			title: l10n.l('login.register', "Register"),
			close: () => {
				this._clearState();
				this.close();
			}
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.state.register = this.model.toJSON();
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_defaultState() {
		return {
			name: "",
			email: "",
			pass: "",
			agree: false
		};
	}

	_clearState() {
		let o = this._defaultState();
		this.state.register = o;
		if (this.model) {
			this.model.set(o);
		}
	}

	_setSpinner(show) {
		if (this.elem) {
			let cl = this._getNode('submit').getComponent().getNode('spinner').classList;
			cl[show ? 'remove' : 'add']('hide');
		}
	}

	_onRegister(model) {
		if (this.registerPromise) return;

		this._setSpinner(true);

		this.registerPromise = this.module.self.register(model.name, model.pass, model.email)
			.then(() => {
				this._clearState();
				this.close();
			})
			.catch(err => {
				this._setMessage(l10n.l(err.code, err.message, err.data));
				this.registerPromise = null;
				this._setSpinner(false);
			});
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

export default LoginRegister;
