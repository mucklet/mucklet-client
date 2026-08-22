import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ScreenDialog from 'components/ScreenDialog';
import formatDateTime from 'utils/formatDateTime';

/**
 * LoginAccountDeletionScheduled confirms that an account is now unavailable
 * and explains how it can be restored during the grace period.
 */
class LoginAccountDeletionScheduled {
	constructor(module, deleteAt) {
		this.module = module;
		this.deleteAt = deleteAt;
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-accountdeletion' }, [
			n.component(new Txt(this.deleteAt
				? l10n.l('login.accountDeletionScheduledBody', "Your account is scheduled for permanent identity-data deletion on {date}.", { date: formatDateTime(new Date(Number(this.deleteAt)), { showYear: true }) })
				: l10n.l('login.accountDeletionScheduledBodyFallback', "Your account is scheduled for permanent identity-data deletion after the recovery period."), { tagName: 'p' })),
			n.component(new Txt(l10n.l('login.accountDeletionRestoreInfo', "Sign in before that deadline to choose whether to restore the account."), { tagName: 'p', className: 'pad-top-m' })),
			n.elem('button', {
				className: 'btn large primary login-accountdeletion--button pad-top-xl',
				events: { click: () => this.module.self.showLogin() },
			}, [
				n.component(new Txt(l10n.l('login.returnToLogin', "Return to sign in"))),
			]),
		])), {
			title: l10n.l('login.accountDeletionScheduled', "Account deletion scheduled"),
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default LoginAccountDeletionScheduled;
