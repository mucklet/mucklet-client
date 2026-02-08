import { Model } from 'modapp-resource';
import SearchBarComponent from './SearchBarComponent';
import './searchBar.scss';
import RealmFilter from 'classes/RealmFilter';

/**
 * SearchBar fetches a list of realms to show on the start page.
 */
class SearchBar {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'realmList',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			input: '',
			realms: null,
		}});

		let container = document.getElementById('start-searchbar');
		if (!container) {
			console.error("[SearchBar] Element id 'start-searchbar' not found.");
			return;
		}

		this.filter = new RealmFilter('');

		this.component = new SearchBarComponent(this.module, this.model, this.filter);
		this.component.render(container);
	}

	getRealmsPromise() {
		this.realmsPromise = this.realmsPromise || this.module.api.get('control.realms').then(realms => {
			if (this.model) {
				this.model.set({ realms });
				realms.on();
			}
			return realms;
		}).catch(err => console.error("[SearchBar] Error getting realms: ", err));
		return this.realmsPromise;
	}

	dispose() {
		this.component?.unrender();
		this.component = null;
		this.model?.realms?.off();
		this.model = null;
	}
}

export default SearchBar;
