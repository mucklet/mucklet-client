import { Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';

class PlayerPanelFooter {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Context(
			() => new CollectionWrapper(this.module.playerTools.getFooterTools(), {
				filter: t => t.filter ? t.filter() : true
			}),
			tools => tools.dispose(),
			tools => new CollectionList(
				tools,
				t => t.componentFactory(),
				{
					className: 'playerpanel-footer flex-row flex-center',
					subClassName: t => t.className || null,
					horizontal: true,
				}
			)
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

export default PlayerPanelFooter;
