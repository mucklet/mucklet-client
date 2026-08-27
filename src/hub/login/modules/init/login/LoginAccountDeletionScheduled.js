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
			n.component(new Txt(
				this.deleteAt
					? l10n.l('login.accountDeletionScheduledBody', "All identifying account data will be wiped on:")
					: l10n.l('login.accountDeletionScheduledBodyFallback', "All identifying account data will be wiped after the recovery grace period."),
				{ tagName: 'p' },
			)),
			n.component(this.deleteAt
				? new Txt(formatDateTime(new Date(Number(this.deleteAt)), { showYear: true }), {
					tagName: 'p',
					className: 'screendialog--strong',
				})
				: null,
			),
			n.component(new Txt(l10n.l('login.accountDeletionRestoreInfo', "Sign in before that deadline to choose whether to restore the account."), { tagName: 'p', className: 'pad-top-m' })),
			n.elem('button', {
				className: 'btn large primary login-accountdeletion--button pad-top-xl',
				events: {
					click: () => this.module.self.redirectToRoot(),
				},
			}, [
				n.component(new Txt(l10n.l('login.goToMucklet', "Go to Mucklet"))),
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
}

export default LoginAccountDeletionScheduled;
