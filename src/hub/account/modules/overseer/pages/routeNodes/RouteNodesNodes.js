import { Elem } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PageHeader from 'components/PageHeader';
import RouteNodesNodeBadge from './RouteNodesNodeBadge';
import RouteNodesNoNodesPlaceholder from './RouteNodesNoNodesPlaceholder';

/**
 * RouteNodesNodes draws a list of node badge components.
 */
class RouteNodesNodes {
	constructor(module, model, nodes, user) {
		this.module = module;
		this.model = model;
		this.nodes = nodes;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routenodes-nodes' }, [
			n.component(new PageHeader(l10n.l('routeNodes.nodes', "Nodes"))),
			n.elem('div', { className: 'common--hr' }),
			n.component(new CollectionList(
				this.nodes,
				m => new RouteNodesNodeBadge(this.module, this.model, m),
				{
					className: 'routepayments-payments--list',
					subClassName: () => 'routepayments-payments--listitem',
				},
			)),
			n.component(new CollectionComponent(
				this.nodes,
				new Collapser(),
				(col, c) => c.setComponent(col?.length ? null : new RouteNodesNoNodesPlaceholder()),
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
}

export default RouteNodesNodes;
