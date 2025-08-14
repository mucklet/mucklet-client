import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';

import RouteRealmsComponent from './RouteRealmsComponent';
import './routeRealms.scss';

const pathDef = [
	[ 'realm', '$realmId' ],
	[ 'user', '$userId' ],
];


/**
 * RouteRealms adds the realms route.
 */
class RouteRealms {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'auth',
			'routeEditRealm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			realms: null,
			realm: null,
			user: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'realms',
			icon: 'university',
			name: l10n.l('routeRealms.realms', "Realms"),
			component: new RouteRealmsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 20,
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	realmId?: string;
	 * 	userId?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('realms', params);
	}

	async _setState(params) {
		return this.module.auth.getUserPromise()
			.then(user => params?.userId
				? this.module.api.get('identity.user.' + params.userId)
				: user,
			)
			.then(user => this.module.api.get(`control.user.${user.id}.realms`)
				.then(realms => {
					let realm = (params?.realmId && realms.toArray().find(r => r.id == params.realmId)) || null;
					this._setModel({ realms, realm, user: params.userId ? user : null });
				}),
			)
			.catch(error => {
				console.error(error);
				return this._setModel({ error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			realm: relistenResource(this.model.realm, props.realm),
			realms: relistenResource(this.model.realms, props.realms),
			user: relistenResource(this.model.user, props.user),
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('realms');
	}
}

export default RouteRealms;
