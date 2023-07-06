import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import * as txtRecurrence from 'utils/txtRecurrence';
import isError from 'utils/isError';
import { hasIdRoles } from 'utils/idRoles';

class OverviewSupporterStatusOfferContent {
	constructor(module, user, paymentUser, offer, toggle) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.offer = offer;
		this.toggle = toggle;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-offercontent' }, [
			n.elem('div', { className: 'badge--select overviewsupporterstatus-offercontent--text' }, [
				n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelTxt(this.offer, m => txtRecurrence.info(m.recurrence))),
				]),
			]),
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.elem('button', { className: 'btn medium primary flex-1', events: {
					click: (c, e) => {
						this._tryOpen(() => this._openCardPayment(c));
						e.stopPropagation();
					},
				}}, [
					n.elem('spinner', 'div', { className: 'spinner spinner--btn fade hide' }),
					n.component(new FAIcon('credit-card')),
					n.component(new Txt(l10n.l('overviewSupporterStatus.userCard', "Use card"))),
				]),
				// // In the future we want to have paypal as well.
				//
				// n.elem('button', { className: 'overviewsupporterstatus-offercontent--paypal btn medium primary flex-1', events: {
				// 	click: (el, e) => {
				// 		this._openCardPayment();
				// 		e.stopPropagation();
				// 	},
				// }}, [
				// 	n.component(new FAIcon('paypal')),
				// 	n.component(new Txt(l10n.l('overviewSupporterStatus.userPayPal', "Use PayPal"))),
				// ]),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_tryOpen(callback) {
		// Make sure we have a verified email
		if (!this.user.email || !this.user.emailVerified) {
			this.module.confirm.open(null, {
				title: l10n.l('overviewSupporterStatus.verifiedEmailRequired', "Verified email required"),
				body: [
					l10n.l('overviewSupporterStatus.verifiedEmailRequiredBody1', "You must have a verified email address to make payments, so that you can receive confirmations or recover the account if lost."),
					l10n.l('overviewSupporterStatus.verifiedEmailRequiredBody2', "Once verified, you can try again!"),
				],
				confirm: l10n.l('overviewSupporterStatus.gotIt', "Got it"),
				cancel: null,
			});
			return;
		}

		// Show confirmation for pioneers becoming a supporter
		if (this.offer.product == 'supporter' && hasIdRoles(this.user, 'pioneer')) {
			this.module.confirm.open(callback, {
				title: l10n.l('overviewSupporterStatus.areYouSure', "Are you sure?"),
				body: l10n.l('overviewSupporterStatus.confirmPioneerSupporter', "You are pioneer with all the perks available for supporters already. You are still welcome to support, of course, but you've probably already helped plenty!"),
				confirm: l10n.l('overviewSupporterStatus.letMeSupport', "Let me support!"),
				cancel: l10n.l('overviewSupporterStatus.nevermind', "Nevermind"),
			});
		} else {
			callback();
		}
	}

	_openCardPayment() {
		this.elem?.removeNodeClass('spinner', 'hide');

		this.module.stripe.createPayment(this.offer.id)
			.then(payment => this.module.routePayments.setRoute({ paymentId: payment.id }))
			.catch(err => {
				if (isError(err, 'payment.locationPaymentBlocked')) {
					this.module.confirm.open(null, {
						title: l10n.l('overviewSupporterStatus.locationPaymentBlockError', "Unsupported location"),
						body: [
							l10n.l('overviewSupporterStatus.locationPaymentBlockBody1', "Due to tax laws and possibly other reasons, we are not able to take payments from your location at the moment."),
							l10n.l('overviewSupporterStatus.locationPaymentBlockBody2', "Sorry about that!"),
						],
						cancel: null,
					});
				} else {
					this.module.confirm.openError(err);
				}
			})
			.then(() => this.elem?.addNodeClass('spinner', 'hide'));
	}
}

export default OverviewSupporterStatusOfferContent;
