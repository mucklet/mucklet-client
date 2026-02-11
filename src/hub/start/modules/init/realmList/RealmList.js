import { Model } from 'modapp-resource';
import RealmListComponent from './RealmListComponent';
import './realmList.scss';

/**
 * RealmList fetches a list of realms to show on the start page.
 */
class RealmList {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			realmId: null,
			realms: null,
			pageNr: 0,
			error: null,
		}});

		this.allRealms = null;

		let container = document.getElementById('start-realms');
		if (!container) {
			console.error("[RealmList] Element id 'start-realms' not found.");
			return;
		}

		this.component = new RealmListComponent(this.module, this.model);
		this.component.render(container);

		this.getRealmsPromise();
	}

	/**
	 * Sets an array or collection of realms to display:
	 * @param {Collection<RealmModel> | Array<RealmModel>} realms Realms.
	 */
	setRealms(realms) {
		this.model?.set({ realms, pageNr: 0, realmId: null });
	}

	getRealmsPromise() {
		this.realmsPromise = this.realmsPromise || this._authenticateAndFetchRealms();
		return this.realmsPromise;
	}

	async _authenticateAndFetchRealms() {
		try {
			// const url = this.module.api('control.realms?limit=3');
			// const response = await fetch(url);
			// if (!response.ok) {
			// 	throw new Error(`Response status: ${response.status}`);
			// }

			// const realms = await response.json();

			// Try authenticate.
			try {
				await this.module.auth.authenticate(true);
			} catch (error) {
				console.error("[RealmList] Error authenticating: ", error);
			}

			// While the realms are few, fetch all over WebSocket
			const realms = await this.module.api.get('control.realms');
			if (this.model) {
				this.allRealms = realms;
				realms.on();
			}
			this.setRealms(realms.toArray());
			return realms;

		} catch (error) {
			console.error("[RealmList] Error getting realms: ", error);
			this.model?.set({ error });
		}
	}

	dispose() {
		this.component?.unrender();
		this.component = null;
		this.allRealms?.off();
		this.allRealms = null;
		this.model = null;
	}
}

export default RealmList;
