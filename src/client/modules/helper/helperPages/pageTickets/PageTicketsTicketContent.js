import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, ModelTxt, ModelHtml, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import errString from 'utils/errString';
import formatDateTime from 'utils/formatDateTime';
import formatText from 'utils/formatText';
import PageTicketsActivity from './PageTicketsActivity';

const txtSent = l10n.l('pageRequest.sent', "Sent");
const txtAssign = l10n.l('pageRequest.assign', "Assign");
const txtDeassign = l10n.l('pageRequest.return', "Return");
const txtReassign = l10n.l('pageRequest.reassign', "Reassign");
const txtClose = l10n.l('pageRequest.close', "Close");
const txtReopen = l10n.l('pageRequest.reopen', "Reopen");

class PageTicketsTicketContent {
	constructor(module, ticket, toggle, opt) {
		opt = opt || {};
		this.module = module;
		this.ticket = ticket;
		this.toggle = toggle;
		this.player = this.module.player.getPlayer();
		this.isClosed = opt.isClosed || false;
	}

	render(el) {
		let subcomponents = {
			msg: new Elem(n => n.elem('div', { className: 'badge--text' }, [
				n.component(new ModelHtml(this.ticket, m => formatText(m.msg), { tagName: 'span', className: 'common--formattext' })),
			])),
			comment: new Elem(n => n.elem('button', { className: 'iconbtn tiny solid tinyicon flex-auto', events: {
				click: (el, e) => {
					this._comment();
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('comment')),
			])),
			reopen: !this.isClosed ? null : new Elem(n => n.elem('button', { className: 'btn icon-left tiny flex-1 warning', events: {
				click: (el, e) => {
					this._reopen();
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('refresh')),
				n.component(new Txt(txtReopen)),
			])),
			assign: this.isClosed ? null : new Elem(n => n.elem('button', { className: 'btn icon-left tiny primary flex-1' + (this.isClosed ? ' hide' : ''), events: {
				click: (el, e) => {
					this._assign();
					e.stopPropagation();
				},
			}}, [
				n.component('icon', new FAIcon('user-plus')),
				n.component('txt', new Txt(txtAssign)),
			])),
			close: this.isClosed ? null : new Elem(n => n.elem('button', { className: 'btn icon-left tiny flex-1 warning', events: {
				click: (el, e) => {
					this._close();
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('times')),
				n.component(new Txt(txtClose)),
			])),
		};

		this.elem = new ModelComponent(
			this.ticket,
			new ModelComponent(
				this.player,
				new Elem(n => n.elem('div', { className: 'badge--margin' }, [
					n.component('puppeteer', new Collapser()),
					n.elem('div', { className: 'flex-row' }, [
						n.component(new Txt(txtSent, { className: 'badge--iconcol badge--subtitle' })),
						n.component(new ModelTxt(this.ticket, m => formatDateTime(new Date(m.created)), {
							className: 'badge--info badge--text',
						})),
					]),
					n.component('msg', new Collapser()),
					n.component(new CollectionList(
						this.ticket.activities,
						m => new PageTicketsActivity(this.module, this.ticket, m),
					)),
					n.elem('div', { className: 'badge--divider' }),
					n.elem('div', { className: 'flex-row margin4' }, [
						n.component(subcomponents.comment),
						n.component(subcomponents.reopen),
						n.component(subcomponents.assign),
						n.component(subcomponents.close),
					]),
				])),
				(m, c) => this._setButtons(subcomponents),
			),
			(m, c, change) => {
				this._setButtons(subcomponents);
				if (!change || change.hasOwnProperty('puppeteer')) {
					c.getComponent().getNode('puppeteer').setComponent(m.puppeteer
						? new Elem(n => n.elem('div', { className: 'flex-row badge--margin' }, [
							n.component(new Txt(l10n.l('pageTickets.ctrl', "Ctrl"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(m.puppeteer, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageTickets.unknown', "(Unknown)")), {
								className: 'badge--info badge--text',
							})),
						]))
						: null,
					);
				}
				c.getComponent().getNode('msg').setComponent(m.msg ? subcomponents.msg : null);
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

	_setButtons(c) {
		let isAssigned = this._isAssigned();
		if (c.assign) {
			c.assign.getNode('icon').setIcon(this.ticket.assigned
				? isAssigned
					? 'user-times'
					: 'user-plus'
				: 'user-plus',
			);
			c.assign.getNode('txt').setText(this.ticket.assigned
				? isAssigned
					? txtDeassign
					: txtReassign
				: txtAssign,
			);
		}
		if (c.close) {
			c.close.setProperty('disabled', isAssigned
				? null
				: 'disabled',
			);
		}
	}

	_isAssigned() {
		return this.ticket.assigned &&
			this.player.mainChar &&
			this.player.mainChar.id == this.ticket.assigned.id;
	}

	_assign() {
		return Promise.resolve(this.ticket.assigned
			? this._isAssigned()
				? this.ticket.call('deassign')
				: this._reassign()
			: this.ticket.call('assign'),
		).catch(err => this.module.toaster.openError(err));
	}

	_reassign() {
		this.module.confirm.open(
			() => this.ticket.call('assign', { force: true })
				.catch(err => this.module.toaster.openError(err)),
			{
				title: l10n.l('pageTickets.confirmReassign', "Confirm reassign ticket"),
				body: new ModelComponent(
					this.ticket,
					new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('pageTickets.reassignBody', "You wish to reassign the ticket to you from current helper?"), { tagName: 'p' })),
						n.elem('p', [
							n.component('assigned', new ModelTxt(null, m => m ? (m.name + ' ' + m.surname).trim() : '', { className: 'dialog--strong' })),
						]),
					])),
					(m, c) => c.getNode('assigned').setModel(m.assigned),
				),
				confirm: l10n.l('pageTickets.delete', "Reassign"),
			},
		);
	}

	_comment() {
		this.module.dialogCommentTicket.open(this.ticket);
	}

	_reopen() {
		this.module.dialogReopenTicket.open(this.ticket);
	}

	_close() {
		this.module.dialogCloseTicket.open(this.ticket);
	}
}

export default PageTicketsTicketContent;
