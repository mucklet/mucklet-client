import PlayerSettingsMainCharComponent from './PlayerSettingsMainCharComponent';

/**
 * PlayerSettingsMainChar adds a section to the PlayerSettings to show main character.
 */
class PlayerSettingsMainChar {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pagePlayerSettings.addTool({
			id: 'mainChar',
			type: 'section',
			sortOrder: 30,
			componentFactory: (user, player, state) => new PlayerSettingsMainCharComponent(this.module, user, player, state),
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('mainChar');
	}
}

export default PlayerSettingsMainChar;
