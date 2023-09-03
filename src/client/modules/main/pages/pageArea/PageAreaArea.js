import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelComponent, CollectionList, CollectionComponent } from 'modapp-resource-component';
import { Model, ModelToCollection } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import NameSection from 'components/NameSection';
import PanelSection from 'components/PanelSection';
import FormatTxt from 'components/FormatTxt';
import AreaChildrenModel from 'classes/AreaChildrenModel';
import listenModel, { relistenModel } from 'utils/listenModel';
import PageAreaLocation from './PageAreaLocation';
import PageAreaImage from './PageAreaImage';

/**
 * PageAreaArea renders an area page.
 */
class PageAreaArea {
	constructor(module, ctrl, area, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.area = area;
		this.state = state;
		this.close = close;

		this.areaState = this.state['area_' + area.id] || {};
		this.state['area_' + area.id] = this.areaState;
		this.areaState.about = this.areaState.about || {};
		this.areaState.rules = this.areaState.rules || {};

		// Bind callbacks
		this._onLocationClick = this._onLocationClick.bind(this);
		this._onLocationsChange = this._onLocationsChange.bind(this);
		this.listeners = null;
	}

	render(el) {
		this.children = new AreaChildrenModel(this.ctrl, this.area, { eventBus: this.module.self.app.eventBus });
		this.model = new Model({ data: {
			selected: this.state.selected || null,
		}, eventBus: this.module.self.app.eventBus });
		this.inLocations = new Model({ data: this._getAndListenInLocations(), eventBus: this.module.self.app.eventBus });

		let imgFader = new Fader();
		let about = new PanelSection(
			l10n.l('pageArea.about', "About"),
			new ModelComponent(
				this.area,
				new FormatTxt("", { className: 'common--desc-size', state: this.areaState.about }),
				(m, c) => c.setFormatText(m.about),
			),
			{
				className: 'common--sectionpadding',
				open: this.state.aboutOpen,
				onToggle: (c, v) => this.state.aboutOpen = v,
			},
		);
		let rules = new PanelSection(
			l10n.l('pageArea.rules', "Rules"),
			new ModelComponent(
				this.area,
				new FormatTxt("", { className: 'common--desc-size', state: this.areaState.rules }),
				(m, c) => c.setFormatText(m.rules),
			),
			{
				className: 'common--sectionpadding',
				open: this.state.rulesOpen,
				onToggle: (c, v) => this.state.rulesOpen = v,
			},
		);

		this.elem = new Elem(n => n.elem('div', { className: 'pagearea-area' }, [
			n.component(new ModelComponent(
				this.area,
				new Context(
					() => new ModelToCollection(this.module.self.getTools(), {
						filter: (k, v) => (v.type || 'area') == 'area' && (v.filter ? v.filter(this.ctrl, this.area, this._canEdit()) : true),
						eventBus: this.module.self.eventBus,
					}),
					tools => tools.dispose(),
					tools => new CollectionComponent(
						tools,
						new Collapser(),
						(col, c, ev) => {
							// Collapse if we have no tools to show
							if (!col.length) {
								c.setComponent(null);
								return;
							}

							if (!ev || (col.length == 1 && ev.event == 'add')) {
								c.setComponent(new CollectionList(
									tools,
									t => t.componentFactory(this.ctrl, this.area),
									{
										className: 'pagearea-area--tools',
										subClassName: t => t.className || null,
										horizontal: true,
									},
								));
							}
						},
					),
				),
				(m, c, change) => {
					// Reset filtering of tools is ownership of the area changes.
					if (change && change.hasOwnProperty('owner')) {
						c.getContext().refresh();
					}
				},
			)),
			n.component(new ModelComponent(
				this.area,
				new NameSection('', null, {
					open: this.state.areaImageOpen,
					onToggle: (c, v) => this.state.areaImageOpen = v,
				}),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('image')) {
						if (m && m.image) {
							imgFader.setComponent(new PageAreaImage(this.module, this.ctrl, this.area.id, m.image, this.children, this.model, this.state));
							c.setComponent(imgFader);
						} else {
							c.setComponent(null);
						}
					}
					c.setTitle((m && m.name) || '');
				},
			)),
			n.component(new ModelComponent(
				this.area,
				new Elem(n => n.elem('div', { className: 'pagearea-area--population flex-row pad8' }, [
					n.component(new Txt(l10n.l('pageArea.population', "Population"), {
						tagName: 'div',
						className: 'pagearea-area--population-title flex-1',
					})),
					n.component('pop', new Txt(null, { className: 'pagearea-area--population-count flex-auto', duration: 0 })),
				])),
				(m, c) => {
					c.getNode('pop').setText((m.pop || "0") + (m.prv ? (' (+' + m.prv + ')') : ''));
					c.setAttribute(
						'title',
						l10n.t('pageArea.inPublic', "{count} in public", { count: m.pop || '0' }) +
						(m.prv
							? "\n" + l10n.t('pageArea.inPrivate', "{count} in private", { count: m.prv })
							: ''
						),
					);
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageArea.locations', "Locations"),
				new Context(
					() => new ModelToCollection(this.children, {
						compare: (a, b) => {
							let av = a.value;
							let bv = b.value;
							return (bv.pop - av.pop) || av.name.localeCompare(bv.name) || a.key.localeCompare(b.key);
						},
						eventBus: this.module.self.app.eventBus,
					}),
					col => col.dispose(),
					col => new CollectionList(col, m => new PageAreaLocation(this.module, m, this.inLocations, this.model, this._onLocationClick)),
				),
				{
					className: 'common--sectionpadding',
					open: this.state.locationOpen,
					onToggle: (c, v) => this.state.locationOpen = v,
				},
			)),
			n.component(new ModelComponent(
				this.area,
				new Collapser(),
				(m, c) => c.setComponent(this.area.about ? about : null),
			)),
			n.component(new ModelComponent(
				this.area,
				new Collapser(),
				(m, c) => c.setComponent(this.area.rules ? rules : null),
			)),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.children.dispose();
			this.children = null;
			this._unlistenInLocations(false);
			this.inLocations = null;
		}
	}

	_onLocationClick(m) {
		let selected = m.id;
		if (this.state.selected == selected) {
			selected = null;
		}

		this.state.selected = selected;
		if (this.model) {
			this.model.set({ selected });
		}
	}

	_canEdit() {
		return !this.ctrl.puppeteer && (this.module.player.isBuilder() || this.module.player.ownsChar(this.area.owner));
	}

	_getAndListenInLocations() {
		if (!this.listeners) {
			this.listeners = { char: this.ctrl, room: null, areas: [] };
			listenModel(this.ctrl, true, this._onLocationsChange);
		}
		this.listeners.room = relistenModel(this.listeners.room, this.ctrl.inRoom, this._onLocationsChange);
		let o = {};
		let areaIdx = 0;
		let areas = this.listeners.areas;
		let room = this.ctrl.inRoom;
		if (room) {
			o[room.id] = room.pop;
			let area = room.area;
			// Traverse areas as long as we have parents that does not loop.
			while (area && areas.slice(0, areaIdx).indexOf(area) < 0) {
				areas[areaIdx] = relistenModel(areas[areaIdx], area, this._onLocationsChange);
				o[area.id] = area.pop;
				area = area.parent;
				areaIdx++;
			}
		}
		// Stop listening to additional areas
		for (let i = areas.length - 1; i >= areaIdx; i--) {
			listenModel(areas[i], false, this._onLocationsChange);
			areas.pop();
		}
		return o;
	}

	_unlistenInLocations() {
		if (this.listeners) {
			listenModel(this.listeners.char, false, this._onLocationsChange);
			listenModel(this.listeners.room, false, this._onLocationsChange);
			for (let area of this.listeners.areas) {
				listenModel(area, false, this._onLocationsChange);
			}
		}
		this.listeners = null;
	}

	_onLocationsChange(change) {
		if (this.inLocations && (
			change.hasOwnProperty('inRoom') ||
			change.hasOwnProperty('pop') ||
			change.hasOwnProperty('parent')
		)) {
			this.inLocations.reset(this._getAndListenInLocations());
		}
	}
}

export default PageAreaArea;
