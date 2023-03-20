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
			state = this.charStates[ctrlId];
			if (!state) {
				state = new ConsoleState(this.module, ctrlId);
				this.charStates[ctrlId] = state;
			}
		}
		this.model.set({ state });
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
