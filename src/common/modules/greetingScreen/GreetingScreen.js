import l10n from 'modapp-l10n';
// import Err from 'classes/Err';
import { relistenResource } from 'utils/listenResource';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
// import GreetingScreenComponent from './GreetingScreenComponent';
import GreetingScreenRealm from './GreetingScreenRealm';
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
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
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
		this.loaded = {};
		try {
			let info = await this.module.api.get('core.info').then(info => this._tryListen('info', info));
			let realmId = info.realmId || '';
			let [ realm, population ] = await Promise.all([
				realmId
					? await this.module.api.get(`control.realm.${realmId}`).then(tags => this._tryListen('tags', tags))
					: null,
				this.module.api.get('core.population').then(population => this._tryListen('population', population)),
			]);
			this.module.screen.setComponent(new GreetingScreenRealm(this.module, info, realm, population));
		} catch (err) {
			this._unlistenAll();
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

	_tryListen(key, m) {
		if (this.loaded) {
			this.loaded[key] = relistenResource(this.loaded[key], m);
		}
		return m;
	}

	_unlistenAll() {
		if (this.loaded) {
			for (let k in this.loaded) {
				this._tryListen(k, null);
			}
			this.loaded = null;
		}
	}

	dispose() {
		this._unlistenAll();
		this.loaded = null;
	}
}

export default GreetingScreen;
