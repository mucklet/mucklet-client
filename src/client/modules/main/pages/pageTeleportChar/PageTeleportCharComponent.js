import { Elem, Txt } from 'modapp-base-component';
import { CollectionComponent, CollectionList, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import PageTeleportCharRoom from './PageTeleportCharRoom';
import PageTeleportCharNode from './PageTeleportCharNode';


class PageTeleportCharComponent {
	constructor(module, ctrl, state, close) {
		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageteleportchar' }, [
			n.component(new PanelSection(
				l10n.l('pageTeleportChar.destinations', "Destinations"),
				new Elem(n => n.elem('div', [
					n.component(new ModelComponent(
						this.module.globalTeleports.getModel(),
						new CollectionComponent(
							null,
							new Collapser(),
							(col, c, ev) => {
								if (ev) return;

								c.setComponent(col
									? new CollectionList(
										col,
										m => new PageTeleportCharNode(this.module, this.ctrl, m, {
											closePage: this.close,
											isGlobal: true,
										}),
									)
									: null,
								);
							},
						),
						(m, c) => c.setCollection(m.globalTeleports),
					)),
					n.component(new CollectionList(
						this.ctrl.nodes,
						m => new PageTeleportCharNode(this.module, this.ctrl, m, {
							closePage: this.close,
						}),
					)),
				])),
				{
					className: 'pageteleportchar--ownedrooms common--sectionpadding',
					open: this.state.nodes,
					onToggle: (c, v) => this.state.nodes = v,
				},
			)),
			n.component(new ModelComponent(
				this.ctrl,
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('ownedRooms')) {
						c.setComponent(m.ownedRooms ? new PanelSection(
							l10n.l('pageTeleportChar.ownedRooms', "Owned rooms"),
							new CollectionComponent(
								this.ctrl.ownedRooms,
								new Fader(),
								(col, c, ev) => {
									if (!col.length) {
										c.setComponent(new Txt(l10n.l('pageTeleportChar.noOwnedRooms', "No rooms. Wanna create one?"), { className: 'common--nolistplaceholder' }));
										return;
									}

									if (!ev || (col.length == 1 && ev.event == 'add')) {
										c.setComponent(new CollectionList(
											col,
											m => new PageTeleportCharRoom(this.module, this.ctrl, m, this.close),
										));
									}
								},
							),
							{
								className: 'pageteleportchar--ownedrooms common--sectionpadding',
								open: this.state.inRoomOpen,
								onToggle: (c, v) => this.state.inRoomOpen = v,
							},
						) : null);
					}
				},
			)),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageTeleportCharComponent;
