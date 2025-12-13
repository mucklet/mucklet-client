import { Model } from 'modapp-resource';
import ConsoleComponent from './ConsoleComponent';
import ConsoleState from './ConsoleState';
import getCtrlId from 'utils/getCtrlId';
import mobile from 'is-mobile';
import './console.scss';
import listenResource from 'utils/listenResource';

const namespace = 'module.console';

/**
 * Console draws player char menu.
 */
class Console {
	constructor(app, params) {
		this.app = app;

		this.paramsMode = false;
		this.mode = typeof params.mode == 'string'
			? params.mode.toLowerCase()
			: null;
		this.paramsMode = [ 'auto', 'touch', 'keyboard' ].includes(this.mode);
		if (!this.paramsMode) {
			this.mode = 'auto';
		}

		// Bind callbacks
		this._onActiveChange = this._onActiveChange.bind(this);
		this._updateMode = this._updateMode.bind(this);

		this.app.require([
			'api',
			'player',
			'cmd',
			'charLog',
			'avatar',
			'media',
			'consoleModeSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { state: null, mode: this._getMode() }, eventBus: this.app.eventBus });
		this.keymapModel = new Model({ eventBus: this.app.eventBus });
		this.charStates = {};

		this._setListeners(true);
		this._onActiveChange({ char: this.module.player.getActiveChar() });

		this.module.consoleModeSettings.getSettingsPromise().then(settings => {
			// Set mode to the parameter mode if one was specified
			if (this.paramsMode) {
				settings.set({ consoleMode: this.mode });
			}
			this.settings = listenResource(settings, true, this._updateMode);
			this._updateMode();
		});
	}

	getModel() {
		return this.model;
	}

	getKeymapModel() {
		return this.keymapModel;
	}

	/**
	 * Attach an event handler function for one or more player module events.
	 * @param {?string} events One or more space-separated events. Null means any event. Available events are 'focus'.
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

	/**
	 * Sets the current command text for a controlled character.
	 * @param {string} ctrlId Controlled character ID.
	 * @param {string} doc Console doc text.
	 * @param {boolean} [storeHistory] Flag to store history before setting. Defaults to false.
	 */
	setCommand(ctrlId, doc, storeHistory) {
		let state = this._getCharState(ctrlId);
		if (storeHistory) {
			state.storeHistory();
		}
		state.setDoc(doc, doc.length);
	}

	/**
	 * Adds a keymap callback to the console.
	 * @param {string} key Key to mapped, as defined by CodeMirror6.
	 * @param {KeyBinding} binding Key binding, as defined by CodeMirror 6. It
	 * differs in the run-Command getting the ConsoleState as the first
	 * argument, and that the key is overwritten by the key.
	 */
	addKeymap(key, binding) {
		this.keymapModel.set({ [key]: binding });
	}

	/**
	 * Removes a keymap callback.
	 * @param {string} key Key to mapped, as defined by CodeMirror6.
	 */
	removeKeymap(key) {
		this.keymapModel.set({ [key]: undefined });
	}

	/**
	 * Sets focus to any console that may be rendered.
	 */
	focus() {
		this.app.eventBus.emit(this, namespace + '.focus');
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.module.player[cb]('activeChange', this._onActiveChange);
		this.module.media.getModel()[cb]('change', this._updateMode);
	}

	_onActiveChange(ev) {
		let char = ev?.char;
		let state = null;
		if (char) {
			let ctrlId = getCtrlId(char);
			state = this._getCharState(ctrlId);
			state = this.charStates[ctrlId];
			if (!state) {
				state = new ConsoleState(this.module, ctrlId);
				this.charStates[ctrlId] = state;
			}
		}
		this.model.set({ state });
	}

	_getCharState(ctrlId) {
		let state = this.charStates[ctrlId];
		if (!state) {
			state = new ConsoleState(this.module, ctrlId);
			this.charStates[ctrlId] = state;
		}
		return state;
	}

	_updateMode(ev) {
		this.model.set({ mode: this._getMode() });
	}

	_getMode() {
		let mode = this.settings?.consoleMode || this.mode;
		return mode == 'auto'
			? mobile({ tablet: true })
				? 'touch'
				: 'keyboard'
			: mode;
	}

	newConsole(layoutId) {
		return new ConsoleComponent(this.module, this.model, layoutId);
	}

	dispose() {
		this._setListeners(false);
		listenResource(this.settings, false, this._updateMode);
	}
}

export default Console;
