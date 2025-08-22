import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';

import RouteNodesComponent from './RouteNodesComponent';
import './routeNodes.scss';

const pathDef = [
	[ 'node', '$nodeKey' ],
];


/**
 * RouteNodes adds the nodes route.
 */
class RouteNodes {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'routeNodeSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			nodes: null,
			node: null,
			user: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'nodes',
			icon: 'server',
			name: l10n.l('routeNodes.nodes', "Nodes"),
			component: new RouteNodesComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 1010,
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	nodeKey?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('nodes', params);
	}

	async _setState(params) {
		return this.module.auth.getUserPromise()
			.then(user => this.module.api.get(`control.overseer.nodes`)
				.then(nodes => {
					let node = (params?.nodeKey && nodes.toArray().find(r => r.key == params.nodeKey)) || null;
					this._setModel({ nodes, node });
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
			node: relistenResource(this.model.node, props.node),
			nodes: relistenResource(this.model.nodes, props.nodes),
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('nodes');
	}
}

export default RouteNodes;
