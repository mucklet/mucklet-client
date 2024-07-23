import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';
import * as txtCardBrand from 'utils/txtCardBrand';


class RoutePaymentsPaymentBadgeContent {
	constructor(module, user, paymentUser, payment, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.payment = payment;
		this.toggle = toggle;

		this.methodTypes = {
			card: (method, paymentUser, payment) => this._cardComponentFactory(method, paymentUser, payment),
			paypal: (method, paymentUser, payment) => this._paypalComponentFactory(method, paymentUser, payment),
		};
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-paymentbadgecontent' }, [
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.method
					? components.details = components.details || (this.methodTypes[m.method] || (() => null))(m.methodInfo, m, this.paymentUser)
					: null,
				),
			)),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.method
					? null
					: components.noDetails = components.noDetails || new Txt(l10n.l('routePayments.noMethodDetails', "No details to show you."), { tagName: 'div', className: 'badge--text' }),
				),
			)),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.refunded
					? components.refunded = components.refunded || new Elem(n => n.elem('div', { className: 'badge--select' }, [
						n.component(new Txt(l10n.l('routePayments.refundedShort', "Refund"), { className: 'badge--iconcol badge--subtitle' })),
						n.component(new ModelTxt(this.payment, m => m.refunded && formatDateTime(new Date(m.refunded) || '', { showYear: true }), { className: 'badge--info-morepad badge--text' })),
					]))
					: null,
				),
			)),
			n.elem('div', { className: 'routepayments-paymentbadgecontent--details' }, [
				n.component(new Txt(l10n.l('routePayments.details', "Details"), {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: 'javascript:;',
					},
					events: {
						click: (c, ev) => {
							this.module.self.setRoute({ paymentId: this.payment.id });
							ev.preventDefault();
						},
					},
				})),
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

	_cardComponentFactory(method, paymentUser, payment) {
		return new Elem(n => n.elem('div', { className: 'badge--margin' }, [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('routePayments.card', "Card"), { className: 'badge--iconcol badge--subtitle' })),
				n.elem('div', { className: 'badge--info-morepad badge--text' }, [
					n.component(new ModelTxt(method, m => txtCardBrand.toLocaleString(m.data.brand))),
					n.component(new ModelTxt(method, m => " •••• " + m.data.last4)),
				]),
			]),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('routePayments.expires', "Expires"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(method, m => ("00" + m.data.expMonth).slice(-2) + " / " + m.data.expYear, { className: 'badge--info-morepad badge--text' })),
			]),
		]));
	}

	_paypalComponentFactory(method, paymentUser, payment) {
		return new Elem(n => n.elem('div', { className: 'badge--margin' }, [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('routePayments.paypal', "PayPal"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(method, m => m.data.payerEmail, { className: 'badge--info-morepad badge--text' })),
			]),
		]));
	}
}

export default RoutePaymentsPaymentBadgeContent;
