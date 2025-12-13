import { Context, Elem } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import Collapser from 'components/Collapser';
import PageHeader from 'components/PageHeader';
import l10n from 'modapp-l10n';

/**
 * RouteOverviewComponent draws a the overview route page.
 */
class RouteOverviewComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
		this.state = {};
	}

	render(el) {
		let user = this.model.user;
		let ctx = this.model.ctx;
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'routeoverview' }, [
			n.component(new PageHeader(l10n.l('routeOverview.accountOverview', "Account overview"))),
			n.elem('div', { className: 'common--hr' }),
			n.elem('div', { className: 'flex-row m pad16' }, [
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => t.type == 'topSection',
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => {
							this._ensureCtx(t, ctx, user);
							return t.componentFactory(user, this.state[t.id] = this.state[t.id] || {}, ctx[t.id]);
						},
						{
							className: 'flex-50',
							subClassName: t => t.className || null,
						},
					),
				)),
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => t.type == 'supporterSection',
					}),
					tools => tools.dispose(),
					tools => new CollectionComponent(
						tools,
						new Collapser(null, { className: 'flex-50' }),
						(col, c) => c.setComponent(components.supporter = col.length
							? components.supporter || new CollectionList(
								tools,
								t => {
									this._ensureCtx(t, ctx, user);
									return t.componentFactory(user, this.state[t.id] = this.state[t.id] || {}, ctx[t.id]);
								},
								{
									className: 'routeoverview--supportersection',
									subClassName: t => t.className || null,
								},
							)
							: null,
						),
					),
				)),
			]),

		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_ensureCtx(tool, ctx, user) {
		if (!ctx[tool.id] && tool.createCtx) {
			let o = {};
			ctx[tool.id] = o;
			tool.createCtx(o, user);
		}
	}
}

export default RouteOverviewComponent;
