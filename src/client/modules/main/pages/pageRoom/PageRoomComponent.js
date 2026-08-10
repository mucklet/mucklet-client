import { Elem, Txt, Context } from 'modapp-base-component';
import { ModelTxt, ModelComponent, CollectionList, CollectionComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Img from 'components/Img';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import NameSection from 'components/NameSection';
import LabelToggleBox from 'components/LabelToggleBox';
import ModelCollapser from 'components/ModelCollapser';
import ImgModal from 'classes/ImgModal';
import PageRoomChar from './PageRoomChar'; 
import PageRoomExits from './PageRoomExits';

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
		// Default sleepers section to closed
		if (this.state.sleepersOpen === undefined) {
			this.state.sleepersOpen = false;
		}
		// Default split sleepers to false
		if (this.state.splitSleepers === undefined) {
			this.state.splitSleepers = false;
		}
	}

	render(el) {
		let image = new Elem(n => n.elem('div', { className: 'pageroom--image-cont' }, [
			n.component('img', new Img('', { className: 'pageroom--image', events: {
				click: () => new ImgModal(this.room.image.href).open(),
			}})),
		]));
		
		// Store references to Fader components for refreshing
		this.awakeCharsFader = new Fader();
		this.sleepersCharsFader = new Fader();
		this.sleepersPanelCollapser = new Collapser();
		
		this.elem = new ModelComponent(
			this.room,
			new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.filter ? t.filter(this.ctrl, this.room, this._canEdit(), this._canDelete(), this.layout) : true,
				}),
				allTools => allTools.dispose(),
				allTools => new Elem(n => n.elem('div', { className: 'pageroom' }, [
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
											className: 'pageroom--tools',
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
							new Elem(n => n.elem('div', { className: 'pageroom--population flex-row pad8' }, [
								n.component(new Txt(l10n.l('pageArea.population', "Population"), {
									tagName: 'div',
									className: 'pageroom--population-title flex-1',
								})),
								n.component('pop', new Txt(null, { className: 'pageroom--population-count flex-auto', duration: 0 })),
							])),
							(m, c) => c.getNode('pop').setText(m.pop || "0"),
						),
					}])),

					// Section tools (such as Description from PageRoomDesc)
					n.component(new Context(
						() => new CollectionWrapper(allTools, {
							filter: t => t.type == 'section',
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => {
								let state = this.state[t.id] = (this.state[t.id] || {});
								let roomState = this.roomState[t.id] = (this.roomState[t.id] || {});
								return t.componentFactory(this.ctrl, this.room, state, roomState);
							},
							{
								className: 'pageroom--sections',
								subClassName: t => t.className || null,
							},
						),
					)),

					// Exits
					n.component(new PanelSection(
						new Elem(n => n.elem('div', { className: 'pageroom--exitsheader' }, [
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
										className: 'pageroom--exitstools',
										subClassName: t => t.className || null,
										horizontal: true,
									},
								),
							)),
						])),
						new PageRoomExits(this.module, this.ctrl, this.room.exits, {
							clickTooltip: true,
						}),
						{
							className: 'pageroom--exits common--sectionpadding',
							open: this.state.exitsOpen,
							onToggle: (c, v) => this.state.exitsOpen = v,
						},
					)),
					// Split sleepers togglebox
					n.component('showSleepers', new LabelToggleBox(l10n.l('pageRoom.showSleepers', "Hide sleepers (split)"), this.state.splitSleepers, {
						className: 'common--formmargin ',
						onChange: v => {
							this.state.splitSleepers = v;
							this._refreshCharSections();
						},
						popupTip: l10n.l('pageRoom.showSleepersInfo', "Filter the list to filter out asleep and highly idle characters (away/idle level 3)."),
						popupTipClassName: 'popuptip--width-s popuptip--position-left-bottom',
					})),
					//Awake people
					n.component(new PanelSection(
						new Elem(n => n.elem('div', { className: 'pageroom--inroomheader' }, [
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
										className: 'pageroom--inroomtools',
										subClassName: t => t.className || null,
										horizontal: true,
									},
								),
							)),
						])),
						new ModelComponent(
							this.room,
							this.awakeCharsFader,
							(m, c, changed) => {
								if (changed && !changed.hasOwnProperty('chars')) return;
								if (!m.chars) {
									c.setComponent(new Txt(l10n.l('pageRoom.isDark', "The room is too dark."), { className: 'common--nolistplaceholder' }));
									return;
								}
								// Filter to show only awake and active characters (exclude asleep and away/idle level 3)
								c.setComponent(new Context(
									() => new CollectionWrapper(m.chars, {
										filter: ch => this.state.splitSleepers ? ch.state !== 'asleep' && ch.idle !== 3 : true,
									}),
									awakeChars => awakeChars.dispose(),
									awakeChars => awakeChars.length
										? new CollectionList(awakeChars, m => new PageRoomChar(this.module, this.ctrl, m))
										: new Txt(l10n.l('pageRoom.noAwake', "No one awake in room."), { className: 'common--nolistplaceholder' }),
								));
							},
						),
					
						{
							className: 'pageroom--chars common--sectionpadding',
							open: this.state.inRoomOpen,
							onToggle: (c, v) => this.state.inRoomOpen = v,
						},
					)),
					//Asleep people - conditionally render entire section
					n.component(this.sleepersPanelCollapser),
				])),
			),
			(m, c, change) => {
				// Reset filtering of tools is ownership of the room changes.
				if (change && change.hasOwnProperty('owner')) {
					c.getContext().refresh();
				}
			},
		);

		let result = this.elem.render(el);
		
		// Initialize the character sections based on current state
		this._refreshCharSections();
		
		return result;
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

	_refreshCharSections() {
		// Manually update the character lists by recreating the filtered collections
		let chars = this.room.chars;
		
		if (!chars) {
			this.awakeCharsFader.setComponent(new Txt(l10n.l('pageRoom.isDark', "The room is too dark."), { className: 'common--nolistplaceholder' }));
			this.sleepersPanelCollapser.setComponent(null);
			return;
		}
		
		// Update awake characters section
		this.awakeCharsFader.setComponent(new Context(
			() => new CollectionWrapper(chars, {
				filter: ch => this.state.splitSleepers ? ch.state !== 'asleep' && ch.idle !== 3 : true,
			}),
			awakeChars => awakeChars.dispose(),
			awakeChars => awakeChars.length
				? new CollectionList(awakeChars, m => new PageRoomChar(this.module, this.ctrl, m))
				: new Txt(l10n.l('pageRoom.noAwake', "No one awake in room."), { className: 'common--nolistplaceholder' }),
		));
		
		// Show/hide entire sleepers panel section
		if (!this.state.splitSleepers) {
			this.sleepersPanelCollapser.setComponent(null);
			return;
		}
		
		// Create the entire sleepers panel
		this.sleepersPanelCollapser.setComponent(new PanelSection(
			new Elem(n => n.elem('div', { className: 'pageroom--inroomheader' }, [
				n.component(new Txt(l10n.l('pageRoom.sleepers', "Sleepers"), { tagName: 'h3' })),
			])),
			new ModelComponent(
				this.room,
				this.sleepersCharsFader,
				(m, c, changed) => {
					if (changed && !changed.hasOwnProperty('chars')) return;
					if (!m.chars) {
						c.setComponent(null);
						return;
					}
					// Filter to show asleep characters and highly idle characters (away/idle level 3)
					c.setComponent(new Context(
						() => new CollectionWrapper(m.chars, {
							filter: ch => ch.state === 'asleep' || ch.idle === 3,
						}),
						asleepChars => asleepChars.dispose(),
						asleepChars => asleepChars.length
							? new CollectionList(asleepChars, m => new PageRoomChar(this.module, this.ctrl, m))
							: new Txt(l10n.l('pageRoom.noSleepers', "No sleepers in room."), { className: 'common--nolistplaceholder' }),
					));
				},
			),
			{
				className: 'pageroom--chars common--sectionpadding',
				open: this.state.sleepersOpen,
				onToggle: (c, v) => this.state.sleepersOpen = v,
			},
		));
	}
}

export default PageRoomComponent;
