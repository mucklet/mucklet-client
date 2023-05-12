import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';

const txtMethods = {
	card: l10n.l('routePayments.cardPayment', "Card payment"),
};

/**
 * RoutePaymentsStripe draws a stripe card payment component
 */
class RoutePaymentsStripe {
	constructor(module, payment) {
		this.module = module;
		this.payment = payment;
		this.offer = payment.offer;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-stripe' }, [
			n.component(new Txt(txtMethods[this.payment.method] || l10n.l('routePayments.payment', "Payment"), { tagName: 'h2' })),
			n.elem('div', { className: 'common--hr' }),
			n.elem('p', { className: 'routepayments--product' }, [
				n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
					? txtUnit.toLocaleString(m.unit, m.amount)
					: txtRecurrence.toLocaleString(m.recurrence),
				)),
			]),
			n.elem('p', { className: 'routepayments--cost' }, [
				n.component(new ModelTxt(this.offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => txtRecurrence.unit(m.recurrence), { className: 'routepayments--unit' })),
			]),
			n.component(new ModelTxt(this.offer, m => txtProduct.description(m.product), { tagName: 'p', className: 'routepayments--description' })),
			n.component(new ModelComponent(
				this.offer,
				new Collapser(),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('product')) return;

					let features = txtProduct.features(m.product);

					c.setComponent(features.length
						? new Elem(n => n.elem('table', { className: 'routepayments--features tbl tbl-nomargin' }, features.map(o => n.elem('tr', [
							n.elem('td', { className: 'routepayments--featuretitle' }, [
								n.component(new Txt(o.title)),
							]),
							n.elem('td', { className: 'routepayments--featuredesc' }, [
								n.component(new Txt(o.desc)),
							]),
						]))))
						: null,
					);
				},
			)),
			n.component('fader', new Fader()),
		]));
		// Create payment component
		this.module.stripe.newCardPaymentPromise(this.payment.id, {
			className: 'routepayments--cardpayment',
			returnUrl: this.module.router.getUrl('payments', { page: 'result', paymentId: this.payment.id }, { keepQuery: true, fullPath: true }),
		}).then(paymentComponent => {
			if (this.elem) {
				let n = this.elem.getNode('fader');
				if (!n.getComponent()) {
					return n.setComponent(paymentComponent);
				}
			}
			paymentComponent.dispose();
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			let paymentComponent = this.elem.getNode('fader').getComponent();
			this.elem.unrender();
			this.elem = null;
			paymentComponent?.dispose();
		}
	}
}

export default RoutePaymentsStripe;
