import { Model } from 'modapp-resource';
import TokenList from 'classes/TokenList';

/**
 * GlobalTeleports holds a list of global teleport nodes.
 */
class GlobalTeleports {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'login', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = new Model({ data: { globalTeleports: null }, eventBus: this.app.eventBus });
		this.module.login.getLoginPromise().then(() => this._getGlobalTeleports());
		this.list = new TokenList(() => this.getGlobalTeleports(), {
			regex: /^([\w\s]*\w)\s*/,
			expandRegex: { left: /\w\s/, right: /\w\s/ },
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null
		});
	}

	getModel() {
		return this.model;
	}

	getNode(nodeId) {
		let c = this.getGlobalTeleports();
		if (c) {
			for (let node of c) {
				if (node.id == nodeId) {
					return node;
				}
			}
		}
		return null;
	}

	getGlobalTeleports() {
		return this.model.globalTeleports || null;
	}

	getGlobalTeleportsList() {
		return this.list;
	}

	_getGlobalTeleports() {
		this.module.api.get('core.nodes').then(globalTeleports => {
			globalTeleports.on();
			this.model.set({ globalTeleports });
		});
	}

	dispose() {
		if (this.model.globalTeleports) {
			this.model.globalTeleports.off();
		}
		this.model.set({ globalTeleports: null });
	}
}

export default GlobalTeleports;
