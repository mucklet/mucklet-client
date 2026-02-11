import { Model, Collection } from 'modapp-resource';
import Err from 'classes/Err';
import compareSortOrderId from 'utils/compareSortOrderId';
import SignInComponent from './SignInComponent';
import './signIn.scss';

const errNotLoggedIn = new Err('signIn.notLoggedIn', "Not logged in");

/**
 * SignIn fetches a list of realms to show on the start page.
 */
class SignIn {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			user: null,
			error: null,
		}});

		this.menuItems = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});

		let container = document.getElementById('start-signin');
		if (!container) {
			console.error("[SignIn] Element id 'start-signin' not found.");
			return;
		}

		this.component = new SignInComponent(this.module, this.model);
		this.component.render(container);

		this._fetchUser();
	}

	/**
	 * Gets a collection of menuItems.
	 * @returns {Collection} Collection of menuItems.
	 */
	getMenuItems() {
		return this.menuItems;
	}

	/**
	 * Registers a realm menuItem.
	 * @param {object} menuItem MenuItem object
	 * @param {string} menuItem.id MenuItem ID.
	 * @param {string} menuItem.icon Icon.
	 * @param {string | LocaleString} menuItem.name Icon.
	 * @param {(ev: Event) => void} menuItem.onClick On click callback function.
	 * @param {number} menuItem.sortOrder Sort order.
	 * @param {number} [menuItem.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addMenuItem(menuItem) {
		if (this.menuItems.get(menuItem.id)) {
			throw new Error("MenuItem ID already registered: ", menuItem.id);
		}
		this.menuItems.add(menuItem);
		return this;
	}

	async _fetchUser() {
		try {
			let user = await this.module.auth.getAuthenticatePromise();
			this.model.set({ user, error: user ? null : errNotLoggedIn });
		} catch (error) {
			this.model.set({ error });
		}
	}

	dispose() {
		this.component?.unrender(container);
		this.component = null;
		this.model = null;
	}
}

export default SignIn;
