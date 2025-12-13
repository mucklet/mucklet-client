import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteRealmBackupsRealm from './RouteRealmBackupsRealm';

/**
 * RouteRealmBackupsComponent draws a the realms route page.
 */
class RouteRealmBackupsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.realm,
				factory: m => new RouteRealmBackupsRealm(this.module, m.realm, m),
				hash: m => m.realm,
			},
			{
				factory: m => this.module.routeError.newError(l10n.l('routeRealmBackups.errorLoadingRealmBackups', "Error loading realm backups"), m.error),
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

export default RouteRealmBackupsComponent;
