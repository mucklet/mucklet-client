import { Model } from 'modapp-resource';
import PlayerSettingsEmailComponent from './PlayerSettingsEmailComponent';

/**
 * PlayerSettingsEmail adds a section to the PlayerSettings to show and set email.
 */
class PlayerSettingsEmail {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onIdentityChange = this._onIdentityChange.bind(this);

		this.app.require([
			'api',
			'pagePlayerSettings',
			'login',
			'accountEmail',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { alert: true }, eventBus: this.app.eventBus });
		this.identity = null;

		// Get user model to alert on unverified email.
		this.module.login.getLoginPromise().then(user => {
			if (user.identity && this.model) {
				this.identity = user.identity;
				this._listen(true);
				this._onIdentityChange();
			}
		});

		this.module.pagePlayerSettings.addTool({
			id: 'email',
			type: 'topSection',
			sortOrder: 30,
			componentFactory: (user, player, state) => user.identity && !this.module.api.isError(user.identity)
				? new PlayerSettingsEmailComponent(this.module, user.identity)
				: null,
			alertModel: this.model,
		});
	}

	_listen(on) {
		if (this.identity) {
			this.identity[on ? 'on' : 'off']('change', this._onIdentityChange);
		}
	}

	_onIdentityChange() {
		let m = this.identity;
		this.model.set({ alert: m && !(m.email || m.emailVerified) });
	}

	dispose() {
		this._listen(false);
		this.module.pagePlayerSettings.removeTool('email');
		this.identity = null;
		this.model = null;
	}
}

export default PlayerSettingsEmail;
