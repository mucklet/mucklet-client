import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

class HubLayuoutMenuItem {
	constructor(module, route, opt) {
		this.module = module;
		this.route = route;
		this.itemId = opt?.itemid || 'menuitem-' + route.id;
		this.onClick = opt?.onClick || null;
		this.markerComponent = opt.markerComponent || null;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.module.router.getModel(),
			new Elem(n =>
				n.elem('button', {
					className: 'hublayout-menuitem',
					attributes: { id: this.itemId },
					events: { click: () => this.onClick(this.route) },
				}, [
					n.component(this.route.icon ? new FAIcon(this.route.icon) : null),
					n.component(new Txt(typeof this.route.name == 'function' ? this.route.name() : this.route.name, {
						className: 'hublayout-menuitem--name',
					})),
					n.component(this.markerComponent),
				]),
			),
			(m, c) => c[m.route?.id == this.route.id || m.route?.parentId === this.route.id
				? 'addClass'
				: 'removeClass'
			]('active'),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default HubLayuoutMenuItem;
