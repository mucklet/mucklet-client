import { Context } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';
import AreaChildrenModel from 'classes/AreaChildrenModel';

/**
 * OverlayNavArea is the badge and area map containercomponent.
 */
class OverlayNavArea {

	constructor(module, ctrl, area, model, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.area = null;
		this.model = model;
		this.state = state;

		this.setArea(area);
	}

	render(el) {
		this.elem = new ModelComponent(
			this.area,
			new Fader(null, { className: 'overlaynav-area' }),
			(m, c, change) => {
				if (!change || change.hasOwnProperty('image')) {
					this._setMap(m, c);
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

	setArea(area) {
		area = area || null;
		if (this.area != area) {
			this.area = area;
			if (this.elem) {
				this.elem.setModel(area);
			}
		}
		return this;
	}

	_setMap(area, c) {
		if (!area || !area.image) {
			return;
		}

		let state = this.state['area_' + area.id];
		if (!state) {
			state = {};
			this.state['area_' + area.id] = state;
		}

		c.setComponent(new Context(
			() => new AreaChildrenModel(this.ctrl, area, { eventBus: this.module.self.app.eventBus }),
			children => children.dispose(),
			children => this.module.pageArea.newImage(this.ctrl, area.id, area.image, children, this.model, state, {
				className: 'overlaynav-area--map',
				vw: 156,
				vh: 156,
				size: 'small',
			}),
		));
	}
}

export default OverlayNavArea;
