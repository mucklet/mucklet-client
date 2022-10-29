import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import PageReportsReport from './PageReportsReport';
import PageReportsNoMain from './PageReportsNoMain';
import PageReportsClosed from './PageReportsClosed';

class PageReportsComponent {
	constructor(module, reports, state, close) {
		this.module = module;
		this.reports = reports;
		state.reportId = state.reportId || null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'pagereports' }, [
			n.component(new ModelComponent(
				this.module.player.getPlayer(),
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('mainChar')) {
						c.setComponent(m.mainChar && m.mainChar.id ? null : new PageReportsNoMain(this.module));
					}
				}
			)),
			n.component(new PanelSection(
				l10n.l('pageReports.reports', "Reported characters"),
				new Elem(n => n.elem('div', [
					n.component(new CollectionList(
						this.reports,
						m => new PageReportsReport(this.module, m, this.model)
					)),
					// Placeholder text
					n.component(new CollectionComponent(
						this.reports,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageReports.noReports', "Everything is peaceful."), { className: 'common--nolistplaceholder' })
						)
					))
				])),
				{
					className: 'common--sectionpadding'
				}
			)),
			n.component(new PanelSection(
				l10n.l('pageReports.closedReports', "Closed reports"),
				new PageReportsClosed(this.module, this.state),
				{
					className: 'common--sectionpadding'
				}
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageReportsComponent;
