import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteRealmsRealms from './RouteRealmsRealms';

/**
 * RouteRealmsComponent draws a the realms route page.
 */
class RouteRealmsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.realms,
				factory: m => new RouteRealmsRealms(this.module, m, m.realms, m.user),
				hash: m => m.realms,
			},
			{
				factory: m => this.module.routeError.newError(l10n.l('routeRealms.errorLoadingRealms', "Error loading realms"), m.error),
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

export default RouteRealmsComponent;
