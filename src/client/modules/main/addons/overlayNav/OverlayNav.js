import OverlayNavComponent from './OverlayNavComponent';
import { adjust } from 'utils/color';
import './overlayNav.scss';

const themeTokens = {
	'overlaynav.badge.background.hover': (getToken) => adjust(getToken('color.base.400'), 3),
};

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
			'theme',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.theme.addTokens(themeTokens);

		this.module.charLog.addOverlay({
			id: 'nav',
			componentFactory: (char, state, layoutId) => new OverlayNavComponent(this.module, char, state),
			filter: (char, layoutId) => layoutId == 'desktop',
		});
		this.module.charLog.addOverlay({
			id: 'mobileNav',
			componentFactory: (char, state, layoutId) => new OverlayNavComponent(this.module, char, state, { mode: 'mobile' }),
			filter: (char, layoutId) => layoutId == 'mobile',
		});
	}

	dispose() {
		this.module.charLog.removeOverlay('overlayNav');
		this.module.theme.removeTokens(themeTokens);
	}
}

export default OverlayNav;
