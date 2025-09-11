import { Elem } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PageHeader from 'components/PageHeader';
import RouteRealmsRealmBadge from './RouteRealmsRealmBadge';
import RouteRealmsNoRealmsPlaceholder from './RouteRealmsNoRealmsPlaceholder';

/**
 * RouteRealmsRealms draws a list of realm badge components.
 */
class RouteRealmsRealms {
	constructor(module, model, realms, user) {
		this.module = module;
		this.model = model;
		this.realms = realms;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routerealms-realms' }, [
			n.component(new PageHeader(l10n.l('routeRealms.realms', "Realms"))),
			n.elem('div', { className: 'common--hr' }),
			n.component(new CollectionList(
				this.realms,
				m => new RouteRealmsRealmBadge(this.module, this.model, m),
				{
					className: 'routepayments-payments--list',
					subClassName: () => 'routepayments-payments--listitem',
				},
			)),
			n.component(new CollectionComponent(
				this.realms,
				new Collapser(),
				(col, c) => c.setComponent(col?.length ? null : new RouteRealmsNoRealmsPlaceholder()),
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

export default RouteRealmsRealms;
