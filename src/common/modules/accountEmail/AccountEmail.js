import AccountEmailButton from './AccountEmailButton';
import './accountEmail.scss';

/**
 * AccountEmail provides components for displaying and updating account email.
 */
class AccountEmail {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'dialogChangeEmail',
			'verifyEmail',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Creates a new instance of an email select button component.
	 * @param {Model} account Account account model.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.fullWidth] Flag to make buttons full width. Defaults to false.
	 * @returns {Component} Account email button component.
	 */
	newEmailButton(account, opt) {
		return new AccountEmailButton(this.module, account, opt);
	}


	dispose() {}
}

export default AccountEmail;
