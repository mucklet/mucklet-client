import { Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';

/**
 * VerifyEmail sends email verification and shows the result in a toaster.
 */
class VerifyEmail {

	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'toaster', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.model = new Model({ data: { isSendingVerify: false }, eventBus: this.app.eventBus });
	}

	getModel() {
		return this.model;
	}

	sendVerification() {
		// Prevent sending multiple times.
		if (this.model.isSendingVerify) {
			return Promise.resolve();
		}

		this.model.set({ isSendingVerify: true });
		return this.module.login.getLoginPromise()
			.then(user => {
				if (!user.identity) {
					throw { code: 'verifyEmail.identityNotAvailable', message: "Not possible to send email verification from this domain." };
				}

				return user.identity.call('sendEmailVerification');
			})
			.then(() => {
				this.module.toaster.open({
					title: l10n.l('verifyEmail.emailVerificationSent', "Verification email sent"),
					content: new Txt(l10n.l('verifyEmail.emailSentBody', "Check your inbox for a verification mail.")),
					closeOn: 'click',
					type: 'success',
					autoclose: true
				});
			})
			.catch(err => {
				this.module.toaster.openError(err, {
					title: l10n.l('verifyEmail.verificationIssue', "Email verification issue")
				});
			})
			.then(() => this.model.set({ isSendingVerify: false }));
	}
}

export default VerifyEmail;
