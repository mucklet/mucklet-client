import { Elem, Txt, Context } from 'modapp-base-component';
import { ModelComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';

class RouteRealmsRealmBadgeContent {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routerealms-realmbadgecontent badge--margin badge--select badge--select-margin' }, [
			n.elem('div', { className: 'flex-1' }, [
				n.elem('div', { className: 'badge--select' }, [
					n.component(new Txt(l10n.l('routeRealms.client', "Client"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelComponent(
						this.realm,
						new Txt("", {
							tagName: 'a',
							className: 'link routerealms-realmbadgecontent--link badge--text badge--info-morepad',
							events: {
								click: (c, ev) => ev.stopPropagation(),
							},
						}),
						(m, c) => {
							c.setText(m.clientUrl.replace(/\/$/, '').replace(/^.*:\/\//, ''));
							c.setAttribute('href', m.clientUrl);
						},
					)),
				]),
				n.elem('div', { className: 'badge--select' }, [
					n.component(new Txt(l10n.l('routeRealms.version', "Version"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(this.realm, m => m.versionName, { className: 'badge--text badge--info-morepad' })),
				]),
			]),
			n.elem('div', { className: 'badge--select badge--select-margin' }, [
				// Realm upgrade
				n.component(this.module.realmUpgrade.newButton(this.realm)),
				// Button tools
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => (!t.type || t.type == 'button') && (!t.condition || t.condition(this.realm)),
					}),
					tools => tools.dispose(),
					tools => new ModelComponent(
						this.realm,
						new CollectionList(
							tools,
							t => t.componentFactory(this.realm),
							{
								className: 'routerealms-realmbadgecontent--tools',
								subClassName: t => t.className || null,
								horizontal: true,
							},
						),
						(m, c, change) => change && tools.refresh(), // Refresh because the filter conditions might have changed.
					),
				)),

			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteRealmsRealmBadgeContent;
