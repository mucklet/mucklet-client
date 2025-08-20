import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import { hasIdRoles } from 'utils/idRoles';

import RouteRealmSettingsComponent from './RouteRealmSettingsComponent';
import './routeRealmSettings.scss';

const pathDef = [
	[ 'realm', '$realmId' ],
	[ 'user', '$userId' ],
];


/**
 * RouteRealmSettings adds the realms route.
 */
class RouteRealmSettings {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'auth',
			'access',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			realm: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.module.router.addRoute({
			id: 'realmsettings',
			hidden: true,
			parentId: 'realms',
			icon: 'university',
			name: l10n.l('routeRealmSettings.realmSettings', "Realm Settings"),
			component: new RouteRealmSettingsComponent(this.module, this.model),
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
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('realmsettings', params);
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers an edit realm component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {(realm: ModifyModel) => Component} tool.componentFactory Tool component factory.
	 * @param {string} [tool.type] Target type. May be 'section'. Defaults to 'section';
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
			.then(user => params?.realmId
				? hasIdRoles(user, 'overseer')
					? this.module.api.get(`control.overseer.realm.${params.realmId}`)
					: this.module.api.get(`control.realm.${params.realmId}.details`)
				: Promise.resolve(null),
			)
			.then(realm => this._setModel({ realm }))
			.catch(error => {
				console.error(error);
				return this._setModel({ error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			realm: relistenResource(this.model.realm, props.realm),
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('realmsettings');
	}
}

export default RouteRealmSettings;
