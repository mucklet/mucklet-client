import { Context, Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';

/**
 * RouteOverviewComponent draws a the overview route page.
 */
class RouteOverviewComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		let user = this.module.auth.getUser();
		this.elem = new Elem(n => n.elem('div', { className: 'routeoverview' }, [
			n.component(new Txt(l10n.l('routeOverview.accountOverview', "Account overview"), { tagName: 'h2' })),
			n.elem('div', { className: 'common--hr' }),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.type == 'topSection',
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(user, this.state),
					{
						subClassName: t => t.className || null,
					},
				),
			)),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.type == 'section',
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(user, this.state),
					{
						className: 'pageplayersettings--preferences',
						subClassName: t => t.className || null,
					},
				),
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

export default RouteOverviewComponent;
