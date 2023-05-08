import { CollectionList } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import OverviewSupporterStatusOffer from './OverviewSupporterStatusOffer';


class OverviewSupporterStatusNotSupporter {
	constructor(module, user, paymentUser, supporterOffers, state, opt) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
		this.state = state;
		this.opt = opt;
	}

	render(el) {
		this.model = new Model({ data: { offerId: this.state.offerId || null }, eventBus: this.module.self.app.eventBus });
		this.elem = new CollectionList(
			this.supporterOffers,
			m => new OverviewSupporterStatusOffer(this.module, this.user, this.paymentUser, m, this.model),
			this.opt,
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, { offerId: this.model.offerId });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewSupporterStatusNotSupporter;
