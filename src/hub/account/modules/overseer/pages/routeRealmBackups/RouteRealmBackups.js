import { Elem } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import { relistenResource } from 'utils/listenResource';

import RouteRealmBackupsComponent from './RouteRealmBackupsComponent';
import './routeRealmBackups.scss';

const pathDef = [
	[ 'realm', '$realmId', 'page', '$pageNr', 'backup', '$backupId' ],
	[ 'realm', '$realmId', 'page', '$pageNr' ],
	[ 'realm', '$realmId', 'backup', '$backupId' ],
	[ 'realm', '$realmId' ],
];

/**
 * RouteRealmBackups adds the realmBackups route.
 */
class RouteRealmBackups {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'access',
			'routeRealms',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			realm: null,
			backupId: null,
			pageNr: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'realmbackups',
			hidden: true,
			parentId: 'realms',
			icon: 'database',
			name: l10n.l('routeRealmBackups.realmBackups', "Realm Backups"),
			component: new RouteRealmBackupsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => {
				const p = Object.assign({}, params);
				// Delete zero object
				if (!p.pageNr || p.pageNr < 0) {
					delete p.pageNr;
				}
				return this.module.router.createDefUrl(params, pathDef);
			},
			parseUrl: parts => {
				let params = this.module.router.parseDefUrl(parts, pathDef);
				if (params?.pageNr) {
					let pageNr = Number(params.pageNr);
					if (!pageNr || pageNr < 0) {
						delete params.pageNr;
					} else {
						params.pageNr = pageNr;
					}
				}
				return params;
			},
			order: 20,
		});

		this.module.routeRealms.addTool({
			id: 'realmBackups',
			sortOrder: 20,
			type: 'button',
			condition: (realm) => realm.apiType == 'node',
			componentFactory: (realm) => new Elem(n => n.elem('button', { className: 'iconbtn medium', events: {
				click: (c, ev) => {
					ev.stopPropagation();
					this.setRoute({ realmId: realm.id });
				},
			}}, [
				n.component(new FAIcon('database')),
			])),
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	realmId?: string;
	 * 	backupId?: string;
	 * 	pageNr?: number;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('realmbackups', params);
	}

	async _setState(params) {
		if (!params?.realmId) {
			return this.module.routeRealms.setRoute();
		}

		try {
			const realm = await this.module.api.get(`control.realm.${params.realmId}`);
			return this._setModel({ realm, backupId: params.backupId, pageNr: params.pageNr });
		} catch (error) {
			console.error(error);
			return this._setModel({ error });
		}
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			realm: relistenResource(this.model.realm, props.realm),
			backupId: props.backupId || null,
			pageNr: props.pageNr || 0,
			error: props.error || null,
		});
	}

	dispose() {
		this.module.router.removeRoute('realmbackups');
		this.module.routeRealmBackups.removeTool('realmBackups');
	}
}

export default RouteRealmBackups;
