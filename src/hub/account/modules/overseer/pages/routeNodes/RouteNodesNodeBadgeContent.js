import { Context, Elem } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';

class RouteNodesNodeBadgeContent {
	constructor(module, node) {
		this.module = module;
		this.node = node;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routenodes-nodebadgecontent badge--margin badge--select' }, [
			// Button tools
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (!t.type || t.type == 'button') && (!t.condition || t.condition(this.node)),
				}),
				tools => tools.dispose(),
				tools => new ModelComponent(
					this.node,
					new CollectionList(
						tools,
						t => t.componentFactory(this.node),
						{
							className: 'routenodes-nodebadgecontent--tools flex-1',
							subClassName: t => t.className || null,
							horizontal: true,
						},
					),
					(m, c, change) => change && tools.refresh(), // Refresh because the filter conditions might have changed.
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

export default RouteNodesNodeBadgeContent;
