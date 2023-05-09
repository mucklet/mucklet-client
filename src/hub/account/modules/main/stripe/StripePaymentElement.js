import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtCurrency from 'utils/txtCurrency';

/**
 * StripePaymentElement draws a component that tests accepting a payment using
 * the stripe Payment element
 */
class StripePaymentElement {
	constructor(module, user, info, offer, stripe, intent, opt) {
		this.module = module;
		this.user = user;
		this.info = info;
		this.offer = offer;
		this.stripe = stripe;
		this.intent = intent;
		this.opt = opt || {};

		this.payPromise = null;
		this.payment = null;

		this.info.on();
		this.offer.on();
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'stripe' + (this.opt.className ? ' ' + this.opt.className : '') }, [
			n.component(this.opt.includeName
				? new Elem(n => n.elem('div', [
					n.elem('label', { attributes: { for: 'stripe-cardholder' }}, [
						n.component(new Txt(l10n.l('stripe.cardholder', "Cardholder"), { tagName: 'h3' })),
					]),
					n.component('cardholder', new Input('', {
						className: 'stripe--input',
						attributes: { placeholder: "Name on card", id: 'stripe-cardholder', spellcheck: 'false' },
					})),
				]))
				: null,
			),
			n.elem('div', { className: 'stripe--payment' }, [
				n.elem('payment', 'div'),
			]),
			n.component(new ModelTxt(this.offer, m => txtRecurrence.info(m.recurrence), { tagName: 'div', className: 'stripe--recurrenceinfo' })),
			n.component('message', new Collapser(null)),
			n.elem('stripe', 'button', { events: {
				click: (c, ev) => {
					ev.preventDefault();
					this._onPay();
				},
			}, className: 'btn large primary stripe--pay pad-top-xl stripe--btn' }, [
				n.elem('spinner', 'div', { className: 'spinner fade hide' }),
				n.component(new FAIcon('credit-card')),
				n.component(new Txt(l10n.l('stripe.pay', "Pay"))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
			]),
		]));
		let rel = this.elem.render(el);
		// Mount stripe card element
		this.elements = this.stripe.elements({
			clientSecret: this.intent.clientSecret,
			locale: 'en',
			fonts: [
				{ cssSrc: '/fonts/fonts.css' },
			],
			appearance: {
				theme: 'flat',
				variables: {
					colorPrimary: '#c1a657', // $color2
					colorBackground: '#303753', // $color1-lightest
					colorText: '#fffcf2', // $color3
					colorDanger: '#9a593e', // $log-error
					colorTextPlaceholder: '#676c82', // $color1-placeholder-light
					colorTextSecondary: '#93969f', // $color4
					colorIcon: '#fffcf2', // $color3
					fontSizeBase: '16px', // $font-size
					fontFamily: 'Open Sans, sans-serif',
					spacingUnit: '2px',
					borderRadius: '4px',
					fontLineHeight: '20px',
				},
				rules: {
					'.Input': {
						lineHeight: '20px',
					},
					'.Label': {
						fontFamily: 'Amatic SC, cursive',
						fontSize: '24px',
						fontWeight: 'bold',
						color: '#c1a657', // $color2
					},
					'.Error': {
						paddingTop: '4px',
					},
				},
			},
		});
		this.payment = this.elements.create('payment', {
			fields: {
				billingDetails: {
					name: this.opt.includeName ? 'never' : 'auto',
				},
			},
		});
		this.payment.mount(this.elem.getNode('payment'));

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.payment.unmount();
			this.elem.unrender();
			this.elem = null;
			this.payment = null;
		}
	}

	dispose() {
		this.unrender();
		this.info.off();
		this.offer.off();
	}

	_onPay() {
		if (!this.payment || this.payPromise) return;

		let billing_details = {};

		if (this.opt.includeName) {
			let cardholder = this.elem.getNode('cardholder').getValue().trim();
			if (!cardholder) {
				this._setMessage(l10n.l('stripe.missingCardholder', "Missing cardholder name."));
				return;
			}
			billing_details.name = cardholder;
		}

		this.elem.removeNodeClass('spinner', 'hide');

		this.payPromise = (this.intent.secretType == 'payment'
			? this.stripe.confirmPayment({
				elements: this.elements,
				confirmParams: {
					return_url: 'http://localhost:6460/account/#overview', // this.opt.returlUrl || window.location.href,
					payment_method_data: {
						billing_details,
					},
				},
			})
			: this.stripe.confirmSetup({
				elements: this.elements,
				confirmParams: {
					return_url: 'http://localhost:6460/account/#overview', // this.opt.returlUrl || window.location.href,
					payment_method_data: {
						billing_details,
					},
				},
			})
		).then(result => {
			if (result.error) {
				console.error(result.error);
				return Promise.reject({ code: 'stripe.error', message: result.error.message });
			}
			if (this.opt.onSuccess) {
				this.opt.onSuccess(result.paymentIntent);
			} else {
				let n = this.elem.getNode('message');
				n.setComponent(new Txt(l10n.l('stripe.successfulPayment', "Payment was successful")));
			}
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.payPromise = null;
			this.elem.addNodeClass('spinner', 'hide');
		});

	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this.elem.getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'stripe--error' }) : null);
	}
}

export default StripePaymentElement;
