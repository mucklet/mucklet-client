import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PasswordInput from 'components/PasswordInput';
import ScreenDialog from 'components/ScreenDialog';
import PasswordResetProof from './PasswordResetProof';

/**
 * PasswordReset draws the password reset screen.
 */
class PasswordResetComponent {
	constructor(module, code, requireProof, state, opt) {
		opt = opt || {};
		this.module = module;
		this.code = code;
		this.requireProof = requireProof;
		this.state = state;
		state.reset = Object.assign({
			username: '',
			realm: '',
			charName: '',
			pass: '',
		}, state.reset);
		this.autoLogin = !!opt.hasOwnProperty('auto');
		this.realm = opt.realm || null;
	}

	render(el) {
		this.model = new Model({ data: this.state.reset, eventBus: this.module.self.app.eventBus });

		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'passwordreset' }, [
			n.component(this.requireProof
				? new PasswordResetProof(this.model, this.realm)
				: null,
			),
			n.component(new Txt(
				l10n.l('resetPassword.newPasswordDisclaimer', "Enter a new password for the account."),
				{ tagName: 'div', className: 'passwordreset--disclaimer' },
			)),
			n.elem('label', { className: 'flex-1', attributes: { for: 'password' }}, [
				n.elem('h3', [
					n.component(new Txt(l10n.l('login.newPassword', "New password"))),
					n.component(new Txt(" *", { className: 'common--error' })),
				]),
			]),
			n.component(new PasswordInput(this.model.pass, {
				className: 'common--formmargin',
				inputOpt: { attributes: {
					name: 'password',
					id: 'password',
					autocomplete: 'new-password',
				}},
				onInput: c => this.model.set({ pass: c.getValue() }),
			})),
			n.component('message', new Collapser(null)),
			n.component('submit', new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', {
					events: { click: () => this._onReset(this.model) },
					className: 'btn large primary passwordreset--reset pad-top-xl passwordreset--btn',
				}, [
					n.elem('spinner', 'div', { className: 'spinner spinner--btn fade hide' }),
					n.component(new Txt(l10n.l('passwordReset.resetPassword', "Reset password"))),
				])),
				(m, c) => c.setProperty('disabled', this._isComplete(m) ? null : 'disabled'),
			)),
		])), {
			title: l10n.l('passwordReset.resetPassword', "Reset password"),
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.state.reset = Object.assign({}, this.model?.props);
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setSpinner(show) {
		if (this.elem) {
			let cl = this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList;
			cl[show ? 'remove' : 'add']('hide');
		}
	}

	_onReset(m) {
		if (this.resetPromise) return;

		this._setSpinner(true);

		this.resetPromise = this.module.self.resetPassword(this.code, m.pass, this.requireProof && {
			username: m.username,
			realm: m.realm,
			charName: m.charName,
		}).catch(err => {
			this.resetPromise = null;
			this._setSpinner(false);
			this._setMessage(l10n.l(err.code, err.message, err.data));
		});
	}

	_setMessage(msg) {
		if (this.elem) {
			let n = this.elem.getComponent().getNode('message');
			n.setComponent(msg ? new Txt(msg, { className: 'passwordreset--message' }) : null);
		}
	}

	// Check if the form is filled out completely
	_isComplete(m) {
		return m && m.pass.trim().length >= 4 &&
			(
				!this.requireProof || (
					// Proof by username
					m.username?.trim().length >= 4
				) || (
					// Proof by realm and char name
					m.realm?.length >= 3 && m.charName.trim().match(/^[^\s]+\s+[^\s]/)
				)
			);
	}
}

export default PasswordResetComponent;
