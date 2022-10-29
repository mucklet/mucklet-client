import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PasswordInput from 'components/PasswordInput';
import ScreenDialog from 'components/ScreenDialog';

/**
 * PasswordReset draws the password reset screen.
 */
class PasswordResetComponent {
	constructor(module, code, state, opt) {
		opt = opt || {};
		this.module = module;
		this.code = code;
		this.state = state;
		state.reset = Object.assign({
			pass: ''
		}, state.reset);
		this.autoLogin = !!opt.hasOwnProperty('auto');
	}

	render(el) {
		this.model = new Model({ data: this.state.reset, eventBus: this.module.self.app.eventBus });

		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'passwordreset' }, [
			n.elem('label', { className: 'flex-1', attributes: { for: 'password' }}, [
				n.elem('h3', [
					n.component(new Txt(l10n.l('login.newPassword', "New password"))),
					n.component(new Txt(" *", { className: 'common--error' }))
				])
			]),
			n.component('password', new PasswordInput(this.model.pass, {
				className: 'common--formmargin',
				inputOpt: { attributes: { name: 'password', id: 'password' }},
				onInput: c => this.model.set({ pass: c.getValue() }),
			})),
			n.component('message', new Collapser(null)),
			n.component('submit', new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', {
					events: { click: () => this._onReset(this.model) },
					className: 'btn large primary passwordreset--login pad-top-xl passwordreset--btn'
				}, [
					n.elem('spinner', 'div', { className: 'spinner fade hide' }),
					n.component(new Txt(l10n.l('passwordReset.resetPassword', "Reset password")))
				])),
				(m, c) => c.setProperty('disabled', m && m.pass.trim().length >= 4 ? null : 'disabled')
			))
		])), {
			title: l10n.l('passwordReset.resetPassword', "Reset password")
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.state.reset = this._getState();
			this.elem.unrender();
			this.elem = null;
		}
	}

	_getState() {
		let c = this.elem.getComponent();
		return {
			password: c.getNode('password').getValue()
		};
	}

	_clearState() {
		if (this.elem) {
			let c = this.elem.getComponent();
			c.getNode('password').setValue('');
		}
		this.state.reset = { password: '' };
	}

	_setSpinner(show) {
		if (this.elem) {
			let cl = this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList;
			cl[show ? 'remove' : 'add']('hide');
		}
	}

	_onReset() {
		if (!this.elem || this.resetPromise) return;

		let { password } = this._getState();
		this._setSpinner(true);

		this.resetPromise = this.module.self.resetPassword(this.code, password)
			.catch(err => {
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
}

export default PasswordResetComponent;
