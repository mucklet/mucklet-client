import l10n from 'modapp-l10n';

import RouteRealmsComponent from './RouteRealmsComponent';
import './routeRealms.scss';

/**
 * RouteRealms adds the realms route.
 */
class RouteRealms {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'router',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.router.addRoute({
			id: 'realms',
			icon: 'university',
			name: l10n.l('routeRealms.realms', "Realms"),
			component: new RouteRealmsComponent(this.module, this.model),
			staticRouteParams: { realm: null },
			setState: params => this.module.auth.getUserPromise(),
			// getUrl: params => null,
			// parseUrl: parts => null,
			order: 20,
		});
	}

	dispose() {
		this.module.router.removeRoute('realms');
	}
}

export default RouteRealms;
