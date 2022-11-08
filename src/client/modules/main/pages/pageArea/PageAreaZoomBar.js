import { Elem } from 'modapp-base-component';;
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

/**
 * PageAreaZoomBar renders the zoom bar.
 */
class PageAreaZoomBar {
	constructor(module, areas, model) {
		this.module = module;
		this.areas = areas;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', { className: 'pagearea-zoombar' }, [
				n.elem('div', { className: 'pagearea-zoombar--zoomin' }, [
					n.elem('zoomin', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(-1) }}, [
						n.component(new FAIcon('search-plus')),
					]),
				]),
				n.component('areas', new CollectionList(this.areas, area => new ModelComponent(
					this.model,
					new Elem(n => n.elem('div', { className: 'pagearea-zoombar--area' }, [
						n.elem('bar', 'div', {
							className: 'pagearea-zoombar--bar',
							events: { click: () => this.model.set({ current: area }) },
						}),
					])),
					(m, c) => c[area == m.current ? 'addNodeClass' : 'removeNodeClass']('bar', 'current'),
				), {
					className: 'pagearea-zoombar--areas',
					duration: 600,
					horizontal: true,
				})),
				n.elem('div', { className: 'pagearea-zoombar--zoomout' }, [
					n.elem('zoomout', 'button', { className: 'iconbtn medium', events: { click: () => this._zoom(1) }}, [
						n.component(new FAIcon('search-minus')),
					]),
				]),
			])),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('current')) return;

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
		let current = this.model.current;
		let idx = 0;
		for (let a of this.areas) {
			if (current == a) {
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

		this.model.set({ current: this.areas[idx] });
	}
}

export default PageAreaZoomBar;
