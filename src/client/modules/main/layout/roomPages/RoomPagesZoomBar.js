import { Elem } from 'modapp-base-component';;
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';


function getAreaId(area) {
	return area ? area.id : null;
}

/**
 * RoomPagesZoomBar renders the zoom bar.
 */
class RoomPagesZoomBar {
	constructor(module, ctrlId, areas, model, opt) {
		this.module = module;
		this.ctrlId = ctrlId;
		this.areas = areas;
		this.model = model;
		this.opt = opt;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', { className: 'roompages-zoombar' + (this.opt?.className ? ' ' + this.opt?.className : '') }, [
				n.elem('div', { className: 'roompages-zoombar--zoomin' }, [
					n.elem('zoomin', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(-1) }}, [
						n.component(new FAIcon('search-plus')),
					]),
				]),
				n.component(new CollectionList(this.areas, area => new ModelComponent(
					this.model,
					new Elem(n => n.elem('div', { className: 'roompages-zoombar--area' }, [
						n.elem('bar', 'div', {
							className: 'roompages-zoombar--bar',
							events: { click: () => this.module.self.setArea(this.ctrlId, area?.id) },
						}),
					])),
					(m, c) => c[area == m.area ? 'addNodeClass' : 'removeNodeClass']('bar', 'current'),
				), {
					className: 'roompages-zoombar--areas',
					duration: 600,
					horizontal: true,
				})),
				n.elem('div', { className: 'roompages-zoombar--zoomout' }, [
					n.elem('zoomout', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(1) }}, [
						n.component(new FAIcon('search-minus')),
					]),
				]),
			])),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('area')) return;

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
		let area = this.model.area;
		let idx = 0;
		for (let a of this.areas) {
			if (area == a) {
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

		this.module.self.setArea(this.ctrlId, getAreaId(this.areas[idx]));
	}
}

export default RoomPagesZoomBar;
