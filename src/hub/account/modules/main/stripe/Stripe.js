import { loadStripe } from '@stripe/stripe-js';
import StripeComponent from "./StripeComponent";
import './stripe.scss';

/**
 * Stripe is a module for testing stripe payments.
 */
class Stripe {
	constructor(app) {
		this.app = app;

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
				return loadStripe(info.stripePublicKey, {
					apiVersion: info.stripeApiVersion,
				}).then(stripe => {
					this.stripe = stripe;
					this.component = new StripeComponent(this.module, user, info, stripe);
					this.module.screen.setComponent(this.component);
				});
			});
		});
	}

	dispose() {
	}
}

export default Stripe;
