import { Elem, Html, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class PageWatchNoWatch {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pagewatch-nowatch' }, [
			n.component(new Txt(l10n.l('pageWatch.emptyWatchList', "Your watch list is empty."), { className: 'common--nolistplaceholder' })),
			n.component(new Txt(l10n.l('pageWatch.addWatchInfo', "Learn how to add a watch by typing:"), { className: 'common--nolistplaceholder' })),
			n.component(new Html(`<section class="charlog--pad"><div class="charlog--code"><code>help watch</code></div></section>`)),
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

export default PageWatchNoWatch;
