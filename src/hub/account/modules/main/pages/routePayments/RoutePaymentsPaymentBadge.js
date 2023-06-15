import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import ModelFader from 'components/ModelFader';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';
import formatDateTime from 'utils/formatDateTime';
import RoutePaymentsPaymentBadgeContent from './RoutePaymentsPaymentBadgeContent';

const methodIcons = {
	card: 'credit-card',
	paypal: 'paypal',
};

class RoutePaymentsPaymentBadge {
	constructor(module, payment, model) {
		this.module = module;
		this.payment = payment;
		this.offer = payment.offer;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.payment,
			new Elem(n => n.elem('badge', 'div', { className: 'routepayments-paymentbadge badge dark large btn', events: {
				click: () => this._toggleInfo(),
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--faicon' }, [
						n.component(new ModelComponent(
							this.payment,
							new FAIcon(),
							(m, c) => c.setIcon(m.refunded ? 'undo' : (methodIcons[m.method] || 'money')),
						)),
					]),
					n.elem('div', { className: 'badge--info-morepad' }, [
						n.elem('div', { className: 'flex-row flex-start' }, [
							n.elem('div', { className: 'routepayments-paymentbadge--title badge--title badge--nowrap flex-1' }, [
								n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
								n.text(" "),
								n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
									? txtUnit.toLocaleString(m.unit, m.amount)
									: txtRecurrence.toLocaleString(this.offer.recurrence),
								)),
							]),
							n.elem('div', { className: 'routepayments-paymentbadge--date badge--nowrap flex-auto' }, [
								n.component(new ModelTxt(this.payment, m => formatDateTime(new Date(m.completed || m.created), { showYear: true }))),
							]),
						]),
						n.elem('div', { className: 'routepayments-paymentbadge--info badge--text badge--nowrap flex-1' }, [
							n.component(new ModelFader(this.payment, [
								{
									condition: m => m.amountRefunded,
									factory: m => new Elem(n => n.elem('div', { className: 'routepayments-paymentbadge--refunded' }, [
										n.component(new ModelTxt(m, m => txtCurrency.toLocaleString(m.currency, m.cost), { className: 'routepayments-paymentbadge--refundedcost' })),
										n.text(' → '),
										n.component(new ModelTxt(m, m => txtCurrency.toLocaleString(m.currency, m.cost - m.amountRefunded), { className: 'routepayments-paymentbadge--refundednew' })),
										n.text(' '),
										n.component(new ModelTxt(m, m => l10n.l('routePayments.refundedTotal', "({amount} refunded)", { amount: l10n.t(txtCurrency.toLocaleString(m.currency, m.amountRefunded)) }), { className: 'routepayments-paymentbadge--refundedtotal badge--text' })),
									])),
								},
								{
									condition: m => m.canceled,
									factory: m => new ModelTxt(m, m => m.error
										? l10n.l(m.error.code, m.error.message, m.error.data)
										: l10n.l('routePayments.canceledPayment', "Payment canceled.")
									, { className: 'routepayments-paymentbadge--error' }),
								},
								{
									factory: m => new ModelTxt(m, m => txtCurrency.toLocaleString(m.currency, m.cost), { className: 'routepayments-paymentbadge--cost' }),
								},
							])),
						]),
					]),
				]),
				n.component(new ModelComponent(
					this.model,
					new Collapser(null),
					(m, c, change) => {
						if (change && !change.hasOwnProperty('paymentId')) return;
						c.setComponent(m.paymentId === this.payment.id
							? new RoutePaymentsPaymentBadgeContent(this.module, this.user, this.paymentUser, this.payment, (show) => this._toggleInfo(show))
							: null,
						);
					},
				)),
			])),
			(m, c) => {
				for (let method in methodIcons) {
					c[method == m.method ? 'addClass' : 'removeClass']('method-' + method);
				}
				c[m.refunded ? 'addClass' : 'removeClass']('refunded');
				c[m.canceled ? 'addClass' : 'removeClass']('canceled');
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
		let id = this.payment.id;
		show = typeof show == 'undefined'
			? !this.model.paymentId || this.model.paymentId != id
			: !!show;

		this.model.set({ paymentId: show ? id : null });
	}
}

export default RoutePaymentsPaymentBadge;
