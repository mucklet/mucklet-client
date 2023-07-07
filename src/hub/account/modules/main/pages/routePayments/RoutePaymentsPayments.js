import { Elem, Transition, Txt, Context } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import RoutePaymentsPaymentBadge from './RoutePaymentsPaymentBadge';

const defaultLimit = 10;

/**
 * RoutePaymentsPayments draws a list of payments component
 */
class RoutePaymentsPayments {
	constructor(module, model, user, payments) {
		this.module = module;
		this.model = model;
		this.user = user;
		this.payments = payments;
	}

	render(el) {
		this.stateModel = new Model({ data: { payments: null, page: null, count: null }, eventBus: this.module.self.app.eventBus });
		this.listComponent = new Transition(null);
		let components = {};
		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				this.stateModel,
				new CollectionComponent(
					null,
					new Elem(n => n.elem('div', { className: 'routepayments-payments' }, [
						n.component(new Txt(l10n.l('routePayments.payments', "Payments"), { tagName: 'h2' })),
						n.elem('div', { className: 'common--hr' }),
						n.elem('div', { className: 'routepayments--head flex-row flex-center margin4' }, [
							n.component(new ModelComponent(
								this.stateModel,
								new Fader(null, { className: 'flex-1' }),
								(m, c) => c.setComponent(m.payments
									? m.count || m.page // If we have mail, or are on a later page.
										? components.mailCount = components.mailCount || new Elem(n => n.elem('div', { className: 'routepayments-payments--page' }, [
											n.component(new Txt(l10n.l('routePayments.payments', "Payments"))),
											n.text(' '),
											n.component(new ModelTxt(this.stateModel, m => m.page * defaultLimit + 1)),
											n.text(" – "),
											n.component(new ModelTxt(this.stateModel, (m, c) => m.count
												? m.page * defaultLimit + (m.count > defaultLimit ? defaultLimit : m.count)
												: c.getText(),
											)),
										]))
										: components.noPayments = components.noPayments || new Txt(l10n.l('routePayments.noPayments', "No payments here"), { className: 'routepayments--placeholder' })
									: null,
								),
							)),
							n.component(new ModelComponent(
								this.stateModel,
								new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
									click: () => this._setPage(Math.max(this.stateModel.page - 1, 0)),
								}}, [
									n.component(new FAIcon('angle-left')),
								])),
								(m, c) => c.setProperty('disabled', m.page ? null : 'disabled'),
							)),
							n.component(new ModelComponent(
								this.stateModel,
								new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
									click: () => this._setPage(this.stateModel.page + 1),
								}}, [
									n.component(new FAIcon('angle-right')),
								])),
								(m, c) => c.setProperty('disabled', m.count > defaultLimit ? null : 'disabled'),
							)),
						]),
						n.component(this.listComponent),
					])),
					(col, m) => this.stateModel.set({ count: col ? col.length : null }),
				),
				(m, c) => c.setCollection(m.payments),
			),
			(m, c) => {
				if (this.user == m.user) {
					this._loadPage(m.pageNr);
				}
			},
		);
		let rel = this.elem.render(el);

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.stateModel = null;
			this.listComponent = null;
		}
	}

	_setPage(page) {
		page = page || 0;
		this.module.self.setRoute({ user: this.user.id, pageNr: page });
	}

	_loadPage(page) {
		page = page || 0;
		if (!this.stateModel || // No longer rendered
			this.stateModel.page == page // We are already on that page
		) {
			return;
		}

		this.module.api.get('payment.user.' + this.user.id + '.payments?offset=' + (page * defaultLimit) + '&limit=' + (defaultLimit + 1)).then(payments => {
			if (!this.stateModel || // No longer rendered
				this.model.user != this.user || // A different user is selected
				(this.model.pageNr || 0) !== page || // A different page is selected
				this.stateModel.page == page // We are already on that page
			) return;

			let m = this.stateModel;
			let dir = page - m.page;
			let cb = m.payments
				? dir > 0
					? 'slideLeft'
					: dir < 0
						? 'slideRight'
						: 'fade'
				: 'fade';
			this.listComponent[cb](new Elem(n => n.elem('div', [
				n.component(new Context(
					() => new CollectionWrapper(payments, { begin: 0, end: defaultLimit, eventBus: this.module.self.app.eventBus }),
					payments => payments.dispose(),
					payments => new CollectionList(
						payments,
						m => new RoutePaymentsPaymentBadge(this.module, m, this.stateModel),
						{
							className: 'routepayments-payments--list',
							subClassName: () => 'routepayments-payments--listitem',
						},
					),
				)),
			])));

			this.stateModel.set({ payments, page });
		});
	}
}

export default RoutePaymentsPayments;
