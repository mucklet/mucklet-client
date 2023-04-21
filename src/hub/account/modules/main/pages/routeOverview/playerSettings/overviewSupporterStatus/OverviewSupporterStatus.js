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
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add supporterStatus
		this.module.routeOverview.addTool({
			id: 'supporterStatus',
			type: 'supporterSection',
			sortOrder: 20,
			componentFactory: (user, paymentUser, state) => new OverviewSupporterStatusComponent(this.module, user, paymentUser, state),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('supporterStatus');
	}
}

export default OverviewSupporterStatus;
