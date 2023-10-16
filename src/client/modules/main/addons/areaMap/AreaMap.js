import AreaMapComponent from './AreaMapComponent';
import './areaMap.scss';

/**
 * AreaMap adds an area map overlay to the activePanel main area.
 */
class AreaMap {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'pageArea',
			'roomPages',
			'pageRoom',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addOverlay({
			id: 'areaMap',
			componentFactory: (char, state, layoutId) => new AreaMapComponent(this.module, char, state),
			filter: (char, layoutId) => layoutId == 'desktop',
		});
	}

	dispose() {
		this.module.charLog.removeOverlay('areaMap');
	}
}

export default AreaMap;
