/**
 * MobileActivePanelSetter adds the Console and CharLog components to the active panel.
 */
class MobileActivePanelSetter {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'mobileActivePanel',
			'charLog',
			'console',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.mobileActivePanel.setNode('logPanel', this.module.charLog.getComponent());
		this.module.mobileActivePanel.setNode('consolePanel', this.module.console.newConsole('mobile'));
	}

	dispose() {
		this.module.mobileActivePanel.setNode('consolePanel', null);
		this.module.mobileActivePanel.setNode('logPanel', null);
	}
}

export default MobileActivePanelSetter;
