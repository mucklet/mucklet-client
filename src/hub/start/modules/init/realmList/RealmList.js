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
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			realmId: null,
			realms: null,
			error: null,
		}});

		let container = document.getElementById('start-realms');
		if (!container) {
			console.error("[RealmList] Element id 'start-realms' not found.");
			return;
		}

		this.component = new RealmListComponent(this.module, this.model);
		this.component.render(container);

		this._fetchRealms();
	}

	/**
	 * Sets an array or collection of realms to display:
	 * @param {Collection<RealmModel> | Array<RealmModel>} realms Realms.
	 */
	setRealms(realms) {
		this.model.set({ realms });
	}

	async _fetchRealms() {
		const url = this.module.api.getWebResourceUri('control.realms?limit=3');
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}

			const realms = await response.json();
			this.model?.set({ realms });
		} catch (error) {
			console.error(error.message);
			this.model?.set({ error });
		}
	}

	dispose() {
		this.component?.unrender();
		this.component = null;
		this.model = null;
	}
}

export default RealmList;
