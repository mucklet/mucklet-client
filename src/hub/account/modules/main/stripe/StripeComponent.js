import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import ScreenDialog from 'components/ScreenDialog';

/**
 * StripeComponent draws a component that tests accepting a payment.
 */
class StripeComponent {
	constructor(module, user, info, stripe) {
		this.module = module;
		this.user = user;
		this.info = info;
		this.stripe = stripe;
		this.payPromise = null;

		this.card = null;
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'stripe' }, [
			n.elem('label', [
				n.component(new Txt(l10n.l('stripe.accountEmail', "Account email"), { tagName: 'h3' })),
			]),
			n.component(new ModelTxt(this.user, m => m.email, { tagName: 'div', className: 'common--formmargin' })),

			n.elem('label', [
				n.component(new Txt(l10n.l('stripe.card', "Card info"), { tagName: 'h3' })),
			]),
			n.elem('div', { className: 'common--formmargin input--textarea' }, [
				n.elem('card', 'div'),
			]),
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
		this.card = this.stripe.elements().create('card', {
			style: {
				base: {
					iconColor: '#fffcf2', // '#00FF00', //9da0a9',
					color: '#fffcf2',
					fontFamily: 'Open Sans, sans-serif',
					fontSize: '16px',
					// fontSmoothing: 'antialiased',
					// ':-webkit-autofill': {
					// 	color: '#fce883',
					// },
					'::placeholder': {
						color: '#676c82',
					},
				},
				invalid: {
					iconColor: '#9a593e',
					color: '#9a593e',
				},
			},
		});
		this.card.mount(this.elem.getComponent().getNode('card'));

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.card.unmount();
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onPay() {
		if (!this.card || this.payPromise) return;


		this.elem.getComponent().removeNodeClass('spinner', 'hide');

		let card = this.card;

		this.payPromise = this.module.api.call('payment.user.' + this.user.id + '.stripe', 'createPaymentIntent', {
			paymentMethodType: 'card',
		}).then(result => this.stripe.confirmCardPayment(
			result.clientSecret,
			{
				payment_method: {
					card,
					billing_details: {
						name: this.user.name,
					},
				},
			},
		)).then(result => {
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

export default StripeComponent;
