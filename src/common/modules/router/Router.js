import { Collection, Model } from 'modapp-resource';
import * as obj from 'modapp-utils/obj';

/**
 * Label callback
 * @callback module/Router~labelCallback
 * @param {string} id Id of route
 * @param {object} state State object of set route
 */

/**
 * State callback
 * @callback module/Router~setStateCallback
 * @param {object} params Parameters passed to setRoute.
 * @param {object} route Route object.
 * @returns {Promise} Promise to the setting of state. Should reject if the state is invalid.
 */

/**
 * Route definition object
 * @typedef {object} module/Router~routeDefinition
 * @property {string} id Id of the route. Dot separated for sub routes.
 * @property {(Object<string, modapp~Component>|{modapp~Component})} component An object containing components the route uses, can be a single component.
 * @property {string|class/LocaleString} name Display name of a route
 * @property {object} [staticRouteParams] Optional params that is ensured to exist when a route is set.
 *                                        Caller may override these parameters by using the same keys.
 * @property {?string} [icon] Optional icon name
 * @property {string} [parentId] Option id of parent route
 * @property {module/Router~setStateCallback} [setState] Set state callback. Params will be ignored if not set.
 * @property {module/Router~onBeforeUnload} [onBeforeUnload] On before unload callback. Params will be ignored if not set.
 * @property {number} [order] Optional sort order value.
 */

/**
 * Set route object
 * @typedef {object} module/Router~setRoute
 * @property {module/Router~routeDefinition} route Route definition object
 * @property {object} params Parameters
 */

/**
 * @typedef {object} module/Router~setEventData
 * @property {?module/Router~setRoute} current Current route that is set. Null means no route is set.
 * @property {?module/Router~setRoute} previous Previous route that was set. Null means no route was set.
 */

function sortCompare(a, b) {
	let o = (a.order || 0) - (b.order || 0);
	return o ? o : a.id.localeCompare(b.id);
};

/**
 * Route holds the different screen routes
 * @module module/Router
 */
class Router {

	constructor(app, params) {
		this.app = app;
		this.routes = new Collection({ eventBus: this.app.eventBus, namespace: 'module.router.routes', compare: sortCompare });
		this.current = null;
		this.default = null;
		this.previous = null;
		this.initialRoute = null;
		this.initialRouteData = null;
		this.initialQuery = typeof (window) !== 'undefined' && window.location ? window.location.search : '';
		this.settingRoute = null;

		this.app.require([], this._init.bind(this));

		this.setRouteCounter = 0;
	}

	_init(module) {
		this.module = module;
		this.model = new Model({ data: { route: null, params: null }, eventBus: this.app.eventBus });
		this.setStatePromise = null;

		window.addEventListener('popstate', (e) => {
			this.historyChanged = true;

			let state = e.state,
				routeId = null,
				params = null;

			// Do we have a state
			if (!state) {
				// Parse the url to create a state
				this._setInitialRoute();

				let route = this.routes.get(this.initialRoute);

				if (route) {
					routeId = route.id;
					if (route.parseUrl) {
						params = route.parseUrl(this.initialRouteData);
					}
					// Replace the state with the correct data
					history.replaceState({
						routeId: route.id,
						params: params,
					}, route.name);
				}
			} else {
				routeId = state.routeId || null;
				params = state.params || null;
			}

			// [TODO] Catch errors to continue further back navigation
			this.setRoute(routeId, params, false).catch(
				e => {
					console.error("Failed to navigate back. Resetting to start route");
					history.replaceState(null, null, null);
					this.setRoute(null, null, false);
				},
			);
		});

		// Set default state
		history.replaceState(null, null, null);

		this._setInitialRoute();
	}

	/**
	 * Gets the router model containing the current route and params.
	 * @returns {Model} The router model.
	 */
	getModel() {
		return this.model;
	}

