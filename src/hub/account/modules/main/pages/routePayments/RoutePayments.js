import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenModel } from 'utils/listenModel';

import RoutePaymentsComponent from './RoutePaymentsComponent';
import './routePayments.scss';

/**
 * RoutePayments adds the payment route.
 */
class RoutePayments {

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

		this.model = new Model({ data: { payment: null, error: null }, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'payments',
			icon: 'credit-card',
			name: l10n.l('routePayments.payment', "Payment"),
			component: new RoutePaymentsComponent(this.module, this.model),
			setState: params => Promise.resolve(params.paymentId
				? this.module.api.get('payment.payment.' + params.paymentId).then(payment => this._setState({ payment }))
				: Promise.reject(l10n.l('routePayments.missingPayment', "What payment? We are missing something here.")),
			).catch(error => this._setState({ error })),
			getUrl: params => params.paymentId
				? this.module.router.createUrl([ 'payment', params.paymentId ])
				: null,
			parseUrl: parts => parts.length == 3 && parts[1] == 'payment'
				? { paymentId: parts[2] }
				: null,
			order: 10,
		});
	}

	_setState(state) {
		state = state || {};
		return this.model.set({
			payment: relistenModel(this.model.payment, state.payment),
			method: state.method || null,
			error: state.error || null,
		});
	}

	/**
	 * Sets the payment route.
	 * @param {object} params Route params.
	 * @param {string} params.paymentId Payment ID.
	 */
	setRoute(params) {
		this.module.router.setRoute('payments', { paymentId: params?.paymentId || null });
	}

	dispose() {
		this._setState();
		this.module.router.removeRoute('payments');

	}
}

export default RoutePayments;
