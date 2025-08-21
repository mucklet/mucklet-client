import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
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
					n.component(new ModelTxt(this.realm, m => m.apiVersionName, { className: 'badge--text badge--info-morepad' })),
				]),
			]),
			n.elem('div', { className: 'badge--select badge--select' }, [
				n.elem('button', { className: 'iconbtn medium', events: {
					click: (c, ev) => {
						ev.stopPropagation();
						this.module.routeRealmSettings.setRoute({ realmId: this.realm.id });
					},
				}}, [
					n.component(new FAIcon('cog')),
				]),
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
