import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';

class AccountEmailButton {
	constructor(module, account, opt) {
		this.module = module;
		this.account = account;
		this.opt = opt || {};
	}

	render(el) {
		let components = {};
		let fullWidth = this.opt.fullWidth ? ' full-width' : '';
		this.elem = new Elem(n => n.elem('div', { className: 'accountemail' + (this.opt.className ? ' ' + this.opt.className : '') }, [
			n.component(new ModelComponent(
				this.account,
				new Fader(),
				(m, c) => {
					let comp = null;
					if (!this.account.email) {
						comp = components.setEmail = components.setEmail || new Elem(n => n.elem('button', { events: {
							click: () => this.module.dialogChangeEmail.open(this.account, { setEmail: true }),
						}, className: 'btn medium light icon-left' + fullWidth }, [
							n.component(new FAIcon('at')),
							n.component(new Txt(l10n.l('accountEmail.setEmailAddress', "Set email address"))),
						]));
					} else if (this.account.hasOpenId && this.account.emailVerified) {
						comp = components.staticEmail = components.staticEmail || new ModelTxt(this.account, m => m.email, { className: 'accountemail--email' });
					} else {
						comp = components.changeEmail = components.changeEmail || new Elem(n => n.elem('button', {
							events: {
								click: () => this.module.dialogChangeEmail.open(this.account),
							},
							className: 'btn medium light icon-left' + fullWidth,
						}, [
							n.component(new FAIcon('pencil')),
							n.component(new ModelComponent(
								this.account,
								new Txt('', { className: 'accountemail--email' }),
								(m, c) => {
									c.setText(m.email);
									c.setAttribute('title', m.email);
								},
							)),
						]));
					}
					c.setComponent(comp);
				},
			)),
			n.component(new ModelComponent(
				this.account,
				new Collapser(),
				(m, c) => c.setComponent(m.email && m.emailVerified
					? null
					: components.alert = components.alert || new Elem(n => n.elem('div', { className: 'pad-top-s' }, [
						n.elem('div', { className: 'common--relative' }, [
							n.component(new ModelTxt(
								this.account,
								m => m.email
									? l10n.l('accountEmail.verificationRequired', "Address requires verification.")
									: l10n.l('accountEmail.recoverRequiresEmail', "Recovery requires email."),
								{ tagName: 'div', className: 'common--error' },
							)),
							n.elem('alert', 'div', { className: 'counter small alert' }),
						]),
					])),
				),
			)),
			n.component(new ModelComponent(
				this.account,
				new Collapser(),
				(m, c) => {
					let comp = null;
					if (this.account.email && !this.account.emailVerified) {
						comp = components.sendVerify = components.sendVerify || new Elem(n => n.elem('div', { className: 'pad-top-l pad-bottom-l' }, [
							n.elem('button', { events: {
								click: () => this.module.verifyEmail.sendVerification(this.account),
							}, className: 'btn small primary icon-left' + fullWidth }, [
								n.component(new ModelComponent(
									this.module.verifyEmail.getModel(),
									new Fader(null, { className: 'fa' }),
									(m, c) => {
										if (m && !m.hasOwnProperty('isSendingVerify')) {
											return;
										}
										c.setComponent(m.isSendingVerify
											? new Elem(n => n.elem('div', { className: 'spinner small dark' }))
											: new FAIcon('paper-plane'),
										);
									},
								)),
								n.component(new Txt(l10n.l('accountEmail.sendNewVerification', "Send new verification"))),
							]),
						]));
					}
					c.setComponent(comp);
				},
			)),
			n.component(new ModelComponent(
				this.account,
				new Collapser(),
				(m, c) => {
					let comp = null;
					if (this.account.email) {
						comp = components.emailPermissions = components.emailPermissions || new Elem(n => n.elem('div', [
							n.component(new ModelComponent(
								this.account,
								new LabelToggleBox(l10n.l('notify.receiveNewsletter', "Receive newsletter"), false, {
									className: 'common--formmargin',
									onChange: (v, c) => this.account.call('set', { allowNewsletter: v }).catch(err => {
										c.setValue(this.account.allowNewsletter, false);
									}),
									popupTip: l10n.l('notify.receiveNewsletterInfo', "Allow newsletters with game related info to be sent to you, at most once a month."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => c.setValue(m.allowNewsletter, false),
							)),
						]));
					}
					c.setComponent(comp);
				},
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default AccountEmailButton;
