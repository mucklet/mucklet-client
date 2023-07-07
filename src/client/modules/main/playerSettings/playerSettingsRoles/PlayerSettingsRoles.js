import PlayerSettingsRolesComponent from './PlayerSettingsRolesComponent';

/**
 * PlayerSettingsRoles adds a section to the PlayerSettings to see player
 * roles.
 */
class PlayerSettingsRoles {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pagePlayerSettings.addTool({
			id: 'roles',
			type: 'section',
			sortOrder: 40,
			componentFactory: (user, player, state) => new PlayerSettingsRolesComponent(this.module),
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('roles');
	}
}

export default PlayerSettingsRoles;
