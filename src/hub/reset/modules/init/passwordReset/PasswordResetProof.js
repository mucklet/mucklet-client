import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import PopupTip from 'components/PopupTip';

/**
 * PasswordReset draws the password reset proof section.
 */
class PasswordResetProof {

	/**
	 * Creates an instance of PasswordResetProof.
	 * @param {Model<Partial<{ username: string, realm: string, charName: string }} model Model to set values to.
	 * @param {Model<{ name: string, key: string } | null} realm Realm model.
	 */
	constructor(model, realm) {
		this.model = model;
		this.realm = realm;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'passwordreset-proof' }, [
			n.component(new Txt(l10n.l('resetPassword.recoverByAccountDisclaimer', "Enter the account name."), { tagName: 'div', className: 'passwordreset--disclaimer' })),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'username' }}, [
					n.elem('h3', [
						n.component(new Txt(l10n.l('resetPassword.accountName', "Account name"))),
					]),
				]),
				n.component(new PopupTip(l10n.l('resetPassword.accountNameInfo', "Account name is your login name for the account that we are resetting the password for."), { className: 'popuptip--width-m flex-auto' })),
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
			n.elem('div', { className: 'passwordreset--divider small-margin' }, [
				n.component(new Txt(l10n.l('resetPassword.or', 'or'), { tagName: 'h3' })),
			]),
			n.component(this.realm
				? new Elem(n => n.elem('div', [
					n.elem('div', { className: 'passwordreset--disclaimer' }, [
						n.component(new Txt(l10n.l('resetPassword.recoverByCharacterDisclaimer', "Enter full name of your character in realm:"), { tagName: 'div' })),
						n.component(new ModelTxt(this.realm, m => {
							this.model.set({ realm: m.key });
							return m.name;
						}, { tagName: 'div', className: 'passwordreset-proof--realmname' })),
					]),
				]))
				: new Elem(n => n.elem('div', [
					n.component(new Txt(
						l10n.l('resetPassword.recoverByRealmAndCharacterDisclaimer', "Enter a realm and character by full name."),
						{ tagName: 'div', className: 'passwordreset--disclaimer' },
					)),
					n.elem('div', { className: 'flex-row flex-baseline' }, [
						n.elem('label', { className: 'flex-1', attributes: { for: 'realm' }}, [
							n.elem('h3', [
								n.component(new Txt(l10n.l('resetPassword.realm', "Realm"))),
							]),
						]),
						n.component(new PopupTip(l10n.l('resetPassword.realmInfo', "The name of a realm where you have at least one character."), { className: 'popuptip--width-m flex-auto' })),
					]),
					n.component('realm', new Input(this.model.realm, {
						className: 'common--formmargin',
						attributes: { spellcheck: 'false', name: 'realm', id: 'realm' },
						events: {
							input: c => this.model.set({ realm: c.getValue() }),
						},
					})),
				])),
			),
			n.elem('div', { className: 'flex-row flex-baseline' }, [
				n.elem('label', { className: 'flex-1', attributes: { for: 'username' }}, [
					n.elem('h3', [
						n.component(new Txt(l10n.l('resetPassword.characterName', "Character name"))),
					]),
				]),
				n.component(new PopupTip(l10n.l('resetPassword.characterNameInfo', "Full name of one of your characters from the realm."), { className: 'popuptip--width-m flex-auto' })),
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
			n.elem('div', { className: 'passwordreset--divider' }, [
				n.component(new Txt(l10n.l('resetPassword.and', 'and'), { tagName: 'h3' })),
			]),
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

export default PasswordResetProof;
