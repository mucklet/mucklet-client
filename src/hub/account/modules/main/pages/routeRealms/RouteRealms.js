import { Model, Collection } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import compareSortOrderId from 'utils/compareSortOrderId';

import RouteRealmsComponent from './RouteRealmsComponent';
import './routeRealms.scss';

const pathDef = [
	[ 'user', '$userId', 'realm', '$realmId' ],
	[ 'user', '$userId' ],
	[ 'realm', '$realmId' ],
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
			'routeError',
			'auth',
			'confirm',
			'toaster',
			'mode',
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

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		this.module.router.addRoute({
			id: 'realms',
			icon: 'university',
			name: l10n.l('routeRealms.realms', "Realms"),
			component: new RouteRealmsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 30,
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

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers an realm component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {(realm: RealmModel) => Component} tool.componentFactory Tool component factory.
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

	async reloadState() {
		return this._setState({
			realmId: this.model.realm?.id,
			userId: this.model.user?.id,
		});
	}

	async _setState(params) {
		return this.module.auth.getUserPromise()
			.then(user => params?.userId
				? this.module.api.get('identity.user.' + params.userId)
				: user,
			)
			.then(user => (
				this.module.mode.getModel().mode == 'overseer'
					? this.module.api.get(`control.overseer.realms`)
					: this.module.api.get(`control.user.${user.id}.realms`)
			)
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
