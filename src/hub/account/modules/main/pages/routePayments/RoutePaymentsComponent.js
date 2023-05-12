import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import errToL10n from 'utils/errToL10n';
import RoutePaymentsStripe from './RoutePaymentsStripe';

const txtMethods = {
	card: l10n.l('routePayments.cardPayment', "Card payment"),
};

/**
 * RoutePaymentsComponent draws a the payment route page.
 */
class RoutePaymentsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Fader(),
			(m, c, change) => {
				let { payment, error } = m.props;
				c.setComponent(payment || error
					? new Elem(n => n.elem('div', { className: 'routepayments' }, [
						n.component(new Txt(txtMethods[payment?.method] || l10n.l('routePayments.payment', "Payment"), { tagName: 'h2' })),
						n.elem('div', { className: 'common--hr' }),
						n.component(error
							? new Txt(errToL10n(error), { tagName: 'p', className: 'common--placeholder' })
							: payment.provider == 'stripe'
								? new RoutePaymentsStripe(this.module, payment)
								: null,
						),
					]))
					: null,
				);
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RoutePaymentsComponent;
