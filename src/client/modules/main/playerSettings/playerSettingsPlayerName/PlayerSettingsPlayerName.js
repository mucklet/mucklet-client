import PlayerSettingsPlayerNameComponent from './PlayerSettingsPlayerNameComponent';
import './playerSettingsPlayerName.scss';

/**
 * PlayerSettingsPlayerName adds a topsection to the PlayerSettings to show
 * player name.
 */
class PlayerSettingsPlayerName {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'pagePlayerSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add playerName
		this.module.pagePlayerSettings.addTool({
			id: 'playerName',
			type: 'topSection',
			sortOrder: 20,
			componentFactory: (user, player, state) => user.identity && !this.module.api.isError(user.identity)
				? new PlayerSettingsPlayerNameComponent(this.module, user.identity, player, state)
				: null,
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('playerName');
	}
}

export default PlayerSettingsPlayerName;
