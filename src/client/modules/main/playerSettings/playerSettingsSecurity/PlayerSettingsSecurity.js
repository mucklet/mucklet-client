import PlayerSettingsSecurityComponent from './PlayerSettingsSecurityComponent';

/**
 * PlayerSettingsSecurity adds a section to the PlayerSettings to change
 * password.
 */
class PlayerSettingsSecurity {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'dialogChangePassword',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pagePlayerSettings.addTool({
			id: 'security',
			type: 'section',
			sortOrder: 20,
			componentFactory: (user, player, state) => user.identity && !this.module.api.isError(user.identity)
				? new PlayerSettingsSecurityComponent(this.module, user.identity)
				: null,
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('security');
	}
}

export default PlayerSettingsSecurity;
