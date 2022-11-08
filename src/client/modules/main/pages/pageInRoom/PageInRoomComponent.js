import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, CollectionList, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';

/**
 * PageInRoomComponent renders an in room character list page.
 */
class PageInRoomComponent {
	constructor(module, ctrl, room, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageinroom' }, [
			n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),
			n.component(new ModelComponent(
				this.room,
				new Fader(),
				(m, c, changed) => {
					if (changed && !changed.hasOwnProperty('chars')) return;
					c.setComponent(m.chars
						? new CollectionList(m.chars, m => this.module.pageRoom.newRoomChar(this.ctrl, m), { className: 'pageinroom--chars' })
						: new Txt(l10n.l('pageInRoom.isDark', "The room is too dark."), { className: 'common--nolistplaceholder' }),
					);
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

export default PageInRoomComponent;
