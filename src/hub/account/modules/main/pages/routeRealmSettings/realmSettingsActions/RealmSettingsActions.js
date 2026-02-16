import RealmSettingsActionsComponent from './RealmSettingsActionsComponent';
import './realmSettingsActions.scss';

/**
 * RealmSettingsActions adds realm action to RouteRealmSettings.
 */
class RealmSettingsActions {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'routeRealmSettings',
			'toaster',
			'api',
			'confirm',
			'hubInfo',
			'realmUpgrade',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.routeRealmSettings.addTool({
			id: 'actions',
			type: 'topSection',
			componentFactory: (realm) => new RealmSettingsActionsComponent(this.module, realm),
			mode: 'user',
			sortOrder: 10,
		});
	}

	dispose() {
		this.module.routeRealmSettings.removeTool('actions');
	}
}

export default RealmSettingsActions;
