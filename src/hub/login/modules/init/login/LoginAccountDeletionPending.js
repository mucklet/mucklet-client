import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import ScreenDialog from 'components/ScreenDialog';
import formatDateTime from 'utils/formatDateTime';
import errToL10n from 'utils/errToL10n';

/**
 * LoginAccountDeletionPending offers an explicit restoration choice after a
 * pending account has authenticated successfully.
 */
class LoginAccountDeletionPending {
	constructor(module, deleteAt) {
		this.module = module;
		this.deleteAt = deleteAt;
	}

	render(el) {
		const message = new Collapser();
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-accountdeletion' }, [
			n.component(new Txt(l10n.l('login.accountDeletionPendingBody1', "This account is deleted and all identifying data will be wiped on:"), { tagName: 'p' })),
			n.component(new Txt(formatDateTime(new Date(Number(this.deleteAt)), { showYear: true }), { tagName: 'p', className: 'screendialog--strong' })),
			n.component(new Txt(l10n.l('login.accountDeletionPendingBody2', "Do you wish to restore the account?"), { tagName: 'p' })),
			n.component(message),
			n.elem('button', {
				className: 'btn large primary login-accountdeletion--button',
				events: { click: () => this._restore(message) },
			}, [
				n.component(new Txt(l10n.l('login.restoreAccount', "Restore account"))),
			]),
			n.elem('button', {
				className: 'btn large secondary login-accountdeletion--button',
				events: { click: () => this._keepDeleted(message) },
			}, [
				n.component(new Txt(l10n.l('login.keepAccountDeleted', "Keep account deleted"))),
			]),
		])), {
			title: l10n.l('login.accountDeleted', "Account deleted"),
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_restore(message) {
		if (this.promise) return;
		this.promise = this.module.self.restorePendingAccount()
			.catch(err => this._setMessage(message, errToL10n(err)))
			.then(() => { this.promise = null; });
	}

	_keepDeleted(message) {
		if (this.promise) return;
		this.promise = this.module.self.keepPendingAccountDeleted()
			.catch(err => this._setMessage(message, errToL10n(err)))
			.then(() => { this.promise = null; });
	}

	_setMessage(message, msg) {
		message.setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}
}

export default LoginAccountDeletionPending;
