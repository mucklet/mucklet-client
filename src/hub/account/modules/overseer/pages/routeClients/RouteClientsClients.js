import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PageHeader from 'components/PageHeader';
import FAIcon from 'components/FAIcon';
import RouteClientsClientBadge from './RouteClientsClientBadge';
import RouteClientsNoClientsPlaceholder from './RouteClientsNoClientsPlaceholder';

/**
 * RouteClientsClients draws a list of client badge components.
 */
class RouteClientsClients {
	constructor(module, model, clients, user) {
		this.module = module;
		this.model = model;
		this.clients = clients;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routeclients-clients' }, [

			// Header
			n.elem('div', { className: 'flex-row flex-end' }, [
				n.component(new PageHeader(l10n.l('routeClients.clientReleases', "Client releases"), "", { className: 'flex-1' })),
				n.elem('div', { className: 'flex-col' }, [
					n.elem('button', {
						className: 'btn fa small',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.dialogCreateClient.open({
									onCreate: client => this.module.self.setRoute({ clientId: client.id }),
								});
							},
						},
					}, [
						n.component(new FAIcon('plus')),
						n.component(new Txt(l10n.l('routeClients.createClient', "Create client"))),
					]),
				]),
			]),

			// Divider
			n.elem('div', { className: 'common--hr' }),

			// Clients
			n.component(new CollectionList(
				this.clients,
				m => new RouteClientsClientBadge(this.module, this.model, m),
				{
					className: 'routepayments-payments--list',
					subClassName: () => 'routepayments-payments--listitem',
				},
			)),

			// No clients placeholder
			n.component(new CollectionComponent(
				this.clients,
				new Collapser(),
				(col, c) => c.setComponent(col?.length ? null : new RouteClientsNoClientsPlaceholder()),
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

export default RouteClientsClients;
