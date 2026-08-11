import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteClientsNoClientsPlaceholder draws a the placeholder on no routes.
 */
class RouteClientsNoClientsPlaceholder extends RootElem {
	constructor() {
		super(n => n.elem('div', { className: 'routeclients-noclientsplaceholder' }, [
			n.component(new Txt(l10n.l('routeClients.noClientsDisclaimer', "There are currently no clients registered."), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteClientsNoClientsPlaceholder;
