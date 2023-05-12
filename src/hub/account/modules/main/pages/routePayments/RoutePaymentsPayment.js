import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import formatDateTime from 'utils/formatDateTime';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';
import * as txtPaymentStatus from 'utils/txtPaymentStatus';
import * as txtCurrency from 'utils/txtCurrency';

/**
 * RoutePaymentsPayment draws a payment component
 */
class RoutePaymentsPayment {
	constructor(module, payment) {
		this.module = module;
		this.payment = payment;
		this.offer = payment.offer;
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-payment' }, [
			n.component(new Txt(l10n.l('routePayments.payment', "Payment"), { tagName: 'h2' })),
			n.elem('div', { className: 'common--hr' }),
			n.elem('p', { className: 'routepayments--product' }, [
				n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
					? txtUnit.toLocaleString(m.unit, m.amount)
					: txtRecurrence.toLocaleString(m.recurrence),
				)),
			]),
			n.component(new PanelSection(
				l10n.l('routePayments.amount', "Amount"),
				new ModelComponent(
					this.payment,
					new Fader(),
					(m, c) => c.setComponent(m.cost
						? components.cost = components.cost || new ModelTxt(this.payment, m => txtCurrency.toLocaleString(m.currency, m.cost), { className: 'routepayments--cost' })
						: components.setup = components.setup || new Txt(l10n.l('routePayments.setup', "Setup for future payments. Nothing charged.")),
					),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
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
				new ModelTxt(this.payment, m => formatDateTime(new Date(m.updated), { showYear: true })),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
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
}

export default RoutePaymentsPayment;
