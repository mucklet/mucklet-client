import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import OverviewSupporterStatusSubscription from './OverviewSupporterStatusSubscription';
import OverviewSupporterStatusNoSubscription from './OverviewSupporterStatusNoSubscription';

const txtThankYou = l10n.l('overviewSupporterStatus.thankYou', "Thank you for supporting Mucklet! We will do our best to improve things, and not to break reality.");

class OverviewSupporterStatusSupporter {
	constructor(module, user, paymentUser, supporterOffers, state) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
		this.state = state;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-supporter' }, [
			n.component(new Txt(txtThankYou, { className: 'overviewsupporterstatus--disclaimer' })),
			n.component(new ModelComponent(
				this.paymentUser,
				new ModelComponent(
					null,
					new Collapser(),
					(subscription, c, change) => {
						if (!change) {
							c.setComponent(subscription
								? new OverviewSupporterStatusSubscription(this.module, this.user, this.paymentUser, subscription, this.state)
								: new OverviewSupporterStatusNoSubscription(this.module, this.user, this.paymentUser, this.supporterOffers, this.state),
							);
						}
					},
				),
				(m, c) => c.setModel(m.subscription),
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

export default OverviewSupporterStatusSupporter;
