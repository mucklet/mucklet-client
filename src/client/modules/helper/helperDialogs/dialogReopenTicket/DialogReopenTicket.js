import { Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import Dialog from 'classes/Dialog';
import './dialogReopenTicket.scss';

class DialogReopenTicket {
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
	 * Open dialog to reopen a ticket.
	 * @param {Model} ticket Ticket model to reopen.
	 */
	open(ticket) {
		if (this.dialog) return;

		let model = new Model({ data: { comment: "" }, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogReopenTicket.reopenTicket', "Reopen ticket"),
			className: 'dialogreopenticket',
			content: new Elem(n => n.elem('div', [
				n.component(new ModelTxt(ticket.char, m => (m.name + " " + m.surname).trim(), { className: 'dialogreopenticket--fullname flex-1' })),
				n.component('comment', new PanelSection(
					l10n.l('dialogReopenTicket.comment', "Comment"),
					new Textarea(model.comment, {
						className: 'dialogreopenticket--comment dialog--input common--paneltextarea-small common--desc-size',
						events: {
							input: c => model.set({ comment: c.getValue() }),
						},
						attributes: { name: 'dialogreopenticket-comment', spellcheck: 'true' },
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogReopenTicket.commentInfo', "Short comment on why the ticket is getting reopened."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer' }, [
					n.elem('submit', 'button', {
						events: { click: () => this._reopenTicket(ticket, model) },
						className: 'btn primary dialogreopenticket--submit',
					}, [
						n.component(new Txt(l10n.l('dialogReopenTicket.reopenTicket', "Reopen ticket"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('comment').getComponent().getElement().focus();
	}

	_reopenTicket(ticket, model) {
		if (this.closePromise) return this.closePromise;

		ticket.call('open', {
			comment: model.comment.trim(),
		}).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
			this.module.toaster.open({
				title: l10n.l('dialogReopenTicket.ticketReopened', "Ticket reopened"),
				content: new Txt(l10n.l('dialogReopenTicket.ticketReopenedInfo', "The ticket was reopened.", char)),
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

export default DialogReopenTicket;
