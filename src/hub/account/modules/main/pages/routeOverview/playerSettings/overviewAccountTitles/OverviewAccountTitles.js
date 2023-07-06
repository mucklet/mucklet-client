import OverviewAccountTitlesComponent from './OverviewAccountTitlesComponent';
import './overviewAccountTitles.scss';

/**
 * OverviewAccountTitles adds a section to the PlayerSettings to see account
 * titles.
 */
class OverviewAccountTitles {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeOverview',
			'dialogChangePassword',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.routeOverview.addTool({
			id: 'titles',
			type: 'topSection',
			sortOrder: 100,
			componentFactory: (user, state) => new OverviewAccountTitlesComponent(this.module, user, state),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('titles');
	}
}

export default OverviewAccountTitles;
