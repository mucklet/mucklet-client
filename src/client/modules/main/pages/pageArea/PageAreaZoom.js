import { Elem, Transition } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';

import PageAreaZoomBar from './PageAreaZoomBar';
import PageAreaArea from './PageAreaArea';

/**
 * PageAreaZoom is a container component handling the zoom and area transitions.
 */
class PageAreaZoom {
	constructor(module, ctrl, model, state, close) {
		this.module = module;
		this.ctrl = ctrl;
		this.model = model;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.zoombar = new Fader();
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', { className: 'pagearea-zoom' }, [
				n.component('bar', new Fader(null, { className: 'pagearea-zoom--bar', duration: 150 })),
				n.component('area', new Transition(null, { className: 'pagearea-zoom--area', duration: 150 })),
			])),
			(m, c, change) => {
				// Zoom bar
				if (!change || change.hasOwnProperty('areas')) {
					c.getNode('bar').setComponent(m.areas.length > 1
						? new PageAreaZoomBar(this.module, m.areas, m)
						: null,
					);
				}
				// Area transition
				if (!change || change.hasOwnProperty('current')) {
					let cb = 'fade';
					if (change && !change.hasOwnProperty('areas')) {
						let before = m.areas.indexOf(change.current);
						let after = m.areas.indexOf(m.current);
						if (before >= 0 && after >= 0 && before != after) {
							cb = after - before > 0 ? 'slideLeft' : 'slideRight';
						}
					}
					c.getNode('area')[cb](m.current
						? new PageAreaArea(this.module, this.ctrl, m.current, this.state, this.close)
						: null,
					);
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

export default PageAreaZoom;
