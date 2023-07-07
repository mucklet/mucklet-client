import PaymentOfferSetupTxt from './PaymentOfferSetupTxt';
// import './payment.scss';

/**
 * Payment adds the logout tool.
 */
class Payment {
	constructor(app, params) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Creates a PaymentOfferSetupTxt component.
	 * @param {Model} offer Offer model.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @returns {Component} PaymentOfferSetupTxt component.
	 */
	newOfferSetupTxt(offer, opt) {
		return new PaymentOfferSetupTxt(offer, opt);
	}

	dispose() {}
}

export default Payment;
