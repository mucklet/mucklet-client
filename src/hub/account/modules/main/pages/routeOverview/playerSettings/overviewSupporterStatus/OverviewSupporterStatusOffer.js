import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import l10n from 'modapp-l10n';

const txtRecurrence = {
	once: '',
	month: l10n.l('overviewSupporterStatus.recurrenceMonth', "1 month (recurring)"),
	quarter: l10n.l('overviewSupporterStatus.recurrenceQuarter', "3 months (recurring)"),
	halfYear: l10n.l('overviewSupporterStatus.recurrenceHalfYear', "6 months (recurring)"),
	year: l10n.l('overviewSupporterStatus.recurrenceYear', "12 months (recurring)"),
};

const txtOnceUnit = {
	days: amount => amount == 1
		? l10n.l('overviewSupporterStatus.supportForDay', "1 day")
		: l10n.l('overviewSupporterStatus.supportForDays', "{amount} days", { amount }),
	months: amount => amount == 1
		? l10n.l('overviewSupporterStatus.supportForMonth', "1 month")
		: l10n.l('overviewSupporterStatus.supportForMonths', "{amount} months", { amount }),
};

const txtPerUnit = {
	days: l10n.l('overviewSupporterStatus.supportPerDay', " per day"),
	months: l10n.l('overviewSupporterStatus.supportPerMonth', " per month"),
};

const txtCurrency = {
	usd: cost => l10n.l('overviewSupporterStatus.usdCost', "${cost}", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
	eur: cost => l10n.l('overviewSupporterStatus.eurCost', "€{cost}", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
	sek: cost => l10n.l('overviewSupporterStatus.sekCost', "{cost} kr", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
};

const txtOneTime = l10n.l('overviewSupporterStatus.oneTime', " one time");

class OverviewSupporterStatusOffer {
	constructor(module, user, paymentUser, offer) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.offer = offer;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.offer,
			new Fader(null, { className: 'overviewsupporterstatus-offer' }),
			(offer, c, change) => {
				if (!change || change.hasOwnProperty('recurrence')) {
					let isOnce = offer.recurrence == 'once';
					c.setComponent(new Elem(n => n.elem('badge', 'div', { className: 'overviewsupporterstatus-offer--badge badge btn margin4 recurrence-' + offer.recurrence, events: {
						click: () => this._openOffer(),
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.elem('div', { className: 'badge--faicon' }, [
								n.component(isOnce
									? new Txt("30", { className: 'badge--faicontext' })
									: new FAIcon('refresh'),
								),
							]),
							n.elem('div', { className: 'badge--info' }, [
								n.elem('div', { className: 'badge--title badge--nowrap' }, [
									n.component(new ModelTxt(this.offer, m => isOnce
										? (txtOnceUnit[m.unit] || txtOnceUnit['unset'])(m.amount)
										: txtRecurrence[offer.recurrence],
									)),
								]),
								n.elem('div', { className: 'badge--strong badge--nowrap' }, [
									n.component(new ModelTxt(this.offer, m => txtCurrency[m.currency](isOnce
										? m.cost
										: m.cost / m.amount,
									))),
									n.component(new ModelTxt(this.offer, m => isOnce
										? txtOneTime
										: txtPerUnit[m.unit],
									)),
								]),
							]),
						]),
						// n.component(new ModelComponent(
						// 	this.model,
						// 	new Collapser(null),
						// 	(m, c, change) => {
						// 		if (change && !change.hasOwnProperty('selectedCharId')) return;
						// 		c.setComponent(m.selectedCharId === this.char.id
						// 			? new PageWatchCharContent(this.module, this.watch, (show) => this._toggleInfo(show))
						// 			: null
						// 		);
						// 	}
						// ))
					])));
				}
			},
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewSupporterStatusOffer;
