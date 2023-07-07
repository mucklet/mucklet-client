import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import RoutePaymentsStripe from './RoutePaymentsStripe';
import RoutePaymentsResult from './RoutePaymentsResult';
import RoutePaymentsError from './RoutePaymentsError';
import RoutePaymentsPayment from './RoutePaymentsPayment';
import RoutePaymentsPayments from './RoutePaymentsPayments';

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
		let paymentsComponent = null;
		this.elem = new ModelComponent(
			this.model,
			new Fader(),
			(m, c, change) => {
				let { payment, page, user, error } = m.props;
				let components = {};
				c.setComponent(error
					? new RoutePaymentsError(this.module, error)
					: payment
						? page == 'result'
							? new RoutePaymentsResult(this.module, payment)
							: page == 'payment'
								? new ModelComponent(
									payment,
									new Fader(),
									(m, c, change) => c.setComponent(m.status == 'pending'
										? payment.provider == 'stripe'
											? components.stripe = components.stripe || new RoutePaymentsStripe(this.module, payment)
											: components.error = components.error || new RoutePaymentsError(this.module, txtPageNotFound)
										: components.payment = components.payment || new RoutePaymentsPayment(this.module, payment),
									),
								)
								: new RoutePaymentsError(this.module, txtPageNotFound)
						: user
							? paymentsComponent?.user == user
								? paymentsComponent
								: paymentsComponent = new RoutePaymentsPayments(this.module, this.model, user)
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
