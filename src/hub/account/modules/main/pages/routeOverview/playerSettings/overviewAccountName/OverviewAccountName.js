import OverviewAccountNameComponent from './OverviewAccountNameComponent';
import './overviewAccountName.scss';

/**
 * OverviewAccountName adds a topsection to the PlayerSettings to show
 * player name.
 */
class OverviewAccountName {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeOverview',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add accountName
		this.module.routeOverview.addTool({
			id: 'accountName',
			type: 'topSection',
			sortOrder: 20,
			componentFactory: (user, state) => new OverviewAccountNameComponent(this.module, user, state),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('accountName');
	}
}

export default OverviewAccountName;
