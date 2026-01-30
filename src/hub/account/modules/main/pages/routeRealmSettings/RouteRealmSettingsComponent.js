import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteRealmSettingsRealm from './RouteRealmSettingsRealm';

/**
 * RouteRealmSettingsComponent draws a the realms route page.
 */
class RouteRealmSettingsComponent {
	constructor(module, model, realmStates) {
		this.module = module;
		this.model = model;
		this.realmStates = realmStates;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.realm,
				factory: m => {
					let state = this.realmStates[m.id] || {};
					this.realmStates[m.id] = state;
					return new RouteRealmSettingsRealm(this.module, m.realm, state);
				},
				hash: m => m.realm,
			},
			{
				factory: m => this.module.routeError.newError(l10n.l('routeRealmSettings.errorLoadingRealmSettings', "Error loading realm settings"), m.error),
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

export default RouteRealmSettingsComponent;
