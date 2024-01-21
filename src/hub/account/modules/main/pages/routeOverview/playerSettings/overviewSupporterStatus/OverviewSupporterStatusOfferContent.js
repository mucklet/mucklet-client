import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
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
		this.openingPayment = null;
		this.model = null;
	}

	render(el) {
		// Model storing currently opening payment method
		this.model = new Model({ data: { method: null, promise: null }});
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-offercontent' }, [
			n.elem('div', { className: 'badge--select overviewsupporterstatus-offercontent--text' }, [
				n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelTxt(this.offer, m => txtRecurrence.info(m.recurrence))),
				]),
			]),
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.component(this.module.self.params.includeCard && this._newMethodButton(this.model, 'card', 'credit-card', l10n.l('overviewSupporterStatus.card', "Card"))),
				n.component(this.module.self.params.includePaypal && this._newMethodButton(this.model, 'paypal', 'paypal', l10n.l('overviewSupporterStatus.paypal', "PayPal"))),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.model.set({ method: null, promise: null });
			this.model = null;
		}
	}

	_newMethodButton(model, method, icon, name) {
		// btn small primary icon-left full-width
		return new Elem(n => n.elem('button', { className: `overviewsupporterstatus-offercontent--${method} btn medium primary icon-center flex-1`, events: {
			click: (el, e) => {
				this._tryOpen(() => this._openPayment(model, method));
				e.stopPropagation();
			},
		}}, [
			n.component(new ModelFader(model, [
				{
					condition: m => m.method == method,
					factory: m => new Elem(n => n.elem('div', { className: 'spinner small dark' })),
				},
				{
					factory: m => new FAIcon(icon),
				},
			], { className: 'fa' })),
			n.component(new Txt(name)),
		]));
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

	_openPayment(model, method) {
		// Check if we are already opening payment for this method.
		if (model.method == method) {
			return;
		}

		let promise = this.module.stripe.createPayment(this.offer.id, method)
			.then(payment => {
				// Validate we haven't switched payment to use
				if (model.promise == promise) {
					this.module.routePayments.setRoute({ paymentId: payment.id });
				}
			})
			.catch(err => {
				if (model.promise != promise) {
					return;
				}
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
			.then(() => {
				if (model.promise == promise) {
					this.model.set({ method: null, promise: null });
				}
			});

		this.model.set({ method: method, promise });
	}
}

export default OverviewSupporterStatusOfferContent;
