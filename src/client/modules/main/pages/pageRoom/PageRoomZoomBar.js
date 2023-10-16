import { Elem } from 'modapp-base-component';;
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';


function getAreaId(area) {
	return area ? area.id : null;
}

/**
 * PageRoomZoomBar renders the zoom bar.
 */
class PageRoomZoomBar {
	constructor(module, areas, stateModel) {
		this.module = module;
		this.areas = areas;
		this.stateModel = stateModel;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.stateModel,
			new Elem(n => n.elem('div', { className: 'pageroom-zoombar' }, [
				n.elem('div', { className: 'pageroom-zoombar--zoomin' }, [
					n.elem('zoomin', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(-1) }}, [
						n.component(new FAIcon('search-plus')),
					]),
				]),
				n.component(new CollectionList(this.areas, area => new ModelComponent(
					this.stateModel,
					new Elem(n => n.elem('div', { className: 'pageroom-zoombar--area' }, [
						n.elem('bar', 'div', {
							className: 'pageroom-zoombar--bar',
							events: { click: () => this.stateModel.set({ areaId: getAreaId(area) }) },
						}),
					])),
					(m, c) => c[getAreaId(area) == m.areaId ? 'addNodeClass' : 'removeNodeClass']('bar', 'current'),
				), {
					className: 'pageroom-zoombar--areas',
					duration: 600,
					horizontal: true,
				})),
				n.elem('div', { className: 'pageroom-zoombar--zoomout' }, [
					n.elem('zoomout', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(1) }}, [
						n.component(new FAIcon('search-minus')),
					]),
				]),
			])),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('areaId')) return;

				let idx = this._getAreaIndex();
				c.setNodeProperty('zoomin', 'disabled', idx > 0 ? null : 'disabled');
				c.setNodeProperty('zoomout', 'disabled', idx < (this.areas.length - 1) ? null : 'disabled');
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

	_getAreaIndex() {
		let areaId = this.stateModel.areaId;
		let idx = 0;
		for (let a of this.areas) {
			if (areaId == getAreaId(a)) {
				return idx;
			}
			idx++;
		}
		return -1;
	}

	_zoom(dir) {
		let idx = this._getAreaIndex();
		if (idx < 0) {
			idx = 0;
		} else {
			idx += dir;
			if (idx < 0) {
				idx = 0;
			}
			if (idx >= this.areas.length) {
				idx = this.areas.length - 1;
			}
		}

		this.stateModel.set({ areaId: getAreaId(this.areas[idx]) });
	}
}

export default PageRoomZoomBar;
