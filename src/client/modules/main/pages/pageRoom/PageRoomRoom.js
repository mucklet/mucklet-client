import { Elem, Txt, Context } from 'modapp-base-component';
import { ModelTxt, ModelComponent, CollectionList, CollectionComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Img from 'components/Img';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import NameSection from 'components/NameSection';
import FormatTxt from 'components/FormatTxt';
import ModelCollapser from 'components/ModelCollapser';
import ImgModal from 'classes/ImgModal';
import PageRoomChar from './PageRoomChar';
import PageRoomExits from './PageRoomExits';


const textNotSet = l10n.l('pageRoom.notSet', "Not set");

/**
 * PageRoomComponent renders a room info page.
 */
class PageRoomComponent {
	constructor(module, ctrl, room, state, layout) {
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.state = state;
		this.layout = layout;
		this.roomState = this.state['room_' + room.id] || {};
		this.state['room_' + room.id] = this.roomState;
		this.roomState.description = this.roomState.description || {};
	}

	render(el) {
		let image = new Elem(n => n.elem('div', { className: 'pageroom-room--image-cont' }, [
			n.component('img', new Img('', { className: 'pageroom-room--image', events: {
				click: () => new ImgModal(this.room.image.href).open(),
			}})),
		]));
		this.elem = new ModelComponent(
			this.room,
			new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.filter ? t.filter(this.ctrl, this.room, this._canEdit(), this._canDelete(), this.layout) : true,
				}),
				allTools => allTools.dispose(),
				allTools => new Elem(n => n.elem('div', { className: 'pageroom-room' }, [
					n.component(new Context(
						() => new CollectionWrapper(allTools, {
							filter: t => (t.type || 'room') == 'room',
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
										t => t.componentFactory(this.ctrl, this.room),
										{
											className: 'pageroom-room--tools',
											subClassName: t => t.className || null,
											horizontal: true,
										},
									));
								}
							},
						),
					)),
					n.component(new ModelComponent(
						this.room,
						new NameSection(new ModelTxt(this.room, c => c.name), null, {
							open: this.state.roomImageOpen,
							onToggle: (c, v) => this.state.roomImageOpen = v,
						}),
						(m, c, changed) => {
							if (m.image) {
								image.getNode('img').setSrc(m.image.href + "?thumb=xxl");
								c.setComponent(image);
							} else {
								c.setComponent(null);
							}
						},
					)),
					n.component(new ModelCollapser(this.room, [{
						condition: m => !m.isDark,
						factory: m => new ModelComponent(
							this.room,
							new Elem(n => n.elem('div', { className: 'pageroom-room--population flex-row pad8' }, [
								n.component(new Txt(l10n.l('pageArea.population', "Population"), {
									tagName: 'div',
									className: 'pageroom-room--population-title flex-1',
								})),
								n.component('pop', new Txt(null, { className: 'pageroom-room--population-count flex-auto', duration: 0 })),
							])),
							(m, c) => c.getNode('pop').setText(m.pop || "0"),
						),
					}])),
					n.component(new Context(
						() => new CollectionWrapper(allTools, {
							filter: t => t.type == 'section',
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => t.componentFactory(this.ctrl, this.room),
							{
								className: 'pageroom-room--sections',
								subClassName: t => t.className || null,
							},
						),
					)),
					n.component(new PanelSection(
						l10n.l('pageRoom.description', "Description"),
						new ModelComponent(
							this.room,
							new FormatTxt("", { className: 'common--desc-size', state: this.roomState.description }),
							(m, c) => {
								c.setFormatText(m.desc ? m.desc : textNotSet);
								c[m.desc ? 'removeClass' : 'addClass']('pagechar--notset');
							},
						),
						{
							className: 'common--sectionpadding',
							open: this.state.descriptionOpen,
							onToggle: (c, v) => this.state.descriptionOpen = v,
						},
					)),
					n.component(new PanelSection(
						new Elem(n => n.elem('div', { className: 'pageroom-room--exitsheader' }, [
							n.component(new Txt(l10n.l('pageRoom.exits', "Exits"), { tagName: 'h3' })),
							n.component(new Context(
								() => new CollectionWrapper(allTools, {
									filter: t => t.type == 'exit',
								}),
								tools => tools.dispose(),
								tools => new CollectionList(
									tools,
									t => t.componentFactory(this.ctrl, this.room),
									{
										className: 'pageroom-room--exitstools',
										subClassName: t => t.className || null,
										horizontal: true,
									},
								),
							)),
						])),
						new PageRoomExits(this.module, this.ctrl, this.room.exits),
						{
							className: 'pageroom-room--exits common--sectionpadding',
							open: this.state.exitsOpen,
							onToggle: (c, v) => this.state.exitsOpen = v,
						},
					)),
					n.component(new PanelSection(
						new Elem(n => n.elem('div', { className: 'pageroom-room--inroomheader' }, [
							n.component(new Txt(l10n.l('pageRoom.inRoom', "In room"), { tagName: 'h3' })),
							n.component(new Context(
								() => new CollectionWrapper(allTools, {
									filter: t => t.type == 'inRoom',
								}),
								tools => tools.dispose(),
								tools => new CollectionList(
									tools,
									t => t.componentFactory(this.ctrl, this.room),
									{
										className: 'pageroom-room--inroomtools',
										subClassName: t => t.className || null,
										horizontal: true,
									},
								),
							)),
						])),
						new ModelComponent(
							this.room,
							new Fader(),
							(m, c, changed) => {
								if (changed && !changed.hasOwnProperty('chars')) return;
								c.setComponent(m.chars
									? new CollectionList(m.chars, m => new PageRoomChar(this.module, this.ctrl, m))
									: new Txt(l10n.l('pageRoom.isDark', "The room is too dark."), { className: 'common--nolistplaceholder' }),
								);
							},
						),
						{
							className: 'pageroom-room--chars common--sectionpadding',
							open: this.state.inRoomOpen,
							onToggle: (c, v) => this.state.inRoomOpen = v,
						},
					)),
				])),
			),
			(m, c, change) => {
				// Reset filtering of tools is ownership of the room changes.
				if (change && change.hasOwnProperty('owner')) {
					c.getContext().refresh();
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

	_canEdit() {
		return this.module.self.canEdit(this.ctrl, this.room);
	}

	_canDelete() {
		return this.module.self.canDelete(this.ctrl, this.room);
	}
}

export default PageRoomComponent;
