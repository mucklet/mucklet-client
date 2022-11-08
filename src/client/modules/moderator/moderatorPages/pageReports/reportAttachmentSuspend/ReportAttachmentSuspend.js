import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';

const txtType = l10n.l('reportAttachmentSuspend.type', "Type");
const txtSuspend = l10n.l('reportAttachmentSuspend.suspend', "Suspend");

/**
 * ReportAttachmentSuspend adds the suspend action report attachment type.
 */
class ReportAttachmentSuspend {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'suspend',
			componentFactory: (info, reporter) => new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
					n.component(new Txt(txtSuspend, { className: 'badge--info badge--text' })),
				]),
				n.elem('div', { className: 'badge--text' }, [
					n.component(new ModelTxt(info, m => m.reason, { className: 'common--formattext' })),
				]),
			])),
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('suspend');
	}
}

export default ReportAttachmentSuspend;
