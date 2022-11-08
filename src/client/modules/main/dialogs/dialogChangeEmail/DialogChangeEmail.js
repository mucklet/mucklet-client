import { Elem, Txt, Input } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PasswordInput from 'components/PasswordInput';
import FAIcon from 'components/FAIcon';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import './dialogChangeEmail.scss';

class DialogChangeEmail {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'login',
			'verifyEmail',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to change account email.
	 * @param {object} [opt] Optional parameters
	 * @param {object} [opt.setEmail] Flag to show the title "Set email" instead of "Change email"
	 */
	open(opt) {
		if (this.dialog) return;

		opt = opt || {};

		let model = new Model({ data: {
			email: "",
			pass: "",
			showPass: false,
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: opt.setEmail
				? l10n.l('dialogChangeEmail.setEmail', "Set email")
				: l10n.l('dialogChangeEmail.changeEmail', "Change email"),
			className: 'dialogchangeemail',
			content: new Elem(n => n.elem('div', [
				n.component('email', new PanelSection(
					opt.setEmail
						? l10n.l('dialogChangeEmail.email', "Email")
						: l10n.l('dialogChangeEmail.newEmail', "New email"),
					new Input(model.email, {
						events: { input: c => model.set({ email: c.getValue() }) },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('dialogChangeEmail.passwordVerification', "Password verification"),
					new PasswordInput(model.pass, {
						onInput: c => model.set({ pass: c.getValue() }),
						inputOpt: { className: 'dialog--input' },
						className: 'darkeye',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogChangeEmail.passwordVerificationInfo', "Verify yourself with your game account password.\nNever share your email account password."),
					},
				)),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('dialogChangeEmail.passwordWarning', "Not your email account password"))),
				]),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('button', {
						events: { click: () => this._changeEmail(model) },
						className: 'btn primary dialog--btn',
					}, [
						n.component(new Txt(opt.setEmail
							? l10n.l('dialogChangeEmail.setEmail', "Set email")
							: l10n.l('dialogChangeEmail.changeEmail', "Change email"),
						)),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('email').getComponent().getElement().focus();
	}

	_changeEmail(model) {
		if (this.changeEmailPromise) return this.changeEmailPromise;

		let pwd = model.pass.trim();
		let pass = sha256(pwd);
		let hash = hmacsha256(pwd, publicPepper);
		let email = model.email.trim();

		this.module.login.getLoginPromise()
			.then(user => user.identity.call('changeEmail', { email, pass, hash }))
			.then(result => {
				if (this.dialog) {
					this.dialog.close();
				}
				if (result.updated && result.email) {
					this.module.verifyEmail.sendVerification();
				}
			})
			.catch(err => {
				if (!this.dialog) return;
				this._setMessage(l10n.l(err.code, err.message, err.data));
			})
			.then(() => {
				this.changeEmailPromise = null;
			});

		return this.changeEmailPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogChangeEmail;
