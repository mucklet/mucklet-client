import OverviewAccountSecurityComponent from './OverviewAccountSecurityComponent';
import './overviewAccountSecurity.scss';

/**
 * OverviewAccountSecurity adds a section to the PlayerSettings to change password.
 */
class OverviewAccountSecurity {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeOverview',
			// 'dialogChangePassword',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.routeOverview.addTool({
			id: 'security',
			type: 'topSection',
			sortOrder: 100,
			componentFactory: (user, state) => new OverviewAccountSecurityComponent(this.module, user, state),
			alertModel: this.model,
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('security');
	}
}

export default OverviewAccountSecurity;
