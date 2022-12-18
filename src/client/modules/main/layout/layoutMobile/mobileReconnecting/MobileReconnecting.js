import { RootElem } from 'modapp-base-component';
import './mobileReconnecting.scss';

/**
 * MobileReconnecting adds an spinner overlay to mobile layout's topbar, showing
 * it whenever the API is disconnected.
 */
class MobileReconnecting {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onApiEvent = this._onApiEvent.bind(this);

		this.app.require([
			'api',
			'layoutMobile',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.component = new RootElem('div', { className: 'mobilereconnecting spinner small hide' });
		this.module.api.on(null, this._onApiEvent);

		this.module.layoutMobile.addOverlay({
			id: 'reconnecting',
			sortOrder: 0,
			type: 'topbar',
			componentFactory: () => this.component,
		});
	}

	_onApiEvent() {
		this.component[this.module.api.connected ? 'addClass' : 'removeClass']('hide');
	}

	dispose() {
		this.module.api.off(null, this._onApiEvent);
		this.module.layoutMobile.removeOverlay('reconnecting');
	}
}

export default MobileReconnecting;
