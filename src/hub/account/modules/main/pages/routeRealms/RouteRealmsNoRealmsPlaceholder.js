import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteRealmsNoRealmsPlaceholder draws a the placeholder on no routes.
 */
class RouteRealmsNoRealmsPlaceholder extends RootElem {
	constructor() {
		super(n => n.elem('div', { className: 'routerealms-norealmsplaceholder' }, [
			n.component(new Txt(l10n.l('routeRealms.disclaimer1', "Want to create a realm of your own? This is where you will be able to manage them."), { tagName: 'p', className: 'common--placeholder' })),
			n.component(new Txt(l10n.l('routeRealms.disclaimer2', "... but we are still working on it."), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteRealmsNoRealmsPlaceholder;
