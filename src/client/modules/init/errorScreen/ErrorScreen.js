import { uri } from 'modapp-utils';
import l10n from 'modapp-l10n';
import ErrorScreenDialog from 'components/ErrorScreenDialog';

/**
 * ErrorScreen shows connection and authentication error messages.
 */
class ErrorScreen {

	constructor(app, params) {
		this.app = app;

		this.app.require([ 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		let q = uri.getQuery();
		if (q.error) {
			let err;
			try {
				err = JSON.parse(atob(q.error));
			} catch (e) {
				err = { code: 'errorScreen.failedToParse', message: "Failed to parse error: {message}", data: { message: e.message }};
			}
			this._showError(err);
		} else {
			this.module.login.authenticate().catch(err => {
				if (err.code == 'system.connectionError') {
					err = { code: err.code, message: "Failed to connect to the realm." };
				}
				this._showError(err);
			});
		}
	}

	_showError(err) {
		this.app.setComponent(new ErrorScreenDialog(err, {
			infoTxt: l10n.l('errorScreen.errorAuthenticating', "An error occurred when trying to authenticate:"),
			buttonTxt: l10n.l('errorScreen.backToLogin', "Back to login"),
		}));
	}
}

export default ErrorScreen;
