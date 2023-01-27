import { Elem } from 'modapp-base-component';
import { ModelHtml } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';

let types = [
	{ id: 'request', typeTxt: l10n.l('ticketActivityComment.request', "Req."), fromTxt: l10n.l('ticketActivityComment.from', "From") },
	{ id: 'comment', typeTxt: l10n.l('ticketActivityComment.comment', "Cmt.") },
	{ id: 'close', typeTxt: l10n.l('ticketActivityComment.close', "Close") },
	{ id: 'reopen', typeTxt: l10n.l('ticketActivityComment.open', "Open") },
];

/**
 * TicketActivityComment adds activity types that only contains a comment parameter.
 */
class TicketActivityComment {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageTickets',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		for (let t of types) {
			this.module.pageTickets.addActivityType({
				id: t.id,
				typeTxt: t.typeTxt,
				fromTxt: t.fromTxt,
				componentFactory: (params, activity) => new Elem(n => n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelHtml(params, m => formatText(m.comment), { tagName: 'span', className: 'common--formattext' })),
				])),
			});
		}
	}

	dispose() {
		for (let t of types) {
			this.module.pageTickets.removeActivityType(t.id);
		}
	}
}

export default TicketActivityComment;
