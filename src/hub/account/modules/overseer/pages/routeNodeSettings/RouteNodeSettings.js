import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';

import RouteNodeSettingsComponent from './RouteNodeSettingsComponent';
import './routeNodeSettings.scss';

const pathDef = [
	[ 'node', '$nodeKey' ],
];

/**
 * RouteNodeSettings adds the nodes route.
 */
class RouteNodeSettings {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'auth',
			'access',
			'confirm',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			node: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'nodesettings',
			hidden: true,
			parentId: 'nodes',
			icon: 'university',
			name: l10n.l('routeNodeSettings.nodeSettings', "Node Settings"),
			component: new RouteNodeSettingsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 20,
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	nodeKey?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('nodesettings', params);
	}

	async _setState(params) {
		return this.module.auth.getUserPromise()
			.then(user => params?.nodeKey
				? this.module.api.get(`control.overseer.node.${params.nodeKey}`)
				: Promise.resolve(null),
			)
			.then(node => this._setModel({ node }))
			.catch(error => {
				console.error(error);
				return this._setModel({ error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			node: relistenResource(this.model.node, props.node),
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('nodesettings');
	}
}

export default RouteNodeSettings;
