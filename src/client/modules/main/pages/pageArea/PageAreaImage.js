import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelFragment } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import Img from 'components/Img';
import FAIcon from 'components/FAIcon';
// import ImgModal from 'classes/ImgModal';
import objectDefault from 'utils/objectDefault';
import nextFrame from 'utils/nextFrame';

/**
 * PageAreaImage renders an area map image.
 */
class PageAreaImage {
	constructor(module, ctrl, areaId, image, children, selectedModel, state, opt) {
		opt = opt || {};
		this.module = module;
		this.ctrl = ctrl;
		this.areaId = areaId;
		this.image = image;
		this.children = children;
		this.selectedModel = selectedModel;
		this.vw = opt.vw || 286;
		this.vh = opt.vh || 286;
		this.state = objectDefault(state, {
			focus: 'current',
			scale: Math.max(0.5, this.vw / this.image.width, this.vh / this.image.height),
			x: this.image.width / 2,
			y: this.image.height / 2,
		});
		this.className = opt.className ? ' ' + opt.className : '';
		this.size = opt.size || '';

		// Bind callback
		this._endAction = this._endAction.bind(this);
		this._onMove = this._onMove.bind(this);
		this._onCtrlChange = this._onCtrlChange.bind(this);
		this._onSelectedChange = this._onSelectedChange.bind(this);
	}

