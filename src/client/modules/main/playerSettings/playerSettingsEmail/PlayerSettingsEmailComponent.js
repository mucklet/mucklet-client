import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';

class PlayerSettingsEmailComponent {
	constructor(module, user, player, state) {
		this.module = module;
		this.user = user;
		this.identity = user.identity;
		this.player = player;
		this.state = state;
	}

	render(el) {
		let components = {};
		this.elem = new PanelSection(
			l10n.l('playerSettingsEmail.email', "Email"),
			new Elem(n => n.elem('div', [
				n.component(new ModelComponent(
					this.identity,
					new Fader(),
					(m, c) => {
						let comp = null;
						if (!this.identity.email) {
							comp = components.setEmail = components.setEmail || new Elem(n => n.elem('button', { events: {
								click: () => this.module.dialogChangeEmail.open({ setEmail: true })
							}, className: 'btn medium light  full-width icon-left' }, [
								n.component(new FAIcon('at')),
								n.component(new Txt(l10n.l('playerSettingsEmail.setEmailAddress', "Set email address")))
							]));
						} else if (this.identity.hasOpenId && this.identity.emailVerified) {
							comp = components.staticEmail = components.staticEmail || new ModelTxt(this.identity, m => m.email, { className: 'playersettingsemail--email' });
						} else {
							comp = components.changeEmail = components.changeEmail || new Elem(n => n.elem('button', {
								events: {
									click: () => this.module.dialogChangeEmail.open()
								},
								className: 'btn medium light  full-width icon-left'
							}, [
								n.component(new FAIcon('pencil')),
								n.component(new ModelComponent(
									this.identity,
									new Txt('', { className: 'playersettingsemail--email' }),
									(m, c) => {
										c.setText(m.email);
										c.setAttribute('title', m.email);
									}
								))
							]));
						}
						c.setComponent(comp);
					}
				)),
				n.component(new ModelComponent(
					this.identity,
					new Collapser(),
					(m, c) => {
						let comp = null;
						if (this.identity.email && !this.identity.emailVerified) {
							comp = components.sendVerify = components.sendVerify || new Elem(n => n.elem('div', { className: 'pad-bottom-l' }, [
								n.elem('div', { className: 'common--relative' }, [
									n.component(new Txt(l10n.l('playerSettingsEmail.verificationRequired', "Address requires verification."), { tagName: 'div', className: 'common--error common--formmargin' })),
									n.elem('alert', 'div', { className: 'counter small alert' })
								]),
								n.elem('button', { events: {
									click: () => this.module.verifyEmail.sendVerification()
								}, className: 'btn small primary icon-left full-width' }, [
									n.component(new ModelComponent(
										this.module.verifyEmail.getModel(),
										new Fader(null, { className: 'fa' }),
										(m, c) => {
											if (m && !m.hasOwnProperty('isSendingVerify')) {
												return;
											}
											c.setComponent(m.isSendingVerify
												? new Elem(n => n.elem('div', { className: 'spinner small dark' }))
												: new FAIcon('paper-plane')
											);
										}
									)),
									n.component(new Txt(l10n.l('playerSettingsEmail.sendNewVerification', "Send new verification")))
								])
							]));
						}
						c.setComponent(comp);
					}
				)),
				n.component(new ModelComponent(
					this.identity,
					new Collapser(),
					(m, c) => {
						let comp = null;
						if (this.identity.email) {
							comp = components.emailPermissions = components.emailPermissions || new Elem(n => n.elem('div', [
								n.component(new ModelComponent(
									this.identity,
									new LabelToggleBox(l10n.l('notify.receiveNewsletter', "Receive newsletter"), false, {
										className: 'common--formmargin',
										onChange: (v, c) => this.identity.call('set', { allowNewsletter: v }).catch(err => {
											c.setValue(this.identity.allowNewsletter, false);
										}),
										popupTip: l10n.l('notify.receiveNewsletterInfo', "Allow newsletters with game related info to be sent to you, at most once a month."),
										popupTipClassName: 'popuptip--width-s'
									}),
									(m, c) => c.setValue(m.allowNewsletter, false)
								)),
							]));
						}
						c.setComponent(comp);
					}
				))
			])),
			{
				className: 'common--sectionpadding',
				noToggle: true
			}
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

export default PlayerSettingsEmailComponent;
