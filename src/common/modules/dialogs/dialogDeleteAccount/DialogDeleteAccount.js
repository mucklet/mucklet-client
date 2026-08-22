import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import PasswordInput from 'components/PasswordInput';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';
import { redirect } from 'utils/reload';
import ModelCollapser from 'components/ModelCollapser';
import responseParseError from 'utils/responseParseError';
import FAIcon from 'components/FAIcon';
import './dialogDeleteAccount.scss';
import PanelSection from 'components/PanelSection';
import ErrorCollapser from 'components/ErrorCollapser';

const accountDeleteUrl = API_IDENTITY_PATH + 'account/delete?noredirect';
const accountDeleteGoogleUrl = API_IDENTITY_PATH + 'account/delete/google';
const crossOrigin = API_CROSS_ORIGIN;

const day = 1000 * 60 * 60 * 24; // Day in milliseconds

/**
 * DialogDeleteAccount confirms a destructive account deletion request.
 */
class DialogDeleteAccount {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	async open(user) {
		if (this.dialog) return;

		const [ paymentUser, identityInfo ] = await Promise.all([
			this.module.api.get('payment.user.' + user.id),
			this.module.api.get('identity.info'),
		]);

		const model = new Model({ data: { password: '' }, eventBus: this.app.eventBus });
		const message = new ErrorCollapser();

		this.dialog = new Dialog({
			title: l10n.l('dialogDeleteAccount.title', "Delete account"),
			className: 'dialogdeleteaccount',
			content: new Elem(n => n.elem('div', [
				n.elem('div', { className: 'dialogdeleteaccount--warning' }, [
					n.component(new Txt(l10n.l('dialogDeleteAccount.deleteConfirmBody1', "Do you really wish to delete your account?"), { tagName: 'p' })),
					n.component(new Txt(l10n.l('dialogDeleteAccount.deleteConfirmBody2', "Deletion immediately removes access to all realms."), { tagName: 'p' })),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new ModelTxt(identityInfo, m => l10n.l('dialogDeleteAccount.deleteConfirmWarning', "Identity information will be wiped after {days} days.", { days: String(Math.round(m.accountDeleteDuration / day)) }))),
					]),
					n.component(new ModelCollapser(paymentUser, [{
						condition: m => m?.subscription,
						factory: m => new Txt(l10n.l('dialogDeleteAccount.subscriptionCanceled', "Your current subscription will be canceled."), { tagName: 'p' }),
					}])),
					n.component(new ModelCollapser(paymentUser, [{
						condition: m => m?.supporterUntil,
						factory: m => new ModelTxt(m => l10n.l('dialogDeleteAccount.subscriptionCanceled', "You still have supporter days until {date}. Unused time is not refunded.", { date: formatDate(new Date(m.supporterUntil), { showYear: true }) }, { tagName: 'p' })),
					}])),
				]),

				n.component(new ModelCollapser(user, [{
					condition: m => m.hasLogin,
					factory: m => new PanelSection(
						l10n.l('dialogDeleteAccount.currentPassword', "Current password"),
						new PasswordInput(model.password, {
							onInput: c => model.set({ password: c.getValue() }),
							iconClassName: 'dialog--input-icon',
							inputOpt: {
								className: 'dialog--input',
								attributes: {
									id: 'delete-account-password',
									name: 'password',
									placeholder: l10n.t('dialogDeleteAccount.confirmWithPassword', "Confirm with password"),
								},
							},
						}),
						{
							className: 'common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('dialogDeleteAccount.passwordVerificationInfo', "Verify yourself with your game account password."),
						},
					),
				}])),

				n.component(message),

				n.elem('div', { className: 'dialog--footer flex-row' }, [
					...(user.hasLogin
						? [
							n.elem('button', {
								className: 'btn warning',
								events: { click: () => this._deleteWithPassword(model, message) },
							}, [
								n.component(new Txt(l10n.l('dialogDeleteAccount.deleteWithPassword', "Delete account"))),
							]),
						]
						: []
					),
					...(user.openIdProvider == 'google'
						? [
							n.elem('button', {
								className: 'btn google dialog--btn',
								events: { click: () => this._deleteWithGoogle() },
							}, [
								n.component(new Txt(l10n.l('dialogDeleteAccount.deleteWithGoogle', "Verify with Google and delete"))),
							]),
						]
						: []
					),
				]),
			])),
			onClose: () => {
				this.dialog = null;
				this.model = null;
			},
		});
		this.dialog.open();
	}

	_deleteWithPassword(model, message) {
		if (!this.dialog || this.deletePromise) {
			return null;
		}

		// Clear previous message
		message.setError();

		const password = model.password.trim();

		let formData = new FormData();
		formData.append('pass', sha256(password));
		formData.append('hash', hmacsha256(password, publicPepper));
		this.deletePromise = fetch(accountDeleteUrl, {
			body: formData,
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (!resp.ok) {
				return resp.json().then(err => { throw err; }, responseParseError(resp));
			}
			return resp.json();
		}).then(result => {
			this.dialog?.close();
			redirect(AUTH_LOGIN_URL + '?accountDeleted=1&deleteAt=' + encodeURIComponent(result.deleteAt), false);
		}).catch(err => {
			this.deletePromise = null;
			message.setError(err);
		});
	}

	_deleteWithGoogle() {
		if (this.dialog) {
			redirect(accountDeleteGoogleUrl, false);
		}
	}

}

export default DialogDeleteAccount;
