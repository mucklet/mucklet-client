import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PopupTip from 'components/PopupTip';
import ScreenDialog from 'components/ScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';

/**
 * LoginRecover draws the forgot password screen dialog.
 */
class LoginRecover {
	constructor(module, state, close, opt) {
		this.module = module;
		this.state = state;
		this.close = close;
		this.realm = opt?.realm || null;
		state.forgotPass = state.forgotPass || this._defaultState();
		if (opt.hasOwnProperty('username')) {
			state.forgotPass.username = opt?.username;
		}
	}
	render(el) {
		this.model = new Model({ data: this.state.forgotPass, eventBus: this.module.self.app.eventBus });

		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-recover' }, [
			n.component(new Txt(this.realm
				? l10n.l('login.recoverByAccountOptionDisclaimer', "Enter the account name if you remember it.")
				: l10n.l('login.recoverByAccountDisclaimer', "Enter the account name."), { tagName: 'div', className: 'login-register--disclaimer' })),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'username' }}, [
					n.elem('h3', [
						n.component(new Txt(l10n.l('login.accountName', "Account name"))),
					]),
				]),
				n.component(new PopupTip(l10n.l('login.accountNameInfo', "Account name is your login name used when registering your account."), { className: 'popuptip--width-m flex-auto' })),
			]),
			n.component('player', new Input(this.model.username, {
				className: 'common--formmargin autocomplete',
				attributes: { spellcheck: 'false', name: 'username', id: 'username', autocomplete: 'username' },
				events: {
					input: c => this.model.set({ username: c.getValue() }),
					keydown: (c, e) => {
						if (e.keyCode == 13 && this.elem) {
							this._onRecover(this.model);;
						}
					},
				},
			})),
			n.component(this.realm
				? new Elem(n => n.elem('div', [
					n.elem('div', { className: 'login--divider small-margin' }, [
						n.component(new Txt(l10n.l('login.or', 'or'), { tagName: 'h3' })),
					]),
					n.elem('div', { className: 'login-register--disclaimer' }, [
						n.component(new Txt(l10n.l('login.recoverByCharacterDisclaimer', "Enter full name of your character in realm:"), { tagName: 'div' })),
						n.component(new ModelTxt(this.realm, m => m.name, { tagName: 'div', className: 'login-register--realmname' })),
					]),
					n.elem('div', { className: 'flex-row flex-baseline' }, [
						n.elem('label', { className: 'flex-1', attributes: { for: 'username' }}, [
							n.elem('h3', [
								n.component(new Txt(l10n.l('login.characterName', "Character name"))),
							]),
						]),
						n.component(new PopupTip(l10n.l('login.characterNameInfo', "Full name of one of your characters from the realm. It is case insensitive."), { className: 'popuptip--width-m flex-auto' })),
					]),
					n.component('charName', new Input(this.model.charName, {
						className: 'common--formmargin',
						attributes: { spellcheck: 'false', name: 'charname', id: 'charname' },
						events: {
							input: c => this.model.set({ charName: c.getValue() }),
							keydown: (c, e) => {
								if (e.keyCode == 13 && this.elem) {
									this._onRecover(this.model);
								}
							},
						},
					})),
				]))
				: null,
			),
			n.component('message', new Collapser(null)),
			n.component('submit', new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', {
					events: { click: () => this._onRecover(this.model) },
					className: 'btn large primary login--login pad-top-xl login--btn',
				}, [
					n.elem('spinner', 'div', { className: 'spinner spinner--btn fade hide' }),
					n.component(new Txt(l10n.l('login.recoverAccount', "Recover account"))),
				])),
				(m, c) => c.setProperty('disabled', true ? null : 'disabled'),
			)),
			n.elem('div', { className: 'login--policies' }, [
				n.component(new Txt(l10n.l('login.contactSupport', "Contact support"), {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: 'mailto:support@mucklet.com',
						target: '_blank',
					},
				})),
			]),
		])), {
			title: l10n.l('login.recoverAccount', "Recover account"),
			close: () => {
				this._clearState();
				this.close();
			},
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
			username: "",
			realm: this.realm,
			charName: "",
		};
	}

	_clearState() {
		let o = this._defaultState();
		this.state.register = o;
		if (this.model) {
			this.model.set(o);
		}
	}

	_onRecover(model) {
		if (this.recoverPromise) return;

		if (this.elem) {
			this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList.remove('hide');
		}

		this.recoverPromise = this.module.self.recover(model.username, model.realm, model.charName)
			.then(() => {
				this._clearState();
				this.module.screen.addSubcomponent('recoverConfirm', new ConfirmScreenDialog({
					title: l10n.l('login.recoverLinkSent', "Recover mail sent"),
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('login.recoverConfirmBody1', "A mail with instructions has been sent to the email address registered with the account."), { tagName: 'p' })),
						n.component(new Txt(l10n.l('login.recoverConfirmBody2', "Check your inbox and spam folder."), { tagName: 'p' })),
					])),
					confirm: l10n.l('login.backToLogin', "Back to login"),
					onConfirm: () => this.module.screen.removeSubcomponent('recoverConfirm'),
				}));
				this.close();
			})
			.catch(err => {
				this._setMessage(l10n.l(err.code, err.message, err.data));
				this.recoverPromise = null;
				if (this.elem) {
					this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList.add('hide');
				}
			});
	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this.elem.getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}
}

export default LoginRecover;
