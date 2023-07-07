import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import './dialogCardPayment.scss';

class DialogCardPayment {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'stripe',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to make a card payment.
	 * @param {string} offerId Offer ID
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.returnUrl] Url to redirect to after payment attempt.
	 * @param {string} [opt.onSuccess] Callback called on success that doesn't require redirect: function(paymentIntent)
	 * @returns {Promise} Promise to the opened dialog object.
	 */
	open(offerId, opt) {
		if (this.dialog) return;

		this.dialog = true;

		opt = opt || {};
		return this.module.stripe.newCardPaymentPromise(offerId, Object.assign({}, opt, {
			onSuccess: paymentIntent => {
				if (this.dialog) {
					this.dialog.close();
				}
				if (opt.onSuccess) {
					opt.onSuccess(paymentIntent);
				}
			},
		})).then(paymentComponent => {
			this.dialog = new Dialog({
				title: l10n.l('dialogCardPayment.cardPayment', "Card payment"),
				className: 'dialogcardpayment',
				content: paymentComponent,
				onClose: () => { this.dialog = null; },
			});
			this.dialog.open();
		});
	}
}

export default DialogCardPayment;
