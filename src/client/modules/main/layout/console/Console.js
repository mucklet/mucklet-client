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

		// Bind callbacks
		this._onActiveChange = this._onActiveChange.bind(this);

		this.app.require([
			'api',
			'player',
			'cmd',
			'charLog',
			'avatar',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { state: null }, eventBus: this.app.eventBus });
		this.charStates = {};

		this._setListeners(true);
		this._onActiveChange({ char: this.module.player.getActiveChar() });
	}

	_setListeners(on) {
		this.module.player[on ? 'on' : 'off']('activeChange', this._onActiveChange);
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

	newConsole(layoutId) {
		return new ConsoleComponent(this.module, this.model, layoutId);
	}

	dispose() {
		this._setListeners(false);
	}
}

export default Console;
