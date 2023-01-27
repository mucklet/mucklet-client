import { Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import Dialog from 'classes/Dialog';
import './dialogCloseTicket.scss';

class DialogCloseTicket {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Open dialog to close a ticket.
	 * @param {Model} ticket Ticket model to close.
	 */
	open(ticket) {
		if (this.dialog) return;

		let model = new Model({ data: { comment: "" }, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCloseTicket.closeTicket', "Close ticket"),
			className: 'dialogcloseticket',
			content: new Elem(n => n.elem('div', [
				n.component(new ModelTxt(ticket.char, m => (m.name + " " + m.surname).trim(), { className: 'dialogcloseticket--fullname flex-1' })),
				n.component('comment', new PanelSection(
					l10n.l('dialogCloseTicket.comment', "Comment"),
					new Textarea(model.comment, {
						className: 'dialogcloseticket--comment dialog--input common--paneltextarea-small common--desc-size',
						events: {
							input: c => model.set({ comment: c.getValue() }),
						},
						attributes: { name: 'dialogcloseticket-comment', spellcheck: 'true' },
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCloseTicket.commentInfo', "Short comment on how the ticket was resolved."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer' }, [
					n.elem('submit', 'button', {
						events: { click: () => this._closeTicket(ticket, model) },
						className: 'btn primary dialogcloseticket--submit',
					}, [
						n.component(new Txt(l10n.l('dialogCloseTicket.closeTicket', "Close ticket"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('comment').getComponent().getElement().focus();
	}

	_closeTicket(ticket, model) {
		if (this.closePromise) return this.closePromise;

		ticket.call('close', {
			comment: model.comment.trim(),
		}).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
			this.module.toaster.open({
				title: l10n.l('dialogCloseTicket.ticketSent', "Ticket closed"),
				content: new Txt(l10n.l('dialogCloseTicket.ticketSend', "The ticket was closed.", char)),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			});
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

export default DialogCloseTicket;
