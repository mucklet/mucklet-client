import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';
import './dialogExportLog.scss';

class DialogExportLog {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'charLog', 'exportLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(char, timestamp) {
		if (this.dialog) return;

		this.dialog = new Dialog({
			title: l10n.l('dialogExportLog.exportLog', "Export log"),
			className: 'dialogexportlog',
			content: new Elem(n => n.elem('div', [
				n.component(new PanelSection(
					l10n.l('pageEditExit.character', "Character"),
					new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialog--strong' }),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.startingFrom', "From"),
					new Txt(formatDateTime(new Date(timestamp))),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onExport(char, timestamp) },
						className: 'btn primary icon-left dialog--btn',
					}, [
						n.component(new FAIcon('download')),
						n.component(new Txt(l10n.l('dialogexportlog.export', "Export"))),
					]),
				]),
			])),
			onClose: () => this._onClose(),
		});

		this.dialog.open();
		this.dialog.getContent().getNode('create').focus();
	}

	_onClose() {
		this.dialog = null;
	}

	_onExport(char, timestamp) {
		if (this.exportPromise) return this.exportPromise;

		this.exportPromise = this.module.exportLog.exportHtml(char, timestamp)
			.then(() => {
				if (this.dialog) {
					this.dialog.close();
				}
			})
			.catch(err => {
				if (!this.dialog) return;
				this._setMessage(l10n.l(err.code, err.message, err.data));
			}).then(() => {
				this.exportPromise = null;
			});

		return this.exportPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogExportLog;
