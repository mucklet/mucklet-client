/**
 * BundleLoader waits for the player to be logged in, and then loads additional
 * bundles depending on the player roles.
 */
class BundleLoader {

	constructor(app, params) {
		this.app = app;
		// Bind callbacks
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([ 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.loaded = {};
		this.promises = {};
		this.playerModel = this.module.player.getModel();
		this.playerModel.on('change', this._onModelChange);
		this._onModelChange();
	}

	_onModelChange(change) {
		if (!change || change.hasOwnProperty('roles')) {
			let roles = this.playerModel.roles;
			if (roles) {
				if (roles.indexOf('admin') >= 0 || roles.indexOf('builder') >= 0 || roles.indexOf('moderator') >= 0 || roles.indexOf('helper') >= 0) {
					this._loadStaffModules();
				}
				if (roles.indexOf('admin') >= 0) {
					this._loadAdminModules();
				}
				if (roles.indexOf('admin') >= 0 || roles.indexOf('moderator') >= 0) {
					this._loadModModules();
				}
				if (roles.indexOf('admin') >= 0 || roles.indexOf('builder') >= 0) {
					this._loadBuildModules();
				}
				if (roles.indexOf('admin') >= 0 || roles.indexOf('helper') >= 0) {
					this._loadHelperModules();
				}
			}
		}
		if (!change || change.hasOwnProperty('idRoles')) {
			let idRoles = this.playerModel.idRoles;
			if (idRoles) {
				if (idRoles.indexOf('overseer') >= 0 || idRoles.indexOf('pioneer') >= 0 || idRoles.indexOf('supporter') >= 0) {
					this._loadBonusModules();
				}
				if (idRoles.indexOf('overseer') >= 0 || idRoles.indexOf('pioneer') >= 0) {
					this._loadPioneerModules();
				}
				if (idRoles.indexOf('overseer') >= 0 || idRoles.indexOf('supporter') >= 0) {
					this._loadSupporterModules();
				}
				if (idRoles.indexOf('overseer') >= 0) {
					this._loadOverseerModules();
					this._loadAdminModules();
					this._loadModModules();
					this._loadBuildModules();
					this._loadStaffModules();
					this._loadHelperModules();
				}
			}
		}
	}

	_loadAdminModules() {
		if (this.loaded.admin) return;
		this.loaded.admin = true;
		// Load admin modules
		import(/* webpackChunkName: "admin" */ 'modules/admin-modules').then(({ default: modules }) => {
			this._getPromise('staff').then(() => app.loadBundle(modules).then(result => {
				console.log("Admin modules: ", result);
				this._resolvePromise('admin');
			}));
		});
	}

	_loadModModules() {
		if (this.loaded.moderator) return;
		this.loaded.moderator = true;
		// Load moderator modules
		import(/* webpackChunkName: "moderator" */ 'modules/moderator-modules').then(({ default: modules }) => {
			this._getPromise('staff').then(() => app.loadBundle(modules).then(result => {
				console.log("Moderator modules: ", result);
				this._resolvePromise('moderator');
			}));
		});
	}

	_loadBuildModules() {
		if (this.loaded.builder) return;
		this.loaded.builder = true;
		// Load builder modules
		import(/* webpackChunkName: "builder" */ 'modules/builder-modules').then(({ default: modules }) => {
			this._getPromise('staff').then(() => app.loadBundle(modules).then(result => {
				console.log("Builder modules: ", result);
				this._resolvePromise('builder');
			}));
		});
	}

	_loadHelperModules() {
		if (this.loaded.helper) return;
		this.loaded.helper = true;
		// Load helper modules
		import(/* webpackChunkName: "helper" */ 'modules/helper-modules').then(({ default: modules }) => {
			this._getPromise('staff').then(() => app.loadBundle(modules).then(result => {
				console.log("Helper modules: ", result);
				this._resolvePromise('helper');
			}));
		});
	}

	_loadOverseerModules() {
		if (this.loaded.overseer) return;
		this.loaded.overseer = true;
		// Load overseer modules
		import(/* webpackChunkName: "overseer" */ 'modules/overseer-modules').then(({ default: modules }) => {
			this._getPromise('admin').then(() => app.loadBundle(modules).then(result => {
				console.log("Overseer modules: ", result);
				this._resolvePromise('overseer');
			}));
		});
	}

	_loadPioneerModules() {
		if (this.loaded.pioneer) return;
		this.loaded.pioneer = true;
		// Load pioneer modules
		import(/* webpackChunkName: "pioneer" */ 'modules/pioneer-modules').then(({ default: modules }) => {
			app.loadBundle(modules).then(result => {
				console.log("Pioneer modules: ", result);
				this._resolvePromise('pioneer');
			});
		});
	}

	_loadSupporterModules() {
		if (this.loaded.supporter) return;
		this.loaded.supporter = true;
		// Load supporter modules
		import(/* webpackChunkName: "supporter" */ 'modules/supporter-modules').then(({ default: modules }) => {
			app.loadBundle(modules).then(result => {
				console.log("Supporter modules: ", result);
				this._resolvePromise('supporter');
			});
		});
	}

	_loadStaffModules() {
		if (this.loaded.staff) return;
		this.loaded.staff = true;
		// Load staff modules
		import(/* webpackChunkName: "staff" */ 'modules/staff-modules').then(({ default: modules }) => {
			app.loadBundle(modules).then(result => {
				console.log("Staff modules: ", result);
				this._resolvePromise('staff');
			});
		});
	}

	_loadBonusModules() {
		if (this.loaded.bonus) return;
		this.loaded.bonus = true;
		// Load bonus modules
		import(/* webpackChunkName: "bonus" */ 'modules/bonus-modules').then(({ default: modules }) => {
			app.loadBundle(modules).then(result => {
				console.log("Bonus modules: ", result);
				this._resolvePromise('bonus');
			});
		});
	}

	_resolvePromise(bundle) {
		let o = this.promises[bundle];
		if (o) {
			if (o.resolve) {
				o.resolve();
				delete o.resolve;
			}
		} else {
			o = { promise: Promise.resolve() };
			this.promises[bundle] = o;
		}
	}

	_getPromise(bundle) {
		let o = this.promises[bundle];
		if (!o) {
			o = {};
			o.promise = new Promise((resolve) => {
				o.resolve = resolve;
			});
			this.promises[bundle] = o;
		}
		return o.promise;
	}

	dispose() {
		// Can only stop listening to player model.
		// There is no way to unload modules.
		this.playerModel.off('change', this._onModelChange);
	}
}

export default BundleLoader;
