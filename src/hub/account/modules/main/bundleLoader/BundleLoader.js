import { hasAnyIdRole } from 'utils/idRoles';

/**
 * BundleLoader waits for the user to be logged in, and then loads additional
 * bundles depending on user roles.
 */
class BundleLoader {

	constructor(app, params) {
		this.app = app;
		// Bind callbacks
		this._onUserChange = this._onUserChange.bind(this);

		this.app.require([
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.loaded = {};
		this.promises = {};
		this.user = null;
		// Get current user and set it for all access wrappers.
		this.module.auth.getUserPromise().then(user => {
			if (this.loaded) {
				this.user = user;
				user.on('change', this._onUserChange);
				this._onUserChange();
			}
		});
	}

	_onUserChange(change) {
		if (this.user && (!change || change.hasOwnProperty('idRoles'))) {
			// if (hasAnyIdRole(this.user, [ 'pioneer', 'supporter' ])) {
			// 	this._loadBonusModules();
			// }
			// if (hasAnyIdRole(this.user, [ 'pioneer' ])) {
			// 	this._loadPioneerModules();
			// }
			// if (hasAnyIdRole(this.user, [ 'supporter' ])) {
			// 	this._loadSupporterModules();
			// }
			if (hasAnyIdRole(this.user, [ 'overseer' ])) {
				this._loadOverseerModules();
			}
		}
	}

	_loadOverseerModules() {
		if (this.loaded.overseer) return;
		this.loaded.overseer = true;
		// Load overseer modules
		import(/* webpackChunkName: "overseer" */ 'account/modules/overseer-modules').then(({ default: modules }) => {
			app.loadBundle(modules).then(result => {
				console.log("Overseer modules: ", result);
				this._resolvePromise('overseer');
			});
		});
	}

	// _loadPioneerModules() {
	// 	if (this.loaded.pioneer) return;
	// 	this.loaded.pioneer = true;
	// 	// Load pioneer modules
	// 	import(/* webpackChunkName: "pioneer" */ 'modules/pioneer-modules').then(({ default: modules }) => {
	// 		app.loadBundle(modules).then(result => {
	// 			console.log("Pioneer modules: ", result);
	// 			this._resolvePromise('pioneer');
	// 		});
	// 	});
	// }

	// _loadSupporterModules() {
	// 	if (this.loaded.supporter) return;
	// 	this.loaded.supporter = true;
	// 	// Load supporter modules
	// 	import(/* webpackChunkName: "supporter" */ 'modules/supporter-modules').then(({ default: modules }) => {
	// 		app.loadBundle(modules).then(result => {
	// 			console.log("Supporter modules: ", result);
	// 			this._resolvePromise('supporter');
	// 		});
	// 	});
	// }

	// _loadBonusModules() {
	// 	if (this.loaded.bonus) return;
	// 	this.loaded.bonus = true;
	// 	// Load bonus modules
	// 	import(/* webpackChunkName: "bonus" */ 'modules/bonus-modules').then(({ default: modules }) => {
	// 		app.loadBundle(modules).then(result => {
	// 			console.log("Bonus modules: ", result);
	// 			this._resolvePromise('bonus');
	// 		});
	// 	});
	// }

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
		this.userModel.off('change', this._onUserChange);
	}
}

export default BundleLoader;
