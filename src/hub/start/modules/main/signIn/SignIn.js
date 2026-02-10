import { Model } from 'modapp-resource';
import Err from 'classes/Err';
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

		let container = document.getElementById('start-signin');
		if (!container) {
			console.error("[SignIn] Element id 'start-signin' not found.");
			return;
		}

		this.component = new SignInComponent(this.module, this.model);
		this.component.render(container);

		this._fetchUser();
	}

	async _fetchUser() {
		try {
			let user = await this.module.auth.getUserPromise();
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
