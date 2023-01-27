import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import PageTicketsTicket from './PageTicketsTicket';
import PageTicketsNoMain from './PageTicketsNoMain';
import PageTicketsClosed from './PageTicketsClosed';

class PageTicketsComponent {
	constructor(module, tickets, state, close) {
		this.module = module;
		this.tickets = tickets;
		state.ticketId = state.ticketId || null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'pagetickets' }, [
			n.component(new ModelComponent(
				this.module.player.getPlayer(),
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('mainChar')) {
						c.setComponent(m.mainChar && m.mainChar.id ? null : new PageTicketsNoMain(this.module));
					}
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageTickets.tickets', "Help tickets"),
				new Elem(n => n.elem('div', [
					n.component(new CollectionList(
						this.tickets,
						m => new PageTicketsTicket(this.module, m, this.model),
					)),
					// Placeholder text
					n.component(new CollectionComponent(
						this.tickets,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageTickets.noTickets', "No help needed."), { className: 'common--nolistplaceholder' }),
						),
					)),
				])),
				{
					className: 'common--sectionpadding',
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageTickets.closedTickets', "Closed tickets"),
				new PageTicketsClosed(this.module, this.state),
				{
					className: 'common--sectionpadding',
				},
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageTicketsComponent;
