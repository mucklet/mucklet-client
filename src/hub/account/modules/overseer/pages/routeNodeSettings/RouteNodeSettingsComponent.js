import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
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
			{
				factory: m => this.module.routeError.newError(l10n.l('routeNodeSettings.errorLoadingNodeSettings', "Error loading node settings"), m.error),
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

export default RouteNodeSettingsComponent;
