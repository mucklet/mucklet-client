import { Model, CollectionToModel, CollectionWrapper } from 'modapp-resource';
import { hasRoles, hasAnyRole } from 'utils/roles';
import { hasIdRoles, hasAnyIdRole } from 'utils/idRoles';

const namespace = 'module.player';

/**
 * Player holds the player data.
 */
class Player {
	constructor(app, params) {
		this.app = app;
		// Bind callbacks
		this._onUnsubscribe = this._onUnsubscribe.bind(this);
		this._onCtrlAdd = this._onCtrlAddRemove.bind(this, 'add');
		this._onCtrlRemove = this._onCtrlAddRemove.bind(this, 'remove');
		this._onModelChange = this._onModelChange.bind(this);
		this._onUserChange = this._onUserChange.bind(this);
		this._onIdentityChange = this._onIdentityChange.bind(this);

		this.app.require([
			'auth',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = new Model({ data: { player: null, roles: null, idRoles: null, activeChar: null, activeCharIdx: null }, eventBus: this.app.eventBus });
		this.ctrlModel = new CollectionToModel(null, c => c.id, { eventBus: this.app.eventBus });;
		this.availableChars = null;
		this.model.on('change', this._onModelChange);
		this.user = null;

		this._playerPromise = this.module.auth.getUserPromise().then(user => {
			this.user = user;
			this._listenUser(true);
			return this._getPlayerPromise();
		});
	}

	/**
	 * Attach an event handler function for one or more player module events.
	 * @param {?string} events One or more space-separated events. Null means any event. Available events are 'ctrlAdd', 'ctrlRemove', and 'activeChange'.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.app.eventBus.on(this, events, handler, namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, namespace);
	}

	getModel() {
		return this.model;
	}

	getPlayer() {
		return this.model.player || null;
	}

	getRoles() {
		return this.model.roles || null;
	}

	getIdRoles() {
		return this.model.idRoles || null;
	}

	getChars() {
		return (this.model.player && this.model.player.chars) || null;
	}

	getPuppets() {
		return (this.model.player && this.model.player.puppets) || null;
	}

	getAvailableChars() {
		return this.availableChars;
	}

	getControlled() {
		return (this.model.player && this.model.player.controlled) || null;
	}

	getControlledModel() {
		return this.ctrlModel;
	}

	getControlledChar(charId) {
		let chars = this.getControlled();
		if (chars) {
			for (let c of chars) {
				if (c.id == charId) {
					return c;
				}
			}
		}
		return null;
	}

	getActiveChar() {
		return this.model.activeChar || null;
	}

	setActiveChar(charId) {
		let ctrl = this.getControlled();
		if (ctrl) {
			let i = 0;
			for (let c of ctrl) {
				if (c.id == charId) {
					return this.model.set({ activeChar: c, activeCharIdx: i });
				}
				i++;
			}
		}
		return Promise.reject(new Error("Char " + charId + " not controlled"));
	}

	/**
	 * Returns true if the player is an admin, builder, moderator, or helper.
	 * @param {Array<string>} [roles] Player roles. Uses current player roles by default.
	 * @returns {boolean}
	 */
	isStaff(roles) {
		roles = roles || this.model.roles;
		return roles && (roles.indexOf('admin') >= 0 || roles.indexOf('builder') >= 0 || roles.indexOf('moderator') >= 0 || roles.indexOf('helper') >= 0);
	}

	/**
	 * Returns true if the player is an admin, or moderator.
	 * @param {Array<string>} [roles] Player roles. Uses current player roles by default.
	 * @returns {boolean}
	 */
	isModerator(roles) {
		roles = roles || this.model.roles;
		return roles && (roles.indexOf('admin') >= 0 || roles.indexOf('moderator') >= 0);
	}

	/**
	 * Returns true if the player is an admin or a builder.
	 * @param {Array<string>} [roles] Player roles. Uses current player roles by default.
	 * @returns {boolean}
	 */
	isBuilder(roles) {
		roles = roles || this.model.roles;
		return roles && (roles.indexOf('admin') >= 0 || roles.indexOf('builder') >= 0);
	}

	/**
	 * Returns true if the player is an admin or a helper.
	 * @param {Array<string>} [roles] Player roles. Uses current player roles by default.
	 * @returns {boolean}
	 */
	isHelper(roles) {
		roles = roles || this.model.roles;
		return roles && (roles.indexOf('admin') >= 0 || roles.indexOf('helper') >= 0);
	}

	/**
	 * Returns true if the player is an admin.
	 * @param {Array<string>} [roles] Player roles. Uses current player roles by default.
	 * @returns {boolean}
	 */
	isAdmin(roles) {
		roles = roles || this.model.roles;
		return roles && roles.indexOf('admin') >= 0 ;
	}

	/**
	 * Returns true if the player is a supporter or a pioneer.
	 * @param {Array<string>} [roles] Player ID roles. Uses current player ID roles by default.
	 * @returns {boolean}
	 */
	isBonus(roles) {
		roles = roles || this.model.idRoles;
		return roles && (roles.indexOf('overseer') >= 0 || roles.indexOf('pioneer') >= 0 || roles.indexOf('supporter') >= 0);
	}

	/**
	 * Returns true if the player is a pioneer.
	 * @param {Array<string>} [roles] Player ID roles. Uses current player ID roles by default.
	 * @returns {boolean}
	 */
	isPioneer(roles) {
		roles = roles || this.model.idRoles;
		return roles && (roles.indexOf('overseer') >= 0 || roles.indexOf('pioneer') >= 0);
	}

	/**
	 * Returns true if the player is a supporter.
	 * @param {Array<string>} [roles] Player ID roles. Uses current player ID roles by default.
	 * @returns {boolean}
	 */
	isSupporter(roles) {
		roles = roles || this.model.idRoles;
		return roles && (roles.indexOf('overseer') >= 0 || roles.indexOf('supporter') >= 0);
	}

	/**
	 * Returns true if the player is an overseer.
	 * @param {Array<string>} [roles] Player ID roles. Uses current player ID roles by default.
	 * @returns {boolean}
	 */
	isOverseer(roles) {
		roles = roles || this.model.idRoles;
		return roles && roles.indexOf('overseer') >= 0;
	}

	ownsChar(charId) {
		return !!this.getOwnedChar(charId);
	}

	getOwnedChar(charId) {
		charId = typeof charId == 'object' && charId ? charId.id : charId;
		let chars = this.getChars();
		if (charId && chars) {
			for (let char of chars) {
				if (char.id == charId) {
					return char;
				}
			}
		}
		return null;
	}

	getPuppet(charId, puppeteerId) {
		charId = typeof charId == 'object' && charId ? charId.id : charId;
		puppeteerId = typeof puppeteerId == 'object' && puppeteerId ? puppeteerId.id : puppeteerId;
		let puppeteers = this.getPuppets();
		if (charId && puppeteerId && puppeteers) {
			for (let puppeteer of puppeteers) {
				if (puppeteer.puppet.id == charId && puppeteer.char.id == puppeteerId) {
					return puppeteer;
				}
			}
		}
		return null;
	}

	getPlayerPromise() {
		return this._playerPromise;
	}

	/**
	 * Reloads player roles.
	 *
	 * Only needed to be called on events that signals that there has been a
	 * change of roles.
	 */
	reloadRoles() {
		this.module.api.call('core', 'getRoles').then(result => {
			if (this.model) {
				this.model.set({ roles: result.roles || [], idRoles: result.idRoles || [] });
			}
		});
	}

	/**
	 * Check if the current player has all of the provided roles.
	 * @param {string|Array.<string>} roles Role(s).
	 * @returns {boolean} True if the player has all roles, otherwise false.
	 */
	hasRoles(...roles) {
		return hasRoles(this.model, ...roles);
	}

	/**
	 * Check if the current player has any of the provided roles.
	 * @param {string|Array.<string>} roles Role(s).
	 * @returns {boolean} True if the player has any of the roles, otherwise false.
	 */
	hasAnyRole(...roles) {
		return hasAnyRole(this.model, ...roles);
	}

	/**
	 * Check if the current user has all of the provided ID roles.
	 * @param {string|Array.<string>} idRoles ID role(s).
	 * @returns {boolean} True if the user has all ID roles, otherwise false.
	 */
	hasIdRoles(...idRoles) {
		return hasIdRoles(this.model, ...idRoles);
	}

	/**
	 * Check if the current user has any of the provided ID roles.
	 * @param {string|Array.<string>} idRoles ID role(s).
	 * @returns {boolean} True if the user has any of the roles, otherwise false.
	 */
	hasAnyIdRole(...idRoles) {
		return hasAnyIdRole(this.model, ...idRoles);
	}

	_getPlayerPromise() {
		if (!this.playerPromise) {
			this.playerPromise = Promise.all([
				this.module.api.call('core', 'getPlayer'),
				this.module.api.call('core', 'getRoles'),
			]).then(result => {
				// Check if disposed
				if (!this.ctrlModel) {
					return;
				}
				let player = result[0];
				let roles = result[1].roles || [];
				let idRoles = result[1].idRoles || [];
				if (this.module.api.isError(player)) {
					return Promise.reject(player);
				}
				let ctrl = player.controlled;
				player.on('unsubscribe', this._onUnsubscribe);
				ctrl.on('add', this._onCtrlAdd);
				ctrl.on('remove', this._onCtrlRemove);
				for (let char of ctrl) {
					this.app.eventBus.emit(this, namespace + '.ctrlAdd', { char });
				}
				this.model.set(Object.assign({ player, roles, idRoles }, this._ctrlChange(ctrl)));
				this.ctrlModel.setCollection(player.controlled);
				this.availableChars = new CollectionWrapper(player.chars, {
					filter: c => c.state == 'asleep',
					eventBus: this.app.eventBus,
				});
				return player;
			}).catch(err => {
				this.playerPromise = null;
				throw err;
			});
		}
		return this.playerPromise;
	}

	_onUnsubscribe() {
		// Remove user model
		if (this.model.player) {
			let p = this.model.player;
			let ctrl = p.controlled;
			p.off('unsubscribe', this._onUnsubscribe);
			ctrl.off('add', this._onCtrlAdd);
			ctrl.off('remove', this._onCtrlRemove);
			for (let char of ctrl) {
				this.app.eventBus.emit(this, namespace + '.ctrlRemove', { char });
			}
			this.ctrlModel.dispose();
			this.ctrlModel = null;
			this.availableChars.dispose();
			this.availableChars = null;
		}
		this.model.set({ player: null, activeChar: null, activeCharIdx: null });
		this.playerPromise = null;
	}

	_onCtrlAddRemove(name, ev) {
		this.app.eventBus.emit(this, namespace + (name == 'add' ? '.ctrlAdd' : '.ctrlRemove'), { char: ev.item });
		this.model.set(this._ctrlChange(this.model.player?.controlled));
	}

	_onModelChange(changed) {
		if (changed && !changed.hasOwnProperty('activeChar')) {
			return;
		}

		let m = this.model;
		let dir = (!changed || m.activeCharIdx === null || changed.activeCharIdx === null)
			? 0
			: (m.activeCharIdx - changed.activeCharIdx) || 1;

		this.app.eventBus.emit(this, namespace + '.activeChange', { char: m.activeChar, dir });
	}

	_ctrlChange(ctrl) {
		// Check for no controlled characters
		if (!ctrl || !ctrl.length) {
			return { activeChar: null, activeCharIdx: null };
		}

		let active = this.model.activeChar;
		let idx = this.model.activeCharIdx || 0;

		// Find index position of active character
		if (active) {
			let newIdx = ctrl.indexOf(active);
			if (newIdx >= 0) {
				// Found at new position
				idx = newIdx;
			} else if (idx >= ctrl.length) {
				// Set index to last position if out of range.
				idx = ctrl.length - 1;
			}
		}

		return { activeChar: ctrl.atIndex(idx), activeCharIdx: idx };
	}

	_listenUser(on) {
		let cb = on ? 'on' : 'off';
		if (this.user) {
			this.user[cb]('change', this._onUserChange);
			if (this.user.identity) {
				this.user.identity[cb]('change', this._onIdentityChange);
			}
		}
	}

	_onUserChange(change) {
		if (!change || change.hasOwnProperty('roles')) {
			setTimeout(() => this.reloadRoles(), 500);
		}
	}

	_onIdentityChange(change) {
		if (!change || change.hasOwnProperty('idRoles')) {
			setTimeout(() => this.reloadRoles(), 500);
		}
	}

	dispose() {
		this._listenUser(false);
		this.user = false;
		this.ctrlModel.dispose();
		this.ctrlModel = null;
	}
}

export default Player;
