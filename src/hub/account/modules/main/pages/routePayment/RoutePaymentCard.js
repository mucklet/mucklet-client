import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import * as txtCurrency from 'utils/txtCurrency';
import * as txtRecurrence from 'utils/txtRecurrence';
import * as txtUnit from 'utils/txtUnit';
import * as txtProduct from 'utils/txtProduct';

/**
 * RoutePaymentCard draws a card payment component
 */
class RoutePaymentCard {
	constructor(module, offer) {
		this.module = module;
		this.offer = offer;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routepayment-card' }, [
			n.elem('p', { className: 'routepayment-card--product' }, [
				n.component(new ModelTxt(this.offer, m => txtProduct.toLocaleString(m.product))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => m.recurrence == 'once'
					? txtUnit.toLocaleString(m.unit, m.amount)
					: txtRecurrence.toLocaleString(m.recurrence),
				)),
			]),
			n.elem('p', { className: 'routepayment-card--cost' }, [
				n.component(new ModelTxt(this.offer, m => txtCurrency.toLocaleString(m.currency, m.cost))),
				n.text(" "),
				n.component(new ModelTxt(this.offer, m => txtRecurrence.unit(m.recurrence), { className: 'routepayment-card--unit' })),
			]),
			n.component(new ModelTxt(this.offer, m => txtProduct.description(m.product), { tagName: 'p', className: 'routepayment-card--description' })),
			n.component(new ModelComponent(
				this.offer,
				new Collapser(),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('product')) return;

					let features = txtProduct.features(m.product);

					c.setComponent(features.length
						? new Elem(n => n.elem('table', { className: 'routepayment-card--features tbl tbl-nomargin' }, features.map(o => n.elem('tr', [
							n.elem('td', { className: 'routepayment-card--featuretitle' }, [
								n.component(new Txt(o.title)),
							]),
							n.elem('td', { className: 'routepayment-card--featuredesc' }, [
								n.component(new Txt(o.desc)),
							]),
						]))))
						: null,
					);
				},
			)),
			n.component('fader', new Fader()),
		]));
		// Create payment component
		this.module.stripe.newCardPaymentPromise(this.offer.id, { className: 'routepayment-card--cardpayment' }).then(paymentComponent => {
			if (this.elem) {
				let n = this.elem.getNode('fader');
				if (!n.getComponent()) {
					return n.setComponent(paymentComponent);
				}
			}
			paymentComponent.dispose();
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			let paymentComponent = this.elem.getNode('fader').getComponent();
			this.elem.unrender();
			this.elem = null;
			paymentComponent?.dispose();
		}
	}
}

export default RoutePaymentCard;
