import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import ScreenDialog from 'components/ScreenDialog';

/**
 * StripePaymentElement draws a component that tests accepting a payment using
 * the stripe Payment element
 */
class StripePaymentElement {
	constructor(module, user, info, stripe, clientSecret) {
		this.module = module;
		this.user = user;
		this.info = info;
		this.stripe = stripe;
		this.clientSecret = clientSecret;
		this.payPromise = null;

		this.payment = null;
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'stripe' }, [
			n.elem('label', [
				n.component(new Txt(l10n.l('stripe.accountEmail', "Account email"), { tagName: 'h3' })),
			]),
			n.component(new ModelTxt(this.user, m => m.email, { tagName: 'div', className: 'common--formmargin' })),

			n.elem('payment', 'div'),
			n.component('message', new Collapser(null)),
			n.elem('stripe', 'button', { events: {
				click: (c, ev) => {
					ev.preventDefault();
					this._onPay();
				},
			}, className: 'btn large primary stripe--pay pad-top-xl stripe--btn' }, [
				n.elem('spinner', 'div', { className: 'spinner fade hide' }),
				n.component(new Txt(l10n.l('stripe.pay', "Pay"))),
			]),
		])), {
			title: l10n.l('stripe.cardPayment', "Card payment"),
			size: 'medium',
		});
		let rel = this.elem.render(el);
		// Mount stripe card element
		this.elements = this.stripe.elements({
			clientSecret: this.clientSecret,
			locale: 'en',
			appearance: {
				theme: 'flat',
				variables: {
					colorPrimary: '#c1a657', // $color2
					colorBackground: '#303753', // $color1-lightest
					colorText: '#fffcf2', // $color3
					colorDanger: '#9a593e', // $log-error
					colorTextPlaceholder: '#676c82', // $color1-placeholder-light
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
			// style: {
			// 	base: {
			// 		iconColor: '#fffcf2', // '#00FF00', //9da0a9',
			// 		color: '#fffcf2',
			// 		fontFamily: 'Open Sans, sans-serif',
			// 		fontSize: '16px',
			// 		// fontSmoothing: 'antialiased',
			// 		// ':-webkit-autofill': {
			// 		// 	color: '#fce883',
			// 		// },
			// 		'::placeholder': {
			// 			color: '#676c82',
			// 		},
			// 	},
			// 	invalid: {
			// 		iconColor: '#9a593e',
			// 		color: '#9a593e',
			// 	},
			// },
		});
		this.payment.mount(this.elem.getComponent().getNode('payment'));

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.payment.unmount();
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onPay() {
		if (!this.payment || this.payPromise) return;

		this.elem.getComponent().removeNodeClass('spinner', 'hide');


		this.payPromise = this.stripe.confirmPayment({
			elements: this.elements,
			confirmParams: {
				return_url: window.location.href.split('?')[0] + '?stripe.status=redirect',
			},
		}).then(result => {
			if (result.error) {
				console.error(result.error);
				return Promise.reject({ code: 'stripe.error', message: result.error.message });
			}
			console.log("Success! Payment intent: ", result.paymentIntent);
			let n = this.elem.getComponent().getNode('message');
			n.setComponent(new Txt(l10n.l('stripe.successfulPayment', "Payment was successful")));
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.payPromise = null;
			this.elem.getComponent().addNodeClass('spinner', 'hide');
		});

	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this.elem.getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'stripe--error' }) : null);
	}
}

export default StripePaymentElement;
