import { Elem, Txt, Context, Input, Textarea } from 'modapp-base-component';
import { ModifyModel, CollectionWrapper } from 'modapp-resource';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';

/**
 * RouteRealmSettingsRealm draws the settings form for a realm.
 */
class RouteRealmSettingsRealm {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Context(
			() => new ModifyModel(this.realm, {
				eventBus: this.module.self.app.eventBus,
			}),
			realm => realm.dispose(),
			realm => new Elem(n => n.elem('div', { className: 'routerealmsettings-realm' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [
					n.component(new PageHeader(l10n.l('routeRealmSettings.realmSettings', "Realm settings"), "", { className: 'flex-1' })),
					n.elem('div', { className: 'flex-col' }, [
						n.elem('button', {
							className: 'btn fa small',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.router.setRoute('realms', { realmId: this.realm.id });
								},
							},
						}, [
							n.component(new FAIcon('angle-left')),
							n.component(new Txt(l10n.l('routeRealmSettings.backToRealms', "Back to Realms"))),
						]),
					]),
				]),
				n.elem('div', { className: 'common--hr' }),

				// Section tools
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => t.type == 'topSection',
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => t.componentFactory(realm),
						{
							subClassName: t => t.className || null,
						},
					),
				)),

				// Name
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.realmName', "Realm name"),
					new ModelComponent(
						realm,
						new Input("", {
							events: { input: c => realm.set({ name: c.getValue() }) },
							attributes: { name: 'routerealmsettings-name', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeRealmSettings.nameInfo', "Realm name is the primary name for the realm."),
					},
				)),

				// Description
				n.component(new PanelSection(
					l10n.l('routeRealmSettings.description', "Description"),
					new ModelComponent(
						realm,
						new Textarea(realm.desc, {
							className: 'common--paneltextarea-small common--desc-size',
							events: { input: c => realm.set({ desc: c.getValue() }) },
							attributes: { name: 'routerealmsettings-desc', spellcheck: 'true' },
						}),
						(m, c) => c.setValue(m.desc),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Section tools
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => !t.type || t.type == 'section',
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => t.componentFactory(realm),
						{
							subClassName: t => t.className || null,
						},
					),
				)),

				// Message
				n.component(this.messageComponent),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary common--btnwidth',
								events: {
									click: () => this._save(realm),
								},
							}, [
								n.component(new Txt(l10n.l('routeRealmSettings.saveChanges', "Save changes"))),
							])),
							(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
						)),
					]),
					n.elem('div', { className: 'flex-auto' }, [

						// Footer tools
						n.component(new Context(
							() => new CollectionWrapper(this.module.self.getTools(), {
								filter: t => t.type == 'footer',
							}),
							tools => tools.dispose(),
							tools => new CollectionList(
								tools,
								t => t.componentFactory(realm),
								{
									horizontal: true,
									className: 'routerealmsettings-realm--footertools',
									subClassName: t => t.className || null,
								},
							),
						)),

					]),

				]),

			])),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}

	_save(model) {
		let params = model.getModifications();
		if (!params) {
			return;
		}

		// Prepare params from tools
		for (let tool of this.module.self.getTools()) {
			params = tool.onSave?.(params) || params;
		}

		this._setMessage();
		return this.realm.call('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}
}

export default RouteRealmSettingsRealm;
