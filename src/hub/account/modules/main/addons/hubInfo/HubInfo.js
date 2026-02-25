import { ModelWrapper } from 'modapp-resource';

/**
 * HubInfo fetches info models.
 */
class HubInfo {

	constructor(app, params) {
		this.app = app;

		this.params = params;

		this.app.require([
			'api',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.control = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.client = new ModelWrapper(Object.assign({ version: APP_VERSION }, this.params.client), { eventBus: this.app.eventBus });

		this.module.auth.getUserPromise().then(() => {
			this.module.api.get('control.info').then(info => {
				if (this.control) {
					this.control.setModel(info);
				}
			}).catch(err => console.error("Failed to get control info: ", err));

		});
	}

	getControl() {
		return this.control;
	}

	getClient() {
		return this.client;
	}

	dispose() {
		this.control.dispose();
		this.control = null;
		this.client.dispose();
		this.client = null;
	}
}

export default HubInfo;
