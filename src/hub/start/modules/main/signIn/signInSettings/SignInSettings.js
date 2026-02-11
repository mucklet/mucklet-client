import l10n from 'modapp-l10n';

/**
 * SignIn fetches a list of realms to show on the start page.
 */
class SignIn {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'signIn',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.signIn.addMenuItem({
			id: 'settings',
			name: l10n.l('signInSettings.settings', "Settings"),
			icon: 'cog',
			href: '/account',
			sortOrder: 10,
		});
	}

	dispose() {
		this.module.signIn.removeMenuItem('settings');
	}
}

export default SignIn;
