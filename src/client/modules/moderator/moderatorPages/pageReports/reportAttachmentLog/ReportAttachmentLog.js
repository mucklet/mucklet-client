import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import formatTimeSpan from 'utils/formatTimeSpan';

/**
 * ReportAttachmentLog adds the log report attachment type.
 */
class ReportAttachmentLog {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
			'dialogLogAttachment',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'log',
			componentFactory: (info, reporter) => {
				return new Elem(n => n.elem('div', { className: 'reportattachmentlog badge--select badge--margin' }, [
					n.elem('button', {
						className: 'badge--faicon iconbtn smallicon solid',
						events: {
							click: (c, e) => {
								this.module.dialogLogAttachment.open(reporter);
								e.stopPropagation();
							},
						},
					}, [
						n.component(new FAIcon('file-text-o')),
					]),
					n.elem('div', { className: 'badge--info' }, [
						n.elem('div', { className: 'badge--subtitle' }, [
							n.component(new Txt(l10n.l('reportAttachmentLog.eventLog', "Event log"))),
						]),
						n.elem('div', { className: 'badge--text' }, [
							n.component(new ModelTxt(info, m => formatTimeSpan(new Date(m.startTime), new Date(m.endTime)))),
						]),
					]),
				]));
			},
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('log');
	}
}

export default ReportAttachmentLog;
