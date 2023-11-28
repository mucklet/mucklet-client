import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import ModelFader from 'components/ModelFader';
import ModelCollapser from 'components/ModelCollapser';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import OverlayNavArea from './OverlayNavArea';
import OverlayNavButtons from './OverlayNavButtons';

/**
 * OverlayNavComponent is an area map overlay component.
 */
class OverlayNavComponent {

	constructor(module, ctrl, state, opt) {
		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.opt = opt;
	}

	render(el) {
		this.model = new Model({ data: {
			open: this.state.hasOwnProperty('open') ? this.state.open : this.opt?.mode != 'mobile',
			selected: this.state.selected || null,
		}, eventBus: this.module.self.app.eventBus });

		let faderComponent = new Fader();
		let nameFaderComponent = new Fader();
		let roomNameComponent = new Txt("", {
			tagName: 'div',
			className: 'badge--text badge--nowrap overlaynav--name',
		});
		let areaNameComponent = this.opt?.mode == 'mobile'
			? null
			: new Txt("", {
				tagName: 'div',
				className: 'badge--strong badge--nowrap overlaynav--name',
			});
		let popComponent = new Txt("", {
			tagName: 'div',
			className: 'badge--text',
			duration: 0,
		});
		let roomComponent = new Elem(n => n.elem('div', { className: 'overlaynav' + (this.opt?.mode == 'mobile' ? ' mobile' : '') }, [
			n.elem('div', { className: 'flex-row' }, [
				n.elem('div', { className: 'overlaynav--badge flex-auto' }, [
					n.elem('div', { className: 'badge btn nooutline', events: {
						click: (c, ev) => {
							this.module.roomPages.openPanel();
							// In mobile layout, we don't zoom in the room/area, but
							// just open the panel.
							if (this.opt?.mode != 'mobile') {
								this.module.pageRoom.setAreaId(this.ctrl.id, this.ctrl.inRoom.area?.id || null);
							}
							ev.stopPropagation();
						},
					}}, [
						n.elem('div', { className: 'overlaynav--badgecont' }, [
							n.elem('div', { className: 'badge--select badge--select-margin flex-baseline' }, [
								n.elem('div', { className: 'badge--info' }, [
									n.component(nameFaderComponent),
								]),
								n.elem('div', { className: 'overlaynav--counter' }, [
									n.component(popComponent),
								]),
							]),
						]),
					]),
				]),
				n.elem('div', { className: 'flex-auto' }, [
					n.elem('button', {
						className: 'overlaynav--toggle iconbtn small tinyicon',
						events: {
							click: (c, ev) => {
								this._toggle();
								ev.currentTarget.blur();
								ev.stopPropagation();
							},
						},
					}, [
						n.component(new ModelFader(this.model, [{
							factory: m => new FAIcon(m.open ? 'times' : 'globe'),
							hash: m => m.open,
						}])),
					]),
				]),
			]),
			n.component(new ModelCollapser(this.model, [{
				condition: m => m.open,
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row' }, [
					n.component(new OverlayNavButtons(this.module, this.ctrl, this.opt)),
					n.component(new ModelComponent(
						this.ctrl,
						new ModelComponent(
							null,
							new ModelComponent(
								null,
								new Collapser(null, { horizontal: true }),
								(m, c) => c.setComponent(m?.image
									? c.getComponent()?.setArea(m) ||
										new OverlayNavArea(this.module, this.ctrl, m, this.model, this.state)
									: null,
								),
							),
							(m, c) => c.setModel(m?.area),
						),
						(m, c) => c.setModel(m?.inRoom),
					)),
				])),
			}], {
				className: 'overlaynav--content',
			})),
		]));

		this.elem = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new ModelComponent(
					null,
					faderComponent,
					(m, c) => this._setBadge(popComponent, nameFaderComponent, roomNameComponent, areaNameComponent),
				),
				(m, c) => {
					if (areaNameComponent) {
						c.setModel(m?.area);
					}
					this._setBadge(popComponent, nameFaderComponent, roomNameComponent, areaNameComponent);
					faderComponent.setComponent(m ? roomComponent : null);
				},
			),
			(m, c) => c.setModel(m?.inRoom),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setBadge(popComponent, fader, roomNameComponent, areaNameComponent) {
		let m = this.ctrl.inRoom;
		if (m) {
			let pop = m.pop;
			let area = areaNameComponent && m.area;
			if (area) {
				pop = (area.pop || "0") + (area.prv ? (' (+' + area.prv + ')') : '');
				areaNameComponent.setText(area.name);
				fader.setComponent(areaNameComponent);
			} else {
				roomNameComponent.setText(m.name);
				fader.setComponent(roomNameComponent);
			}
			popComponent.setText(pop || "0");
		}
	}

	_toggle(open) {
		if (this.model) {
			this.model.set({ open: typeof open == 'undefined' ? !this.model.open : !!open });
		}
	}
}

export default OverlayNavComponent;