	render(el) {
		this.model = new Model({
			data: {
				current: this._getLocation(),
				selected: this._getSelected(),
				focus: this.state.focus,
			},
			eventBus: this.module.self.app.eventBus,
		});
		this._listen(true);

		let btnSize = this.size == 'small' ? ' tiny' : ' small';

		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				null,
				new Elem(n => n.elem('div', {
					className: 'pagearea-image' + this.className + (this.size ? ' ' + this.size : ''),
					attributes: {
						style: 'width:' + this.vw + 'px; height:' + this.vh + 'px;',
					},
				}, [
					n.elem('body', 'div', { className: 'pagearea-image--body transition' }, [
						n.component('img', new Img(this.image.href, { className: 'pagearea-image--img', events: {
							// click: () => new ImgModal(this.image.href).open()
							mousedown: (c, ev) => {
								this._grab(ev.clientX, ev.clientY);
								ev.stopPropagation();
								return false;
							},
							dragstart: (c, ev) => ev.preventDefault(),
							drop: (c, ev) => ev.preventDefault(),
							wheel: (c, ev) => {
								this._zoom(0.98 ** (ev.deltaY / 10));
								ev.preventDefault();
							},
						}})),
						n.component(new ModelFragment(
							this.children,
							(k, v) => new ModelComponent(
								this.model,
								new ModelComponent(
									v,
									new Elem(n => n.elem('div', { className: 'pagearea-image--location fade' })),
									(m, c) => {
										c.setStyle('left', String(m.mapX) + 'px');
										c.setStyle('top', String(m.mapY) + 'px');
									},
								),
								(m, c) => {
									c.getComponent()[(m.current && m.current.id) === v.id ? 'addClass' : 'removeClass']('current');
									c.getComponent()[(m.selected && m.selected.id) === v.id ? 'addClass' : 'removeClass']('selected');
								},
							),
							{
								onAdd: (c, el) => {
									let e = c.getComponent().getComponent();
									e.addClass('hide');
									c.render(el);
									nextFrame(() => e.removeClass('hide'));
								},
								onRemove: c => new Promise(resolve => {
									let e = c.getComponent().getComponent();
									e.addClass('hide');
									setTimeout(() => {
										if (e.getElement()) {
											c.unrender();
										}
										resolve();
									}, 2100);
								}),
							},
						)),
					]),
					n.elem('button', { className: 'pagearea-image--zoomout pagearea-image--btn iconbtn' + btnSize, events: {
						mousedown: (c, ev) => {
							this._clickZoom(0.98);
							ev.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('search-minus')),
					]),
					n.elem('button', { className: 'pagearea-image--zoomin pagearea-image--btn iconbtn' + btnSize, events: {
						mousedown: (c, ev) => {
							this._clickZoom(1 / 0.98);
							ev.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('search-plus')),
					]),
					n.elem('button', { className: 'pagearea-image--center pagearea-image--btn iconbtn' + btnSize, events: {
						click: (c, ev) => {
							this._center();
							ev.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('dot-circle-o')),
					]),
				])),
				(m, c, change) => {
					// Center on current location if needed
					if (m && (!change || change.hasOwnProperty('mapX') || change.hasOwnProperty('mapY'))) {
						this.state.x = m.mapX;
						this.state.y = m.mapY;
						this._setTransform();
					}
				},
			),
			(m, c) => c.setModel(m.focus == 'current'
				? m.current
				: m.focus == 'selected'
					? m.selected
					: null,
			),
		);

		this._setTransform();
		return this.elem.render(el);
	}

	_listen(on) {
		let cb = on ? 'on' : 'off';
		this.ctrl[cb]('change', this._onCtrlChange);
		this.selectedModel[cb]('change', this._onSelectedChange);
	}

	_onCtrlChange(change) {
		if (!this.model) return;

		// Set current
		if (change.hasOwnProperty('inRoom')) {
			let current = this._getLocation();
			// Every time we change room, we focus on current room
			this.model.set({ current, focus: current ? 'current' : null });
		}
	}

	_getSelected() {
		let s = this.selectedModel.selected;
		return (s && this.children.props[s]) || null;
	}

	_onSelectedChange(change) {
		if (change && !change.hasOwnProperty('selected')) return;

		let selected = this._getSelected();

		this._setModel({
			selected,
			focus: selected
				? 'selected'
				: this.state.focus == 'selected'
					? null
					: this.state.focus,
		});
		return this;
	}

	unrender() {
		if (this.elem) {
			this._listen(false);
			this.elem.unrender();
			this.elem = null;
		}
		this._endAction();
	}

	_setModel(o) {
		if (this.model) {
			this.model.set(o);
		}
		if (o.hasOwnProperty('focus')) {
			this.state.focus = o.focus;
		}
	}

	_setTransform() {
		if (!this.elem) return;

		let st = this.state;
		let vw = this.vw / st.scale;
		let vh = this.vh / st.scale;
		let x = st.x - (vw / 2);
		let y = st.y - (vh / 2);
		let w = this.image.width;
		let h = this.image.height;
		if (x < 0) {
			x = 0;
		} else if (x > (w - vw)) {
			x = w - vw;
		}

		if (y < 0) {
			y = 0;
		} else if (y > (h - vh)) {
			y = h - vh;
		}

		let s = 'scale(' + st.scale + ') translateX(-' + x + 'px) translateY(-' + y + 'px)';
		this.elem.getComponent().getComponent().setNodeStyle('body', 'transform', s);
	}

	_clickZoom(m) {
		if (this.action) return;

		this.action = 'zoom';
		document.addEventListener('mouseup', this._endAction);
		this._onZoom(m);
	}

	_onZoom(m) {
		if (this.action == 'zoom') {
			this._zoom(m);
			requestAnimationFrame(() => this._onZoom(m));
		}
	}

	_endAction() {
		switch (this.action) {
			case 'zoom':
				document.removeEventListener('mouseup', this._endAction);
				break;
			case 'grab':
				if (this.elem) {
					this.elem.getComponent().getComponent().removeClass('grabbed');
				}
				this.offset = null;
				document.removeEventListener('mousemove', this._onMove);
				document.removeEventListener('mouseup', this._endAction);
				break;
		}
		this.action = null;
	}

	_zoom(m) {
		let scale = this.state.scale * m;
		if (scale > 1) {
			scale = 1;
		} else if (scale < 0.125) {
			scale = 0.125;
		}
		if (scale < (this.vw / this.image.width)) {
			scale = this.vw / this.image.width;
		}
		if (scale < (this.vh / this.image.height)) {
			scale = this.vh / this.image.height;
		}

		this.state.scale = scale;

		this._setTransform();
	}

	_center() {
		this._setModel({ focus: 'current' });
	}

	_getLocation() {
		let location = this.ctrl.inRoom;
		let area = location.area;
		while (area) {
			if (area.id == this.areaId) {
				return location;
			}
			location = area;
			area = area.parent;
		}
		return null;
	}

	_grab(x, y) {
		if (this.action || !this.elem) return;

		this.action = 'grab';
		this.offset = { x, y };
		document.addEventListener('mouseup', this._endAction);
		document.addEventListener('mousemove', this._onMove);

		this.elem.getComponent().getComponent().addClass('grabbed');
	}

	_onMove(ev) {
		let x = ev.clientX;
		let y = ev.clientY;
		let st = this.state;
		let sx = st.x - (x - this.offset.x) / st.scale;
		let sy = st.y - (y - this.offset.y) / st.scale;
		let vw = this.vw / st.scale / 2;
		let vh = this.vh / st.scale / 2;
		if (sx < vw) {
			sx = vw;
		} else if (sx > (this.image.width - vw)) {
			sx = this.image.width - vw;
		}
		if (sy < vh) {
			sy = vh;
		} else if (sy > (this.image.height - vh)) {
			sy = this.image.height - vh;
		}
		st.x = sx;
		st.y = sy;
		this.offset = { x, y };
		this._setModel({ focus: null });
		this._setTransform();
	}
}

export default PageAreaImage;
