import { Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import awaitMailSent from 'utils/awaitMailSent';

/**
 * VerifyEmail sends email verification and shows the result in a toaster.
 */
class VerifyEmail {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.model = new Model({ data: { isSendingVerify: false }, eventBus: this.app.eventBus });
	}

	getModel() {
		return this.model;
	}

	/**
	 * Sends an verification mail to the account's email address.
	 * @param {Model} account Account model.
	 * @returns {Promise} Promise of the verification email being sent.
	 */
	sendVerification(account) {
		// Prevent sending multiple times.
		if (this.model.isSendingVerify) {
			return Promise.resolve();
		}

		this.model.set({ isSendingVerify: true });
		return (account
			? Promise.resolve(account)
			: Promise.reject(new Err('verifyEmail.missingAccount', "Not possible to send email verification from this domain."))
		)
			.then(account => account.call('sendEmailVerification'))
			.then(awaitMailSent).then(() => {
				this.module.toaster.open({
					title: l10n.l('verifyEmail.emailVerificationSent', "Verification email sent"),
					content: new Txt(l10n.l('verifyEmail.emailSentBody', "Check your inbox for a verification mail.")),
					closeOn: 'click',
					type: 'success',
					autoclose: true,
				});
			})
			.catch(err => {
				this.module.toaster.openError(err, {
					title: l10n.l('verifyEmail.verificationIssue', "Email verification issue"),
				});
			})
			.then(() => this.model.set({ isSendingVerify: false }));
	}
}

export default VerifyEmail;
