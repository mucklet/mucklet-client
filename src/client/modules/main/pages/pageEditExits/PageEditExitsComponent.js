import { Context, Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { ModelToCollection } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PageEditExitsExit from './PageEditExitsExit';

/**
 * PageEditExitsComponent renders an edit exits page.
 */
class PageEditExitsComponent {
	constructor(module, ctrl, room, model, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.model = model;
		this.roomState = state['editexits_' + room.id] || { exitsOpen: true, hiddenExitsOpen: false };
		state['editexits_' + room.id] = this.roomState;

	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditexits' }, [
			n.component(new ModelTxt(this.room, c => c.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),
			n.component(new PanelSection(
				new Elem(n => n.elem('div', { className: 'pageeditexits--exitsheader' }, [
					n.component(new Txt(l10n.l('pageEditExits.exits', "Exits"), { tagName: 'h3' })),
				])),
				new Elem(n => n.elem('div', [
					n.component(new CollectionList(
						this.room.exits,
						m => new PageEditExitsExit(this.module, this.ctrl, this.room, m)
					)),
					n.component(new CollectionComponent(
						this.room.exits,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageEditExits.noExits', "There are no exits"), { className: 'common--nolistplaceholder' })
						)
					)),
					n.elem('div', { className: 'common--addpadding' }, [
						n.elem('button', { events: {
							click: () => this._onCreate(false)
						}, className: 'btn icon-left common--addbtn' }, [
							n.component(new FAIcon('plus')),
							n.component(new Txt(l10n.l('pageEditExits.createExit', "Create new exit")))
						])
					])
				])),
				{
					className: 'pageeditexits--exits common--sectionpadding',
					open: this.roomState.exitsOpen,
					onToggle: (c, v) => this.roomState.exitsOpen = v
				}
			)),
			n.component(new PanelSection(
				new Elem(n => n.elem('div', { className: 'pageeditexits--exitsheader' }, [
					n.component(new Txt(l10n.l('pageEditExits.hiddenExits', "Hidden exits"), { tagName: 'h3' })),
				])),
				new ModelComponent(
					this.model,
					new Collapser(),
					(m, c, change) => {
						if (change && !change.hasOwnProperty('hiddenExits')) return;

						c.setComponent(m.hiddenExits ? new Context(
							() => new ModelToCollection(m.hiddenExits, {
								compare: (a, b) => a.value.name.localeCompare(b.value.name) || a.key.localeCompare(b.key),
								eventBus: this.module.self.app.eventBus
							}),
							exits => exits.dispose(),
							exits => new Elem(n => n.elem('div', [
								n.component(new CollectionList(
									exits,
									m => new PageEditExitsExit(this.module, this.ctrl, this.room, m, { hidden: true })
								)),
								n.component(new CollectionComponent(
									exits,
									new Collapser(),
									(col, c, ev) => c.setComponent(col.length
										? null
										: new Txt(l10n.l('pageEditExits.noHiddenExits', "There are no hidden exits"), { className: 'common--nolistplaceholder' })
									)
								)),
								n.elem('div', { className: 'common--addpadding' }, [
									n.elem('button', { events: {
										click: () => this._onCreate(true)
									}, className: 'btn icon-left common--addbtn' }, [
										n.component(new FAIcon('plus')),
										n.component(new Txt(l10n.l('pageEditExits.createHiddenExit', "Create hidden exit")))
									])
								])
							]))
						) : null);
					}
				),
				{
					className: 'pageeditexits--exits common--sectionpadding',
					open: this.roomState.hiddenExitsOpen,
					onToggle: (c, v) => this.roomState.hiddenExitsOpen = v
				}
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

	_onCreate(hidden) {
		this.module.dialogCreateExit.open(this.ctrl, this.room, {
			hidden
		});
	}
}

export default PageEditExitsComponent;
