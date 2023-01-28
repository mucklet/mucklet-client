import { ModelWrapper } from 'modapp-resource';

/**
 * Info fetches info models.
 */
class Info {

	constructor(app, params) {
		this.app = app;

		this.params = params;

		this.app.require([ 'api', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.core = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.tag = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.mail = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.note = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.report = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.support = new ModelWrapper(null, { eventBus: this.app.eventBus });
		this.client = new ModelWrapper(Object.assign({ version: APP_VERSION }, this.params.client), { eventBus: this.app.eventBus });

		this.module.login.getLoginPromise().then(() => {
			this.module.api.get('core.info').then(info => {
				if (this.core) {
					this.core.setModel(info);
				}
			}).catch(err => console.error("Failed to get core info: ", err));

			this.module.api.get('tag.info').then(info => {
				if (this.tag) {
					this.tag.setModel(info);
				}
			}).catch(err => console.error("Failed to get tag info: ", err));

			this.module.api.get('mail.info').then(info => {
				if (this.mail) {
					this.mail.setModel(info);
				}
			}).catch(err => console.error("Failed to get mail info: ", err));

			this.module.api.get('note.info').then(info => {
				if (this.note) {
					this.note.setModel(info);
				}
			}).catch(err => console.error("Failed to get note info: ", err));

			this.module.api.get('report.info').then(info => {
				if (this.report) {
					this.report.setModel(info);
				}
			}).catch(err => console.error("Failed to get report info: ", err));

			this.module.api.get('support.info').then(info => {
				if (this.support) {
					this.support.setModel(info);
				}
			}).catch(err => console.error("Failed to get support info: ", err));

			this.module.api.get('client.web.info').then(info => {
				if (this.client) {
					this.client.setModel(info);
				}
			}).catch(err => console.error("Failed to get client info: ", err));
		});
	}

	getCore() {
		return this.core;
	}

	getTag() {
		return this.tag;
	}

	getMail() {
		return this.mail;
	}

	getNote() {
		return this.note;
	}

	getReport() {
		return this.report;
	}

	getSupport() {
		return this.support;
	}

	getClient() {
		return this.client;
	}

	dispose() {
		this.core.dispose();
		this.core = null;
		this.tag.dispose();
		this.tag = null;
		this.mail.dispose();
		this.mail = null;
		this.note.dispose();
		this.note = null;
		this.report.dispose();
		this.report = null;
		this.support.dispose();
		this.support = null;
		this.client.dispose();
		this.client = null;
	}
}

export default Info;
