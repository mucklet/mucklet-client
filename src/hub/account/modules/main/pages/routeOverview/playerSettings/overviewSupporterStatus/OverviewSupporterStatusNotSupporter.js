import { Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import OverviewSupporterStatusOffer from './OverviewSupporterStatusOffer';

const txtBecomeSupporter = l10n.l('overviewSupporterStatus.becomeSupporter1', "You are welcome to play here for free, but if you support Mucklet, you can unlock additional perks!");

class OverviewSupporterStatusNotSupporter {
	constructor(module, user, paymentUser, supporterOffers) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-notsupporter' }, [
			n.component(new Txt(txtBecomeSupporter, { className: 'overviewsupporterstatus--disclaimer' })),
			n.component(new CollectionList(
				this.supporterOffers,
				m => new OverviewSupporterStatusOffer(this.module, this.user, this.paymentUser, m),
				{
					className: 'overviewsupporterstatus--offers',
				},
			)),
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