	/**
	 * Attach an event handler function for one or more module events.
	 * @param {?string} events One or more space-separated events (eg. 'set'). Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.app.eventBus.on(this, events, handler, 'module.router');
	}

	/**
	 * Remove an app event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {function=} handler An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, 'module.router');
	}

	/**
	 * Adds a route
	 * @param {module/Router~routeDefinition} route Route definition object to add
	 * @param {boolean} [isDefault] Flag to set the route as default.
	 * @fires module/Router#add
	 * @returns {this}
	 */
	addRoute(route, isDefault) {
		this.routes.add(route);

		if (this.initialRoute && this.initialRoute === route.id) {
			let routeData = null;
			if (route.parseUrl) {
				routeData = route.parseUrl(this.initialRouteData);
			}

			this.setRoute(route.id, routeData || {});
		}
		if (isDefault) {
			this.setDefault(route.id);
		}
		return this;
	}

	/**
	 * Removes a route
	 * @param {string} routeId Id of route
	 * @returns {number} Order index of the route before removal. -1 if the route id doesn't exist
	 */
	removeRoute(routeId) {
		return this.routes.remove(routeId);
	}

	/**
	 * Gets a route by id
	 * @param {string} routeId Id of route
	 * @returns {object} Route object. Undefined if route is not found
	 */
	getRoute(routeId) {
		return this.routes.get(routeId);
	}

	/**
	 * Gets all routes
	 * @returns {Collection} Collection of routes.
	 */
	getRoutes() {
		return this.routes;
	}

	/**
	 * Gets the current route object, or null if no route is set
	 * @returns {module/Router~setRoute} Current route object
	 */
	getCurrent() {
		return this.current;
	}

	getDefaultRoute() {
		return this.default;
	}

	goBack() {
		history.back();
	}

	/**
	 * Returns a URL created from a route with params.
	 * @param {string|object} routeId Id of route or route object
	 * @param {?object} [params] Optional params object
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.fullPath] Create URL with full path including protocol and host.
	 * @param {object} [opt.keepQuery] Flag to include the initial query.
	 * @returns {?string} Url
	 */
	getUrl(routeId, params, opt) {
		let route = typeof routeId == 'string' ? this.getRoute(routeId) : routeId;

		let loc = window.location;
		let url = (opt?.fullPath ? loc.protocol + '//' + loc.host : '') + loc.pathname + (opt?.keepQuery ? this.initialQuery : '') + (route ? '#' + route.id : '');
		if (route?.getUrl) {
			let routeUrl = route.getUrl(params);
			url += routeUrl ? '/' + routeUrl : '';
		}
		return url;
	}

	reload() {
		if (this.current) {
			return Promise.resolve(this.current.route.setState ? this.current.route.setState(this.current.params, this.current.route) : null).then(() => true);
		}
	}

	/**
	 * Sets a route by id and optional params.
	 * @param {string | null} routeId Id of route
	 * @param {object=} params Optional params object
	 * @param {boolean=} pushHistoryState Optional flag if history params should be pushed. Default is true.
	 * @param {boolean=} force Force the route even if onBeforeUnload says otherwise, and set even if current.
	 * @returns {Promise.<module/Router~setRoute>} Promise to the set route.
	 */
	setRoute(routeId, params = {}, pushHistoryState = true, force = false) {
		// this.initialRoute = null;
		// this.initialRouteData = null;

		if (!routeId) {
			if (this.default) {
				routeId = this.default.routeId;
				params = this.default.params;
			} else {
				params = null;
			}
		} else if (params === null || typeof params !== 'object') {
			params = {};
		}

		// If the route is currently set, we only replace the this.current
		// object with the same content. In case setRoute was called from within
		// a route.setState, a change to this.current will cause the previous
		// attempt of setRoute, which triggered setState, to be aborted. See
		// _performSetRoute where the check for change is made.
		if (this._isCurrent(routeId, params) && !force) {
			this.current = { ...this.current };
			return Promise.resolve(this.current);
		}

		if (!routeId) {
			// Quickly finish on empty route
			return Promise.resolve(this._setRoute(null, pushHistoryState));
		}

		let route = this.getRoute(routeId);

		if (!route) {
			return Promise.reject(new Error("Route Id '" + routeId + "' not found"));
		}

		if (this.current?.route?.onBeforeUnload && !force && !params.ignoreOnBeforeUnload) {
			this.setStatePromise = this.current.route.onBeforeUnload(this).then(result => {
				if (result) {
					return this._performSetRoute(route, params, pushHistoryState);
				} else {
					if (this.historyChanged) {
						this._setRoute(this.current, true);
					}
				}

				this.historyChanged = false;
			});

			return this.setStatePromise;
		} else {
			return this._performSetRoute(route, params, pushHistoryState);
		}
	}

