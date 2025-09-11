import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import Err from 'classes/Err';

import RouteReleasesComponent from './RouteReleasesComponent';
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
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			type: 'realm',
			releases: null,
			release: null,
			user: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'releases',
			icon: 'th-large',
			name: l10n.l('routeReleases.realmReleases', "Realm releases"),
			component: new RouteReleasesComponent(this.module, this.model),
			setState: params => this._setState('realm', params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => {
				let o = this.module.router.parseDefUrl(parts, pathDef);
				if (typeof o?.pageNr == 'string') {
					o.pageNr = Number(o.pageNr) || 0;
				}
				return o;
			},
			order: 1020,
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	releaseId?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('releases', params);
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
		this.module.router.removeRoute('releases');
	}
}

export default RouteReleases;
