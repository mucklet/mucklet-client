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

		this.app.require([
			'auth',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// this.stripe = null;

		// if (this.params.status == 'payment') {
		// 	this.module.auth.getUserPromise().then(user => {
		// 		return this.module.api.get('payment.info').then(info => {
		// 			if (this.params.status == 'redirect') {
		// 				this.component = new StripeCompleted(this.module, user, info);
		// 				this.module.screen.setComponent(this.component);
		// 				return;
		// 			}
		// 			return this._createSubscription(user, info);
		// 		});
		// 	});
		// }
	}

	newCardPaymentPromise(offerId, opt) {
		let api = this.module.api;
		return Promise.all([
			this.module.auth.getUserPromise(),
			api.get('payment.info'),
			api.get('payment.offer.' + offerId),
		]).then(result => {
			let [ user, info, offer ] = result;
			return api.call('payment.user.' + user.id + '.stripe', 'createPaymentIntent', {
				offerId,
				force: true,
			}).then(intent => this._createPaymentElement(user, info, offer, intent.clientSecret, opt));
		});
	}

	// _infoPromise() {
	// 	this.module.auth.getUserPromise().then(user => {
	// 		return this.module.api.get('payment.info').then(info => {

	// 			return this._createSubscription(user, info);
	// 		});
	// 	});
	// }

	// _createPaymentIntent(user, info) {
	// 	return this.payPromise = this.module.api.call('payment.user.' + user.id + '.stripe', 'createPaymentIntent', {
	// 		paymentMethodType: 'card',
	// 		force: true,
	// 	}).then(result => this._createPaymentElement(user, info, result.clientSecret));
	// }

	// _createSubscription(user, info) {
	// 	return this.payPromise = this.module.api.call('payment.user.' + user.id + '.stripe', 'createSubscription', {
	// 		priceId: this.params.priceId,
	// 		paymentMethodType: 'card',
	// 		force: true,
	// 	}).then(result => this._createPaymentElement(user, info, result.clientSecret));
	// }

	_createPaymentElement(user, info, offer, clientSecret, opt) {
		return loadStripe(info.stripePublicKey, {
			apiVersion: info.stripeApiVersion,
		}).then(stripe => new StripePaymentElement(this.module, user, info, offer, stripe, clientSecret, opt));
	}

	dispose() {
	}
}

export default Stripe;
