import { Model, Collection } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import { compareSortOrderId } from 'utils/compareSortOrder';

import RouteClientsComponent from './RouteClientsComponent';
import './routeClients.scss';

const pathDef = [
	[ 'client', '$clientId' ],
];


/**
 * RouteClients adds the clients route.
 */
class RouteClients {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'confirm',
			'dialogCreateClient',
			'toaster',
			'file',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			clients: null,
			client: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		this.module.router.addRoute({
			id: 'clients',
			icon: 'television',
			name: l10n.l('routeClients.clientReleases', "Client releases"),
			component: new RouteClientsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 1020,
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	clientId?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('clients', params);
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers an client component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {(client: ClientModel) => Component} tool.componentFactory Tool component factory.
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
			.then(user => params?.clientId
				? this.module.api.get(`control.overseer.client.${params.clientId}`)
					.then(client => this._setModel({ client }))
				: this.module.api.get(`control.overseer.clients`)
					.then(clients => this._setModel({ clients })),
			)
			.catch(error => {
				console.error(error);
				return this._setModel({ error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			client: relistenResource(this.model.client, props.client),
			clients: relistenResource(this.model.clients, props.clients),
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('clients');
	}
}

export default RouteClients;
