import { Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';

class PlayerTabsTab {
	constructor(module, tab, onClick) {
		this.module = module;
		this.tab = tab;
		this.onClick = onClick;
	}

	render(el) {
		this.elem = new ModelComponent(this.module.self.getModel(),
			new Elem(n => n.elem('div', { className: 'playertabs-tab' }, [
				n.component(this.tab.tabFactory(() => this.onClick(this.tab))),
			])),
			(m, c) => c[this.tab.id === m.tabId ? 'addClass' : 'removeClass']('active'),
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PlayerTabsTab;
