import { Elem, Transition } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import arraysEqual from 'utils/arraysEqual';
import ModelFader from 'components/ModelFader';
import ModelCollapser from 'components/ModelCollapser';

import { roomInfo, areaInfo } from './pageRoomTxt';
import PageRoomZoomBar from './PageRoomZoomBar';
import PageRoomRoom from './PageRoomRoom.js';

/**
 * PageRoomComponent is the default component for the room panel. It listens on
 * the character, the room they are in, and creates a list of the area and its
 * ancestors.
 */
class PageRoomComponent {
	constructor(module, ctrl, stateModel, layout, setTitle) {
		this.module = module;
		this.ctrl = ctrl;
		this.stateModel = stateModel;
		this.layout = layout;
		this.setTitle = setTitle;

		// Bind callbacks
		this._updateModel = this._updateModel.bind(this);
	}

	render(el) {
		this.model = new Model({
			data: { current: null, areas: [] },
			eventBus: this.module.self.app.eventBus,
		});
		this._updateModel(this.stateModel.areaId);
		this._setTitle();

		let component = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new Elem(n => n.elem('div', { className: 'pageroom' }, [
					// Zoom bar
					n.component(new ModelCollapser(this.model, [{
						condition: m => m.areas.length > 1,
						factory: m => new PageRoomZoomBar(this.module, m.areas, this.stateModel),
						hash: m => m.areas,
					}], { duration: 150 })),
					// Transition area
					n.component(new ModelComponent(
						this.model,
						new Transition(null, { duration: 150 }),
						(m, c, change) => {
							if (!change || change.hasOwnProperty('current')) {
								let cb = 'fade';
								if (change && !change.hasOwnProperty('areas')) {
									let before = m.areas.indexOf(change.current);
									let after = m.areas.indexOf(m.current);
									if (before >= 0 && after >= 0 && before != after) {
										cb = after - before > 0 ? 'slideLeft' : 'slideRight';
									}
								}
								c[cb](m.current
									? this.module.self.getAreaComponentFactory()?.(this.ctrl, m.current, this.stateModel, this.layout)
									: new ModelFader(this.ctrl, [
										{
											factory: m => new PageRoomRoom(this.module, this.ctrl, m.inRoom, this.stateModel, this.layout),
											condition: m => m.inRoom, // Should always be true though
											hash: m => m.inRoom,
										},
									]),
								);
								this._setTitle();
							}
						},
					)),
				])),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('area')) {
						this._updateModel();
					}
				},
			),
			(m, c) => c.setModel(m.inRoom),
		);

		this.elem = new ModelComponent(
			this.stateModel,
			component,
			(m, c, change) => {
				if (change?.hasOwnProperty('areaId') && this.model.current?.id != m.areaId) {
					this._updateModel(m.areaId);
				}
			},
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.stateModel.set({ areaId: (this.model.current?.id || null) });
			this._listenAreas(this.model.areas, []);
			this.model = null;
		}
	}

	getTitle() {
		return (this.model ? this.model.current : this.stateModel.areaId)
			? areaInfo
			: roomInfo;
	}

	_setTitle() {
		if (this.setTitle) {
			this.setTitle(this.getTitle());
		}
	}

	/**
	 * Updates the model
	 * @param {string?} [areaId] Area ID to try set as current. If not set, it will try to set current area ID.
	 */
	_updateModel(areaId) {
		if (!this.model) {
			return;
		}

		let areas = this._getAreas();
		if (arraysEqual(areas, this.model.areas)) {
			areas = this.model.areas;
		} else {
			this._listenAreas(this.model.areas, areas);
		}

		let current = this._getCurrent(typeof areaId == 'undefined' ? this._currentAreaId() : areaId, this.model.areas, areas);
		this.model.set({
			current,
			areas,
		});
		this.stateModel.set({ areaId: current?.id || null });
	}

	_listenAreas(before, after) {
		for (let b of before) {
			b?.off('change', this._updateModel);
		}
		for (let a of after) {
			a?.on('change', this._updateModel);
		}
	}

	_getAreas() {
		let list = [ null ];
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
		// Assert that we have areas
		if (areaId && after?.length > 1) {
			// If we were watching the room's current area, we will continue do
			// so even after entering a room belonging to a new area.
			if (before && before[1]?.id === areaId) {
				return after[1];
			}
			// Try to see if the area we used to watch still exists after the
			// changes. If so, select that area.
			for (let area of after) {
				if (area?.id == areaId) {
					return area;
				}
			}
		}
		// Default to show the room
		return null;
	}

	_currentAreaId() {
		return (this.model?.current?.id) || null;
	}

}

export default PageRoomComponent;
