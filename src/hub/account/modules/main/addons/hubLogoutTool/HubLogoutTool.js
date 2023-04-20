import l10n from 'modapp-l10n';
import HubLogoutToolComponent from './HubLogoutToolComponent';
import './hubLogoutTool.scss';

/**
 * HubLogoutTool adds the logout tool.
 */
class HubLogoutTool {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'playerTools',
			'auth',
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
			type: 'footer',
			onClick: () => this.logout(),
		});

		// Add logout footer tool
		this.module.playerTools.addFooterTool({
			id: 'logout',
			sortOrder: 10,
			componentFactory: () => new HubLogoutToolComponent(this.module),
			className: 'flex-1',
		});
	}

	dispose() {
		this.module.playerTools.removeFooterTool('logout');
	}

	logout() {
		return this.module.auth.logout();
	}
}

export default HubLogoutTool;
