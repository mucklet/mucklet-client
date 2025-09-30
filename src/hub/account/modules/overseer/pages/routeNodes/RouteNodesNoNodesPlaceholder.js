import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteNodesNoNodesPlaceholder draws a the placeholder on no routes.
 */
class RouteNodesNoNodesPlaceholder extends RootElem {
	constructor() {
		super(n => n.elem('div', { className: 'routenodes-nonodesplaceholder' }, [
			n.component(new Txt(l10n.l('routeNodes.disclaimer1', "There are currently no nodes registered."), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteNodesNoNodesPlaceholder;
