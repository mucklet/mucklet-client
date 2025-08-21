import ModelFader from 'components/ModelFader';
import RouteNodesNodes from './RouteNodesNodes';

/**
 * RouteNodesComponent draws a the nodes route page.
 */
class RouteNodesComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.nodes,
				factory: m => new RouteNodesNodes(this.module, m, m.nodes),
				hash: m => m.nodes,
			},
			{
				factory: m => new RouteNodesError(this.module, m.error),
				hash: m => m.error,
			},
		]);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteNodesComponent;
