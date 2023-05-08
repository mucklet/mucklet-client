import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
// import Fader from 'components/Fader';
import l10n from 'modapp-l10n';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtProduct from 'utils/txtProduct';


class OverviewSupporterStatusSubscriptionContent {
	constructor(module, user, paymentUser, subscription, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.subscription = subscription;
		this.toggle = toggle;
		this.offer = subscription.offer;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-offercontent' }, [
			n.elem('div', { className: 'badge--select overviewsupporterstatus-offercontent--text' }, [
				n.elem('div', { className: 'badge--text' }, [
					n.component(new Txt(l10n.l('overviewSupporterStatus.recurringPaymentOf', "Recurring payment of "))),
					n.component(new ModelTxt(this.offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
					n.text(" "),
					n.component(new Txt(txtRecurrence.unit(this.offer.recurrence), { className: 'overviewsupporterstatus-offer--unit' })),
					n.text("."),
				]),
			]),
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.elem('button', { className: 'btn medium warning flex-1', events: {
					click: (el, e) => {
						this._unsubscribe();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('ban')),
					n.component(new Txt(l10n.l('overviewSupporterStatus.unsubscribe', "Unsubscribe"))),
				]),
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

	_unsubscribe() {
		this.module.confirm.open(() => this.subscription.call('cancel').catch(err => this.module.toaster.openError(err)), {
			title: l10n.l('overviewSupporterStatus.confirmUbsunscribe', "Confirm unsubscribe"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('overviewSupporterStatus.unsubscribeBody', "Do you really wish to unsubscribe?"), { tagName: 'p' })),
				n.elem('p', { className: 'dialog--strong' }, [
					n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
					n.text(" "),
					n.component(new ModelTxt(this.offer, m => txtRecurrence.toLocaleString(m.recurrence))),
				]),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('info-circle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('overviewSupporterStatus.unsubscribeWarning', "You will keep the supporter status for the remaining days of the period. No content will be deleted, but some functionality may become inaccessible without supporter status."))),
				]),
			])),
			confirm: l10n.l('overviewSupporterStatus.unsubscribe', "Unsubscribe"),
		});
	}
}

export default OverviewSupporterStatusSubscriptionContent;
