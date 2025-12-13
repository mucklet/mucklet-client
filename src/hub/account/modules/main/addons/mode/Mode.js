import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';

const modes = [
	{ key: 'user', name: l10n.l('mode.user', "User"), criteria: (user) => true },
	{ key: 'overseer', name: l10n.l('mode.admin', "Admin"), criteria: (user) => user?.idRoles.includes('overseer') },
];
const namespace = 'module.mode';

/**
 * Mode holds the active mode, such as 'user' or 'overseer'.
 */
class Mode {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._update = this._update.bind(this);

		this.app.require([
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { mode: 'user' }});
		this.modes = new CollectionWrapper(modes, {
			filter: (r) => r.criteria(this.user),
		});

		this.user = null;
		this.module.auth.getUserPromise().then(user => {
			if (this.model) {
				this.user = user;
				this.user.on('change', this._update);
				this._update();
			}
		});
	}

	/**
	 * Returns a collection of available modes.
	 * @returns {Collection<{ key: "user"|"admin", name: LocaleString }} Collection of modes.
	 */
	getModes() {
		return this.modes;
	}

	/**
	 * Returns the mode model.
	 * @returns {Model<{ mode: "user"|"admin" }>} Mode model.
	 */
	getModel() {
		return this.model;
	}

	/**
	 * Returns the active mode.
	 * @returns {{ key: "user"|"admin", name: LocaleString }} Mode
	 */
	getActiveMode() {
		for (let m of modes) {
			if (m.key == this.model?.mode) {
				return m;
			}
		}
		console.log("Active mode not found");
	}

	/**
	 * Set the currently active mode. The user must fulfil the mode criteria.
	 * @param {"user"|"overseer"} mode Mode key.
	 */
	setMode(mode) {
		for (let m of modes) {
			if (m.key == mode) {
				if (!m.criteria(this.user)) {
					console.error("User does not fulfil mode criteria");
					return;
				}
				return this._setMode(mode);
			}
		}
		console.error("Mode not found: ", mode);
	}

	/**
	 * Attach an event handler function for one or more player module events.
	 * @param {?string} events One or more space-separated events. Null means any event. Available events are 'modeChange'.
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

	_update() {
		if (!this.model || !this.user) return;

		// Switch to user if critera no longer fulfilled.
		if (!this.getActiveMode().criteria(this.user)) {
			this._setMode('user');
		}
		this.modes?.refresh();
	}

	_setMode(mode) {
		if (this.model.mode == mode) {
			return;
		}
		this.model.set({ mode });
		this.app.eventBus.emit(this, namespace + '.modeChange', { mode });
	}

	dispose() {
		this.user?.off('change', this._update);
		this.model = null;
		this.modes = null;
		this.user = null;
	}
}

export default Mode;
