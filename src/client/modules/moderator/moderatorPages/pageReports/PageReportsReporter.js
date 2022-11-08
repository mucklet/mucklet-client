import { Elem, Txt } from 'modapp-base-component';
import { ModelHtml, ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';
import formatText from 'utils/formatText';
import errString from 'utils/errString';

const reporterTypeTexts = {
	report: l10n.l('pageReports.sent', "Sent"),
	comment: l10n.l('pageReports.comment', "Cmt."),
	close: l10n.l('pageReports.close', "Close"),
	reopen: l10n.l('pageReports.reopen', "Open"),
	action: l10n.l('pageReports.action', "Act."),
};

const txtReporterFrom = l10n.l('pageReports.from', "From");
const txtReporterMod = l10n.l('pageReports.mod', "Mod");
const txtType = l10n.l('pageReports.type', "Type");

class PageReportsReporter {
	constructor(module, reporter) {
		this.module = module;
		this.reporter = reporter;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pagereports-reporter' }, [
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'flex-row' }, [
				n.component(new ModelTxt(this.reporter, m => m.type == 'report' ? txtReporterFrom : txtReporterMod, { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.reporter.char, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageReports.unknown', "(Unknown)")), {
					className: 'badge--info badge--strong',
				})),
			]),
			n.component(new ModelComponent(
				this.reporter,
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('puppeteer')) {
						c.setComponent(m.puppeteer
							? new Elem(n => n.elem('div', { className: 'flex-row' }, [
								n.component(new Txt(l10n.l('pageReports.ctrl', "Ctrl"), { className: 'badge--iconcol badge--subtitle' })),
								n.component(new ModelTxt(m.puppeteer, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageReports.unknown', "(Unknown)")), {
									className: 'badge--info badge--text',
								})),
							]))
							: null,
						);
					}
				},
			)),
			n.elem('div', { className: 'flex-row' }, [
				n.component(new ModelTxt(this.reporter, m => this._reporterTypeText(m), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.reporter, m => formatDateTime(new Date(m.created)), {
					className: 'badge--info badge--text',
				})),
			]),
			n.elem('div', { className: 'badge--text' }, [
				n.component(new ModelHtml(this.reporter, m => formatText(m.msg), { tagName: 'span', className: 'common--formattext' })),
			]),
			n.component(new ModelComponent(
				this.reporter,
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('attachmentType') || change.hasOwnProperty('attachmentInfo')) {
						if (!m.attachmentType) {
							c.setComponent(null);
							return;
						}
						let typ = this.module.self.getAttachmentTypes().get(m.attachmentType);
						c.setComponent(typ
							? typ.componentFactory(m.attachmentInfo, m)
							: new Elem(n => n.elem('div', [
								n.elem('div', { className: 'flex-row' }, [
									n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
									n.component(new ModelTxt(this.reporter, m => m.attachmentType, {
										className: 'badge--info badge--text',
									})),
								]),
								n.component(new ModelTxt(m, m => m.attachmentInfo ? JSON.stringify(m.attachmentInfo, null, 2) : "", { tagName: 'pre', className: 'badge--text common--formattext' })),
							])),
						);
					}
				},
			)),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_reporterTypeText(reporter) {
		let typ = reporter.type;
		let atyp = reporter.attachmentType
			? this.module.self.getAttachmentTypes().get(reporter.attachmentType)
			: null;
		return (atyp && atyp.title) || reporterTypeTexts[typ] || reporterTypeTexts['report'];
	}
}

export default PageReportsReporter;
