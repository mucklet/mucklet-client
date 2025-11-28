import { Elem, Txt, Context } from 'modapp-base-component';
import { ModelComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
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
				n.component(new ModelComponent(
					this.realm,
					new ModelComponent(
						null,
						new ModelFader(null, [{
							condition: next => !!next,
							factory: next => new Elem(n => n.elem('button', {
								className: 'btn primary medium icon-left common--btnwidth',
								events: {
									click: (c, ev) => {
										ev.stopPropagation();
										this._upgrade();
									},
								},
							}, [
								n.component(new FAIcon('arrow-circle-up')),
								n.component(new ModelTxt(next, m => l10n.l('overseerRealmSettings.upgradeVersion', "Upgrade v{version}", { version: m.name }))),
							])),
						}]),
						(m, c) => c.setModel(m?.next),
					),
					(m, c) => c.setModel(m?.release),
				)),
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

	_upgrade() {
		this.module.api.call(`control.realm.${this.realm.id}.details`, 'upgrade')
			.then(() => this.module.toaster.open({
				title: l10n.l('routeRealms.upgradingRealm', "Upgrading realm"),
				content: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('routeRealms.upgradingRealmBody1', "Realm is being upgraded."), { tagName: 'p' })),
					n.component(new Txt(l10n.l('routeRealms.upgradingRealmBody2', "Everything is most likely going smoothly."), { tagName: 'p' })),
				])),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}
}

export default RouteRealmsRealmBadgeContent;
