import { Elem, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

class HelpTopics {
	constructor(module, categories) {
		this.module = module;
		this.categories = categories.toArray();
	}

	render(el) {
		let list = [];
		for (let m of this.categories) {
			if (m.id != 'topics') {
				list.push('<tr><td><code class="common--nowrap">help ' + escapeHtml(m.cmd) + '</code></td><td>' + escapeHtml(l10n.t(m.shortDesc || m.title)) + '</td></tr>');
			}
		}
		this.elem = new Elem(n => n.elem('div', { className: 'help-topics' }, [
			n.elem('div', { className: 'charlog--pad' }, [
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(list.join(''), { tagName: 'tbody' })),
					]),
				]),
			]),
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

export default HelpTopics;
