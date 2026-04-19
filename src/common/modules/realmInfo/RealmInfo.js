import { relistenResource } from 'utils/listenResource';
import RealmInfoComponent from './RealmInfoComponent';
import './realmInfo.scss';

/**
 * RealmInfo renders a realm info component with image, description, etc.
 */
class RealmInfo {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.resources = null;
		this.resourcesPromise = null;
		this.subscribers = 0;
	}

	/**
	 * Gets an object with resources to be used with newRealmInfoComponent.
	 * When no longer needed, releaseResources should be called.
	 * @returns {object} Object with resources to render RealmInfoComponent.
	 */
	getResources() {
		this.subscribers++;
		this.resourcePromise = this.resourcePromise || this._fetchResources();
		return this.resourcePromise;
	}


	releaseResources() {
		if (!this.subscribers) {
			console.error("[RealmInfo] Call to releaseResource with no subscribers.");
			return;
		}
		this.subscribers--;
		if (!this.subscribers) {
			this._unlistenAll();
		}
	}

	/**
	 * Creates a new RealmInfoComponent using resources returned by getResources()
	 * @param {object} resources Resource object.
	 * @returns {Component} RealmInfoComponent.
	 */
	newRealmInfo(resources) {
		return new RealmInfoComponent(this.module, resources.info, resources.tags, resources.links, resources.population);
	}

	async _fetchResources() {
		let resources = {};
		this.resources = resources;
		try {
			let realmId = this.app.props.realm?.id || (await this.module.api.get('core.info').then(info => info.realmId));
			await Promise.all([
				await this.module.api.get('core.info')
					.then(info => this._tryListen('info', info))
					.catch(err => {
						console.error("Error getting realm tags: ", err);
						return null;
					}),
				realmId
					? await this.module.api.get(`control.realm.${realmId}.tags`)
						.then(tags => this._tryListen('tags', tags))
						.catch(err => {
							console.error("Error getting realm tags: ", err);
							return null;
						})
					: null,
				realmId
					? await this.module.api.get(`control.realm.${realmId}.links`)
						.then(links => this._tryListen('links', links))
						.catch(err => {
							console.error("Error getting realm links: ", err);
							return null;
						})
					: null,
				this.module.api.get('core.population')
					.then(population => this._tryListen('population', population))
					.catch(err => {
						console.error("Error getting realm population: ", err);
						return null;
					}),
			]);
		} catch (err) {
			this._unlistenAll();
			console.error(err);
			throw err;
		}

		return resources;
	}

	_tryListen(key, m) {
		if (this.resources) {
			this.resources[key] = relistenResource(this.resources[key], m);
		}
		return m;
	}

	_unlistenAll() {
		if (this.resources) {
			for (let k in this.resources) {
				this._tryListen(k, null);
			}
			this.resources = null;
		}
		this.resourcePromise = null;
	}

}

export default RealmInfo;
