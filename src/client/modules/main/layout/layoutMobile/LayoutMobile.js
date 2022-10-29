import Fader from 'components/Fader';
import LayoutMobileComponent from './LayoutMobileComponent';
import './layoutMobile.scss';

/**
 * LayoutMobile draws the main layout wireframe for mobile.
 */
class LayoutMobile {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'layout',
			'playerTabs',
			'playerTools'
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.defaultMain = new Fader(null, { className: 'layoutmobile--main' });

		this.elem = new LayoutMobileComponent(this.module, this.defaultMain);

		this.module.layout.addLayout({
			id: 'mobile',
			sortOrder: 10,
			query: 'screen and (max-width: 720px)',
			component: this.elem,
		});
	}

	setMainComponent(component) {
		this.defaultMain.setComponent(component);
	}

	dispose() {
		this.module.layout.removeLayout('mobile');
	}
}

export default LayoutMobile;
