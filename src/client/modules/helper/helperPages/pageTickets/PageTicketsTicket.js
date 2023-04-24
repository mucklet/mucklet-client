import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import errString from 'utils/errString';
import PageTicketsTicketContent from './PageTicketsTicketContent';

const txtUnknown = l10n.l('pageTickets.unknown', "(Unknown)");
const txtNotAssigned = l10n.l('pageTickets.notAssigned', "Not assigned");

class PageTicketsTicket {
	constructor(module, ticket, model, opt) {
		this.opt = opt;
		this.module = module;
		this.ticket = ticket;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.ticket,
			new Elem(n => n.elem('div', { className: 'pagetickets-ticket' }, [
				n.elem('badge', 'div', { className: 'pagetickets-ticket--badge badge btn margin4', events: {
					click: () => this._toggleInfo(),
				}}, [
					n.elem('div', { className: 'badge--select' }, [
						n.component(this.module.avatar.newAvatar(this.ticket.char, { size: 'small', className: 'badge--icon' })),
						n.elem('div', { className: 'badge--info' }, [
							n.elem('div', { className: 'badge--title badge--nowrap' }, [
								n.component(new ModelComponent(
									this.ticket.char,
									new Txt(),
									(m, c) => {
										c.setText((m.name + ' ' + m.surname).trim());
										c[m.deleted ? 'addClass' : 'removeClass']('badge--strikethrough');
									},
								)),
							]),
							n.component(new ModelComponent(
								this.ticket,
								new Fader(null, { className: 'badge--text' }),
								(m, c, change) => {
									if (change && !change.hasOwnProperty('assigned')) return;

									c.setComponent(m.assigned
										? new ModelTxt(m.assigned, m => errString(m, m => (m.name + ' ' + m.surname), txtUnknown), {
											className: 'badge--strong',
										})
										: new Txt(txtNotAssigned),
									);
								},
							)),
						]),
						n.elem('div', { className: 'badge--tools' }, [
							n.elem('button', { className: 'pagetickets-ticket--copyid iconbtn medium tinyicon', events: {
								click: (c, ev) => {
									this.module.copyCharId.copy(this.ticket.char);
									ev.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('clipboard')),
							]),
						]),
					]),
					n.component(new ModelComponent(
						this.model,
						new Collapser(null),
						(m, c, change) => {
							if (change && !change.hasOwnProperty('ticketId')) return;
							c.setComponent(m.ticketId === this.ticket.getResourceId()
								? new PageTicketsTicketContent(this.module, this.ticket, (show) => this._toggleInfo(show), this.opt)
								: null,
							);
						},
					)),
				]),
			])),
			(m, c) => {
				c[m.assigned ? 'removeNodeClass' : 'addNodeClass']('badge', 'unassigned');
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_toggleInfo(show) {
		let rid = this.ticket.getResourceId();
		show = typeof show == 'undefined'
			? !this.model.ticketId || this.model.ticketId != rid
			: !!show;

		this.model.set({ ticketId: show ? rid : null });
	}
}

export default PageTicketsTicket;
