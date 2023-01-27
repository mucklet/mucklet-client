import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import errString from 'utils/errString';
import PageReportsReportContent from './PageReportsReportContent';

const txtUnknown = l10n.l('pageReports.unknown', "(Unknown)");
const txtNotAssigned = l10n.l('pageReports.notAssigned', "Not assigned");

class PageReportsMessage {
	constructor(module, report, model, opt) {
		this.opt = opt;
		this.module = module;
		this.report = report;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.report,
			new Elem(n => n.elem('div', { className: 'pagereports-report' }, [
				n.elem('badge', 'div', { className: 'pagereports-report--badge badge btn margin4', events: {
					click: () => this._toggleInfo(),
				}}, [
					n.elem('div', { className: 'badge--select' }, [
						n.component(this.module.avatar.newAvatar(this.report.char, { size: 'small', className: 'badge--icon' })),
						n.elem('div', { className: 'badge--info' }, [
							n.elem('div', { className: 'badge--title badge--nowrap' }, [
								n.component(new ModelComponent(
									this.report.char,
									new Txt(),
									(m, c) => {
										c.setText((m.name + ' ' + m.surname).trim());
										c[m.deleted ? 'addClass' : 'removeClass']('badge--strikethrough');
									},
								)),
							]),
							n.component(new ModelComponent(
								this.report,
								new Fader(null, { className: 'badge--text' }),
								(m, c, change) => {
									if (change && !change.hasOwnProperty('assigned')) return;

									c.setComponent(m.assigned
										? new ModelTxt(m.assigned, m => errString(m, m => (m.name + ' ' + m.surname), txtUnknown), {
											className: 'badge--strong',
										})
										: new Txt(txtNotAssigned),
									);
								},
							)),
						]),
						n.elem('div', { className: 'badge--tools' }, [
							n.elem('button', { className: 'pagereports-report--copyid iconbtn medium tinyicon', events: {
								click: (c, ev) => {
									this.module.copyCharId.copy(this.report.char);
									ev.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('clipboard')),
							]),
						]),
					]),
					n.component(new ModelComponent(
						this.model,
						new Collapser(null),
						(m, c, change) => {
							if (change && !change.hasOwnProperty('reportId')) return;
							c.setComponent(m.reportId === this.report.getResourceId()
								? new PageReportsReportContent(this.module, this.report, (show) => this._toggleInfo(show), this.opt)
								: null,
							);
						},
					)),
				]),
			])),
			(m, c) => {
				c[m.assigned ? 'removeNodeClass' : 'addNodeClass']('badge', 'unassigned');
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_toggleInfo(show) {
		let rid = this.report.getResourceId();
		show = typeof show == 'undefined'
			? !this.model.reportId || this.model.reportId != rid
			: !!show;

		this.model.set({ reportId: show ? rid : null });
	}
}

export default PageReportsMessage;
