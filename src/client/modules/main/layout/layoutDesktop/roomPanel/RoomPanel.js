
import RoomPanelComponent from './RoomPanelComponent';
import './roomPanel.scss';

/**
 * RoomPanel draws player room panel.
 */
class RoomPanel {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onRoomPanelOpen = this._onRoomPanelOpen.bind(this);

		this.app.require([
			'activePanel',
			'roomPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.component = new RoomPanelComponent(this.module);

		this.module.activePanel.setNode('roomPanel', this.component);
		this._setListeners(true);
	}

	/**
	 * Toggles the panel between open or close.
	 * @param {bool} open State to toggle to. Defaults to toggle between open and close.
	 * @returns {this}
	 */
	toggle(open) {
		this.component.toggle(open);
		return this;
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.module.roomPages[cb]('open', this._onRoomPanelOpen);
	}

	_onRoomPanelOpen() {
		this.toggle(true);
	}

	dispose() {
		this._setListeners(false);
		this.module.activePanel.setNode('roomPanel', null);
	}
}

export default RoomPanel;
