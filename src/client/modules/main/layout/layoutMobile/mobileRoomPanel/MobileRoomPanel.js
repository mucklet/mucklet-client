import MobileRoomPanelComponent from './MobileRoomPanelComponent';
import './mobileRoomPanel.scss';


/**
 * MobileRoomPanel draws player char menu.
 */
class MobileRoomPanel {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onActivePanelModelChange = this._onActivePanelModelChange.bind(this);

		this.app.require([
			'mobileActivePanel',
			'roomPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.activePanelModel = this.module.mobileActivePanel.getModel();
		this.component = new MobileRoomPanelComponent(this.module, {
			open: this.activePanelModel.roomPanelOpen,
		});

		this.module.mobileActivePanel.setNode('roomPanel', this.component);
		this._setListeners(true);
	}

	/**
	 * Toggles the panel between open or close.
	 * @param {bool} open State to toggle to. Defaults to toggle between open and close.
	 * @returns {this}
	 */
	toggle(open) {
		this.module.mobileActivePanel.toggleRoomPanel(open);
		return this;
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.activePanelModel[cb]('change', this._onActivePanelModelChange);
	}


	_onActivePanelModelChange() {
		this.component.toggle(this.activePanelModel.roomPanelOpen);
	}

	dispose() {
		this._setListeners(false);
		this.module.mobileActivePanel.setNode('roomPanel', null);
	}
}

export default MobileRoomPanel;
