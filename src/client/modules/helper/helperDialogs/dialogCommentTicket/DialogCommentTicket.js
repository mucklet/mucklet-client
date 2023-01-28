import { Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import Dialog from 'classes/Dialog';
import './dialogCommentTicket.scss';

class DialogCommentTicket {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Open dialog to add a comment to a ticket.
	 * @param {Model} ticket Ticket model to comment.
	 */
	open(ticket) {
		if (this.dialog) return;


		let model = new Model({ data: { comment: "" }, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCommentTicket.addTicketComment', "Add ticket comment"),
			className: 'dialogcommentticket',
			content: new Elem(n => n.elem('div', [
				n.component(new ModelTxt(ticket.char, m => (m.name + " " + m.surname).trim(), { className: 'dialogcommentticket--fullname flex-1' })),
				n.component('comment', new PanelSection(
					l10n.l('dialogCommentTicket.comment', "Comment"),
					new Textarea(model.comment, {
						className: 'dialogcommentticket--comment dialog--input common--paneltextarea-small common--desc-size',
						events: {
							input: c => model.set({ comment: c.getValue() }),
						},
						attributes: { name: 'dialogcommentticket-comment', spellcheck: 'true' },
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer' }, [
					n.elem('submit', 'button', {
						events: { click: () => this._commentTicket(ticket, model) },
						className: 'btn primary dialogcommentticket--submit',
					}, [
						n.component(new Txt(l10n.l('dialogCommentTicket.commentTicket', "Add comment"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('comment').getComponent().getElement().focus();
	}

	_commentTicket(ticket, model) {
		if (this.closePromise) return this.closePromise;

		ticket.call('comment', {
			comment: model.comment.trim(),
		}).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.closePromise = null;
		});

		return this.closePromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogCommentTicket;
