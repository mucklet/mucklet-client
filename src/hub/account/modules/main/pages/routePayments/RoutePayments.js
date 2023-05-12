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

		this.model = new Model({ data: { payment: null, page: null, error: null }, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'payments',
			icon: 'credit-card',
			name: l10n.l('routePayments.payment', "Payment"),
			component: new RoutePaymentsComponent(this.module, this.model),
			setState: params => Promise.resolve(params.paymentId
				? this.module.api.get('payment.payment.' + params.paymentId).then(payment => this._setState({ payment, page: params.page }))
				: Promise.reject(l10n.l('routePayments.missingPayment', "What payment? We are missing something here.")),
			).catch(error => this._setState({ error })),
			getUrl: params => params.paymentId
				? this.module.router.createUrl(params.page && params.page != 'payment'
					? [ 'payment', params.paymentId, params.page ]
					: [ 'payment', params.paymentId ],
				)
				: null,
			parseUrl: parts => (parts.length == 3 || parts.length == 4) && parts[1] == 'payment'
				? { page: parts[3] || 'payment', paymentId: parts[2] }
				: null,
			order: 10,
		});
	}

	_setState(state) {
		state = state || {};
		return this.model.set({
			payment: relistenModel(this.model.payment, state.payment),
			page: state.page || (state.payment ? 'payment' : null),
			error: state.error || null,
		});
	}

	/**
	 * Sets the payment route.
	 * @param {object} params Route params.
	 * @param {string} params.paymentId Payment ID.
	 * @param {string} params.page Payment page. May be 'payment' or 'result'. Defaults to 'payment'.
	 */
	setRoute(params) {
		this.module.router.setRoute('payments', { paymentId: params?.paymentId || null, page: params?.page || null });
	}

	dispose() {
		this._setState();
		this.module.router.removeRoute('payments');

	}
}

export default RoutePayments;
