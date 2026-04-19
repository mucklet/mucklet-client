import l10n from 'modapp-l10n';
// import Err from 'classes/Err';
// import { relistenResource } from 'utils/listenResource';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
// import GreetingScreenComponent from './GreetingScreenComponent';
// import GreetingScreenRealm from './GreetingScreenRealm';
import './greetingScreen.scss';

/**
 * GreetingScreen shows a greeting screen.
 */
class GreetingScreen {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
			'auth',
			'api',
			'realmInfo',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.disposed = false;
		this._showRealm();
	}

	// _showGreeting() {
	// 	return fetch('/greeting/greeting.html')
	// 		.then(response => {
	// 			if (!response.ok) {
	// 				throw new Err('greetingScreen.responseError', "{status} - {statusText}", { statusText: response.statusText, status: response.status });
	// 			}
	// 			return response.text();
	// 		})
	// 		.then(html => {
	// 			this.module.screen.setComponent(new GreetingScreenComponent(this.module, html));
	// 		})
	// 		.catch(err => {
	// 			console.error(err);
	// 			// Fallback dialog
	// 			this.module.screen.setComponent(new ConfirmScreenDialog({
	// 				title: l10n.l('greetingScreen.welcome', "Welcome to {realmName}", { realmName: app.props.realm.name }),
	// 				confirm: l10n.l('greetingScreen.gotToLogin', "Go to login"),
	// 				body: l10n.l('greetingScreen.welcomeBody', "You are currently not logged in."),
	// 				onConfirm: () => this.module.auth.redirectToLogin(true),
	// 			}));
	// 		});
	// }

	async _showRealm() {
		try {
			const resources = await this.module.realmInfo.getResources();
			if (this.disposed) {
				this.module.realmInfo.releaseResources();
				return;
			}
			this.resources = resources;
			this.module.screen.setComponent(this.module.realmInfo.newRealmInfo(this.resources));
		} catch (err) {
			if (this.resources) {
				this.module.realmInfo.releaseResources();
			}
			console.error(err);
			// Fallback dialog
			this.module.screen.setComponent(new ConfirmScreenDialog({
				title: l10n.l('greetingScreen.welcome', "Welcome to {realmName}", { realmName: app.props.realm.name }),
				confirm: l10n.l('greetingScreen.gotToLogin', "Go to login"),
				body: l10n.l('greetingScreen.welcomeBody', "You are currently not logged in."),
				onConfirm: () => this.module.auth.redirectToLogin(true),
			}));
		}
	}

	dispose() {
		if (this.resources) {
			this.module.realmInfo.releaseResources();
			this.resources = null;
		}
		this.disposed = true;
	}
}

export default GreetingScreen;
