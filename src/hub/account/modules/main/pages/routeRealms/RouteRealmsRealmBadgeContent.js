import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

class RouteRealmsRealmBadgeContent {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routerealms-realmbadgecontent badge--margin badge--select' }, [
			n.elem('button', { className: 'badge--faicon iconbtn medium solid', events: {
				click: (c, ev) => {
					ev.stopPropagation();
					this.module.routeRealmSettings.setRoute({ realmId: this.realm.id });
				},
			}}, [
				n.component(new FAIcon('cog')),
			]),
			n.elem('div', { className: 'badge--info small' }, [
				n.component(new ModelComponent(
					this.realm,
					new Txt("", {
						tagName: 'a',
						className: 'link routerealms-realmbadgecontent--link badge--text',
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
