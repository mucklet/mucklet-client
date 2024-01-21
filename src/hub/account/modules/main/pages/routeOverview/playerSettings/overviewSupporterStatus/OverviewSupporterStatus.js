import { Model } from 'modapp-resource';
import listenResource from 'utils/listenResource';
import OverviewSupporterStatusComponent from './OverviewSupporterStatusComponent';
import './overviewSupporterStatus.scss';

/**
 * OverviewSupporterStatus adds a topsection to the PlayerSettings to show
 * player name.
 */
class OverviewSupporterStatus {
	constructor(app, params) {
		this.app = app;

		this.params = Object.assign({
			includeCard: true,
			includePaypal: true,
		}, params);

		this.app.require([
			'api',
			'routeOverview',
			'routePayments',
			'confirm',
			'toaster',
			'stripe',
			'payment',
			'dialogProductContent',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add supporterStatus
		this.module.routeOverview.addTool({
			id: 'supporterStatus',
			type: 'supporterSection',
			sortOrder: 20,
			createCtx: (ctx, user) => {
				ctx.model = new Model({ data: { paymentUser: null, supporterOffers: null }, eventBus: this.app.eventBus });
				return Promise.all([
					this.module.api.get('payment.user.' + user.id)
						.then(paymentUser => ctx.model?.set({ paymentUser: listenResource(paymentUser, true) })),
					this.module.api.get('payment.offers.supporter')
						.then(supporterOffers => ctx.model?.set({ supporterOffers: listenResource(supporterOffers, true) })),
				]);
			},
			disposeCtx: ctx => {
				listenResource(ctx.model.paymentUser, false);
				listenResource(ctx.model.supporterOffers, false);
				ctx.model = null;
			},
			componentFactory: (user, state, ctx) => new OverviewSupporterStatusComponent(this.module, user, state, ctx),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('supporterStatus');
	}
}

export default OverviewSupporterStatus;
