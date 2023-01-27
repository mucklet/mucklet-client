import { Elem, Html, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class PageTicketsNoMain {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pagetickets-nomain common--sectionpadding' }, [
			n.component(new Txt(l10n.l('pageTickets.emptyWatchList', "You must set a main character to assign tickets."), { className: 'common--nolistplaceholder common--font-small' })),
			n.component(new Txt(l10n.l('pageTickets.addWatchInfo', "Learn how by typing:"), { className: 'common--nolistplaceholder common--font-small' })),
			n.component(new Html(`<section class="charlog--pad"><div class="charlog--code"><code>help set main</code></div></section>`)),
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

export default PageTicketsNoMain;
