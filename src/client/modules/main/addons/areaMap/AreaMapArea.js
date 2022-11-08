import { Elem, Context, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import AreaChildrenModel from 'classes/AreaChildrenModel';

/**
 * AreaMapArea is the badge and area map containercomponent.
 */
class AreaMapArea {

	constructor(module, ctrl, area, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.area = null;

		this.setArea(area);
	}

	render(el) {
		this.model = new Model({ data: {
			open: this.state.hasOwnProperty('open') ? this.state.open : true,
			selected: this.state.selected || null,
		}, eventBus: this.module.self.app.eventBus });

		let btnComponent = new Elem(n => n.elem('button', { className: 'areamap--close iconbtn lighten ', events: {
			click: (c, ev) => {
				this._toggleArea(false);
				ev.stopPropagation();
			},
		}}, [
			n.component('btn', new FAIcon('times')),
		]));
		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				this.area,
				new Elem(n => n.elem('div', { className: 'areamap' }, [
					n.elem('div', { className: 'areamap--badge' }, [
						n.elem('div', { className: 'badge btn nooutline', events: {
							click: (c, ev) => {
								if (!this.model.open) {
									this._toggleArea(true);
								} else {
									this.module.pageArea.open(this.ctrl, true);
								}
								ev.stopPropagation();
							},
						}}, [
							n.elem('div', { className: 'areamap--badgecont' }, [
								n.elem('div', { className: 'badge--select badge--select-margin flex-baseline' }, [
									n.elem('div', { className: 'areamap--symbol' }, [
										n.component(new FAIcon('globe')),
									]),
									n.elem('div', { className: 'badge--info' }, [
										n.component('name', new Txt("", {
											tagName: 'div',
											className: 'badge--text badge--nowrap',
										})),
									]),
									n.elem('div', { className: 'areamap--counter' }, [
										n.component('pop', new Txt('', {
											tagName: 'div',
											className: 'badge--text',
											duration: 0,
										})),
									]),
								]),
							]),
							n.component('btn', new Fader()),
						]),
					]),
					n.component('map', new Fader()),
				])),
				(m, c, change) => {
					this._setBadge(m, c);
					if (!change || change.hasOwnProperty('image')) {
						this._setMap(m, c.getNode('map'));
					}
				},
			),
			(m, c, change) => {
				c = c.getComponent();
				c[m.open ? 'removeClass' : 'addClass']('closed');
				c.getNode('btn').setComponent(m.open ? btnComponent : null);
				if (!change || change.hasOwnProperty('open')) {
					this._setMap(this.area, c.getNode('map'));
				}
			},
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

	setArea(area) {
		area = area || null;
		if (this.area == area) return;

		this.area = area;
		if (this.elem) {
			this.elem.getComponent().setModel(area);
		}
		return this;
	}

	_setBadge(m, c) {
		if (!m) return;

		c.getNode('name').setText(m.name);
		c.getNode('pop').setText((m.pop || "0") + (m.prv ? (' (+' + m.prv + ')') : ''));
		c.setAttribute(
			'title',
			l10n.t('areaMap.inPublic', "{name}\n{count} in public", { name: m.name, count: m.pop || '0' }) +
			(m.prv
				? "\n" + l10n.t('areaMap.inPrivate', "{count} in private", { count: m.prv })
				: ''
			),
		);
	}

	_setMap(m, c) {
		if (!m || !m.image || (this.model && !this.model.open)) {
			c.setComponent(null);
			return;
		}

		let state = this.state['area_' + m.id];
		if (!state) {
			state = {};
			this.state['area_' + m.id] = state;
		}

		c.setComponent(new Context(
			() => new AreaChildrenModel(this.ctrl, m, { eventBus: this.module.self.app.eventBus }),
			children => children.dispose(),
			children => this.module.pageArea.newImage(this.ctrl, m.id, m.image, children, this.model, state, {
				className: 'areamap--map',
				vw: 156,
				vh: 156,
				size: 'small',
			}),
		));
	}

	_toggleArea(open) {
		if (this.model) {
			this.model.set({ open: typeof open == 'undefined' ? !this.model.open : !!open });
		}
	}
}

export default AreaMapArea;
