// import { Elem, Txt } from 'modapp-base-component';
import { uri } from 'modapp-utils';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import ConfirmScreenDialog from 'components/ConfirmScreenDialog';
import Err from 'classes/Err';

const txtErrorAuthenticating = l10n.l('clientBoot.errorAuthenticating', "An error occurred when trying to authenticate:");
const txtTryAgain = l10n.l('clientBoot.tryAgain', "Try again");

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

		this._tryAuthenticate();
	}

	_tryAuthenticate() {
		let q = uri.getQuery();
		if (q.error) {
			let err;
			try {
				err = JSON.parse(atob(q.error));
			} catch (e) {
				err = new Err('clientBoot.failedToParse', "Failed to parse error: {message}", { message: e.message });
			}
			this._showError(null, err);
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
						err = new Err(err.code, "Failed to connect to the realm.");
					}
					this._showError(txtErrorAuthenticating, err);
				});
		}
	}

	_showError(infoTxt, err) {
		// Offline overrides any other error
		if (!navigator.onLine) {
			return this._showOffline();
		}

		this.module.screen.setComponent(new ErrorScreenDialog(err, {
			infoTxt,
			buttonTxt: txtTryAgain,
			onClose: () => {
				this.module.screen.setComponent(null);
				this._tryAuthenticate();
			},
		}));
	}

	_showOffline() {
		let cb = () => {
			window.addEventListener('online', cb);
			this.module.screen.setComponent(null);
			this._tryAuthenticate();
		};
		window.addEventListener('online', cb);
		this.module.screen.setComponent(new ConfirmScreenDialog({
			title: l10n.l('clientBoot.noInternet', "No Internet"),
			confirm: txtTryAgain,
			body: l10n.l('clientBoot.errorOffline1', "You seem to have no Internet connection, and we kind of need one."),
			onConfirm: cb,
		}));
	}
}

export default ClientBoot;
