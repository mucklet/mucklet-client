import MobileRoomBadgeComponent from './MobileRoomBadgeComponent';
import './mobileRoomBadge.scss';

/**
 * MobileRoomBadge adds an area map overlay to the activePanel main area.
 */
class MobileRoomBadge {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'roomPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addOverlay({
			id: 'mobileRoomBadge',
			componentFactory: (char, state, layoutId) => new MobileRoomBadgeComponent(this.module, char, state),
			filter: (char, layoutId) => layoutId == 'mobile'
		});
	}

	dispose() {
		this.module.charLog.removeOverlay('mobileRoomBadge');
	}
}

export default MobileRoomBadge;
