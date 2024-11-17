import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';

/**
 * ReportAttachmentCharSnapshot adds the charSnapshot report attachment type.
 */
class ReportAttachmentCharSnapshot {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
			'dialogCharSnapshotAttachment',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'charSnapshot',
			componentFactory: (info, reporter) => {
				return new Elem(n => n.elem('div', { className: 'reportattachmentcharsnapshot badge--select badge--margin' }, [
					n.elem('button', {
						className: 'badge--faicon iconbtn smallicon solid',
						events: {
							click: (c, e) => {
								this.module.dialogCharSnapshotAttachment.open(info, reporter);
								e.stopPropagation();
							},
						},
					}, [
						n.component(new FAIcon('user')),
					]),
					n.elem('div', { className: 'badge--info' }, [
						n.elem('div', { className: 'badge--subtitle' }, [
							n.component(new Txt(l10n.l('reportAttachmentCharSnapshot.characterSnapshot', "Character snapshot"))),
						]),
						n.elem('div', { className: 'badge--text' }, [
							n.component(new ModelTxt(info, m => formatDateTime(new Date(m.timestamp)))),
						]),
					]),
				]));
			},
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('charSnapshot');
	}
}

export default ReportAttachmentCharSnapshot;
