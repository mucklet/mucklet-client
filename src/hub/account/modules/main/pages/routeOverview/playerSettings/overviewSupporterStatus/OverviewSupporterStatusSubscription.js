import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
// import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtProduct from 'utils/txtProduct';
import formatDate from 'utils/formatDate';
import OverviewSupporterStatusSubscriptionContent from './OverviewSupporterStatusSubscriptionContent';

class OverviewSupporterStatusSubscription {
	constructor(module, user, paymentUser, subscription, supporterOffers, state) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.subscription = subscription;
		this.supporterOffers = supporterOffers;
		// The offer should never change on a subscription.
		this.offer = subscription.offer;
		this.state = state;
	}

	render(el) {
		this.model = new Model({ data: { subscriptionIsOpen: this.state.subscriptionIsOpen || false }, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-subscription' }, [
			n.component(new Txt(l10n.l('overviewSupporterStatus.activeSubscription', "Active subscription"), { tagName: 'h4', className: 'pad-top-l pad-bottom-s' })),
			n.elem('badge', 'div', { className: 'overviewsupporterstatus-offer--badge badge large btn recurrence-' + this.offer.recurrence, events: {
				click: () => this._toggleInfo(),
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--faicon' }, [
						n.component(new FAIcon('refresh')),
					]),
					n.elem('div', { className: 'badge--info' }, [
						n.elem('div', { className: 'overviewsupporterstatus-offer--title badge--title badge--nowrap' }, [
							n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
							n.text(" "),
							n.component(new ModelTxt(this.offer, m => txtRecurrence.toLocaleString(m.recurrence))),
						]),
						n.elem('div', { className: 'overviewsupporterstatus-offer--info badge--text badge--nowrap' }, [
							n.component(new Txt(l10n.l('overviewSupporterStatus.nextPayment', "Next payment "))),
							n.component(new ModelTxt(this.subscription, m => formatDate(new Date(m.currentPeriodEnd), { showYear: true }))),
						]),
					]),
				]),
				n.component(new ModelComponent(
					this.model,
					new Collapser(null),
					(m, c, change) => {
						if (change && !change.hasOwnProperty('subscriptionIsOpen')) return;
						c.setComponent(m.subscriptionIsOpen
							? new OverviewSupporterStatusSubscriptionContent(this.module, this.user, this.paymentUser, this.subscription, (show) => this._toggleInfo(show))
							: null,
						);
					},
				)),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_toggleInfo(show) {
		show = typeof show == 'undefined'
			? !this.model.subscriptionIsOpen
			: !!show;

		this.model.set({ subscriptionIsOpen: show });
	}
}

export default OverviewSupporterStatusSubscription;
