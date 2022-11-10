import { Model } from 'modapp-resource';

const settingsStoragePrefix = 'settings.user.';

/**
 * Settings stores local settings in the local storage per player.
 */
class Settings {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.settings = {};
	}

	loadSettings(id, defaultSettings, legacyMap) {
		if (this.settings[id]) {
			throw new Error("Settings loaded registered for: " + id);
		}

		let m = new Model({ data: defaultSettings, eventBus: this.app.eventBus });
		let c = {
			m,
			cb: null,
			def: defaultSettings,
			user: null
		};
		this.settings[id] = c;

		return this.module.login.getLoginPromise()
			.then(user => {
				c.user = user;
				return m.set(Object.assign({},
					this._storedSettings(user, id),
					this._paramSettings(id)
				));
			})
			.then(() => {
				// Listen and save any changes to settings
				c.cb = () => this._onSettingsChange(id);
				m.on('change', c.cb);
				c.cb();
				return m;
			});
	}

	_storedSettings(user, id) {
		if (!localStorage) return null;

		// Load settings
		let data = localStorage.getItem(settingsStoragePrefix + user.id + '.' + id);
		let o = data ? JSON.parse(data) : null;
		if (!o || typeof o != 'object') {
			return null;
		}

		return o;
	}

	_paramSettings(id) {
		let p = this.params[id];
		if (!p || typeof p !== 'object') return null;

		let o = {};
		for (let k in p) {
			try {
				o[k] = JSON.parse(p[k]);
			} catch (e) {
				o[k] = p[k];
			}
		}
		return o;
	}

	_onSettingsChange(id) {
		let c = this.settings[id];
		// Store the settings that are different from default
		if (c && localStorage) {
			let props = c.m.props;
			let o = props;
			if (c.def) {
				o = {};
				for (let k in props) {
					if (!c.def.hasOwnProperty(k) || props[k] !== c.def[k]) {
						o[k] = props[k];
					}
				}
			}
			localStorage.setItem(settingsStoragePrefix + c.user.id + '.' + id, JSON.stringify(o));
		}
	}

	dispose() {
		if (this.settings) {
			for (let k in this.settings) {
				let c = this.settings[k];
				if (c.cb) {
					c.m.off('change', c.cb);
				}
			}
			this.settings = null;
		}
	}
}

export default Settings;
