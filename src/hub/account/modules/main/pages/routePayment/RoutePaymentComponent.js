import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import errToL10n from 'utils/errToL10n';
import RoutePaymentCard from './RoutePaymentCard';

const txtMethods = {
	card: l10n.l('routePayment.cardPayment', "Card payment"),
};

/**
 * RoutePaymentComponent draws a the payment route page.
 */
class RoutePaymentComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Fader(),
			(m, c, change) => {
				let { method, offer, error } = m.props;
				c.setComponent((method && offer) || error
					? new Elem(n => n.elem('div', { className: 'routepayment' }, [
						n.component(new Txt(txtMethods[method] || l10n.l('routePayment.payment', "Payment"), { tagName: 'h2' })),
						n.elem('div', { className: 'common--hr' }),
						n.component(error
							? new Txt(errToL10n(error), { tagName: 'p', className: 'common--placeholder' })
							: method == 'card'
								? new RoutePaymentCard(this.module, m.offer)
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

export default RoutePaymentComponent;
