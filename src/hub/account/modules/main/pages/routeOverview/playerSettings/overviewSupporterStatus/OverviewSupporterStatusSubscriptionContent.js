import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtProduct from 'utils/txtProduct';
import * as txtCardBrand from 'utils/txtCardBrand';


class OverviewSupporterStatusSubscriptionContent {
	constructor(module, user, paymentUser, subscription, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.subscription = subscription;
		this.toggle = toggle;
		this.offer = subscription.offer;

		this.methodTypes = {
			card: (method, subscription, paymentUser) => this._cardComponentFactory(method, subscription, paymentUser),
			paypal: (method, subscription, paymentUser) => this._paypalComponentFactory(method, subscription, paymentUser),
		};
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-offercontent' }, [
			n.component(new ModelComponent(
				this.subscription,
				new Collapser(),
				(m, c) => c.setComponent(m.methodInfo
					? (this.methodTypes[m.methodInfo.type] || (() => null))(m.methodInfo, m, this.paymentUser)
					: null,
				),
			)),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('routePayments.setup', "Setup"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(this.module.payment.newOfferSetupTxt(this.offer, { className: 'badge--info-morepad badge--text' })),
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

	_cardComponentFactory(method, subscription, paymentUser) {
		return new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overviewSupporterStatus.card', "Card"), { className: 'badge--iconcol badge--subtitle' })),
				n.elem('div', { className: 'badge--info-morepad badge--text' }, [
					n.component(new ModelTxt(method, m => txtCardBrand.toLocaleString(m.data.brand))),
					n.component(new ModelTxt(method, m => " •••• " + m.data.last4)),
				]),
			]),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overviewSupporterStatus.expires', "Expires"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(method, m => ("00" + m.data.expMonth).slice(-2) + " / " + m.data.expYear, { className: 'badge--info-morepad badge--text' })),
			]),
		]));
	}

	_paypalComponentFactory(method, subscription, paymentUser) {
		return new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overviewSupporterStatus.paypal', "PayPal"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(method, m => m.data.payerEmail, { className: 'badge--info-morepad badge--text' })),
			]),
		]));
	}
}

export default OverviewSupporterStatusSubscriptionContent;
