import { Model } from 'modapp-resource';
import ConsoleComponent from './ConsoleComponent';
import ConsoleState from './ConsoleState';
import getCtrlId from 'utils/getCtrlId';
import './console.scss';

/**
 * Console draws player char menu.
 */
class Console {
	constructor(app, params) {
		this.app = app;

		this.mode = typeof params.mode == 'string'
			? params.mode.toLowerCase()
			: null;
		if (this.mode != 'touch' && this.mode != 'keyboard') {
			this.mode = 'auto';
		}

		// Bind callbacks
		this._onActiveChange = this._onActiveChange.bind(this);
		this._onMediaChange = this._onMediaChange.bind(this);

		this.app.require([
			'api',
			'player',
			'cmd',
			'charLog',
			'avatar',
			'media',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { state: null, mode: this._getMode() }, eventBus: this.app.eventBus });
		this.charStates = {};

		this._setListeners(true);
		this._onActiveChange({ char: this.module.player.getActiveChar() });
	}

	getModel() {
		return this.model;
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
		state.setDoc(doc);
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.module.player[cb]('activeChange', this._onActiveChange);
		if (this.mode == 'auto') {
			this.module.media.getModel()[cb]('change', this._onMediaChange);
		}
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

	_onMediaChange(ev) {
		this.model.set({ mode: this._getMode() });
	}

	_getMode() {
		return this.mode == 'auto'
			? this.module.media.getModel().pointerCoarse ? 'touch' : 'keyboard'
			: this.mode;
	}

	newConsole(layoutId) {
		return new ConsoleComponent(this.module, this.model, layoutId);
	}

	dispose() {
		this._setListeners(false);
	}
}

export default Console;
