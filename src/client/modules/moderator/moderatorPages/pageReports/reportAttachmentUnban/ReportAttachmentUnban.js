import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtType = l10n.l('reportAttachmentUnban.type', "Type");
const txtUnban = l10n.l('reportAttachmentUnban.unban', "Unban");

/**
 * ReportAttachmentUnban adds the unban action report attachment type.
 */
class ReportAttachmentUnban {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'unban',
			componentFactory: (info, reporter) => new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
					n.component(new Txt(txtUnban, { className: 'badge--info badge--text' })),
				]),
			]))
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('unban');
	}
}

export default ReportAttachmentUnban;
