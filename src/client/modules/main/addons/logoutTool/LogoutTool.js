import l10n from 'modapp-l10n';
import LogoutToolComponent from './LogoutToolComponent';
import './logoutTool.scss';

/**
 * LogoutTool adds the logout tool.
 */
class LogoutTool {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'playerTools',
			'player',
			'confirm',
			'login',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add logout tool
		this.module.playerTools.addTool({
			id: 'logout',
			sortOrder: 1000,
			name: l10n.l('playerPanel.logout', "Logout"),
			icon: 'sign-out',
			onClick: () => this.logout(),
		});

		// Add logout footer tool
		this.module.playerTools.addFooterTool({
			id: 'logout',
			sortOrder: 10,
			componentFactory: () => new LogoutToolComponent(this.module),
			className: 'flex-1',
		});
	}

	dispose() {
		this.module.playerTools.removeFooterTool('logout');
	}

	logout() {
		return (this.module.player.getControlled() || []).length
			? this.module.confirm.open(() => this.module.login.logout(), {
				title: l10n.l('playerPanel.confirmLogout', "Confirm logout"),
				body: [
					l10n.l('playerPanel.logoutBody1', "Some characters are still awake."),
					l10n.l('playerPanel.logoutBody2', "Do you still wish to logout?"),
				],
				confirm: l10n.l('playerPanel.logout', "Logout"),
			})
			: this.module.login.logout();
	}
}

export default LogoutTool;
