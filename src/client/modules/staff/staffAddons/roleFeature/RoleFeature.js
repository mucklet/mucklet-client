function featureMatchesRoles(feature, roles, idRoles) {
	if (feature.anyRole) {
		let match = false;
		for (let r of feature.anyRole) {
			if (roles.indexOf(r) >= 0 || idRoles.indexOf(r) >= 0) {
				match = true;
				break;
			}
		}
		if (!match) {
			return false;
		}
	}
	if (feature.allRoles) {
		for (let r of feature.allRoles) {
			if (roles.indexOf(r) < 0 && idRoles.indexOf(r) < 0) {
				return false;
			}
		}
	}

	return feature.condition
		? feature.condition(roles, idRoles)
		: true;
}

/**
 * RoleFeature allows features to be activated based on player's roles.
 */
class RoleFeature {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.features = {};
		this.active = {};

		this.playerModel = this.module.player.getModel();
		this.playerModel.on('change', this._onModelChange);
		this._onModelChange();
	}

	/**
	 * Registers a feature that is initialized if all of the role conditions are fulfilled.
	 * @param {object} feature Feature object
	 * @param {string} feature.id Feature ID.
	 * @param {Array.<string>} [feature.anyRole] Array of roles. If player has any of the roles, the condition is fulfilled.
	 * @param {Array.<string>} [feature.allRoles] Array of roles. If player has all of the roles, the condition is fulfilled.
	 * @param {function} feature.condition Callback function. If the function returns true, the condition is fulfilled: function(roles, idroles) -> boolean
	 * @param {function} feature.init Callback function called when intializing the feature: function() -> Context
	 * @param {function} [feature.dispose] Callback function called when disposing the feature: function(Context)
	 * @returns {this}
	 */
	addFeature(feature) {
		if (this.features[feature.id]) {
			throw new Error("Feature ID already registered: " + feature.id);
		}
		this.features[feature.id] = feature;
		this._setActivity(feature);
		return this;
	}

	/**
	 * Unregisters a previously registered help feature.
	 * @param {string} featureId Feature ID.
	 * @returns {this}
	 */
	removeFeature(featureId) {
		let feature = this.feature[featureId];
		if (feature) {
			this._deactivate(feature);
			delete this.feature[featureId];
		}
		return this;
	}

	_setActivity(feature) {
		let o = this.active[feature.id];

		if (featureMatchesRoles(feature, this.playerModel.roles || [], this.playerModel.idRoles || [])) {
			if (!o) {
				try {
					let ctx = feature.init();
					this.active[feature.id] = { ctx };
				} catch (ex) {
					console.error("[RoleFeature] Exception activating feature " + feature.id, ex);
				}
			}
		} else {
			if (o) {
				if (feature.dispose) {
					feature.dispose(o.ctx);
				}
				delete this.active[feature.id];
			}
		}
	}

	_deactivate(feature) {
		let o = this.active[feature.id];
		if (o) {
			if (feature.dispose) {
				feature.dispose(o.ctx);
			}
			delete this.active[feature.id];
		}
	}

	_onModelChange(change) {
		if (!change || change.hasOwnProperty('roles') || change.hasOwnProperty('idRoles')) {
			for (let featureId in this.features) {
				this._setActivity(this.features[featureId]);
			}
		}
	}

	dispose() {
		this.playerModel.off('change', this._onModelChange);
		for (let featureId in this.active) {
			this._deactivate(this.features[featureId]);
		}
		this.active = {};
		this.features = {};
	}
}

export default RoleFeature;
