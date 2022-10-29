import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import arraysEqual from 'utils/arraysEqual';
import PageAreaZoom from './PageAreaZoom';

/**
 * PageAreaComponent listens on the room for area changes and renders the area.
 */
class PageAreaComponent {
	constructor(module, ctrl, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.close = close;

		// Bind callbacks
		this._updateModel = this._updateModel.bind(this);
	}

	render(el) {
		let areas = this._getAreas();
		this.model = new Model({ data: {
			current: this._getCurrent(this.state.areaId, null, areas),
			areas,
		}, eventBus: this.module.self.app.eventBus });
		this._listenAreas([], areas);

		this.elem = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new PageAreaZoom(this.module, this.ctrl, this.model, this.state, this.close),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('area')) {
						this._updateModel();
					}
				}
			),
			(m, c) => c.setModel(m.inRoom)
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.state.areaId = (this.model.current && this.model.current.id) || null;
			this._listenAreas(this.model.areas, []);
			this.model = null;
		}
	}

	_updateModel() {
		if (!this.model) {
			return;
		}

		let areas = this._getAreas();
		if (arraysEqual(areas, this.model.areas)) return;

		this._listenAreas(this.model.areas, areas);
		let current = this._getCurrent(this._currentAreaId(), this.model.areas, areas);
		if (!current) {
			this.model.set({ areas });
			this.close();
		} else {
			this.model.set({ current, areas });
		}
	}

	_listenAreas(before, after) {
		for (let b of before) {
			b.off('change', this._updateModel);
		}
		for (let a of after) {
			a.on('change', this._updateModel);
		}
	}

	_getAreas() {
		let list = [];
		let area = this.ctrl.inRoom && this.ctrl.inRoom.area;
		while (area) {
			list.push(area);
			area = area.parent;
		}
		return list;
	}

	// Gets the area that is to be set as current, depending on what areaId was
	// previous set as current, what areas we had before, and what areas we have
	// now.
	_getCurrent(areaId, before, after) {
		before = before || [];
		if (areaId && !(before.length > 0 && before[0].id === areaId)) {
			for (let area of after) {
				if (area.id == areaId) {
					return area;
				}
			}
		}
		return after.length > 0 ? after[0] : null;
	}

	_currentAreaId() {
		return (this.model && this.model.current && this.model.current.id) || null;
	}

}

export default PageAreaComponent;
