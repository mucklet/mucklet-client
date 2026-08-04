import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteClientsClients from './RouteClientsClients';
import RouteClientsClient from './RouteClientsClient';

/**
 * RouteClientsComponent draws a the clients route page.
 */
class RouteClientsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.clients,
				factory: m => new RouteClientsClients(this.module, m, m.clients),
				hash: m => m.clients,
			},
			{
				condition: m => m.client,
				factory: m => new RouteClientsClient(this.module, m.client),
				hash: m => m.client,
			},
			{
				factory: m => this.module.routeError.newError(l10n.l('routeClients.errorLoadingClients', "Error loading clients"), m.error),
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

export default RouteClientsComponent;
