import { RootElem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';

class PaymentOfferSetupTxt extends RootElem {

	/**
	 * Creates an instance of PaymentOfferSetupTxt
	 * @param {Model} offer Offer model.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 */
	constructor(offer, opt) {
		opt = opt || {};
		super();
		this.setRootNode(n => n.elem(opt.tagName || 'div', opt, [
			n.component(new Txt(l10n.l('payment.recurringPaymentOf', "Recurring payment of "))),
			n.component(new ModelTxt(offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
			n.text(" "),
			n.component(new Txt(txtRecurrence.unit(offer.recurrence))),
			n.text("."),
		]));
	}
}

export default PaymentOfferSetupTxt;
