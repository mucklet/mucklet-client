import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PasswordInput from 'components/PasswordInput';
import changePasswordParams from 'utils/changePasswordParams';
import './dialogChangePassword.scss';

class DialogChangePassword {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(userId) {
		if (this.dialog) return;

		let model = new Model({ data: {
			oldPass: "",
			newPass: "",
			showPass: false,
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogChangePassword.changePassword', "Change password"),
			className: 'dialogchangepassword',
			content: new Elem(n => n.elem('div', [
				n.component('oldPass', new PanelSection(
					l10n.l('dialogChangePassword.oldPassword', "Old password"),
					new PasswordInput(model.oldPass, {
						onInput: c => model.set({ oldPass: c.getValue() }),
						inputOpt: { className: 'dialog--input' },
						className: 'darkeye',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('dialogChangePassword.newPassword', "New password"),
					new PasswordInput(model.newPass, {
						onInput: c => model.set({ newPass: c.getValue() }),
						inputOpt: { className: 'dialog--input' },
						className: 'darkeye',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.component(new ModelComponent(
						model,
						new Elem(n => n.elem('button', {
							events: { click: () => this._changePass(userId, model) },
							className: 'btn primary dialog--btn',
						}, [
							n.component(new Txt(l10n.l('dialogChangePassword.changePassword', "Change password"))),
						])),
						(m, c) => c.setProperty('disabled', m.newPass.trim().length >= 4 ? null : 'disabled'),
					)),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('oldPass').getComponent().getElement().focus();
	}

	_changePass(userId, model) {
		if (this.changePassPromise) return this.changePassPromise;

		this.module.api.call('identity.user.' + userId, 'changePassword', changePasswordParams(model.oldPass, model.newPass)).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
			this.module.toaster.open({
				title: l10n.l('dialogChangePassword.changeSuccessful', "Password changed"),
				content: new Txt(l10n.l('dialogChangePassword.changeSuccessfulBody', "Password was successfully changed.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			});
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.changePassPromise = null;
		});

		return this.changePassPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogChangePassword;
