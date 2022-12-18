import Fader from 'components/Fader';
import { Collection, sortOrderCompare } from 'modapp-resource';
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
			'playerTools',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.defaultMain = new Fader(null, { className: 'layoutmobile--main' });

		this.overlays = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

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

	/**
	 * Registers a layout overlay component.
	 * @param {object} overlay Overlay object
	 * @param {string} overlay.id Overlay ID.
	 * @param {number} overlay.sortOrder Sort order.
	 * @param {string} [overlay.type] Target type. May be 'topbar'. Defaults to 'topbar';
	 * @param {function} overlay.componentFactory Overlay component factory: function() -> Component
	 * @returns {this}
	 */
	addOverlay(overlay) {
		if (this.overlays.get(overlay.id)) {
			throw new Error("Overlay ID already registered: ", overlay.id);
		}
		this.overlays.add(overlay);
		return this;
	}

	/**
	 * Unregisters a previously registered layout overlay.
	 * @param {string} overlayId Overlay ID.
	 * @returns {this}
	 */
	removeOverlay(overlayId) {
		this.overlays.remove(overlayId);
		return this;
	}

	/**
	 * Gets a collection of layout overlays.
	 * @returns {Collection} Collection of registered layout overlays.
	 */
	getOverlays() {
		return this.overlays;
	}

	dispose() {
		this.module.layout.removeLayout('mobile');
	}
}

export default LayoutMobile;
