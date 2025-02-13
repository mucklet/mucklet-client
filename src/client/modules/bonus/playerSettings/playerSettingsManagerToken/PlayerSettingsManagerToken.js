import PlayerSettingsManagerTokenComponent from './PlayerSettingsManagerTokenComponent';
import './playerSettingsManagerToken.scss';

/**
 * PlayerSettingsManagerToken adds a tool to PagePlayerSettings to create
 * manager tokens.
 */
class PlayerSettingsManagerToken {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
			'api',
			'pagePlayerSettings',
			'toaster',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pagePlayerSettings.addTool({
			id: 'managerToken',
			type: 'section',
			sortOrder: 25,
			componentFactory: (user, player, state) => new PlayerSettingsManagerTokenComponent(this.module, user, state),
		});
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('managerToken');
	}
}

export default PlayerSettingsManagerToken;
