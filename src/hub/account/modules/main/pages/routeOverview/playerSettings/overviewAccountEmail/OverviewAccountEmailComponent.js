import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';

class OverviewAccountEmailComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
		this.state = state;
	}

	render(el) {
		let components = {};
		this.elem = new PanelSection(
			l10n.l('overviewAccountEmail.email', "Email"),
			new Elem(n => n.elem('div', [
				n.component(new ModelComponent(
					this.user,
					new Fader(),
					(m, c) => {
						let comp = null;
						if (!this.user.email) {
							comp = components.setEmail = components.setEmail || new Elem(n => n.elem('button', { events: {
								click: () => this.module.dialogChangeEmail.open({ setEmail: true }),
							}, className: 'btn medium light icon-left' }, [
								n.component(new FAIcon('at')),
								n.component(new Txt(txtSetEmailAddress)),
							]));
						} else if (this.user.hasOpenId && this.user.emailVerified) {
							comp = components.staticEmail = components.staticEmail || new ModelTxt(this.user, m => m.email, { className: 'overviewaccountemail--email' });
						} else {
							comp = components.changeEmail = components.changeEmail || new Elem(n => n.elem('button', {
								events: {
									click: () => this.module.dialogChangeEmail.open(),
								},
								className: 'btn medium light icon-left',
							}, [
								n.component(new FAIcon('pencil')),
								n.component(new ModelComponent(
									this.user,
									new Txt('', { className: 'overviewaccountemail--email' }),
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
					this.user,
					new Collapser(),
					(m, c) => {
						let comp = null;
						if (this.user.email && !this.user.emailVerified) {
							comp = components.sendVerify = components.sendVerify || new Elem(n => n.elem('div', { className: 'pad-bottom-l' }, [
								n.elem('div', { className: 'common--relative' }, [
									n.component(new Txt(l10n.l('overviewAccountEmail.verificationRequired', "Address requires verification."), { tagName: 'div', className: 'common--error common--formmargin' })),
									n.elem('alert', 'div', { className: 'counter small alert' }),
								]),
								n.elem('button', { events: {
									click: () => this.module.verifyEmail.sendVerification(),
								}, className: 'btn small primary icon-left' }, [
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
									n.component(new Txt(l10n.l('overviewAccountEmail.sendNewVerification', "Send new verification"))),
								]),
							]));
						}
						c.setComponent(comp);
					},
				)),
				n.component(new ModelComponent(
					this.user,
					new Collapser(),
					(m, c) => {
						let comp = null;
						if (this.user.email) {
							comp = components.emailPermissions = components.emailPermissions || new Elem(n => n.elem('div', [
								n.component(new ModelComponent(
									this.user,
									new LabelToggleBox(l10n.l('notify.receiveNewsletter', "Receive newsletter"), false, {
										className: 'common--formmargin',
										onChange: (v, c) => this.user.call('set', { allowNewsletter: v }).catch(err => {
											c.setValue(this.user.allowNewsletter, false);
										}),
										popupTip: l10n.l('notify.receiveNewsletterInfo', "Allow newsletters with game related info to be sent to you, at most once a month."),
									}),
									(m, c) => c.setValue(m.allowNewsletter, false),
								)),
							]));
						}
						c.setComponent(comp);
					},
				)),
			])),
			{
				className: 'common--sectionpadding',
				noToggle: true,
			},
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewAccountEmailComponent;
