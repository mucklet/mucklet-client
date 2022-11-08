import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import * as banReasons from 'utils/banReasons';

const txtType = l10n.l('reportAttachmentBan.type', "Type");
const txtBan = l10n.l('reportAttachmentBan.ban', "Ban");

/**
 * ReportAttachmentBan adds the ban action report attachment type.
 */
class ReportAttachmentBan {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'ban',
			componentFactory: (info, reporter) => new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
					n.component(new Txt(txtBan, { className: 'badge--info badge--text' })),
				]),
				n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelTxt(info, m => banReasons.toLocaleString(m.reason), { className: 'common--formattext' })),
				]),
			])),
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('ban');
	}
}

export default ReportAttachmentBan;
