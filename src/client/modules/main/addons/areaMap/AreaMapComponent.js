import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';
import AreaMapArea from './AreaMapArea';

/**
 * AreaMapComponent is an area map overlay component.
 */
class AreaMapComponent {

	constructor(module, ctrl, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
	}

	render(el) {
		let areaMap = null;

		this.elem = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new Fader(),
				(m, c) => {
					if (m && m.area) {
						if (areaMap) {
							areaMap.setArea(m.area);
						} else {
							areaMap = new AreaMapArea(this.module, this.ctrl, m.area, this.state);
						}
					} else {
						areaMap = null;
					}
					c.setComponent(areaMap);
				}
			),
			(m, c) => c.setModel(m && m.inRoom)
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

export default AreaMapComponent;