	_performSetRoute(route, params, pushHistoryState) {
		// merge defaults if any
		if (route.staticRouteParams) {
			params = Object.assign(route.staticRouteParams, params);
		}

		this.setStatePromise = null;

		// Store settingRoute with route and params. If this changes while
		// setting state, that means this.setRoute has been called from
		// setState, and overrides this attempt.
		let settingRoute = {
			route,
			params,
		};
		this.settingRoute = settingRoute;
		return Promise.resolve(route.setState ? route.setState(params, route) : null)
			.then(() => {
				if (this.settingRoute == settingRoute) {
					return this._setRoute(settingRoute, pushHistoryState);
				}
			})
			.finally(() => {
				if (this.settingRoute == settingRoute) {
					this.settingRoute = null;
				}
			});
	}

	/**
	 * Sets current to the parent of current route using the same params.
	 * @param {boolean} [pushHistoryState] Optional flag if history params should be pushed. Default is true.
	 * @returns {Promise.<module/Router~setRoute>} Promise to the set route.
	 * @fires module/Router#set
	 */
	setParent(pushHistoryState = true) {
		if (!this.current || !this.current.route.parentId) {
			return Promise.resolve(this.current);
		}

		return this.setRoute(this.current.route.parentId, this.current.params, pushHistoryState);
	}

	/**
	 * Helper function to create the url returned by setState.
	 * It will properly url encode all the parts and concatenate them with slash (/).
	 * @param {Array.<string>} parts Array of path part strings
	 * @returns {string} Url string to be returned from setState callback.
	 */
	createUrl(parts) {
		return parts.map(part => encodeURIComponent(String(part))).join('/');
	}

	/**
	 * Helper function to create the url using a definition array.
	 * @param {object} params Params object.
	 * @param {Array.<Array.<string>>} pathDef Path definition array.
	 * @returns {string} Url string to be returned from setState callback.
	 */
	createDefUrl(params, pathDef) {
		if (!params) return null;

		next:
		for (let def of pathDef) {
			let parts = [];
			for (let d of def) {
				let c = d.slice(0, 1);
				let f = d.slice(1);
				if (c == '$') {
					let v = params[f];
					if (v === null || typeof v == 'undefined') {
						continue next;
					}
					parts.push(v);
				} else if (c == '!') {
					let v = params[f];
					if (!v) {
						continue next;
					}
					parts.push(f);
				} else {
					parts.push(d);
				}
			}
			return this.createUrl(parts);
		}
		return null;
	}

	/**
	 * Helper function to parse the url parts using a definition array. It will
	 * loop through the outer pathDef array and return first match. It is
	 * considered a match if each item in the inner array matches that of the
	 * path, or if the definition item starts with '$', in which case the part
	 * will be stored as a parameter. If the definition starts with '!' it will
	 * match if the rest matches with the part, in which case it will set the
	 * part as boolean true.
	 *
	 * Example:
	 * [
	 *    [ 'user', '$userId', '!allgroups' ], // Matches path "user/42/allgroups" where 42 will be
	 *    stored with the key 'userId', and the key 'allgroups' will be true.
	 * ]
	 * @param {Array.<string>} parts Array of path part strings.
	 * @param {Array.<Array.<string>>} pathDef Path definition array.
	 * dimentional array.
	 * @returns {object} Params object.
	 */
	parseDefUrl(parts, pathDef) {
		let len = parts.length - 1;
		next:
		for (let def of pathDef) {
			if (def.length != len) continue;

			let o = {};
			for (let i = 0; i < def.length; i++) {
				let p = parts[i + 1];
				let d = def[i];
				let c = d.slice(0, 1);
				let f = d.slice(1);
				if (c == '$') {
					o[f] = p;
				} else if (c == '!') {
					if (f != p) continue next;
					o[f] = true;
				} else if (d != p) {
					continue next;
				}
			}
			return o;
		}
		return null;
	}

