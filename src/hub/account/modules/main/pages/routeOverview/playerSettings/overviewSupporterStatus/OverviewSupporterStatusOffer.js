import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';
import OverviewSupporterStatusOfferContent from './OverviewSupporterStatusOfferContent';

class OverviewSupporterStatusOffer {
	constructor(module, user, paymentUser, offer, model) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.offer = offer;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.offer,
			new Fader(null, { className: 'overviewsupporterstatus-offer' }),
			(offer, c, change) => {
				if (!change || change.hasOwnProperty('recurrence')) {
					let isOnce = offer.recurrence == 'once';
					c.setComponent(new Elem(n => n.elem('badge', 'div', { className: 'overviewsupporterstatus-offer--badge badge large btn recurrence-' + offer.recurrence, events: {
						click: () => this._toggleInfo(),
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.elem('div', { className: 'badge--faicon' }, [
								n.component(isOnce
									? new Txt("30", { className: 'badge--faicontext' })
									: new FAIcon('refresh'),
								),
							]),
							n.elem('div', { className: 'badge--info-morepad' }, [
								n.elem('div', { className: 'overviewsupporterstatus-offer--title badge--title badge--nowrap' }, [
									n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
									n.text(" "),
									n.component(new ModelTxt(this.offer, m => isOnce
										? txtUnit.toLocaleString(m.unit, m.amount)
										: txtRecurrence.toLocaleString(offer.recurrence),
									)),
								]),
								n.elem('div', { className: 'overviewsupporterstatus-offer--info badge--strong badge--nowrap' }, [
									n.component(new ModelTxt(this.offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
									n.text(" "),
									n.component(new Txt(txtRecurrence.unit(offer.recurrence), { className: 'overviewsupporterstatus-offer--unit' })),
								]),
							]),
						]),
						n.component(new ModelComponent(
							this.model,
							new Collapser(null),
							(m, c, change) => {
								if (change && !change.hasOwnProperty('offerId')) return;
								c.setComponent(m.offerId === this.offer.id
									? new OverviewSupporterStatusOfferContent(this.module, this.user, this.paymentUser, this.offer, (show) => this._toggleInfo(show))
									: null,
								);
							},
						)),
					])));
				}
			},
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_toggleInfo(show) {
		let id = this.offer.id;
		show = typeof show == 'undefined'
			? !this.model.offerId || this.model.offerId != id
			: !!show;

		this.model.set({ offerId: show ? id : null });
	}
}

export default OverviewSupporterStatusOffer;
