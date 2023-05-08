import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenModel } from 'utils/listenModel';

import RoutePaymentComponent from './RoutePaymentComponent';
import './routePayment.scss';

/**
 * RoutePayment adds the payment route.
 */
class RoutePayment {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'stripe',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { offer: null, method: null, error: null }, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'payment',
			icon: 'credit-card',
			name: l10n.l('routePayment.payment', "Payment"),
			component: new RoutePaymentComponent(this.module, this.model),
			setState: params => Promise.resolve(params.offerId && params.method
				? params.method == 'card'
					? this.module.api.get('payment.offer.' + params.offerId).then(offer => this._setState({ offer, method: params.method }))
					: Promise.reject(l10n.l('routePayment.invalidMethod', "Invalid payment method."))
				: Promise.reject(l10n.l('routePayment.missingMethod', "What payment? We are missing a few things.")),
			).catch(error => this._setState({ error })),
			getUrl: params => params.method && params.offerId
				? this.module.router.createUrl([ params.method, params.offerId ])
				: null,
			parseUrl: parts => parts.length == 3 ? { method: parts[1], offerId: parts[2] } : null,
			order: 10,
		});
	}

	_setState(state) {
		console.log("STATE: ", state);
		state = state || {};
		return this.model.set({
			offer: relistenModel(this.model.offer, state.offer),
			method: state.method || null,
			error: state.error || null,
		});
	}

	setRoute(method, offerId) {
		this.module.router.setRoute('payment', { method, offerId });
	}

	dispose() {
		this._setState();
		this.module.router.removeRoute('payment');

	}
}

export default RoutePayment;
