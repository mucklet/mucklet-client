import { Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import OverviewSupporterStatusOffer from './OverviewSupporterStatusOffer';

const txtBecomeSupporter = l10n.l('overviewSupporterStatus.becomeSupporter1', "You are welcome to play here for free, but if you support Mucklet, you can unlock additional perks!");

class OverviewSupporterStatusNotSupporter {
	constructor(module, user, paymentUser, supporterOffers, state) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
		this.state = state;
	}

	render(el) {
		this.model = new Model({ data: { offerId: null }, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-notsupporter' }, [
			n.component(new Txt(txtBecomeSupporter, { className: 'overviewsupporterstatus--disclaimer' })),
			n.component(new CollectionList(
				this.supporterOffers,
				m => new OverviewSupporterStatusOffer(this.module, this.user, this.paymentUser, m, this.model),
				{
					className: 'overviewsupporterstatus--offers',
				},
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			let m = this.model;
			Object.assign(this.state, { offerId: m.offerId });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewSupporterStatusNotSupporter;
