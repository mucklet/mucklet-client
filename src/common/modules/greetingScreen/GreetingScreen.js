import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
import GreetingScreenComponent from './GreetingScreenComponent';

/**
 * GreetingScreen shows a greeting screen.
 */
class GreetingScreen {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this._showGreeting();
	}

	_showGreeting() {
		return fetch('greeting/greeting.html')
			.then(response => {
				if (!response.ok) {
					throw new Err('greetingScreen.responseError', "{status} - {statusText}", { statusText: response.statusText, status: response.status });
				}
				return response.text();
			})
			.then(html => {
				this.module.screen.setComponent(new GreetingScreenComponent(this.module, html));
			})
			.catch(err => {
				console.error(err);
				// Fallback dialog
				this.module.screen.setComponent(new ConfirmScreenDialog({
					title: l10n.l('greetingScreen.welcome', "Welcome to {realmName}", { realmName: app.props.realmName }),
					confirm: l10n.l('greetingScreen.gotToLogin', "Go to login"),
					body: l10n.l('greetingScreen.welcomeBody', "You are currently not logged in."),
					onConfirm: () => this.module.auth.redirectToLogin(true),
				}));
			});
	}
}

export default GreetingScreen;
