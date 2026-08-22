import OverviewAccountDeletionComponent from './OverviewAccountDeletionComponent';

/**
 * OverviewAccountDeletion adds the self-service account deletion section.
 */
class OverviewAccountDeletion {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'routeOverview',
			'dialogDeleteAccount',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.routeOverview.addTool({
			id: 'accountDeletion',
			type: 'topSection',
			sortOrder: 115,
			componentFactory: (user, state) => new OverviewAccountDeletionComponent(this.module, user, state),
		});
	}

	dispose() {
		this.module.routeOverview.removeTool('accountDeletion');
	}
}

export default OverviewAccountDeletion;
