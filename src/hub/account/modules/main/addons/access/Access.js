import AccessWrapper from 'classes/AccessWrapper';
import { hasIdRoles } from 'utils/idRoles';

/**
 * Access provides helper methods for access.
 */
class Access {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.overseerAccess = new AccessWrapper(null, m => hasIdRoles(m, [ 'overseer' ]));
		this.supporterAccess = new AccessWrapper(null, m => hasIdRoles(m, [ 'supporter', 'pioneer' ]));
		this.user = null;

		// Get current user and set it for all access wrappers.
		this.module.auth.getUserPromise().then(user => {
			if (this.overseerAccess) {
				this.user = user;
				user.on();
				this.overseerAccess.setModel(user);
				this.supporterAccess.setModel(user);
			}
		});
	}

	/**
	 * Returns an access component wrapper for overseer access.
	 * @returns {AccessWrapper} Access wrapper object.
	 */
	getOverseerAccess() {
		return this.overseerAccess;
	}

	/**
	 * Returns an access component wrapper for supporter access.
	 * @returns {AccessWrapper} Access wrapper object.
	 */
	getSupporterAccess() {
		return this.supporterAccess;
	}

	dispose() {
		this.user?.off();
		this.user = null;
		this.overseerAccess = null;
		this.supporterAccess = null;
	}
}

export default Access;
