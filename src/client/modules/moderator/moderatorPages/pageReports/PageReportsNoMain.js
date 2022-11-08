import { Elem, Html, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class PageReportsNoMain {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pagereports-nomain common--sectionpadding' }, [
			n.component(new Txt(l10n.l('pageReports.emptyWatchList', "You must set a main character to assign reports."), { className: 'common--nolistplaceholder common--font-small' })),
			n.component(new Txt(l10n.l('pageReports.addWatchInfo', "Learn how by typing:"), { className: 'common--nolistplaceholder common--font-small' })),
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

export default PageReportsNoMain;
