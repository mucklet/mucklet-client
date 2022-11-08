import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';

class PageAreaLocation {
	constructor(module, ctrl, location, selectedModel, click) {
		this.module = module;
		this.ctrl = ctrl;
		this.location = location;
		this.selectedModel = selectedModel;
		this.click = click;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.selectedModel,
			new ModelComponent(
				this.ctrl,
				new Elem(n => n.elem('div', { className: 'pagearea-location' }, [
					n.elem('cont', 'div', { className: 'pagearea-location--cont' }, [
						n.elem('div', {
							className: 'badge btn' + (this.location.private ? ' pagearea-location--private' : ''),
							events: {
								click: () => this.click(this.location),
							},
						}, [
							n.elem('div', { className: 'badge--select' }, [
								n.elem('div', { className: 'badge--info' }, [
									n.component(new ModelTxt(this.location, m => m.name, {
										tagName: 'div',
										className: (this.location.type == 'area' ? 'badge--strong' : 'badge--text') + ' badge--nowrap',
									})),
								]),
								n.elem('div', { className: 'badge--counter' }, [
									n.component(new ModelTxt(this.location, m => m.pop || '', {
										tagName: 'div',
										className: 'badge--text',
										duration: 0,
									})),
								]),
							]),
							n.component('content', new Collapser(null)),
						]),
					]),
				])),
				(m, c) => c[this._inLocation() ? 'addNodeClass' : 'removeNodeClass']('cont', 'inlocation'),
			),
			(m, c) => {
				c = c.getComponent();
				let selected = this.location.id == m.selected;
				c[selected ? 'addClass' : 'removeClass']('selected');
				c.getNode('content').setComponent(selected && this.location.hasOwnProperty('shortDesc')
					? new ModelComponent(this.location, new Fader(null, { className: 'badge--select' }), (m, c) => c.setComponent(m.shortDesc
						? new Txt(m.shortDesc, { className: 'pagearea-location--content badge--margin badge--text badge--info' })
						: null,
					))
					: null,
				);
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

	_inLocation() {
		if (this.ctrl.inRoom) {
			let id = this.location.id;
			if (this.ctrl.inRoom.id === id) return true;

			let area = this.ctrl.inRoom.area;
			while (area) {
				if (area.id == id) return true;
				area = area.parent;
			}
		}

		return false;
	}

}

export default PageAreaLocation;
