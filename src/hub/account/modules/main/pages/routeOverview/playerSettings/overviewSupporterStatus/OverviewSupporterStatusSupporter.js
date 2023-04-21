import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtThankYou = l10n.l('overviewSupporterStatus.thankYou', "Thank you for supporting Mucklet!");

class OverviewSupporterStatusSupporter {
	constructor(module, user, paymentUser) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-supporter' }, [
			n.component(new Txt(txtThankYou, { className: 'overviewsupporterstatus--disclaimer' })),
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

export default OverviewSupporterStatusSupporter;
