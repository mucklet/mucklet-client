import { Elem, Transition, Context, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import PageReportsReport from './PageReportsReport';

const defaultLimit = 10;

class PageReportsClosed {
	constructor(module, state, close) {
		this.module = module;
		state.closed = state.closed || {};
		state.closed.reportId = state.closed.reportId || null;
		state.closed.offset = state.closed.offset || 0;
		state.closed.count = null;
		this.state = state.closed;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });

		let noReportsComponent = null;
		let reportsCountComponent = new Elem(n => n.elem('div', { className: 'pagereports-closed--page' }, [
			n.component(new Txt(l10n.l('pageReports.report', "Report"))),
			n.text(' '),
			n.component(new ModelTxt(this.model, m => m.offset + 1)),
			n.text(" – "),
			n.component(new ModelTxt(this.model, (m, c) => m.count
				? m.offset + (m.count > defaultLimit ? defaultLimit : m.count)
				: c.getText()
			))
		]));

		this.elem = new Elem(n => n.elem('div', { className: 'pagereports-closed' }, [
			n.component(new ModelComponent(
				this.model,
				new CollectionComponent(
					null,
					new Elem(n => n.elem('div', { className: 'pagereports-closed--head flex-row flex-center margin4' }, [
						n.component(new ModelComponent(
							this.model,
							new Fader(null, { className: 'flex-1' }),
							(m, c) => c.setComponent(m.reports
								? m.count || m.offset // If we have closed reports, or are on a later page.
									? reportsCountComponent
									: noReportsComponent = noReportsComponent || new Txt(l10n.l('pageReports.noReports', "No reports"), { className: 'common--placeholder' })
								: null
							)
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset < defaultLimit ? 0 : this.model.offset - defaultLimit)
							}}, [
								n.component(new FAIcon('angle-left')),
							])),
							(m, c) => c.setProperty('disabled', m.offset ? null : 'disabled')
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset + defaultLimit)
							}}, [
								n.component(new FAIcon('angle-right')),
							])),
							(m, c) => c.setProperty('disabled', m.count > defaultLimit ? null : 'disabled')
						)),
					])),
					(col, m) => this.model.set({ count: col ? col.length : null })
				),
				(m, c, change) => c.setCollection(m.reports)
			)),
			n.component('list', new Transition(null))
		]));
		this.elem.render(el);

		this._loadMail(this.model.offset);
	}

	unrender() {
		if (this.elem) {
			let m = this.model;
			Object.assign(this.state, { reportId: m.reportId, offset: m.offset });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_loadMail(offset) {
		if (!this.model || this.loadingOffset === offset) return;

		if (this.model.reports && this.offset === offset) {
			this.loadingOffset = null;
			return;
		}

		this.loadingOffset = offset;

		this.module.login.getLoginPromise().then(user => {
			if (!this.model || offset !== this.loadingOffset) return;
			this.module.api.get('report.reports.closed?offset=' + offset + '&limit=' + (defaultLimit + 1)).then(reports => {
				if (!this.model || offset !== this.loadingOffset) return;

				let m = this.model;
				let dir = offset - m.offset;
				let cb = m.reports
					? dir > 0
						? 'slideLeft'
						: dir < 0
							? 'slideRight'
							: 'fade'
					: 'fade';
				this.elem.getNode('list')[cb](new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(reports, { begin: 0, end: defaultLimit, eventBus: this.module.self.app.eventBus }),
						reports => reports.dispose(),
						reports => new CollectionList(
							reports,
							m => new PageReportsReport(this.module, m, this.model, { isClosed: true }),
							{ className: 'pagereports-closed--list' }
						)
					))
				])));

				this.loadingOffset = null;
				this.model.set({ reports, offset });
			});
		});
	}

	_getTo() {
		let m = this.model;
		if (m) {
			let ms = m.reports;
			if (ms) {
				return m.offset + (ms.length > defaultLimit ? defaultLimit : ms.length);
			}
		}
		return '...';
	}

	_setNextDisabled(c) {
		let m = this.model;
		c.setProperty('disabled', m && m.reports && m.reports.length > m.offset
			? null
			: 'disabled'
		);
	}
}

export default PageReportsClosed;
