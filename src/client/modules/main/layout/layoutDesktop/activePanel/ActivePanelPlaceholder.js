import { Elem } from 'modapp-base-component';
import { ModelHtml } from 'modapp-resource-component';

class ActivePanelPlaceholder {
	constructor(module, info) {
		this.module = module;
		this.info = info;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'activepanel-placeholder' }, [
			n.component(new ModelHtml(this.info, m => typeof m.greeting == 'undefined'
				? '<p>All characters are asleep.<br>Maybe we should wake someone up?</p>'
				: m.greeting,
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

export default ActivePanelPlaceholder;
