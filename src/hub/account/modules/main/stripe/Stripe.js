import { loadStripe } from '@stripe/stripe-js';
import StripePaymentElement from "./StripePaymentElement";
// import StripeCompleted from "./StripeCompleted";
import './stripe.scss';

/**
 * Stripe is a module for testing stripe payments.
 */
class Stripe {
	constructor(app, params) {
		this.app = app;

		this.params = Object.assign({
			includeLocation: 'paypal',
		}, params);

		this.app.require([
			'auth',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Creates a new Stripe payment intent. The
	 * @param {string} offerId Offer ID.
	 * @param {string} method  Payment method type. May be "card" or "paypal".
	 * @returns {Model} Payment model.
	 */
	createPayment(offerId, method) {
		return this.module.auth.getUserPromise()
			.then(user => this.module.api.call('payment.user.' + user.id + '.stripe', 'createPayment', {
				offerId,
				method,
			}));
	}

	newPaymentPromise(paymentId, opt) {
		let api = this.module.api;
		let info = null;
		let payment = null;
		return Promise.all([
			this.module.auth.getUserPromise(),
			api.get('payment.info').then(o => {
				info = o;
				o?.on();
				return o;
			}),
			api.get('payment.payment.' + paymentId).then(o => {
				payment = o;
				o?.on();
				return o;
			}),
			api.call('payment.payment.' + paymentId, 'getStripeIntent'),
		]).then(result => {
			let [ user, info, payment, intent ] = result;
			return this._createPaymentElement(user, info, payment, intent, opt);
		}).finally(() => {
			info?.off();
			payment?.off();
		});
	}

	_createPaymentElement(user, info, payment, intent, opt) {
		return loadStripe(info.stripePublicKey, {
			apiVersion: info.stripeApiVersion,
			locale: 'en',
		}).then(stripe => new StripePaymentElement(this.module, user, info, payment, stripe, intent, opt));
	}

	dispose() {
	}
}

export default Stripe;
