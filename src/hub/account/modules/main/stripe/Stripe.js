import { loadStripe } from '@stripe/stripe-js';
import StripePaymentElement from "./StripePaymentElement";
import StripeCompleted from "./StripeCompleted";
import './stripe.scss';

/**
 * Stripe is a module for testing stripe payments.
 */
class Stripe {
	constructor(app, params) {
		this.app = app;
		this.params = Object.assign({
			status: '',
			priceId: '',
		}, params);

		this.app.require([
			'auth',
			'screen',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.stripe = null;

		if (this.params.status == 'payment') {
			this.module.auth.getUserPromise().then(user => {
				return this.module.api.get('payment.info').then(info => {
					if (this.params.status == 'redirect') {
						this.component = new StripeCompleted(this.module, user, info);
						this.module.screen.setComponent(this.component);
						return;
					}
					return this._createSubscription(user, info);
				});
			});
		}
	}

	_createPaymentIntent(user, info) {
		return this.payPromise = this.module.api.call('payment.user.' + user.id + '.stripe', 'createPaymentIntent', {
			paymentMethodType: 'card',
			force: true,
		}).then(result => this._showPaymentElement(user, info, result.clientSecret));
	}

	_createSubscription(user, info) {
		return this.payPromise = this.module.api.call('payment.user.' + user.id + '.stripe', 'createSubscription', {
			priceId: this.params.priceId,
			paymentMethodType: 'card',
			force: true,
		}).then(result => this._showPaymentElement(user, info, result.clientSecret));
	}

	_showPaymentElement(user, info, clientSecret) {
		return loadStripe(info.stripePublicKey, {
			apiVersion: info.stripeApiVersion,
		}).then(stripe => {
			this.stripe = stripe;
			this.component = new StripePaymentElement(this.module, user, info, stripe, clientSecret);
			this.module.screen.setComponent(this.component);
		});
	}

	dispose() {
	}
}

export default Stripe;
