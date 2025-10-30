import { Model } from 'modapp-resource';
import { relistenResource } from 'utils/listenResource';
import Err from 'classes/Err';

import RouteReleasesComponent from './RouteReleasesComponent';
import types from './routeReleasesTypes';
import './routeReleases.scss';

const pathDef = [
	[ 'release', '$releaseId' ],
	[ 'page', '$pageNr' ],
];

const errReleaseNotFound = new Err('routeReleases.releaseNotFound', "Release not found.");

/**
 * RouteReleases adds the releases route.
 */
class RouteReleases {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'dialogCreateRelease',
			'confirm',
			'toaster',
			'dialogEditReleaseTemplate',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			type: Object.keys(types)[0],
			releases: null,
			release: null,
			user: null,
			error: null,
		}, eventBus: this.app.eventBus });

		for (let key in types) {
			let t = types[key];
			this.module.router.addRoute({
				id: t.id,
				icon: t.icon,
				name: t.name,
				component: new RouteReleasesComponent(this.module, this.model, key),
				setState: params => this._setState(t.key, params),
				getUrl: params => this.module.router.createDefUrl(params, pathDef),
				parseUrl: parts => {
					let o = this.module.router.parseDefUrl(parts, pathDef);
					if (typeof o?.pageNr == 'string') {
						o.pageNr = Number(o.pageNr) || 0;
					}
					return o;
				},
				order: t.order,
			});
		}
	}

	/**
	 * Sets the route to the router.
	 * @param {"realm"|"node"} type Type of release
	 * @param {{
	 * 	releaseId?: string;
	 * }} params - Route parameters.
	 */
	setRoute(type, params) {
		let t = types[type];
		if (!t) {
			throw "Invalid release type: " + type;
		}
		this.module.router.setRoute(t.id, params);
	}

	async _setState(type, params) {
		return this.module.auth.getUserPromise()
			.then(user => params?.releaseId
				? this.module.api.get(`control.overseer.release.${params.releaseId}`)
					.then(release => {
						if (release.type != type) {
							throw errReleaseNotFound;
						}
						this._setModel({ type, release });
					})
				: this.module.api.get(`control.overseer.releases.${type}`)
					.then(releases => {
						this._setModel({ type, releases });
					}),
			)
			.catch(error => {
				console.error(error);
				return this._setModel({ type, error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			type: props.type || 'realm',
			release: relistenResource(this.model.release, props.release),
			releases: relistenResource(this.model.releases, props.releases),
			error: props.error || null,
		});
	}

	dispose() {
		for (let key in types) {
			let t = types[key];
			this.module.router.removeRoute(t.id);
		}
	}
}

export default RouteReleases;
