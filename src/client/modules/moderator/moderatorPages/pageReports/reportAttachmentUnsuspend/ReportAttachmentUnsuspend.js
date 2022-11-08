import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtType = l10n.l('reportAttachmentUnsuspend.type', "Type");
const txtUnsuspend = l10n.l('reportAttachmentUnsuspend.unsuspend', "Unsuspend");

/**
 * ReportAttachmentUnsuspend adds the unsuspend action report attachment type.
 */
class ReportAttachmentUnsuspend {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'unsuspend',
			componentFactory: (info, reporter) => new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
					n.component(new Txt(txtUnsuspend, { className: 'badge--info badge--text' })),
				]),
			])),
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('unsuspend');
	}
}

export default ReportAttachmentUnsuspend;
