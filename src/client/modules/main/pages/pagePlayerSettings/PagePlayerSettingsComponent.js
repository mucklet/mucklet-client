import { Context, Elem } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class PagePlayerSettingsComponent {
	constructor(module, user, player, state, close) {
		this.module = module;
		this.user = user;
		this.identity = user.identity && !this.module.api.isError(user.identity) ? user.identity : null;
		this.player = player;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageplayersettings' }, [
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.type == 'topSection',
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(this.user, this.player, this.state),
					{
						subClassName: t => t.className || null,
					},
				),
			)),
			n.component(new PanelSection(
				l10n.l('pagePlayerSettings.preferences', "Preferences"),
				new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(this.module.self.getTools(), {
							filter: t => !t.type || t.type == 'preference',
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => t.componentFactory(this.user, this.player, this.state),
							{
								subClassName: t => t.className || null,
							},
						),
					)),
				])),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			)),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.type == 'section',
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(this.user, this.player, this.state),
					{
						className: 'pageplayersettings--preferences',
						subClassName: t => t.className || null,
					},
				),
			)),
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

export default PagePlayerSettingsComponent;
