import { Model } from 'modapp-resource';
import listenModel from 'utils/listenModel';
import OverviewSupporterStatusComponent from './OverviewSupporterStatusComponent';
import './overviewSupporterStatus.scss';

/**
 * OverviewSupporterStatus adds a topsection to the PlayerSettings to show
 * player name.
 */
class OverviewSupporterStatus {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeOverview',
			'routePayment',
			'dialogCardPayment',
			'confirm',
			'toaster',
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
						.then(paymentUser => ctx.model?.set({ paymentUser: listenModel(paymentUser, true) })),
					this.module.api.get('payment.offers.supporter')
						.then(supporterOffers => ctx.model?.set({ supporterOffers: listenModel(supporterOffers, true) })),
				]);
			},
			disposeCtx: ctx => {
				listenModel(ctx.model.paymentUser, false);
				listenModel(ctx.model.supporterOffers, false);
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
