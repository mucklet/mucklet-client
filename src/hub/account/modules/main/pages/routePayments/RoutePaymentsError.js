import { Elem, Txt } from 'modapp-base-component';
import PageHeader from 'components/PageHeader';
import l10n from 'modapp-l10n';
import errToL10n from 'utils/errToL10n';

/**
 * RoutePaymentsError draws a payment error
 */
class RoutePaymentsError extends Elem {
	constructor(module, error) {
		super(n => n.elem('div', { className: 'routepayments-error' }, [
			n.component(new PageHeader(l10n.l('routePayments.errorLoadingPayment', "Error loading payment"))),
			n.elem('div', { className: 'common--hr' }),
			n.component(new Txt(errToL10n(error), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RoutePaymentsError;
