import ControlEventComponent from './ControlEventComponent';
import ReleaseEventComponent from './ReleaseEventComponent';
import './controlEvent.scss';

/**
 * ControlEvent adds charlog events components for control and release events.
 */
class ControlEvent {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'charLog', 'dialogExportLog', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.charLog
			.addEventComponentFactory('control', (charId, ev, opt) => new ControlEventComponent(this.module, charId, ev, opt))
			.addEventComponentFactory('release', (charId, ev) => new ReleaseEventComponent(charId, ev));
	}

	dispose() {
		this.module.charLog
			.removeEventComponentFactory('control')
			.removeEventComponentFactory('release');
	}
}

export default ControlEvent;
