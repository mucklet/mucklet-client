import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';
import counterString from 'utils/counterString';

class HubLayoutCounterMarker {
	constructor(model, countCallback, opt) {
		this.model = model;
		this.countCallback = countCallback;
		this.tagClassNameCallback = opt?.tagClassNameCallback || null;
	}

	render(el) {
		let tagClassName = '';
		let countComponent = new Elem(n => n.elem('div', { className: 'counter-standalone' }, [
			n.component('count', new Txt()),
		]));
		this.elem = new ModelComponent(
			this.model,
			new Fader(null, { className: 'hublayout-countermarker' }),
			(m, c) => {
				let count = this.countCallback(m);
				if (count > 0) {
					// Set count
					countComponent.getNode('count').setText(counterString(count));
					// Set classname
					let newTagClassName = this.tagClassNameCallback && this.tagClassNameCallback(this.model) || '';
					if (newTagClassName != tagClassName) {
						if (tagClassName) {
							countComponent.removeClass(tagClassName);
						}
						if (newTagClassName) {
							countComponent.addClass(newTagClassName);
						}
						tagClassName = newTagClassName;
					}
					c.setComponent(countComponent);
				} else {
					c.setComponent(null);
				}
			},
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

export default HubLayoutCounterMarker;
