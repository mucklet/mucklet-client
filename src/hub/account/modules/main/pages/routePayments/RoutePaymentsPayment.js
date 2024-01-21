import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import formatDateTime from 'utils/formatDateTime';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';
import * as txtPaymentStatus from 'utils/txtPaymentStatus';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtCardbrand from 'utils/txtCardbrand';

/**
 * RoutePaymentsPayment draws a payment component
 */
class RoutePaymentsPayment {
	constructor(module, payment) {
		this.module = module;
		this.payment = payment;
		this.offer = payment.offer;

		this.methodTypes = {
			card: method => this._cardComponentFactory(method),
			paypal: method => this._paypalComponentFactory(method),
		};
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-payment' }, [
			n.component(new ModelTxt(
				this.payment,
				m => m.cost
					? l10n.l('routePayments.payment', "Payment")
					: l10n.l('routePayments.paymentSetup', "Payment setup"),
				{ tagName: 'h2' },
			)),
			n.elem('div', { className: 'common--hr' }),
			n.elem('p', { className: 'routepayments--product' }, [
				n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
					? txtUnit.toLocaleString(m.unit, m.amount)
					: txtRecurrence.toLocaleString(m.recurrence),
				)),
			]),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.cost
					? new PanelSection(
						l10n.l('routePayments.amount', "Amount"),
						new ModelComponent(
							this.payment,
							new Fader(),
							(m, c, change) => {
								if (!change || (change.hasOwnProperty('amountRefunded') && (!change.amountRefunded) != (!m.amountRefunded))) {
									c.setComponent(m.amountRefunded
										? new Elem(n => n.elem('div', { className: 'routepayments-payment--refunded' }, [
											n.component(new ModelTxt(this.payment, m => txtCurrency.toLocaleString(m.currency, m.cost), { className: 'routepayments-payment--refundedcost' })),
											n.text(' → '),
											n.component(new ModelTxt(this.payment, m => txtCurrency.toLocaleString(m.currency, m.cost - m.amountRefunded), { className: 'routepayments-payment--refundednew' })),
											n.text(' '),
											n.component(new ModelTxt(this.payment, m => l10n.l('routePayments.refundedTotal', "({amount} refunded)", { amount: l10n.t(txtCurrency.toLocaleString(m.currency, m.amountRefunded)) }), { className: 'routepayments-payment--refundedtotal' })),
										]))
										: new ModelTxt(this.payment, m => txtCurrency.toLocaleString(m.currency, m.cost), { className: 'routepayments-payment--cost' }),
									);
								}
							},
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('methodInfo')) {
						let comp = (this.methodTypes[m.method] || (() => null))(m.methodInfo);
						c.setComponent(comp
							? new PanelSection(
								l10n.l('routePayments.method', "Method"),
								comp,
								{
									className: 'common--sectionpadding',
									noToggle: true,
								},
							)
							: null,
						);
					}
				},
			)),
			n.component(new ModelComponent(
				this.offer,
				new Collapser(),
				(m, c) => c.setComponent(m.recurrence != 'once'
					? new PanelSection(
						l10n.l('routePayments.setup', "Setup"),
						this.module.payment.newOfferSetupTxt(this.offer),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
			n.component(new PanelSection(
				l10n.l('routePayments.status', "Status"),
				new ModelTxt(this.payment, m => txtPaymentStatus.toLocaleString(m)),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			)),
			n.component(new PanelSection(
				l10n.l('routePayments.dateAndTime', "Date & time"),
				new ModelTxt(this.payment, m => formatDateTime(new Date(m.completed || m.created), { showYear: true })),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			)),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.refunded
					? components.refunded = components.refunded || new PanelSection(
						l10n.l('routePayments.refunded', "Refunded"),
						new ModelTxt(this.payment, m => formatDateTime(new Date(m.refunded || m.created), { showYear: true })),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_cardComponentFactory(method) {
		return new Elem(n => n.elem('div', [
			n.component(new ModelTxt(method, m => txtCardbrand.toLocaleString(m.data.brand))),
			n.component(new ModelTxt(method, m => " •••• " + m.data.last4)),
			n.component(new Txt(l10n.l('routePayments.expires', ", expires "))),
			n.component(new ModelTxt(method, m => ("00" + m.data.expMonth).slice(-2) + " / " + m.data.expYear)),
		]));
	}

	_paypalComponentFactory(method) {
		return new Elem(n => n.elem('div', [
			n.component(new Txt(l10n.l('routePayments.paypalAccount', "PalPal: "))),
			n.component(new ModelTxt(method, m => m.data.payerEmail)),
		]));
	}
}

export default RoutePaymentsPayment;
