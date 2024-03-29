import OverviewAccountSecurityComponent from './OverviewAccountSecurityComponent';
import './overviewAccountSecurity.scss';

/**
 * OverviewAccountSecurity adds a section to Overview to change password.
 */
class OverviewAccountSecurity {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'routeOverview',
			'dialogChangePassword',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.routeOverview.addTool({
			id: 'security',
			type: 'topSection',
			sortOrder: 110,
			componentFactory: (user, state) => new OverviewAccountSecurityComponent(this.module, user, state),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('security');
	}
}

export default OverviewAccountSecurity;
