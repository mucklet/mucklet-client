import { Elem, Txt } from 'modapp-base-component';
import { ModelHtml } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import './reportAttachmentWarn.scss';

const txtType = l10n.l('reportAttachmentWarn.type', "Type");
const txtWarning = l10n.l('reportAttachmentWarn.warning', "Warning");
const txtModerator = l10n.l('reportAttachmentWarn.moderator', "Moderator");

/**
 * ReportAttachmentWarn adds the warn action report attachment type.
 */
class ReportAttachmentWarn {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'warn',
			componentFactory: (info, reporter) => new Elem(n => {
				let text = [];
				if (info.pose) {
					text.push(n.component(new Txt(txtModerator, { className: 'reportattachmentwarn--char' })));
					if (info.msg[0] !== "'") {
						text.push(n.text(' '));
					}
				}
				text.push(n.component(new ModelHtml(info, m => formatText(m.msg), { tagName: 'span', className: 'common--formattext reportattachmentwarn--msg' })));

				return n.elem('div', [
					n.elem('div', { className: 'flex-row' }, [
						n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
						n.component(new Txt(txtWarning, { className: 'badge--info badge--text' })),
					]),
					n.elem('div', { className: 'badge--text' }, text)
				]);
			})
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('warn');
	}
}

export default ReportAttachmentWarn;
