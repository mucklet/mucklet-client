import l10n from 'modapp-l10n';
import * as txtCurrency from 'utils/txtCurrency';

const txtStatusMethods = {
	pending: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupPending', "Card setup pending")
			: l10n.l('txtPayment.cardPaymentPending', "Card payment pending"),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupPending', "PayPal setup pending")
			: l10n.l('txtPayment.paypalPaymentPending', "PayPal payment pending"),
	},
	refunded: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupRefunded', "Card setup refunded. Huh?")
			: payment.cost <= payment.amountRefunded
				? l10n.l('txtPayment.cardPaymentRefunded', "Card payment refunded")
				: l10n.l('txtPayment.cardPaymentRefunded', "Card payment partially refunded"),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupRefunded', "PayPal setup refunded. Huh?")
			: payment.cost <= payment.amountRefunded
				? l10n.l('txtPayment.paypalPaymentRefunded', "PayPal payment refunded")
				: l10n.l('txtPayment.paypalPaymentRefunded', "PayPal payment partially refunded"),
	},
	completed: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupSuccessful', "Card setup successful")
			: l10n.l('txtPayment.cardPaymentSuccessful', "Card payment successful"),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupSuccessful', "PayPal setup successful")
			: l10n.l('txtPayment.paypalPaymentSuccessful', "PayPal payment successful"),
	},
	canceled: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupCanceled', "Card setup canceled")
			: l10n.l('txtPayment.cardPaymentCanceled', "Card payment canceled"),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupCanceled', "PayPal setup canceled")
			: l10n.l('txtPayment.paypalPaymentCanceled', "PayPal payment canceled"),
	},
};

const txtStatusUnknown = l10n.l('txtPayment.unknownStatus', "Payment status unknown");

const txtStatusMethodDescs = {
	pending: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupPendingDesc', "Your setup for future payments is not yet completed.")
			: l10n.l('txtPayment.cardPaymentPendingDesc', "Your payment is not yet completed."),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupPendingDesc', "Your PayPal setup for future payments is not yet completed.")
			: l10n.l('txtPayment.paypalPaymentPendingDesc', "Your payment is not yet completed."),
	},
	refunded: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupRefundedDesc', "How did this happen? Nothing is charged when setting up a card, so how can it be refunded?")
			: l10n.l('txtPayment.cardPaymentRefundedDesc', "Your card payment has been refunded."),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupRefundedDesc', "How did this happen? Nothing is charged when setting up a PayPal account for subscriptions, so how can it be refunded?")
			: l10n.l('txtPayment.paypalPaymentRefundedDesc', "Your PayPal payment has been refunded."),
	},
	completed: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupSuccessfulDesc', "Your card has been setup for future payments.")
			: l10n.l('txtPayment.cardPaymentSuccessfulDesc', "Your payment of {cost} has been received.", { cost: l10n.t(txtCurrency.toLocaleString(payment.currency, payment.cost)) }),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupSuccessfulDesc', "Your PalPal account has been setup for future payments.")
			: l10n.l('txtPayment.paypalPaymentSuccessfulDesc', "Your payment of {cost} has been received.", { cost: l10n.t(txtCurrency.toLocaleString(payment.currency, payment.cost)) }),
	},
	canceled: {
		card: payment => payment.cost == 0
			? l10n.l('txtPayment.cardSetupCanceledDesc', "This card setup has been canceled.")
			: l10n.l('txtPayment.cardPaymentCanceledDesc', "This payment has been canceled."),
		paypal: payment => payment.cost == 0
			? l10n.l('txtPayment.paypalSetupCanceledDesc', "This PayPal account setup has been canceled.")
			: l10n.l('txtPayment.paypalPaymentCanceledDesc', "This payment has been canceled."),
	},
};

const txtStatusUnknownDesc = l10n.l('txtPayment.unknownStatusDesc', "We don't understand the status of this payment. How odd.");

const txtPaymentHeaders = {
	card: payment => payment.cost == 0
		? l10n.l('txtPayment.cardSubscriptionSetup', "Card subscription setup")
		: l10n.l('txtPayment.cardPayment', "Card payment"),
	paypal: payment => payment.cost == 0
		? l10n.l('txtPayment.paypalSubscriptionSetup', "PayPal subscription setup")
		: l10n.l('txtPayment.paypalPayment', "PayPal payment"),
};
const txtPaymentUnknownHeader = l10n.l('txtPayment.payment', "Payment");

/**
 * Returns the locale string of a payment status.
 * @param {string} payment Payment.
 * @returns {LocaleString} Payment status as locale string.
 */
export function toLocaleString(payment) {
	let o = txtStatusMethods[payment.status];
	o = o && o[payment.method];
	o = o && o(payment);
	return o || txtStatusUnknown;
};

/**
 * Returns a description of a payment status.
 * @param {string} payment Payment.
 * @returns {LocaleString} Payment status description as locale string.
 */
export function description(payment) {
	let o = txtStatusMethodDescs[payment.status];
	o = o && o[payment.method];
	o = o && o(payment);
	return o || txtStatusUnknownDesc;
};

/**
 * Returns a header text for a payment.
 * @param {string} payment Payment.
 * @returns {LocaleString} Payment header text as locale string.
 */
export function header(payment) {
	let o = txtPaymentHeaders[payment.method];
	o = o?.(payment);
	return o || txtPaymentUnknownHeader;
};
