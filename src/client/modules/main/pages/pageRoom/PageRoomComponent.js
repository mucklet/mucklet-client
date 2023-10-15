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
	constructor(module, ctrl, state, layout, setTitle) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.layout = layout;
		this.setTitle = setTitle;

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
		this._setTitle();

		this.elem = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new Elem(n => n.elem('div', { className: 'pageroom' }, [
					// Zoom bar
					n.component(new ModelCollapser(this.model, [{
						condition: m => m.areas.length,
						factory: m => new PageRoomZoomBar(this.module, m.areas, m),
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
									? this.module.self.getAreaComponentFactory()?.(this.ctrl, m.current, this.state, this.layout)
									: new ModelFader(this.ctrl, [
										{
											factory: m => new PageRoomRoom(this.module, this.ctrl, m.inRoom, this.state, this.layout),
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

	_setTitle() {
		if (this.model && this.setTitle) {
			this.setTitle(this.model.current
				? areaInfo
				: roomInfo,
			);
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
		return (this.model?.current?.id) || null;
	}

}

export default PageRoomComponent;


// import ModelFader from 'components/ModelFader';
// import PageRoomRoom from './PageRoomRoom.js';

// /**
//  * PageRoomComponent renders a room info page.
//  */
// class PageRoomComponent {
// 	constructor(module, ctrl, state, layout) {
// 		this.module = module;
// 		this.ctrl = ctrl;
// 		this.state = state;
// 		this.layout = layout;
// 	}

// 	render(el) {
// 		this.elem = new ModelFader
// 		this.elem = new ModelFader(this.ctrl, [
// 			{
// 				factory: m => new PageRoomRoom(this.module, this.ctrl, m.inRoom, this.state, this.layout),
// 				condition: m => m.inRoom,
// 				hash: m => m.inRoom,
// 			},
// 		]);
// 		return this.elem.render(el);
// 	}

// 	unrender() {
// 		if (this.elem) {
// 			this.elem.unrender();
// 			this.elem = null;
// 		}
// 	}
// }

// export default PageRoomComponent;
