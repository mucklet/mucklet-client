import ModelFader from 'components/ModelFader';
import RouteEditRealmRealm from './RouteEditRealmRealm';

/**
 * RouteEditRealmComponent draws a the realms route page.
 */
class RouteEditRealmComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.realm,
				factory: m => new RouteEditRealmRealm(this.module, m.realm),
				hash: m => m.realm,
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

export default RouteEditRealmComponent;
