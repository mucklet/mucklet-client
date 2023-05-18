import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import * as txtCardbrand from 'utils/txtCardbrand';


class RoutePaymentsPaymentBadgeContent {
	constructor(module, user, paymentUser, payment, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.payment = payment;
		this.toggle = toggle;

		this.methodTypes = {
			card: (method, paymentUser, payment) => this._cardComponentFactory(method, paymentUser, payment),
		};
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routepayments-paymentbadgecontent' }, [
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.method
					? (this.methodTypes[m.method] || (() => null))(m.methodInfo, m, this.paymentUser)
					: null,
				),
			)),
			n.component(new ModelComponent(
				this.payment,
				new Collapser(),
				(m, c) => c.setComponent(m.method
					? null
					: new Txt(l10n.l('routePayments.noMethodDetails', "No details to show you."), { tagName: 'div', className: 'badge--text' }),
				),
			)),
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
				n.component(new ModelTxt(method, m => txtCardbrand.toLocaleString(m.data.brand), { className: 'badge--info-morepad badge--text' })),
			]),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('routePayments.number', "Number"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(method, m => "•••• " + m.data.last4, { className: 'badge--info-morepad badge--text' })),
			]),
		]));
	}
}

export default RoutePaymentsPaymentBadgeContent;
