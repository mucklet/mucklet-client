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

		this.module.auth.getUserPromise().then(user => {
			return this.module.api.get('payment.info').then(info => {
				if (this.params.status == 'redirect') {
					this.component = new StripeCompleted(this.module, user, info);
					this.module.screen.setComponent(this.component);
					return;
				}
				return this.payPromise = this.module.api.call('payment.customer.' + user.id, 'stripeCreatePaymentIntent', {
					paymentMethodType: 'card',
				}).then(result => {
					return loadStripe(info.stripePublicKey, {
						apiVersion: info.stripeApiVersion,
					}).then(stripe => {
						this.stripe = stripe;
						this.component = new StripePaymentElement(this.module, user, info, stripe, result.clientSecret);
						this.module.screen.setComponent(this.component);
					});
				});
			});
		});
	}

	dispose() {
	}
}

export default Stripe;
