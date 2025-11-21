import { Context, Elem } from 'modapp-base-component';
import { CollectionWrapper } from 'modapp-resource';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
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
		this.elem = new ModelComponent(
			this.module.mode.getModel(),
			new Elem(n => n.elem('div', { className: 'routerealms-realms' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [
					n.component(new PageHeader(l10n.l('routeRealms.realms', "Realms"), "", { className: 'flex-1' })),
					n.component(new Context(
						() => new CollectionWrapper(this.module.self.getTools(), {
							filter: t => t.type == 'nav',
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => t.componentFactory(this.model),
							{
								subClassName: t => t.className || null,
							},
						),
					)),
				]),

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
			])),
			// Reload state on mode change
			(m, c, change) => change && this.module.self.reloadState(),
		);

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
