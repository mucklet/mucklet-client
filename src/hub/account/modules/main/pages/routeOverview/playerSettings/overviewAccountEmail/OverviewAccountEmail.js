import { Model } from 'modapp-resource';
import { relistenResource } from 'utils/listenResource';
import OverviewAccountEmailComponent from './OverviewAccountEmailComponent';

/**
 * OverviewAccountEmail adds a section to the PlayerSettings to show and set email.
 */
class OverviewAccountEmail {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onUserChange = this._onUserChange.bind(this);

		this.app.require([
			'api',
			'routeOverview',
			'accountEmail',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { alert: true }, eventBus: this.app.eventBus });
		this.user = null;

		// Get user model to alert on unverified email.
		this.module.auth.getUserPromise().then(user => {
			if (this.model) {
				this.user = relistenResource(this.user, user, this._onUserChange);
				this._onUserChange();
			}
		});

		this.module.routeOverview.addTool({
			id: 'email',
			type: 'topSection',
			sortOrder: 30,
			componentFactory: (user, state) => new OverviewAccountEmailComponent(this.module, user, state),
			alertModel: this.model,
		});
	}

	_onUserChange() {
		let m = this.user;
		this.model.set({ alert: m && !(m.email && m.emailVerified) });
	}

	dispose() {
		this.user = relistenResource(this.user, null, this._onUserChange);
		this.module.routeOverview.removeTool('email');
		this.model = null;
	}
}

export default OverviewAccountEmail;
