import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import { getApiState } from 'utils/apiStates';


class RouteNodeSettingsRealmBadgeContent {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routenodesettings-realmbadgecontent badge--margin badge--info badge--select badge--select-margin flex-end' }, [
			n.elem('div', { className: 'flex-1' }, [
				n.elem('div', { className: 'badge--select' }, [
					n.component(new Txt(l10n.l('routeNodeSettings.state', "State"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(this.realm, m => getApiState(m).text, { className: 'badge--text badge--info-morepad' })),
				]),
				n.elem('div', { className: 'badge--select' }, [
					n.component(new Txt(l10n.l('routeNodeSettings.img', "Client"), { className: 'badge--iconcol badge--subtitle' })),
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
			]),
			n.elem('div', { className: 'flex-auto' }, [
				// Settings
				n.elem('button', { className: 'iconbtn medium smallicon', events: {
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

export default RouteNodeSettingsRealmBadgeContent;
