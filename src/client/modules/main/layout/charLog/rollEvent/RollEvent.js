import RollEventComponent from './RollEventComponent';
import './rollEvent.scss';

/**
 * RollEvent adds charlog event component for roll events.
 */
class RollEvent {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.charLog
			.addEventComponentFactory('roll', (charId, ev, opt) => new RollEventComponent(charId, ev, opt));
	}

	dispose() {
		this.module.charLog
			.removeEventComponentFactory('roll');
	}
}

export default RollEvent;
