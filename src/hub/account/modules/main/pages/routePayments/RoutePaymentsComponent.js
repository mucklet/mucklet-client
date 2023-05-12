import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import RoutePaymentsStripe from './RoutePaymentsStripe';
import RoutePaymentsResult from './RoutePaymentsResult';
import RoutePaymentsError from './RoutePaymentsError';

const txtPageNotFound = l10n.l('routePayments.pageNotFound', "Page not found.");

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
				let { payment, page, error } = m.props;
				c.setComponent(error
					? new RoutePaymentsError(this.module, error)
					: payment
						? page == 'result'
							? new RoutePaymentsResult(this.module, payment)
							: page == 'payment'
								? payment.provider == 'stripe'
									? new RoutePaymentsStripe(this.module, payment)
									: new RoutePaymentsError(this.module, txtPageNotFound)
								: new RoutePaymentsError(this.module, txtPageNotFound)
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
