/**
 * ActivePanelSetter adds the Console and CharLog components to the active panel.
 */
class ActivePanelSetter {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'activePanel',
			'charLog',
			'console',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.activePanel.setNode('logPanel', this.module.charLog.getComponent());
		this.module.activePanel.setNode('consolePanel', this.module.console.newConsole('desktop'));
	}

	dispose() {
		this.module.activePanel.setNode('consolePanel', null);
		this.module.activePanel.setNode('logPanel', null);
	}
}

export default ActivePanelSetter;
