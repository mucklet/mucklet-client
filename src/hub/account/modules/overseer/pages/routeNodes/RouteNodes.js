import { Model, Collection, sortOrderCompare } from 'modapp-resource';
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
			'confirm',
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

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

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

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers an node component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {(node: NodeModel) => Component} tool.componentFactory Tool component factory.
	 * @param {string} [tool.type] Target type. May be 'button'. Defaults to 'button'.
	 * @param {string} [tool.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.add(tool);
		return this;
	}

	/**
	 * Unregisters a previously registered tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeTool(toolId) {
		let tool = this.tools.get(toolId);
		this._listenTool(tool, false);
		this.tools.remove(toolId);
		return this;
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
