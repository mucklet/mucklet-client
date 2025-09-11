import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteReleasesReleases from './RouteReleasesReleases';
import RouteReleasesRelease from './RouteReleasesRelease';

/**
 * RouteReleasesComponent draws a the releases route page.
 */
class RouteReleasesComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.release,
				factory: m => new RouteReleasesRelease(this.module, m, m.release),
				hash: m => m.release,
			},
			{
				condition: m => m.releases,
				factory: m => new RouteReleasesReleases(this.module, m, m.releases),
				hash: m => m.releases,
			},
			{
				factory: m => this.module.routeError.newError(l10n.l('routeReleases.errorLoadingRelease', "Error loading release"), m.error),
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

export default RouteReleasesComponent;
