import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import ScreenDialog from 'components/ScreenDialog';
import formatDateTime from 'utils/formatDateTime';

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
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-accountdeletion' }, [
			n.component(new Txt(l10n.l('login.accountDeletionPendingBody', "This account is scheduled for deletion{date}. Choose whether to restore it or keep it deleted.", {
				date: this.deleteAt ? " on " + formatDateTime(new Date(Number(this.deleteAt)), { showYear: true }) : "",
			}), { tagName: 'p' })),
			n.component('message', new Collapser(null)),
			n.elem('button', {
				className: 'btn large primary login-accountdeletion--button',
				events: { click: () => this._restore() },
			}, [
				n.component(new Txt(l10n.l('login.restoreAccount', "Restore account"))),
			]),
			n.elem('button', {
				className: 'btn large secondary login-accountdeletion--button',
				events: { click: () => this._keepDeleted() },
			}, [
				n.component(new Txt(l10n.l('login.keepAccountDeleted', "Keep account deleted"))),
			]),
		])), {
			title: l10n.l('login.accountDeletionPending', "Account deletion pending"),
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_restore() {
		if (this.promise) return;
		this.promise = this.module.self.restorePendingAccount()
			.catch(err => this._setMessage(l10n.l(err.code, err.message, err.data)))
			.then(() => { this.promise = null; });
	}

	_keepDeleted() {
		if (this.promise) return;
		this.promise = this.module.self.keepPendingAccountDeleted()
			.catch(err => this._setMessage(l10n.l(err.code, err.message, err.data)))
			.then(() => { this.promise = null; });
	}

	_setMessage(msg) {
		this.elem?.getComponent().getNode('message').setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}
}

export default LoginAccountDeletionPending;
