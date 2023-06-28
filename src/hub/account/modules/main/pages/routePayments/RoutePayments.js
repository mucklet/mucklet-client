import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenModel } from 'utils/listenModel';

import RoutePaymentsComponent from './RoutePaymentsComponent';
import './routePayments.scss';

const pathDef = [
	[ 'payment', '$paymentId', '$page' ],
	[ 'payment', '$paymentId' ],
	[ 'user', '$userId', 'page', '$pageNr' ],
	[ 'page', '$pageNr' ],
	[ 'user', '$userId' ],
];

/**
 * RoutePayments adds the payment route.
 */
class RoutePayments {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
			'api',
			'router',
			'stripe',
			'auth',
			'payment',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { payment: null, page: null, error: null }, eventBus: this.app.eventBus });
		this.state = {};

		this.module.router.addRoute({
			id: 'payments',
			icon: 'credit-card',
			name: l10n.l('routePayments.payments', "Payments"),
			component: new RoutePaymentsComponent(this.module, this.model),
			setState: params => this.module.auth.getUserPromise()
				.then(user => Promise.resolve(params.paymentId
					? (params.page == 'result'
						? this.module.api.call('payment.payment.' + params.paymentId, 'update')
						: this.module.api.get('payment.payment.' + params.paymentId)
					).then(payment => this._setState({ payment, page: params.page }))
					: Promise.resolve(params.userId
						? this.module.api.get('identity.user.' + params.userId)
						: user,
					).then(user => this._setState({ user, pageNr: Number(params.pageNr) || 0 })),
				))
				.catch(error => this._setState({ error })),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => {
				let o = this.module.router.parseDefUrl(parts, pathDef);
				if (typeof o?.pageNr == 'string') {
					o.pageNr = Number(o.pageNr) || 0;
				}
				return o;
			},
			order: 30,
		});
	}

	_setState(state) {
		state = state || {};
		return this.model.set({
			payment: relistenModel(this.model.payment, state.payment),
			user: relistenModel(this.model.user, state.user),
			pageNr: state.user ? state.pageNr || 0 : null,
			page: state.page || (state.payment ? 'payment' : null),
			error: state.error || null,
		});
	}

	/**
	 * Sets the payment route.
	 * @param {object} params Route params.
	 * @param {string} [params.paymentId] Payment ID.
	 * @param {string} [params.page] Payment page. May be 'payment' or 'result'. Defaults to 'payment'.
	 * @param {string} [params.userId] User ID to show payments for. Ignored if paymentId is set.
	 * @param {string} [params.pageNr] Page nr for the pagination when showing payments. Ignored if userId is not set.
	 */
	setRoute(params) {
		this.module.router.setRoute('payments', {
			paymentId: params?.paymentId || null,
			page: params?.page || null,
			userId: params?.userId || null,
			pageNr: params?.pageNr || null,
		});
	}

	dispose() {
		this._setState();
		this.module.router.removeRoute('payments');

	}
}

export default RoutePayments;
