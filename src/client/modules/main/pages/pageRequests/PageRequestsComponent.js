import { Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import PageRequestsRequest from './PageRequestsRequest';

class PageRequestsComponent {
	constructor(module, incoming, outgoing, state, close) {
		this.module = module;
		this.incoming = incoming;
		this.outgoing = outgoing;
		state.incomingRequestId = state.incomingRequestId || null;
		state.outgoingRequestId = state.outgoingRequestId || null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'pagerequests' }, [
			n.component(new PanelSection(
				l10n.l('pageRequests.incoming', "Incoming"),
				new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(this.incoming, { compare: (a, b) => b.expires - a.expires }),
						incoming => incoming.dispose(),
						incoming => new CollectionList(
							incoming,
							m => new PageRequestsRequest(this.module, m, this.model, false),
						),
					)),
					// Placeholder text
					n.component(new CollectionComponent(
						this.incoming,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageRealm.noPending', "No incoming requests."), { className: 'common--nolistplaceholder' }),
						),
					)),
				])),
				{
					className: 'common--sectionpadding',
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageRequests.outgoing', "Outgoing"),
				new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(this.outgoing, { compare: (a, b) => b.expires - a.expires }),
						outgoing => outgoing.dispose(),
						outgoing => new CollectionList(
							outgoing,
							m => new PageRequestsRequest(this.module, m, this.model, true),
						),
					)),
					// Placeholder text
					n.component(new CollectionComponent(
						this.outgoing,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageRealm.noPending', "No outgoing requests."), { className: 'common--nolistplaceholder' }),
						),
					)),
				])),
				{
					className: 'common--sectionpadding',
				},
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

export default PageRequestsComponent;
