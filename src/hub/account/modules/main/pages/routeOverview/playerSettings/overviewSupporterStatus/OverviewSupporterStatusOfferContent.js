import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
// import Fader from 'components/Fader';
import l10n from 'modapp-l10n';
import * as txtRecurrence from 'utils/txtRecurrence';


class OverviewSupporterStatusOfferContent {
	constructor(module, user, paymentUser, offer, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.offer = offer;
		this.toggle = toggle;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-offercontent' }, [
			n.elem('div', { className: 'badge--select overviewsupporterstatus-offercontent--text' }, [
				n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelTxt(this.offer, m => txtRecurrence.info(m.recurrence))),
				]),
			]),
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.elem('button', { className: 'btn medium primary flex-1', events: {
					click: (el, e) => {
						this._openCardPayment();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('credit-card')),
					n.component(new Txt(l10n.l('overviewSupporterStatus.userCard', "Use card"))),
				]),
				// n.elem('button', { className: 'overviewsupporterstatus-offercontent--paypal btn medium primary flex-1', events: {
				// 	click: (el, e) => {
				// 		this._openCardPayment();
				// 		e.stopPropagation();
				// 	},
				// }}, [
				// 	n.component(new FAIcon('paypal')),
				// 	n.component(new Txt(l10n.l('overviewSupporterStatus.userPayPal', "Use PayPal"))),
				// ]),
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

	_openCardPayment() {
		this.module.routePayment.setRoute('card', this.offer.id);
		// this.module.dialogCardPayment.open(this.offer.id);
	}
}

export default OverviewSupporterStatusOfferContent;
