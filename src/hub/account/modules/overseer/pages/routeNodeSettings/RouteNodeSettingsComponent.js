import ModelFader from 'components/ModelFader';
import RouteNodeSettingsNode from './RouteNodeSettingsNode';

/**
 * RouteNodeSettingsComponent draws a the nodes route page.
 */
class RouteNodeSettingsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.node,
				factory: m => new RouteNodeSettingsNode(this.module, m, m.node),
				hash: m => m.node,
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

export default RouteNodeSettingsComponent;
