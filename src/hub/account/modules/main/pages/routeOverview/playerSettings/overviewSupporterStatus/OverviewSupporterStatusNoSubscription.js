import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import formatDate from 'utils/formatDate';
import OverviewSupporterStatusOffers from './OverviewSupporterStatusOffers';

class OverviewSupporterStatusNoSubscription {
	constructor(module, user, paymentUser, supporterOffers, state) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
		this.state = state;
	}

	render(el) {
		this.model = new Model({ data: { offerId: this.state.offerId || null }, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-nosubscription' }, [
			n.component(new Txt(l10n.l('overviewSupporterStatus.supporterUntil', "Supporter until"), { tagName: 'h4', className: 'pad-top-l pad-bottom-s' })),
			n.component(new ModelTxt(this.paymentUser, m => formatDate(new Date(m.supporterUntil), { showYear: true }), { className: 'overviewsupporterstatus-nosubscription--until' })),
			n.component(new OverviewSupporterStatusOffers(this.module, this.user, this.paymentUser, this.supporterOffers, this.state, {
				className: 'pad-top-m',
			})),
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

export default OverviewSupporterStatusNoSubscription;
