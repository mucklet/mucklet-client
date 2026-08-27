import FAIcon from 'components/FAIcon';
import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class OverviewAccountDeletionComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
		this.state = state;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'common--sectionpadding' }, [
			n.elem('button', {
				className: 'btn tiny warning icon-left overviewaccountdeletion--button',
				events: { click: () => this.module.dialogDeleteAccount.open(this.user) },
			}, [
				n.component(new FAIcon('trash')),
				n.component(new Txt(l10n.l('overviewAccountDeletion.delete', "Delete account"))),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewAccountDeletionComponent;
