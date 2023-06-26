import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';
import * as txtPaymentStatus from 'utils/txtPaymentStatus';

/**
 * RoutePaymentsResult draws a payment result component
 */
class RoutePaymentsResult {
	constructor(module, payment) {
		this.module = module;
		this.payment = payment;
		this.offer = payment.offer;
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-result' }, [
			n.component(new ModelTxt(this.payment, m => txtPaymentStatus.toLocaleString(m), { tagName: 'h2' })),
			n.elem('div', { className: 'common--hr' }),
			n.elem('p', { className: 'routepayments--product' }, [
				n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
					? txtUnit.toLocaleString(m.unit, m.amount)
					: txtRecurrence.toLocaleString(m.recurrence),
				)),
			]),
			n.elem('p', { className: 'routepayments--statusdescription' }, [
				n.component(new ModelTxt(this.payment, m => txtPaymentStatus.description(m))),
			]),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(components.thanks = m.status == 'completed'
					? new Elem(n => n.elem('div', [
						n.component(new ModelTxt(this.offer, m => txtProduct.paidDescription(m.product), { tagName: 'p', className: 'routepayments--description' })),
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
						n.component(new ModelTxt(this.offer, m => txtProduct.paidThanks(m.product), { tagName: 'p', className: 'routepayments--thanks' })),
						n.elem('button', { events: {
							click: (c, ev) => {
								ev.preventDefault();
								this.module.router.setRoute('overview');
							},
						}, className: 'btn large primary margin-top-xl' }, [
							n.component(new Txt(l10n.l('routePayments.youreWelcome', "You're welcome"))),
						]),
					]))
					: new Elem(n => n.elem('div', [
						n.elem('button', { events: {
							click: (c, ev) => {
								ev.preventDefault();
								this.module.self.setRoute({ paymentId: this.payment.id });
							},
						}, className: 'btn large primary margin-top-xl' }, [
							n.component(new Txt(l10n.l('routePayments.backToOverview', "Back to payment"))),
						]),
					])),
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
}

export default RoutePaymentsResult;
