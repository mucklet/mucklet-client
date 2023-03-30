import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ScreenDialog from 'components/ScreenDialog';
import { redirect } from 'utils/reload';

/**
 * StripeComponent draws a component that tests accepting a payment.
 */
class StripeComponent {
	constructor(module, user, info) {
		this.module = module;
		this.user = user;
		this.info = info;
	}

	render(el) {
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'stripe-completed' }, [
			n.component(new Txt(l10n.l('stripe.thanks', "Thank you for your support!"), { tagName: 'p' })),
			n.component(new Txt(l10n.l('stripe.thanksInfo', "You now have access to additional supporter perks inside the game. Enjoy!"), { tagName: 'p' })),
			n.elem('stripe', 'button', { events: {
				click: (c, ev) => {
					ev.preventDefault();
					this.module.screen.setComponent({
						render: () => {
							redirect('/');
						},
						unrender: () => {},
					});
				},
			}, className: 'btn large primary stripe--pay pad-top-xl stripe--btn' }, [
				n.component(new Txt(l10n.l('stripe.backToAccount', "You're welcome"))),
			]),
		])), {
			title: l10n.l('stripe.paymentCompleted', "Payment completed"),
			// size: 'medium',
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default StripeComponent;
