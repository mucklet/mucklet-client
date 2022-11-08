import { Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import Dialog from 'classes/Dialog';
import './dialogCloseReport.scss';

class DialogCloseReport {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Open dialog to close a report.
	 * @param {Model} report Report model to close.
	 */
	open(report) {
		if (this.dialog) return;

		let model = new Model({ data: { comment: "" }, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogCloseReport.closeReport', "Close report"),
			className: 'dialogclosereport',
			content: new Elem(n => n.elem('div', [
				n.component(new ModelTxt(report.char, m => (m.name + " " + m.surname).trim(), { className: 'dialogclosereport--fullname flex-1' })),
				n.component('comment', new PanelSection(
					l10n.l('dialogCloseReport.comment', "Comment"),
					new Textarea(model.comment, {
						className: 'dialogclosereport--comment dialog--input common--paneltextarea-small common--desc-size',
						events: {
							input: c => model.set({ comment: c.getValue() }),
						},
						attributes: { name: 'dialogclosereport-comment', spellcheck: 'true' },
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogCloseReport.commentInfo', "Short comment on what had happened, and how it was resolved."),
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'dialog--footer' }, [
					n.elem('submit', 'button', {
						events: { click: () => this._closeReport(report, model) },
						className: 'btn primary dialogclosereport--submit',
					}, [
						n.component(new Txt(l10n.l('dialogCloseReport.closeReport', "Close report"))),
					]),
				]),
			])),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		this.dialog.getContent().getNode('comment').getComponent().getElement().focus();
	}

	_closeReport(report, model) {
		if (this.closePromise) return this.closePromise;

		report.call('close', {
			comment: model.comment.trim(),
		}).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
			this.module.toaster.open({
				title: l10n.l('dialogCloseReport.reportSent', "Report closed"),
				content: new Txt(l10n.l('dialogCloseReport.reportSend', "The report was closed.", char)),
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

export default DialogCloseReport;