	/**
	 * Sets current to the given setRoute
	 * @param {object} setRoute route object
	 * @param {boolean} pushHistoryState enable/disable push history state
	 * @returns {module/Router~setRoute} Returns the same setRoute
	 * @private
	 */
	_setRoute(setRoute, pushHistoryState) {
		let prev = this.current;
		this.previous = prev;
		this.current = setRoute;

		if (pushHistoryState) {
			let state = setRoute ? {
				routeId: setRoute.route.id,
				params: setRoute.params,
			} : null;

			let title = setRoute.route.name;
			let url = this.getUrl(setRoute.route, setRoute.params, { keepQuery: true });

			history.pushState(state, title, url);
		}

		/**
		 * Route set event.
		 * @event module/Router#set
		 * @type {module/Router~setEventData} An object with two properties, current and previous.
		 */
		this.app.eventBus.emit(this, 'module.router.set', {
			current: setRoute,
			previous: prev,
		});
		this.model.set(Object.assign({ route: null, params: null }, setRoute));
		return setRoute;
	}

	_setInitialRoute() {
		if (window.location.hash) {
			let currentPage = window.location.hash;
			let currentPageParts = currentPage.split('/').map(s => decodeURIComponent(s));

			this.initialRoute = currentPageParts[0].replace('#', '');
			this.initialRouteData = currentPageParts;
		} else {
			this.initialRoute = null;
			this.initialRouteData = null;
		}
	}

	resetRoute() {
		this._setInitialRoute();

		if (!this.initialRoute) {
			return;
		}

		let route = this.routes.get(this.initialRoute);
		if (!route) {
			return;
		}

		let routeData = null;
		if (route.parseUrl) {
			routeData = route.parseUrl(this.initialRouteData);
		}

		this.setRoute(route.id, routeData || {});
	}

	/**
	 * Sets the default route to be used on null.
	 * @param {string} routeId Id of the route to use as default
	 * @param {object} params Parameters
	 */
	setDefault(routeId, params = null) {
		if (!this.getRoute(routeId)) {
			throw "No route with id " + route.id + " exists";
		}

		this.default = {
			routeId,
			params,
		};

		if (!this.current && !this.initialRoute) {
			this.setRoute(routeId, params, false);
		}
	}

	/**
	 * Tests if a route is a descendant of another route
	 * @param {?string} descendantId Id of the descendant route. Null (root) will always return false.
	 * @param {?string} ancestorId Id of the ancestor route. Null (root) will always return true as.
	 * @returns {boolean}
	 */
	isDescendant(descendantId, ancestorId) {
		if (!ancestorId) {
			return true;
		}
		if (!descendantId) {
			return false;
		}

		let d = this.getRoute(descendantId);

		while (d && d.parentId) {
			if (ancestorId === d.parentId) {
				return true;
			}

			d = this.getRoute(d.parentId);
		}

		return false;
	}

	_isCurrent(routeId, params) {
		// Check if both are not set
		if (!routeId && !this.current) {
			return true;
		}

		// Check if one is set and the other isn't
		if (!routeId !== !this.current) {
			return false;
		}

		// Check if routeId is different
		if (routeId !== this.current.route.id) {
			return false;
		}

		// Make shallow compare of params objects
		return obj.equal(params, this.current.params);
	}

	dispose() {}
}

export default Router;
