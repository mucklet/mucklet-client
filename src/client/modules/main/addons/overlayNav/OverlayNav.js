import OverlayNavComponent from './OverlayNavComponent';
import './overlayNav.scss';

/**
 * OverlayNav adds an map and navigation overlay to the activePanel main area.
 */
class OverlayNav {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'pageArea',
			'roomPages',
			'pageRoom',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addOverlay({
			id: 'nav',
			componentFactory: (char, state, layoutId) => new OverlayNavComponent(this.module, char, state),
			filter: (char, layoutId) => layoutId == 'desktop',
		});
	}

	dispose() {
		this.module.charLog.removeOverlay('overlayNav');
	}
}

export default OverlayNav;
