import NotifySettingsComponent from './NotifySettingsComponent';

/**
 * NotifySettings adds a settings tool for Notify to PagePlayerSettings.
 */
class NotifySettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'notify',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pagePlayerSettings.addTool({
			id: 'notify',
			sortOrder: 10,
			componentFactory: (user, player, state) => new NotifySettingsComponent(this.module),
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('notify');
	}
}

export default NotifySettings;
