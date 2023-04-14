import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenModel } from 'utils/listenModel';

import RouteOverviewComponent from './RouteOverviewComponent';
import './routeOverview.scss';

/**
 * RouteOverview adds the overview route.
 */
class RouteOverview {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'router',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { user: null }, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'overview',
			icon: 'user',
			name: l10n.l('routeOverview.accountOverview', "Account overview"),
			component: new RouteOverviewComponent(this.module, this.model),
			// staticRouteParams: { userId: null },
			setState: params => this.module.auth.getUserPromise().then(user => this._setState(user)),
			// getUrl: params => null,
			// parseUrl: parts => null,
			order: 10,
		});
	}

	_setState(user) {
		return this.model.set({
			user: relistenModel(this.model.user, user),
		});
	}

	dispose() {
		this.module.router.removeRoute('routeOverview');
	}
}

export default RouteOverview;
