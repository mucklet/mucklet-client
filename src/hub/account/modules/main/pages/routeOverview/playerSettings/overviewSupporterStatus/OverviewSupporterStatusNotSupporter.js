import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import OverviewSupporterStatusOffers from './OverviewSupporterStatusOffers';

const txtBecomeSupporterPrefix = l10n.l('overviewSupporterStatus.becomeSupporterPrefix', "You are welcome to play here for free, but if you support Mucklet, you can unlock ");
const txtBecomeSupporterLink = l10n.l('overviewSupporterStatus.becomeSupporterLink', "supporter perks");
const txtBecomeSupporterSuffix = l10n.l('overviewSupporterStatus.becomeSupporterSuffix', "!");

class OverviewSupporterStatusNotSupporter {
	constructor(module, user, paymentUser, supporterOffers, state) {
		this.module = module;
		this.user = user;
		this.paymentUser = paymentUser;
		this.supporterOffers = supporterOffers;
		this.state = state;
	}

	render(el) {
		this.model = new Model({ data: { offerId: this.state.offerId || null }, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'overviewsupporterstatus-notsupporter' }, [
			n.elem('div', { className: 'overviewsupporterstatus--disclaimer' }, [
				n.component(new Txt(txtBecomeSupporterPrefix)),
				n.component(new Txt(txtBecomeSupporterLink, {
					tagName: 'a',
					className: 'link',
					attributes: {
						href: 'javascript:;',
					},
					events: {
						click: (c, ev) => {
							this.module.dialogProductContent.open('supporter');
							ev.preventDefault();
						},
					},
				})),
				n.component(new Txt(txtBecomeSupporterSuffix)),
			]),
			n.component(new OverviewSupporterStatusOffers(this.module, this.user, this.paymentUser, this.supporterOffers, this.state, {
				className: 'pad-top-m',
			})),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, { offerId: this.model.offerId });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewSupporterStatusNotSupporter;
