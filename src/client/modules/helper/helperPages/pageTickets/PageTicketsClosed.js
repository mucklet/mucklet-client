import { Elem, Transition, Context, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import PageTicketsTicket from './PageTicketsTicket';

const defaultLimit = 10;

class PageTicketsClosed {
	constructor(module, state, close) {
		this.module = module;
		state.closed = state.closed || {};
		state.closed.ticketId = state.closed.ticketId || null;
		state.closed.offset = state.closed.offset || 0;
		state.closed.count = null;
		this.state = state.closed;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });

		let noTicketsComponent = null;
		let ticketsCountComponent = new Elem(n => n.elem('div', { className: 'pagetickets-closed--page' }, [
			n.component(new Txt(l10n.l('pageTickets.ticket', "Ticket"))),
			n.text(' '),
			n.component(new ModelTxt(this.model, m => m.offset + 1)),
			n.text(" – "),
			n.component(new ModelTxt(this.model, (m, c) => m.count
				? m.offset + (m.count > defaultLimit ? defaultLimit : m.count)
				: c.getText(),
			)),
		]));

		this.elem = new Elem(n => n.elem('div', { className: 'pagetickets-closed' }, [
			n.component(new ModelComponent(
				this.model,
				new CollectionComponent(
					null,
					new Elem(n => n.elem('div', { className: 'pagetickets-closed--head flex-row flex-center margin4' }, [
						n.component(new ModelComponent(
							this.model,
							new Fader(null, { className: 'flex-1' }),
							(m, c) => c.setComponent(m.tickets
								? m.count || m.offset // If we have closed tickets, or are on a later page.
									? ticketsCountComponent
									: noTicketsComponent = noTicketsComponent || new Txt(l10n.l('pageTickets.noTickets', "No tickets"), { className: 'common--placeholder' })
								: null,
							),
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset < defaultLimit ? 0 : this.model.offset - defaultLimit),
							}}, [
								n.component(new FAIcon('angle-left')),
							])),
							(m, c) => c.setProperty('disabled', m.offset ? null : 'disabled'),
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset + defaultLimit),
							}}, [
								n.component(new FAIcon('angle-right')),
							])),
							(m, c) => c.setProperty('disabled', m.count > defaultLimit ? null : 'disabled'),
						)),
					])),
					(col, m) => this.model.set({ count: col ? col.length : null }),
				),
				(m, c, change) => c.setCollection(m.tickets),
			)),
			n.component('list', new Transition(null)),
		]));
		this.elem.render(el);

		this._loadMail(this.model.offset);
	}

	unrender() {
		if (this.elem) {
			let m = this.model;
			Object.assign(this.state, { ticketId: m.ticketId, offset: m.offset });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_loadMail(offset) {
		if (!this.model || this.loadingOffset === offset) return;

		if (this.model.tickets && this.offset === offset) {
			this.loadingOffset = null;
			return;
		}

		this.loadingOffset = offset;

		this.module.auth.getUserPromise().then(user => {
			if (!this.model || offset !== this.loadingOffset) return;
			this.module.api.get('support.tickets.closed?offset=' + offset + '&limit=' + (defaultLimit + 1)).then(tickets => {
				if (!this.model || offset !== this.loadingOffset) return;

				let m = this.model;
				let dir = offset - m.offset;
				let cb = m.tickets
					? dir > 0
						? 'slideLeft'
						: dir < 0
							? 'slideRight'
							: 'fade'
					: 'fade';
				this.elem.getNode('list')[cb](new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(tickets, { begin: 0, end: defaultLimit, eventBus: this.module.self.app.eventBus }),
						tickets => tickets.dispose(),
						tickets => new CollectionList(
							tickets,
							m => new PageTicketsTicket(this.module, m, this.model, { isClosed: true }),
							{ className: 'pagetickets-closed--list' },
						),
					)),
				])));

				this.loadingOffset = null;
				this.model.set({ tickets, offset });
			});
		});
	}

	_getTo() {
		let m = this.model;
		if (m) {
			let ms = m.tickets;
			if (ms) {
				return m.offset + (ms.length > defaultLimit ? defaultLimit : ms.length);
			}
		}
		return '...';
	}

	_setNextDisabled(c) {
		let m = this.model;
		c.setProperty('disabled', m && m.tickets && m.tickets.length > m.offset
			? null
			: 'disabled',
		);
	}
}

export default PageTicketsClosed;
