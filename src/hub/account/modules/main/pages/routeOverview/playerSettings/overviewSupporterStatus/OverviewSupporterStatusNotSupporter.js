import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtBecomeSupporter = l10n.l('overviewSupporterStatus.becomeSupporter1', "You are welcome to play here for free, but if you support Mucklet, you can unlock additional perks!");

class OverviewSupporterStatusNotSupporter {
	constructor(module, user, paymentUser) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-notsupporter' }, [
			n.component(new Txt(txtBecomeSupporter, { className: 'overviewsupporterstatus--disclaimer' })),
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

export default OverviewSupporterStatusNotSupporter;
