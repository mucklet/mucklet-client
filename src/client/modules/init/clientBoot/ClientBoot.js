import { uri } from 'modapp-utils';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import Err from 'classes/Err';

/**
 * ClientBoot boots the app by trying to authenticate, and then showing the
 * appropriate screen depending on success.
 */
class ClientBoot {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'auth',
			'screen',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { connected: false, authenticated: false, error: false }, eventBus: this.app.eventBus });

		// Load module bundles
		this.mainModulesPromise = import(/* webpackChunkName: "main" */ 'modules/main-modules');
		this.greetingModulesPromise = import(/* webpackChunkName: "greeting" */ 'modules/greeting-modules');

		let q = uri.getQuery();
		if (q.error) {
			let err;
			try {
				err = JSON.parse(atob(q.error));
			} catch (e) {
				err = new Err('errorScreen.failedToParse', "Failed to parse error: {message}", { message: e.message });
			}
			this._showError(err);
		} else {
			this.module.auth.authenticate(true)
				.then(user => {
					this.model.set({ connected: true, authenticated: !!user });
					if (user) {
						this.mainModulesPromise.then(({ default: mainModules }) => {
							app.loadBundle(mainModules).then(result => {
								console.log("[ClientBoot] Main modules: ", result);
							});
						});
					} else {
						this.greetingModulesPromise.then(({ default: greetingModules }) => {
							app.loadBundle(greetingModules).then(result => {
								console.log("[ClientBoot] Greeting modules: ", result);
							});
						});
					}
				})
				.catch(err => {
					this.model.set({ error: true });
					if (err.code == 'system.connectionError') {
						err = { code: err.code, message: "Failed to connect to the realm." };
					}
					this._showError(err);
				});
		}
	}

	_showError(err) {
		this.module.screen.setComponent(new ErrorScreenDialog(err, {
			infoTxt: l10n.l('errorScreen.errorAuthenticating', "An error occurred when trying to authenticate:"),
			buttonTxt: l10n.l('errorScreen.backToLogin', "Back to login"),
		}));
	}
}

export default ClientBoot;
